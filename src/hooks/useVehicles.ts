import { useState, useEffect, useCallback } from 'react';
import { VehicleService } from '../services/api/vehicleService';
import {
  Vehicle,
  UserVehicles,
  CreateVehicleData,
  UpdateVehicleData,
  MarkVehicleSoldData,
  VehicleStats
} from '../@types/vehicle.types';

interface UseVehiclesReturn {
  vehicles: UserVehicles;
  stats: VehicleStats | null;
  loading: boolean;
  error: string | null;
  createVehicle: (data: CreateVehicleData) => Promise<Vehicle>;
  updateVehicle: (id: string, data: UpdateVehicleData) => Promise<Vehicle>;
  markAsSold: (id: string, data?: MarkVehicleSoldData) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
  refreshVehicles: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

export const useVehicles = (): UseVehiclesReturn => {
  const [vehicles, setVehicles] = useState<UserVehicles>({
    active: [],
    sold: []
  });
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar veículos do usuário
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await VehicleService.getUserVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const data = await VehicleService.getActiveVehiclesStats();
      setStats(data);
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  // Criar novo veículo
  const createVehicle = useCallback(async (data: CreateVehicleData): Promise<Vehicle> => {
    try {
      setError(null);
      const newVehicle = await VehicleService.createVehicle(data);
      
      // Atualizar lista local
      setVehicles(prev => ({
        ...prev,
        active: [newVehicle, ...prev.active]
      }));
      
      // Atualizar estatísticas
      await fetchStats();
      
      return newVehicle;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  // Atualizar veículo
  const updateVehicle = useCallback(async (id: string, data: UpdateVehicleData): Promise<Vehicle> => {
    try {
      setError(null);
      const updatedVehicle = await VehicleService.updateVehicle(id, data);
      
      // Atualizar lista local
      setVehicles(prev => ({
        active: prev.active.map(vehicle => 
          vehicle.id === id ? updatedVehicle : vehicle
        ),
        sold: prev.sold.map(vehicle => 
          vehicle.id === id ? updatedVehicle : vehicle
        )
      }));
      
      return updatedVehicle;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Marcar como vendido
  const markAsSold = useCallback(async (id: string, data?: MarkVehicleSoldData): Promise<Vehicle> => {
    try {
      setError(null);
      const soldVehicle = await VehicleService.markVehicleAsSold(id, data);
      
      // Mover veículo da lista ativa para vendidos
      setVehicles(prev => ({
        active: prev.active.filter(vehicle => vehicle.id !== id),
        sold: [soldVehicle, ...prev.sold]
      }));
      
      // Atualizar estatísticas
      await fetchStats();
      
      return soldVehicle;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao marcar veículo como vendido';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  // Deletar veículo
  const deleteVehicle = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await VehicleService.deleteVehicle(id);
      
      // Remover da lista local
      setVehicles(prev => ({
        active: prev.active.filter(vehicle => vehicle.id !== id),
        sold: prev.sold.filter(vehicle => vehicle.id !== id)
      }));
      
      // Atualizar estatísticas
      await fetchStats();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao deletar veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  // Recarregar veículos
  const refreshVehicles = useCallback(async () => {
    await fetchVehicles();
  }, [fetchVehicles]);

  // Recarregar estatísticas
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    fetchVehicles();
    fetchStats();
  }, [fetchVehicles, fetchStats]);

  return {
    vehicles,
    stats,
    loading,
    error,
    createVehicle,
    updateVehicle,
    markAsSold,
    deleteVehicle,
    refreshVehicles,
    refreshStats,
    clearError
  };
};

// Hook para gerenciar um veículo específico
interface UseVehicleReturn {
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  fetchVehicle: () => Promise<void>;
  clearError: () => void;
}

export const useVehicle = (vehicleId: string): UseVehicleReturn => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await VehicleService.getVehicleById(vehicleId);
      setVehicle(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar veículo');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  return {
    vehicle,
    loading,
    error,
    fetchVehicle,
    clearError
  };
};