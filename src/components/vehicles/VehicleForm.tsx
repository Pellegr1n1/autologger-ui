import React, { useEffect } from 'react';
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
  Alert
} from 'antd';
import {
  CarOutlined,
  NumberOutlined,
  CalendarOutlined,
  BgColorsOutlined,
  DashboardOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { Vehicle } from '../../@types/vehicle.types';

const { Title, Text } = Typography;
const { Option } = Select;

interface VehicleFormProps {
  visible: boolean;
  vehicle?: Vehicle | null;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  visible,
  vehicle,
  onSubmit,
  onCancel
}) => {
  const [form] = Form.useForm();
  const isEditing = !!vehicle;

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
      } else {
        form.resetFields();
      }
    }
  }, [visible, vehicle, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      // Formatar placa automaticamente
      if (values.plate) {
        values.plate = values.plate.toUpperCase();
      }
      onSubmit(values);
      form.resetFields();
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const validatePlate = (_: any, value: string) => {
    if (value) {
      const platePattern = /^[A-Z]{3}-?\d{4}$/;
      const mercosulPattern = /^[A-Z]{3}\d[A-Z]\d{2}$/;
      
      const normalizedValue = value.toUpperCase().replace('-', '');
      
      if (!platePattern.test(value.toUpperCase()) && !mercosulPattern.test(normalizedValue)) {
        return Promise.reject(new Error('Formato inválido. Use ABC-1234 ou ABC1D23'));
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => currentYear - i);

  const carBrands = [
    'Audi', 'BMW', 'Chevrolet', 'Citroën', 'Fiat', 'Ford', 'Honda', 'Hyundai',
    'Jeep', 'Kia', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Peugeot', 'Renault',
    'Toyota', 'Volkswagen', 'Volvo'
  ];

  const colors = [
    'Branco', 'Preto', 'Prata', 'Cinza', 'Azul', 'Vermelho', 'Verde', 'Amarelo',
    'Marrom', 'Bege', 'Roxo', 'Laranja', 'Rosa', 'Dourado'
  ];

  return (
    <Modal
      title={
        <Space>
          <CarOutlined style={{ color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            {isEditing ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
          </Title>
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={isEditing ? 'Atualizar' : 'Cadastrar'}
      cancelText="Cancelar"
      width={700}
      destroyOnClose
      style={{ top: 20 }}
    >
      {!isEditing && (
        <Alert
          message="Limite de veículos"
          description="Você pode cadastrar no máximo 2 veículos ativos simultaneamente."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="plate"
              label={
                <Space>
                  <NumberOutlined />
                  <Text strong>Placa</Text>
                </Space>
              }
              rules={[
                { required: true, message: 'Placa é obrigatória' },
                { validator: validatePlate }
              ]}
            >
              <Input
                placeholder="ABC-1234 ou ABC1D23"
                maxLength={8}
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="brand"
              label={
                <Space>
                  <CarOutlined />
                  <Text strong>Marca</Text>
                </Space>
              }
              rules={[{ required: true, message: 'Marca é obrigatória' }]}
            >
              <Select
                placeholder="Selecione a marca"
                showSearch
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {carBrands.map(brand => (
                  <Option key={brand} value={brand}>
                    {brand}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="model"
              label={
                <Space>
                  <CarOutlined />
                  <Text strong>Modelo</Text>
                </Space>
              }
              rules={[{ required: true, message: 'Modelo é obrigatório' }]}
            >
              <Input placeholder="Ex: Corolla, Civic, Golf" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="year"
              label={
                <Space>
                  <CalendarOutlined />
                  <Text strong>Ano</Text>
                </Space>
              }
              rules={[{ required: true, message: 'Ano é obrigatório' }]}
            >
              <Select
                placeholder="Selecione o ano"
                showSearch
              >
                {years.map(year => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="color"
              label={
                <Space>
                  <BgColorsOutlined />
                  <Text strong>Cor</Text>
                </Space>
              }
              rules={[{ required: true, message: 'Cor é obrigatória' }]}
            >
              <Select
                placeholder="Selecione a cor"
                showSearch
              >
                {colors.map(color => (
                  <Option key={color} value={color}>
                    <Space>
                      <div
                        style={{
                          width: 12,
                          height: 12,
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
                          border: '1px solid #d9d9d9'
                        }}
                      />
                      {color}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="mileage"
              label={
                <Space>
                  <DashboardOutlined />
                  <Text strong>Quilometragem</Text>
                </Space>
              }
              rules={[
                { required: true, message: 'Quilometragem é obrigatória' },
                { type: 'number', min: 0, message: 'Quilometragem deve ser positiva' }
              ]}
            >
              <InputNumber
                placeholder="0"
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={value => value!.replace(/\./g, '')}
                min={0}
                max={999999}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="renavam"
          label={
            <Space>
              <IdcardOutlined />
              <Text strong>RENAVAM</Text>
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
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VehicleForm;