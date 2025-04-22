import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { FaArrowLeft, FaKey, FaFileAlt, FaCheck, FaDownload, FaCopy } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
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

const SimulatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const StepContainer = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
  }
`;

const StepTitle = styled.h2`
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

const Select = styled.select`
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
`;

const CertificatePreview = styled.div`
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  font-family: monospace;
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  overflow-x: auto;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  margin-top: var(--spacing-md);
  max-height: 300px;
  overflow-y: auto;
`;

const SuccessMessage = styled.div`
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-sm);
  }
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs);
  
  svg {
    margin-right: var(--spacing-xs);
  }
  
  &:hover {
    color: var(--color-primary-dark);
  }
`;

// Interfaces
interface CertificateFormData {
  commonName: string;
  organization: string;
  organizationalUnit: string;
  locality: string;
  state: string;
  country: string;
  email: string;
  validityDays: number;
  keySize: number;
  keyType: string;
}

const CertificateSimulator: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CertificateFormData>({
    commonName: user?.company?.name || '',
    organization: user?.company?.name || '',
    organizationalUnit: 'Facturación Electrónica',
    locality: 'Bogotá',
    state: 'Cundinamarca',
    country: 'CO',
    email: user?.email || '',
    validityDays: 365,
    keySize: 2048,
    keyType: 'RSA'
  });
  
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const [certificateContent, setCertificateContent] = useState('');
  const [privateKeyContent, setPrivateKeyContent] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'validityDays' || name === 'keySize' ? parseInt(value) : value
    });
  };
  
  const generateCertificate = () => {
    // Simulación de generación de certificado
    const serialNumber = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const now = new Date();
    const validFrom = now.toISOString().split('T')[0];
    const validTo = new Date(now.setDate(now.getDate() + formData.validityDays)).toISOString().split('T')[0];
    
    // Simulación de contenido de certificado
    const certContent = `-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIUE${serialNumber}AwDQYJKoZIhvcNAQELBQAwRTELMAkGA1UE
BhMCQ08xEzARBgNVBAgMCkN1bmRpbmFtYXJjYTEPMA0GA1UEBwwGQm9nb3RhMRAwDgYD
VQQKDAdTaW11bGFkbzAeFw0${validFrom.replace(/-/g, '')}T000000Z
Fw0${validTo.replace(/-/g, '')}T000000Z
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1jE74tGm4UT4lhuxIEZi
SUBJECT: ${formData.commonName}
ORGANIZATION: ${formData.organization}
OU: ${formData.organizationalUnit}
LOCALITY: ${formData.locality}
STATE: ${formData.state}
COUNTRY: ${formData.country}
EMAIL: ${formData.email}
VALIDITY: ${formData.validityDays} days
KEY TYPE: ${formData.keyType}
KEY SIZE: ${formData.keySize} bits
SERIAL: ${serialNumber}
-----END CERTIFICATE-----`;

    // Simulación de clave privada
    const keyContent = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWMTvi0abhRPiW
G7EgRmJJUDfCLg1nEHLUCVRm1qYkmzOmRJpAqZJLlY4PQfzGUAQjLbTtGFYgGhFi
pCQMNKO3YFEgITAyMDQyMTA4MTcxNzE4WhcNMjUwNDIxMDgxNzE4WjBFMQswCQYD
VQQGEwJDTzETMBEGA1UECAwKQ3VuZGluYW1hcmNhMQ8wDQYDVQQHDAZCb2dvdGEx
EDAOBgNVBAoMB1NpbXVsYWRvMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
AQEAuLxVt7XqIHxsYjHwZQZB6cVwlKUkUbFxVzNXQAsm+7aVw8Tp1CpgvbxQH+q5
KEY TYPE: ${formData.keyType}
KEY SIZE: ${formData.keySize} bits
CREATED: ${new Date().toISOString()}
-----END PRIVATE KEY-----`;

    setCertificateContent(certContent);
    setPrivateKeyContent(keyContent);
    setCertificateGenerated(true);
    setStep(3);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      generateCertificate();
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      title: '¡Copiado!',
      text: 'El contenido ha sido copiado al portapapeles',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };
  
  const saveCertificate = () => {
    // En un entorno real, aquí se guardaría el certificado en la base de datos
    Swal.fire({
      title: 'Guardando certificado',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Simulamos que se guarda y redirigimos a la lista de certificados
    setTimeout(() => {
      Swal.fire({
        title: '¡Guardado!',
        text: 'Certificado guardado con éxito',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/certificates');
      });
    }, 1500);
  };
  
  return (
    <Container>
      <Header>
        <BackButton variant="text" onClick={() => navigate('/certificates')}>
          <FaArrowLeft /> Volver
        </BackButton>
        <h1>Simulador de Certificados Digitales</h1>
      </Header>
      
      <SimulatorContainer>
        {step === 1 && (
          <StepContainer>
            <StepTitle><FaFileAlt /> Paso 1: Información del Certificado</StepTitle>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="commonName">Nombre Común (CN)</Label>
                <Input
                  type="text"
                  id="commonName"
                  name="commonName"
                  value={formData.commonName}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="organization">Organización (O)</Label>
                <Input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="organizationalUnit">Unidad Organizacional (OU)</Label>
                <Input
                  type="text"
                  id="organizationalUnit"
                  name="organizationalUnit"
                  value={formData.organizationalUnit}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="locality">Ciudad (L)</Label>
                <Input
                  type="text"
                  id="locality"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="state">Departamento (ST)</Label>
                <Input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="country">País (C)</Label>
                <Input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  maxLength={2}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <ButtonContainer>
                <Button type="submit" variant="primary">
                  Siguiente
                </Button>
              </ButtonContainer>
            </form>
          </StepContainer>
        )}
        
        {step === 2 && (
          <StepContainer>
            <StepTitle><FaKey /> Paso 2: Configuración Técnica</StepTitle>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="validityDays">Validez (días)</Label>
                <Input
                  type="number"
                  id="validityDays"
                  name="validityDays"
                  value={formData.validityDays}
                  onChange={handleChange}
                  min={1}
                  max={3650}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="keyType">Tipo de Clave</Label>
                <Select
                  id="keyType"
                  name="keyType"
                  value={formData.keyType}
                  onChange={handleChange}
                  required
                >
                  <option value="RSA">RSA</option>
                  <option value="DSA">DSA</option>
                  <option value="ECDSA">ECDSA</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="keySize">Tamaño de Clave (bits)</Label>
                <Select
                  id="keySize"
                  name="keySize"
                  value={formData.keySize}
                  onChange={handleChange}
                  required
                >
                  <option value={1024}>1024</option>
                  <option value={2048}>2048</option>
                  <option value={4096}>4096</option>
                </Select>
              </FormGroup>
              
              <ButtonContainer>
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button type="submit" variant="primary">
                  Generar Certificado
                </Button>
              </ButtonContainer>
            </form>
          </StepContainer>
        )}
        
        {step === 3 && (
          <StepContainer>
            <StepTitle><FaCheck /> Paso 3: Certificado Generado</StepTitle>
            
            <SuccessMessage>
              <FaCheck /> Certificado generado con éxito
            </SuccessMessage>
            
            <FormGroup>
              <Label>Certificado Digital</Label>
              <CopyButton onClick={() => copyToClipboard(certificateContent)}>
                <FaCopy /> Copiar
              </CopyButton>
              <CertificatePreview>
                {certificateContent}
              </CertificatePreview>
            </FormGroup>
            
            <FormGroup>
              <Label>Clave Privada</Label>
              <CopyButton onClick={() => copyToClipboard(privateKeyContent)}>
                <FaCopy /> Copiar
              </CopyButton>
              <CertificatePreview>
                {privateKeyContent}
              </CertificatePreview>
            </FormGroup>
            
            <ButtonContainer>
              <Button variant="secondary" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                <FaDownload /> Descargar
              </Button>
              <Button variant="primary" onClick={saveCertificate}>
                Guardar Certificado
              </Button>
            </ButtonContainer>
          </StepContainer>
        )}
      </SimulatorContainer>
    </Container>
  );
};

export default CertificateSimulator;
