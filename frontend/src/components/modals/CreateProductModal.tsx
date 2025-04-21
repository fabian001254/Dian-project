import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import axios from 'axios';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: {
    name: string;
    description: string;
    price: number;
    taxRate: number;
    vendorId: string;
  }) => void;
  vendorId?: string; // ID del vendedor seleccionado
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-text);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  
  &:hover {
    color: var(--color-text);
  }
`;

const ModalBody = styled.div`
  padding: var(--spacing-md);
  overflow-y: auto;
  flex: 1;
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
`;

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vendorId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    taxRate: 19,
    vendorId: vendorId || ''
  });
  
  const [vendors, setVendors] = useState<Array<{id: string, firstName: string, lastName: string}>>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    vendorId?: string;
  }>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'taxRate' ? parseFloat(value) || 0 : value
    }));
    
    // Limpiar error cuando el usuario corrige el campo
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Cargar vendedores cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadVendors();
    }
  }, [isOpen]);

  // Función para cargar los vendedores desde la API
  const loadVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await axios.get('/api/users', { params: { role: 'vendor' } });
      if (response.data && response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando vendedores:', error);
    } finally {
      setLoadingVendors(false);
    }
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      description?: string;
      price?: string;
      vendorId?: string;
    } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción del producto es obligatoria';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'El precio del producto debe ser mayor a cero';
    }
    
    if (!formData.vendorId) {
      newErrors.vendorId = 'Por favor seleccione un vendedor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData as any);
    }
  };
  
  if (!isOpen) return null;
  
  console.log('Modal CreateProductModal abierto:', { isOpen, vendorId });
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {vendorId ? 'Crear Producto para Vendedor Específico' : 'Crear Nuevo Producto'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Input
                label="Nombre del Producto *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                fullWidth
              />
            </FormGroup>
            
            <FormGroup>
              <Input
                label="Descripción *"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                fullWidth
              />
            </FormGroup>
            
            <FormGroup>
              <Input
                label="Precio *"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                min="0"
                step="any"
                fullWidth
              />
            </FormGroup>
            
            <FormGroup>
              <Input
                label="Tasa de IVA (%)"
                name="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                fullWidth
              />
            </FormGroup>
            
            <FormGroup>
              <Select
                label="Vendedor *"
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                error={errors.vendorId}
                fullWidth
                disabled={loadingVendors}
              >
                <option value="">Seleccione un vendedor</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.firstName} {v.lastName}
                  </option>
                ))}
              </Select>
              {vendorId && (
                <div style={{ marginTop: '5px', fontSize: '0.9em', color: 'var(--color-primary)' }}>
                  Este producto se asociará específicamente al vendedor seleccionado.
                  {vendors.find(v => v.id === vendorId) && (
                    <div style={{ fontWeight: 'bold', marginTop: '3px' }}>
                      Vendedor: {vendors.find(v => v.id === vendorId)?.firstName} {vendors.find(v => v.id === vendorId)?.lastName}
                    </div>
                  )}
                </div>
              )}
            </FormGroup>
            
            <ButtonGroup>
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
              >
                Guardar Producto
              </Button>
            </ButtonGroup>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateProductModal;
