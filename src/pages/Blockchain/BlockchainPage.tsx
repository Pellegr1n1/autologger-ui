import { useState, useEffect } from 'react';
import { Card, Statistic, Space, Row, Col, Typography, Tabs, message, Button } from 'antd';
import { 
  BlockOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  LinkOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './BlockchainPage.module.css';
import BlockchainOverview from '../../features/blockchain/components/BlockchainOverview';
import TransactionHistory from '../../features/blockchain/components/TransactionHistory';
import NetworkInfo from '../../features/blockchain/components/NetworkInfo';
import { BlockchainService, BesuNetworkInfo, BesuContractStats } from '../../features/blockchain/services/blockchainService';

const { Text } = Typography;

export default function BlockchainPage() {
  const [loading, setLoading] = useState(true);
  const [blockchainData, setBlockchainData] = useState({
    totalTransactions: 0,
    confirmedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    reliabilityScore: 0,
    networkStatus: 'connected',
    averageConfirmationTime: 0,
    lastSyncTime: new Date()
  });

  const [besuData, setBesuData] = useState({
    connectionStatus: false,
    networkInfo: null as BesuNetworkInfo | null,
    contractStats: null as BesuContractStats | null,
    error: null as string | null
  });

  const [dataConsistency, setDataConsistency] = useState({
    isConsistent: true,
    localTransactions: 0,
    contractHashes: 0
  });

  const [syncing, setSyncing] = useState(false);

  const loadBlockchainData = async () => {
      try {
        setLoading(true);
        
        // Carregar dados da rede Besu primeiro
        try {
          const [connectionStatus, networkInfo, contractStats, allServices] = await Promise.all([
            BlockchainService.getBesuConnectionStatus(),
            BlockchainService.getBesuNetworkInfo().catch(() => null),
            BlockchainService.getBesuContractStats().catch(() => null),
            BlockchainService.getAllServices()
          ]);

          setBesuData({
            connectionStatus: connectionStatus.connected,
            networkInfo,
            contractStats,
            error: null
          });

          // Calcular estatísticas baseadas nos dados reais da blockchain
          const services = allServices || [];
          const totalTransactions = services.length;
          const confirmedTransactions = services.filter((service: any) => service.status === 'CONFIRMED').length;
          const pendingTransactions = services.filter((service: any) => service.status === 'PENDING' || service.status === 'SUBMITTED').length;
          const failedTransactions = services.filter((service: any) => service.status === 'FAILED').length;
          const contractTotalHashes = contractStats?.totalHashes || 0;
          
          const pendingServices = services.filter((service: any) => 
            service.status === 'PENDING' && service.blockchainHash && service.blockchainHash !== 'pending-hash'
          );
          
          const difference = totalTransactions > 0 ? pendingServices.length : 0;
          const isDataConsistent = totalTransactions === 0 || difference <= 1; // tolerância de 1 serviço pendente
          
          setDataConsistency({
            isConsistent: isDataConsistent,
            localTransactions: totalTransactions,
            contractHashes: contractTotalHashes
          });
          
          if (!isDataConsistent && totalTransactions > 0) {
            console.warn(`⚠️ Inconsistência detectada para o usuário: ${pendingServices.length} serviços pendentes que deveriam estar confirmados na blockchain`);
            
            if (difference > 1) {
              message.warning(`Dados inconsistentes: ${pendingServices.length} serviços do usuário pendentes na blockchain`);
            }
          }
          
          const reliabilityScore = totalTransactions > 0 ? 
            Math.round((confirmedTransactions / totalTransactions) * 100) : 0;

          // Calcular tempo médio de confirmação baseado nos serviços confirmados
          const confirmedServices = services.filter((service: any) => service.status === 'CONFIRMED');
          let averageConfirmationTime = 0;
          
          if (confirmedServices.length > 0) {
            // Simular tempo de confirmação baseado no número de transações
            // Em um sistema real, isso viria dos logs de confirmação
            averageConfirmationTime = Math.max(1.0, Math.min(5.0, 2.0 + (Math.random() * 2)));
          }

          setBlockchainData({
            totalTransactions,
            confirmedTransactions,
            pendingTransactions,
            failedTransactions,
            reliabilityScore,
            networkStatus: connectionStatus.connected ? 'connected' : 'disconnected',
            averageConfirmationTime,
            lastSyncTime: new Date()
          });

        } catch (besuError) {
          console.error('Erro ao carregar dados da rede Besu:', besuError);
          
          setBesuData({
            connectionStatus: false,
            networkInfo: null,
            contractStats: null,
            error: 'Rede Besu não disponível'
          });

          // Fallback para dados básicos
          setBlockchainData({
            totalTransactions: 0,
            confirmedTransactions: 0,
            pendingTransactions: 0,
            failedTransactions: 0,
            reliabilityScore: 0,
            networkStatus: 'disconnected',
            averageConfirmationTime: 0,
            lastSyncTime: new Date()
          });

          setDataConsistency({
            isConsistent: false,
            localTransactions: 0,
            contractHashes: 0
          });

          message.warning('Rede Besu não está disponível. Alguns recursos podem não funcionar.');
        }
      } catch (error) {
        console.error('Erro geral ao carregar dados blockchain:', error);
        message.error('Erro ao conectar com a blockchain. Verifique se a rede Besu está rodando.');
        
        // Fallback completo
        setBlockchainData({
          totalTransactions: 0,
          confirmedTransactions: 0,
          pendingTransactions: 0,
          failedTransactions: 0,
          reliabilityScore: 0,
          networkStatus: 'disconnected',
          averageConfirmationTime: 0,
          lastSyncTime: new Date()
        });

        setBesuData({
          connectionStatus: false,
          networkInfo: null,
          contractStats: null,
          error: 'Erro de conexão'
        });

        setDataConsistency({
          isConsistent: false,
          localTransactions: 0,
          contractHashes: 0
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      console.log('🔄 Iniciando sincronização dos serviços do usuário...');
      
      // Forçar verificação de todos os serviços do usuário na blockchain
      await BlockchainService.forceVerifyAllServices();
      
      // Corrigir hashes inválidos (pending-hash) dos serviços do usuário
      const fixResult = await BlockchainService.fixInvalidHashes();
      console.log('🔧 Resultado da correção:', fixResult);
      
      if (fixResult.successCount > 0) {
        message.info(`Corrigidos ${fixResult.successCount} hashes inválidos dos serviços do usuário`);
      }
      
      // Registrar hashes existentes no contrato (apenas dos serviços do usuário)
      const registerResult = await BlockchainService.registerAllExistingHashes();
      console.log('📝 Resultado do registro:', registerResult);
      
      if (registerResult.successCount > 0) {
        message.info(`Registrados ${registerResult.successCount} hashes dos serviços do usuário no contrato`);
      }
      
      // Recarregar dados atualizados
      await loadBlockchainData();
      message.success('Serviços do usuário sincronizados e verificados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar dados do usuário:', error);
      message.error('Erro ao sincronizar dados do usuário');
    } finally {
      setSyncing(false);
    }
  };

  const { 
    totalTransactions, 
    confirmedTransactions, 
    pendingTransactions, 
    reliabilityScore,
    networkStatus 
  } = blockchainData;


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
            {besuData.networkInfo && (
              <Text className={styles.networkInfo}>
                | Chain ID: {besuData.networkInfo.chainId} | Bloco: {besuData.networkInfo.blockNumber}
              </Text>
            )}
            {!dataConsistency.isConsistent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text className={styles.consistencyWarning}>
                  ⚠️ Dados inconsistentes: {Math.abs(dataConsistency.localTransactions - dataConsistency.contractHashes)} serviços do usuário pendentes na blockchain
                </Text>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<ReloadOutlined />}
                  loading={syncing}
                  onClick={handleSyncData}
                >
                  Sincronizar
                </Button>
              </div>
            )}
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
                  children: <BlockchainOverview data={blockchainData} besuData={besuData} />
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
