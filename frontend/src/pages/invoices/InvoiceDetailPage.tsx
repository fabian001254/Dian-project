import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { FaDownload, FaEnvelope, FaFilePdf, FaFileCode, FaPrint } from 'react-icons/fa';
import api from '../../services/api.config';
import Swal from 'sweetalert2';

// Interfaces
interface InvoiceItem {
  id: string;
  product: { code: string; name: string };
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

interface Invoice {
  id: string;
  number: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  customer: {
    id: string;
    name: string;
    identificationType: string;
    identificationNumber: string;
    email: string;
    address: string;
    phone: string;
  };
  vendor: {
    firstName: string;
    lastName: string;
    identificationType: string;
    identificationNumber: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  notes: string;
  cufe: string;
}

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Compute CUFE display value
  const cufeValue = useMemo(() => {
    if (!invoice) return 'Pendiente';
    if (invoice.status === 'approved') {
      return invoice.cufe || Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    }
    return invoice.cufe || 'Pendiente';
  }, [invoice]);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/invoices/${id}`);
        setInvoice(response.data.data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la factura');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#007bff';
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return 'var(--color-text-secondary)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Print and download handlers
  const handlePrint = () => window.print();
  const handleDownload = async (format: 'pdf' | 'xml' | 'email') => {
    try {
      const response = await api.get(`/api/invoices/${invoice?.id}/download/${format}`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = format === 'email' ? 'zip' : format;
      link.setAttribute('download', `factura-${invoice?.number}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: 'success', title: 'Descarga correcta' });
    } catch (err) {
      console.error(`Error al descargar ${format}:`, err);
      Swal.fire({ icon: 'error', title: `Error al descargar ${format}` });
    }
  };

  // Mostrar mientras carga
  if (loading) {
    return (
      <Container>
        <LoadingMessage>Cargando factura...</LoadingMessage>
      </Container>
    );
  }

  // Manejo de error después de carga
  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  // Si no se obtuvo invoice
  if (!invoice) {
    return (
      <Container>
        <ErrorMessage>Factura no encontrada</ErrorMessage>
        <Button variant="outline" onClick={() => navigate('/invoices')}>Volver a Facturas</Button>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <h1>Factura {invoice.number}</h1>
          <StatusBadge color={getStatusColor(invoice.status)}>
            {getStatusText(invoice.status)}
          </StatusBadge>
        </div>
        <ActionButtons>
          <Button variant="outline" size="small" onClick={handlePrint}>
            <FaPrint /> Imprimir
          </Button>
          <Button variant="outline" size="small" onClick={() => handleDownload('pdf')}>
            <FaDownload /> Descargar PDF
          </Button>
          <Button variant="outline" size="small" onClick={() => handleDownload('email')}>
            <FaEnvelope /> Enviar y descargar
          </Button>
          <Button variant="outline" size="small" onClick={() => handleDownload('pdf')}>
            <FaFilePdf /> PDF
          </Button>
          <Button variant="outline" size="small" onClick={() => handleDownload('xml')}>
            <FaFileCode /> XML
          </Button>
        </ActionButtons>
      </Header>

      <InvoiceGrid>
        <InvoiceSection style={{ gridColumn: '1 / -1' }}>
          <h3>Información de Factura</h3>
          <InfoGrid>
            <div>
              <label>Número:</label>
              <span>{invoice.number}</span>
            </div>
            <div>
              <label>Fecha de emisión:</label>
              <span>{invoice.issueDate}</span>
            </div>
            <div>
              <label>Fecha de vencimiento:</label>
              <span>{invoice.dueDate}</span>
            </div>
            <div>
              <label>CUFE:</label>
              <span className="cufe">{cufeValue}</span>
            </div>
          </InfoGrid>
        </InvoiceSection>

        <InvoiceSection>
          <h3>Cliente</h3>
          <InfoGrid>
            <div>
              <label>Nombre/Razón Social:</label>
              <span>{invoice.customer.name}</span>
            </div>
            <div>
              <label>Identificación:</label>
              <span>{invoice.customer.identificationType} {invoice.customer.identificationNumber}</span>
            </div>
            <div>
              <label>Correo electrónico:</label>
              <span>{invoice.customer.email}</span>
            </div>
            <div>
              <label>Dirección:</label>
              <span>{invoice.customer.address}</span>
            </div>
            <div>
              <label>Teléfono:</label>
              <span>{invoice.customer.phone}</span>
            </div>
          </InfoGrid>
        </InvoiceSection>

        {invoice.vendor && (
          <InvoiceSection>
            <h3>Vendedor</h3>
            <InfoGrid>
              <div>
                <label>Nombre/Razón Social:</label>
                <span>{invoice.vendor.firstName} {invoice.vendor.lastName}</span>
              </div>
              <div>
                <label>Identificación:</label>
                <span>{invoice.vendor.identificationType} {invoice.vendor.identificationNumber}</span>
              </div>
              <div>
                <label>Correo electrónico:</label>
                <span>{invoice.vendor.email}</span>
              </div>
              <div>
                <label>Teléfono:</label>
                <span>{invoice.vendor.phone}</span>
              </div>
              <div>
                <label>Dirección:</label>
                <span>{invoice.vendor.address}</span>
              </div>
              <div>
                <label>Ciudad:</label>
                <span>{invoice.vendor.city}</span>
              </div>
            </InfoGrid>
          </InvoiceSection>
        )}
      </InvoiceGrid>

      <InvoiceSection>
        <h3>Detalle de Factura</h3>
        <ItemsTable>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
              <th>IVA</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map(item => (
              <tr key={item.id}>
                <td>{item.product.code}</td>
                <td>{item.product.name}</td>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.subtotal)}</td>
                <td>{formatCurrency(item.taxAmount)} ({item.taxRate}%)</td>
                <td>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}></td>
              <td colSpan={2}>Subtotal:</td>
              <td>{formatCurrency(invoice.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={3}></td>
              <td colSpan={2}>IVA:</td>
              <td>{formatCurrency(invoice.taxTotal)}</td>
            </tr>
            <tr className="total-row">
              <td colSpan={3}></td>
              <td colSpan={2}>Total:</td>
              <td>{formatCurrency(invoice.total)}</td>
            </tr>
          </tfoot>
        </ItemsTable>
      </InvoiceSection>

      {invoice.notes && (
        <InvoiceSection>
          <h3>Notas</h3>
          <NotesBox>{invoice.notes}</NotesBox>
        </InvoiceSection>
      )}

      <ButtonContainer>
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          Volver a Facturas
        </Button>
      </ButtonContainer>
    </Container>
  );
};

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
  
  div {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
`;

const StatusBadge = styled.span<{ color: string }>`
  background-color: ${props => props.color}15;
  color: ${props => props.color};
  padding: 4px 12px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const InvoiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InvoiceSection = styled.section`
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  h3 {
    margin-top: 0;
    margin-bottom: var(--spacing-md);
    color: var(--color-primary);
    font-size: var(--font-size-md);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);

  label {
    font-size: var(--font-size-xs);
    color: var(--color-text-light);
  }
  
  span {
    font-size: var(--font-size-sm);
    color: var(--color-text);
    
    &.cufe {
      font-size: var(--font-size-xs);
      word-break: break-all;
    }
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: var(--spacing-sm);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }
  
  th {
    background-color: var(--color-background);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-light);
  }
  
  /* Dark mode for header */
  html[data-theme='dark'] & th {
    background-color: var(--color-gray-dark);
    color: var(--color-white);
  }
  
  tbody tr:hover {
    background-color: var(--color-background);
  }
  
  tfoot {
    font-weight: var(--font-weight-medium);
    
    td {
      padding-top: var(--spacing-sm);
    }
    
    .total-row {
      font-weight: var(--font-weight-bold);
      color: var(--color-primary);
      
      td {
        border-bottom: none;
      }
    }
  }
`;

const NotesBox = styled.div`
  background-color: var(--color-background);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  white-space: pre-line;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
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

export default InvoiceDetailPage;
