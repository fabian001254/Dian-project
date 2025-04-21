import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Invoice, InvoiceStatus } from '../../models/Invoice';
import { Customer } from '../../models/Customer';
import { Product } from '../../models/Product';

/**
 * Controlador para el dashboard
 */
export class DashboardController {
  /**
   * Obtiene las estadísticas para el dashboard
   * @param req Request
   * @param res Response
   */
  public getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtener el ID de la empresa del usuario autenticado
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        res.status(400).json({
          success: false,
          message: 'Usuario no asociado a una empresa'
        });
        return;
      }
      
      // Repositorios
      const invoiceRepository = AppDataSource.getRepository(Invoice);
      const customerRepository = AppDataSource.getRepository(Customer);
      const productRepository = AppDataSource.getRepository(Product);
      
      // Obtener el total de facturas
      const totalInvoices = await invoiceRepository.count({
        where: { company: { id: companyId } }
      });
      
      // Obtener el total de facturas pendientes
      const pendingInvoices = await invoiceRepository.count({
        where: { 
          company: { id: companyId },
          status: InvoiceStatus.PENDING
        }
      });
      
      // Obtener el total de clientes
      const totalCustomers = await customerRepository.count();
      
      // Obtener el total de productos
      const totalProducts = await productRepository.count({
        where: { company: { id: companyId } }
      });
      
      // Enviar respuesta
      res.status(200).json({
        success: true,
        data: {
          totalInvoices,
          pendingInvoices,
          totalCustomers,
          totalProducts
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las estadísticas del dashboard',
        error: error.message
      });
    }
  };
}
