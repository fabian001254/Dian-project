import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../../components/ui/Button';
import { FaChartBar, FaFilter, FaArrowLeft, FaDownload, FaTable } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import SectionLoader from '../../../components/ui/SectionLoader';
import Swal from 'sweetalert2';
import ReportsService, { ReportFilters, IvaDetail, ReportSummary, DashboardStats } from '../../../services/reports.service';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

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

const IvaReportPage: React.FC = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
  const [reportType, setReportType] = useState<'generated' | 'deductible'>('generated');
  const [periodType, setPeriodType] = useState<'monthly' | 'bimonthly'>('monthly');
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonth); // Mes o bimestre
  const [summaryData, setSummaryData] = useState<ReportSummary[]>([]);
  const [detailData, setDetailData] = useState<IvaDetail[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'generated',
    periodicity: 'monthly',
    year: currentYear,
    month: currentMonth
  });
  
  // Datos para el gráfico
  const chartData = {
    labels: detailData?.map(item => item.documentNumber) ?? [],
    datasets: [
      {
        label: 'Base Gravable',
        data: detailData?.map(item => item.baseAmount) ?? [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'IVA',
        data: detailData?.map(item => item.ivaAmount) ?? [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };
  
  // Cargar datos del reporte de IVA
  const loadIvaReportData = async () => {
    console.log('DEBUG IvaReportPage - loadIvaReportData start with filters:', filters);
    setLoading(true);
    try {
      // Obtener datos de IVA mensual desde el dashboard
      const dash: DashboardStats = await ReportsService.getDashboardStats(filters);
      const taxArr = dash.taxData || [];
      console.log('DEBUG IvaReportPage - taxData from dashboard:', taxArr);
      // Calcular totales
      const totalBase = taxArr.reduce((sum, t) => sum + t.baseAmount, 0);
      const totalIva = taxArr.reduce((sum, t) => sum + t.taxAmount, 0);
      // Establecer summary
      setSummaryData([
        { label: 'Base Gravable', value: totalBase },
        { label: 'IVA Generado', value: totalIva },
        { label: 'Total', value: totalBase + totalIva }
      ]);
      // Construir detalles para tabla
      const details: IvaDetail[] = taxArr.map(t => ({
        id: t.period,
        date: t.period,
        documentNumber: t.period,
        client: '',
        baseAmount: t.baseAmount,
        ivaRate: t.baseAmount ? Math.round((t.taxAmount / t.baseAmount) * 100) : 0,
        ivaAmount: t.taxAmount
      }));
      setDetailData(details);
      console.log('DEBUG IvaReportPage - detailData set to:', details);
    } catch (error) {
      console.error('Error al cargar datos del reporte de IVA:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los datos del reporte de IVA',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('DEBUG IvaReportPage - calling loadIvaReportData with filters:', filters);
    loadIvaReportData();
  }, []);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Actualizar filtros cuando cambian los valores seleccionados
    const newFilters: ReportFilters = {
      ...filters,
      reportType,
      periodicity: periodType,
      year: selectedYear,
      month: selectedPeriod
    };
    console.log('DEBUG IvaReportPage - updating filters to:', newFilters);
    setFilters(newFilters);
  }, [reportType, periodType, selectedYear, selectedPeriod]);
  
  const handleFilterChange = () => {
    console.log('DEBUG IvaReportPage - handleFilterChange with filters:', filters);
    loadIvaReportData();
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
      const pdfBlob = await ReportsService.exportReportToPdf('tax/iva', filters);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_iva_${selectedYear}_${selectedPeriod}.pdf`);
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
      const excelBlob = await ReportsService.exportReportToExcel('tax/iva', filters);
      
      // Crear URL para el blob y descargar
      const url = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_iva_${selectedYear}_${selectedPeriod}.xlsx`);
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
        <SectionLoader message="Cargando reporte de IVA" size="large" />
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
          <h1><FaChartBar /> Informe de IVA</h1>
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
          <label htmlFor="reportType">Tipo de Reporte</label>
          <select 
            id="reportType" 
            value={reportType} 
            onChange={(e) => {
              setReportType(e.target.value as 'generated' | 'deductible');
              handleFilterChange();
            }}
          >
            <option value="generated">IVA Generado</option>
            <option value="deductible">IVA Descontable</option>
          </select>
        </FilterGroup>
        
        <FilterGroup>
          <label htmlFor="periodType">Periodicidad</label>
          <select 
            id="periodType" 
            value={periodType} 
            onChange={(e) => {
              setPeriodType(e.target.value as 'monthly' | 'bimonthly');
              setSelectedPeriod('1'); // Resetear el período seleccionado
              handleFilterChange();
            }}
          >
            <option value="monthly">Mensual</option>
            <option value="bimonthly">Bimestral</option>
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
          <label htmlFor="period">
            {periodType === 'monthly' ? 'Mes' : 'Bimestre'}
          </label>
          <select 
            id="period" 
            value={selectedPeriod} 
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              handleFilterChange();
            }}
          >
            {periodType === 'monthly' ? (
              <>
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
              </>
            ) : (
              <>
                <option value="1">Ene - Feb</option>
                <option value="2">Mar - Abr</option>
                <option value="3">May - Jun</option>
                <option value="4">Jul - Ago</option>
                <option value="5">Sep - Oct</option>
                <option value="6">Nov - Dic</option>
              </>
            )}
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
      
      <SummaryGrid>
        {summaryData.map((item, index) => (
          <SummaryCard key={index}>
            <SummaryValue>{item.value}</SummaryValue>
            <SummaryLabel>{item.label}</SummaryLabel>
          </SummaryCard>
        ))}
      </SummaryGrid>
      
      <Card>
        <TabsContainer>
          <Tab 
            active={activeTab === 'table'} 
            onClick={() => setActiveTab('table')}
          >
            <FaTable /> Tabla de Datos
          </Tab>
          <Tab 
            active={activeTab === 'chart'} 
            onClick={() => setActiveTab('chart')}
          >
            <FaChartBar /> Gráfico
          </Tab>
        </TabsContainer>
        
        {activeTab === 'table' ? (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th>Cliente</th>
                  <th>Base Gravable</th>
                  <th>Tarifa IVA</th>
                  <th>IVA</th>
                </tr>
              </thead>
              <tbody>
                {detailData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.documentNumber}</td>
                    <td>{item.client}</td>
                    <td>${item.baseAmount.toLocaleString()}</td>
                    <td>{item.ivaRate}%</td>
                    <td>${item.ivaAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        ) : (
          <ChartContainer>
            <Bar 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Detalle de IVA por Documento',
                  },
                },
              }} 
            />
          </ChartContainer>
        )}
      </Card>
    </Container>
  );
};

export default IvaReportPage;
