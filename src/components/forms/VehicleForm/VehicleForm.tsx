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
  Alert,
  Spin,
  message,
  Button,
  Tooltip,
  Progress,
  Upload,
  Image
} from 'antd';
import {
  CarOutlined,
  NumberOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DatabaseOutlined,
  UploadOutlined,
  PictureOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Vehicle, FipeBrand, FipeModel, FipeYear } from '../../../features/vehicles';
import { FipeService } from '../../../features/vehicles/services/fipeService';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface VehicleFormProps {
  visible: boolean;
  vehicle?: Vehicle | null;
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
  const [formProgress, setFormProgress] = useState(0);

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
      setFormProgress(0);
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
          renavam: vehicle.renavam,
          mileage: vehicle.mileage
        });
        setFormProgress(100);

        // Se o veículo já tem foto, mostrar preview
        if (vehicle.photoUrl) {
          setPhotoPreview(vehicle.photoUrl);
        }
      } else {
        form.resetFields();
        setFormProgress(0);
      }
    }
  }, [visible, vehicle, form]);

  // Calcular progresso do formulário
  useEffect(() => {
    if (!isEditing) {
      const fields = form.getFieldsValue();
      const filledFields = Object.values(fields).filter(value => value !== undefined && value !== '').length;
      const photoBonus = photoFile ? 1 : 0;
      const totalFields = 8; // Total de campos obrigatórios + foto (opcional)
      const progress = Math.round(((filledFields + photoBonus) / totalFields) * 100);
      setFormProgress(progress);
    }
  }, [form, isEditing, photoFile]);

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

  const handleBrandChange = (_: string, option: any) => {
    const brandCode = option.key;
    const brandName = option.children;

    setSelectedBrandCode(brandCode);
    setSelectedModelCode(null);
    form.setFieldsValue({ brand: brandName });

    if (fipeApiAvailable && brandCode) {
      loadModels(brandCode);
    }
  };

  const handleModelChange = (_: string, option: any) => {
    const modelCode = option.key;
    const modelName = option.children;

    setSelectedModelCode(modelCode);
    form.setFieldsValue({ model: modelName });

    if (fipeApiAvailable && selectedBrandCode && modelCode) {
      loadYears(selectedBrandCode, modelCode);
    }
  };

  const handleYearChange = (_: string, option: any) => {
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
    form.validateFields().then(values => {
      let formattedValues = {
        ...values,
        year: parseInt(values.year),
        mileage: values.mileage || 0,
        brand: values.brand?.trim() || '',
        model: values.model?.trim() || '',
        color: values.color?.trim() || '',
        photo: photoFile // Incluir arquivo de foto
      };

      if (isEditing) {
        const { plate, renavam, ...editableFields } = formattedValues;
        formattedValues = editableFields;
      } else {
        formattedValues.plate = values.plate ? values.plate.toUpperCase().replace('-', '') : '';
        formattedValues.renavam = values.renavam ? values.renavam.replace(/\D/g, '') : '';
      }

      onSubmit(formattedValues);
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setPhotoFile(null);
    setPhotoPreview('');
    onCancel();
  };

  const validatePlate = (_: any, value: string) => {
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

  const validateRenavam = (_: any, value: string) => {
    if (value && value.length !== 11) {
      return Promise.reject(new Error('RENAVAM deve ter 11 dígitos'));
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
    <div
      style={{
        background: 'var(--card-background)',
        border: '1px solid var(--gray-2)',
        borderRadius: 'var(--border-radius-md)',
        padding: 'var(--space-lg)',
        marginBottom: 'var(--space-lg)'
      }}
    >
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Space>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--primary-color)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-light)'
            }}
          >
            {icon}
          </div>
          <Text style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)' }}>
            {title}
          </Text>
        </Space>
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
          borderRadius: 'var(--border-radius-lg)'
        }
      }}
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
          >
            {isEditing ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
          </Title>

          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
            {isEditing ? 'Atualize as informações do seu veículo' : 'Preencha os dados do seu veículo'}
          </Text>

          {/* Barra de progresso */}
          {!isEditing && (
            <div style={{ marginTop: 'var(--space-lg)', maxWidth: '300px', margin: 'var(--space-lg) auto 0' }}>
              <Progress
                percent={formProgress}
                strokeColor={{
                  '0%': 'var(--accent-color)',
                  '100%': 'var(--success-color)'
                }}
                trailColor="rgba(255, 255, 255, 0.2)"
                showInfo={false}
                size="small"
              />
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', display: 'block', marginTop: 'var(--space-xs)' }}>
                {formProgress}% concluído
              </Text>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 'var(--space-xxl)' }}>
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={loading}
          onValuesChange={() => {
            if (!isEditing) {
              setTimeout(() => {
                const fields = form.getFieldsValue();
                const filledFields = Object.values(fields).filter(value => value !== undefined && value !== '').length;
                const photoBonus = photoFile ? 1 : 0;
                const progress = Math.round(((filledFields + photoBonus) / 8) * 100);
                setFormProgress(progress);
              }, 100);
            }
          }}
        >
          {/* Seção 1: Identificação */}
          <FormSection title="Identificação do Veículo" icon={<NumberOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
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
                    style={{
                      textTransform: 'uppercase',
                      borderColor: 'var(--gray-3)',
                      borderRadius: 'var(--border-radius-sm)',
                      height: '48px'
                    }}
                    disabled={isEditing || loading}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="renavam"
                  label={
                    <Space>
                      <Text strong style={{ color: 'var(--text-dark)' }}>RENAVAM</Text>
                      {isEditing && (
                        <Text style={{ fontSize: '12px', color: 'var(--gray-5)' }}>(não editável)</Text>
                      )}
                    </Space>
                  }
                  rules={[
                    { required: true, message: 'RENAVAM é obrigatório' },
                    { validator: validateRenavam }
                  ]}
                >
                  <Input
                    placeholder="12345678901"
                    maxLength={11}
                    style={{
                      borderColor: 'var(--gray-3)',
                      borderRadius: 'var(--border-radius-sm)',
                      height: '48px'
                    }}
                    disabled={isEditing || loading}
                  />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>

          {/* Seção 2: Dados do Veículo */}
          <FormSection title="Dados do Veículo" icon={<CarOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="brand"
                  label={
                    <Space>
                      <Text strong style={{ color: 'var(--text-dark)' }}>Marca</Text>
                      {fipeApiAvailable && !isEditing && (
                        <Tooltip title="Dados da base FIPE - selecionando a marca, os modelos serão carregados automaticamente">
                          <InfoCircleOutlined style={{ color: 'var(--primary-color)' }} />
                        </Tooltip>
                      )}
                    </Space>
                  }
                  rules={[{ required: true, message: 'Marca é obrigatória' }]}
                >
                  {!isEditing && fipeApiAvailable ? (
                    <Select
                      placeholder="Selecione a marca"
                      showSearch
                      loading={loadingBrands}
                      style={{ height: '48px' }}
                      filterOption={(input, option) =>
                        option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
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
                      style={{
                        borderColor: 'var(--gray-3)',
                        borderRadius: 'var(--border-radius-sm)',
                        height: '48px'
                      }}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="model"
                  label={
                    <Space>
                      <Text strong style={{ color: 'var(--text-dark)' }}>Modelo</Text>
                      {fipeModels.length > 0 && (
                        <Text style={{ fontSize: '12px', color: 'var(--success-color)' }}>
                          {fipeModels.length} modelos disponíveis
                        </Text>
                      )}
                    </Space>
                  }
                  rules={[{ required: true, message: 'Modelo é obrigatório' }]}
                >
                  {!isEditing && fipeModels.length > 0 ? (
                    <Select
                      placeholder="Selecione o modelo"
                      showSearch
                      loading={loadingModels}
                      disabled={!selectedBrandCode}
                      style={{ height: '48px' }}
                      filterOption={(input, option) =>
                        option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
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
                      style={{
                        borderColor: 'var(--gray-3)',
                        borderRadius: 'var(--border-radius-sm)',
                        height: '48px'
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="year"
                  label={
                    <Space>
                      <Text strong style={{ color: 'var(--text-dark)' }}>Ano</Text>
                      {fipeYears.length > 0 && (
                        <CheckCircleOutlined style={{ color: 'var(--success-color)', fontSize: '12px' }} />
                      )}
                    </Space>
                  }
                  rules={[{ required: true, message: 'Ano é obrigatório' }]}
                >
                  {!isEditing && fipeYears.length > 0 ? (
                    <Select
                      placeholder="Selecione o ano"
                      showSearch
                      loading={loadingYears}
                      disabled={!selectedModelCode}
                      style={{ height: '48px' }}
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
                      style={{ height: '48px' }}
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

              <Col span={8}>
                <Form.Item
                  name="color"
                  label={<Text strong style={{ color: 'var(--text-dark)' }}>Cor</Text>}
                  rules={[{ required: true, message: 'Cor é obrigatória' }]}
                >
                  <Select
                    placeholder="Selecione a cor"
                    showSearch
                    style={{ height: '48px' }}
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

              <Col span={8}>
                <Form.Item
                  name="mileage"
                  label={<Text strong style={{ color: 'var(--text-dark)' }}>Quilometragem</Text>}
                  rules={[
                    { required: true, message: 'Quilometragem é obrigatória' },
                    { type: 'number', min: 0, message: 'Quilometragem deve ser positiva' }
                  ]}
                >
                  <InputNumber
                    placeholder="0 km"
                    style={{
                      width: '100%',
                      height: '48px',
                      borderColor: 'var(--gray-3)',
                      borderRadius: 'var(--border-radius-sm)'
                    }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value: any) => Number(value.replace(/\./g, ''))}
                    min={0}
                    max={999999}
                  />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>

          {/* Seção 3: Foto do Veículo */}
          <FormSection title="Foto do Veículo" icon={<PictureOutlined />}>
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
            style={{
              display: 'flex',
              gap: 'var(--space-md)',
              justifyContent: 'flex-end',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--gray-2)',
              background: 'var(--card-background)',
              margin: '0 calc(-1 * var(--space-xxl)) calc(-1 * var(--space-xxl))',
              padding: 'var(--space-lg) var(--space-xxl)'
            }}
          >
            <Button
              size="large"
              onClick={handleCancel}
              disabled={loading}
              style={{
                height: '48px',
                paddingLeft: 'var(--space-xxl)',
                paddingRight: 'var(--space-xxl)',
                borderColor: 'var(--gray-3)',
                color: 'var(--gray-6)',
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: 600
              }}
            >
              Cancelar
            </Button>

            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={loading}
              style={{
                height: '48px',
                paddingLeft: 'var(--space-xxl)',
                paddingRight: 'var(--space-xxl)',
                background: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {isEditing ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default VehicleForm;