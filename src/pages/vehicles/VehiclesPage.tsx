import React, { useState } from 'react';
import { Vehicle, CreateVehicleData, UpdateVehicleData } from '../../@types/vehicle.types';
import { useVehicles } from '../../hooks/useVehicles';
import { VehicleList } from '../../components/vehicle/VehicleList/VehicleList';
import { VehicleForm } from '../../components/vehicle/VehicleForm/VehicleForm';
import { VehicleModal } from '../../components/vehicle/VehicleModal/VehicleModal';
import './VehiclesPage.css';

type ModalType = 'create' | 'edit' | 'markSold' | 'delete' | 'details' | null;

export const VehiclesPage: React.FC = () => {
  const {
    vehicles,
    stats,
    loading,
    error,
    createVehicle,
    updateVehicle,
    markAsSold,
    deleteVehicle,
    clearError
  } = useVehicles();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNew = () => {
    setSelectedVehicle(null);
    setModalType('create');
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalType('edit');
  };

  const handleMarkAsSold = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalType('markSold');
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalType('delete');
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalType('details');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedVehicle(null);
    clearError();
  };

  const handleCreateVehicle = async (data: CreateVehicleData) => {
    try {
      setIsSubmitting(true);
      await createVehicle(data);
      handleCloseModal();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVehicle = async (data: UpdateVehicleData) => {
    if (!selectedVehicle) return;

    try {
      setIsSubmitting(true);
      const updateData: UpdateVehicleData = {
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        mileage: data.mileage
      };
      await updateVehicle(selectedVehicle.id, updateData);
      handleCloseModal();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSale = async () => {
    if (!selectedVehicle) return;

    try {
      setIsSubmitting(true);
      await markAsSold(selectedVehicle.id);
      handleCloseModal();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedVehicle) return;

    try {
      setIsSubmitting(true);
      await deleteVehicle(selectedVehicle.id);
      handleCloseModal();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vehicles-page">
      <div className="page-container">
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
              <button onClick={clearError} className="error-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        <VehicleList
          activeVehicles={vehicles.active}
          soldVehicles={vehicles.sold}
          stats={stats}
          loading={loading}
          onEdit={handleEdit}
          onMarkAsSold={handleMarkAsSold}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onAddNew={handleAddNew}
        />

        {modalType === 'create' && (
          <VehicleModal
            title="Cadastrar Novo Veículo"
            isOpen={true}
            onClose={handleCloseModal}
            size="large"
          >
            <VehicleForm
              onSubmit={handleCreateVehicle}
              onCancel={handleCloseModal}
              loading={isSubmitting}
              submitLabel="Cadastrar Veículo"
            />
          </VehicleModal>
        )}

        {modalType === 'edit' && selectedVehicle && (
          <VehicleModal
            title="Editar Veículo"
            isOpen={true}
            onClose={handleCloseModal}
            size="large"
          >
            <VehicleForm
              vehicle={selectedVehicle}
              onSubmit={handleUpdateVehicle}
              onCancel={handleCloseModal}
              loading={isSubmitting}
              submitLabel="Salvar Alterações"
            />
          </VehicleModal>
        )}

        {modalType === 'markSold' && selectedVehicle && (
          <VehicleModal
            title="Marcar como Vendido"
            isOpen={true}
            onClose={handleCloseModal}
            size="medium"
          >
            <div className="confirmation-modal">
              <div className="confirmation-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <h3>Confirmar Venda</h3>
              <p>
                Tem certeza que deseja marcar o veículo{' '}
                <strong>{selectedVehicle.brand} {selectedVehicle.model}</strong>{' '}
                como vendido?
              </p>
              <p className="warning-text">
                Esta ação não pode ser desfeita e o veículo será movido para a seção de vendidos.
              </p>
              <div className="confirmation-actions">
                <button
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSale}
                  className="btn btn-success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processando...' : 'Confirmar Venda'}
                </button>
              </div>
            </div>
          </VehicleModal>
        )}

        {modalType === 'delete' && selectedVehicle && (
          <VehicleModal
            title="Excluir Veículo"
            isOpen={true}
            onClose={handleCloseModal}
            size="medium"
          >
            <div className="confirmation-modal danger">
              <div className="confirmation-icon danger">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                </svg>
              </div>
              <h3>Excluir Veículo</h3>
              <p>
                Tem certeza que deseja excluir permanentemente o veículo{' '}
                <strong>{selectedVehicle.brand} {selectedVehicle.model}</strong>?
              </p>
              <p className="warning-text">
                Esta ação é irreversível e todos os dados do veículo serão perdidos.
              </p>
              <div className="confirmation-actions">
                <button
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="btn btn-danger"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </div>
            </div>
          </VehicleModal>
        )}

        {modalType === 'details' && selectedVehicle && (
          <VehicleModal
            title="Detalhes do Veículo"
            isOpen={true}
            onClose={handleCloseModal}
            size="large"
          >
            <div className="vehicle-details">
              <div className="details-header">
                <h3>{selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.year}</h3>
                <div className={`status-badge ${selectedVehicle.status}`}>
                  {selectedVehicle.status === 'active' ? 'Ativo' : 'Vendido'}
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Placa:</label>
                  <span>{selectedVehicle.plate}</span>
                </div>
                <div className="detail-item">
                  <label>Marca:</label>
                  <span>{selectedVehicle.brand}</span>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <span>{selectedVehicle.model}</span>
                </div>
                <div className="detail-item">
                  <label>Ano:</label>
                  <span>{selectedVehicle.year}</span>
                </div>
                <div className="detail-item">
                  <label>Cor:</label>
                  <span>{selectedVehicle.color}</span>
                </div>
                <div className="detail-item">
                  <label>RENAVAM:</label>
                  <span>{selectedVehicle.renavam}</span>
                </div>
                <div className="detail-item">
                  <label>Quilometragem:</label>
                  <span>{selectedVehicle.mileage.toLocaleString('pt-BR')} km</span>
                </div>
                <div className="detail-item">
                  <label>Cadastrado em:</label>
                  <span>{new Date(selectedVehicle.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                {selectedVehicle.soldAt && (
                  <div className="detail-item">
                    <label>Vendido em:</label>
                    <span>{new Date(selectedVehicle.soldAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>

              <div className="details-actions">
                <button
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Fechar
                </button>
                {selectedVehicle.status === 'active' && (
                  <button
                    onClick={() => {
                      handleCloseModal();
                      handleEdit(selectedVehicle);
                    }}
                    className="btn btn-primary"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </VehicleModal>
        )}
      </div>
    </div>
  );
};

export default VehiclesPage;