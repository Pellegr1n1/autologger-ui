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
  Alert,
  Switch,
  Steps,
  Spin
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
    styles={{
      body: {
        padding: noPadding ? '0' : '24px',
        background: '#1F2937'
      }
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

const ServiceModal: React.FC<ServiceModalProps> = React.memo(({
  open,
  onClose,
  onAdd,
  vehicleId,
  vehicles = [],
  loading = false,
  currentMileage = 0
}) => {
  // Estados consolidados (versão com spinner)
  const [modalState, setModalState] = useState({
    isLoadingData: true,
    currentStep: 0,
    autoMileage: true,
    estimatedNextService: null as number | null,
    formProgress: 0
  });

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

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

  // Remover variáveis não utilizadas

  // EFEITO PRINCIPAL: Reset apenas quando modal abre/fecha
  useEffect(() => {
    if (open) {
      // Reset completo quando abre
      setModalState({
        isLoadingData: true,
        currentStep: 0,
        autoMileage: true,
        estimatedNextService: null,
        formProgress: 0
      });

      setFileList([]);
      form.resetFields();

      // Simular loading
      const timer = setTimeout(() => {
        setModalState(prev => ({ ...prev, isLoadingData: false }));

        // Definir quilometragem inicial se necessário
        if (currentMileage > 0) {
          form.setFieldsValue({ mileage: currentMileage });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open]); // APENAS quando open muda

  // Remover useEffect de progresso que pode estar causando re-renders

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
    if (modalState.autoMileage && currentMileage) {
      const nextService = calculateNextService(value, currentMileage);
      setModalState(prev => ({ ...prev, estimatedNextService: nextService }));
    }
  };

  // Remover handler não utilizado

  const canGoToNextStep = async () => {
    if (modalState.currentStep === 0) {
      try {
        const step1Fields = ['type', 'category', 'description', 'date', 'mileage', 'cost', 'location'];
        await form.validateFields(step1Fields);
        return true;
      } catch (error) {
        return false;
      }
    }
    return true;
  };

  const handleNextStep = async () => {
    const canAdvance = await canGoToNextStep();
    if (canAdvance) {
      setModalState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      message.warning('Preencha todos os campos obrigatórios antes de continuar');
    }
  };

  const handlePrevStep = () => {
    setModalState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit iniciado');

    // Capturar valores do formulário de uma vez
    const formValues = form.getFieldsValue();
    const {
      type, category, description, date, mileage, cost, location,
      technician, warranty, nextServiceDate, notes
    } = formValues;

    // Validação consolidada
    if (!date || !type || !category || !description ||
      mileage === undefined || cost === undefined || !location) {
      message.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const finalVehicleId = vehicleId || formValues.selectedVehicleId;
    if (!finalVehicleId) {
      message.error('Selecione um veículo para continuar');
      return;
    }

    // Preparar dados
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

    // Salvar no banco
    message.loading('Salvando serviço no banco de dados...', 0);

    try {
      const savedService = await VehicleServiceService.createService(serviceData);
      console.log('✅ Serviço salvo no banco:', savedService);

      message.destroy();
      message.success('Serviço salvo no banco de dados!');

      // Tentar enviar para blockchain
      try {
        console.log('🔗 Tentando enviar para blockchain...');
        message.loading('Enviando para blockchain...', 0);

        const blockchainResult = await VehicleServiceService.updateBlockchainStatus(
          savedService.id,
          undefined,
          'user'
        );

        console.log('✅ Enviado para blockchain:', blockchainResult);
        message.destroy();
        message.success('Serviço enviado para blockchain com sucesso!');

        onAdd(savedService);
        onClose();

      } catch (blockchainError) {
        console.error('❌ Erro blockchain:', blockchainError);
        message.destroy();
        message.warning('Serviço salvo no banco, mas erro ao enviar para blockchain. Tente novamente mais tarde.');

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
      destroyOnHidden={false} // Voltar para o comportamento original
      style={{ top: 20 }}
      className={styles.serviceModal}
    >
      {modalState.isLoadingData ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          minHeight: '400px'
        }}>
          <Spin size="large" />
          <Text style={{ marginTop: '16px', fontSize: '16px', color: '#9CA3AF' }}>
            Carregando dados...
          </Text>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          preserve={false} // Não preservar dados entre renders
        >
          <div style={{ padding: '20px 0' }}>
            {/* Progress Steps */}
            <Steps current={modalState.currentStep} items={steps} style={{ marginBottom: '24px' }} />

            {/* Remover barra de progresso que pode causar re-renders */}

            {/* Step 1: Dados do Serviço */}
            {modalState.currentStep === 0 && (
              <>
                <FormSection
                  title="Informações Básicas"
                  icon={<CarOutlined />}
                  description="Dados principais do serviço realizado"
                >
                  {/* Campo de seleção de veículo */}
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
                         checked={modalState.autoMileage}
                         onChange={(checked) => setModalState(prev => ({ ...prev, autoMileage: checked }))}
                         checkedChildren="Automática"
                         unCheckedChildren="Manual"
                       />
                       <Text style={{ color: '#9CA3AF', fontSize: '12px' }}>
                         {modalState.autoMileage
                           ? `Usando quilometragem atual: ${currentMileage.toLocaleString()} km`
                           : 'Digite a quilometragem manualmente'
                         }
                       </Text>
                     </Space>
                   </Form.Item>

                   {/* Estimated Next Service */}
                   {modalState.estimatedNextService && (
                    <Alert
                      message="📅 Próximo Serviço Recomendado"
                      description={`Baseado no tipo de serviço selecionado, o próximo serviço similar deve ser realizado em aproximadamente ${modalState.estimatedNextService.toLocaleString()} km`}
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
             {modalState.currentStep === 1 && (
              <FormSection
                title="Documentos e Fotos"
                icon={<PaperClipOutlined />}
                description="Anexe comprovantes, fotos e documentos relacionados ao serviço (opcional)"
              >
                <Dragger
                  fileList={fileList}
                  onChange={({ fileList: newFileList }) => {
                    setFileList(newFileList);
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
            {modalState.currentStep === 2 && (
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
                {modalState.currentStep > 0 && (
                  <Button
                    onClick={handlePrevStep}
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

                {modalState.currentStep < 2 ? (
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
      )}
    </Modal>
  );
});

export default ServiceModal;