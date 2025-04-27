import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-background);
  padding: var(--spacing-md);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 450px;
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-xl);
`;

const Logo = styled.h1`
  color: var(--color-primary);
  font-size: var(--font-size-xxl);
  margin-bottom: var(--spacing-xs);
`;

const Subtitle = styled.p`
  color: var(--color-gray-dark);
  font-size: var(--font-size-sm);
`;

const Form = styled.form`
  margin-top: var(--spacing-lg);
`;

const ErrorMessage = styled.div`
  background-color: rgba(230, 57, 70, 0.1);
  color: var(--color-error);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-sm);
    flex-shrink: 0;
  }
`;

// Eliminados los componentes ForgotPassword y RegisterLink ya que solo el admin puede gestionar usuarios

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormError('');
    clearError();
    
    // Validate form
    if (!email || !password) {
      setFormError('Por favor ingrese su correo y contraseña');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth context
      console.error('Error logging in:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <LoginContainer>
      <LoginCard elevation="high" padding="large">
        <LogoContainer>
          <Logo>DIAN Facturación</Logo>
          <Subtitle>Sistema Educativo de Facturación Electrónica</Subtitle>
        </LogoContainer>
        
        {(error || formError) && (
          <ErrorMessage>
            <FaExclamationCircle />
            <span>{error || formError}</span>
          </ErrorMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            leftIcon={<FaEnvelope />}
            required
          />
          
          <Input
            label="Contraseña"
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            leftIcon={<FaLock />}
            required
          />
          
          {/* Enlace de recuperación de contraseña eliminado - Solo administradores pueden gestionar usuarios */}
          
          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            style={{ marginTop: 'var(--spacing-lg)' }}
          >
            Iniciar Sesión
          </Button>
        </Form>
        
        {/* Enlace de registro eliminado - Solo administradores pueden crear usuarios */}
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
