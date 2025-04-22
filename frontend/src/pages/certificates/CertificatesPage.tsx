import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { FaPlus, FaSearch, FaFileDownload, FaCheck, FaTimes, FaKey, FaEye, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import SectionLoader from '../../components/ui/SectionLoader';
import Swal from 'sweetalert2';

// Styled components
const Container = styled.div`
  padding: var(--spacing-lg);
  max-width: 1200px;
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

const TableContainer = styled.div`
  overflow-x: auto;
  background-color: transparent;
  box-shadow: none;
  margin-bottom: var(--spacing-lg);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: transparent;
  
  /* Dark-mode overrides */
  html[data-theme='dark'] & {
    background-color: transparent;
    th, td {
      border-bottom-color: var(--color-border);
    }
    th {
      background-color: var(--color-bg-secondary);
      color: var(--color-text);
    }
  }
  
  th, td {
    padding: var(--spacing-md);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }
  
  th {
    background-color: var(--color-bg-secondary);
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
  }
`;

const Td = styled.td``;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primary);
  font-size: var(--font-size-md);
  padding: var(--spacing-xs);
  &:hover { color: var(--color-primary-dark); }
`;

const SearchBar = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: transparent;
  border-radius: var(--border-radius-md);
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-text);
  
  svg { 
    color: var(--color-text); 
    margin-right: var(--spacing-sm); 
  }
  
  input {
    flex: 1;
    border: none;
    padding: 12px var(--spacing-sm);
    font-size: var(--font-size-sm);
    background-color: transparent;
    color: var(--color-text);
    &::placeholder { 
      color: var(--color-text-light); 
    }
    &:focus { 
      outline: none; 
    }
  }
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    border: 1px solid var(--color-white);
    
    svg { 
      color: var(--color-white); 
    }
    
    input {
      color: var(--color-white);
      &::placeholder { 
        color: rgba(255,255,255,0.6); 
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  
  p {
    margin-bottom: var(--spacing-md);
    color: var(--color-text-secondary);
  }
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
}

const CertificatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFullList, setShowFullList] = useState(true);
  
  const { user } = useAuth();

  // Datos de ejemplo para simular certificados
  const mockCertificates: Certificate[] = [
    {
      id: '1',
      name: 'Certificado Digital DIAN',
      issuer: 'AC DIAN Colombia',
      serialNumber: '123456789ABCDEF',
      validFrom: '2025-01-01',
      validTo: '2026-01-01',
      status: 'ACTIVE',
      type: 'Facturación Electrónica',
      createdAt: '2025-01-01'
    },
    {
      id: '2',
      name: 'Certificado de Prueba',
      issuer: 'Simulador DIAN',
      serialNumber: '987654321FEDCBA',
      validFrom: '2025-03-15',
      validTo: '2025-06-15',
      status: 'ACTIVE',
      type: 'Pruebas',
      createdAt: '2025-03-15'
    }
  ];

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        // En un entorno real, aquí se haría la llamada a la API
        // const response = await axios.get(`/api/certificates?companyId=${user?.companyId}`);
        
        // Simulamos la respuesta con datos de ejemplo
        setTimeout(() => {
          setCertificates(mockCertificates);
          setLoading(false);
        }, 800);
      } catch (err: any) {
        console.error('Error al cargar los certificados:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar los certificados');
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user?.companyId]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
      try {
        // En un entorno real, aquí se haría la llamada a la API
        // await axios.delete(`/api/certificates/${id}`);
        
        // Simulamos la eliminación
        setCertificates(certificates.filter(cert => cert.id !== id));
        
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El certificado ha sido eliminado correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err: any) {
        console.error('Error al eliminar el certificado:', err);
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || err.message || 'Error al eliminar el certificado',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
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

  const filteredCertificates = certificates.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <SectionLoader message="Cargando certificados" size="large" />
      </div>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Certificados Digitales</h1>
        <div>
          <Button
            variant="secondary"
            onClick={() => setShowFullList(!showFullList)}
            style={{ marginRight: 'var(--spacing-sm)' }}
          >
            {showFullList ? 'Vista Resumida' : 'Vista Completa'}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/certificates/simulator')}
            style={{ marginRight: 'var(--spacing-sm)' }}
          >
            <FaKey /> Simulador
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/certificates/create')}
          >
            <FaPlus /> Nuevo Certificado
          </Button>
        </div>
      </Header>
      <SearchBar>
        <SearchInput>
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por nombre o número de serie..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </SearchInput>
      </SearchBar>
      
      {error ? (
        <EmptyState>
          <p>{error}</p>
        </EmptyState>
      ) : filteredCertificates.length === 0 ? (
        <EmptyState>
          <p>No se encontraron certificados con los criterios de búsqueda.</p>
          <Button variant="primary" onClick={() => navigate('/certificates/create')}>
            <FaPlus /> Crear nuevo certificado
          </Button>
        </EmptyState>
      ) : loading ? (
        <SectionLoader />
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                {showFullList && (
                  <>
                    <th>Emisor</th>
                    <th>Número de Serie</th>
                    <th>Válido Desde</th>
                    <th>Válido Hasta</th>
                  </>
                )}
                <th>Estado</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map(certificate => (
                <tr key={certificate.id}>
                  <Td>{certificate.name}</Td>
                  {showFullList && (
                    <>
                      <Td>{certificate.issuer}</Td>
                      <Td>{certificate.serialNumber}</Td>
                      <Td>{formatDate(certificate.validFrom)}</Td>
                      <Td>{formatDate(certificate.validTo)}</Td>
                    </>
                  )}
                  <Td>
                    <StatusBadge status={certificate.status}>
                      {getStatusLabel(certificate.status)}
                    </StatusBadge>
                  </Td>
                  <Td>{certificate.type}</Td>
                  <Td>
                    <ActionButtons>
                      <ActionButton title="Ver Detalles" onClick={() => navigate(`/certificates/${certificate.id}`)}>
                        <FaEye />
                      </ActionButton>
                      <ActionButton title="Descargar PDF" onClick={() => {
                        Swal.fire({
                          title: 'Generando PDF',
                          text: 'Por favor espere mientras se genera el documento...',
                          allowOutsideClick: false,
                          didOpen: () => {
                            Swal.showLoading();
                          }
                        });
                        
                        setTimeout(() => {
                          Swal.fire({
                            title: '¡Descarga completada!',
                            text: 'El certificado ha sido descargado correctamente',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                          });
                        }, 1500);
                      }}>
                        <FaFileDownload />
                      </ActionButton>
                      <ActionButton title="Eliminar" className="delete" onClick={() => handleDelete(certificate.id)}>
                        <FaTrash />
                      </ActionButton>
                    </ActionButtons>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default CertificatesPage;
