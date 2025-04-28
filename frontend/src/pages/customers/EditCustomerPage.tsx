import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api.config';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Swal from 'sweetalert2';

const documentTypes = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PP', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' }
];

interface Customer {
  id: string;
  name: string;
  identificationType: string;
  identificationNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  companyId: string;
}

const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    documentType: 'CC',
    documentNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del cliente al montar el componente
  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/customers/${id}`);
        if (response.data.success) {
          const customer = response.data.data;
          setFormData({
            name: customer.name || '',
            documentType: customer.identificationType || 'CC',
            documentNumber: customer.identificationNumber || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            city: customer.city || '',
            notes: customer.notes || ''
          });
        } else {
          setErrors({ general: 'No se pudo cargar el cliente' });
        }
      } catch (error: any) {
        console.error('Error al cargar el cliente:', error);
        setErrors({ 
          general: error.response?.data?.message || error.message || 'Error al cargar el cliente' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
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
      newErrors.name = 'El nombre del cliente es obligatorio';
    }
    
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es obligatorio';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
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
      // Mapear los nombres de campos para que coincidan con el backend
      const customerData = {
        name: formData.name,
        documentType: formData.documentType, // Usar documentType para el controlador
        documentNumber: formData.documentNumber, // Usar documentNumber para el controlador
        email: formData.email || 'info@example.com',
        phone: formData.phone || '',
        address: formData.address || 'Sin dirección',
        city: formData.city || 'Bogotá',
        department: 'Cundinamarca',
        notes: formData.notes || ''
      };
      
      console.log('Enviando datos actualizados:', customerData);
      
      const response = await axios.put(`/api/customers/${id}`, customerData);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Cliente actualizado exitosamente',
          confirmButtonColor: 'var(--color-primary)'
        }).then(() => {
          navigate('/customers');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Error al actualizar el cliente',
          confirmButtonColor: 'var(--color-primary)'
        });
        setErrors({ general: response.data.message || 'Error al actualizar el cliente' });
      }
    } catch (error: any) {
      console.error('Error al actualizar el cliente:', error);
      
      // Mostrar error detallado
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el cliente';
      
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
        <PageTitle>Editar Cliente</PageTitle>
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
                <Label htmlFor="name">Nombre o Razón Social *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre completo o razón social"
                  error={errors.name}
                  fullWidth
                />
                {errors.name && <ErrorText>{errors.name}</ErrorText>}
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="documentType">Tipo de Documento *</Label>
                <Select
                  id="documentType"
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="documentNumber">Número de Documento *</Label>
                <Input
                  id="documentNumber"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  placeholder="Número de documento"
                  error={errors.documentNumber}
                  fullWidth
                />
                {errors.documentNumber && <ErrorText>{errors.documentNumber}</ErrorText>}
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <SectionTitle>Información de Contacto</SectionTitle>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  error={errors.email}
                  fullWidth
                />
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                  fullWidth
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Dirección completa"
                  fullWidth
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Ciudad"
                  fullWidth
                />
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <SectionTitle>Notas Adicionales</SectionTitle>
            <Input
              type="textarea"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Información adicional sobre el cliente"
              fullWidth
            />
          </FormSection>
          
          <ActionButtons>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => navigate('/customers')}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              isLoading={isSaving}
            >
              Actualizar Cliente
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
  border: 2px solid ${props => props.error ? 'var(--color-error)' : 'var(--color-border)'};
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

export default EditCustomerPage;
