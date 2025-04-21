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

// Animación de pulso para el fondo
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
`;

// Contenedor principal
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background-color: var(--bg-color);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  animation: ${pulse} 2s infinite ease-in-out;
`;

// Spinner con logo
const Spinner = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color);
  animation: ${rotate} 1s infinite linear;
  position: relative;
  
  &::before {
    content: 'DIAN';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
    font-size: 14px;
    color: var(--text-color);
  }
`;

// Texto de carga
const LoadingText = styled.p`
  margin-top: 20px;
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
`;

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Cargando...' }) => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>{message}</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingSpinner;
