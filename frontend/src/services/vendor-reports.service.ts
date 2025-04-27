import ReportsService, { ReportFilters, DashboardStats, SalesReport } from './reports.service';
import { useAuth } from '../context/AuthContext';

/**
 * Servicio para manejar las operaciones de reportes específicas para vendedores
 * Extiende el servicio de reportes original para añadir filtrado por vendedor
 */
export const VendorReportsService = {
  /**
   * Obtener estadísticas para el dashboard de reportes filtradas por vendedor
   * @param filters Filtros para las estadísticas
   * @param vendorId ID del vendedor para filtrar (opcional, si no se proporciona se tomará del usuario actual)
   * @returns Estadísticas del dashboard
   */
  getDashboardStats: async (filters: ReportFilters = {}, vendorId?: string): Promise<DashboardStats> => {
    try {
      // Si se proporciona un vendorId, usarlo, sino intentar obtenerlo del contexto de autenticación
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
      const effectiveVendorId = vendorId || (currentUser?.role === 'vendor' ? currentUser.id : undefined);
      
      // Solo añadir el filtro de vendedor si hay un ID de vendedor disponible
      const vendorFilters: ReportFilters = effectiveVendorId 
        ? { ...filters, vendorId: effectiveVendorId, createdBy: effectiveVendorId }
        : filters;
      
      console.log('Filtrando reportes por vendedor:', effectiveVendorId);
      console.log('Filtros enviados al backend:', vendorFilters);
      
      // Usar el servicio de reportes original con los filtros modificados
      return await ReportsService.getDashboardStats(vendorFilters);
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard para vendedor:', error);
      throw error;
    }
  },
  
  /**
   * Obtener datos para el reporte de IVA filtrados por vendedor
   * @param filters Filtros para el reporte
   * @param vendorId ID del vendedor para filtrar (opcional)
   * @returns Datos del reporte de IVA
   */
  getIvaReport: async (filters: ReportFilters = {}, vendorId?: string): Promise<{
    summary: any[];
    details: any[];
  }> => {
    try {
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
      const effectiveVendorId = vendorId || (currentUser?.role === 'vendor' ? currentUser.id : undefined);
      
      const vendorFilters: ReportFilters = effectiveVendorId 
        ? { ...filters, vendorId: effectiveVendorId }
        : filters;
      
      return await ReportsService.getIvaReport(vendorFilters);
    } catch (error) {
      console.error('Error al obtener reporte de IVA para vendedor:', error);
      throw error;
    }
  },
  
  /**
   * Obtener datos para el reporte de ventas por período filtrados por vendedor
   * @param filters Filtros para el reporte
   * @param vendorId ID del vendedor para filtrar (opcional)
   * @returns Datos del reporte de ventas
   */
  getSalesByPeriodReport: async (filters: ReportFilters = {}, vendorId?: string): Promise<SalesReport> => {
    try {
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
      const effectiveVendorId = vendorId || (currentUser?.role === 'vendor' ? currentUser.id : undefined);
      
      const vendorFilters: ReportFilters = effectiveVendorId 
        ? { ...filters, vendorId: effectiveVendorId }
        : filters;
      
      return await ReportsService.getSalesByPeriodReport(vendorFilters);
    } catch (error) {
      console.error('Error al obtener reporte de ventas por período para vendedor:', error);
      throw error;
    }
  },
  
  /**
   * Obtener detalles de estado de documentos filtrados por vendedor
   * @param filters Filtros para el reporte
   * @param vendorId ID del vendedor para filtrar (opcional)
   * @returns Detalles del reporte de estado de documentos
   */
  getDocumentStatusReport: async (filters: ReportFilters = {}, vendorId?: string): Promise<{ details: any[] }> => {
    try {
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
      const effectiveVendorId = vendorId || (currentUser?.role === 'vendor' ? currentUser.id : undefined);
      
      const vendorFilters: ReportFilters = effectiveVendorId 
        ? { ...filters, vendorId: effectiveVendorId }
        : filters;
      
      return await ReportsService.getDocumentStatusReport(vendorFilters);
    } catch (error) {
      console.error('Error al obtener detalles de estado de documentos para vendedor:', error);
      throw error;
    }
  },
  
  /**
   * Exportar un reporte a PDF filtrado por vendedor
   * @param reportType Tipo de reporte
   * @param filters Filtros aplicados al reporte
   * @param vendorId ID del vendedor para filtrar (opcional)
   * @returns Blob con el contenido del PDF
   */
  exportReportToPdf: async (
    reportType: string,
    filters: ReportFilters = {},
    vendorId?: string
  ): Promise<Blob> => {
    try {
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
      const effectiveVendorId = vendorId || (currentUser?.role === 'vendor' ? currentUser.id : undefined);
      
      const vendorFilters: ReportFilters = effectiveVendorId 
        ? { ...filters, vendorId: effectiveVendorId }
        : filters;
      
      return await ReportsService.exportReportToPdf(reportType, vendorFilters);
    } catch (error) {
      console.error('Error al exportar reporte a PDF para vendedor:', error);
      throw error;
    }
  },
  
  /**
   * Exportar un reporte a Excel filtrado por vendedor
   * @param reportType Tipo de reporte
   * @param filters Filtros aplicados al reporte
   * @param vendorId ID del vendedor para filtrar (opcional)
   * @returns Blob con el contenido del Excel
   */
  exportReportToExcel: async (
    reportType: string,
    filters: ReportFilters = {},
    vendorId?: string
  ): Promise<Blob> => {
    try {
      const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
      const effectiveVendorId = vendorId || (currentUser?.role === 'vendor' ? currentUser.id : undefined);
      
      const vendorFilters: ReportFilters = effectiveVendorId 
        ? { ...filters, vendorId: effectiveVendorId }
        : filters;
      
      return await ReportsService.exportReportToExcel(reportType, vendorFilters);
    } catch (error) {
      console.error('Error al exportar reporte a Excel para vendedor:', error);
      throw error;
    }
  }
};

export default VendorReportsService;
