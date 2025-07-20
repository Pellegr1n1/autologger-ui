import React from 'react';
import { Vehicle, VehicleStatus } from '../../../@types/vehicle.types';
import { VehicleService } from '../../../services/api/vehicleService';
import './VehicleCard.module.css';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onMarkAsSold?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
  showActions?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onEdit,
  onMarkAsSold,
  onDelete,
  onViewDetails,
  showActions = true
}) => {
  const isActive = vehicle.status === VehicleStatus.ACTIVE;
  const isSold = vehicle.status === VehicleStatus.SOLD;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getVehicleAge = () => {
    const currentYear = new Date().getFullYear();
    return currentYear - vehicle.year;
  };

  return (
    <div className={`vehicle-card ${isSold ? 'sold' : 'active'}`}>
      {/* Header do Card */}
      <div className="vehicle-header">
        <div className="vehicle-title">
          <h3>{vehicle.brand} {vehicle.model}</h3>
          <span className="vehicle-year">{vehicle.year}</span>
        </div>
        <div className={`status-badge ${vehicle.status}`}>
          {isActive ? 'Ativo' : 'Vendido'}
        </div>
      </div>

      {/* Informações principais */}
      <div className="vehicle-info">
        <div className="info-row">
          <div className="info-item">
            <span className="label">Placa:</span>
            <span className="value">{VehicleService.formatPlate(vehicle.plate)}</span>
          </div>
          <div className="info-item">
            <span className="label">Cor:</span>
            <span className="value">{vehicle.color}</span>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <span className="label">Quilometragem:</span>
            <span className="value">{VehicleService.formatMileage(vehicle.mileage)}</span>
          </div>
          <div className="info-item">
            <span className="label">Idade:</span>
            <span className="value">{getVehicleAge()} anos</span>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <span className="label">RENAVAM:</span>
            <span className="value">{VehicleService.formatRenavam(vehicle.renavam)}</span>
          </div>
          <div className="info-item">
            <span className="label">Cadastrado:</span>
            <span className="value">{formatDate(vehicle.createdAt)}</span>
          </div>
        </div>

        {isSold && vehicle.soldAt && (
          <div className="info-row">
            <div className="info-item">
              <span className="label">Vendido em:</span>
              <span className="value sold-date">{formatDate(vehicle.soldAt)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      {showActions && (
        <div className="vehicle-actions">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(vehicle)}
              className="btn btn-outline"
              title="Ver detalhes"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Detalhes
            </button>
          )}

          {isActive && onEdit && (
            <button
              onClick={() => onEdit(vehicle)}
              className="btn btn-primary"
              title="Editar veículo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </button>
          )}

          {isActive && onMarkAsSold && (
            <button
              onClick={() => onMarkAsSold(vehicle)}
              className="btn btn-success"
              title="Marcar como vendido"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Vendido
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(vehicle)}
              className="btn btn-danger"
              title="Excluir veículo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
              </svg>
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  );
};