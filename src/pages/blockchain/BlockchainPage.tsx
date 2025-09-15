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
import DefaultFrame from '../../features/common/layout/Defaultframe';
import componentStyles from '../../features/common/layout/styles/Components.module.css';
import styles from './BlockchainPage.module.css';
import BlockchainOverview from '../../features/blockchain/components/BlockchainOverview';
import TransactionHistory from '../../features/blockchain/components/TransactionHistory';
import NetworkInfo from '../../features/blockchain/components/NetworkInfo';
import UserServicesStatus from '../../features/blockchain/components/UserServicesStatus';
import { BlockchainService, BesuNetworkInfo, BesuContractStats } from '../../services/api/blockchainService';

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
          
          // Verificar consistência com dados do contrato
          const contractTotalHashes = contractStats?.totalHashes || 0;
          // Aceitar pequena diferença (tolerância para hashes órfãos)
          const difference = Math.abs(totalTransactions - contractTotalHashes);
          const isDataConsistent = difference <= 2; // tolerância de 2 hashes órfãos
          
          setDataConsistency({
            isConsistent: isDataConsistent,
            localTransactions: totalTransactions,
            contractHashes: contractTotalHashes
          });
          
          if (!isDataConsistent) {
            console.warn(`⚠️ Inconsistência detectada: ${totalTransactions} transações locais vs ${contractTotalHashes} hashes no contrato (diferença: ${difference})`);
            // Só mostrar warning se a diferença for significativa
            if (difference > 2) {
              message.warning(`Dados inconsistentes: ${totalTransactions} transações locais vs ${contractTotalHashes} hashes no contrato (diferença: ${difference})`);
            }
          }
          
          const reliabilityScore = totalTransactions > 0 ? 
            Math.round((confirmedTransactions / totalTransactions) * 100) : 0;

          setBlockchainData({
            totalTransactions,
            confirmedTransactions,
            pendingTransactions,
            failedTransactions,
            reliabilityScore,
            networkStatus: connectionStatus.connected ? 'connected' : 'disconnected'
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
            networkStatus: 'disconnected'
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
          networkStatus: 'disconnected'
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
      console.log('🔄 Iniciando sincronização...');
      
      // Primeiro, verificar hashes órfãos
      const cleanResult = await BlockchainService.cleanOrphanHashes();
      console.log('🧹 Resultado da limpeza:', cleanResult);
      
      if (cleanResult.orphanCount > 0) {
        message.warning(`Detectados ${cleanResult.orphanCount} hashes órfãos no contrato`);
      }
      
      // Corrigir hashes inválidos (pending-hash)
      const fixResult = await BlockchainService.fixInvalidHashes();
      console.log('🔧 Resultado da correção:', fixResult);
      
      if (fixResult.successCount > 0) {
        message.info(`Corrigidos ${fixResult.successCount} hashes inválidos`);
      }
      
      // Registrar todos os hashes existentes no contrato
      const registerResult = await BlockchainService.registerAllExistingHashes();
      console.log('📝 Resultado do registro:', registerResult);
      
      message.info(`Registrados ${registerResult.successCount} hashes no contrato`);
      
      // Forçar verificação de todos os serviços na blockchain
      await BlockchainService.forceVerifyAllServices();
      
      // Recarregar dados atualizados
      await loadBlockchainData();
      message.success('Dados sincronizados e verificados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      message.error('Erro ao sincronizar dados');
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
                  ⚠️ Dados inconsistentes: {dataConsistency.localTransactions} locais vs {dataConsistency.contractHashes} contrato 
                  (diferença: {Math.abs(dataConsistency.localTransactions - dataConsistency.contractHashes)})
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

        {/* Informações da Rede Besu */}
        {besuData.networkInfo && (
          <div className={styles.statsSection}>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <Card className={componentStyles.professionalStatistic}>
                  <Statistic
                    title="Chain ID"
                    value={besuData.networkInfo.chainId}
                    prefix={<BlockOutlined style={{ color: 'var(--primary-color)' }} />}
                    valueStyle={{ color: 'var(--text-primary)' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className={componentStyles.professionalStatistic}>
                  <Statistic
                    title="Bloco Atual"
                    value={besuData.networkInfo.blockNumber}
                    prefix={<GlobalOutlined style={{ color: 'var(--info-color)' }} />}
                    valueStyle={{ color: 'var(--text-primary)' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className={componentStyles.professionalStatistic}>
                  <Statistic
                    title="Gas Price"
                    value={besuData.networkInfo.gasPrice}
                    suffix="gwei"
                    prefix={<SafetyCertificateOutlined style={{ color: 'var(--warning-color)' }} />}
                    valueStyle={{ color: 'var(--text-primary)' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card className={componentStyles.professionalStatistic}>
                  <Statistic
                    title="Hashes Registrados"
                    value={besuData.contractStats?.totalHashes || 0}
                    prefix={<LinkOutlined style={{ color: 'var(--success-color)' }} />}
                    valueStyle={{ color: 'var(--text-primary)' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}

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
                },
                {
                  key: 'services',
                  label: (
                    <Space>
                      <LinkOutlined style={{ color: 'var(--primary-color)' }} />
                      Serviços do Usuário
                    </Space>
                  ),
                  children: <UserServicesStatus />
                }
              ]}
            />
          </Card>
        </div>
      </div>
    </DefaultFrame>
  );
}
