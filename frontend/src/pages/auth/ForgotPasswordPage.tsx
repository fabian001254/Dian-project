import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Aquí iría la llamada al API para solicitar recuperación de contraseña
      // Por ahora simulamos un tiempo de espera
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordCard>
        {!isSubmitted ? (
          <>
            <h1>Recuperar Contraseña</h1>
            <p>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </FormGroup>
              
              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading}
                disabled={isLoading}
              >
                Enviar Instrucciones
              </Button>
            </Form>
          </>
        ) : (
          <SuccessMessage>
            <h2>Solicitud Enviada</h2>
            <p>
              Hemos enviado un correo electrónico a <strong>{email}</strong> con instrucciones para restablecer tu contraseña.
            </p>
            <p>
              Por favor revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
          </SuccessMessage>
        )}
        
        <LoginLink>
          <Link to="/auth/login">Volver a Iniciar Sesión</Link>
        </LoginLink>
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

const ForgotPasswordContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-background);
  padding: var(--spacing-md);
`;

const ForgotPasswordCard = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 450px;
  
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
  
  input {
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

const SuccessMessage = styled.div`
  text-align: center;
  
  h2 {
    color: var(--color-success);
    margin-bottom: var(--spacing-md);
  }
  
  p {
    margin-bottom: var(--spacing-md);
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: var(--spacing-lg);
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default ForgotPasswordPage;
