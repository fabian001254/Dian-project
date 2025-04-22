import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { FaArrowLeft, FaUpload, FaKey, FaEye, FaEyeSlash, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import SectionLoader from '../../components/ui/SectionLoader';
import Swal from 'sweetalert2';

// Styled components
const Container = styled.div`
  padding: var(--spacing-lg);
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  h1 {
    margin: 0;
    color: var(--color-text);
  }
`;

const BackButton = styled(Button)`
  margin-right: auto;
`;

const ConfigContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const ConfigSection = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
  }
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-sm);
  }
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  background-color: var(--color-white);
  color: var(--color-text);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
  }
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
    border-color: var(--color-border);
  }
`;

const FileInput = styled.div`
  position: relative;
  margin-bottom: var(--spacing-md);
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--color-primary);
  }
  
  svg {
    margin-right: var(--spacing-sm);
  }
`;

const HiddenFileInput = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
`;

const SelectedFile = styled.div`
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  
  &:hover {
    color: var(--color-danger-dark);
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  
  &:hover {
    color: var(--color-text);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
`;

const StatusContainer = styled.div`
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-bg-secondary);
`;

const StatusItem = styled.div<{ status: 'valid' | 'invalid' | 'warning' | 'neutral' }>`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  svg {
    margin-right: var(--spacing-sm);
    ${props => {
      switch (props.status) {
        case 'valid':
          return 'color: #28a745;';
        case 'invalid':
          return 'color: #dc3545;';
        case 'warning':
          return 'color: #ffc107;';
        default:
          return 'color: var(--color-text-secondary);';
      }
    }}
  }
`;

const InfoMessage = styled.div`
  background-color: rgba(13, 202, 240, 0.1);
  border-left: 3px solid #0dcaf0;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  
  p {
    margin: 0;
    color: var(--color-text);
  }
`;

// Interfaces
interface CertificateConfig {
  id: string;
  name: string;
  fileName: string;
  password: string;
  status: 'valid' | 'invalid' | 'warning';
  validFrom: string;
  validTo: string;
  issuer: string;
  serialNumber: string;
}

const CertificateConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [config, setConfig] = useState<CertificateConfig | null>(null);
  const [password, setPassword] = useState('');
  const [validationStatus, setValidationStatus] = useState<'none' | 'validating' | 'success' | 'error'>('none');
  
  // Datos de ejemplo para simular un certificado configurado
  const mockConfig: CertificateConfig = {
    id: '1',
    name: 'Certificado Digital DIAN',
    fileName: 'certificado_dian.p12',
    password: '********',
    status: 'valid',
    validFrom: '2025-01-01',
    validTo: '2026-01-01',
    issuer: 'AC DIAN Colombia',
    serialNumber: '123456789ABCDEF'
  };
  
  useEffect(() => {
    // Simulamos la carga de la configuración
    setTimeout(() => {
      setConfig(mockConfig);
      setLoading(false);
    }, 800);
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertificateFile(e.target.files[0]);
    }
  };
  
  const removeFile = () => {
    setCertificateFile(null);
    // Reset the file input
    const fileInput = document.getElementById('certificateFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  const validateCertificate = () => {
    setValidationStatus('validating');
    
    Swal.fire({
      title: 'Validando certificado',
      text: 'Por favor espere mientras se valida el certificado...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Simulamos la validación del certificado
    setTimeout(() => {
      setValidationStatus('success');
      
      // Actualizamos la configuración con los datos del nuevo certificado
      if (certificateFile) {
        setConfig({
          ...mockConfig,
          fileName: certificateFile.name,
          password: password
        });
      }
      
      Swal.fire({
        title: '¡Validación exitosa!',
        text: 'El certificado ha sido validado y guardado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }, 1500);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  
  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <SectionLoader message="Cargando configuración" size="large" />
      </div>
    );
  }
  
  return (
    <Container>
      <Header>
        <BackButton variant="text" onClick={() => navigate('/certificates')}>
          <FaArrowLeft /> Volver
        </BackButton>
        <h1>Configuración de Certificados</h1>
      </Header>
      
      <ConfigContainer>
        <InfoMessage>
          <p><FaInfoCircle /> Esta sección le permite configurar el certificado digital que se utilizará para firmar sus facturas electrónicas. El certificado debe estar en formato PKCS#12 (.p12 o .pfx).</p>
        </InfoMessage>
        
        <ConfigSection>
          <SectionTitle><FaKey /> Certificado Digital</SectionTitle>
          
          {config && (
            <StatusContainer>
              <h3>Certificado Actual</h3>
              <StatusItem status={config.status}>
                {config.status === 'valid' ? <FaCheck /> : config.status === 'invalid' ? <FaTimes /> : <FaInfoCircle />}
                <span>Nombre: {config.name}</span>
              </StatusItem>
              <StatusItem status="neutral">
                <span>Archivo: {config.fileName}</span>
              </StatusItem>
              <StatusItem status="neutral">
                <span>Emisor: {config.issuer}</span>
              </StatusItem>
              <StatusItem status="neutral">
                <span>Número de Serie: {config.serialNumber}</span>
              </StatusItem>
              <StatusItem status={getDaysRemaining(config.validTo) < 30 ? 'warning' : 'valid'}>
                <span>Válido desde: {formatDate(config.validFrom)} hasta: {formatDate(config.validTo)}</span>
              </StatusItem>
              <StatusItem status={getDaysRemaining(config.validTo) < 30 ? 'warning' : 'valid'}>
                <span>Días restantes: {getDaysRemaining(config.validTo)}</span>
              </StatusItem>
            </StatusContainer>
          )}
          
          <FormGroup>
            <Label>Cargar Nuevo Certificado</Label>
            <FileInput>
              <FileInputLabel htmlFor="certificateFile">
                <FaUpload /> Seleccionar archivo de certificado (.p12 o .pfx)
              </FileInputLabel>
              <HiddenFileInput
                type="file"
                id="certificateFile"
                accept=".p12,.pfx"
                onChange={handleFileChange}
              />
              {certificateFile && (
                <SelectedFile>
                  <span>{certificateFile.name}</span>
                  <RemoveFileButton onClick={removeFile}>
                    <FaTimes />
                  </RemoveFileButton>
                </SelectedFile>
              )}
            </FileInput>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Contraseña del Certificado</Label>
            <PasswordInputWrapper>
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese la contraseña del certificado"
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </PasswordInputWrapper>
          </FormGroup>
          
          <ButtonContainer>
            <Button
              variant="primary"
              onClick={validateCertificate}
              disabled={!certificateFile || !password || validationStatus === 'validating'}
            >
              {validationStatus === 'validating' ? 'Validando...' : 'Validar y Guardar'}
            </Button>
          </ButtonContainer>
          
          {validationStatus === 'success' && (
            <StatusItem status="valid" style={{ marginTop: 'var(--spacing-md)' }}>
              <FaCheck /> Certificado validado y guardado correctamente
            </StatusItem>
          )}
          
          {validationStatus === 'error' && (
            <StatusItem status="invalid" style={{ marginTop: 'var(--spacing-md)' }}>
              <FaTimes /> Error al validar el certificado. Verifique el archivo y la contraseña
            </StatusItem>
          )}
        </ConfigSection>
      </ConfigContainer>
    </Container>
  );
};

export default CertificateConfigPage;
