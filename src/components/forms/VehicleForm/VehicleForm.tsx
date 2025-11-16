import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Typography,
  Space,
  Spin,
  message,
  Button,
  Tooltip,
  Upload,
  Image,
  Divider
} from 'antd';
import {
  CarOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  UploadOutlined,
  PictureOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Vehicle, FipeBrand, FipeModel, FipeYear } from '../../../features/vehicles';
import { FipeService } from '../../../features/vehicles/services/fipeService';
import { formatNumberWithDots, parseFormattedNumber } from '../../../shared/utils/numberFormatters';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface VehicleFormValues {
  plate?: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  photo?: File | null;
  [key: string]: unknown;
}

interface VehicleFormProps {
  visible: boolean;
  vehicle?: Vehicle | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  visible,
  vehicle,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const isEditing = !!vehicle;

  // Estados para FIPE
  const [fipeBrands, setFipeBrands] = useState<FipeBrand[]>([]);
  const [fipeModels, setFipeModels] = useState<FipeModel[]>([]);
  const [fipeYears, setFipeYears] = useState<FipeYear[]>([]);

  // Estados de loading
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  // Estados selecionados
  const [selectedBrandCode, setSelectedBrandCode] = useState<string>('');
  const [selectedModelCode, setSelectedModelCode] = useState<number | null>(null);
  const [fipeApiAvailable, setFipeApiAvailable] = useState(true);

  // Estados para foto
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    if (visible && !isEditing) {
      loadBrands();
    }
  }, [visible, isEditing]);

  useEffect(() => {
    if (!visible) {
      setFipeModels([]);
      setFipeYears([]);
      setSelectedBrandCode('');
      setSelectedModelCode(null);
      setPhotoFile(null);
      setPhotoPreview('');
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (vehicle) {
        form.setFieldsValue({
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          mileage: vehicle.mileage
        });

        // Se o veículo já tem foto, mostrar preview
        if (vehicle.photoUrl) {
          setPhotoPreview(vehicle.photoUrl);
        }
      } else {
        form.resetFields();
      }
    }
  }, [visible, vehicle, form]);


  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const isAvailable = await FipeService.checkApiAvailability();
      setFipeApiAvailable(isAvailable);

      if (isAvailable) {
        const brands = await FipeService.getBrandsWithCache();
        setFipeBrands(brands);
      }
    } catch (error: any) {
      setFipeApiAvailable(false);
      message.warning('Dados FIPE indisponíveis. Use entrada manual.');
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadModels = async (brandCode: string) => {
    setLoadingModels(true);
    setFipeModels([]);
    setFipeYears([]);
    form.setFieldsValue({ model: undefined, year: undefined });

    try {
      const models = await FipeService.getModelsByBrand(brandCode);
      setFipeModels(models);
    } catch (error: any) {
      message.error('Erro ao carregar modelos. Tente novamente.');
    } finally {
      setLoadingModels(false);
    }
  };

  const loadYears = async (brandCode: string, modelCode: number) => {
    setLoadingYears(true);
    setFipeYears([]);
    form.setFieldsValue({ year: undefined });

    try {
      const years = await FipeService.getYearsByBrandAndModel(brandCode, modelCode);
      setFipeYears(years);
    } catch (error: any) {
      message.error('Erro ao carregar anos. Tente novamente.');
    } finally {
      setLoadingYears(false);
    }
  };

  const handleBrandChange = (_: string, option: { key: string; children: string } | { key: string; children: string }[] | undefined) => {
    if (!option || Array.isArray(option)) return;
    
    const brandCode = option.key;
    const brandName = option.children;

    setSelectedBrandCode(brandCode);
    setSelectedModelCode(null);
    form.setFieldsValue({ brand: brandName });

    if (fipeApiAvailable && brandCode) {
      loadModels(brandCode);
    }
  };

  const handleModelChange = (_: string, option: { key: number; children: string } | { key: number; children: string }[] | undefined) => {
    if (!option || Array.isArray(option)) return;
    
    const modelCode = option.key;
    const modelName = option.children;

    setSelectedModelCode(modelCode);
    form.setFieldsValue({ model: modelName });

    if (fipeApiAvailable && selectedBrandCode && modelCode) {
      loadYears(selectedBrandCode, modelCode);
    }
  };

  const handleYearChange = (_: string, option: { children: string } | { children: string }[] | undefined) => {
    if (!option || Array.isArray(option)) return;
    
    const yearName = option.children;
    const year = FipeService.extractYear(yearName);
    form.setFieldsValue({ year });
  };

  const handlePhotoUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Apenas arquivos de imagem são permitidos!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('A imagem deve ser menor que 5MB!');
      return false;
    }

    setPhotoFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return false; // Não fazer upload automático
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    message.info('Foto removida');
  };

  const handleSubmit = () => {
    form.validateFields().then((values: Record<string, string | number>) => {
      const formattedValues: VehicleFormValues = {
        year: parseInt(String(values.year)),
        mileage: Number(values.mileage) || 0,
        brand: String(values.brand || '').trim(),
        model: String(values.model || '').trim(),
        color: String(values.color || '').trim(),
        photo: photoFile
      };

      if (!isEditing) {
        formattedValues.plate = values.plate ? String(values.plate).toUpperCase().replace('-', '') : '';
      }

      onSubmit(formattedValues);
    }).catch(() => {
      // Form validation failed - errors are already shown in the form
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setPhotoFile(null);
    setPhotoPreview('');
    onCancel();
  };

  const validatePlate = (_: unknown, value: string) => {
    if (value) {
      const cleanValue = value.toUpperCase().replace('-', '');
      const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
      const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

      if (!oldFormat.test(cleanValue) && !mercosulFormat.test(cleanValue)) {
        return Promise.reject(new Error('Formato inválido. Use ABC1234 ou ABC1D23'));
      }
    }
    return Promise.resolve();
  };

  const colors = [
    'Branco', 'Preto', 'Prata', 'Cinza', 'Azul', 'Vermelho', 'Verde', 'Amarelo',
    'Marrom', 'Bege', 'Roxo', 'Laranja', 'Rosa', 'Dourado'
  ];

  const fallbackYears = Array.from(
    { length: new Date().getFullYear() - 1980 + 1 },
    (_, i) => new Date().getFullYear() - i
  );

  const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div style={{ marginBottom: 'var(--space-xxl)' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-sm)', 
        marginBottom: 'var(--space-lg)' 
      }}>
        {icon}
        <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
          {title}
        </Title>
      </div>
      {children}
    </div>
  );

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      width={800}
      style={{ top: 20 }}
      footer={null}
      closeIcon={null}
      styles={{
        content: {
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--border-radius-lg)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
      className="vehicle-form-modal"
    >
      {/* Header com gradiente */}
      <div
        style={{
          background: `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`,
          padding: 'var(--space-xxl)',
          color: 'var(--text-light)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="vehicle-form-header"
      >
        {/* Decorações de fundo */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            opacity: 0.6
          }}
        />

        {/* Botão fechar */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleCancel}
          disabled={loading}
          style={{
            position: 'absolute',
            top: 'var(--space-lg)',
            right: 'var(--space-lg)',
            color: 'var(--text-light)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />

        <div style={{ textAlign: 'center' }}>
          {/* Ícone */}
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg) auto',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <CarOutlined style={{ fontSize: '36px', color: 'var(--text-light)' }} />
          </div>

          {/* Título */}
          <Title
            level={2}
            style={{
              color: 'var(--text-light)',
              margin: '0 0 var(--space-sm) 0',
              fontSize: '28px',
              fontWeight: 700
            }}
            className="vehicle-form-title"
          >
            {isEditing ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
          </Title>

          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }} className="vehicle-form-subtitle">
            {isEditing ? 'Atualize as informações do seu veículo' : 'Preencha os dados do seu veículo'}
          </Text>
        </div>
      </div>

      <div style={{ padding: 'var(--space-xxl)' }}>
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={true}
          disabled={loading}
          onValuesChange={() => {
            // Sem lógica de progresso - formulário funciona normalmente
          }}
        >
          {/* Seção 1: Dados do Veículo */}
          <FormSection title="Dados do Veículo" icon={<CarOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="plate"
                  label={
                    <Space>
                      <Text strong style={{ color: 'var(--text-dark)' }}>Placa</Text>
                      {isEditing && (
                        <Text style={{ fontSize: '12px', color: 'var(--gray-5)' }}>(não editável)</Text>
                      )}
                    </Space>
                  }
                  rules={[
                    { required: true, message: 'Placa é obrigatória' },
                    { validator: validatePlate }
                  ]}
                >
                  <Input
                    placeholder="ABC1234 ou ABC1D23"
                    maxLength={8}
                    size="large"
                    style={{
                      textTransform: 'uppercase',
                      borderRadius: 'var(--radius-md)'
                    }}
                    disabled={isEditing || loading}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="brand"
                  label={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Marca
                      {fipeApiAvailable && !isEditing && (
                        <Tooltip title="Dados da base FIPE - selecionando a marca, os modelos serão carregados automaticamente">
                          <InfoCircleOutlined style={{ color: 'var(--primary-color)', marginLeft: '8px' }} />
                        </Tooltip>
                      )}
                    </span>
                  }
                  rules={[{ required: true, message: 'Marca é obrigatória' }]}
                >
                  {!isEditing && fipeApiAvailable ? (
                    <Select
                      placeholder="Selecione a marca"
                      showSearch
                      loading={loadingBrands}
                      size="large"
                      style={{ borderRadius: 'var(--radius-md)' }}
                      filterOption={(input, option) => {
                        if (!option || !option.children) return false;
                        return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                      }}
                      onChange={handleBrandChange}
                      notFoundContent={loadingBrands ? <Spin size="small" /> : "Nenhuma marca encontrada"}
                    >
                      {fipeBrands.map(brand => (
                        <Option key={brand.codigo} value={brand.nome}>
                          {brand.nome}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      placeholder="Digite a marca"
                      disabled={isEditing}
                      size="large"
                      style={{ borderRadius: 'var(--radius-md)' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={24} lg={24}>
                <Form.Item
                  name="model"
                  label={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Modelo
                      {fipeModels.length > 0 && (
                        <Text style={{ fontSize: '12px', color: 'var(--success-color)', marginLeft: '8px' }}>
                          {fipeModels.length} modelos disponíveis
                        </Text>
                      )}
                    </span>
                  }
                  rules={[{ required: true, message: 'Modelo é obrigatório' }]}
                >
                  {!isEditing && fipeApiAvailable ? (
                    <Select
                      placeholder="Selecione o modelo"
                      showSearch
                      loading={loadingModels}
                      disabled={!selectedBrandCode || loadingModels}
                      size="large"
                      style={{ borderRadius: 'var(--radius-md)' }}
                      filterOption={(input, option) => {
                        if (!option || !option.children) return false;
                        return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                      }}
                      onChange={handleModelChange}
                      notFoundContent={
                        loadingModels ? <Spin size="small" /> :
                          !selectedBrandCode ? "Selecione uma marca primeiro" :
                            "Nenhum modelo encontrado"
                      }
                    >
                      {fipeModels.map(model => (
                        <Option key={model.codigo} value={model.nome}>
                          {model.nome}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      placeholder="Ex: Corolla, Civic, Golf"
                      disabled={isEditing}
                      size="large"
                      style={{ borderRadius: 'var(--radius-md)' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={8}>
                <Form.Item
                  name="year"
                  label={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Ano
                      {fipeYears.length > 0 && (
                        <CheckCircleOutlined style={{ color: 'var(--success-color)', fontSize: '12px', marginLeft: '8px' }} />
                      )}
                    </span>
                  }
                  rules={[{ required: true, message: 'Ano é obrigatório' }]}
                >
                  {!isEditing && fipeApiAvailable ? (
                    <Select
                      placeholder="Selecione o ano"
                      showSearch
                      loading={loadingYears}
                      disabled={!selectedModelCode || loadingYears}
                      size="large"
                      style={{ borderRadius: 'var(--radius-md)' }}
                      onChange={handleYearChange}
                      notFoundContent={
                        loadingYears ? <Spin size="small" /> :
                          !selectedModelCode ? "Selecione um modelo primeiro" :
                            "Nenhum ano encontrado"
                      }
                    >
                      {fipeYears.map(year => (
                        <Option key={year.codigo} value={year.nome}>
                          {year.nome}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <Select
                      placeholder="Selecione o ano"
                      showSearch
                      disabled={isEditing}
                      size="large"
                      style={{ borderRadius: 'var(--radius-md)' }}
                    >
                      {fallbackYears.map(year => (
                        <Option key={year} value={year}>
                          {year}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={8}>
                <Form.Item
                  name="color"
                  label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Cor</span>}
                  rules={[{ required: true, message: 'Cor é obrigatória' }]}
                >
                  <Select
                    placeholder="Selecione a cor"
                    showSearch
                    size="large"
                    style={{ borderRadius: 'var(--radius-md)' }}
                  >
                    {colors.map(color => (
                      <Option key={color} value={color}>
                        <Space>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor:
                                color === 'Branco' ? '#f0f0f0' :
                                  color === 'Preto' ? '#000000' :
                                    color === 'Prata' ? '#c0c0c0' :
                                      color === 'Cinza' ? '#808080' :
                                        color === 'Azul' ? '#1890ff' :
                                          color === 'Vermelho' ? '#f5222d' :
                                            color === 'Verde' ? '#52c41a' :
                                              color === 'Amarelo' ? '#fadb14' :
                                                color === 'Marrom' ? '#8b4513' :
                                                  color === 'Bege' ? '#f5f5dc' :
                                                    color === 'Roxo' ? '#722ed1' :
                                                      color === 'Laranja' ? '#fa8c16' :
                                                        color === 'Rosa' ? '#eb2f96' :
                                                          color === 'Dourado' ? '#d4af37' : '#8c8c8c',
                              border: '2px solid var(--gray-2)',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          />
                          {color}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={8}>
                <Form.Item
                  name="mileage"
                  label={<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Quilometragem</span>}
                  rules={[
                    { required: true, message: 'Quilometragem é obrigatória' },
                    { type: 'number', min: 0, message: 'Quilometragem deve ser positiva' }
                  ]}
                >
                  <InputNumber
                    placeholder="0 km"
                    size="large"
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-md)'
                    }}
                    formatter={value => formatNumberWithDots(value)}
                    parser={parseFormattedNumber}
                    min={0}
                    max={999999}
                  />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>

          <Divider style={{ margin: 'var(--space-xxl) 0', borderColor: 'var(--gray-2)' }} />

          {/* Seção 3: Foto do Veículo */}
          <FormSection title="Foto do Veículo" icon={<PictureOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />}>
            <Row gutter={16}>
              <Col span={24}>
                {photoPreview ? (
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={photoPreview}
                      alt="Foto do veículo"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid var(--gray-3)'
                      }}
                    />
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={removePhoto}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        border: 'none'
                      }}
                    />
                  </div>
                ) : (
                  <Dragger
                    accept="image/*"
                    beforeUpload={handlePhotoUpload}
                    showUploadList={false}
                    style={{
                      padding: '32px 16px',
                      background: 'var(--gray-1)',
                      border: '2px dashed var(--gray-4)',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: '48px', color: 'var(--primary-color)' }} />
                    </p>
                    <p className="ant-upload-text" style={{ color: 'var(--text-dark)', fontWeight: 500 }}>
                      Clique ou arraste uma foto do veículo
                    </p>
                    <p className="ant-upload-hint" style={{ color: 'var(--gray-6)' }}>
                      Formatos: JPG, PNG, GIF, WebP (máx. 5MB)
                    </p>
                  </Dragger>
                )}
              </Col>
            </Row>
          </FormSection>

          {/* Botões */}
          <div
            className="vehicle-form-buttons"
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 'var(--space-md)',
              justifyContent: 'flex-end',
              marginTop: 'var(--space-xxl)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--gray-2)'
            }}
          >
            <Button
              size="large"
              onClick={handleCancel}
              disabled={loading}
              style={{
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-sm) var(--space-lg)',
                height: '48px',
                fontWeight: 500,
                border: '1px solid var(--gray-3)',
                color: 'var(--text-secondary)',
                background: 'transparent',
                transition: 'all var(--transition-fast)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-4)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-3)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Cancelar
            </Button>

            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={loading}
              icon={isEditing ? undefined : <CarOutlined />}
              style={{
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-sm) var(--space-lg)',
                height: '48px',
                fontWeight: 500,
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                border: 'none',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                transition: 'all var(--transition-fast)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #7C3AED, #6D28D9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
                e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
              }}
            >
              {isEditing ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
            </Button>
          </div>
          <style>{`
            @media (max-width: 768px) {
              .vehicle-form-modal .ant-modal {
                width: 90% !important;
                max-width: 800px !important;
              }
              .vehicle-form-header {
                padding: clamp(16px, 4vw, 32px) !important;
              }
              .vehicle-form-title {
                font-size: clamp(20px, 4vw, 28px) !important;
                word-break: break-word !important;
                padding: 0 8px !important;
              }
              .vehicle-form-subtitle {
                font-size: clamp(14px, 2.5vw, 16px) !important;
                word-break: break-word !important;
                padding: 0 8px !important;
              }
              .vehicle-form-buttons {
                flex-direction: column !important;
                padding: var(--space-lg) !important;
                margin: 0 calc(-1 * var(--space-lg)) calc(-1 * var(--space-lg)) !important;
              }
              .vehicle-form-buttons .ant-btn {
                width: 100% !important;
              }
            }
          `}</style>
        </Form>
      </div>
    </Modal>
  );
};

export default VehicleForm;