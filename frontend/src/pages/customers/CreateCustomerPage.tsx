import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api.config';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

const documentTypes = [
  { value: 'Cédula de Ciudadanía', label: 'Cédula de Ciudadanía' },
  { value: 'Cédula de Extranjería', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'Pasaporte', label: 'Pasaporte' },
  { value: 'Tarjeta de Identidad', label: 'Tarjeta de Identidad' }
];

const CreateCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    documentType: 'Cédula de Ciudadanía', // Actualizado para usar el valor completo del enum
    documentNumber: '',
    dv: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'El nombre comercial es obligatorio';
    }
    
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es obligatorio';
    }
    
    if (formData.documentType === 'NIT' && !formData.dv.trim()) {
      newErrors.dv = 'El dígito de verificación (DV) es obligatorio para NIT';
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
    
    if (!user?.company?.id) {
      setErrors({ general: 'No se encontró información de la empresa' });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Mapear los nombres de campos para que coincidan con lo que espera el controlador
      const customerData = {
        name: formData.name,
        businessName: formData.businessName,
        documentType: formData.documentType, // Cambiado de identificationType a documentType
        documentNumber: formData.documentNumber, // Cambiado de identificationNumber a documentNumber
        dv: formData.dv,
        email: formData.email || 'info@example.com',
        phone: formData.phone || '',
        address: formData.address || 'Sin dirección',
        city: formData.city || '',
        department: formData.department || '',
        companyId: user.company.id,
        type: 'natural',
        isActive: true,
        password: 'Cliente123' // Añadimos contraseña por defecto para evitar problemas
      };
      
      // Si el usuario es un vendedor, asociar automáticamente el cliente a su cuenta
      if (user.role === 'vendor') {
        // @ts-ignore - Ignoramos el error de TypeScript ya que sabemos que esta propiedad es válida
        customerData.vendorId = user.id;
        console.log('Cliente asociado automáticamente al vendedor:', user.id);
      }
      
      console.log('Enviando datos de cliente:', customerData);
      
      // Asegurarse de que el token de autenticación esté presente
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/customers', customerData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Cliente creado exitosamente',
          confirmButtonText: 'Continuar'
        }).then(() => {
          navigate('/customers');
        });
      } else {
        throw new Error(response.data.message || 'Error al crear el cliente');
      }
    } catch (error: any) {
      console.error('Error al crear el cliente:', error);
      const errorMessage = error.response?.data?.message || error.message || 'No se pudo crear el cliente. Por favor, intente de nuevo.';
      console.log('Detalles del error:', error.response?.data);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader>
        <div>
          <PageTitle>Crear Nuevo Cliente</PageTitle>
          {user?.role === 'vendor' && (
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              El cliente será asociado automáticamente a tu cuenta
            </div>
          )}
        </div>
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
                <Label htmlFor="businessName">Nombre Comercial *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Nombre comercial"
                  error={errors.businessName}
                  fullWidth
                />
                {errors.businessName && <ErrorText>{errors.businessName}</ErrorText>}
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
              
              {formData.documentType === 'NIT' && (
                <FormGroup>
                  <Label htmlFor="dv">Dígito de Verificación (DV) *</Label>
                  <Input
                    id="dv"
                    name="dv"
                    value={formData.dv}
                    onChange={handleInputChange}
                    placeholder="Dígito de verificación"
                    error={errors.dv}
                    fullWidth
                  />
                  {errors.dv && <ErrorText>{errors.dv}</ErrorText>}
                </FormGroup>
              )}
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
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Departamento"
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
              Guardar Cliente
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
  /* 2 inputs por línea en pantallas grandes */
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  
  /* En móviles, volver a una columna */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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
  
  /* Dark mode overrides */
  html[data-theme='dark'] & {
    background-color: var(--color-gray-light);
    border-color: var(--color-border);
    color: var(--color-text);
    /* Dark options styling */
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

export default CreateCustomerPage;
