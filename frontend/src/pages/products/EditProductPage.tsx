import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api.config';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FaInfoCircle } from 'react-icons/fa';

// Interfaces
interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  taxRateId: string;
  companyId: string;
  customerId?: string; // ID del cliente al que pertenece el producto
  customerName?: string; // Nombre del cliente al que pertenece el producto
  taxRates?: TaxRate[];
}

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    unit: 'Unidad',
    taxRateId: '',
    customerId: '',
    customerName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar producto y tasas de impuestos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar tasas de impuestos
        const taxRatesResponse = await api.get('/tax-rates');
        if (taxRatesResponse.data.success) {
          setTaxRates(taxRatesResponse.data.data);
        }

        // Cargar datos del producto
        const productResponse = await api.get(`/api/products/${id}`);
        if (productResponse.data.success) {
          const product = productResponse.data.data;
          console.log('Producto cargado:', product);
          setFormData({
            code: product.code || '',
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            unit: product.unit || 'Unidad',
            taxRateId: product.taxRateId || '',
            customerId: product.customerId || '',
            customerName: product.customerName || 'Sin cliente asignado'
          });
        } else {
          setErrors({ general: 'No se pudo cargar el producto' });
        }
      } catch (error: any) {
        console.error('Error al cargar datos:', error);
        setErrors({ 
          general: error.response?.data?.message || error.message || 'Error al cargar datos' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio';
    }
    
    if (!formData.price) {
      newErrors.price = 'El precio es obligatorio';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un número mayor que cero';
    }
    
    if (!formData.taxRateId) {
      newErrors.taxRateId = 'Debe seleccionar una tasa de impuesto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      const response = await api.put(`/api/products/${id}`, productData);
      
      if (response.data.success) {
        alert('Producto actualizado exitosamente');
        navigate('/products');
      } else {
        setErrors({ general: response.data.message || 'Error al actualizar el producto' });
      }
    } catch (error: any) {
      console.error('Error al actualizar el producto:', error);
      setErrors({ 
        general: error.response?.data?.message || error.message || 'Error al actualizar el producto' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Editar Producto</PageTitle>
      </PageHeader>
      
      <Card>
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <ErrorMessage>{errors.general}</ErrorMessage>
          )}
          
          <FormSection>
            <SectionTitle>Información Básica</SectionTitle>
            
            {formData.customerId && (
              <FormRow>
                <FormGroup>
                  <Label>Cliente Asociado</Label>
                  <div className="customer-display">
                    <span className="customer-name">{formData.customerName || 'Sin cliente asignado'}</span>
                    <span className="customer-id">(ID: {formData.customerId})</span>
                  </div>
                  <small className="info-text">Este producto está asociado a un cliente específico y no puede modificarse.</small>
                </FormGroup>
              </FormRow>
            )}
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Código del producto (opcional)"
                  fullWidth
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre del producto"
                  error={errors.name}
                  fullWidth
                />
                {errors.name && <ErrorText>{errors.name}</ErrorText>}
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Precio del producto"
                  min="0"
                  step="1000"
                  error={errors.price}
                  fullWidth
                />
                {errors.price && <ErrorText>{errors.price}</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="unit">Unidad de Medida</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="Unidad de medida (ej. Unidad, Kg, Litro)"
                  fullWidth
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="taxRateId">
                  Tasa de Impuesto *
                  <Tooltip>
                    <FaInfoCircle />
                    <TooltipText className="tooltip-text">
                      Seleccione la tasa de impuesto aplicable a este producto.
                    </TooltipText>
                  </Tooltip>
                </Label>
                <Select
                  id="taxRateId"
                  name="taxRateId"
                  value={formData.taxRateId}
                  onChange={handleInputChange}
                  error={errors.taxRateId}
                >
                  <option value="">Seleccionar tasa de impuesto</option>
                  {taxRates.map(taxRate => (
                    <option key={taxRate.id} value={taxRate.id}>
                      {taxRate.name} ({taxRate.rate}%)
                    </option>
                  ))}
                </Select>
                {errors.taxRateId && <ErrorText>{errors.taxRateId}</ErrorText>}
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <SectionTitle>Descripción</SectionTitle>
            <Input
              type="textarea"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descripción detallada del producto o servicio"
              fullWidth
            />
          </FormSection>
          
          <ActionButtons>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => navigate('/products')}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              isLoading={isSaving}
            >
              Actualizar Producto
            </Button>
          </ActionButtons>
        </form>
      </Card>
    </>
  );
};

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin: 0;
`;

const FormSection = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
`;

const Select = styled.select<{ error?: string }>`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.error ? 'var(--color-error)' : 'var(--color-border)'};
  border-radius: var(--border-radius-sm);
  background-color: var(--color-white);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? 'var(--color-error)' : 'var(--color-primary)'};
    box-shadow: 0 0 0 2px ${props => props.error ? 'rgba(var(--color-error-rgb), 0.2)' : 'rgba(var(--color-primary-rgb), 0.2)'};
  }
`;

const ErrorText = styled.div`
  color: var(--color-error);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
`;

const ErrorMessage = styled.div`
  background-color: var(--color-error-bg);
  color: var(--color-error);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
`;

const CustomerDisplay = styled.div.attrs({ className: 'customer-display' })`
  padding: 10px 12px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const CustomerName = styled.span.attrs({ className: 'customer-name' })`
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
`;

const CustomerId = styled.span.attrs({ className: 'customer-id' })`
  color: var(--color-text-light);
  font-size: var(--font-size-xs);
`;

const InfoText = styled.small.attrs({ className: 'info-text' })`
  display: block;
  margin-top: var(--spacing-xs);
  color: var(--color-text-light);
  font-style: italic;
  font-size: var(--font-size-xs);
`;

const Tooltip = styled.div`
  position: relative;
  display: inline-block;
  margin-left: var(--spacing-xs);
  
  &:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`;

const TooltipText = styled.div`
  visibility: hidden;
  width: 250px;
  background-color: var(--color-text);
  color: var(--color-white);
  text-align: center;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm);
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: var(--font-size-xs);
  font-weight: normal;
  
  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: var(--color-text) transparent transparent transparent;
  }
`;

export default EditProductPage;
