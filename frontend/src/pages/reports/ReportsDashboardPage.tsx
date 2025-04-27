import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { FaChartBar, FaFileExport, FaFilter, FaSearch, FaStar, FaDownload, FaCalendarAlt, FaUserAlt, FaBoxes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import SectionLoader from '../../components/ui/SectionLoader';
import Swal from 'sweetalert2';
import ReportsService, { ReportFilters, DashboardStats } from '../../services/reports.service';
import VendorReportsService from '../../services/vendor-reports.service';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  
  h2 {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--color-text);
    display: flex;
    align-items: center;
    
    svg {
      margin-right: var(--spacing-sm);
    }
  }
`;

const ChartContainer = styled.div`
  height: 250px;
  position: relative;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
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

const MetricValue = styled.div`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
`;

const MetricLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const ReportsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ReportCard = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
  }
`;

const ReportIcon = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  svg {
    font-size: var(--font-size-xl);
    color: var(--color-primary);
    margin-right: var(--spacing-sm);
  }
`;

const ReportTitle = styled.div`
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
`;

const ReportDescription = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
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

const FavoriteReportsSection = styled.div`
  margin-bottom: var(--spacing-xl);
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

// Interfaces
interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  category: 'tax' | 'sales' | 'documents';
}

interface Metric {
  value: string | number;
  label: string;
}

const ReportsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    periodType: 'monthly',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString()
  });
  
  // Datos para los gráficos
  const salesData = {
    labels: dashboardData?.salesData?.map(item => item.period) || [],
    datasets: [
      {
        label: `Ventas ${selectedYear}`,
        data: dashboardData?.salesData?.map(item => item.sales) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: `Ventas ${parseInt(selectedYear) - 1}`,
        data: dashboardData?.salesData?.map(item => item.previousPeriodSales || 0) || [],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
      },
    ],
  };
  
  const taxData = {
    labels: dashboardData?.taxData?.map(item => item.period) || [],
    datasets: [
      {
        label: 'Base Imponible',
        data: dashboardData?.taxData?.map(item => item.baseAmount) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Base Gravable',
        data: dashboardData?.taxData?.map(item => item.baseAmount) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };
  
  const documentStatusData = {
    labels: dashboardData?.documentStatusData?.map(item => {
      switch (item.status) {
        case 'draft': return 'Borradores';
        case 'issued': return 'Emitidas';
        case 'accepted': return 'Aceptadas';
        case 'rejected': return 'Rechazadas';
        case 'pending': return 'Pendientes';
        default: return item.status;
      }
    }) || [],
    datasets: [
      {
        data: dashboardData?.documentStatusData?.map(item => item.count) || [],
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
  
  // Métricas clave - se obtienen del servicio
  const metrics: Metric[] = dashboardData?.salesMetrics || [
    { value: '$0', label: 'Ventas del Mes' },
    { value: '$0', label: 'IVA del Mes' },
    { value: '0', label: 'Facturas Emitidas' },
  ];
  
  // Tipos de reportes disponibles
  const reportTypes: ReportType[] = [
    {
      id: 'tax-iva',
      title: 'Informe de IVA',
      description: 'Reporte mensual o bimestral de IVA generado y descontable',
      icon: <FaChartBar />,
      path: '/reports/tax/iva',
      category: 'tax',
    },
    {
      id: 'tax-withholding',
      title: 'Reporte de Retenciones',
      description: 'Informe de retenciones aplicadas y recibidas',
      icon: <FaChartBar />,
      path: '/reports/tax/withholding',
      category: 'tax',
    },
    {
      id: 'sales-period',
      title: 'Ventas por Período',
      description: 'Análisis de ventas por día, semana, mes o año',
      icon: <FaChartBar />,
      path: '/reports/sales/period',
      category: 'sales',
    },
    {
      id: 'sales-customer',
      title: 'Ventas por Cliente',
      description: 'Detalle de ventas agrupadas por cliente',
      icon: <FaUserAlt />,
      path: '/reports/sales/customer',
      category: 'sales',
    },
    {
      id: 'sales-product',
      title: 'Ventas por Producto',
      description: 'Análisis de ventas por producto o servicio',
      icon: <FaBoxes />,
      path: '/reports/sales/product',
      category: 'sales',
    },
    {
      id: 'documents-status',
      title: 'Estado de Facturas',
      description: 'Reporte de facturas por estado (borrador, emitida, aceptada, rechazada)',
      icon: <FaFileExport />,
      path: '/reports/documents/status',
      category: 'documents',
    },
  ];
  
  // Reportes favoritos (simulados)
  const favoriteReports: ReportType[] = [
    reportTypes[0], // Informe de IVA
    reportTypes[2], // Ventas por Período
  ];

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Determinar qué servicio usar según el rol del usuario
      let response;
      
      if (user && user.role === 'vendor') {
        // Si es un vendedor, usar el servicio específico para vendedores
        console.log('Cargando datos de reportes filtrados para vendedor:', user.id);
        response = await VendorReportsService.getDashboardStats(filters);
      } else {
        // Si es admin u otro rol, usar el servicio normal
        response = await ReportsService.getDashboardStats(filters);
      }
      
      // Actualizar el estado con los datos recibidos
      setDashboardData({
        salesMetrics: response.salesMetrics || [],
        salesData: response.salesData || [],
        taxData: response.taxData || [],
        documentStatusData: response.documentStatusData || []
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los datos del dashboard',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  useEffect(() => {
    // Actualizar filtros cuando cambian los valores seleccionados
    // Asegurarse de que el mes tenga siempre dos dígitos (01, 02, etc.)
    const formattedMonth = selectedMonth ? parseInt(selectedMonth, 10).toString().padStart(2, '0') : '';
    
    const newFilters: ReportFilters = {
      ...filters,
      periodType: selectedPeriod === 'day' ? 'daily' : 
                 selectedPeriod === 'week' ? 'weekly' : 
                 selectedPeriod === 'month' ? 'monthly' : 'yearly',
      year: selectedYear,
      month: formattedMonth
    };
    
    console.log('Actualizando filtros:', newFilters);
    setFilters(newFilters);
    
    // Cargar datos automáticamente cuando cambian los filtros
    // Esto asegura que los cambios en los filtros se apliquen inmediatamente
    if (selectedYear || selectedMonth) {
      loadDashboardData();
    }
  }, [selectedPeriod, selectedYear, selectedMonth]);
  
  const handleReportClick = (report: ReportType) => {
    navigate(report.path);
  };
  
  const handleExportDashboard = async () => {
    Swal.fire({
      title: 'Exportando Dashboard',
      text: 'Preparando la exportación del dashboard...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      const pdfBlob = await ReportsService.exportReportToPdf('dashboard', filters);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard_reportes_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Swal.fire({
        title: '¡Exportación Completada!',
        text: 'El dashboard ha sido exportado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al exportar dashboard:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo exportar el dashboard',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };
  
  const handleFilterChange = () => {
    loadDashboardData();
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <SectionLoader message="Cargando dashboard de reportes" size="large" />
      </div>
    );
  }
  
  return (
    <Container>
      <Header>
        <h1><FaChartBar /> Dashboard de Reportes</h1>
        <Button variant="primary" onClick={handleExportDashboard}>
          <FaDownload /> Exportar Dashboard
        </Button>
      </Header>
      
      <FilterBar>
        <FilterGroup>
          <label htmlFor="period">Período</label>
          <select 
            id="period" 
            value={selectedPeriod} 
            onChange={(e) => {
              setSelectedPeriod(e.target.value as 'day' | 'week' | 'month' | 'year');
              handleFilterChange();
            }}
          >
            <option value="day">Diario</option>
            <option value="week">Semanal</option>
            <option value="month">Mensual</option>
            <option value="year">Anual</option>
          </select>
        </FilterGroup>
        
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
        
        <FilterGroup>
          <label htmlFor="month">Mes</label>
          <select 
            id="month" 
            value={selectedMonth} 
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              handleFilterChange();
            }}
            disabled={selectedPeriod === 'year'}
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
        
        <Button 
          variant="secondary" 
          onClick={handleFilterChange}
          style={{ alignSelf: 'flex-end' }}
        >
          <FaFilter /> Aplicar Filtros
        </Button>
      </FilterBar>
      
      <MetricsGrid>
        {metrics && metrics.length > 0 ? (
          metrics.map((metric, index) => (
            <MetricCard key={index}>
              <MetricValue>{metric.value}</MetricValue>
              <MetricLabel>{metric.label}</MetricLabel>
            </MetricCard>
          ))
        ) : (
          <MetricCard>
            <MetricValue>$0</MetricValue>
            <MetricLabel>No hay datos disponibles</MetricLabel>
          </MetricCard>
        )}
      </MetricsGrid>
      
      <DashboardGrid>
        <Card>
          <CardHeader>
            <h2><FaChartBar /> Ventas Mensuales</h2>
          </CardHeader>
          <ChartContainer>
            <Line 
              data={salesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }} 
            />
          </ChartContainer>
        </Card>
        
        <Card>
          <CardHeader>
            <h2><FaChartBar /> IVA Mensual</h2>
          </CardHeader>
          <ChartContainer>
            <Bar 
              data={taxData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }} 
            />
          </ChartContainer>
        </Card>
        
        <Card>
          <CardHeader>
            <h2><FaChartBar /> Estado de Facturas</h2>
          </CardHeader>
          <ChartContainer>
            <Pie 
              data={documentStatusData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }} 
            />
          </ChartContainer>
        </Card>
      </DashboardGrid>
      
      <FavoriteReportsSection>
        <SectionTitle><FaStar /> Reportes Favoritos</SectionTitle>
        <ReportsList>
          {favoriteReports.map((report) => (
            <ReportCard key={report.id} onClick={() => handleReportClick(report)}>
              <ReportIcon>
                {report.icon}
                <ReportTitle>{report.title}</ReportTitle>
              </ReportIcon>
              <ReportDescription>{report.description}</ReportDescription>
              <Button variant="text" size="small">
                Generar Reporte
              </Button>
            </ReportCard>
          ))}
        </ReportsList>
      </FavoriteReportsSection>
      
      <div>
        <SectionTitle><FaFileExport /> Todos los Reportes</SectionTitle>
        <ReportsList>
          {reportTypes.map((report) => (
            <ReportCard key={report.id} onClick={() => handleReportClick(report)}>
              <ReportIcon>
                {report.icon}
                <ReportTitle>{report.title}</ReportTitle>
              </ReportIcon>
              <ReportDescription>{report.description}</ReportDescription>
              <Button variant="text" size="small">
                Generar Reporte
              </Button>
            </ReportCard>
          ))}
        </ReportsList>
      </div>
    </Container>
  );
};

export default ReportsDashboardPage;
