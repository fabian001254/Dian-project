import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { FaCheck, FaExclamationTriangle, FaCertificate, FaFileAlt } from 'react-icons/fa';

// Interfaces
interface HabilitacionStatus {
  registrado: boolean;
  certificadoGenerado: boolean;
  resolucionSolicitada: boolean;
  testSetPruebas: boolean;
  habilitado: boolean;
  fechaRegistro?: string;
  fechaCertificado?: string;
  fechaResolucion?: string;
  fechaTestSet?: string;
  fechaHabilitacion?: string;
  numeroResolucion?: string;
  certificadoId?: string;
}

const HabilitacionPage: React.FC = () => {
  const [status, setStatus] = useState<HabilitacionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingAction, setProcessingAction] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        // Aquí iría la llamada al API para obtener el estado de habilitación
        // Por ahora usamos datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Datos de ejemplo
        const mockStatus: HabilitacionStatus = {
          registrado: true,
          certificadoGenerado: true,
          resolucionSolicitada: true,
          testSetPruebas: false,
          habilitado: false,
          fechaRegistro: '2025-03-15',
          fechaCertificado: '2025-03-16',
          fechaResolucion: '2025-03-20',
          certificadoId: 'CERT-2025-001'
        };
        
        setStatus(mockStatus);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el estado de habilitación');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleRegistro = async () => {
    if (processingAction) return;
    
    try {
      setProcessingAction('registro');
      // Aquí iría la llamada al API para registrar la empresa
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          registrado: true,
          fechaRegistro: new Date().toISOString().split('T')[0]
        };
      });
    } catch (err: any) {
      alert(err.message || 'Error al registrar la empresa');
    } finally {
      setProcessingAction('');
    }
  };

  const handleGenerarCertificado = async () => {
    if (processingAction) return;
    
    try {
      setProcessingAction('certificado');
      // Aquí iría la llamada al API para generar el certificado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          certificadoGenerado: true,
          fechaCertificado: new Date().toISOString().split('T')[0],
          certificadoId: `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        };
      });
    } catch (err: any) {
      alert(err.message || 'Error al generar el certificado');
    } finally {
      setProcessingAction('');
    }
  };

  const handleSolicitarResolucion = async () => {
    if (processingAction) return;
    
    try {
      setProcessingAction('resolucion');
      // Aquí iría la llamada al API para solicitar la resolución
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          resolucionSolicitada: true,
          fechaResolucion: new Date().toISOString().split('T')[0],
          numeroResolucion: `18760${Math.floor(Math.random() * 10000).toString().padStart(6, '0')}`
        };
      });
    } catch (err: any) {
      alert(err.message || 'Error al solicitar la resolución');
    } finally {
      setProcessingAction('');
    }
  };

  const handleTestSet = async () => {
    if (processingAction) return;
    
    try {
      setProcessingAction('testset');
      // Aquí iría la llamada al API para realizar el test set
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          testSetPruebas: true,
          fechaTestSet: new Date().toISOString().split('T')[0]
        };
      });
    } catch (err: any) {
      alert(err.message || 'Error al realizar el test set');
    } finally {
      setProcessingAction('');
    }
  };

  const handleHabilitar = async () => {
    if (processingAction) return;
    
    try {
      setProcessingAction('habilitacion');
      // Aquí iría la llamada al API para habilitar la empresa
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          habilitado: true,
          fechaHabilitacion: new Date().toISOString().split('T')[0]
        };
      });
    } catch (err: any) {
      alert(err.message || 'Error al habilitar la empresa');
    } finally {
      setProcessingAction('');
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Cargando estado de habilitación...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!status) {
    return (
      <Container>
        <ErrorMessage>No se pudo cargar el estado de habilitación</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Habilitación como Facturador Electrónico</h1>
        <p>Sigue los pasos para habilitar tu empresa como facturador electrónico ante la DIAN</p>
      </Header>

      <StepGrid>
        <StepCard completed={status.registrado}>
          <StepNumber completed={status.registrado}>1</StepNumber>
          <StepContent>
            <h3>Registro como Facturador Electrónico</h3>
            <p>Registra tu empresa como facturador electrónico ante la DIAN</p>
            
            {status.registrado ? (
              <StepStatus>
                <FaCheck /> Completado
                {status.fechaRegistro && <span>Fecha: {status.fechaRegistro}</span>}
              </StepStatus>
            ) : (
              <Button 
                onClick={handleRegistro} 
                disabled={!!processingAction}
                isLoading={processingAction === 'registro'}
              >
                Registrar Empresa
              </Button>
            )}
          </StepContent>
        </StepCard>

        <StepCard completed={status.certificadoGenerado} disabled={!status.registrado}>
          <StepNumber completed={status.certificadoGenerado}>2</StepNumber>
          <StepContent>
            <h3>Generar Certificado Digital</h3>
            <p>Genera un certificado digital para firmar tus facturas electrónicas</p>
            
            {!status.registrado ? (
              <StepDisabled>
                <FaExclamationTriangle /> Completa el paso anterior
              </StepDisabled>
            ) : status.certificadoGenerado ? (
              <StepStatus>
                <FaCheck /> Completado
                {status.fechaCertificado && <span>Fecha: {status.fechaCertificado}</span>}
                {status.certificadoId && <span>ID: {status.certificadoId}</span>}
                <CertificateButton>
                  <FaCertificate /> Ver Certificado
                </CertificateButton>
              </StepStatus>
            ) : (
              <Button 
                onClick={handleGenerarCertificado} 
                disabled={!!processingAction}
                isLoading={processingAction === 'certificado'}
              >
                Generar Certificado
              </Button>
            )}
          </StepContent>
        </StepCard>

        <StepCard completed={status.resolucionSolicitada} disabled={!status.certificadoGenerado}>
          <StepNumber completed={status.resolucionSolicitada}>3</StepNumber>
          <StepContent>
            <h3>Solicitar Resolución de Facturación</h3>
            <p>Solicita una resolución de facturación electrónica ante la DIAN</p>
            
            {!status.certificadoGenerado ? (
              <StepDisabled>
                <FaExclamationTriangle /> Completa los pasos anteriores
              </StepDisabled>
            ) : status.resolucionSolicitada ? (
              <StepStatus>
                <FaCheck /> Completado
                {status.fechaResolucion && <span>Fecha: {status.fechaResolucion}</span>}
                {status.numeroResolucion && <span>Resolución: {status.numeroResolucion}</span>}
                <CertificateButton>
                  <FaFileAlt /> Ver Resolución
                </CertificateButton>
              </StepStatus>
            ) : (
              <Button 
                onClick={handleSolicitarResolucion} 
                disabled={!!processingAction}
                isLoading={processingAction === 'resolucion'}
              >
                Solicitar Resolución
              </Button>
            )}
          </StepContent>
        </StepCard>

        <StepCard completed={status.testSetPruebas} disabled={!status.resolucionSolicitada}>
          <StepNumber completed={status.testSetPruebas}>4</StepNumber>
          <StepContent>
            <h3>Realizar Set de Pruebas</h3>
            <p>Realiza el set de pruebas requerido por la DIAN para validar tu implementación</p>
            
            {!status.resolucionSolicitada ? (
              <StepDisabled>
                <FaExclamationTriangle /> Completa los pasos anteriores
              </StepDisabled>
            ) : status.testSetPruebas ? (
              <StepStatus>
                <FaCheck /> Completado
                {status.fechaTestSet && <span>Fecha: {status.fechaTestSet}</span>}
              </StepStatus>
            ) : (
              <Button 
                onClick={handleTestSet} 
                disabled={!!processingAction}
                isLoading={processingAction === 'testset'}
              >
                Realizar Set de Pruebas
              </Button>
            )}
          </StepContent>
        </StepCard>

        <StepCard completed={status.habilitado} disabled={!status.testSetPruebas} isLast>
          <StepNumber completed={status.habilitado}>5</StepNumber>
          <StepContent>
            <h3>Habilitación Final</h3>
            <p>Completa el proceso de habilitación como facturador electrónico</p>
            
            {!status.testSetPruebas ? (
              <StepDisabled>
                <FaExclamationTriangle /> Completa los pasos anteriores
              </StepDisabled>
            ) : status.habilitado ? (
              <StepStatus>
                <FaCheck /> Completado
                {status.fechaHabilitacion && <span>Fecha: {status.fechaHabilitacion}</span>}
                <SuccessMessage>
                  ¡Felicidades! Tu empresa está habilitada como facturador electrónico.
                </SuccessMessage>
              </StepStatus>
            ) : (
              <Button 
                onClick={handleHabilitar} 
                disabled={!!processingAction}
                isLoading={processingAction === 'habilitacion'}
              >
                Completar Habilitación
              </Button>
            )}
          </StepContent>
        </StepCard>
      </StepGrid>
    </Container>
  );
};

const Container = styled.div`
  padding: var(--spacing-lg);
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: var(--spacing-xl);
  text-align: center;
  
  h1 {
    color: var(--color-primary);
    margin-bottom: var(--spacing-xs);
  }
  
  p {
    color: var(--color-text-secondary);
  }
`;

const StepGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const StepCard = styled.div<{ completed: boolean; disabled?: boolean; isLast?: boolean }>`
  display: flex;
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  border-left: 4px solid ${props => 
    props.completed ? 'var(--color-success)' : 
    props.disabled ? 'var(--color-border)' : 
    'var(--color-primary)'
  };
  opacity: ${props => props.disabled ? 0.7 : 1};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 25px;
    width: 2px;
    height: ${props => props.isLast ? '0' : 'var(--spacing-lg)'};
    background-color: ${props => 
      props.completed ? 'var(--color-success)' : 
      'var(--color-border)'
    };
  }
`;

const StepNumber = styled.div<{ completed: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => props.completed ? 'var(--color-success)' : 'var(--color-primary)'};
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-right: var(--spacing-lg);
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
  
  h3 {
    margin-top: 0;
    margin-bottom: var(--spacing-xs);
    color: var(--color-text-primary);
  }
  
  p {
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-md);
  }
`;

const StepStatus = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
  
  span {
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
  
  svg {
    margin-right: var(--spacing-xs);
  }
`;

const StepDisabled = styled.div`
  color: var(--color-warning);
  font-weight: var(--font-weight-medium);
  
  svg {
    margin-right: var(--spacing-xs);
  }
`;

const CertificateButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: 0;
  margin-top: var(--spacing-sm);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-xs);
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const SuccessMessage = styled.div`
  background-color: var(--color-success-bg);
  color: var(--color-success);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-sm);
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
`;

const ErrorMessage = styled.div`
  background-color: var(--color-error-bg);
  color: var(--color-error);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  text-align: center;
`;

export default HabilitacionPage;
