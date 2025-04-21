import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyId: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validaciones básicas
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setIsLoading(true);
      await register(formData);
      navigate('/auth/login', { state: { message: 'Registro exitoso. Por favor inicia sesión.' } });
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <h1>Crear Cuenta</h1>
        <p>Completa el formulario para registrarte en el sistema</p>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="firstName">Nombre</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="lastName">Apellido</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Ingresa tu apellido"
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="companyId">ID de Empresa</label>
            <input
              type="text"
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              placeholder="Ingresa el ID de tu empresa"
            />
          </FormGroup>
          
          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading}
            disabled={isLoading}
          >
            Registrarse
          </Button>
        </Form>
        
        <LoginLink>
          ¿Ya tienes una cuenta? <Link to="/auth/login">Iniciar Sesión</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-background);
  padding: var(--spacing-md);
`;

const RegisterCard = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 500px;
  
  h1 {
    color: var(--color-primary);
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-xl);
  }
  
  p {
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-lg);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  
  label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }
  
  input, select {
    padding: 10px 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-sm);
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(48, 102, 190, 0.2);
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: var(--color-error-bg);
  color: var(--color-error);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: var(--spacing-lg);
  color: var(--color-text-secondary);
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default RegisterPage;
