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
  Modal,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  SaveOutlined, 
  EditOutlined,
  LockOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../../features/auth';
import { useNavigate } from 'react-router-dom';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './ProfilePage.module.css';

const { Text, Title } = Typography;

interface ProfileFormData {
  name: string;
  email: string;
}


export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email
      });
    }
  }, [user, form]);

  const handleFormChange = () => {
    const currentValues = form.getFieldsValue();
    const initialValues = {
      name: user?.name,
      email: user?.email
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
    // Restaura os valores originais do usuário
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email
      });
    }
    setIsEditing(false);
    setHasChanges(false);
  };


  const handlePasswordChange = async () => {
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

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      await deleteAccount();
      message.success('Conta excluída com sucesso');
      setDeleteModalVisible(false);
      navigate('/');
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      message.error('Erro ao excluir conta. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteModalCancel = () => {
    setDeleteModalVisible(false);
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
        <Card className={componentStyles.professionalCard} bordered={false} style={{ marginBottom: '24px' }}>
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
        <Row 
          gutter={[24, 24]} 
          className={styles.cardsRow}
          style={{ display: 'flex', alignItems: 'stretch' }}
        >
          <Col xs={24} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
            <Card 
              title={
                <Space>
                  <div className={styles.personalInfoIcon}>
                    <UserOutlined />
                  </div>
                  <span>Informações Pessoais</span>
                </Space>
              }
              className={componentStyles.professionalCard}
              bordered={false}
              style={{ height: '100%' }}
              extra={
                <Space>
                  {isEditing ? (
                    <>
                      <Tooltip title="Cancelar">
                        <Button 
                          onClick={handleCancel} 
                          size="small"
                          icon={<CloseOutlined />}
                          type="text"
                        />
                      </Tooltip>
                      <Tooltip title="Salvar">
                        <Button 
                          type="primary" 
                          icon={<SaveOutlined />}
                          onClick={() => form.submit()}
                          loading={loading}
                          disabled={!hasChanges}
                          size="small"
                        />
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip title="Editar">
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => setIsEditing(true)}
                        size="small"
                      />
                    </Tooltip>
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
              </Form>
            </Card>
          </Col>

          {/* Configurações de Segurança - apenas para usuários locais */}
          {user.authProvider === 'local' && (
            <Col xs={24} sm={12} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
              <Card 
                title={
                  <Space>
                    <div className={styles.authIcon}>
                      <LockOutlined />
                    </div>
                    <span>Segurança</span>
                  </Space>
                }
                className={componentStyles.professionalCard}
                bordered={false}
                style={{ height: '100%' }}
              >
                <Button 
                  block 
                  icon={<LockOutlined />}
                  onClick={() => setPasswordModalVisible(true)}
                  className={styles.securityButtonImproved}
                >
                  Alterar Senha
                </Button>
              </Card>
            </Col>
          )}

          {user.authProvider === 'google' && (
            <Col xs={24} sm={12} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
              <Card 
                title={
                  <Space>
                    <div className={styles.authIcon}>
                      <LockOutlined />
                    </div>
                    <span>Autenticação</span>
                  </Space>
                }
                className={componentStyles.professionalCard}
                bordered={false}
                style={{ height: '100%' }}
              >
                <div className={styles.authContent}>
                  <div className={styles.googleBadge}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <Text strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                      Conta Google
                    </Text>
                    <br />
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      Conectada via OAuth
                    </Text>
                  </div>
                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Para alterar sua senha, acesse sua conta do Google
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          )}

          <Col xs={24} sm={12} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
            <Card 
              title={
                <Space>
                  <div className={styles.infoIcon}>
                    <UserOutlined />
                  </div>
                  <span>Informações da Conta</span>
                </Space>
              }
              className={componentStyles.professionalCard}
              bordered={false}
              style={{ height: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      ID do Usuário
                    </Text>
                  </div>
                  <Text strong className={styles.infoValue}>
                    {user.id}
                  </Text>
                </div>
                <Divider style={{ margin: '12px 0', borderColor: 'rgba(139, 92, 246, 0.1)' }} />
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      Criado em
                    </Text>
                  </div>
                  <Text strong className={styles.infoValue}>
                    {new Date(user.createdAt || Date.now()).toLocaleString('pt-BR')}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6} style={{ display: 'flex', flexDirection: 'column' }}>
            <Card 
              className={styles.dangerCard}
              bordered={false}
              style={{ height: '100%' }}
            >
              <div className={styles.dangerContent}>
                <div className={styles.dangerIcon}>
                  <ExclamationCircleOutlined />
                </div>
                <Title level={5} style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Excluir Conta
                </Title>
                <Text className={styles.dangerText}>
                  Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                </Text>
                <Button 
                  danger 
                  block 
                  icon={<DeleteOutlined />}
                  onClick={() => setDeleteModalVisible(true)}
                  className={styles.deleteButton}
                >
                  Excluir Conta
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Alertas e Notificações */}
        {hasChanges && isEditing && (
          <div className={styles.alertWrapper}>
            <Alert
              message="Alterações não salvas"
              description="Você tem alterações não salvas. Clique em 'Salvar' para aplicá-las."
              type="warning"
              showIcon
              className={styles.unsavedChangesAlert}
            />
          </div>
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

        {/* Modal de Confirmação de Exclusão de Conta */}
        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>Confirmar Exclusão de Conta</span>
            </Space>
          }
          open={deleteModalVisible}
          onCancel={handleDeleteModalCancel}
          footer={[
            <Button key="cancel" onClick={handleDeleteModalCancel}>
              Cancelar
            </Button>,
            <Button 
              key="delete" 
              danger 
              type="primary"
              loading={deleteLoading}
              icon={<DeleteOutlined />}
              onClick={handleDeleteAccount}
            >
              Excluir Conta
            </Button>
          ]}
          width={500}
          centered
          style={{ top: 20 }}
        >
          <Alert
            message="Esta ação é irreversível"
            description={
              <div>
                <Text style={{ display: 'block', marginBottom: '12px', color: '#F9FAFB' }}>
                  Tem certeza que deseja excluir sua conta? Os seguintes dados serão removidos do nosso sistema:
                </Text>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#F9FAFB' }}>
                  <li style={{ color: '#F9FAFB', marginBottom: '8px' }}>Seu perfil e informações pessoais</li>
                  <li style={{ color: '#F9FAFB', marginBottom: '8px' }}>Credenciais de acesso</li>
                  <li style={{ color: '#F9FAFB', marginBottom: '8px' }}>Preferências de conta</li>
                </ul>
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(107, 114, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(107, 114, 128, 0.2)' }}>
                  <Text style={{ color: '#6B7280', fontSize: '12px', display: 'block' }}>
                    <strong style={{ color: '#F9FAFB' }}>Nota:</strong> Os registros de serviços e histórico armazenados na blockchain permanecerão intactos, pois são registros imutáveis e descentralizados.
                  </Text>
                </div>
              </div>
            }
            type="error"
            showIcon
          />
        </Modal>
      </div>
    </DefaultFrame>
  );
}