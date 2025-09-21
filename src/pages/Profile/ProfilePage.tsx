import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  message, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Avatar, 
  Divider,
  Alert,
  Spin,
  Modal
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  SaveOutlined, 
  LogoutOutlined,
  EditOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useAuth } from '../../features/auth';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './ProfilePage.module.css';

const { Text, Title } = Typography;

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    }
  }, [user, form]);

  const handleFormChange = () => {
    const currentValues = form.getFieldsValue();
    const initialValues = {
      name: user?.name,
      email: user?.email,
      phone: user?.phone
    };

    const changed = Object.keys(currentValues).some(
      key => currentValues[key as keyof ProfileFormData] !== initialValues[key as keyof typeof initialValues]
    );
    setHasChanges(changed);
  };

  const onFinish = async (values: ProfileFormData) => {
    try {
      setLoading(true);
      await updateProfile(values);
      message.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      message.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleLogout = () => {
    message.success('Logout realizado com sucesso!');
    logout();
  };

  const handlePasswordChange = async (values: PasswordFormData) => {
    try {
      setPasswordLoading(true);
      // Aqui você implementaria a lógica para alterar a senha
      // await changePassword(values.currentPassword, values.newPassword);
      
      message.success('Senha alterada com sucesso!');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      message.error('Erro ao alterar senha. Verifique sua senha atual.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordModalCancel = () => {
    setPasswordModalVisible(false);
    passwordForm.resetFields();
  };

  if (!user) {
    return (
      <DefaultFrame title="Perfil" loading={true}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: '16px' }}>
            Carregando perfil...
          </Text>
        </div>
      </DefaultFrame>
    );
  }

  return (
    <DefaultFrame title="Meu Perfil">
      <div className={styles.profileContainer}>
        {/* Header do Perfil */}
        <Card className={componentStyles.professionalCard} style={{ marginBottom: '24px' }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={8}>
              <div className={styles.profileAvatar}>
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />}
                  style={{ 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                    fontSize: '48px'
                  }}
                />
                <div className={styles.profileInfo}>
                  <Title level={3} style={{ margin: '16px 0 8px 0', color: 'var(--text-primary)' }}>
                    {user.name}
                  </Title>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                    {user.email}
                  </Text>
                </div>
              </div>
            </Col>
            
            <Col xs={24} sm={16}>
              <div className={styles.profileStats}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <div className={styles.statItem}>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        Membro desde
                      </Text>
                      <Text strong style={{ display: 'block', fontSize: '14px' }}>
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className={styles.statItem}>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        Último acesso
                      </Text>
                      <Text strong style={{ display: 'block', fontSize: '14px' }}>
                        {new Date((user as any).lastLogin || Date.now()).toLocaleDateString('pt-BR')}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className={styles.statItem}>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        Status
                      </Text>
                      <Text strong style={{ display: 'block', fontSize: '14px', color: '#52C41A' }}>
                        Ativo
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div className={styles.statItem}>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        Tipo de conta
                      </Text>
                      <Text strong style={{ display: 'block', fontSize: '14px' }}>
                        {(user as any).role === 'admin' ? 'Administrador' : 'Usuário'}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Formulário de Perfil */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card 
              title={
                <Space>
                  <UserOutlined style={{ color: '#8B5CF6' }} />
                  <span>Informações Pessoais</span>
                </Space>
              }
              className={componentStyles.professionalCard}
              extra={
                <Space>
                  {isEditing ? (
                    <>
                      <Button onClick={handleCancel}>
                        Cancelar
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        onClick={() => form.submit()}
                        loading={loading}
                        disabled={!hasChanges}
                      >
                        Salvar
                      </Button>
                    </>
                  ) : (
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                    >
                      Editar
                    </Button>
                  )}
                </Space>
              }
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleFormChange}
                disabled={!isEditing}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item 
                      name="name" 
                      label={
                        <Space>
                          <UserOutlined />
                          <span>Nome Completo</span>
                        </Space>
                      }
                      rules={[{ required: true, message: 'Por favor, insira seu nome' }]}
                    >
                      <Input 
                        placeholder="Seu nome completo"
                        className={componentStyles.professionalInput}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item 
                      name="email" 
                      label={
                        <Space>
                          <MailOutlined />
                          <span>E-mail</span>
                        </Space>
                      }
                      rules={[
                        { required: true, message: 'Por favor, insira seu e-mail' },
                        { type: 'email', message: 'Por favor, insira um e-mail válido' }
                      ]}
                    >
                      <Input 
                        placeholder="seu@email.com"
                        className={componentStyles.professionalInput}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item 
                      name="phone" 
                      label={
                        <Space>
                          <PhoneOutlined />
                          <span>Telefone</span>
                        </Space>
                      }
                    >
                      <Input 
                        placeholder="(11) 99999-9999"
                        className={componentStyles.professionalInput}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* Sidebar com ações rápidas */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Configurações de Segurança */}
              <Card 
                title={
                  <Space>
                    <LockOutlined style={{ color: '#8B5CF6' }} />
                    <span>Segurança</span>
                  </Space>
                }
                className={componentStyles.professionalCard}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    block 
                    icon={<LockOutlined />}
                    onClick={() => setPasswordModalVisible(true)}
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      color: '#ffffff',
                      height: '40px',
                      fontWeight: '500'
                    }}
                  >
                    Alterar Senha
                  </Button>
                </Space>
              </Card>

              {/* Informações da Conta */}
              <Card 
                title="Informações da Conta"
                className={componentStyles.professionalCard}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      ID do Usuário
                    </Text>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>
                      {user.id}
                    </Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Criado em
                    </Text>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>
                      {new Date(user.createdAt || Date.now()).toLocaleString('pt-BR')}
                    </Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>

        {/* Alertas e Notificações */}
        {hasChanges && isEditing && (
          <Alert
            message="Alterações não salvas"
            description="Você tem alterações não salvas. Clique em 'Salvar' para aplicá-las."
            type="warning"
            showIcon
            style={{ marginTop: '24px' }}
          />
        )}

        {/* Modal de Alteração de Senha */}
        <Modal
          title={
            <Space>
              <LockOutlined style={{ color: '#8B5CF6' }} />
              <span>Alterar Senha</span>
            </Space>
          }
          open={passwordModalVisible}
          onCancel={handlePasswordModalCancel}
          footer={null}
          width={500}
          centered
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
            style={{ marginTop: '16px' }}
          >
            <Form.Item
              name="currentPassword"
              label="Senha Atual"
              rules={[
                { required: true, message: 'Por favor, insira sua senha atual' },
                { min: 6, message: 'A senha deve ter pelo menos 6 caracteres' }
              ]}
            >
              <Input.Password 
                placeholder="Digite sua senha atual"
                className={componentStyles.professionalInput}
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Nova Senha"
              rules={[
                { required: true, message: 'Por favor, insira a nova senha' },
                { min: 6, message: 'A senha deve ter pelo menos 6 caracteres' }
              ]}
            >
              <Input.Password 
                placeholder="Digite a nova senha"
                className={componentStyles.professionalInput}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirmar Nova Senha"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Por favor, confirme a nova senha' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('As senhas não coincidem'));
                  },
                }),
              ]}
            >
              <Input.Password 
                placeholder="Confirme a nova senha"
                className={componentStyles.professionalInput}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handlePasswordModalCancel}>
                  Cancelar
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={passwordLoading}
                  icon={<LockOutlined />}
                >
                  Alterar Senha
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DefaultFrame>
  );
}