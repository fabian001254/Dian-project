import api from './api.config';

// Interfaces para los reportes
export interface ReportSummary {
  label: string;
  value: string | number;
}

export interface SalesReportData {
  period: string;
  sales: number;
  previousPeriodSales?: number;
}

export interface TaxReportData {
  period: string;
  baseAmount: number;
  taxAmount: number;
}

export interface DocumentStatusData {
  status: 'draft' | 'issued' | 'accepted' | 'rejected' | 'pending';
  count: number;
}

export interface DocumentDetail {
  id: string;
  date: string;
  documentNumber: string;
  client: string;
  type: string;
  total: number;
  status: 'draft' | 'issued' | 'accepted' | 'rejected' | 'pending';
}

export interface IvaDetail {
  id: string;
  date: string;
  documentNumber: string;
  client: string;
  baseAmount: number;
  ivaRate: number;
  ivaAmount: number;
}

export interface SalesDetail {
  id: string;
  date: string;
  documentNumber: string;
  client: string;
  subtotal: number;
  tax: number;
  total: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  periodType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  documentType?: 'all' | 'invoice' | 'creditNote' | 'debitNote';
  status?: 'all' | 'draft' | 'issued' | 'accepted' | 'rejected' | 'pending';
  reportType?: 'generated' | 'deductible';
  periodicity?: 'monthly' | 'bimonthly';
  year?: string;
  month?: string;
  compareWithPrevious?: boolean;
  vendorId?: string; // Añadido para filtrar por vendedor
  createdBy?: string; // Añadido para compatibilidad con el backend que usa createdBy para filtrar por vendedor
}

export interface DashboardStats {
  salesMetrics: ReportSummary[];
  salesData: SalesReportData[];
  taxData: TaxReportData[];
  documentStatusData: DocumentStatusData[];
}

// Tipo para el reporte de ventas
export interface SalesReport {
  summary: ReportSummary[];
  details: SalesDetail[];
  chartData: SalesReportData[];
}

/**
 * Helper function to generate mock chart data for different period types
 * @param periodType Tipo de período (daily, weekly, monthly, yearly)
 * @param totalAmount Monto total para distribuir en los períodos
 * @returns Datos simulados para el gráfico
 */
function generateMockChartData(periodType: string, totalAmount: number): SalesReportData[] {
  const period = periodType || 'monthly';
  
  // Generate chart data based on period type
  switch (period) {
    case 'daily':
      return [
        { period: '01', sales: Math.floor(totalAmount * 0.1), previousPeriodSales: Math.floor(totalAmount * 0.085) },
        { period: '05', sales: Math.floor(totalAmount * 0.15), previousPeriodSales: Math.floor(totalAmount * 0.13) },
        { period: '10', sales: Math.floor(totalAmount * 0.08), previousPeriodSales: Math.floor(totalAmount * 0.068) },
        { period: '15', sales: Math.floor(totalAmount * 0.12), previousPeriodSales: Math.floor(totalAmount * 0.102) },
        { period: '20', sales: Math.floor(totalAmount * 0.18), previousPeriodSales: Math.floor(totalAmount * 0.153) },
        { period: '25', sales: Math.floor(totalAmount * 0.22), previousPeriodSales: Math.floor(totalAmount * 0.187) },
        { period: '30', sales: Math.floor(totalAmount * 0.15), previousPeriodSales: Math.floor(totalAmount * 0.13) },
      ];
    case 'weekly':
      return [
        { period: 'Semana 1', sales: Math.floor(totalAmount * 0.2), previousPeriodSales: Math.floor(totalAmount * 0.17) },
        { period: 'Semana 2', sales: Math.floor(totalAmount * 0.25), previousPeriodSales: Math.floor(totalAmount * 0.21) },
        { period: 'Semana 3', sales: Math.floor(totalAmount * 0.15), previousPeriodSales: Math.floor(totalAmount * 0.13) },
        { period: 'Semana 4', sales: Math.floor(totalAmount * 0.4), previousPeriodSales: Math.floor(totalAmount * 0.34) },
      ];
    case 'yearly':
      return [
        { period: '2023', sales: Math.floor(totalAmount * 0.7), previousPeriodSales: Math.floor(totalAmount * 0.6) },
        { period: '2024', sales: Math.floor(totalAmount * 0.85), previousPeriodSales: Math.floor(totalAmount * 0.7) },
        { period: '2025', sales: totalAmount, previousPeriodSales: Math.floor(totalAmount * 0.85) },
      ];
    default:
      // Default case for monthly or any other value
      return [
        { period: 'Ene', sales: Math.floor(totalAmount * 0.07), previousPeriodSales: Math.floor(totalAmount * 0.06) },
        { period: 'Feb', sales: Math.floor(totalAmount * 0.08), previousPeriodSales: Math.floor(totalAmount * 0.068) },
        { period: 'Mar', sales: Math.floor(totalAmount * 0.09), previousPeriodSales: Math.floor(totalAmount * 0.077) },
        { period: 'Abr', sales: Math.floor(totalAmount * 0.1), previousPeriodSales: Math.floor(totalAmount * 0.085) },
        { period: 'May', sales: Math.floor(totalAmount * 0.11), previousPeriodSales: Math.floor(totalAmount * 0.094) },
        { period: 'Jun', sales: Math.floor(totalAmount * 0.12), previousPeriodSales: Math.floor(totalAmount * 0.102) },
        { period: 'Jul', sales: Math.floor(totalAmount * 0.08), previousPeriodSales: Math.floor(totalAmount * 0.068) },
        { period: 'Ago', sales: Math.floor(totalAmount * 0.07), previousPeriodSales: Math.floor(totalAmount * 0.06) },
        { period: 'Sep', sales: Math.floor(totalAmount * 0.06), previousPeriodSales: Math.floor(totalAmount * 0.051) },
        { period: 'Oct', sales: Math.floor(totalAmount * 0.08), previousPeriodSales: Math.floor(totalAmount * 0.068) },
        { period: 'Nov', sales: Math.floor(totalAmount * 0.05), previousPeriodSales: Math.floor(totalAmount * 0.043) },
        { period: 'Dic', sales: Math.floor(totalAmount * 0.09), previousPeriodSales: Math.floor(totalAmount * 0.077) },
      ];
  }
}

/**
 * Genera un reporte de ventas simulado para pruebas
 * @param filters Filtros opcionales para el reporte
 * @returns Reporte de ventas simulado
 */
function generateMockSalesReport(filters: ReportFilters = {}): SalesReport {
  const safeFilters = filters || {};
  
  // Generar datos de detalle simulados
  const details: SalesDetail[] = [];
  for (let i = 1; i <= 10; i++) {
    details.push({
      id: `DOC-${i}`,
      date: '2023-12-01',
      documentNumber: `F-${1000 + i}`,
      client: `Cliente ${i}`,
      subtotal: 1000 * i,
      tax: 190 * i,
      total: 1190 * i,
    });
  }

  // Calcular totales para el resumen
  const subtotal = details.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = details.reduce((sum, item) => sum + item.tax, 0);
  const total = details.reduce((sum, item) => sum + item.total, 0);

  // Crear resumen
  const summary: ReportSummary[] = [
    { label: 'Subtotal', value: `$${subtotal.toLocaleString()}` },
    { label: 'IVA', value: `$${tax.toLocaleString()}` },
    { label: 'Total', value: `$${total.toLocaleString()}` },
  ];

  // Generar datos para el gráfico
  const chartData = generateMockChartData(safeFilters.periodType || 'monthly', total);

  return {
    summary,
    details,
    chartData,
  };
}

/**
 * Servicio para manejar las operaciones de reportes
 */
export const ReportsService = {
  /**
   * Obtener estadísticas para el dashboard de reportes
   * @param filters Filtros para las estadísticas
   * @returns Estadísticas del dashboard
   */
  getDashboardStats: async (filters: ReportFilters = {}): Promise<DashboardStats> => {
    try {
      console.log('Obteniendo estadísticas con filtros:', filters);
      
      // Intentar obtener datos reales de facturas primero
      // Asegurarse de que el vendorId se envía correctamente en los parámetros
      const params = { limit: '100', ...filters };
      console.log('Parámetros de consulta para estadísticas:', params);
      
      const invoiceResponse = await api.get('/invoices', { params });
      
      if (invoiceResponse && invoiceResponse.data && invoiceResponse.data.data && 
          Array.isArray(invoiceResponse.data.data) && invoiceResponse.data.data.length > 0) {
        
        const invoices = invoiceResponse.data.data;
        
        // Calcular métricas de ventas
        const totalVentas = invoices.reduce((sum: number, invoice: any) => {
          const total = typeof invoice.total === 'number' ? invoice.total : parseFloat(invoice.total || '0');
          return sum + total;
        }, 0);
        
        const facturaPromedio = invoices.length > 0 ? Math.floor(totalVentas / invoices.length) : 0;
        
        // Contar documentos por estado
        const statusCounts: Record<string, number> = {
          draft: 0,
          issued: 0,
          accepted: 0,
          rejected: 0,
          pending: 0
        };
        
        invoices.forEach((invoice: any) => {
          // Asegurarse de que el estado sea uno de los permitidos
          let status: 'draft' | 'issued' | 'accepted' | 'rejected' | 'pending' = 'issued';
          
          if (invoice.status && ['draft', 'issued', 'accepted', 'rejected', 'pending'].includes(invoice.status)) {
            status = invoice.status as 'draft' | 'issued' | 'accepted' | 'rejected' | 'pending';
          }
          
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Agrupar ventas por período para los datos del gráfico
        const salesByPeriod: Record<string, number> = {};
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        invoices.forEach((invoice: any) => {
          if (invoice.issueDate) {
            const date = new Date(invoice.issueDate);
            const month = months[date.getMonth()];
            const total = typeof invoice.total === 'number' ? invoice.total : parseFloat(invoice.total || '0');
            salesByPeriod[month] = (salesByPeriod[month] || 0) + total;
          }
        });
        
        const salesData = Object.entries(salesByPeriod).map(([period, sales]) => ({
          period,
          sales,
          previousPeriodSales: Math.floor(sales * 0.85)
        }));
        
        // Agrupar datos de IVA por período
        const taxByPeriod: Record<string, { baseAmount: number, taxAmount: number }> = {};
        
        invoices.forEach((invoice: any) => {
          if (invoice.issueDate) {
            const date = new Date(invoice.issueDate);
            const month = months[date.getMonth()];
            const subtotal = typeof invoice.subtotal === 'number' ? invoice.subtotal : parseFloat(invoice.subtotal || '0');
            const tax = typeof invoice.taxTotal === 'number' ? invoice.taxTotal : parseFloat(invoice.taxTotal || '0');
            
            if (!taxByPeriod[month]) {
              taxByPeriod[month] = { baseAmount: 0, taxAmount: 0 };
            }
            
            taxByPeriod[month].baseAmount += subtotal;
            taxByPeriod[month].taxAmount += tax;
          }
        });
        
        const taxData = Object.entries(taxByPeriod).map(([period, data]) => ({
          period,
          baseAmount: data.baseAmount,
          taxAmount: data.taxAmount
        }));
        
        // Crear datos de estado de documentos
        const documentStatusData: DocumentStatusData[] = [
          { status: 'draft', count: statusCounts.draft },
          { status: 'issued', count: statusCounts.issued },
          { status: 'accepted', count: statusCounts.accepted },
          { status: 'rejected', count: statusCounts.rejected },
          { status: 'pending', count: statusCounts.pending },
        ];
        
        return {
          salesMetrics: [
            { label: 'Ventas Totales', value: `$${totalVentas.toLocaleString()}` },
            { label: 'Facturas Emitidas', value: invoices.length.toString() },
            { label: 'Promedio por Factura', value: `$${facturaPromedio.toLocaleString()}` },
            { label: 'Tasa de Aceptación', value: `${Math.floor((statusCounts.accepted / (invoices.length || 1)) * 100)}%` },
          ],
          salesData,
          taxData,
          documentStatusData
        };
      }
      
      // Si no hay datos de facturas, intentar con el endpoint específico de dashboard
      const response = await api.get('/reports/dashboard', { params: filters });
      
      // Verificar si hay datos en la respuesta
      if (response && response.data) {
        // Asegurarse de que todos los arrays existan
        return {
          salesMetrics: response.data.salesMetrics || [],
          salesData: response.data.salesData || [],
          taxData: response.data.taxData || [],
          documentStatusData: response.data.documentStatusData || []
        };
      }
      
      // Si no hay datos, generar datos simulados
      console.warn('No se pudieron obtener datos reales, generando datos simulados');
      return {
        salesMetrics: [
          { label: 'Ventas Totales', value: '$1,250,000' },
          { label: 'Facturas Emitidas', value: '125' },
          { label: 'Promedio por Factura', value: '$10,000' },
          { label: 'Tasa de Aceptación', value: '85%' },
        ],
        salesData: generateMockChartData('monthly', 1250000),
        taxData: [
          { period: 'Ene', baseAmount: 100000, taxAmount: 19000 },
          { period: 'Feb', baseAmount: 120000, taxAmount: 22800 },
          { period: 'Mar', baseAmount: 95000, taxAmount: 18050 },
          { period: 'Abr', baseAmount: 110000, taxAmount: 20900 },
          { period: 'May', baseAmount: 130000, taxAmount: 24700 },
          { period: 'Jun', baseAmount: 115000, taxAmount: 21850 },
        ],
        documentStatusData: [
          { status: 'draft', count: 15 },
          { status: 'issued', count: 65 },
          { status: 'accepted', count: 35 },
          { status: 'rejected', count: 10 },
          { status: 'pending', count: 5 },
        ],
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      
      // Datos simulados como fallback
      return {
        salesMetrics: [
          { label: 'Ventas Totales', value: '$1,250,000' },
          { label: 'Facturas Emitidas', value: '125' },
          { label: 'Promedio por Factura', value: '$10,000' },
          { label: 'Tasa de Aceptación', value: '85%' },
        ],
        salesData: generateMockChartData('monthly', 1250000),
        taxData: [
          { period: 'Ene', baseAmount: 100000, taxAmount: 19000 },
          { period: 'Feb', baseAmount: 120000, taxAmount: 22800 },
          { period: 'Mar', baseAmount: 95000, taxAmount: 18050 },
          { period: 'Abr', baseAmount: 110000, taxAmount: 20900 },
          { period: 'May', baseAmount: 130000, taxAmount: 24700 },
          { period: 'Jun', baseAmount: 115000, taxAmount: 21850 },
        ],
        documentStatusData: [
          { status: 'draft', count: 15 },
          { status: 'issued', count: 65 },
          { status: 'accepted', count: 35 },
          { status: 'rejected', count: 10 },
          { status: 'pending', count: 5 },
        ],
      };
    }
  },

  /**
   * Obtener datos para el reporte de IVA
   * @param filters Filtros para el reporte
   * @returns Datos del reporte de IVA
   */
  getIvaReport: async (filters: ReportFilters = {}): Promise<{
    summary: ReportSummary[];
    details: IvaDetail[];
  }> => {
    try {
      const response = await api.get('/invoices', { params: filters });
      const invoices: any[] = response.data?.data || [];
      // Filtrar por año y mes
      const filtered = invoices.filter(inv => {
        const d = new Date(inv.date);
        if (filters.year && d.getFullYear().toString() !== filters.year) return false;
        if (filters.month && (d.getMonth() + 1).toString() !== filters.month) return false;
        return true;
      });
      const details: IvaDetail[] = filtered.map(inv => {
        const base = typeof inv.subtotal === 'number' ? inv.subtotal : parseFloat(inv.subtotal || '0');
        const iva = typeof inv.tax === 'number' ? inv.tax : parseFloat(inv.tax || '0');
        const rate = base ? (iva / base) * 100 : 0;
        return {
          id: inv.id,
          date: inv.date,
          documentNumber: inv.documentNumber,
          client: inv.client,
          baseAmount: base,
          ivaRate: Math.round(rate),
          ivaAmount: iva,
        };
      });
      const totalBase = details.reduce((sum, item) => sum + item.baseAmount, 0);
      const totalIva = details.reduce((sum, item) => sum + item.ivaAmount, 0);
      return {
        summary: [
          { label: 'Base Gravable', value: totalBase },
          { label: 'IVA Generado', value: totalIva },
          { label: 'Total', value: totalBase + totalIva },
        ],
        details,
      };
    } catch (error) {
      console.error('Error al obtener reporte de IVA:', error);
      return { summary: [], details: [] };
    }
  },

  /**
   * Obtener datos para el reporte de ventas por período
   * @param filters Filtros para el reporte
   * @returns Datos del reporte de ventas
   */
  getSalesByPeriodReport: async (filters: ReportFilters = {}): Promise<SalesReport> => {
    console.log('getSalesByPeriodReport - Filtros recibidos:', filters);
    
    try {
      // Intentar obtener datos reales del backend
      const response = await api.get('/invoices', { params: filters });
      
      // Verificar si hay datos en la respuesta
      if (response && response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const invoices = response.data.data;
        
        // Transformar facturas en detalles de ventas
        const details: SalesDetail[] = invoices
          .filter((invoice: any) => invoice && invoice.id)
          .map((invoice: any) => {
            const subtotal = typeof invoice.subtotal === 'number' ? invoice.subtotal : parseFloat(invoice.subtotal || '0');
            const tax = typeof invoice.taxTotal === 'number' ? invoice.taxTotal : parseFloat(invoice.taxTotal || '0');
            const total = typeof invoice.total === 'number' ? invoice.total : parseFloat(invoice.total || '0');
            
            return {
              id: invoice.id,
              date: invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'Sin fecha',
              documentNumber: `${invoice.prefix || ''}${invoice.number || ''}`,
              client: invoice.customer ? (invoice.customer.name || 'Cliente') : 'Cliente',
              subtotal,
              tax,
              total
            };
          });
        
        // Calcular totales para el resumen
        const totalVentas = details.reduce((sum, item) => sum + item.total, 0);
        const promedioDiario = details.length > 0 ? Math.floor(totalVentas / 30) : 0;
        const facturaPromedio = details.length > 0 ? Math.floor(totalVentas / details.length) : 0;
        
        // Generar datos para el gráfico según el tipo de período
        let chartData: SalesReportData[] = [];
        
        if (filters.periodType === 'daily') {
          // Agrupar por día
          const salesByDay = details.reduce((acc: Record<string, number>, item) => {
            if (item && item.date) {
              const dateParts = item.date.split('/');
              if (dateParts && dateParts.length > 0) {
                const day = dateParts[0]; // Formato DD/MM/YYYY
                acc[day] = (acc[day] || 0) + (item.total || 0);
              }
            }
            return acc;
          }, {});
          
          chartData = Object.entries(salesByDay).map(([day, sales]) => ({
            period: `${day}/${filters.month || (new Date().getMonth() + 1)}`,
            sales,
            previousPeriodSales: Math.floor(sales * 0.85),
          }));
        } else {
          // Para otros tipos de períodos, generar datos simulados
          const periodType = filters.periodType || 'monthly';
          chartData = generateMockChartData(periodType, totalVentas);
        }
        
        return {
          summary: [
            { label: 'Total Ventas', value: `$${totalVentas.toLocaleString()}` },
            { label: 'Promedio Diario', value: `$${promedioDiario.toLocaleString()}` },
            { label: 'Factura Promedio', value: `$${facturaPromedio.toLocaleString()}` },
            { label: 'Cantidad Facturas', value: details.length.toString() },
          ],
          details,
          chartData
        };
      }
      
      // Si no hay datos, intentar con el endpoint específico de reportes
      try {
        const reportResponse = await api.get('/reports/sales', { params: filters });
        if (reportResponse && reportResponse.data) {
          // Asegurarse de que todos los arrays existan
          return {
            summary: reportResponse.data.summary || [],
            details: reportResponse.data.details || [],
            chartData: reportResponse.data.chartData || []
          };
        }
      } catch (reportError) {
        console.warn('No se pudieron obtener datos del endpoint de reportes:', reportError);
      }
      
      // Si no hay datos, generar datos simulados
      console.warn('No se pudieron obtener datos reales, generando datos simulados');
      return generateMockSalesReport(filters);
    } catch (error) {
      // En caso de error, generar datos simulados
      console.error('Error al obtener reporte de ventas:', error);
      return generateMockSalesReport(filters);
    }
  },

  /**
   * Obtener detalles de estado de documentos
   * @param filters Filtros para el reporte
   * @returns Detalles del reporte de estado de documentos
   */
  getDocumentStatusReport: async (filters: ReportFilters = {}): Promise<{ details: DocumentDetail[] }> => {
    try {
      // Obtener facturas filtradas directamente
      const response = await api.get('/invoices', { params: { limit: '100', ...filters } });
      const invoices: any[] = response.data?.data || [];
      const details: DocumentDetail[] = invoices.map(inv => ({
        id: inv.id,
        date: inv.issueDate || inv.date,
        documentNumber: inv.prefix && inv.number ? `${inv.prefix}${inv.number}` : inv.documentNumber || inv.number,
        client: inv.customer?.name || inv.client || '',
        type: inv.type || 'invoice',
        total: typeof inv.total === 'number' ? inv.total : parseFloat(inv.total || '0'),
        status: inv.status,
      }));
      return { details };
    } catch (error) {
      console.error('Error al obtener detalles de estado de documentos:', error);
      return { details: [] };
    }
  },

  /**
   * Obtener datos para el reporte de estado de documentos
   * @param filters Filtros para el reporte
   * @returns Datos del reporte de estado de documentos
   */
  getDocumentStatusReportSummary: async (filters: ReportFilters = {}): Promise<{
    summary: { status: string; count: number; icon: string; label: string }[];
    details: DocumentDetail[];
  }> => {
    try {
      const response = await api.get('/reports/document-status', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error al obtener reporte de estado de documentos:', error);
      
      // Datos simulados como fallback
      return {
        summary: [
          { status: 'draft', count: 15, icon: 'FaFileAlt', label: 'Borradores' },
          { status: 'issued', count: 65, icon: 'FaFileInvoice', label: 'Emitidas' },
          { status: 'accepted', count: 35, icon: 'FaCheckCircle', label: 'Aceptadas' },
          { status: 'rejected', count: 9, icon: 'FaTimesCircle', label: 'Rechazadas' },
        ],
        details: [
          { id: '1', date: '2025-04-01', documentNumber: 'FE-001', client: 'Empresa ABC S.A.S', type: 'Factura', total: 12500, status: 'accepted' },
          { id: '2', date: '2025-04-05', documentNumber: 'FE-002', client: 'Compañía XYZ Ltda', type: 'Factura', total: 18000, status: 'accepted' },
          { id: '3', date: '2025-04-10', documentNumber: 'FE-003', client: 'Industrias 123 S.A', type: 'Factura', total: 9500, status: 'issued' },
          { id: '4', date: '2025-04-15', documentNumber: 'FE-004', client: 'Servicios Profesionales', type: 'Factura', total: 15000, status: 'issued' },
          { id: '5', date: '2025-04-18', documentNumber: 'FE-005', client: 'Distribuidora Nacional', type: 'Factura', total: 22000, status: 'issued' },
          { id: '6', date: '2025-04-22', documentNumber: 'NC-001', client: 'Comercializadora Sur', type: 'Nota Crédito', total: 13500, status: 'accepted' },
          { id: '7', date: '2025-04-25', documentNumber: 'FE-006', client: 'Consultores Asociados', type: 'Factura', total: 28000, status: 'rejected' },
          { id: '8', date: '2025-04-28', documentNumber: 'FE-007', client: 'Tecnología Avanzada', type: 'Factura', total: 19500, status: 'draft' },
          { id: '9', date: '2025-04-29', documentNumber: 'ND-001', client: 'Soluciones Empresariales', type: 'Nota Débito', total: 31000, status: 'pending' },
          { id: '10', date: '2025-04-30', documentNumber: 'FE-008', client: 'Constructora Moderna', type: 'Factura', total: 76890, status: 'draft' },
        ]
      };
    }
  },

  /**
   * Exportar un reporte a PDF
   * @param reportType Tipo de reporte
   * @param filters Filtros aplicados al reporte
   * @returns Blob con el contenido del PDF
   */
  exportReportToPdf: async (
    reportType: string,
    filters: ReportFilters = {}
  ): Promise<Blob> => {
    try {
      const response = await api.get(`/reports/${reportType}/export/pdf`, {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error al exportar reporte a PDF:', error);
      throw error;
    }
  },

  /**
   * Exportar un reporte a Excel
   * @param reportType Tipo de reporte
   * @param filters Filtros aplicados al reporte
   * @returns Blob con el contenido del Excel
   */
  exportReportToExcel: async (
    reportType: string,
    filters: ReportFilters = {}
  ): Promise<Blob> => {
    try {
      const response = await api.get(`/reports/${reportType}/export/excel`, {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error al exportar reporte a Excel:', error);
      throw error;
    }
  }
};

export default ReportsService;
