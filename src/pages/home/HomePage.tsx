import styles from './Home.module.css';
import { Row, Col, Card, Typography, Button, Space, Divider, List } from 'antd';
import GlobalWireframe from "../../components/common/three/GlobalWireframe";
import { 
  ArrowRightOutlined, 
  CheckCircleOutlined, 
  EyeOutlined, 
  RobotOutlined, 
  SafetyOutlined, 
  DashboardOutlined, 
  LockOutlined, 
  SyncOutlined 
} from '@ant-design/icons';
import Footer from '../../components/common/layout/Footer';

const { Title, Text, Paragraph } = Typography;

export default function HomePage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Row align="middle">
            <Col span={12}>
              <Title level={3} className={styles.logo}>AutoLogger</Title>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Space>
                <Button type="text" href='/login'>Login</Button>
                <Button type="primary" href='/register'>Registrar</Button>
              </Space>
            </Col>
          </Row>
        </div>
      </header>

      <section className={styles.hero}>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <Title level={1} className={styles.heroTitle}>
              <span className={styles.heroTitleHighlight}>Revolucione</span> a Gestão Veicular com Blockchain
            </Title>
            <Paragraph className={styles.heroDescription}>
              A AutoLogger oferece uma solução inovadora para registro imutável de serviços e despesas automotivas, garantindo transparência e segurança através da tecnologia blockchain.
            </Paragraph>
            
            <Space size="large" className={styles.heroButtons}>
              <Button type="primary" size="large">
                Comece Agora <ArrowRightOutlined />
              </Button>
              <Button size="large">Saiba Mais</Button>
            </Space>

            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <Card className={styles.featureCard}>
                  <SafetyOutlined style={{ fontSize: 28, color: '#2F54EB' }} />
                  <Title level={4} style={{ marginTop: 16 }}>Imutável</Title>
                  <Text>Registros permanentes e à prova de fraudes</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className={styles.featureCard}>
                  <EyeOutlined style={{ fontSize: 28, color: '#722ED1' }} />
                  <Title level={4} style={{ marginTop: 16 }}>Transparente</Title>
                  <Text>Verificação por terceiros em tempo real</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className={styles.featureCard}>
                  <SyncOutlined style={{ fontSize: 28, color: '#13C2C2' }} />
                  <Title level={4} style={{ marginTop: 16 }}>Automático</Title>
                  <Text>Alertas e cálculos inteligentes</Text>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xs={24} md={12}>
              <GlobalWireframe />
          </Col>
        </Row>
      </section>

      <section className={styles.transformSection}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} className={styles.sectionTitle}>
            Como a <span className={styles.sectionTitleHighlight}>AutoLogger</span> Transforma a Gestão Veicular
          </Title>

          <Row gutter={[48, 48]}>
            <Col xs={24} md={12}>
              <Card className={styles.featureCard}>
                <div className={styles.featureCardHeader}>
                  <LockOutlined style={{ fontSize: 32, color: '#2F54EB', marginRight: 16 }} />
                  <Title level={3} style={{ margin: 0 }}>Registro Imutável</Title>
                </div>
                <Paragraph>
                  Cada serviço, abastecimento ou despesa é registrado na blockchain, criando um histórico permanente e à prova de adulterações.
                </Paragraph>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    'Proteção contra fraudes',
                    'Histórico completo do veículo',
                    'Valorização na revenda'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined style={{ color: '#52C41A' }} />}
                        description={item}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card className={styles.featureCard}>
                <div className={styles.featureCardHeader}>
                  <DashboardOutlined style={{ fontSize: 32, color: '#722ED1', marginRight: 16 }} />
                  <Title level={3} style={{ margin: 0 }}>Dashboard Inteligente</Title>
                </div>
                <Paragraph>
                  Visualize todos os dados do seu veículo em um painel intuitivo, com análises e relatórios automáticos.
                </Paragraph>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    'Custos por quilômetro',
                    'Manutenção programada',
                    'Alertas personalizados'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined style={{ color: '#52C41A' }} />}
                        description={item}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card className={styles.featureCard}>
                <div className={styles.featureCardHeader}>
                  <SafetyOutlined style={{ fontSize: 32, color: '#13C2C2', marginRight: 16 }} />
                  <Title level={3} style={{ margin: 0 }}>Integração com Mercado</Title>
                </div>
                <Paragraph>
                  Compradores e seguradoras podem verificar o histórico real do veículo, facilitando negociações e reduzindo riscos.
                </Paragraph>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    'Certificado de autenticidade',
                    'Relatórios para seguradoras',
                    'Valorização documentada'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined style={{ color: '#52C41A' }} />}
                        description={item}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card className={styles.featureCard}>
                <div className={styles.featureCardHeader}>
                  <RobotOutlined style={{ fontSize: 32, color: '#2F54EB', marginRight: 16 }} />
                  <Title level={3} style={{ margin: 0 }}>Smart Contracts</Title>
                </div>
                <Paragraph>
                  Automatize processos como cálculos de depreciação, alertas de manutenção e transferência de propriedade.
                </Paragraph>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    'Processos automáticos',
                    'Redução de burocracia',
                    'Segurança nas transações'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<CheckCircleOutlined style={{ color: '#52C41A' }} />}
                        description={item}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <Title level={2} className={styles.ctaTitle}>Pronto para transformar sua gestão veicular?</Title>
        <Paragraph className={styles.ctaDescription}>
          Cadastre-se agora e comece a registrar o histórico do seu veículo com a segurança da blockchain.
        </Paragraph>
        <Button type="primary" size="large" className={styles.ctaButton}>
          Comece Grátis
        </Button>
      </section>
      <Footer />
    </div>
  );
}