import React, { useState, useEffect } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Modal,
  Typography,
  notification,
  Upload,
  Divider,
  Checkbox,
  Tooltip
} from "antd";
import {
  ToolOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  CloseOutlined,
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  CarOutlined,
  FileTextOutlined,
  SettingOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import {
  VehicleEvent,
  Vehicle
} from "../types/vehicle.types";
import { EVENT_TYPES } from "../utils/constants";
import { VehicleServiceService, CreateVehicleServiceData } from "../services/vehicleServiceService";
import { VehicleService } from "../services/vehicleService";

const SERVICE_TYPE_CATEGORIES = {
  maintenance: [
    { value: "Troca de óleo", label: "Troca de óleo" },
    { value: "Revisão", label: "Revisão" },
    { value: "Freios", label: "Freios" },
    { value: "Pneu", label: "Pneu" },
    { value: "Suspensão", label: "Suspensão" },
    { value: "Motor", label: "Motor" },
    { value: "Transmissão", label: "Transmissão" },
    { value: "Ar condicionado", label: "Ar condicionado" },
    { value: "Sistema elétrico", label: "Sistema elétrico" },
    { value: "Escape", label: "Escape" },
    { value: "Bateria", label: "Bateria" },
    { value: "Filtros", label: "Filtros" },
    { value: "Correias", label: "Correias" },
    { value: "Amortecedores", label: "Amortecedores" },
    { value: "Outros", label: "Outros" },
  ],
  expense: [
    { value: "Licenciamento", label: "Licenciamento" },
    { value: "IPVA", label: "IPVA" },
    { value: "Seguro", label: "Seguro" },
    { value: "Multas", label: "Multas" },
    { value: "Estacionamento", label: "Estacionamento" },
    { value: "Pedágio", label: "Pedágio" },
    { value: "Lavagem", label: "Lavagem" },
    { value: "Documentação", label: "Documentação" },
    { value: "Taxa de emplacamento", label: "Taxa de emplacamento" },
    { value: "Outros", label: "Outros" },
  ],
  fuel: [
    { value: "Gasolina", label: "Gasolina" },
    { value: "Etanol", label: "Etanol" },
    { value: "Diesel", label: "Diesel" },
    { value: "GNV", label: "GNV" },
    { value: "Aditivos", label: "Aditivos" },
    { value: "Outros", label: "Outros" },
  ],
};

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (event: VehicleEvent) => void;
  vehicleId?: string;
  vehicles?: Vehicle[];
  loading?: boolean;
  currentMileage?: number;
  notificationApi?: any;
}

const ServiceModal: React.FC<ServiceModalProps> = React.memo(({
  open,
  onClose,
  onAdd,
  vehicleId,
  vehicles = [],
  currentMileage = 0,
  notificationApi
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [serviceData, setServiceData] = useState<CreateVehicleServiceData | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [updateVehicleMileage, setUpdateVehicleMileage] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setFileList([]);
      setUploadedFiles([]);
      setShowConfirmModal(false);
      setServiceData(null);
      setSelectedVehicle(null);
      setUpdateVehicleMileage(true);
      setAvailableCategories([]);
      
      if (vehicleId) {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
          setSelectedVehicle(vehicle);
          form.setFieldsValue({ 
            mileage: vehicle.mileage,
            selectedVehicleId: vehicle.id 
          });
        }
      } else if (vehicles.length === 1) {
        const vehicle = vehicles[0];
        setSelectedVehicle(vehicle);
        form.setFieldsValue({ 
          mileage: vehicle.mileage,
          selectedVehicleId: vehicle.id 
        });
      } else if (currentMileage > 0) {
        form.setFieldsValue({ mileage: currentMileage });
      }
    }
  }, [open, currentMileage, form, vehicleId, vehicles]);

  const handleServiceTypeChange = (serviceType: string) => {
    const categories = SERVICE_TYPE_CATEGORIES[serviceType as keyof typeof SERVICE_TYPE_CATEGORIES] || [];
    setAvailableCategories(categories);
    form.setFieldsValue({ category: undefined });
    form.setFields([{
      name: 'category',
      value: undefined,
      errors: [],
      touched: false,
      validating: false
    }]);
  };

  const validateDate = (_: any, value: any) => {
    if (!value) {
      return Promise.reject(new Error('Selecione a data do serviço'));
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (value.toDate() > today) {
      return Promise.reject(new Error('Não é possível cadastrar serviços com data futura'));
    }
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    if (value.toDate() < twoYearsAgo) {
      return Promise.reject(new Error('Data muito antiga. Serviços devem ser de no máximo 2 anos atrás'));
    }
    return Promise.resolve();
  };

  const validateMileage = (_: any, value: number) => {
    if (!value && value !== 0) {
      return Promise.reject(new Error('Informe a quilometragem'));
    }
    if (value < 0) {
      return Promise.reject(new Error('Quilometragem não pode ser negativa'));
    }
    const currentVehicle = selectedVehicle || vehicles.find(v => v.id === vehicleId);
    if (currentVehicle && value < currentVehicle.mileage) {
      return Promise.reject(new Error(`Quilometragem deve ser maior que a atual do veículo (${currentVehicle.mileage.toLocaleString()} km)`));
    }
    const currentMileage = currentVehicle ? currentVehicle.mileage : 0;
    let maxReasonableMileage;
    let reasonMessage;
    
    if (currentMileage < 10000) {
      maxReasonableMileage = Math.max(currentMileage + 50000, 50000);
      reasonMessage = "50.000 km (veículo novo)";
    } else if (currentMileage < 100000) {
      maxReasonableMileage = currentMileage + 50000;
      reasonMessage = "50.000 km a mais";
    } else if (currentMileage < 200000) {
      maxReasonableMileage = currentMileage + 30000;
      reasonMessage = "30.000 km a mais";
    } else {
      maxReasonableMileage = currentMileage + 20000;
      reasonMessage = "20.000 km a mais";
    }
    
    if (value > maxReasonableMileage) {
      return Promise.reject(new Error(`Quilometragem muito alta. Máximo esperado: ${maxReasonableMileage.toLocaleString()} km (atual: ${currentMileage.toLocaleString()} km + ${reasonMessage})`));
    }
    return Promise.resolve();
  };

  const validateCost = (_: any, value: number) => {
    if (value < 0) {
      return Promise.reject(new Error('Custo não pode ser negativo'));
    }
    if (value < 10) {
      return Promise.reject(new Error('Custo muito baixo. Mínimo: R$ 10,00'));
    }
    if (value > 50000) {
      return Promise.reject(new Error('Custo muito alto. Máximo: R$ 50.000,00'));
    }
    return Promise.resolve();
  };

  const validateDescription = (_: any, value: string) => {
    if (!value || value.trim().length === 0) {
      return Promise.reject(new Error('Descreva o serviço realizado'));
    }
    if (value.trim().length < 10) {
      return Promise.reject(new Error('Descrição muito curta. Mínimo 10 caracteres'));
    }
    if (value.trim().length > 500) {
      return Promise.reject(new Error('Descrição muito longa. Máximo 500 caracteres'));
    }
    return Promise.resolve();
  };

  const validateLocation = (_: any, value: string) => {
    if (!value || value.trim().length === 0) {
      return Promise.reject(new Error('Informe o local'));
    }
    if (value.trim().length < 3) {
      return Promise.reject(new Error('Local muito curto. Mínimo 3 caracteres'));
    }
    if (value.trim().length > 100) {
      return Promise.reject(new Error('Local muito longo. Máximo 100 caracteres'));
    }
    return Promise.resolve();
  };

  const validateCategory = (_: any, value: string) => {
    if (!value || value.trim().length === 0) {
      return Promise.reject(new Error('Selecione uma categoria'));
    }
    const serviceType = form.getFieldValue('type');
    if (!serviceType) {
      return Promise.reject(new Error('Selecione primeiro o tipo de serviço'));
    }
    const validCategories = SERVICE_TYPE_CATEGORIES[serviceType as keyof typeof SERVICE_TYPE_CATEGORIES] || [];
    const isValidCategory = validCategories.some(cat => cat.value === value);
    if (!isValidCategory) {
      return Promise.reject(new Error('Categoria não é válida para o tipo de serviço selecionado'));
    }
    return Promise.resolve();
  };

  const handleCustomRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      setUploadedFiles(prev => [...prev, file as File]);
      onSuccess("ok");
    } catch (error) {
      onError(error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (vehicles.length === 0) { return; }
      const values = await form.validateFields();
      
      const finalVehicleId = vehicleId || values.selectedVehicleId;
      if (!finalVehicleId) { return; }

      const preparedServiceData: CreateVehicleServiceData = {
        vehicleId: finalVehicleId,
        type: values.type,
        category: values.category,
        description: values.description,
        serviceDate: values.date.toDate(),
        mileage: values.mileage,
        cost: values.cost,
        location: values.location,
        technician: '',
        warranty: false,
        nextServiceDate: undefined,
        notes: ''
      };

      setServiceData(preparedServiceData);
      setShowConfirmModal(true);

    } catch (error) {
    }
  };

  const getTypeLabel = (typeValue: string) => {
    const typeOption = EVENT_TYPES.find(option => option.value === typeValue);
    return typeOption ? typeOption.label : typeValue;
  };

  const handleConfirmBlockchain = async () => {
    if (!serviceData) return;

    try {
      setSubmitting(true);
      setShowConfirmModal(false);

      let attachmentUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        try {
          attachmentUrls = await VehicleServiceService.uploadAttachments(uploadedFiles);
        } catch (_uploadError) {
        }
      }

      const serviceDataWithAttachments = {
        ...serviceData,
        ...(attachmentUrls.length > 0 && { attachments: attachmentUrls }),
      };

      const savedService = await VehicleServiceService.createService(serviceDataWithAttachments);
      
      (notificationApi || notification).success({
        message: 'Serviço cadastrado',
        description: 'Seu serviço foi cadastrado com sucesso.',
        placement: 'bottomRight',
        duration: 4
      });

      if (updateVehicleMileage && serviceData.vehicleId) {
        try {
          await VehicleService.updateVehicle(serviceData.vehicleId, {
            mileage: serviceData.mileage
          });
        } catch (_mileageError) {
        }
      }

      try {
        await VehicleServiceService.updateBlockchainStatus(
          savedService.id,
          undefined,
          'user'
        );
      } catch (_blockchainError) {
        (notificationApi || notification).warning({
          message: 'Processando na blockchain',
          description: 'A confirmação pode levar alguns segundos. Se falhar, você poderá reenviar.',
          placement: 'bottomRight',
          duration: 5
        });
      }

      onAdd(savedService);
      onClose();

    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        (notificationApi || notification).error({
          message: 'Erro ao salvar serviço',
          description: 'Timeout na requisição. Verifique a lista de serviços.',
          placement: 'bottomRight'
        });
      } else if (error.response?.status === 400) {
        (notificationApi || notification).error({
          message: 'Erro ao salvar serviço',
          description: error.response?.data?.message || 'Dados inválidos.',
          placement: 'bottomRight'
        });
      } else if (error.response?.status === 401) {
        (notificationApi || notification).error({
          message: 'Erro ao salvar serviço',
          description: 'Sessão expirada. Faça login novamente.',
          placement: 'bottomRight'
        });
      } else if (error.response?.status >= 500) {
        (notificationApi || notification).error({
          message: 'Erro ao salvar serviço',
          description: 'Erro do servidor. Tente novamente.',
          placement: 'bottomRight'
        });
      } else {
        (notificationApi || notification).error({
          message: 'Erro ao salvar serviço',
          description: error.message || 'Tente novamente.',
          placement: 'bottomRight'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={800}
      style={{ top: 20 }}
      footer={null}
      closeIcon={null}
      destroyOnClose
      styles={{
        content: {
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--border-radius-lg)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
      className="service-modal"
    >
      <div
        style={{
          background: `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`,
          padding: 'var(--space-xxl)',
          color: 'var(--text-light)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="service-modal-header"
      >
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
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            opacity: 0.8
          }}
        />

        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          disabled={submitting}
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
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <ToolOutlined style={{ fontSize: '32px', color: 'var(--text-light)' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: 'var(--text-light)', fontSize: '28px' }} className="service-modal-title">
            Adicionar Serviço
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }} className="service-modal-subtitle">
            Registre um novo serviço
          </Text>
        </div>
      </div>

      <div 
        style={{ 
          padding: 'var(--space-xxl)',
          animation: 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="content-fade-in"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ marginBottom: 'var(--space-xxl)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)', 
              marginBottom: 'var(--space-lg)' 
            }}>
              <CarOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
              <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
                Informações do Veículo
              </Title>
            </div>
            
            {!vehicleId && vehicles.length > 0 && (
              <Form.Item
                name="selectedVehicleId"
                label={
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    Veículo
                  </span>
                }
                rules={[{ required: true, message: 'Selecione um veículo' }]}
              >
                <Select
                  placeholder="Selecione o veículo"
                  showSearch
                  size="large"
                  style={{
                    borderRadius: 'var(--radius-md)'
                  }}
                  filterOption={(input, option) =>
                    (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={vehicles.map(v => ({
                    value: v.id,
                    label: `${v.brand} ${v.model} - ${v.plate}`
                  }))}
                  onChange={(value) => {
                    const vehicle = vehicles.find(v => v.id === value);
                    if (vehicle) {
                      setSelectedVehicle(vehicle);
                      form.setFieldsValue({ mileage: vehicle.mileage });
                    }
                  }}
                />
              </Form.Item>
            )}
          </div>

          <Divider style={{ margin: 'var(--space-xxl) 0', borderColor: 'var(--gray-2)' }} />

          <div style={{ marginBottom: 'var(--space-xxl)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)', 
              marginBottom: 'var(--space-lg)' 
            }}>
              <SettingOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
              <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
                Detalhes do Serviço
              </Title>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="type"
                  label={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Tipo de Serviço
                    </span>
                  }
                  rules={[{ required: true, message: 'Selecione o tipo' }]}
                >
                  <Select
                    placeholder="Selecione o tipo"
                    size="large"
                    style={{ borderRadius: 'var(--radius-md)' }}
                    options={EVENT_TYPES as any}
                    onChange={handleServiceTypeChange}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="category"
                  label={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Categoria
                    </span>
                  }
                  validateTrigger="onSubmit"
                  rules={[
                    { required: true, message: 'Selecione a categoria' },
                    { 
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve();
                        }
                        return validateCategory(_, value);
                      }
                    }
                  ]}
                >
                  <Tooltip 
                    title="Selecione primeiro o tipo de serviço" 
                    placement="top"
                    open={!form.getFieldValue('type') ? undefined : false}
                  >
                    <Select
                      placeholder="Selecione a categoria"
                      size="large"
                      style={{ borderRadius: 'var(--radius-md)' }}
                      options={availableCategories as any}
                      disabled={!form.getFieldValue('type')}
                      value={form.getFieldValue('category')}
                      onChange={(value) => {
                        form.setFieldsValue({ category: value });
                      }}
                    />
                  </Tooltip>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label={
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  Descrição
                </span>
              }
              rules={[
                { required: true, message: '' },
                { validator: validateDescription }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Descreva o serviço realizado..."
                maxLength={500}
                showCount
                style={{
                  borderRadius: 'var(--radius-md)',
                  resize: 'vertical'
                }}
              />
            </Form.Item>
          </div>

          <Divider style={{ margin: 'var(--space-xxl) 0', borderColor: 'var(--gray-2)' }} />

          <div style={{ marginBottom: 'var(--space-xxl)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)', 
              marginBottom: 'var(--space-lg)' 
            }}>
              <FileTextOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
              <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
                Anexos
              </Title>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                (opcional)
              </Text>
            </div>

            <Form.Item>
              <Dragger
                fileList={fileList}
                onChange={({ fileList: newFileList }) => {
                  setFileList(newFileList);
                  if (newFileList.length < fileList.length) {
                    const removedCount = fileList.length - newFileList.length;
                    setUploadedFiles(prev => prev.slice(0, -removedCount));
                  }
                }}
                customRequest={handleCustomRequest}
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                maxCount={10}
                listType="picture"
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--gray-3)',
                  background: 'var(--surface-color)'
                }}
              >
                <div style={{ padding: 'var(--space-xl) 0' }}>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined style={{ color: 'var(--primary-color)', fontSize: '48px' }} />
                  </p>
                  <p className="ant-upload-text" style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '16px',
                    fontWeight: 500,
                    margin: 'var(--space-sm) 0'
                  }}>
                    Clique ou arraste arquivos para esta área
                  </p>
                  <p className="ant-upload-hint" style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '14px',
                    margin: 0
                  }}>
                    Suporta JPG, PNG, GIF, PDF, DOC. Máximo 10 arquivos.
                  </p>
                </div>
              </Dragger>
            </Form.Item>
          </div>

          <Divider style={{ margin: 'var(--space-xxl) 0', borderColor: 'var(--gray-2)' }} />

          <div style={{ marginBottom: 'var(--space-xxl)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)', 
              marginBottom: 'var(--space-lg)' 
            }}>
              <CalendarOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
              <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
                Data e Quilometragem
              </Title>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="date"
                  label={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Data do Serviço
                    </span>
                  }
                  rules={[
                    { required: true, message: '' },
                    { validator: validateDate }
                  ]}
                >
                  <DatePicker 
                    size="large"
                    style={{ 
                      width: '100%',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="mileage"
                  label={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Quilometragem
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Informe a quilometragem' },
                    { validator: validateMileage }
                  ]}
                >
                  <InputNumber
                    style={{ 
                      width: '100%',
                      borderRadius: 'var(--radius-md)'
                    }}
                    size="large"
                    placeholder="0"
                    min={0}
                    addonAfter="km"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ 
              marginTop: 'var(--space-md)',
              padding: 'var(--space-md)',
              background: 'var(--gray-1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-2)'
            }}>
              <Checkbox
                checked={updateVehicleMileage}
                onChange={(e) => setUpdateVehicleMileage(e.target.checked)}
                style={{ color: 'var(--text-primary)' }}
              >
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  Atualizar quilometragem do veículo automaticamente
                </span>
              </Checkbox>
              <div style={{ 
                marginTop: 'var(--space-xs)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginLeft: '24px'
              }}>
                {updateVehicleMileage ? (
                  <span style={{ color: 'var(--success-color)' }}>
                    ✓ A quilometragem do veículo será atualizada automaticamente após salvar o serviço
                  </span>
                ) : (
                  <span style={{ color: 'var(--warning-color)' }}>
                    ⚠ A quilometragem do veículo não será atualizada automaticamente
                  </span>
                )}
              </div>
            </div>
          </div>

          <Divider style={{ margin: 'var(--space-xxl) 0', borderColor: 'var(--gray-2)' }} />

          <div style={{ marginBottom: 'var(--space-xxl)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-sm)', 
              marginBottom: 'var(--space-lg)' 
            }}>
              <DollarOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
              <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
                Custo e Local
              </Title>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="cost"
                  label={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Custo
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Informe o custo do serviço' },
                    { validator: validateCost }
                  ]}
                >
                  <InputNumber
                    style={{ 
                      width: '100%',
                      borderRadius: 'var(--radius-md)'
                    }}
                    size="large"
                    placeholder="0,00"
                    min={0}
                    precision={2}
                    formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value: any) => Number(value.replace(/R\$\s?|\./g, ''))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="location"
                  label={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Local
                    </span>
                  }
                  required={true}
                  rules={[
                    { validator: validateLocation }
                  ]}
                >
                  <Input 
                    placeholder="Oficina, concessionária, etc." 
                    size="large"
                    maxLength={100}
                    style={{ borderRadius: 'var(--radius-md)' }}
                    prefix={<EnvironmentOutlined style={{ color: 'var(--text-secondary)' }} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div 
            className="service-modal-buttons"
            style={{ 
              display: 'flex', 
              flexDirection: 'row',
              justifyContent: 'flex-end', 
              gap: 'var(--space-md)', 
              marginTop: 'var(--space-xxl)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--gray-2)'
            }}
          >
            <Button 
              onClick={onClose}
              size="large"
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
              htmlType="submit"
              loading={submitting}
              icon={<ToolOutlined />}
              size="large"
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
              Salvar Serviço
            </Button>
          </div>
        </Form>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .service-modal .ant-modal {
            width: 90% !important;
            max-width: 800px !important;
          }
          .service-modal-header {
            padding: clamp(16px, 4vw, 32px) !important;
          }
          .service-modal-title {
            font-size: clamp(20px, 4vw, 28px) !important;
            word-break: break-word !important;
            padding: 0 8px !important;
          }
          .service-modal-subtitle {
            font-size: clamp(14px, 2.5vw, 16px) !important;
            word-break: break-word !important;
            padding: 0 8px !important;
          }
          .service-modal-buttons {
            flex-direction: column !important;
          }
          .service-modal-buttons .ant-btn {
            width: 100% !important;
          }
        }
      `}</style>

      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '8px 0'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px'
            }}>
              <ExclamationCircleOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#FFFFFF' }}>
                Confirmação Blockchain
              </Title>
              <Text style={{ color: '#E5E7EB', fontSize: '14px' }}>
                Revisão final antes do envio
              </Text>
            </div>
          </div>
        }
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onOk={handleConfirmBlockchain}
        confirmLoading={submitting}
        okText="Confirmar e Enviar"
        cancelText="Cancelar"
        width="90%"
        style={{ top: 50, maxWidth: 600 }}
        centered
        styles={{
          body: { padding: 'clamp(16px, 3vw, 24px)' }
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#f59e0b',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              !
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#92400e',
                marginBottom: '4px'
              }}>
                Ação Irreversível
              </div>
              <div style={{
                fontSize: '13px',
                color: '#92400e',
                lineHeight: '1.4'
              }}>
                Após confirmação, este serviço será enviado para blockchain e se tornará imutável. Certifique-se de que todos os dados estão corretos.
              </div>
            </div>
          </div>
        </div>
        
        {serviceData && (
          <div style={{ 
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #4B5563',
            color: '#F9FAFB'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '16px' 
            }}>
              <ToolOutlined style={{ color: '#8B5CF6', fontSize: '18px' }} />
              <Title level={5} style={{ margin: 0, color: '#F9FAFB' }}>
                Resumo do Serviço
              </Title>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <Text style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 500 }}>
                  TIPO DE SERVIÇO
                </Text>
                <div style={{ color: '#F9FAFB', fontSize: '14px', marginTop: '4px' }}>
                  {getTypeLabel(serviceData.type)}
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 500 }}>
                  CATEGORIA
                </Text>
                <div style={{ color: '#F9FAFB', fontSize: '14px', marginTop: '4px' }}>
                  {serviceData.category}
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 500 }}>
                  DATA
                </Text>
                <div style={{ color: '#F9FAFB', fontSize: '14px', marginTop: '4px' }}>
                  {serviceData.serviceDate.toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 500 }}>
                  QUILOMETRAGEM
                </Text>
                <div style={{ color: '#F9FAFB', fontSize: '14px', marginTop: '4px' }}>
                  {serviceData.mileage.toLocaleString()} km
                  {updateVehicleMileage && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#10B981', 
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircleOutlined style={{ fontSize: '10px' }} />
                      Será atualizada no veículo
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 500 }}>
                  CUSTO
                </Text>
                <div style={{ 
                  color: '#10B981', 
                  fontSize: '16px', 
                  fontWeight: 600,
                  marginTop: '4px' 
                }}>
                  R$ {serviceData.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 500 }}>
                  LOCAL
                </Text>
                <div style={{ color: '#F9FAFB', fontSize: '14px', marginTop: '4px' }}>
                  {serviceData.location}
                </div>
              </div>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: '#374151', 
                borderRadius: '6px',
                border: '1px solid #4B5563'
              }}>
                <Text style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 500 }}>
                  ANEXOS
                </Text>
                <div style={{ color: '#F9FAFB', fontSize: '14px', marginTop: '4px' }}>
                  {uploadedFiles.length} arquivo(s) selecionado(s)
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Modal>
  );
});

export default ServiceModal;