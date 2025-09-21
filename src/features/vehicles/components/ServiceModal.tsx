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
  message,
  Upload,
  Alert
} from "antd";
import {
  ToolOutlined,
  UploadOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import {
  VehicleEvent,
  Vehicle
} from "../types/vehicle.types";
import { EVENT_CATEGORIES, EVENT_TYPES } from "../utils/constants";
import { VehicleServiceService, CreateVehicleServiceData } from "../services/vehicleServiceService";

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
}


const ServiceModal: React.FC<ServiceModalProps> = React.memo(({
  open,
  onClose,
  onAdd,
  vehicleId,
  vehicles = [],
  currentMileage = 0
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [serviceData, setServiceData] = useState<CreateVehicleServiceData | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setFileList([]);
      setShowConfirmModal(false);
      setServiceData(null);
      if (currentMileage > 0) {
        form.setFieldsValue({ mileage: currentMileage });
      }
    }
  }, [open, currentMileage, form]);

  const handleSubmit = async () => {
    try {
      // Verificar se há veículos disponíveis
      if (vehicles.length === 0) {
        message.error('Você precisa cadastrar pelo menos um veículo antes de criar manutenções');
        return;
      }

      // Validate form
      const values = await form.validateFields();
      
      const finalVehicleId = vehicleId || values.selectedVehicleId;
      if (!finalVehicleId) {
        message.error('Selecione um veículo para continuar');
        return;
      }

      // Prepare service data
      const preparedServiceData: CreateVehicleServiceData = {
        vehicleId: finalVehicleId,
        type: values.type,
        category: values.category,
        description: values.description,
        serviceDate: values.date.toDate(),
        mileage: values.mileage,
        cost: values.cost,
        location: values.location,
        attachments: fileList.filter(f => f.status === 'done').map(f => f.name),
        technician: '',
        warranty: false,
        nextServiceDate: undefined,
        notes: ''
      };

      // Show confirmation modal
      setServiceData(preparedServiceData);
      setShowConfirmModal(true);

    } catch (error) {
      console.error('Erro na validação:', error);
      message.error('Preencha todos os campos obrigatórios');
    }
  };

  // Função para converter valor do tipo para label em português
  const getTypeLabel = (typeValue: string) => {
    const typeOption = EVENT_TYPES.find(option => option.value === typeValue);
    return typeOption ? typeOption.label : typeValue;
  };

  const handleConfirmBlockchain = async () => {
    if (!serviceData) return;

    try {
      setSubmitting(true);
      setShowConfirmModal(false);

      // Save service
      const savedService = await VehicleServiceService.createService(serviceData);
      message.success('Serviço cadastrado com sucesso!');

      // Try to send to blockchain
      try {
        await VehicleServiceService.updateBlockchainStatus(
          savedService.id,
          undefined,
          'user'
        );
        message.success('Serviço enviado para blockchain!');
      } catch (blockchainError) {
        console.warn('Erro ao enviar para blockchain:', blockchainError);
        message.warning('Serviço salvo, mas erro ao enviar para blockchain');
      }

      onAdd(savedService);
      onClose();

    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.code === 'ECONNABORTED') {
        message.error('Timeout na requisição. O serviço pode ter sido salvo, mas a resposta demorou muito. Verifique a lista de serviços.');
      } else if (error.response?.status === 400) {
        message.error('Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.');
      } else if (error.response?.status === 401) {
        message.error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status >= 500) {
        message.error('Erro interno do servidor. Tente novamente em alguns minutos.');
      } else {
        message.error('Erro ao salvar serviço. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ToolOutlined style={{ fontSize: '20px', color: '#8B5CF6' }} />
          <Title level={4} style={{ margin: 0 }}>
            Adicionar Serviço
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={600}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Vehicle Selection */}
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
            />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Tipo de Serviço"
              rules={[{ required: true, message: 'Selecione o tipo' }]}
            >
              <Select
                placeholder="Selecione o tipo"
                options={EVENT_TYPES as any}
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
                options={EVENT_CATEGORIES as any}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Descrição"
          rules={[{ required: true, message: 'Descreva o serviço' }]}
        >
          <TextArea
            rows={3}
            placeholder="Descreva o serviço realizado..."
          />
        </Form.Item>

        {/* Upload de Anexos */}
        <Form.Item label="Anexos (opcional)">
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
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ color: '#8B5CF6', fontSize: '24px' }} />
            </p>
            <p className="ant-upload-text">
              Clique ou arraste arquivos para esta área
            </p>
            <p className="ant-upload-hint">
              Suporta JPG, PNG, GIF, PDF, DOC. Máximo 10 arquivos.
            </p>
          </Dragger>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Data do Serviço"
              rules={[{ required: true, message: 'Selecione a data' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="mileage"
              label="Quilometragem"
              rules={[{ required: true, message: 'Informe a quilometragem' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                min={0}
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
                style={{ width: '100%' }}
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
              label="Local"
              rules={[{ required: true, message: 'Informe o local' }]}
            >
              <Input placeholder="Oficina, concessionária, etc." />
            </Form.Item>
          </Col>
        </Row>


        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<ToolOutlined />}
          >
            Salvar Serviço
          </Button>
        </div>
      </Form>

      {/* Modal de Confirmação da Blockchain */}
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
              <Title level={4} style={{ margin: 0, color: '#1F2937' }}>
                Confirmação Blockchain
              </Title>
              <Text style={{ color: '#6B7280', fontSize: '14px' }}>
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
        width={600}
        style={{ top: 50 }}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <Alert
            message="⚠️ Ação Irreversível"
            description="Após confirmação, este serviço será enviado para blockchain e se tornará imutável. Certifique-se de que todos os dados estão corretos."
            type="warning"
            showIcon
            style={{ 
              marginBottom: '20px',
              borderRadius: '8px',
              border: '1px solid #fbbf24'
            }}
          />
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
            
            {serviceData.attachments && serviceData.attachments.length > 0 && (
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
                  {serviceData.attachments.length} arquivo(s) selecionado(s)
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