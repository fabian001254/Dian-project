import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFileInvoice, FaChevronDown, FaChevronRight, FaEye, FaFileDownload, FaListUl } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import SectionLoader from '../../components/ui/SectionLoader';

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
    color: var(--color-text-primary);
  }
`;

const SearchBar = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 0 var(--spacing-sm);
  
  svg {
    color: var(--color-text-secondary);
    margin-right: var(--spacing-sm);
  }
  
  input {
    flex: 1;
    border: none;
    padding: 12px var(--spacing-sm);
    font-size: var(--font-size-sm);
    
    &:focus {
      outline: none;
    }
  }
`;

const CustomersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  
  th, td {
    padding: var(--spacing-md);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }
  
  th {
    background-color: var(--color-background);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }
  
  tbody tr:hover {
    background-color: var(--color-background);
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const InvoicesContainer = styled.div<{ isExpanded: boolean }>`
  display: ${props => props.isExpanded ? 'block' : 'none'};
  padding: var(--spacing-md);
  background-color: var(--color-background-light);
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
`;

const InvoicesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-white);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  font-size: var(--font-size-sm);
  
  th, td {
    padding: var(--spacing-sm);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }
  
  th {
    background-color: var(--color-background);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }
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
      case 'APPROVED':
        return `
          background-color: rgba(40, 167, 69, 0.1);
          color: #28a745;
        `;
      case 'PENDING':
        return `
          background-color: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        `;
      case 'REJECTED':
        return `
          background-color: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        `;
      case 'DRAFT':
        return `
          background-color: rgba(0, 123, 255, 0.1);
          color: #007bff;
        `;
      default:
        return `
          background-color: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        `;
    }
  }}
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  
  &:hover {
    background-color: var(--color-background);
  }
  
  svg {
    margin-right: var(--spacing-xs);
  }
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
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  
  &:hover {
    background-color: var(--color-background);
  }
  
  &.delete {
    color: var(--color-error);
    
    &:hover {
      background-color: var(--color-error-bg);
    }
  }
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

// Interfaces
interface Invoice {
  id: string;
  number: string;
  prefix: string;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  total: number;
}

interface Customer {
  id: string;
  name: string;
  identificationType: string;
  identificationNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  createdAt: string;
  invoices?: Invoice[];
}

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFullList, setShowFullList] = useState(true);
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  const [customerInvoices, setCustomerInvoices] = useState<Record<string, Invoice[]>>({});
  const [loadingInvoices, setLoadingInvoices] = useState<Record<string, boolean>>({});

  const { user } = useAuth();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/customers?companyId=${user?.companyId}`);
        
        if (response.data.success) {
          setCustomers(response.data.data);
        } else {
          throw new Error(response.data.message || 'Error al cargar los clientes');
        }
      } catch (err: any) {
        console.error('Error al cargar los clientes:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar los clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [user?.companyId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        const response = await axios.delete(`/api/customers/${id}`);
        
        if (response.data.success) {
          setCustomers(customers.filter(customer => customer.id !== id));
        } else {
          throw new Error(response.data.message || 'Error al eliminar el cliente');
        }
      } catch (err: any) {
        console.error('Error al eliminar el cliente:', err);
        alert(err.response?.data?.message || err.message || 'Error al eliminar el cliente');
      }
    }
  };
  
  const toggleInvoices = async (customerId: string) => {
    // Alternar el estado de expansión
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
    
    // Si ya tenemos las facturas o están cargando, no hacemos nada más
    if (customerInvoices[customerId] || loadingInvoices[customerId]) {
      return;
    }
    
    // Marcar como cargando
    setLoadingInvoices(prev => ({
      ...prev,
      [customerId]: true
    }));
    
    try {
      // Obtener facturas del cliente desde la API
      const response = await axios.get(`/api/invoices/customer/${customerId}`);
      const fetched = response.data?.data;
      if (Array.isArray(fetched)) {
        setCustomerInvoices(prev => ({
          ...prev,
          [customerId]: fetched
        }));
      } else {
        // Si no hay datos o formato incorrecto
        setCustomerInvoices(prev => ({
          ...prev,
          [customerId]: []
        }));
      }
    } catch (error) {
      console.error('Error al cargar las facturas del cliente:', error);
      // En caso de error, establecer un array vacío
      setCustomerInvoices(prev => ({
        ...prev,
        [customerId]: []
      }));
    } finally {
      setLoadingInvoices(prev => ({
        ...prev,
        [customerId]: false
      }));
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO').format(date);
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Aprobada';
      case 'PENDING':
        return 'Pendiente';
      case 'REJECTED':
        return 'Rechazada';
      case 'DRAFT':
        return 'Borrador';
      default:
        return status;
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.identificationNumber.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleView = () => {
    setShowFullList(!showFullList);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <SectionLoader message="Cargando clientes" size="large" />
      </div>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Clientes</h1>
        <div>
          <Button 
            variant="secondary"
            onClick={toggleView}
            style={{ marginRight: 'var(--spacing-sm)' }}
          >
            {showFullList ? 'Vista Resumida' : 'Vista Completa'}
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate('/customers/create')}
          >
            <FaPlus /> Nuevo Cliente
          </Button>
        </div>
      </Header>
      
      <SearchBar>
        <SearchInput>
          <FaSearch />
          <input 
            type="text" 
            placeholder="Buscar por nombre, identificación o correo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
      </SearchBar>
      
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState>
          <p>No se encontraron clientes que coincidan con tu búsqueda.</p>
          <Button 
            variant="primary"
            onClick={() => navigate('/customers/create')}
          >
            Crear Nuevo Cliente
          </Button>
        </EmptyState>
      ) : showFullList ? (
        <CustomersTable>
          <thead>
            <tr>
              <th>Nombre/Razón Social</th>
              <th>Tipo Doc.</th>
              <th>Número</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
              <th>Ciudad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <React.Fragment key={customer.id}>
                <tr>
                  <td>
                    <Link to={`/customers/${customer.id}`}>
                      {customer.name}
                    </Link>
                  </td>
                  <td>{customer.identificationType}</td>
                  <td>{customer.identificationNumber}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.city}</td>
                  <td>
                    <ActionButtons>
                      <ActionButton title="Editar" onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                        <FaEdit />
                      </ActionButton>
                      <ActionButton title="Crear Factura" onClick={() => navigate(`/invoices/create?customerId=${customer.id}`)}>
                        <FaFileInvoice />
                      </ActionButton>
                      <ActionButton title="Ver Todas las Facturas" onClick={() => navigate(`/invoices?customerId=${customer.id}`)}>
                        <FaListUl />
                      </ActionButton>
                      <ActionButton title="Mostrar Facturas" onClick={() => toggleInvoices(customer.id)}>
                        {expandedCustomers[customer.id] ? <FaChevronDown /> : <FaChevronRight />}
                      </ActionButton>
                      <ActionButton title="Eliminar" className="delete" onClick={() => handleDelete(customer.id)}>
                        <FaTrash />
                      </ActionButton>
                    </ActionButtons>
                  </td>
                </tr>
                {expandedCustomers[customer.id] && (
                  <tr>
                    <td colSpan={7}>
                      <InvoicesContainer isExpanded={true}>
                        {loadingInvoices[customer.id] ? (
                          <div>Cargando facturas...</div>
                        ) : customerInvoices[customer.id]?.length ? (
                          <>
                            <h4>Facturas del cliente</h4>
                            <InvoicesTable>
                              <thead>
                                <tr>
                                  <th>Número</th>
                                  <th>Fecha</th>
                                  <th>Vencimiento</th>
                                  <th>Total</th>
                                  <th>Estado</th>
                                  <th>Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customerInvoices[customer.id].map(invoice => (
                                  <tr key={invoice.id}>
                                    <td>{invoice.prefix}-{invoice.number}</td>
                                    <td>{formatDate(invoice.issueDate)}</td>
                                    <td>{formatDate(invoice.dueDate)}</td>
                                    <td>{formatCurrency(invoice.total)}</td>
                                    <td>
                                      <StatusBadge status={invoice.status}>
                                        {getStatusLabel(invoice.status)}
                                      </StatusBadge>
                                    </td>
                                    <td>
                                      <ActionButtons>
                                        <ActionButton title="Ver Factura" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                                          <FaEye />
                                        </ActionButton>
                                        <ActionButton title="Descargar PDF" onClick={() => alert('Descargando PDF...')}>
                                          <FaFileDownload />
                                        </ActionButton>
                                      </ActionButtons>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </InvoicesTable>
                            <Button 
                              variant="outline" 
                              size="small" 
                              style={{ marginTop: 'var(--spacing-sm)' }}
                              onClick={() => navigate(`/invoices?customerId=${customer.id}`)}
                            >
                              Ver todas las facturas
                            </Button>
                          </>
                        ) : (
                          <div>
                            <p>Este cliente no tiene facturas.</p>
                            <Button 
                              variant="primary" 
                              size="small"
                              onClick={() => navigate(`/invoices/create?customerId=${customer.id}`)}
                            >
                              Crear Nueva Factura
                            </Button>
                          </div>
                        )}
                      </InvoicesContainer>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </CustomersTable>
      ) : (
        <CustomersTable>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo Doc.</th>
              <th>Número</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.slice(0, 5).map(customer => (
              <React.Fragment key={customer.id}>
                <tr>
                  <td>
                    <Link to={`/customers/${customer.id}`}>
                      {customer.name}
                    </Link>
                  </td>
                  <td>{customer.identificationType}</td>
                  <td>{customer.identificationNumber}</td>
                  <td>
                    <ActionButtons>
                      <ActionButton title="Editar" onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                        <FaEdit />
                      </ActionButton>
                      <ActionButton title="Crear Factura" onClick={() => navigate(`/invoices/create?customerId=${customer.id}`)}>
                        <FaFileInvoice />
                      </ActionButton>
                      <ActionButton title="Ver Todas las Facturas" onClick={() => navigate(`/invoices?customerId=${customer.id}`)}>
                        <FaListUl />
                      </ActionButton>
                      <ActionButton title="Mostrar Facturas" onClick={() => toggleInvoices(customer.id)}>
                        {expandedCustomers[customer.id] ? <FaChevronDown /> : <FaChevronRight />}
                      </ActionButton>
                    </ActionButtons>
                  </td>
                </tr>
                {expandedCustomers[customer.id] && (
                  <tr>
                    <td colSpan={4}>
                      <InvoicesContainer isExpanded={true}>
                        {loadingInvoices[customer.id] ? (
                          <div>Cargando facturas...</div>
                        ) : customerInvoices[customer.id]?.length ? (
                          <>
                            <h4>Facturas del cliente</h4>
                            <InvoicesTable>
                              <thead>
                                <tr>
                                  <th>Número</th>
                                  <th>Fecha</th>
                                  <th>Total</th>
                                  <th>Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customerInvoices[customer.id].map(invoice => (
                                  <tr key={invoice.id}>
                                    <td>{invoice.prefix}-{invoice.number}</td>
                                    <td>{formatDate(invoice.issueDate)}</td>
                                    <td>{formatCurrency(invoice.total)}</td>
                                    <td>
                                      <StatusBadge status={invoice.status}>
                                        {getStatusLabel(invoice.status)}
                                      </StatusBadge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </InvoicesTable>
                            <Button 
                              variant="outline" 
                              size="small" 
                              style={{ marginTop: 'var(--spacing-sm)' }}
                              onClick={() => navigate(`/invoices?customerId=${customer.id}`)}
                            >
                              Ver todas las facturas
                            </Button>
                          </>
                        ) : (
                          <div>
                            <p>Este cliente no tiene facturas.</p>
                            <Button 
                              variant="primary" 
                              size="small"
                              onClick={() => navigate(`/invoices/create?customerId=${customer.id}`)}
                            >
                              Crear Nueva Factura
                            </Button>
                          </div>
                        )}
                      </InvoicesContainer>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </CustomersTable>
      )}
    </Container>
  );
};

export default CustomerListPage;
