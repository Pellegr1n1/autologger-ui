import { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Typography, message, Button } from 'antd';
import { 
  BlockOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './BlockchainPage.module.css';
import TransactionHistory from '../../features/blockchain/components/TransactionHistory';
import { BlockchainService } from '../../features/blockchain/services/blockchainService';

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

  const [connectionStatus, setConnectionStatus] = useState(false);

  const [dataConsistency, setDataConsistency] = useState({
    isConsistent: true,
    localTransactions: 0,
    contractHashes: 0
  });

  const [syncing, setSyncing] = useState(false);

  const loadBlockchainData = async () => {
      try {
        setLoading(true);
        
        // Carregar dados básicos
        try {
          const [connectionStatusResponse, allServices] = await Promise.all([
            BlockchainService.getBesuConnectionStatus(),
            BlockchainService.getAllServices()
          ]);

          setConnectionStatus(connectionStatusResponse.connected);

          // Calcular estatísticas baseadas nos dados reais da blockchain
          const services = allServices || [];
          const totalTransactions = services.length;
          const confirmedTransactions = services.filter((service: any) => service.status === 'CONFIRMED').length;
          const pendingTransactions = services.filter((service: any) => service.status === 'PENDING' || service.status === 'SUBMITTED').length;
          const failedTransactions = services.filter((service: any) => service.status === 'FAILED').length;
          const pendingServices = services.filter((service: any) => 
            service.status === 'PENDING' && service.blockchainHash && service.blockchainHash !== 'pending-hash'
          );
          
          const difference = totalTransactions > 0 ? pendingServices.length : 0;
          const isDataConsistent = totalTransactions === 0 || difference <= 1;
          
          setDataConsistency({
            isConsistent: isDataConsistent,
            localTransactions: totalTransactions,
            contractHashes: totalTransactions
          });
          
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
            networkStatus: connectionStatusResponse.connected ? 'connected' : 'disconnected',
            averageConfirmationTime,
            lastSyncTime: new Date()
          });

        } catch (besuError) {
          console.error('Erro ao carregar dados:', besuError);
          
          setConnectionStatus(false);

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

        setConnectionStatus(false);

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
      {/* Header simplificado */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <BlockOutlined className={styles.headerIcon} />
            <div>
              <Text className={styles.headerTitle}>Registros Protegidos</Text>
              <Text className={styles.headerSubtitle}>
                Seus registros de manutenção protegidos por blockchain
              </Text>
            </div>
          </div>
          <div className={styles.networkStatus}>
            <div className={`${styles.statusIndicator} ${styles[networkStatus]}`} />
            <Text className={styles.statusText}>
              {connectionStatus ? 'Sistema ativo' : 'Sistema indisponível'}
            </Text>
            {!dataConsistency.isConsistent && (
              <Button 
                type="primary" 
                size="small" 
                icon={<ReloadOutlined />}
                loading={syncing}
                onClick={handleSyncData}
                style={{ marginLeft: '12px' }}
              >
                Sincronizar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '0' }}>
        {/* Estatísticas simplificadas - apenas o essencial */}
        <div className={styles.statsSection}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Registros Protegidos"
                  value={confirmedTransactions}
                  prefix={<CheckCircleOutlined style={{ color: 'var(--success-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                  suffix={`de ${totalTransactions}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Aguardando Confirmação"
                  value={pendingTransactions}
                  prefix={<ClockCircleOutlined style={{ color: 'var(--warning-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Status"
                  value={
                    totalTransactions === 0 
                      ? 'Sem registros' 
                      : reliabilityScore >= 90 
                        ? 'Excelente' 
                        : reliabilityScore >= 70 
                          ? 'Bom' 
                          : 'Atenção'
                  }
                  prefix={
                    <SafetyCertificateOutlined 
                      style={{ 
                        color: totalTransactions === 0
                          ? 'var(--text-secondary)' 
                          : reliabilityScore >= 90 
                            ? 'var(--success-color)' 
                            : reliabilityScore >= 70 
                              ? 'var(--warning-color)' 
                              : 'var(--error-color)' 
                      }} 
                    />
                  }
                  valueStyle={{ color: 'var(--text-primary)', fontSize: '20px' }}
                />
              </Card>
            </Col>
          </Row>
        </div>


        {/* Conteúdo principal - apenas histórico de transações */}
        <div className={styles.contentSection}>
          <Card className={componentStyles.professionalCard}>
            <TransactionHistory />
          </Card>
        </div>
      </div>
    </DefaultFrame>
  );
}
