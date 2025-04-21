import api from './api.config';

interface InvoiceItem {
  id?: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
}

interface Invoice {
  id?: string;
  number?: string;
  customerId: string;
  date: string;
  dueDate: string;
  notes?: string;
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  items: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
  customer?: {
    id: string;
    name: string;
    documentNumber: string;
    documentType: string;
  };
  company?: {
    id: string;
    name: string;
    nit: string;
  };
}

interface InvoiceListResponse {
  success: boolean;
  message?: string;
  data: Invoice[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface InvoiceResponse {
  success: boolean;
  message?: string;
  data: Invoice;
}

/**
 * Servicio para manejar las operaciones de facturas electrónicas
 */
export const InvoiceService = {
  /**
   * Obtener lista de facturas con filtros opcionales
   * @param filters Filtros para la búsqueda (status, date, customerId, etc.)
   * @param page Número de página
   * @param limit Límite de resultados por página
   * @returns Lista de facturas
   */
  getInvoices: async (
    filters: Record<string, any> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<InvoiceListResponse> => {
    try {
      const params = { ...filters, page, limit };
      const response = await api.get<InvoiceListResponse>('/invoices', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener facturas recientes para el dashboard
   * @param limit Número de facturas a obtener
   * @returns Lista de facturas recientes
   */
  getRecentInvoices: async (limit: number = 5): Promise<InvoiceListResponse> => {
    try {
      const response = await api.get<InvoiceListResponse>('/invoices/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener una factura por su ID
   * @param id ID de la factura
   * @returns Datos de la factura
   */
  getInvoiceById: async (id: string): Promise<InvoiceResponse> => {
    try {
      const response = await api.get<InvoiceResponse>(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear una nueva factura
   * @param invoiceData Datos de la factura
   * @returns Factura creada
   */
  createInvoice: async (invoiceData: Invoice): Promise<InvoiceResponse> => {
    try {
      const response = await api.post<InvoiceResponse>('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar una factura existente
   * @param id ID de la factura
   * @param invoiceData Datos actualizados de la factura
   * @returns Factura actualizada
   */
  updateInvoice: async (id: string, invoiceData: Partial<Invoice>): Promise<InvoiceResponse> => {
    try {
      const response = await api.put<InvoiceResponse>(`/invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar una factura (solo disponible para borradores)
   * @param id ID de la factura
   * @returns Mensaje de éxito
   */
  deleteInvoice: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Enviar una factura a la DIAN
   * @param id ID de la factura
   * @returns Respuesta de la DIAN
   */
  sendInvoiceToDian: async (id: string): Promise<InvoiceResponse> => {
    try {
      const response = await api.post<InvoiceResponse>(`/invoices/${id}/send`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Enviar una factura por correo electrónico al cliente
   * @param id ID de la factura
   * @param email Email opcional del destinatario (si es diferente al del cliente)
   * @returns Mensaje de éxito
   */
  sendInvoiceByEmail: async (
    id: string,
    email?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        `/invoices/${id}/send-email`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Descargar una factura en formato PDF
   * @param id ID de la factura
   * @returns Blob con el contenido del PDF
   */
  downloadInvoicePdf: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Descargar una factura en formato XML
   * @param id ID de la factura
   * @returns Blob con el contenido del XML
   */
  downloadInvoiceXml: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get(`/invoices/${id}/xml`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener estadísticas de facturación para el dashboard
   * @returns Estadísticas de facturación
   */
  getInvoiceStats: async (): Promise<{
    success: boolean;
    data: {
      totalInvoices: number;
      pendingInvoices: number;
      approvedInvoices: number;
      rejectedInvoices: number;
      totalAmount: number;
    };
  }> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          totalInvoices: number;
          pendingInvoices: number;
          approvedInvoices: number;
          rejectedInvoices: number;
          totalAmount: number;
        };
      }>('/invoices/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default InvoiceService;
