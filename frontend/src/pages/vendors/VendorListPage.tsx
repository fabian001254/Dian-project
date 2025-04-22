import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SectionLoader from '../../components/ui/SectionLoader';
import { FaEdit, FaTrash, FaEye, FaChevronDown, FaChevronRight, FaFileDownload, FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface Vendor {
  id: string;
  name: string;
  // Relación user para doc. de vendor
  user?: {
    identificationType: string;
    identificationNumber: string;
  };
  city?: string;
  phone?: string;
  email?: string;
}

interface Invoice {
  id: string;
  prefix: string;
  number: string;
  issueDate: string;
  dueDate: string;
  total: number;
  status: string;
}

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
`;

const Title = styled.h1`
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin: 0;
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

const Th = styled.th`
  background-color: var(--color-bg-secondary);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
`;

const Td = styled.td`
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
`;

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

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  ${props => {
    const key = props.status.toUpperCase();
    switch (key) {
      case 'APPROVED': return `background-color: rgba(40, 167, 69, 0.1); color: #28a745;`;
      case 'PENDING': return `background-color: rgba(255, 193, 7, 0.1); color: #ffc107;`;
      case 'REJECTED': return `background-color: rgba(220, 53, 69, 0.1); color: #dc3545;`;
      case 'DRAFT': return `background-color: rgba(0, 123, 255, 0.1); color: #007bff;`;
      default: return `background-color: rgba(108, 117, 125, 0.1); color: #6c757d;`;
    }
  }}
`;

const VendorListPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVendors, setExpandedVendors] = useState<Record<string, boolean>>({});
  const [showFullList, setShowFullList] = useState(true);
  const [vendorInvoices, setVendorInvoices] = useState<Record<string, Invoice[]>>({});
  const [loadingInvoices, setLoadingInvoices] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.user?.identificationNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Desea eliminar este vendedor?')) return;
    try {
      await axios.delete(`/api/vendors/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setVendors(vendors.filter(v => v.id !== id));
      Swal.fire('Eliminado', 'Vendedor eliminado correctamente', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No se pudo eliminar vendedor';
      Swal.fire('Error', msg, 'error');
    }
  };

  const toggleInvoices = async (vendorId: string) => {
    const isExpanded = expandedVendors[vendorId];
    if (isExpanded) {
      setExpandedVendors({ ...expandedVendors, [vendorId]: false });
      return;
    }
    setExpandedVendors(prev => ({ ...prev, [vendorId]: true }));
    setLoadingInvoices(prev => ({ ...prev, [vendorId]: true }));
    try {
      // Usar endpoint dedicado para facturas de vendedor
      const res = await axios.get(`/api/invoices/vendor/${vendorId}`);
      const invoices = res.data.success ? res.data.data : [];
      setVendorInvoices(prev => ({ ...prev, [vendorId]: invoices }));
    } catch {
      setVendorInvoices(prev => ({ ...prev, [vendorId]: [] }));
    }
    setLoadingInvoices(prev => ({ ...prev, [vendorId]: false }));
  };

  useEffect(() => {
    axios.get('/api/vendors')
      .then(res => setVendors(res.data.data || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SectionLoader />;

  return (
    <Container>
      <Header>
        <Title>Vendedores</Title>
        <div>
          <Button
            variant="secondary"
            onClick={() => setShowFullList(!showFullList)}
            style={{ marginRight: 'var(--spacing-sm)' }}
          >
            {showFullList ? 'Vista Resumida' : 'Vista Completa'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/vendors/create')}>Crear Vendedor</Button>
        </div>
      </Header>
      <SearchBar>
        <SearchInput>
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </SearchInput>
      </SearchBar>
      <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                {showFullList && (
                  <>
                    <Th>Tipo Documento</Th>
                    <Th>Número Documento</Th>
                    <Th>Ciudad</Th>
                    <Th>Teléfono</Th>
                    <Th>Email</Th>
                  </>
                )}
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map(v => (
                <React.Fragment key={v.id}>
                  <tr>
                    <Td>{v.name}</Td>
                    {showFullList && (
                      <>
                        <Td>{v.user?.identificationType}</Td>
                        <Td>{v.user?.identificationNumber}</Td>
                        <Td>{v.city}</Td>
                        <Td>{v.phone}</Td>
                        <Td>{v.email}</Td>
                      </>
                    )}
                    <Td>
                      <ActionButtons>
                        <ActionButton title="Ver" onClick={() => navigate(`/vendors/${v.id}`)}><FaEye /></ActionButton>
                        <ActionButton title="Editar" onClick={() => navigate(`/vendors/${v.id}/edit`)}><FaEdit /></ActionButton>
                        <ActionButton title="Eliminar" onClick={() => handleDelete(v.id)}><FaTrash /></ActionButton>
                        <ActionButton title="Facturas" onClick={() => toggleInvoices(v.id)}>
                          {expandedVendors[v.id] ? <FaChevronDown /> : <FaChevronRight />}
                        </ActionButton>
                      </ActionButtons>
                    </Td>
                  </tr>
                  {expandedVendors[v.id] && (
                    <tr key={`inv-${v.id}`}>
                      <td colSpan={7}>
                        {loadingInvoices[v.id] ? (<div>Cargando facturas...</div>) : (
                          vendorInvoices[v.id]?.length ? (
                            <><h4 style={{margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-text-secondary)'}}>Facturas</h4><Table>
                              <thead><tr><Th>Número</Th><Th>Fecha</Th><Th>Vencimiento</Th><Th>Total</Th><Th>Estado</Th><Th>Acciones</Th></tr></thead>
                              <tbody>
                                {vendorInvoices[v.id].map(inv => (
                                  <tr key={inv.id}>
                                    <Td>{`${inv.prefix}-${inv.number}`}</Td>
                                    <Td>{new Date(inv.issueDate).toLocaleDateString()}</Td>
                                    <Td>{new Date(inv.dueDate).toLocaleDateString()}</Td>
                                    <Td>{`$ ${inv.total.toLocaleString()}`}</Td>
                                    <Td><StatusBadge status={inv.status}>{inv.status}</StatusBadge></Td>
                                    <Td>
                                      <ActionButtons>
                                        <ActionButton title="Ver" onClick={() => navigate(`/invoices/${inv.id}`)}><FaEye /></ActionButton>
                                        <ActionButton title="Descargar" onClick={() => window.open(`/api/invoices/${inv.id}/download/pdf`, '_blank')}><FaFileDownload /></ActionButton>
                                      </ActionButtons>
                                    </Td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table></>
                          ) : <div>No hay facturas</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
      </TableContainer>
    </Container>
  );
};

export default VendorListPage;
