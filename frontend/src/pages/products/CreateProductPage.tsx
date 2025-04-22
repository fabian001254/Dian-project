import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

// Interfaces
interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description: string;
}

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [vendors, setVendors] = useState<Array<{id:string, firstName:string, lastName:string}>>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  
  // Obtener el ID del vendedor de los parámetros de consulta (si existe)
  const queryParams = new URLSearchParams(location.search);
  const vendorIdFromUrl = queryParams.get('vendorId') || '';
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    unitPrice: '',
    unit: 'Unidad',
    taxRateId: '',
    isActive: true,
    vendorId: vendorIdFromUrl
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar tasas de impuestos y vendedores al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cargar tasas de impuestos
        const taxRatesResponse = await axios.get('/api/tax-rates');
        if (taxRatesResponse.data.success) {
          setTaxRates(taxRatesResponse.data.data);
          // Establecer la primera tasa de impuesto como valor predeterminado si hay alguna
          if (taxRatesResponse.data.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              taxRateId: taxRatesResponse.data.data[0].id
            }));
          }
        }
        
        // Cargar vendedores
        setLoadingVendors(true);
        const vendorsResponse = await axios.get('/api/users', { params: { role: 'vendor' } });
        if (vendorsResponse.data && vendorsResponse.data.success) {
          setVendors(vendorsResponse.data.data);
          
          // Si hay un vendedor preseleccionado desde la URL, verificar que exista
          if (vendorIdFromUrl) {
            const vendorExists = vendorsResponse.data.data.some(
              (vendor: {id: string}) => vendor.id === vendorIdFromUrl
            );
            
            if (!vendorExists) {
              console.warn(`El vendedor con ID ${vendorIdFromUrl} no existe. Se usará la selección predeterminada.`);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setIsLoading(false);
        setLoadingVendors(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Si estamos actualizando el precio, también actualizamos el unitPrice
      if (name === 'price') {
        return {
          ...prev,
          [name]: value,
          unitPrice: value
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
    
    // Limpiar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.price && formData.price !== '0') {
      newErrors.price = 'El precio es obligatorio';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'El precio debe ser un número no negativo';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'La unidad es obligatoria';
    }
    
    if (!formData.taxRateId) {
      newErrors.taxRateId = 'Debe ingresar un porcentaje de IVA';
    } else if (isNaN(parseFloat(formData.taxRateId)) || parseFloat(formData.taxRateId) < 0) {
      newErrors.taxRateId = 'El porcentaje de IVA debe ser un número no negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Mostrar confirmación si el producto no está asociado a un vendedor
    if (!formData.vendorId && vendors.length > 0) {
      const result = await Swal.fire({
        title: 'Producto sin vendedor específico',
        text: '¿Estás seguro de crear un producto general sin asociarlo a un vendedor específico?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, crear producto general',
        cancelButtonText: 'No, quiero asociarlo a un vendedor'
      });
      
      if (!result.isConfirmed) {
        return;
      }
    }
    
    if (!user?.company?.id) {
      setErrors({ general: 'No se encontró información de la empresa' });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Asegurarse de que vendorId se envíe correctamente
      // IMPORTANTE: No usar undefined, ya que axios lo elimina de la petición
      // Usar null explícitamente para indicar que no hay vendedor
      const vendorId = formData.vendorId ? formData.vendorId : null;
      
      // Crear un objeto limpio con solo los campos necesarios
      const productData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        price: parseFloat(formData.price),
        unitPrice: parseFloat(formData.unitPrice || formData.price),
        unit: formData.unit,
        taxRateId: parseFloat(formData.taxRateId),
        vendorId: vendorId, // Usar el valor explícito
        isActive: formData.isActive,
        companyId: user.company.id
      };
      
      // Logs detallados para diagnóstico
      console.log('ID del vendedor seleccionado:', formData.vendorId);
      console.log('ID del vendedor que se enviará:', vendorId);
      console.log('Datos completos que se enviarán al backend:', JSON.stringify(productData, null, 2));
      
      // Asegurarse de que el token de autenticación esté presente
      const token = localStorage.getItem('token');
      
      console.log('URL de la petición:', '/api/products');
      console.log('Headers:', { Authorization: `Bearer ${token}` });
      
      // Realizar la petición al backend
      const response = await axios.post('/api/products', productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mostrar la respuesta del servidor
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        // Mostrar mensaje de éxito
        Swal.fire({
          title: '¡Producto creado!',
          text: formData.vendorId 
            ? `El producto ha sido creado correctamente y asociado al vendedor seleccionado` 
            : 'El producto general ha sido creado correctamente',
          icon: 'success',
          confirmButtonColor: 'var(--color-primary)'
        }).then(() => {
          navigate('/products');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Error al crear el producto',
          confirmButtonColor: 'var(--color-primary)'
        });
        setErrors({ general: response.data.message || 'Error al crear el producto' });
      }
    } catch (error: any) {
      console.error('Error al crear el producto:', error);
      console.error('Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      
      // Mostrar mensaje de error detallado con SweetAlert2
      const errorMessage = `Error ${error.response?.status || ''}: ${error.response?.data?.message || error.message || 'Error al crear el producto'}`;
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: 'var(--color-primary)'
      });
      
      setErrors({ 
        general: errorMessage 
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
        <PageTitle>Crear Nuevo Producto</PageTitle>
      </PageHeader>
      
      <Card>
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <ErrorMessage>{errors.general}</ErrorMessage>
          )}
          
          <FormSection>
            <SectionTitle>Información Básica</SectionTitle>
            
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
                  step="any"
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
                <Label htmlFor="taxRateId">Porcentaje IVA (%) *</Label>
                <Input
                  id="taxRateId"
                  name="taxRateId"
                  type="number"
                  min="0"
                  value={formData.taxRateId}
                  onChange={handleInputChange}
                  placeholder="0"
                  fullWidth
                  error={errors.taxRateId}
                />
                {errors.taxRateId && <ErrorText>{errors.taxRateId}</ErrorText>}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="vendorId">
                  Vendedor (Opcional)
                </Label>
                <Select
                  id="vendorId"
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleInputChange}
                  error={errors.vendorId}
                >
                  <option value="">Producto general (todos los vendedores)</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.firstName} {vendor.lastName}
                    </option>
                  ))}
                </Select>
                {formData.vendorId && (
                  <div style={{ marginTop: 'var(--spacing-xs)', padding: 'var(--spacing-xs)', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--border-radius-sm)' }}>
                    <strong>Producto asociado a vendedor específico:</strong> {vendors.find(v => v.id === formData.vendorId)?.firstName} {vendors.find(v => v.id === formData.vendorId)?.lastName || 'Vendedor seleccionado'}
                  </div>
                )}
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  Si asocia el producto a un vendedor específico, solo será visible en las facturas de ese vendedor.
                </div>
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
              Guardar Producto
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
  
  /* Dark mode overrides */
  html[data-theme='dark'] & {
    background-color: var(--color-gray-light);
    border-color: var(--color-border);
    color: var(--color-text);
    option {
      background-color: var(--color-background);
      color: var(--color-text);
    }
  }
  
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

export default CreateProductPage;
