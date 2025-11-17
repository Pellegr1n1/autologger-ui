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
import type { ReactNode } from 'react';

const { Title, Text, Paragraph } = Typography;

const ICON_STYLES = {
  small: { fontSize: 28, color: '#8B5CF6' },
  large: { fontSize: 32, color: '#8B5CF6', marginRight: 16 }
};

const TEXT_STYLES = {
  white: { color: 'white' },
  whiteTitle: { marginTop: 16, color: 'white' },
  whiteTitleNoMargin: { margin: 0, color: 'white' },
  checkIcon: { color: '#52C41A' }
};

interface SimpleFeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function SimpleFeatureCard({ icon, title, description }: SimpleFeatureCardProps) {
  return (
    <Card className={styles.featureCard}>
      {icon}
      <Title level={4} style={TEXT_STYLES.whiteTitle}>{title}</Title>
      <Text style={TEXT_STYLES.white}>{description}</Text>
    </Card>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  items: string[];
}

function FeatureCard({ icon, title, description, items }: FeatureCardProps) {
  return (
    <Card className={styles.featureCard}>
      <div className={styles.featureCardHeader}>
        {icon}
        <Title level={3} style={TEXT_STYLES.whiteTitleNoMargin}>{title}</Title>
      </div>
      <Paragraph style={TEXT_STYLES.white}>{description}</Paragraph>
      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<CheckCircleOutlined style={TEXT_STYLES.checkIcon} />}
              description={item}
            />
          </List.Item>
        )}
      />
    </Card>
  );
}

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
                <SimpleFeatureCard
                  icon={<BlockOutlined style={ICON_STYLES.small} />}
                  title="Blockchain Real"
                  description="Hyperledger Besu - Imutabilidade garantida"
                />
              </Col>
              <Col xs={24} sm={8}>
                <SimpleFeatureCard
                  icon={<EyeOutlined style={ICON_STYLES.small} />}
                  title="Verificação Pública"
                  description="Qualquer pessoa pode verificar autenticidade"
                />
              </Col>
              <Col xs={24} sm={8}>
                <SimpleFeatureCard
                  icon={<BarChartOutlined style={ICON_STYLES.small} />}
                  title="Análises Inteligentes"
                  description="Relatórios e insights automáticos"
                />
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
              <FeatureCard
                icon={<BlockOutlined style={ICON_STYLES.large} />}
                title="Blockchain Privada Besu"
                description="Cada evento de manutenção gera um hash SHA-256 registrado imutavelmente na blockchain Hyperledger Besu, garantindo integridade permanente e impossibilidade de alteração."
                items={[
                  'Hash único e imutável por serviço',
                  'Verificação contínua na blockchain',
                  'Registros permanentes e transparentes'
                ]}
              />
            </Col>

            <Col xs={24} md={12}>
              <FeatureCard
                icon={<BarChartOutlined style={ICON_STYLES.large} />}
                title="Relatórios e Análises"
                description="Dashboard completo com gráficos interativos, comparações mensais e identificação de padrões de gastos para tomada de decisão inteligente."
                items={[
                  'Tendências de gastos e comparações',
                  'Top veículos e categorias que mais gastam',
                  'Gráficos interativos e exportação de dados'
                ]}
              />
            </Col>

            <Col xs={24} md={12}>
              <FeatureCard
                icon={<ShareAltOutlined style={ICON_STYLES.large} />}
                title="Compartilhamento Público"
                description="Gere links seguros e expiráveis para compartilhar histórico veicular. Compradores verificam autenticidade via blockchain sem necessidade de login."
                items={[
                  'Links únicos com expiração configurável',
                  'Página pública profissional e verificável',
                  'Bloqueio automático quando veículo é vendido'
                ]}
              />
            </Col>

            <Col xs={24} md={12}>
              <FeatureCard
                icon={<ToolOutlined style={ICON_STYLES.large} />}
                title="Gestão Completa de Histórico"
                description="Registre manutenções, despesas, abastecimentos e reparos com upload de comprovantes. Categorização automática e controle completo de custos."
                items={[
                  'Manutenções, despesas e abastecimentos',
                  'Upload de PDFs e imagens de comprovantes',
                  'Categorização automática e controle de quilometragem'
                ]}
              />
            </Col>
          </Row>
        </div>
      </section>
      <Footer />
    </div>
  );
}