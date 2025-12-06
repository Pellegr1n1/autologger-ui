import { useEffect, useCallback, useRef } from 'react';
import { notification } from 'antd';
import { BlockchainService, IntegrityStatus } from '../services/blockchainService';
import { VehicleEvent } from '../../vehicles/types/vehicle.types';

interface UseIntegrityVerificationOptions {
  enabled?: boolean;
  checkInterval?: number; // em milissegundos
  showNotifications?: boolean;
}

/**
 * Hook para verificar integridade de serviços e mostrar alertas quando violação é detectada
 */
export const useIntegrityVerification = (
  services: VehicleEvent[],
  options: UseIntegrityVerificationOptions = {}
) => {
  const {
    enabled = true,
    checkInterval = 60000, // 1 minuto por padrão
    showNotifications = true,
  } = options;

  const checkedServicesRef = useRef<Set<string>>(new Set());
  const notificationKeysRef = useRef<Map<string, string>>(new Map());

  const checkServiceIntegrity = useCallback(
    async (service: VehicleEvent) => {
      // Só verificar serviços confirmados na blockchain
      if (
        (!service.hash && !service.confirmationHash) ||
        service.blockchainStatus?.status !== 'CONFIRMED' ||
        !service.id
      ) {
        return;
      }

      // Evitar verificar o mesmo serviço múltiplas vezes rapidamente
      if (checkedServicesRef.current.has(service.id)) {
        return;
      }

      try {
        const result = await BlockchainService.verifyServiceIntegrity(service.id);

        // Marcar como verificado
        checkedServicesRef.current.add(service.id);

        // Se violado, mostrar alerta
        if (
          result.integrityStatus === IntegrityStatus.VIOLATED &&
          showNotifications
        ) {
          const notificationKey = `integrity-violated-${service.id}`;

          // Evitar múltiplas notificações para o mesmo serviço
          if (notificationKeysRef.current.has(notificationKey)) {
            return;
          }

          notificationKeysRef.current.set(notificationKey, notificationKey);

          notification.error({
            key: notificationKey,
            message: '⚠️ Integridade Violada Detectada',
            description: (
              <div>
                <p>
                  <strong>Serviço:</strong> {service.category} - {service.description.substring(0, 50)}
                  {service.description.length > 50 ? '...' : ''}
                </p>
                <p>
                  <strong>Veículo:</strong> {service.vehicleId}
                </p>
                <p style={{ color: '#ff4d4f', fontWeight: 600 }}>
                  {result.message}
                </p>
                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                  O serviço foi alterado após ser registrado na blockchain.
                </p>
              </div>
            ),
            duration: 0, // Não fecha automaticamente
            placement: 'topRight',
            btn: (
              <button
                onClick={() => {
                  notification.destroy(notificationKey);
                  notificationKeysRef.current.delete(notificationKey);
                }}
                style={{
                  background: '#ff4d4f',
                  color: 'white',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Fechar
              </button>
            ),
          });
        }
      } catch (error) {
        console.error(`Erro ao verificar integridade do serviço ${service.id}:`, error);
      }
    },
    [showNotifications]
  );

  const checkAllServices = useCallback(async () => {
    if (!enabled || services.length === 0) {
      return;
    }

    // Verificar apenas serviços confirmados que ainda não foram verificados
    const servicesToCheck = services.filter(
      (service) =>
        (service.hash || service.confirmationHash) &&
        service.blockchainStatus?.status === 'CONFIRMED' &&
        service.integrityStatus !== IntegrityStatus.VALID &&
        !checkedServicesRef.current.has(service.id)
    );

    // Verificar em lote (máximo 5 por vez para não sobrecarregar)
    const batchSize = 5;
    for (let i = 0; i < servicesToCheck.length; i += batchSize) {
      const batch = servicesToCheck.slice(i, i + batchSize);
      await Promise.all(batch.map((service) => checkServiceIntegrity(service)));
      
      // Pequeno delay entre lotes
      if (i + batchSize < servicesToCheck.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }, [enabled, services, checkServiceIntegrity]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Verificação inicial
    checkAllServices();

    // Configurar verificação periódica
    const intervalId = setInterval(() => {
      checkAllServices();
    }, checkInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, checkInterval, checkAllServices]);

  return {
    checkServiceIntegrity,
    checkAllServices,
  };
};
