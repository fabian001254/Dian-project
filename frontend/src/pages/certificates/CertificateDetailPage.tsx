import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { FaArrowLeft, FaFileDownload, FaFilePdf, FaKey, FaCheck, FaTimes, FaInfoCircle, FaEye, FaEyeSlash, FaCopy } from 'react-icons/fa';
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

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const DetailSection = styled.div`
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

const InfoRow = styled.div`
  display: flex;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-md);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const InfoLabel = styled.div`
  width: 200px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: var(--spacing-xs);
  }
`;

const InfoValue = styled.div`
  flex: 1;
  color: var(--color-text);
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  
  ${props => {
    const key = props.status.toUpperCase();
    switch (key) {
      case 'ACTIVE':
        return `
          background-color: rgba(40, 167, 69, 0.1);
          color: #28a745;
        `;
      case 'EXPIRED':
        return `
          background-color: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        `;
      case 'REVOKED':
        return `
          background-color: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        `;
      default:
        return `
          background-color: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        `;
    }
  }}
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
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

const PasswordInputWrapper = styled.div`
  position: relative;
  margin-bottom: var(--spacing-md);
`;

const PasswordInput = styled.input`
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

const CertificateVisual = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-md);
  position: relative;
  font-family: 'Times New Roman', Times, serif;
  color: #000;
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: #2c3e50;
    border-color: #4a5568;
    color: #f8f9fa;
  }
`;

const CertificateHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-lg);
  
  h2 {
    font-size: 24px;
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
`;

const CertificateBody = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const CertificateField = styled.div`
  margin-bottom: var(--spacing-sm);
  display: flex;
  
  strong {
    width: 200px;
    display: inline-block;
  }
`;

const CertificateFooter = styled.div`
  text-align: center;
  margin-top: var(--spacing-lg);
  border-top: 1px solid #dee2e6;
  padding-top: var(--spacing-md);
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    border-color: #4a5568;
  }
`;

const CertificateSeal = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 100px;
  height: 100px;
  border: 2px solid #dc3545;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-15deg);
  color: #dc3545;
  font-weight: bold;
  font-size: 12px;
  text-align: center;
`;

// Interfaces
interface Certificate {
  id: string;
  name: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'PENDING';
  type: string;
  createdAt: string;
  subject: {
    commonName: string;
    organization: string;
    organizationalUnit: string;
    locality: string;
    state: string;
    country: string;
    email: string;
  };
  keyInfo: {
    algorithm: string;
    size: number;
    usage: string;
  };
  certificateContent: string;
}

const CertificateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showCertificateContent, setShowCertificateContent] = useState(false);
  
  // Datos de ejemplo para simular un certificado
  const mockCertificate: Certificate = {
    id: '1',
    name: 'Certificado Digital DIAN',
    issuer: 'AC DIAN Colombia',
    serialNumber: '123456789ABCDEF',
    validFrom: '2025-01-01',
    validTo: '2026-01-01',
    status: 'ACTIVE',
    type: 'Facturación Electrónica',
    createdAt: '2025-01-01',
    subject: {
      commonName: user?.company?.name || 'Empresa Demo',
      organization: user?.company?.name || 'Empresa Demo',
      organizationalUnit: 'Facturación Electrónica',
      locality: 'Bogotá',
      state: 'Cundinamarca',
      country: 'CO',
      email: user?.email || 'demo@example.com'
    },
    keyInfo: {
      algorithm: 'RSA',
      size: 2048,
      usage: 'Digital Signature, Key Encipherment'
    },
    certificateContent: `-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIUE123456789ABCDEFAwDQYJKoZIhvcNAQELBQAwRTELMAkGA1UE
BhMCQ08xEzARBgNVBAgMCkN1bmRpbmFtYXJjYTEPMA0GA1UEBwwGQm9nb3RhMRAwDgYD
VQQKDAdTaW11bGFkbzAeFw0yNTAxMDFUMDAwMDAwWjBFMQswCQYDVQQGEwJDTzETMBEG
A1UECAwKQ3VuZGluYW1hcmNhMQ8wDQYDVQQHDAZCb2dvdGExEDAOBgNVBAoMB1NpbXVs
YWRvMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1jE74tGm4UT4lhuxIEZi
JUDfCLg1nEHLUCVRm1qYkmzOmRJpAqZJLlY4PQfzGUAQjLbTtGFYgGhFipCQMNKO3YFE
gITAyMDQyMTA4MTcxNzE4WhcNMjUwNDIxMDgxNzE4WjBFMQswCQYDVQQGEwJDTzETMBEG
A1UECAwKQ3VuZGluYW1hcmNhMQ8wDQYDVQQHDAZCb2dvdGExEDAOBgNVBAoMB1NpbXVs
YWRvMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuLxVt7XqIHxsYjHwZQZB
6cVwlKUkUbFxVzNXQAsm+7aVw8Tp1CpgvbxQH+q5SUBJECT: ${user?.company?.name || 'Empresa Demo'}
ORGANIZATION: ${user?.company?.name || 'Empresa Demo'}
OU: Facturación Electrónica
LOCALITY: Bogotá
STATE: Cundinamarca
COUNTRY: CO
EMAIL: ${user?.email || 'demo@example.com'}
VALIDITY: 365 days
KEY TYPE: RSA
KEY SIZE: 2048 bits
SERIAL: 123456789ABCDEF
-----END CERTIFICATE-----`
  };

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        // En un entorno real, aquí se haría la llamada a la API
        // const response = await api.get(`/api/certificates/${id}`);
        
        // Simulamos la respuesta con datos de ejemplo
        setTimeout(() => {
          setCertificate(mockCertificate);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        console.error('Error al cargar el certificado:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar el certificado');
        setLoading(false);
      }
    };

    if (id) {
      fetchCertificate();
    }
  }, [id, user]);

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
  
  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'Activo';
      case 'EXPIRED':
        return 'Expirado';
      case 'REVOKED':
        return 'Revocado';
      case 'PENDING':
        return 'Pendiente';
      default:
        return status;
    }
  };
  
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadAsPdf = () => {
    Swal.fire({
      title: 'Generando PDF',
      text: 'Por favor espere mientras se genera el documento...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Simulamos un breve retraso antes de iniciar la descarga
    setTimeout(() => {
      try {
        // Usamos window.open para abrir una nueva ventana/pestaña
        // con un PDF de ejemplo de la web
        const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        const newWindow = window.open(pdfUrl, '_blank');
        
        // Si el navegador bloquea la ventana emergente, ofrecemos un enlace directo
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          Swal.fire({
            title: 'Descarga bloqueada',
            html: `El navegador ha bloqueado la descarga automática. <br><br>
                  <a href="${pdfUrl}" download="certificado_ejemplo.pdf" target="_blank" style="color: blue; text-decoration: underline;">
                    Haga clic aquí para descargar manualmente
                  </a>`,
            icon: 'warning',
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            title: '¡Descarga iniciada!',
            text: 'El certificado se está descargando en una nueva pestaña',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } catch (error) {
        console.error('Error al iniciar la descarga:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ha ocurrido un error al generar el PDF',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    }, 1500);
  };
  
  const verifyPassword = () => {
    // Simulación de verificación de contraseña
    if (password) {
      setShowCertificateContent(true);
      Swal.fire({
        title: '¡Verificación exitosa!',
        text: 'Contraseña correcta',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Por favor ingrese la contraseña del certificado',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <SectionLoader message="Cargando certificado" size="large" />
      </div>
    );
  }
  
  if (error || !certificate) {
    return (
      <Container>
        <Header>
          <BackButton variant="text" onClick={() => navigate('/certificates')}>
            <FaArrowLeft /> Volver
          </BackButton>
          <h1>Detalle del Certificado</h1>
        </Header>
        <DetailSection>
          <p>Error: {error || 'No se pudo cargar el certificado'}</p>
          <Button variant="primary" onClick={() => navigate('/certificates')}>
            Volver a la lista de certificados
          </Button>
        </DetailSection>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <BackButton variant="text" onClick={() => navigate('/certificates')}>
          <FaArrowLeft /> Volver
        </BackButton>
        <h1>Detalle del Certificado</h1>
      </Header>
      
      <DetailContainer>
        <DetailSection>
          <SectionTitle><FaKey /> Información del Certificado</SectionTitle>
          
          <InfoRow>
            <InfoLabel>Nombre</InfoLabel>
            <InfoValue>{certificate.name}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Estado</InfoLabel>
            <InfoValue>
              <StatusBadge status={certificate.status}>
                {getStatusLabel(certificate.status)}
              </StatusBadge>
            </InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Emisor</InfoLabel>
            <InfoValue>{certificate.issuer}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Número de Serie</InfoLabel>
            <InfoValue>{certificate.serialNumber}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Válido Desde</InfoLabel>
            <InfoValue>{formatDate(certificate.validFrom)}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Válido Hasta</InfoLabel>
            <InfoValue>{formatDate(certificate.validTo)}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Días Restantes</InfoLabel>
            <InfoValue>{getDaysRemaining(certificate.validTo)}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Tipo</InfoLabel>
            <InfoValue>{certificate.type}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Fecha de Creación</InfoLabel>
            <InfoValue>{formatDate(certificate.createdAt)}</InfoValue>
          </InfoRow>
        </DetailSection>
        
        <DetailSection>
          <SectionTitle><FaInfoCircle /> Información del Sujeto</SectionTitle>
          
          <InfoRow>
            <InfoLabel>Nombre Común (CN)</InfoLabel>
            <InfoValue>{certificate.subject.commonName}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Organización (O)</InfoLabel>
            <InfoValue>{certificate.subject.organization}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Unidad Organizacional (OU)</InfoLabel>
            <InfoValue>{certificate.subject.organizationalUnit}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Ciudad (L)</InfoLabel>
            <InfoValue>{certificate.subject.locality}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Departamento (ST)</InfoLabel>
            <InfoValue>{certificate.subject.state}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>País (C)</InfoLabel>
            <InfoValue>{certificate.subject.country}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Correo Electrónico</InfoLabel>
            <InfoValue>{certificate.subject.email}</InfoValue>
          </InfoRow>
        </DetailSection>
        
        <DetailSection>
          <SectionTitle><FaKey /> Información de la Clave</SectionTitle>
          
          <InfoRow>
            <InfoLabel>Algoritmo</InfoLabel>
            <InfoValue>{certificate.keyInfo.algorithm}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Tamaño</InfoLabel>
            <InfoValue>{certificate.keyInfo.size} bits</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Uso</InfoLabel>
            <InfoValue>{certificate.keyInfo.usage}</InfoValue>
          </InfoRow>
        </DetailSection>
        
        <DetailSection>
          <SectionTitle><FaFilePdf /> Visualización del Certificado</SectionTitle>
          
          <CertificateVisual ref={certificateRef}>
            <CertificateHeader>
              <h2>CERTIFICADO DIGITAL</h2>
              <p>Autoridad Certificadora DIAN Colombia</p>
            </CertificateHeader>
            
            <CertificateBody>
              <CertificateField>
                <strong>Número de Serie:</strong> {certificate.serialNumber}
              </CertificateField>
              <CertificateField>
                <strong>Sujeto:</strong> {certificate.subject.commonName}
              </CertificateField>
              <CertificateField>
                <strong>Organización:</strong> {certificate.subject.organization}
              </CertificateField>
              <CertificateField>
                <strong>Unidad Organizacional:</strong> {certificate.subject.organizationalUnit}
              </CertificateField>
              <CertificateField>
                <strong>Ubicación:</strong> {certificate.subject.locality}, {certificate.subject.state}, {certificate.subject.country}
              </CertificateField>
              <CertificateField>
                <strong>Correo Electrónico:</strong> {certificate.subject.email}
              </CertificateField>
              <CertificateField>
                <strong>Emisor:</strong> {certificate.issuer}
              </CertificateField>
              <CertificateField>
                <strong>Válido Desde:</strong> {formatDate(certificate.validFrom)}
              </CertificateField>
              <CertificateField>
                <strong>Válido Hasta:</strong> {formatDate(certificate.validTo)}
              </CertificateField>
              <CertificateField>
                <strong>Algoritmo:</strong> {certificate.keyInfo.algorithm}, {certificate.keyInfo.size} bits
              </CertificateField>
              <CertificateField>
                <strong>Uso de la Clave:</strong> {certificate.keyInfo.usage}
              </CertificateField>
            </CertificateBody>
            
            <CertificateFooter>
              <p>Este certificado es válido para la emisión de facturas electrónicas según normativa DIAN.</p>
              <p>Fecha de emisión: {formatDate(certificate.createdAt)}</p>
            </CertificateFooter>
            
            <CertificateSeal>
              CERTIFICADO VÁLIDO
            </CertificateSeal>
          </CertificateVisual>
          
          <ButtonContainer>
            <Button variant="primary" onClick={downloadAsPdf}>
              <FaFilePdf /> Descargar como PDF
            </Button>
          </ButtonContainer>
        </DetailSection>
        
        <DetailSection>
          <SectionTitle><FaFileDownload /> Contenido del Certificado</SectionTitle>
          
          {!showCertificateContent ? (
            <>
              <p>Para ver el contenido del certificado, ingrese la contraseña:</p>
              <PasswordInputWrapper>
                <PasswordInput
                  type={showPassword ? 'text' : 'password'}
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
              <Button variant="primary" onClick={verifyPassword}>
                Verificar Contraseña
              </Button>
            </>
          ) : (
            <>
              <CopyButton onClick={() => copyToClipboard(certificate.certificateContent)}>
                <FaCopy /> Copiar
              </CopyButton>
              <CertificatePreview>
                {certificate.certificateContent}
              </CertificatePreview>
            </>
          )}
        </DetailSection>
      </DetailContainer>
    </Container>
  );
};

export default CertificateDetailPage;
