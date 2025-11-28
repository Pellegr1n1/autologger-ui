import { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Typography, message, Button } from 'antd';
import { 
  BlockOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './BlockchainPage.module.css';
import TransactionHistory from '../../features/blockchain/components/TransactionHistory';
import { BlockchainService } from '../../features/blockchain/services/blockchainService';
import { logger } from '../../shared/utils/logger';

const { Text } = Typography;

export default function BlockchainPage() {
  const [loading, setLoading] = useState(true);
  interface BlockchainData {
    totalTransactions: number;
    confirmedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    reliabilityScore: number;
    networkStatus: 'connected' | 'disconnected';
    averageConfirmationTime: number;
    lastSyncTime: Date;
  }

  const [blockchainData, setBlockchainData] = useState<BlockchainData>({
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

  interface DataConsistency {
    isConsistent: boolean;
    localTransactions: number;
    contractHashes: number;
  }

  const [dataConsistency, setDataConsistency] = useState<DataConsistency>({
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
          interface ServiceRecord {
            status: string;
            blockchainHash?: string;
          }
          
          const services: ServiceRecord[] = allServices || [];
          const totalTransactions = services.length;
          const confirmedTransactions = services.filter(service => service.status === 'CONFIRMED').length;
          const pendingTransactions = services.filter(service => service.status === 'PENDING' || service.status === 'SUBMITTED').length;
          const failedTransactions = services.filter(service => service.status === 'FAILED').length;
          const pendingServices = services.filter(service => 
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
          const confirmedServices = services.filter(service => service.status === 'CONFIRMED');
          let averageConfirmationTime = 0;
          
          if (confirmedServices.length > 0) {
            // Estimar tempo de confirmação baseado no número de transações
            // Em um sistema real, isso seria calculado a partir de timestamps reais
            // Usando uma estimativa fixa baseada no volume de transações
            const baseTime = 2;
            const volumeFactor = Math.min(1.5, confirmedServices.length * 0.01);
            averageConfirmationTime = Math.max(1, Math.min(5, baseTime + volumeFactor));
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
          logger.error('Erro ao carregar dados', besuError);
          
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
        logger.error('Erro geral ao carregar dados blockchain', error);
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
      logger.info('Iniciando sincronização dos serviços do usuário');
      
      // Sincronizar status de serviços falhados/rejeitados que estão na blockchain
      const syncResult = await BlockchainService.syncFailedServicesStatus();
      logger.info('Resultado da sincronização', syncResult);
      
      if (syncResult.corrected > 0) {
        message.success(`✅ ${syncResult.corrected} serviço(s) corrigido(s)! Status atualizado para CONFIRMED.`);
      } else if (syncResult.total > 0) {
        message.warning(`⚠️ ${syncResult.notFound} serviço(s) não encontrado(s) na blockchain. Eles podem ser reenviados.`);
      } else {
        message.info('Nenhum serviço para sincronizar.');
      }
      
      // Forçar verificação de todos os serviços do usuário na blockchain
      await BlockchainService.forceVerifyAllServices();
      
      // Corrigir hashes inválidos (pending-hash) dos serviços do usuário
      const fixResult = await BlockchainService.fixInvalidHashes();
      logger.info('Resultado da correção', fixResult);
      
      if (fixResult.successCount > 0) {
        message.info(`Corrigidos ${fixResult.successCount} hashes inválidos dos serviços do usuário`);
      }
      
      // Registrar hashes existentes no contrato (apenas dos serviços do usuário)
      const registerResult = await BlockchainService.registerAllExistingHashes();
      logger.info('Resultado do registro', registerResult);
      
      if (registerResult.successCount > 0) {
        message.info(`Registrados ${registerResult.successCount} hashes dos serviços do usuário no contrato`);
      }
      
      // Recarregar dados atualizados
      await loadBlockchainData();
      message.success('Serviços do usuário sincronizados e verificados com sucesso!');
    } catch (error) {
      logger.error('Erro ao sincronizar dados do usuário', error);
      message.error('Erro ao sincronizar dados do usuário');
    } finally {
      setSyncing(false);
    }
  };

  const { 
    totalTransactions, 
    confirmedTransactions, 
    failedTransactions,
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
                  title="Registros Falhados"
                  value={failedTransactions}
                  prefix={<CloseCircleOutlined style={{ color: 'var(--error-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Status"
                  value={(() => {
                    if (totalTransactions === 0) return 'Sem registros';
                    if (reliabilityScore >= 90) return 'Excelente';
                    if (reliabilityScore >= 70) return 'Bom';
                    return 'Atenção';
                  })()}
                  prefix={
                    <SafetyCertificateOutlined 
                      style={{ 
                        color: (() => {
                          if (totalTransactions === 0) return 'var(--text-secondary)';
                          if (reliabilityScore >= 90) return 'var(--success-color)';
                          if (reliabilityScore >= 70) return 'var(--warning-color)';
                          return 'var(--error-color)';
                        })()
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
