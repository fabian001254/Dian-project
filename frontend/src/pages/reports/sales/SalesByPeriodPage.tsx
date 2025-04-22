import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../../components/ui/Button';
import { FaChartBar, FaFileExport, FaFilter, FaArrowLeft, FaDownload, FaCalendarAlt, FaTable, FaChartLine, FaChartPie } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import SectionLoader from '../../../components/ui/SectionLoader';
import Swal from 'sweetalert2';
import ReportsService, { ReportFilters, SalesDetail, SalesReportData, ReportSummary, DashboardStats } from '../../../services/reports.service';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
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

const SummaryCard = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  text-align: center;
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
  }
`;

const SummaryValue = styled.div`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
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

// Interfaces
interface SalesSummary {
  label: string;
  value: string;
}

// Nota: Eliminamos esta interfaz local ya que ahora usamos la del servicio

interface ChartDataPoint {
  period: string;
  sales: number;
}

const SalesByPeriodPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'lineChart' | 'barChart'>('lineChart');
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);
  const [summaryData, setSummaryData] = useState<ReportSummary[]>([]);
  const [detailData, setDetailData] = useState<SalesDetail[]>([]);
  const [chartData, setChartData] = useState<SalesReportData[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    periodType: 'monthly',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    compareWithPrevious: true
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
    
    loadSalesReportData();
  }, []);
  
  // Cargar datos del reporte de ventas
  const loadSalesReportData = async () => {
    setLoading(true);
    try {
      // Obtener datos de ventas desde el dashboard
      const dash: DashboardStats = await ReportsService.getDashboardStats(filters);
      const salesArr = dash.salesData || [];
      // Resumen de métricas
      setSummaryData(dash.salesMetrics || []);
      // Chart data
      setChartData(salesArr);
      // Opcional: tabla de detalles vacía o puedes llamar getSalesByPeriodReport
      setDetailData([]);
    } catch (error) {
      console.error('Error al cargar datos del reporte de ventas:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los datos del reporte de ventas',
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
      periodType,
      year: selectedYear,
      month: selectedMonth,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      compareWithPrevious
    };
    
    setFilters(newFilters);
  }, [periodType, selectedYear, selectedMonth, selectedStartDate, selectedEndDate, compareWithPrevious]);
  
  // Datos para el gráfico de línea
  const lineChartData = {
    labels: chartData.map(item => item.period),
    datasets: [
      {
        label: 'Ventas Actuales',
        data: chartData.map(item => item.sales),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      ...(compareWithPrevious ? [{
        label: 'Período Anterior',
        data: chartData.map(item => item.previousPeriodSales || 0),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
      }] : []),
    ],
  };
  
  // Datos para el gráfico de barras
  const barChartData = {
    labels: chartData.map(item => item.period),
    datasets: [{
      label: 'Ventas',
      data: chartData.map(item => item.sales),
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
    }]
  };
  
  const handleFilterChange = () => {
    loadSalesReportData();
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
      const pdfBlob = await ReportsService.exportReportToPdf('sales/period', filters);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_ventas_${periodType}_${selectedYear}.pdf`);
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
      const excelBlob = await ReportsService.exportReportToExcel('sales/period', filters);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_ventas_${periodType}_${selectedYear}.xlsx`);
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
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <SectionLoader message="Cargando reporte de ventas" size="large" />
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
          <h1><FaChartLine /> Ventas por Período</h1>
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
          <label htmlFor="periodType">Tipo de Período</label>
          <select 
            id="periodType" 
            value={periodType} 
            onChange={(e) => {
              setPeriodType(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly');
              handleFilterChange();
            }}
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
            <option value="yearly">Anual</option>
          </select>
        </FilterGroup>
        
        {periodType !== 'yearly' && (
          <FilterGroup>
            <label htmlFor="year">Año</label>
            <select 
              id="year" 
              value={selectedYear} 
              onChange={(e) => {
                setSelectedYear(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </FilterGroup>
        )}
        
        {(periodType === 'daily' || periodType === 'weekly') && (
          <FilterGroup>
            <label htmlFor="month">Mes</label>
            <select 
              id="month" 
              value={selectedMonth} 
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                handleFilterChange();
              }}
            >
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </FilterGroup>
        )}
        
        {periodType === 'daily' && (
          <>
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
          </>
        )}
        
        <FilterGroup>
          <label style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--spacing-md)' }}>
            <input 
              type="checkbox" 
              checked={compareWithPrevious}
              onChange={(e) => {
                setCompareWithPrevious(e.target.checked);
                handleFilterChange();
              }}
              style={{ marginRight: 'var(--spacing-xs)' }}
            />
            Comparar con período anterior
          </label>
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
        {summaryData && summaryData.length > 0 ? (
          summaryData.map((item, index) => (
            <SummaryCard key={index}>
              <SummaryValue>{item.value}</SummaryValue>
              <SummaryLabel>{item.label}</SummaryLabel>
            </SummaryCard>
          ))
        ) : (
          <SummaryCard>
            <SummaryValue>$0</SummaryValue>
            <SummaryLabel>No hay datos disponibles</SummaryLabel>
          </SummaryCard>
        )}
      </SummaryGrid>
      
      <Card>
        <TabsContainer>
          <Tab 
            active={activeTab === 'lineChart'} 
            onClick={() => setActiveTab('lineChart')}
          >
            <FaChartLine /> Gráfico de Líneas
          </Tab>
          <Tab 
            active={activeTab === 'barChart'} 
            onClick={() => setActiveTab('barChart')}
          >
            <FaChartBar /> Gráfico de Barras
          </Tab>
          <Tab 
            active={activeTab === 'table'} 
            onClick={() => setActiveTab('table')}
          >
            <FaTable /> Tabla de Datos
          </Tab>
        </TabsContainer>
        
        {activeTab === 'lineChart' && (
          <ChartContainer>
            <Line 
              data={lineChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: `Ventas por ${periodType === 'daily' ? 'Día' : periodType === 'weekly' ? 'Semana' : periodType === 'monthly' ? 'Mes' : 'Año'}`,
                  },
                },
              }} 
            />
          </ChartContainer>
        )}
        
        {activeTab === 'barChart' && (
          <ChartContainer>
            <Bar 
              data={barChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: `Ventas por ${periodType === 'daily' ? 'Día' : periodType === 'weekly' ? 'Semana' : periodType === 'monthly' ? 'Mes' : 'Año'}`,
                  },
                },
              }} 
            />
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
                  <th>Subtotal</th>
                  <th>IVA</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detailData && detailData.length > 0 ? (
                  detailData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td>{item.documentNumber}</td>
                      <td>{item.client}</td>
                      <td>${item.subtotal.toLocaleString()}</td>
                      <td>${item.tax.toLocaleString()}</td>
                      <td>${item.total.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Container>
  );
};

export default SalesByPeriodPage;
