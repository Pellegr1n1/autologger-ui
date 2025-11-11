import styles from './Home.module.css';
import { Row, Col, Card, Typography, Button, Space, List } from 'antd';
import { GlobalWireframe } from "../../components/common";
import {
  CheckCircleOutlined,
  EyeOutlined,
  BarChartOutlined,
  ShareAltOutlined,
  ToolOutlined,
  BlockOutlined
} from '@ant-design/icons';
import { Footer } from '../../components/layout';

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
                <Button type="text" href='/login' style={{ color: 'white' }}>Login</Button>
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

            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <Card className={styles.featureCard}>
                  <BlockOutlined style={{ fontSize: 28, color: '#8B5CF6' }} />
                  <Title level={4} style={{ marginTop: 16, color: 'white' }}>Blockchain Real</Title>
                  <Text style={{ color: 'white' }}>Hyperledger Besu - Imutabilidade garantida</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className={styles.featureCard}>
                  <EyeOutlined style={{ fontSize: 28, color: '#8B5CF6' }} />
                  <Title level={4} style={{ marginTop: 16, color: 'white' }}>Verificação Pública</Title>
                  <Text style={{ color: 'white' }}>Qualquer pessoa pode verificar autenticidade</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className={styles.featureCard}>
                  <BarChartOutlined style={{ fontSize: 28, color: '#8B5CF6' }} />
                  <Title level={4} style={{ marginTop: 16, color: 'white' }}>Análises Inteligentes</Title>
                  <Text style={{ color: 'white' }}>Relatórios e insights automáticos</Text>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xs={24} md={12}>
            <div className={styles.threeDContainer}>
              <GlobalWireframe />
            </div>
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
                  <BlockOutlined style={{ fontSize: 32, color: '#8B5CF6', marginRight: 16 }} />
                  <Title level={3} style={{ margin: 0, color: 'white' }}>Blockchain Privada Besu</Title>
                </div>
                <Paragraph style={{ color: 'white' }}>
                  Cada evento de manutenção gera um hash SHA-256 registrado imutavelmente na blockchain Hyperledger Besu, garantindo integridade permanente e impossibilidade de alteração.
                </Paragraph>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    'Hash único e imutável por serviço',
                    'Verificação contínua na blockchain',
                    'Registros permanentes e transparentes'
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
                  <BarChartOutlined style={{ fontSize: 32, color: '#8B5CF6', marginRight: 16 }} />
                  <Title level={3} style={{ margin: 0, color: 'white' }}>Relatórios e Análises</Title>
                </div>
                <Paragraph style={{ color: 'white' }}>
                  Dashboard completo com gráficos interativos, comparações mensais e identificação de padrões de gastos para tomada de decisão inteligente.
                </Paragraph>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    'Tendências de gastos e comparações',
                    'Top veículos e categorias que mais gastam',
                    'Gráficos interativos e exportação de dados'
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
                  <ShareAltOutlined style={{ fontSize: 32, color: '#8B5CF6', marginRight: 16 }} />
                  <Title level={3} style={{ margin: 0, color: 'white' }}>Compartilhamento Público</Title>
                </div>
                <Paragraph style={{ color: 'white' }}>
                  Gere links seguros e expiráveis para compartilhar histórico veicular. Compradores verificam autenticidade via blockchain sem necessidade de login.
                </Paragraph>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    'Links únicos com expiração configurável',
                    'Página pública profissional e verificável',
                    'Bloqueio automático quando veículo é vendido'
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
                  <ToolOutlined style={{ fontSize: 32, color: '#8B5CF6', marginRight: 16 }} />
                  <Title level={3} style={{ margin: 0, color: 'white' }}>Gestão Completa de Histórico</Title>
                </div>
                <Paragraph style={{ color: 'white' }}>
                  Registre manutenções, despesas, abastecimentos e reparos com upload de comprovantes. Categorização automática e controle completo de custos.
                </Paragraph>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    'Manutenções, despesas e abastecimentos',
                    'Upload de PDFs e imagens de comprovantes',
                    'Categorização automática e controle de quilometragem'
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
      <Footer />
    </div>
  );
}