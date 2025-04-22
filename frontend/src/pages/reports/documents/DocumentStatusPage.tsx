import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../../components/ui/Button';
import { FaFileAlt, FaFilter, FaArrowLeft, FaDownload, FaTable, FaChartPie, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaFileInvoice } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import SectionLoader from '../../../components/ui/SectionLoader';
import Swal from 'sweetalert2';
import ReportsService, { ReportFilters, DocumentDetail } from '../../../services/reports.service';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

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
    display: flex;
    align-items: center;
    
    svg {
      margin-right: var(--spacing-sm);
    }
  }
`;

const BackButton = styled(Button)`
  margin-right: var(--spacing-md);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const Card = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
  }
`;

const ChartContainer = styled.div`
  height: 400px;
  position: relative;
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
`;

const ChartWrapper = styled.div`
  width: 70%;
  max-width: 500px;
  height: 100%;
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  
  label {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);
    color: var(--color-text-secondary);
  }
  
  select, input {
    padding: var(--spacing-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    background-color: var(--color-white);
    color: var(--color-text);
    
    /* Modo oscuro */
    html[data-theme='dark'] & {
      background-color: var(--color-bg-secondary);
      color: var(--color-text);
      border-color: var(--color-border);
    }
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div<{ status?: string }>`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  text-align: center;
  border-top: 4px solid ${props => {
    switch (props.status) {
      case 'draft': return 'var(--color-warning)';
      case 'issued': return 'var(--color-info)';
      case 'accepted': return 'var(--color-success)';
      case 'rejected': return 'var(--color-danger)';
      default: return 'var(--color-primary)';
    }
  }};
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
  }
`;

const SummaryIcon = styled.div<{ status?: string }>`
  font-size: 2rem;
  margin-bottom: var(--spacing-xs);
  color: ${props => {
    switch (props.status) {
      case 'draft': return 'var(--color-warning)';
      case 'issued': return 'var(--color-info)';
      case 'accepted': return 'var(--color-success)';
      case 'rejected': return 'var(--color-danger)';
      default: return 'var(--color-primary)';
    }
  }};
`;

const SummaryValue = styled.div`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
`;

const SummaryLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: var(--spacing-lg);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: var(--spacing-sm);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }
  
  th {
    background-color: var(--color-bg-secondary);
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
  }
  
  tr:hover td {
    background-color: var(--color-bg-hover);
  }
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    th {
      background-color: var(--color-bg-secondary);
      border-bottom: 1px solid var(--color-border);
    }
    
    tr:hover td {
      background-color: var(--color-bg-hover);
    }
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
`;

const Tab = styled.button<{ active: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  font-weight: ${props => props.active ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)'};
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  
  &:hover {
    color: var(--color-primary);
  }
  
  svg {
    margin-right: var(--spacing-xs);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  
  background-color: ${props => {
    switch (props.status) {
      case 'draft': return 'var(--color-warning-light)';
      case 'issued': return 'var(--color-info-light)';
      case 'accepted': return 'var(--color-success-light)';
      case 'rejected': return 'var(--color-danger-light)';
      case 'pending': return 'var(--color-warning-light)';
      default: return 'var(--color-bg-secondary)';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'draft': return 'var(--color-warning-dark)';
      case 'issued': return 'var(--color-info-dark)';
      case 'accepted': return 'var(--color-success-dark)';
      case 'rejected': return 'var(--color-danger-dark)';
      case 'pending': return 'var(--color-warning-dark)';
      default: return 'var(--color-text-secondary)';
    }
  }};
  
  svg {
    margin-right: var(--spacing-xs);
  }
`;

// Interfaces
interface DocumentStatusSummary {
  status: 'draft' | 'issued' | 'accepted' | 'rejected';
  count: number;
  icon: React.ReactNode;
  label: string;
}

// Nota: Eliminamos esta interfaz local ya que ahora usamos la del servicio

const DocumentStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('chart');
  const [documentType, setDocumentType] = useState<'all' | 'invoice' | 'creditNote' | 'debitNote'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'issued' | 'accepted' | 'rejected' | 'pending'>('all');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [statusSummary, setStatusSummary] = useState<{status: string; count: number; icon: string; label: string}[]>([]);
  const [documentDetails, setDocumentDetails] = useState<DocumentDetail[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    documentType: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });
  
  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    const startDate = lastMonth.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate
    }));
    
    loadDocumentStatusData();
  }, []);
  
  // Cargar datos del reporte de estado de documentos
  const loadDocumentStatusData = async () => {
    setLoading(true);
    try {
      const data = await ReportsService.getDocumentStatusReport(filters);
      setStatusSummary(data.summary);
      setDocumentDetails(data.details);
    } catch (error) {
      console.error('Error al cargar datos del reporte de estado de documentos:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los datos del reporte de estado de documentos',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Actualizar filtros cuando cambian los valores seleccionados
    const newFilters: ReportFilters = {
      ...filters,
      documentType,
      status: selectedStatus,
      startDate: selectedStartDate,
      endDate: selectedEndDate
    };
    
    setFilters(newFilters);
  }, [documentType, selectedStatus, selectedStartDate, selectedEndDate]);
  
  // Filtrar documentos según los filtros seleccionados
  const filteredDocuments = documentDetails.filter(doc => {
    // Filtrar por tipo de documento
    if (documentType !== 'all') {
      if (documentType === 'invoice' && doc.type !== 'Factura') return false;
      if (documentType === 'creditNote' && doc.type !== 'Nota Crédito') return false;
      if (documentType === 'debitNote' && doc.type !== 'Nota Débito') return false;
    }
    
    // Filtrar por estado
    if (selectedStatus !== 'all' && doc.status !== selectedStatus) return false;
    
    // Filtrar por fecha
    const docDate = new Date(doc.date);
    const startDate = new Date(selectedStartDate);
    const endDate = new Date(selectedEndDate);
    
    if (docDate < startDate || docDate > endDate) return false;
    
    return true;
  });
  
  // Datos para el gráfico de torta
  const pieChartData = {
    labels: ['Borradores', 'Emitidas', 'Aceptadas', 'Rechazadas', 'Pendientes'],
    datasets: [
      {
        data: [
          documentDetails.filter(doc => doc.status === 'draft').length,
          documentDetails.filter(doc => doc.status === 'issued').length,
          documentDetails.filter(doc => doc.status === 'accepted').length,
          documentDetails.filter(doc => doc.status === 'rejected').length,
          documentDetails.filter(doc => doc.status === 'pending').length,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)', // Amarillo para borradores
          'rgba(54, 162, 235, 0.6)', // Azul para emitidas
          'rgba(75, 192, 192, 0.6)', // Verde para aceptadas
          'rgba(255, 99, 132, 0.6)', // Rojo para rechazadas
          'rgba(153, 102, 255, 0.6)', // Morado para pendientes
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const handleFilterChange = () => {
    loadDocumentStatusData();
  };
  
  const handleExportPdf = async () => {
    Swal.fire({
      title: 'Exportando a PDF',
      text: 'Preparando la exportación del reporte...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      const pdfBlob = await ReportsService.exportReportToPdf('documents/status', filters);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_documentos_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Swal.fire({
        title: '¡Exportación Completada!',
        text: 'El reporte ha sido exportado correctamente a PDF',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al exportar reporte a PDF:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo exportar el reporte a PDF',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };
  
  const handleExportExcel = async () => {
    Swal.fire({
      title: 'Exportando a Excel',
      text: 'Preparando la exportación del reporte...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      const excelBlob = await ReportsService.exportReportToExcel('documents/status', filters);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_documentos_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Swal.fire({
        title: '¡Exportación Completada!',
        text: 'El reporte ha sido exportado correctamente a Excel',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al exportar reporte a Excel:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo exportar el reporte a Excel',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };
  
  const handleGoBack = () => {
    navigate('/reports');
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FaFileAlt />;
      case 'issued': return <FaFileInvoice />;
      case 'accepted': return <FaCheckCircle />;
      case 'rejected': return <FaTimesCircle />;
      case 'pending': return <FaExclamationTriangle />;
      default: return <FaFileAlt />;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'issued': return 'Emitida';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <SectionLoader message="Cargando reporte de estado de documentos" size="large" />
      </div>
    );
  }
  
  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton variant="text" onClick={handleGoBack}>
            <FaArrowLeft /> Volver
          </BackButton>
          <h1><FaFileAlt /> Estado de Documentos</h1>
        </HeaderLeft>
        <ButtonGroup>
          <Button variant="secondary" onClick={handleExportExcel}>
            <FaDownload /> Exportar a Excel
          </Button>
          <Button variant="primary" onClick={handleExportPdf}>
            <FaDownload /> Exportar a PDF
          </Button>
        </ButtonGroup>
      </Header>
      
      <FilterBar>
        <FilterGroup>
          <label htmlFor="documentType">Tipo de Documento</label>
          <select 
            id="documentType" 
            value={documentType} 
            onChange={(e) => {
              setDocumentType(e.target.value as 'all' | 'invoice' | 'creditNote' | 'debitNote');
              handleFilterChange();
            }}
          >
            <option value="all">Todos</option>
            <option value="invoice">Facturas</option>
            <option value="creditNote">Notas Crédito</option>
            <option value="debitNote">Notas Débito</option>
          </select>
        </FilterGroup>
        
        <FilterGroup>
          <label htmlFor="status">Estado</label>
          <select 
            id="status" 
            value={selectedStatus} 
            onChange={(e) => {
              setSelectedStatus(e.target.value as 'all' | 'draft' | 'issued' | 'accepted' | 'rejected' | 'pending');
              handleFilterChange();
            }}
          >
            <option value="all">Todos</option>
            <option value="draft">Borradores</option>
            <option value="issued">Emitidas</option>
            <option value="accepted">Aceptadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="pending">Pendientes</option>
          </select>
        </FilterGroup>
        
        <FilterGroup>
          <label htmlFor="startDate">Fecha Inicio</label>
          <input 
            type="date" 
            id="startDate" 
            value={selectedStartDate}
            onChange={(e) => {
              setSelectedStartDate(e.target.value);
              handleFilterChange();
            }}
          />
        </FilterGroup>
        
        <FilterGroup>
          <label htmlFor="endDate">Fecha Fin</label>
          <input 
            type="date" 
            id="endDate" 
            value={selectedEndDate}
            onChange={(e) => {
              setSelectedEndDate(e.target.value);
              handleFilterChange();
            }}
          />
        </FilterGroup>
        
        <Button 
          variant="secondary" 
          onClick={handleFilterChange}
          style={{ alignSelf: 'flex-end' }}
        >
          <FaFilter /> Aplicar Filtros
        </Button>
      </FilterBar>
      
      <SummaryGrid>
        {statusSummary.map((item) => (
          <SummaryCard key={item.status} status={item.status}>
            <SummaryIcon status={item.status}>{item.icon}</SummaryIcon>
            <SummaryValue>{item.count}</SummaryValue>
            <SummaryLabel>{item.label}</SummaryLabel>
          </SummaryCard>
        ))}
      </SummaryGrid>
      
      <Card>
        <TabsContainer>
          <Tab 
            active={activeTab === 'chart'} 
            onClick={() => setActiveTab('chart')}
          >
            <FaChartPie /> Gráfico
          </Tab>
          <Tab 
            active={activeTab === 'table'} 
            onClick={() => setActiveTab('table')}
          >
            <FaTable /> Tabla de Datos
          </Tab>
        </TabsContainer>
        
        {activeTab === 'chart' && (
          <ChartContainer>
            <ChartWrapper>
              <Doughnut 
                data={pieChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                    title: {
                      display: true,
                      text: 'Distribución por Estado de Documentos',
                    },
                  },
                }} 
              />
            </ChartWrapper>
          </ChartContainer>
        )}
        
        {activeTab === 'table' && (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.date}</td>
                    <td>{doc.documentNumber}</td>
                    <td>{doc.client}</td>
                    <td>{doc.type}</td>
                    <td>${doc.total.toLocaleString()}</td>
                    <td>
                      <StatusBadge status={doc.status}>
                        {getStatusIcon(doc.status)} {getStatusLabel(doc.status)}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Container>
  );
};

export default DocumentStatusPage;
