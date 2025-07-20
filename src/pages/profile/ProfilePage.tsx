import React from 'react';
import { Card, Button, Form, Input, message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();

  const onFinish = async (values: any) => {
    try {
      await updateProfile(values);
      message.success('Perfil atualizado com sucesso!');
    } catch (error) {
      message.error('Erro ao atualizar perfil');
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: 24 }}>
      <Card title="Meu Perfil">
        <Form
          initialValues={{
            name: user.name,
            email: user.email,
            phone: user.phone,
          }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Telefone">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Atualizar Perfil
            </Button>
            <Button onClick={logout} style={{ marginLeft: 8 }}>
              Logout
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;