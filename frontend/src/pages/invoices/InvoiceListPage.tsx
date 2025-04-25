import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaFilter, FaFileDownload, FaEye, FaChevronRight, FaChevronDown, FaPaperPlane } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import SectionLoader from '../../components/ui/SectionLoader';
import { useAuth } from '../../context/AuthContext';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin: 0;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const FilterContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: var(--color-gray-light);
`;

const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }
  
  &:hover {
    background-color: var(--color-gray-lightest);
  }
`;

const TableHeaderCell = styled.th`
  padding: var(--spacing-md);
  text-align: left;
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
`;

const TableCell = styled.td`
  padding: var(--spacing-md);
  color: var(--color-text);
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
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

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-lg);
`;

const PageInfo = styled.div`
  color: var(--color-text);
  font-size: var(--font-size-sm);
`;

const PageButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-gray-dark);
`;

const CustomerSection = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const CustomerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
  border: 1px solid var(--color-border);
  cursor: pointer;
  
  &:hover {
    background-color: var(--color-gray-lightest);
  }
`;

const CustomerName = styled.h3`
  margin: 0;
  font-size: var(--font-size-md);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: var(--spacing-sm);
    transition: transform 0.2s ease;
  }
  
  &.expanded svg {
    transform: rotate(90deg);
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`;

const CustomerDetails = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const InvoiceCount = styled.span`
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  padding: 2px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
`;

const CustomerInvoices = styled.div<{ isExpanded: boolean }>`
  display: ${props => props.isExpanded ? 'block' : 'none'};
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
  overflow: hidden;
`;

interface Customer {
  id: string;
  name: string;
  identificationType: string;
  identificationNumber: string;
}

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

interface Invoice {
  id: string;
  number: string;
  prefix: string;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  subtotal: number;
  taxTotal: number;
  total: number;
  customer: Customer;
  customerId: string;
  items?: InvoiceItem[];
  createdBy?: string;
  createdByName?: string;
}

const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId');
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [creatorFilter, setCreatorFilter] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Estado para controlar qué secciones de cliente están expandidas
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  const [loadingInvoices, setLoadingInvoices] = useState<Record<string, boolean>>({});
  
  // Estado para almacenar las facturas agrupadas por cliente
  const [invoicesByCustomer, setInvoicesByCustomer] = useState<Record<string, Invoice[]>>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [creators, setCreators] = useState<{id: string, name: string}[]>([]);
  
  // Función para agrupar facturas por cliente
  const groupInvoicesByCustomer = (invoices: Invoice[]): Record<string, Invoice[]> => {
    const grouped: Record<string, Invoice[]> = {};
    
    invoices.forEach(invoice => {
      const customerId = invoice.customerId;
      if (!grouped[customerId]) {
        grouped[customerId] = [];
      }
      grouped[customerId].push(invoice);
    });
    
    return grouped;
  };
  
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Obtener las facturas del servidor (podemos filtrar por cliente)
        const url = customerIdParam
          ? `/api/invoices/customer/${customerIdParam}`
          : user?.role === 'vendor'
            ? `/api/invoices/vendor/${user.id}`
            : '/api/invoices';
        const response = await axios.get(url);
        // Usar el array de facturas dentro del objeto data
        const invoicesData = response.data.data;
        
        if (Array.isArray(invoicesData)) {
          setInvoices(invoicesData);
          setFilteredInvoices(invoicesData);
          setInvoicesByCustomer(groupInvoicesByCustomer(invoicesData));
          
          // Extraer creadores únicos
          const uniqueCreators = Array.from(
            new Set(invoicesData.map((invoice: Invoice) => invoice.createdBy).filter(Boolean))
          ).map(creatorId => {
            const invoice = invoicesData.find((inv: Invoice) => inv.createdBy === creatorId);
            return {
              id: creatorId as string || '',
              name: invoice?.createdByName || 'Desconocido'
            };
          });
          
          setCreators(uniqueCreators);
        } else {
          setInvoices([]);
          setFilteredInvoices([]);
          setInvoicesByCustomer({});
          setCreators([]);
        }
      } catch (err: any) {
        console.error('Error fetching invoices:', err);
        setError(err.message || 'Error al cargar las facturas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [customerIdParam, user]);
  
  useEffect(() => {
    // Aplicar filtros cuando cambia el término de búsqueda, filtro de fecha o filtro de creador
    let result = [...invoices];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(invoice => 
        invoice.number.toLowerCase().includes(term) ||
        invoice.customer.name.toLowerCase().includes(term) ||
        invoice.prefix.toLowerCase().includes(term)
      );
    }
    
    if (dateFilter) {
      result = result.filter(invoice => 
        invoice.issueDate.startsWith(dateFilter)
      );
    }
    
    if (creatorFilter) {
      result = result.filter(invoice => invoice.createdBy === creatorFilter);
    }
    
    setFilteredInvoices(result);
    setInvoicesByCustomer(groupInvoicesByCustomer(result));
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // Reiniciar a la primera página cuando cambian los filtros
  }, [searchTerm, dateFilter, creatorFilter, invoices, itemsPerPage]);
  
  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };
  
  const handleViewInvoice = (id: string) => {
    navigate(`/invoices/${id}`);
  };
  
  const handleDownloadInvoice = async (id: string, format: 'pdf' | 'xml') => {
    try {
      // In a real app, this would be an actual API call
      const response = await axios.get(`/api/invoices/${id}/download/${format}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error downloading invoice as ${format}:`, err);
      Swal.fire({ icon: 'error', title: `Error al descargar la factura en formato ${format}` });
    }
  };
  
  const handleSendInvoice = async (id: string) => {
    try {
      // In a real app, this would be an actual API call
      const response = await axios.post(`/api/invoices/${id}/send`);
      
      if (response.data.success) {
        Swal.fire({ icon: 'success', title: 'Factura enviada exitosamente' });
        
        // Update the invoice status in the list
        setInvoices(prevInvoices => 
          prevInvoices.map(invoice => 
            invoice.id === id ? { ...invoice, status: 'PENDING' } : invoice
          )
        );
      } else {
        throw new Error(response.data.message || 'Error al enviar la factura');
      }
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      Swal.fire({ icon: 'error', title: 'Error al enviar la factura: ' + (error.message || 'Error desconocido') });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO').format(date);
  };
  
  // Función para alternar la expansión de la sección de un cliente
  const toggleCustomerExpansion = (customerId: string) => {
    const isCurrentlyExpanded = expandedCustomers[customerId] || false;
    
    // Si vamos a expandir y no hemos cargado las facturas de este cliente aún
    if (!isCurrentlyExpanded && !loadingInvoices[customerId]) {
      // Simular carga de facturas para este cliente
      setLoadingInvoices(prev => ({
        ...prev,
        [customerId]: true
      }));
      
      // Simular una llamada a la API para obtener las facturas de este cliente
      setTimeout(() => {
        setLoadingInvoices(prev => ({
          ...prev,
          [customerId]: false
        }));
      }, 800);
    }
    
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };
  
  // Función para expandir todas las secciones de cliente
  const expandAllCustomers = () => {
    const expanded: Record<string, boolean> = {};
    Object.keys(invoicesByCustomer).forEach(customerId => {
      expanded[customerId] = true;
    });
    setExpandedCustomers(expanded);
  };
  
  // Función para contraer todas las secciones de cliente
  const collapseAllCustomers = () => {
    setExpandedCustomers({});
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchInvoices = () => {
    let results = invoices;
    if (searchTerm) {
      results = results.filter(inv =>
        inv.number.includes(searchTerm) ||
        inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (dateFilter) {
      results = results.filter(inv => inv.issueDate.startsWith(dateFilter));
    }
    if (creatorFilter) {
      results = results.filter(inv => inv.createdBy === creatorFilter);
    }
    setFilteredInvoices(results);
    setInvoicesByCustomer(groupInvoicesByCustomer(results));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <SectionLoader message="Cargando facturas" size="large" />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Facturas Electrónicas</PageTitle>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <Button variant="secondary" onClick={expandAllCustomers}>
            Expandir Todo
          </Button>
          <Button variant="secondary" onClick={collapseAllCustomers}>
            Contraer Todo
          </Button>
          <Button variant="primary" onClick={handleCreateInvoice}>
            <FaPlus style={{ marginRight: '8px' }} />
            Crear Nueva Factura
          </Button>
        </div>
      </PageHeader>

      <Card>
        <SearchContainer>
          <Input
            placeholder="Buscar por número o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" size="small" onClick={handleSearchInvoices}>
            <FaSearch /> Buscar
          </Button>
        </SearchContainer>

        <FilterContainer>
          <Input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {creators.length > 0 && (
            <Select
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
            >
              <option value="">Todos los usuarios</option>
              {creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.name}
                </option>
              ))}
            </Select>
          )}
          <Button variant="outline" size="small" onClick={handleSearchInvoices}>
            <FaFilter /> Filtrar
          </Button>
        </FilterContainer>

        {Object.keys(invoicesByCustomer).length > 0 ? (
          Object.entries(invoicesByCustomer).map(([customerId, customerInvoices]) => {
            const customer = customerInvoices[0].customer;
            const isExpanded = expandedCustomers[customerId] || false;

            return (
              <CustomerSection key={customerId}>
                <CustomerHeader onClick={() => toggleCustomerExpansion(customerId)}>
                  <CustomerName className={isExpanded ? 'expanded' : ''}>
                    <FaChevronRight />
                    {customer.name}
                  </CustomerName>
                  <CustomerInfo>
                    <CustomerDetails>
                      {customer.identificationType}: {customer.identificationNumber}
                    </CustomerDetails>
                    <InvoiceCount>{customerInvoices.length} facturas</InvoiceCount>
                  </CustomerInfo>
                </CustomerHeader>

                <CustomerInvoices isExpanded={isExpanded}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeaderCell>Número</TableHeaderCell>
                          <TableHeaderCell>Fecha</TableHeaderCell>
                          <TableHeaderCell>Vencimiento</TableHeaderCell>
                          <TableHeaderCell>Total</TableHeaderCell>
                          <TableHeaderCell>Estado</TableHeaderCell>
                          <TableHeaderCell>Creado por</TableHeaderCell>
                          <TableHeaderCell>Acciones</TableHeaderCell>
                        </TableRow>
                      </TableHead>
                      <tbody>
                        {loadingInvoices[customerId] ? (
                          <tr>
                            <td colSpan={7} style={{ padding: 'var(--spacing-md)' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                                <SectionLoader message="Cargando facturas del cliente" size="medium" />
                              </div>
                            </td>
                          </tr>
                        ) : customerInvoices.length > 0 ? (
                          customerInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>{invoice.prefix}-{invoice.number}</TableCell>
                              <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                              <TableCell>{formatCurrency(invoice.total)}</TableCell>
                              <TableCell>
                                <StatusBadge status={invoice.status}>
                                  {getStatusLabel(invoice.status)}
                                </StatusBadge>
                              </TableCell>
                              <TableCell>{invoice.createdByName || invoice.customer.name}</TableCell>
                              <TableCell>
                                <ActionButtonGroup>
                                  <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => handleViewInvoice(invoice.id)}
                                    title="Ver factura"
                                  >
                                    <FaEye />
                                  </Button>

                                  {invoice.status !== 'DRAFT' && (
                                    <>
                                      <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => handleDownloadInvoice(invoice.id, 'pdf')}
                                        title="Descargar PDF"
                                      >
                                        <FaFileDownload />
                                      </Button>

                                      <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => handleDownloadInvoice(invoice.id, 'xml')}
                                        title="Descargar XML"
                                      >
                                        <FaFileDownload />
                                      </Button>
                                    </>
                                  )}

                                  {invoice.status === 'DRAFT' && (
                                    <Button
                                      variant="text"
                                      size="small"
                                      onClick={() => handleSendInvoice(invoice.id)}
                                      title="Enviar a DIAN"
                                    >
                                      <FaPaperPlane />
                                    </Button>
                                  )}
                                </ActionButtonGroup>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                              <p>Este cliente no tiene facturas.</p>
                              <Button 
                                variant="primary" 
                                size="small"
                                onClick={() => navigate(`/invoices/new?customerId=${customerId}`)}
                              >
                                Crear Nueva Factura
                              </Button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </TableContainer>
                </CustomerInvoices>
              </CustomerSection>
            );
          })
        ) : (
          <EmptyState>
            <p>No se encontraron facturas que coincidan con los criterios de búsqueda.</p>
            <Button variant="primary" onClick={handleCreateInvoice}>
              <FaPlus style={{ marginRight: '8px' }} />
              Crear Nueva Factura
            </Button>
          </EmptyState>
        )}
        
        {totalPages > 1 && (
          <Pagination>
            <PageInfo>
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredInvoices.length)} de {filteredInvoices.length} facturas
            </PageInfo>
            
            <PageButtons>
              <Button
                variant="outline"
                size="small"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "primary" : "outline"}
                  size="small"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="small"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </PageButtons>
          </Pagination>
        )}
      </Card>
    </>
  );
};

export default InvoiceListPage;
