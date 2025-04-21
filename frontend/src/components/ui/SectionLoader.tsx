import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animación de rotación para el spinner
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Contenedor del spinner
const LoaderContainer = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => 
    props.size === 'small' ? '8px' : 
    props.size === 'large' ? '24px' : 
    '16px'
  };
`;

// Spinner
const Spinner = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  width: ${props => 
    props.size === 'small' ? '20px' : 
    props.size === 'large' ? '40px' : 
    '30px'
  };
  height: ${props => 
    props.size === 'small' ? '20px' : 
    props.size === 'large' ? '40px' : 
    '30px'
  };
  border-radius: 50%;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-primary);
  animation: ${rotate} 1s infinite linear;
`;

// Texto de carga
const LoadingText = styled.p<{ size?: 'small' | 'medium' | 'large' }>`
  margin: 0 0 0 12px;
  font-size: ${props => 
    props.size === 'small' ? '12px' : 
    props.size === 'large' ? '16px' : 
    '14px'
  };
  color: var(--color-text);
  font-weight: 500;
`;

interface SectionLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const SectionLoader: React.FC<SectionLoaderProps> = ({ 
  message = 'Cargando...', 
  size = 'medium' 
}) => {
  return (
    <LoaderContainer size={size}>
      <Spinner size={size} />
      {message && <LoadingText size={size}>{message}</LoadingText>}
    </LoaderContainer>
  );
};

export default SectionLoader;
