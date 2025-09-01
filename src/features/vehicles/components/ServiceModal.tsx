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
  Upload,
  message,
  Divider,
  Space,
  Card,
  Tag,
  Progress,
  Alert,
  Switch,
  Steps
} from "antd";
import { 
  CloseOutlined,
  InfoCircleOutlined,
  CarOutlined,
  ToolOutlined,
  UploadOutlined,
  PaperClipOutlined,
  CheckCircleOutlined,
  BlockOutlined
} from "@ant-design/icons";
import {
  VehicleEvent,
  Vehicle
} from "../types/vehicle.types";
import { EVENT_CATEGORIES, EVENT_TYPES } from "../utils/constants";
import { VehicleServiceService, CreateVehicleServiceData } from "../../../services/api/vehicleServiceService";
import styles from './ServiceModal.module.css';

const { Text, Title } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (event: VehicleEvent) => void;
  vehicleId?: string;
  vehicles?: Vehicle[];
  loading?: boolean;
  currentMileage?: number;
}

const FormSection: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  noPadding?: boolean;
  description?: string;
}> = ({ title, icon, children, noPadding = false, description }) => (
  <Card
    className={styles.formSection}
    bodyStyle={{ 
      padding: noPadding ? '0' : '24px',
      background: '#1F2937'
    }}
  >
    <div className={styles.sectionHeader}>
      <div className={styles.sectionIcon}>
        {icon}
      </div>
      <div>
        <Text className={styles.sectionTitle}>
          {title}
        </Text>
        {description && (
          <Text className={styles.sectionDescription}>
            {description}
          </Text>
        )}
      </div>
    </div>
    {children}
  </Card>
);

const ServiceModal: React.FC<ServiceModalProps> = ({
  open,
  onClose,
  onAdd,
  vehicleId,
  vehicles = [],
  loading = false,
  currentMileage = 0
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<any[]>([]);
  const [autoMileage, setAutoMileage] = useState(true);
  const [estimatedNextService, setEstimatedNextService] = useState<number | null>(null);
  const [formProgress, setFormProgress] = useState(0);

  const steps = [
    {
      title: 'Dados do Serviço',
      icon: <ToolOutlined />,
      description: 'Informações básicas'
    },
    {
      title: 'Anexos',
      icon: <PaperClipOutlined />,
      description: 'Documentos e fotos'
    },
    {
      title: 'Revisão',
      icon: <CheckCircleOutlined />,
      description: 'Confirmar dados'
    }
  ];

  // Campos obrigatórios para validação
  const requiredFields = ['type', 'category', 'description', 'date', 'mileage', 'cost', 'location'];

  // Função para calcular o progresso do formulário
  const calculateProgress = () => {
    const values = form.getFieldsValue();
    let filledCount = 0;

    requiredFields.forEach(field => {
      const value = values[field];
      let isFilled = false;

      if (field === 'date') {
        isFilled = value && value.isValid && value.isValid();
      } else if (field === 'mileage' || field === 'cost') {
        isFilled = value !== undefined && value !== null && value !== '' && !isNaN(Number(value));
      } else {
        isFilled = value !== undefined && value !== null && value !== '';
      }

      if (isFilled) filledCount++;
    });

    // Na primeira etapa, não considera anexos - apenas os campos obrigatórios
    const totalFields = requiredFields.length;
    const progress = Math.round((filledCount / totalFields) * 100);
    
    setFormProgress(progress);
  };

  // Reset do modal quando abre
  useEffect(() => {
    if (open) {
      // Evita múltiplas execuções
      const timer = setTimeout(() => {
        setCurrentStep(0);
        form.resetFields();
        setFileList([]);
        setAutoMileage(true);
        setEstimatedNextService(null);
        setFormProgress(0);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [open, form]);

  // Atualiza quilometragem automática
  useEffect(() => {
    if (autoMileage && currentMileage && open) {
      // Aguarda um pouco para garantir que o form foi resetado
      setTimeout(() => {
        form.setFieldsValue({ mileage: currentMileage });
      }, 100);
    }
  }, [autoMileage, currentMileage, form, open]);

  // Atualiza progresso quando fileList muda
  useEffect(() => {
    if (open && currentStep === 0) {
      calculateProgress();
    }
  }, [open, currentStep]);

  // Atualiza progresso periodicamente (mais responsivo)
  useEffect(() => {
    if (!open || currentStep !== 0) return;

    // Calcula o progresso inicial
    calculateProgress();

    // Atualiza a cada 300ms para ser muito responsivo
    const interval = setInterval(() => {
      calculateProgress();
    }, 300);

    return () => clearInterval(interval);
  }, [open, currentStep]);

  // Reset do progresso quando mudar de etapa
  useEffect(() => {
    if (currentStep !== 0) {
      setFormProgress(0);
    }
  }, [currentStep]);

  // Função para lidar com mudanças nos campos (mais responsiva)
  const handleFieldChange = () => {
    // Atualiza o progresso apenas na primeira etapa
    if (currentStep === 0) {
      setTimeout(() => {
        calculateProgress();
      }, 30);
    }
  };

  const calculateNextService = (eventType: string, currentMileage: number) => {
    const serviceIntervals: { [key: string]: number } = {
      'OIL_CHANGE': 5000,
      'TIRE_ROTATION': 10000,
      'BRAKE_SERVICE': 20000,
      'AIR_FILTER': 15000,
      'TRANSMISSION': 40000,
      'COOLANT': 30000,
      'SPARK_PLUGS': 60000,
      'TIMING_BELT': 80000
    };

    const interval = serviceIntervals[eventType] || 10000;
    return currentMileage + interval;
  };

  const handleEventTypeChange = (value: string) => {
    if (autoMileage && currentMileage) {
      const nextService = calculateNextService(value, currentMileage);
      setEstimatedNextService(nextService);
    }
  };

  const canGoToNextStep = async () => {
    if (currentStep === 0) {
      try {
        // Valida apenas os campos do primeiro step
        const step1Fields = ['type', 'category', 'description', 'date', 'mileage', 'cost', 'location'];
        await form.validateFields(step1Fields);
        return true;
      } catch (error) {
        console.log('Validation error:', error);
        return false;
      }
    }
    return true;
  };

  const handleNextStep = async () => {
    const canAdvance = await canGoToNextStep();
    if (canAdvance) {
      setCurrentStep(currentStep + 1);
    } else {
      message.warning('Preencha todos os campos obrigatórios antes de continuar');
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit iniciado');
    
    // Debug: verificar campos individuais
    console.log('🔍 Debug campos individuais:');
    const type = form.getFieldValue('type');
    const category = form.getFieldValue('category');
    const description = form.getFieldValue('description');
    const date = form.getFieldValue('date');
    const mileage = form.getFieldValue('mileage');
    const cost = form.getFieldValue('cost');
    const location = form.getFieldValue('location');
    const technician = form.getFieldValue('technician');
    const warranty = form.getFieldValue('warranty');
    const nextServiceDate = form.getFieldValue('nextServiceDate');
    const notes = form.getFieldValue('notes');
    
    console.log('- type:', type);
    console.log('- category:', category);
    console.log('- description:', description);
    console.log('- date:', date);
    console.log('- mileage:', mileage);
    console.log('- cost:', cost);
    console.log('- location:', location);
    console.log('- technician:', technician);
    console.log('- warranty:', warranty);
    console.log('- nextServiceDate:', nextServiceDate);
    console.log('- notes:', notes);
    
    // Validação manual dos campos obrigatórios usando valores individuais
    if (!date || !type || !category || !description || 
        mileage === undefined || cost === undefined || !location) {
      console.log('❌ Validação falhou:', { 
        date, 
        type, 
        category, 
        description, 
        mileage, 
        cost, 
        location 
      });
      message.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    console.log('✅ Validação passou, valores capturados individualmente');

    // Verificar se vehicleId está definido (seja do prop ou do formulário)
    const finalVehicleId = vehicleId || form.getFieldValue('selectedVehicleId');
    if (!finalVehicleId) {
      message.error('Selecione um veículo para continuar');
      return;
    }

    // Preparar dados para salvar no banco usando valores individuais
    const serviceData: CreateVehicleServiceData = {
      vehicleId: finalVehicleId,
      type,
      category,
      description,
      serviceDate: date.toDate(),
      mileage,
      cost,
      location,
      attachments: fileList.filter(f => f.status === 'done').map(f => f.name),
      technician: technician || '',
      warranty: warranty || false,
      nextServiceDate: nextServiceDate?.toDate(),
      notes: notes || ''
    };

    console.log('📝 Dados preparados:', serviceData);

    // Salvar no banco primeiro
    console.log('💾 Tentando salvar no banco...');
    message.loading('Salvando serviço no banco de dados...', 0);
    
    try {
      const savedService = await VehicleServiceService.createService(serviceData);
      console.log('✅ Serviço salvo no banco:', savedService);
      
      message.destroy();
      message.success('Serviço salvo no banco de dados!');

      // Agora enviar para blockchain
      try {
        console.log('🔗 Tentando enviar para blockchain...');
        message.loading('Enviando para blockchain...', 0);
        
        // Enviar para blockchain via backend
        const blockchainResult = await VehicleServiceService.updateBlockchainStatus(
          savedService.id,
          'pending-hash',
          'user'
        );
        
        console.log('✅ Enviado para blockchain:', blockchainResult);
        message.destroy();
        message.success('Serviço enviado para blockchain com sucesso!');
        
        // Fechar modal e atualizar lista
        onAdd(savedService);
        onClose();
        
      } catch (blockchainError) {
        console.error('❌ Erro blockchain:', blockchainError);
        message.destroy();
        message.warning('Serviço salvo no banco, mas erro ao enviar para blockchain. Tente novamente mais tarde.');
        
        // Mesmo com erro na blockchain, o serviço foi salvo no banco
        onAdd(savedService);
        onClose();
      }

    } catch (dbError) {
      console.error('❌ Erro ao salvar no banco:', dbError);
      message.destroy();
      message.error('Erro ao salvar serviço no banco de dados. Tente novamente.');
    }
  };

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px'
            }}>
              <ToolOutlined />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#F9FAFB' }}>
                Adicionar Serviço
              </Title>
              <Text style={{ color: '#9CA3AF', fontSize: '14px' }}>
                Registre um novo serviço para este veículo
              </Text>
            </div>
          </div>
        }
        open={open}
        onCancel={onClose}
        width={900}
        footer={null}
        destroyOnClose={false}
        style={{ top: 20 }}
        className={styles.serviceModal}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFieldChange}
          preserve={true}
          initialValues={{
            type: undefined,
            category: undefined,
            description: '',
            date: undefined,
            mileage: autoMileage ? currentMileage : undefined,
            cost: undefined,
            location: '',
            technician: '',
            warranty: false,
            nextServiceDate: undefined,
            notes: ''
          }}
        >
          <div style={{ padding: '20px 0' }}>
            {/* Progress Steps */}
            <Steps current={currentStep} items={steps} style={{ marginBottom: '24px' }} />
            
            {/* Progress Bar - Apenas na primeira etapa */}
            {currentStep === 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text style={{ color: '#9CA3AF', fontSize: '13px' }}>Progresso do Formulário</Text>
                  <Text style={{ color: '#8B5CF6', fontWeight: 500 }}>{formProgress}%</Text>
                </div>
                <Progress 
                  percent={formProgress} 
                  strokeColor={{
                    '0%': '#8B5CF6',
                    '100%': '#A78BFA',
                  }}
                  showInfo={false}
                  size="small"
                  trailColor="#374151"
                />
              </div>
            )}

            {/* Step 1: Dados do Serviço */}
            {currentStep === 0 && (
              <>
                <FormSection
                  title="Informações Básicas"
                  icon={<CarOutlined />}
                  description="Dados principais do serviço realizado"
                >
                  {/* Campo de seleção de veículo - apenas quando não há vehicleId específico */}
                  {!vehicleId && vehicles.length > 0 && (
                    <Form.Item
                      name="selectedVehicleId"
                      label="Veículo"
                      rules={[{ required: true, message: 'Selecione um veículo' }]}
                    >
                      <Select
                        placeholder="Selecione o veículo"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={vehicles.map(v => ({
                          value: v.id,
                          label: `${v.brand} ${v.model} - ${v.plate}`
                        }))}
                        onChange={(value) => {
                          const selectedVehicle = vehicles.find(v => v.id === value);
                          if (selectedVehicle) {
                            form.setFieldsValue({ mileage: selectedVehicle.mileage });
                          }
                        }}
                        style={{ background: '#374151', border: '1px solid #4B5563' }}
                      />
                    </Form.Item>
                  )}

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="type"
                        label="Tipo de Evento"
                        rules={[{ required: true, message: 'Selecione o tipo de evento' }]}
                      >
                        <Select
                          placeholder="Selecione o tipo"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={EVENT_TYPES as any}
                          onChange={handleEventTypeChange}
                          style={{ background: '#374151', border: '1px solid #4B5563' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="category"
                        label="Categoria"
                        rules={[{ required: true, message: 'Selecione a categoria' }]}
                      >
                        <Select
                          placeholder="Selecione a categoria"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={EVENT_CATEGORIES as any}
                          style={{ background: '#374151', border: '1px solid #4B5563' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="description"
                    label="Descrição do Serviço"
                    rules={[{ required: true, message: 'Descreva o serviço realizado' }]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="Descreva detalhadamente o serviço realizado..."
                      style={{ background: '#374151', border: '1px solid #4B5563', color: '#F9FAFB' }}
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="date"
                        label="Data do Serviço"
                        rules={[{ required: true, message: 'Selecione a data' }]}
                      >
                        <DatePicker
                          style={{ width: '100%', background: '#374151', border: '1px solid #4B5563' }}
                          placeholder="Selecione a data"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="mileage"
                        label="Quilometragem"
                        rules={[{ required: true, message: 'Informe a quilometragem' }]}
                      >
                        <InputNumber
                          style={{ width: '100%', background: '#374151', border: '1px solid #4B5563' }}
                          placeholder="0"
                          min={0}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                          parser={(value: any) => Number(value.replace(/\./g, ''))}
                          addonAfter="km"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="cost"
                        label="Custo"
                        rules={[{ required: true, message: 'Informe o custo' }]}
                      >
                        <InputNumber
                          style={{ width: '100%', background: '#374151', border: '1px solid #4B5563' }}
                          placeholder="0,00"
                          min={0}
                          precision={2}
                          formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                          parser={(value: any) => Number(value.replace(/R\$\s?|\./g, ''))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="location"
                        label="Local do Serviço"
                        rules={[{ required: true, message: 'Informe o local' }]}
                      >
                        <Input
                          placeholder="Oficina, concessionária, etc."
                          style={{ background: '#374151', border: '1px solid #4B5563', color: '#F9FAFB' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Auto Mileage Switch */}
                  <Form.Item label="Quilometragem Automática">
                    <Space>
                      <Switch
                        checked={autoMileage}
                        onChange={setAutoMileage}
                        checkedChildren="Automática"
                        unCheckedChildren="Manual"
                      />
                      <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                        {autoMileage 
                          ? `Usando quilometragem atual: ${currentMileage.toLocaleString()} km`
                          : 'Digite a quilometragem manualmente'
                        }
                      </Text>
                    </Space>
                  </Form.Item>

                  {/* Estimated Next Service */}
                  {estimatedNextService && (
                    <Alert
                      message="📅 Próximo Serviço Recomendado"
                      description={`Baseado no tipo de serviço selecionado, o próximo serviço similar deve ser realizado em aproximadamente ${estimatedNextService.toLocaleString()} km`}
                      type="info"
                      showIcon
                      style={{ marginTop: '16px' }}
                    />
                  )}
                </FormSection>

                <FormSection
                  title="Informações Adicionais"
                  icon={<InfoCircleOutlined />}
                  description="Detalhes complementares do serviço (opcionais)"
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="technician"
                        label="Técnico Responsável"
                      >
                        <Input
                          placeholder="Nome do técnico"
                          style={{ background: '#374151', border: '1px solid #4B5563', color: '#F9FAFB' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="warranty"
                        label="Garantia"
                        valuePropName="checked"
                      >
                        <Switch
                          checkedChildren="Sim"
                          unCheckedChildren="Não"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="nextServiceDate"
                    label="Data do Próximo Serviço"
                  >
                    <DatePicker
                      style={{ width: '100%', background: '#374151', border: '1px solid #4B5563' }}
                      placeholder="Selecione a data"
                    />
                  </Form.Item>

                  <Form.Item
                    name="notes"
                    label="Observações"
                  >
                    <TextArea
                      rows={2}
                      placeholder="Observações adicionais..."
                      style={{ background: '#374151', border: '1px solid #4B5563', color: '#F9FAFB' }}
                    />
                  </Form.Item>
                </FormSection>
              </>
            )}

            {/* Step 2: Anexos */}
            {currentStep === 1 && (
              <FormSection
                title="Documentos e Fotos"
                icon={<PaperClipOutlined />}
                description="Anexe comprovantes, fotos e documentos relacionados ao serviço (opcional)"
              >
                <Dragger
                  fileList={fileList}
                  onChange={({ fileList: newFileList }) => {
                    setFileList(newFileList);
                    calculateProgress();
                  }}
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                  maxCount={10}
                  beforeUpload={() => false}
                  listType="picture"
                  style={{ background: '#374151', border: '1px solid #4B5563' }}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined style={{ color: '#8B5CF6', fontSize: '40px' }} />
                  </p>
                  <p className="ant-upload-text" style={{ color: '#F9FAFB' }}>
                    Clique ou arraste arquivos para esta área
                  </p>
                  <p className="ant-upload-hint" style={{ color: '#9CA3AF' }}>
                    Suporta JPG, PNG, GIF, PDF, DOC. Máximo 10 arquivos.
                  </p>
                </Dragger>

                <Alert
                  message="📋 Dicas para Anexos"
                  description="Para melhor rastreabilidade, anexe: comprovantes de pagamento, fotos do serviço, relatórios técnicos, garantias e manuais."
                  type="info"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              </FormSection>
            )}

            {/* Step 3: Revisão */}
            {currentStep === 2 && (
              <FormSection
                title="Revisão Final"
                icon={<CheckCircleOutlined />}
                description="Revise todos os dados antes de confirmar"
              >
                <Alert
                  message="🔒 Confirmação Blockchain"
                  description="Após confirmação, este serviço será enviado para blockchain e se tornará imutável. Certifique-se de que todos os dados estão corretos."
                  type="warning"
                  showIcon
                  style={{ marginBottom: '20px' }}
                />

                <Card
                  title="Resumo do Serviço"
                  style={{ background: '#374151', border: '1px solid #4B5563' }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong style={{ color: '#F9FAFB' }}>Tipo:</Text>
                      <br />
                      <Tag color="blue">{form.getFieldValue('type')}</Tag>
                    </Col>
                    <Col span={12}>
                      <Text strong style={{ color: '#F9FAFB' }}>Categoria:</Text>
                      <br />
                      <Tag color="green">{form.getFieldValue('category')}</Tag>
                    </Col>
                  </Row>
                  <Divider style={{ margin: '16px 0' }} />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong style={{ color: '#F9FAFB' }}>Data:</Text>
                      <br />
                      <Text style={{ color: '#9CA3AF' }}>
                        {form.getFieldValue('date')?.format('DD/MM/YYYY')}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong style={{ color: '#F9FAFB' }}>Quilometragem:</Text>
                      <br />
                      <Text style={{ color: '#9CA3AF' }}>
                        {form.getFieldValue('mileage')?.toLocaleString()} km
                      </Text>
                    </Col>
                  </Row>
                  <Divider style={{ margin: '16px 0' }} />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong style={{ color: '#F9FAFB' }}>Custo:</Text>
                      <br />
                      <Text style={{ color: '#52C41A', fontSize: '16px' }}>
                        R$ {form.getFieldValue('cost')?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong style={{ color: '#F9FAFB' }}>Local:</Text>
                      <br />
                      <Text style={{ color: '#9CA3AF' }}>
                        {form.getFieldValue('location')}
                      </Text>
                    </Col>
                  </Row>
                  {fileList.length > 0 && (
                    <>
                      <Divider style={{ margin: '16px 0' }} />
                      <Text strong style={{ color: '#F9FAFB' }}>Anexos:</Text>
                      <br />
                      <Text style={{ color: '#9CA3AF' }}>
                        {fileList.length} arquivo(s) selecionado(s)
                      </Text>
                    </>
                  )}
                </Card>
              </FormSection>
            )}

            {/* Navigation Buttons */}
            <div className={styles.actionButtons}>
              <Button
                onClick={onClose}
                icon={<CloseOutlined />}
                size="large"
                className={styles.cancelButton}
              >
                Cancelar
              </Button>

              <Space>
                {currentStep > 0 && (
                  <Button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    size="large"
                    style={{
                      borderColor: '#6B7280',
                      color: '#9CA3AF',
                      borderRadius: '8px'
                    }}
                  >
                    Anterior
                  </Button>
                )}

                {currentStep < 2 ? (
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    size="large"
                    style={{ 
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      height: '40px',
                      paddingLeft: '24px',
                      paddingRight: '24px'
                    }}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    size="large"
                    loading={loading}
                    icon={<BlockOutlined />}
                    className={styles.submitButton}
                  >
                    Confirmar e Enviar para Blockchain
                  </Button>
                )}
              </Space>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ServiceModal;