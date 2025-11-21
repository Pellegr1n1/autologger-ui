import { useState, useEffect, useCallback } from 'react';
import { VehicleService } from '../services/vehicleService';
import {
  Vehicle,
  UserVehicles,
  CreateVehicleData,
  UpdateVehicleData,
  MarkVehicleSoldData,
  VehicleStats
} from '../types/vehicle.types';

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

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await VehicleService.getUserVehicles();
      setVehicles(data);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao carregar veículos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await VehicleService.getActiveVehiclesStats();
      setStats(data);
    } catch (err: unknown) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  const createVehicle = useCallback(async (data: CreateVehicleData): Promise<Vehicle> => {
    try {
      setError(null);
      const newVehicle = await VehicleService.createVehicle(data);
      
      setVehicles(prev => ({
        ...prev,
        active: [newVehicle, ...prev.active]
      }));
      
      await fetchStats();
      
      return newVehicle;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao criar veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  const updateVehicle = useCallback(async (id: string, data: UpdateVehicleData): Promise<Vehicle> => {
    try {
      setError(null);
      const updatedVehicle = await VehicleService.updateVehicle(id, data);
      
      setVehicles(prev => ({
        active: prev.active.map(vehicle => 
          vehicle.id === id ? updatedVehicle : vehicle
        ),
        sold: prev.sold.map(vehicle => 
          vehicle.id === id ? updatedVehicle : vehicle
        )
      }));
      
      return updatedVehicle;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao atualizar veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const markAsSold = useCallback(async (id: string, data?: MarkVehicleSoldData): Promise<Vehicle> => {
    try {
      setError(null);
      const soldVehicle = await VehicleService.markVehicleAsSold(id, data);
      
      setVehicles(prev => ({
        active: prev.active.filter(vehicle => vehicle.id !== id),
        sold: [soldVehicle, ...prev.sold]
      }));
      
      await fetchStats();
      
      return soldVehicle;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao marcar veículo como vendido';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  const deleteVehicle = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await VehicleService.deleteVehicle(id);
      
      setVehicles(prev => ({
        active: prev.active.filter(vehicle => vehicle.id !== id),
        sold: prev.sold.filter(vehicle => vehicle.id !== id)
      }));
      
      await fetchStats();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao deletar veículo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchStats]);

  const refreshVehicles = useCallback(async () => {
    await fetchVehicles();
  }, [fetchVehicles]);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao carregar veículo';
      setError(errorMessage);
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