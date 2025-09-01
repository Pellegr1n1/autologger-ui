import React, { useState, useEffect } from 'react';
import { Card, Statistic, Space, Row, Col, Typography, Tabs, Empty } from 'antd';
import { 
  BlockOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  LinkOutlined
} from '@ant-design/icons';
import DefaultFrame from '../../features/common/layout/Defaultframe';
import componentStyles from '../../features/common/layout/styles/Components.module.css';
import styles from './BlockchainPage.module.css';
import BlockchainOverview from '../../features/blockchain/components/BlockchainOverview';
import TransactionHistory from '../../features/blockchain/components/TransactionHistory';
import NetworkInfo from '../../features/blockchain/components/NetworkInfo';

const { Text } = Typography;

export default function BlockchainPage() {
  const [loading, setLoading] = useState(true);
  const [blockchainData, setBlockchainData] = useState({
    totalTransactions: 0,
    confirmedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    reliabilityScore: 0,
    networkStatus: 'connected'
  });

  useEffect(() => {
    // Simular carregamento de dados blockchain
    const loadBlockchainData = async () => {
      try {
        setLoading(true);
        // Aqui você faria a chamada para sua API blockchain
        // Por enquanto, vamos simular dados
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setBlockchainData({
          totalTransactions: 156,
          confirmedTransactions: 142,
          pendingTransactions: 8,
          failedTransactions: 6,
          reliabilityScore: 91,
          networkStatus: 'connected'
        });
      } catch (error) {
        console.error('Erro ao carregar dados blockchain:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlockchainData();
  }, []);

  const { 
    totalTransactions, 
    confirmedTransactions, 
    pendingTransactions, 
    failedTransactions, 
    reliabilityScore,
    networkStatus 
  } = blockchainData;

  const confirmedPercentage = totalTransactions > 0 ? (confirmedTransactions / totalTransactions) * 100 : 0;
  const pendingPercentage = totalTransactions > 0 ? (pendingTransactions / totalTransactions) * 100 : 0;

  return (
    <DefaultFrame title="Blockchain" loading={loading}>
      {/* Header da página */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <BlockOutlined className={styles.headerIcon} />
            <div>
              <Text className={styles.headerTitle}>Dashboard Blockchain</Text>
              <Text className={styles.headerSubtitle}>
                Monitoramento em tempo real das transações na rede
              </Text>
            </div>
          </div>
          <div className={styles.networkStatus}>
            <div className={`${styles.statusIndicator} ${styles[networkStatus]}`} />
            <Text className={styles.statusText}>
              {networkStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </Text>
          </div>
        </div>
      </div>

      <div style={{ padding: '0' }}>
        {/* Estatísticas */}
        <div className={styles.statsSection}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Total de Transações"
                  value={totalTransactions}
                  prefix={<LinkOutlined style={{ color: 'var(--primary-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Confirmadas"
                  value={confirmedTransactions}
                  prefix={<CheckCircleOutlined style={{ color: 'var(--success-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Pendentes"
                  value={pendingTransactions}
                  prefix={<ClockCircleOutlined style={{ color: 'var(--warning-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Confiabilidade"
                  value={reliabilityScore}
                  suffix="%"
                  prefix={<SafetyCertificateOutlined style={{ color: 'var(--primary-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Conteúdo principal */}
        <div className={styles.contentSection}>
          <Card className={componentStyles.professionalCard}>
            <Tabs 
              defaultActiveKey="overview" 
              className={styles.blockchainTabs}
              items={[
                {
                  key: 'overview',
                  label: (
                    <Space>
                      <BlockOutlined style={{ color: 'var(--primary-color)' }} />
                      Visão Geral
                    </Space>
                  ),
                  children: <BlockchainOverview data={blockchainData} />
                },
                {
                  key: 'transactions',
                  label: (
                    <Space>
                      <LinkOutlined style={{ color: 'var(--primary-color)' }} />
                      Histórico de Transações
                    </Space>
                  ),
                  children: <TransactionHistory />
                },
                {
                  key: 'network',
                  label: (
                    <Space>
                      <GlobalOutlined style={{ color: 'var(--primary-color)' }} />
                      Informações da Rede
                    </Space>
                  ),
                  children: <NetworkInfo />
                }
              ]}
            />
          </Card>
        </div>
      </div>
    </DefaultFrame>
  );
}
