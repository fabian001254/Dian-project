import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api.config';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

// Tipos de documento para vendedores
const documentTypes = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'TI', label: 'Tarjeta de Identidad' }
];

interface VendorForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  identificationType: string;
  identificationNumber: string;
  address: string;
  city: string;
  department: string;
  phone: string;
}

const Container = styled.div`
  padding: var(--spacing-lg);
  max-width: 600px;
  margin: 0 auto;
`;
const Header = styled.h1`
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
`;
const FormSection = styled.div`margin-bottom: var(--spacing-xl);`;
const SectionTitle = styled.h2`font-size: var(--font-size-md); color: var(--color-text); margin-bottom: var(--spacing-md);`;
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
const StyledSelect = styled.select<{ error?: string }>`
  width: 100%; padding: var(--spacing-sm);
  border: 2px solid ${p => p.error ? 'var(--color-error)' : 'var(--color-border)'};
  border-radius: var(--border-radius-sm); background: var(--color-white);
  font-size: var(--font-size-sm);
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
  &:focus { outline:none; border-color: ${p => p.error ? 'var(--color-error)' : 'var(--color-primary)'}; }
`;
const Form = styled.form``;
const FormGroup = styled.div`margin-bottom: var(--spacing-md);`;
const Label = styled.label`display: block; margin-bottom: var(--spacing-xs); color: var(--color-text);`;
const ErrorText = styled.div`color: var(--color-error); font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);`;
const ActionButtons = styled.div`display: flex; justify-content: flex-end; gap: var(--spacing-md); margin-top: var(--spacing-md);`;

const CreateVendorPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<VendorForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    identificationType: 'CC',
    identificationNumber: '',
    address: '',
    city: '',
    department: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string,string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const errs: Record<string,string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'Nombre es obligatorio';
    if (!formData.lastName.trim()) errs.lastName = 'Apellido es obligatorio';
    if (!formData.email.trim()) errs.email = 'Email es obligatorio';
    if (!formData.password.trim()) errs.password = 'Contraseña es obligatoria';
    if (!formData.identificationNumber.trim()) errs.identificationNumber = 'Documento es obligatorio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user?.company?.id) {
      Swal.fire('Error', 'No se encontró información de la empresa', 'error');
      return;
    }
    try {
      const payload = { ...formData, companyId: user.company.id };
      await axios.post('/api/vendors', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      Swal.fire('Éxito', 'Vendedor creado', 'success');
      navigate('/vendors');
    } catch (err: any) {
      const apiMsg = err.response?.data?.message || 'No se pudo crear vendedor';
      Swal.fire('Error', apiMsg, 'error');
    }
  };

  return (
    <Container>
      <Header>Crear Vendedor</Header>
      <Card>
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Información Personal</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Nombre *</Label>
                <Input name="firstName" placeholder="Nombre" fullWidth value={formData.firstName} onChange={handleChange} />
                {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <Label>Apellido *</Label>
                <Input name="lastName" placeholder="Apellido" fullWidth value={formData.lastName} onChange={handleChange} />
                {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
              </FormGroup>
            </FormRow>
          </FormSection>
          <FormSection>
            <SectionTitle>Credenciales</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Email *</Label>
                <Input name="email" type="email" placeholder="Correo electrónico" fullWidth value={formData.email} onChange={handleChange} />
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <Label>Contraseña *</Label>
                <Input type="password" placeholder="Contraseña" fullWidth name="password" value={formData.password} onChange={handleChange} />
                {errors.password && <ErrorText>{errors.password}</ErrorText>}
              </FormGroup>
            </FormRow>
          </FormSection>
          <FormSection>
            <SectionTitle>Identificación</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Tipo Documento *</Label>
                <StyledSelect name="identificationType" value={formData.identificationType} onChange={handleChange} error={errors.identificationType}>
                  {documentTypes.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                </StyledSelect>
                {errors.identificationType && <ErrorText>{errors.identificationType}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <Label>Número Documento *</Label>
                <Input name="identificationNumber" placeholder="Número de documento" fullWidth value={formData.identificationNumber} onChange={handleChange} />
                {errors.identificationNumber && <ErrorText>{errors.identificationNumber}</ErrorText>}
              </FormGroup>
            </FormRow>
          </FormSection>
          <FormSection>
            <SectionTitle>Datos de Contacto</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label>Dirección</Label>
                <Input name="address" placeholder="Dirección" fullWidth value={formData.address} onChange={handleChange} />
              </FormGroup>
              <FormGroup>
                <Label>Ciudad</Label>
                <Input name="city" placeholder="Ciudad" fullWidth value={formData.city} onChange={handleChange} />
              </FormGroup>
              <FormGroup>
                <Label>Departamento</Label>
                <Input name="department" placeholder="Departamento" fullWidth value={formData.department} onChange={handleChange} />
              </FormGroup>
              <FormGroup>
                <Label>Teléfono</Label>
                <Input name="phone" placeholder="Teléfono" fullWidth value={formData.phone} onChange={handleChange} />
              </FormGroup>
            </FormRow>
          </FormSection>
          <ActionButtons>
            <Button variant="outline" onClick={() => navigate('/vendors')}>Cancelar</Button>
            <Button variant="primary" type="submit">Guardar Vendedor</Button>
          </ActionButtons>
        </Form>
      </Card>
    </Container>
  );
};
export default CreateVendorPage;
