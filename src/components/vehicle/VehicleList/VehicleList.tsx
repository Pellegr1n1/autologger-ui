import React, { useState } from 'react';
import { Vehicle, VehicleStats } from '../../../@types/vehicle.types';
import { VehicleCard } from '../VehicleCard/VehicleCard';
import './VehicleList.module.css';

interface VehicleListProps {
  activeVehicles: Vehicle[];
  soldVehicles: Vehicle[];
  stats?: VehicleStats | null;
  loading?: boolean;
  onEdit?: (vehicle: Vehicle) => void;
  onMarkAsSold?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
  onAddNew?: () => void;
}

type TabType = 'active' | 'sold';

export const VehicleList: React.FC<VehicleListProps> = ({
  activeVehicles,
  soldVehicles,
  stats,
  loading = false,
  onEdit,
  onMarkAsSold,
  onDelete,
  onViewDetails,
  onAddNew
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderEmptyState = (type: TabType) => {
    const isActive = type === 'active';
    
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 17L17 7"/>
            <path d="M17 17H7V7"/>
          </svg>
        </div>
        <h3>
          {isActive ? 'Nenhum veículo ativo' : 'Nenhum veículo vendido'}
        </h3>
        <p>
          {isActive 
            ? 'Você ainda não cadastrou nenhum veículo.' 
            : 'Você ainda não vendeu nenhum veículo.'
          }
        </p>
        {isActive && onAddNew && stats?.canAddMore && (
          <button onClick={onAddNew} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Cadastrar Primeiro Veículo
          </button>
        )}
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Carregando veículos...</p>
    </div>
  );

  const renderVehicleGrid = (vehicles: Vehicle[]) => (
    <div className="vehicle-grid">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onEdit={onEdit}
          onMarkAsSold={onMarkAsSold}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          showActions={true}
        />
      ))}
    </div>
  );

  const currentVehicles = activeTab === 'active' ? activeVehicles : soldVehicles;

  return (
    <div className="vehicle-list">
      {/* Header com estatísticas */}
      <div className="list-header">
        <div className="header-info">
          <h2>Meus Veículos</h2>
          {stats && (
            <div className="stats-summary">
              <span className="stat-item">
                <strong>{stats.count}</strong> de <strong>{stats.limit}</strong> ativos
              </span>
              {stats.canAddMore ? (
                <span className="stat-status available">
                  Pode adicionar mais {stats.limit - stats.count}
                </span>
              ) : (
                <span className="stat-status limit-reached">
                  Limite atingido
                </span>
              )}
            </div>
          )}
        </div>
        
        {onAddNew && stats?.canAddMore && (
          <button onClick={onAddNew} className="btn btn-primary add-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Veículo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <div className="tab-list">
          <button
            className={`tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => handleTabChange('active')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Ativos ({activeVehicles.length})
          </button>
          <button
            className={`tab ${activeTab === 'sold' ? 'active' : ''}`}
            onClick={() => handleTabChange('sold')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            Vendidos ({soldVehicles.length})
          </button>
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="tab-content">
        {loading ? (
          renderLoadingState()
        ) : currentVehicles.length === 0 ? (
          renderEmptyState(activeTab)
        ) : (
          renderVehicleGrid(currentVehicles)
        )}
      </div>

      {/* Informações adicionais */}
      {!loading && currentVehicles.length > 0 && (
        <div className="list-footer">
          <div className="footer-stats">
            <span>
              {currentVehicles.length} veículo{currentVehicles.length !== 1 ? 's' : ''} 
              {activeTab === 'active' ? ' ativo' : ' vendido'}{currentVehicles.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};