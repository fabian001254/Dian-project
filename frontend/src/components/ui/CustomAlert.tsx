import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const AlertOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: flex-start;
  padding-top: 100px;
  z-index: 9999;
`;

const AlertContainer = styled.div<{ type: AlertType }>`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
  border-top: 4px solid ${props => {
    switch (props.type) {
      case 'success': return 'var(--color-success)';
      case 'error': return 'var(--color-error)';
      case 'warning': return 'var(--color-warning)';
      case 'info': return 'var(--color-info)';
      default: return 'var(--color-primary)';
    }
  }};

  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const AlertHeader = styled.div<{ type: AlertType }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${props => {
    switch (props.type) {
      case 'success': return 'var(--color-success-light)';
      case 'error': return 'var(--color-error-light)';
      case 'warning': return 'var(--color-warning-light)';
      case 'info': return 'var(--color-info-light)';
      default: return 'var(--color-primary-light)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return 'var(--color-success)';
      case 'error': return 'var(--color-error)';
      case 'warning': return 'var(--color-warning)';
      case 'info': return 'var(--color-info)';
      default: return 'var(--color-primary)';
    }
  }};
`;

const AlertTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const AlertBody = styled.div`
  padding: 16px;
`;

const AlertMessage = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const CustomAlert: React.FC<CustomAlertProps> = ({
  isOpen,
  type,
  title,
  message,
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);
  
  if (!isOpen) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'success': return <FaCheckCircle size={18} />;
      case 'error': return <FaExclamationTriangle size={18} />;
      case 'warning': return <FaExclamationTriangle size={18} />;
      case 'info': return <FaInfoCircle size={18} />;
      default: return <FaInfoCircle size={18} />;
    }
  };
  
  return (
    <AlertOverlay isOpen={isOpen} onClick={onClose}>
      <AlertContainer type={type} onClick={e => e.stopPropagation()}>
        <AlertHeader type={type}>
          <AlertTitle>
            {getIcon()}
            {title}
          </AlertTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </AlertHeader>
        <AlertBody>
          <AlertMessage>{message}</AlertMessage>
        </AlertBody>
      </AlertContainer>
    </AlertOverlay>
  );
};

export default CustomAlert;

// Función de utilidad para mostrar alertas desde cualquier parte de la aplicación
export const showAlert = (
  type: AlertType,
  title: string,
  message: string,
  duration: number = 3000
) => {
  // Crear el contenedor si no existe
  let alertContainer = document.getElementById('custom-alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'custom-alert-container';
    document.body.appendChild(alertContainer);
  }
  
  // Crear el elemento de alerta
  const alertElement = document.createElement('div');
  alertElement.className = `custom-alert custom-alert-${type}`;
  alertElement.innerHTML = `
    <div class="custom-alert-content">
      <div class="custom-alert-header">
        <div class="custom-alert-title">${title}</div>
        <button class="custom-alert-close">&times;</button>
      </div>
      <div class="custom-alert-body">
        <div class="custom-alert-message">${message}</div>
      </div>
    </div>
  `;
  
  // Estilos para la alerta
  alertElement.style.position = 'fixed';
  alertElement.style.top = '20px';
  alertElement.style.left = '50%';
  alertElement.style.transform = 'translateX(-50%)';
  alertElement.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                      type === 'error' ? '#F44336' : 
                                      type === 'warning' ? '#FF9800' : '#2196F3';
  alertElement.style.color = 'white';
  alertElement.style.padding = '15px 25px';
  alertElement.style.borderRadius = '4px';
  alertElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  alertElement.style.zIndex = '9999';
  alertElement.style.minWidth = '300px';
  alertElement.style.textAlign = 'center';
  
  // Añadir al contenedor
  alertContainer.appendChild(alertElement);
  
  // Eliminar después del tiempo especificado
  setTimeout(() => {
    if (alertContainer && alertContainer.contains(alertElement)) {
      alertContainer.removeChild(alertElement);
    }
  }, duration);
  
  // Manejar el cierre manual
  const closeButton = alertElement.querySelector('.custom-alert-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (alertContainer && alertContainer.contains(alertElement)) {
        alertContainer.removeChild(alertElement);
      }
    });
  }
};
