import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaFileInvoiceDollar, FaUsers, FaExclamationTriangle, FaBoxes } from 'react-icons/fa';
import api from '../../services/api.config';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Contenedor principal del dashboard
const DashboardContainer = styled.div`
  width: 100%;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`;

const StatsCard = styled(Card)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const IconContainer = styled.div<{ bgColor: string }>`
  width: var(--spacing-xxl);
  height: var(--spacing-xxl);
  border-radius: var(--border-radius-circle);
  background-color: ${props => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-sm);
  
  svg {
    color: var(--color-white);
    font-size: var(--font-size-lg);
  }
`;

const StatsInfo = styled.div`
  flex: 1;
`;

const StatsValue = styled.div`
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
`;

const StatsLabel = styled.div`
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
`;

const TableContainer = styled.div`
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-xl);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid var(--color-border);
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
  border: 1px solid var(--color-border);
`;

const TableCell = styled.td`
  padding: var(--spacing-md);
  color: var(--color-text);
  border: 1px solid var(--color-border);
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  
  ${props => {
    // Usar uppercase para coincidencias independientemente de formato
    const key = props.status.toUpperCase();
    switch (key) {
      case 'DRAFT':
        return `
          background-color: rgba(0, 123, 255, 0.1);
          color: #007bff;
        `;
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
      default:
        return `
          background-color: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-gray-dark);
`;

interface InvoiceData {
  id: string;
  number: string;
  issueDate: string;
  customerName: string;
  total: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface DashboardStats {
  totalInvoices: number;
  pendingInvoices: number;
  totalCustomers: number;
  totalProducts: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    pendingInvoices: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener estadísticas del dashboard y facturas recientes
        const statsResponse = await api.get('/dashboard/stats');
        // Si es vendor, obtener solo sus facturas; si no, las recientes generales
        const invoicesResponse = await api.get(
          user?.role === 'vendor'
            ? `/invoices/vendor/${user.id}`
            : '/invoices/recent'
        );
        
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        } else {
          console.error('Error en la respuesta de estadísticas:', statsResponse.data);
        }
        
        if (invoicesResponse.data.success) {
          // Mapear datos y extraer nombre del cliente
          const mapped: InvoiceData[] = invoicesResponse.data.data.map((inv: any) => ({
            id: inv.id,
            number: inv.number,
            issueDate: inv.issueDate,
            customerName: inv.customer?.name || '',
            total: inv.total,
            status: inv.status,
          }));
          // Ordenar y tomar los 5 más recientes
          const rec = mapped
            .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
            .slice(0, 5);
          setRecentInvoices(rec);
        } else {
          console.error('Error en la respuesta de facturas recientes:', invoicesResponse.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('No se pudo cargar la información del dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-CO').format(date);
  };

  const getStatusLabel = (status: string) => {
    // Mapear estado en español independientemente de mayúsculas
    const key = status.toUpperCase();
    switch (key) {
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

  if (isLoading) {
    return <div>Cargando información del dashboard...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <DashboardContainer>
      <h1>Bienvenido, {user?.firstName || 'Usuario'}</h1>
      <p>Resumen de su actividad de facturación electrónica</p>
      
      <DashboardGrid>
        <StatsCard>
          <IconContainer bgColor="var(--color-primary)">
            <FaFileInvoiceDollar />
          </IconContainer>
          <StatsInfo>
            <StatsValue>{stats.totalInvoices}</StatsValue>
            <StatsLabel>Facturas Emitidas</StatsLabel>
          </StatsInfo>
        </StatsCard>
        
        <StatsCard>
          <IconContainer bgColor="var(--color-warning)">
            <FaExclamationTriangle />
          </IconContainer>
          <StatsInfo>
            <StatsValue>{stats.pendingInvoices}</StatsValue>
            <StatsLabel>Facturas Pendientes</StatsLabel>
          </StatsInfo>
        </StatsCard>
        
        <StatsCard>
          <IconContainer bgColor="var(--color-success)">
            <FaUsers />
          </IconContainer>
          <StatsInfo>
            <StatsValue>{stats.totalCustomers}</StatsValue>
            <StatsLabel>Clientes</StatsLabel>
          </StatsInfo>
        </StatsCard>
        
        <StatsCard>
          <IconContainer bgColor="var(--color-success)">
            <FaBoxes />
          </IconContainer>
          <StatsInfo>
            <StatsValue>{stats.totalProducts}</StatsValue>
            <StatsLabel>Productos</StatsLabel>
          </StatsInfo>
        </StatsCard>
      </DashboardGrid>
      
      <SectionTitle>Facturas Recientes</SectionTitle>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Número</TableHeaderCell>
              <TableHeaderCell>Fecha</TableHeaderCell>
              <TableHeaderCell>Cliente</TableHeaderCell>
              <TableHeaderCell>Total</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.number}</TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status}>
                      {getStatusLabel(invoice.status)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState>
                    No hay facturas recientes para mostrar
                  </EmptyState>
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>
      </TableContainer>
      
      <Button
        variant="primary"
        onClick={() => navigate('/invoices')}
      >
        Ver Todas las Facturas
      </Button>
    </DashboardContainer>
  );
};

export default DashboardPage;
