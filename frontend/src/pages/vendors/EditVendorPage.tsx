import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api.config';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SectionLoader from '../../components/ui/SectionLoader';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

interface VendorForm {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  department?: string;
  identificationType?: string;
  identificationNumber?: string;
}

interface PasswordChangeForm {
  newPassword: string;
  confirmPassword: string;
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
const Form = styled.form``;
const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;
const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
`;

const Divider = styled.hr`
  margin: var(--spacing-lg) 0;
  border: 0;
  border-top: 1px solid var(--color-border);
`;

const SectionTitle = styled.h3`
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
`;

const EditVendorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<VendorForm>({ name: '', email: '', phone: '', address: '', city: '', department: '', identificationType: '', identificationNumber: '' });
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string,string>>({});
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    axios.get(`/api/vendors/${id}`)
      .then(res => {
        const data = res.data.data;
        console.log('Datos del vendedor:', data);
        
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          department: data.department || '',
          identificationType: data.user?.identificationType || '',
          identificationNumber: data.user?.identificationNumber || ''
        });
        
        // Guardar el ID del usuario asociado al vendedor para el cambio de contraseña
        if (data.userId) {
          console.log('ID del usuario asociado al vendedor (userId):', data.userId);
          setUserId(data.userId);
        } else if (data.user && data.user.id) {
          console.log('ID del usuario asociado al vendedor (user.id):', data.user.id);
          setUserId(data.user.id);
        } else {
          console.warn('No se encontró un ID de usuario asociado al vendedor');
        }
      })
      .catch((error) => {
        console.error('Error al cargar los datos del vendedor:', error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs: Record<string,string> = {};
    if (!form.name) errs.name = 'Nombre es obligatorio';
    if (!form.email) errs.email = 'Email es obligatorio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs: Record<string,string> = {};
    if (!passwordForm.newPassword) errs.newPassword = 'La nueva contraseña es obligatoria';
    if (passwordForm.newPassword.length < 6) errs.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    if (!passwordForm.confirmPassword) errs.confirmPassword = 'Debe confirmar la contraseña';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.put(`/api/vendors/${id}`, form);
      Swal.fire('Éxito', 'Vendedor actualizado', 'success');
      navigate(`/vendors/${id}`);
    } catch (err) {
      Swal.fire('Error', 'No se pudo actualizar vendedor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    
    // Verificar que el usuario sea administrador
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
      Swal.fire('Error', 'Solo los administradores pueden cambiar contraseñas', 'error');
      return;
    }
    
    // Verificar que tengamos el ID del usuario o el ID del vendedor
    if (!userId && !id) {
      Swal.fire('Error', 'No se encontró el usuario asociado al vendedor', 'error');
      return;
    }
    
    // Si no tenemos el userId pero tenemos el id del vendedor, intentamos obtener el userId
    const targetUserId = userId || id;
    console.log('Intentando cambiar contraseña para el usuario con ID:', targetUserId);
    
    try {
      const response = await axios.post(`/api/users/${targetUserId}/reset-password`, {
        newPassword: passwordForm.newPassword
      });
      
      if (response.data.success) {
        Swal.fire('Éxito', 'Contraseña actualizada correctamente', 'success');
        // Limpiar el formulario
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(response.data.message || 'Error al cambiar la contraseña');
      }
    } catch (err: any) {
      console.error('Error al cambiar la contraseña:', err);
      Swal.fire('Error', err.response?.data?.message || err.message || 'No se pudo cambiar la contraseña', 'error');
    }
  };

  if (loading) return <SectionLoader />;

  // Solo mostrar la sección de cambio de contraseña para administradores
  // El rol puede estar como 'admin' o como 'ADMIN' dependiendo de cómo esté almacenado en la base de datos
  const isAdmin = user && (user.role === 'admin' || user.role === 'ADMIN');
  
  // Logs para depuración
  console.log('Usuario actual:', user);
  console.log('Rol del usuario:', user?.role);
  console.log('¿Es administrador?', isAdmin);
  console.log('ID del usuario del vendedor:', userId);

  return (
    <Container>
      <Header>Editar Vendedor</Header>
      <Card>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nombre</Label>
            <Input name="name" value={form.name} onChange={handleChange} />
            {errors.name && <div style={{color:'var(--color-error)'}}>{errors.name}</div>}
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input name="email" value={form.email} onChange={handleChange} />
            {errors.email && <div style={{color:'var(--color-error)'}}>{errors.email}</div>}
          </FormGroup>
          <FormGroup>
            <Label>Teléfono</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Dirección</Label>
            <Input name="address" value={form.address} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Ciudad</Label>
            <Input name="city" value={form.city} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Departamento</Label>
            <Input name="department" value={form.department} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Tipo de identificación</Label>
            <Input name="identificationType" value={form.identificationType} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Número de identificación</Label>
            <Input name="identificationNumber" value={form.identificationNumber} onChange={handleChange} />
          </FormGroup>
          <Button variant="primary" type="submit">Guardar</Button>
          <Button variant="outline" onClick={() => navigate(`/vendors/${id}`)} style={{marginLeft:'8px'}}>Cancelar</Button>
        </Form>
        
        {/* Sección de cambio de contraseña - Solo visible para administradores */}
        {isAdmin && (
          <>
            <Divider />
            <SectionTitle>Cambiar Contraseña</SectionTitle>
            <Form onSubmit={handlePasswordSubmit}>
              <FormGroup>
                <Label>Nueva Contraseña</Label>
                <Input 
                  type="password" 
                  name="newPassword" 
                  value={passwordForm.newPassword} 
                  onChange={handlePasswordChange} 
                  placeholder="Ingrese la nueva contraseña" 
                />
                {passwordErrors.newPassword && (
                  <div style={{color:'var(--color-error)'}}>{passwordErrors.newPassword}</div>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Confirmar Contraseña</Label>
                <Input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwordForm.confirmPassword} 
                  onChange={handlePasswordChange} 
                  placeholder="Confirme la nueva contraseña" 
                />
                {passwordErrors.confirmPassword && (
                  <div style={{color:'var(--color-error)'}}>{passwordErrors.confirmPassword}</div>
                )}
              </FormGroup>
              <Button variant="primary" type="submit">Cambiar Contraseña</Button>
            </Form>
          </>
        )}
      </Card>
    </Container>
  );
};

export default EditVendorPage;
