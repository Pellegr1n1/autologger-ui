import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleFormData, VehicleFormErrors, CreateVehicleData, UpdateVehicleData } from '../../../@types/vehicle.types';
import { VehicleValidation } from '../../../utils/vehicleValidation';
import './VehicleForm.module.css';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: CreateVehicleData | UpdateVehicleData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Salvar'
}) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    plate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    renavam: '',
    mileage: ''
  });

  const [errors, setErrors] = useState<VehicleFormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year.toString(),
        color: vehicle.color,
        renavam: vehicle.renavam,
        mileage: vehicle.mileage.toString()
      });
    }
  }, [vehicle]);

  // Atualizar campo
  const handleChange = (field: keyof VehicleFormData, value: string) => {
    let formattedValue = value;

    // Aplicar formatação específica
    switch (field) {
      case 'plate':
        formattedValue = VehicleValidation.formatPlateInput(value);
        break;
      case 'renavam':
        formattedValue = VehicleValidation.formatRenavamInput(value);
        break;
      case 'mileage':
        formattedValue = VehicleValidation.formatMileageInput(value);
        break;
      case 'brand':
      case 'model':
      case 'color':
        formattedValue = VehicleValidation.capitalizeWords(value);
        break;
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    // Validar campo em tempo real se já foi tocado
    if (touched[field]) {
      const fieldErrors = VehicleValidation.validateVehicleForm({
        ...formData,
        [field]: formattedValue
      });
      
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors[field]
      }));
    }
  };

  // Marcar campo como tocado
  const handleBlur = (field: keyof VehicleFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo
    const fieldErrors = VehicleValidation.validateVehicleForm(formData);
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors[field]
    }));
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos os campos
    const validationErrors = VehicleValidation.validateVehicleForm(formData);
    setErrors(validationErrors);

    // Marcar todos os campos como tocados
    const allTouched = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouched(allTouched);

    // Se há erros, não submeter
    if (VehicleValidation.hasErrors(validationErrors)) {
      return;
    }

    try {
      // Preparar dados para envio
      const submitData: CreateVehicleData | UpdateVehicleData = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year, 10),
        color: formData.color.trim(),
        mileage: formData.mileage ? VehicleValidation.parseFormattedNumber(formData.mileage) : 0
      };

      // Adicionar placa e RENAVAM apenas se for criação
      if (!vehicle) {
        (submitData as CreateVehicleData).plate = formData.plate.replace(/[^A-Z0-9]/g, '');
        (submitData as CreateVehicleData).renavam = formData.renavam.replace(/\D/g, '');
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="vehicle-form">
      <div className="form-grid">
        {/* Placa - apenas na criação */}
        {!vehicle && (
          <div className="form-group">
            <label htmlFor="plate">
              Placa <span className="required">*</span>
            </label>
            <input
              id="plate"
              type="text"
              value={formData.plate}
              onChange={(e) => handleChange('plate', e.target.value)}
              onBlur={() => handleBlur('plate')}
              placeholder="ABC-1234"
              maxLength={8}
              className={errors.plate && touched.plate ? 'error' : ''}
              disabled={loading}
            />
            {errors.plate && touched.plate && (
              <span className="error-message">{errors.plate}</span>
            )}
          </div>
        )}

        {/* Marca */}
        <div className="form-group">
          <label htmlFor="brand">
            Marca <span className="required">*</span>
          </label>
          <input
            id="brand"
            type="text"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            onBlur={() => handleBlur('brand')}
            placeholder="Ex: Toyota"
            maxLength={50}
            className={errors.brand && touched.brand ? 'error' : ''}
            disabled={loading}
          />
          {errors.brand && touched.brand && (
            <span className="error-message">{errors.brand}</span>
          )}
        </div>

        {/* Modelo */}
        <div className="form-group">
          <label htmlFor="model">
            Modelo <span className="required">*</span>
          </label>
          <input
            id="model"
            type="text"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            onBlur={() => handleBlur('model')}
            placeholder="Ex: Corolla"
            maxLength={50}
            className={errors.model && touched.model ? 'error' : ''}
            disabled={loading}
          />
          {errors.model && touched.model && (
            <span className="error-message">{errors.model}</span>
          )}
        </div>

        {/* Ano */}
        <div className="form-group">
          <label htmlFor="year">
            Ano <span className="required">*</span>
          </label>
          <input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
            onBlur={() => handleBlur('year')}
            placeholder="2020"
            min={1900}
            max={new Date().getFullYear() + 1}
            className={errors.year && touched.year ? 'error' : ''}
            disabled={loading}
          />
          {errors.year && touched.year && (
            <span className="error-message">{errors.year}</span>
          )}
        </div>

        {/* Cor */}
        <div className="form-group">
          <label htmlFor="color">
            Cor <span className="required">*</span>
          </label>
          <input
            id="color"
            type="text"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            onBlur={() => handleBlur('color')}
            placeholder="Ex: Branco"
            maxLength={30}
            className={errors.color && touched.color ? 'error' : ''}
            disabled={loading}
          />
          {errors.color && touched.color && (
            <span className="error-message">{errors.color}</span>
          )}
        </div>

        {/* RENAVAM - apenas na criação */}
        {!vehicle && (
          <div className="form-group">
            <label htmlFor="renavam">
              RENAVAM <span className="required">*</span>
            </label>
            <input
              id="renavam"
              type="text"
              value={formData.renavam}
              onChange={(e) => handleChange('renavam', e.target.value)}
              onBlur={() => handleBlur('renavam')}
              placeholder="123.456.789-01"
              maxLength={14}
              className={errors.renavam && touched.renavam ? 'error' : ''}
              disabled={loading}
            />
            {errors.renavam && touched.renavam && (
              <span className="error-message">{errors.renavam}</span>
            )}
          </div>
        )}

        {/* Quilometragem */}
        <div className="form-group">
          <label htmlFor="mileage">Quilometragem</label>
          <input
            id="mileage"
            type="text"
            value={formData.mileage}
            onChange={(e) => handleChange('mileage', e.target.value)}
            onBlur={() => handleBlur('mileage')}
            placeholder="50.000"
            className={errors.mileage && touched.mileage ? 'error' : ''}
            disabled={loading}
          />
          {errors.mileage && touched.mileage && (
            <span className="error-message">{errors.mileage}</span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || VehicleValidation.hasErrors(errors)}
        >
          {loading ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
};