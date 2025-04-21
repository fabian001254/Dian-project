import { Request, Response } from 'express';
// @ts-ignore: archiver has no type declarations
import archiver from 'archiver';
import { AppDataSource } from '../../config/database';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceStatus, Invoice } from '../../models/Invoice';
import { Customer } from '../../models/Customer';

/**
 * Controlador para la gestión de facturas electrónicas
 */
export class InvoiceController {
  private invoiceService: InvoiceService;

  constructor() {
    this.invoiceService = new InvoiceService();
  }

  /**
   * Crea una nueva factura
   * @param req Request
   * @param res Response
   */
  public createInvoice = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log('createInvoice payload:', req.body);
      const { invoiceData, items } = req.body;
      console.log('Parsed invoiceData:', invoiceData);
      console.log('Parsed items:', items);
      if (!invoiceData || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Items y datos de factura son obligatorios' });
      }
      // Usar vendorId proporcionado en invoiceData
      const vendorId = invoiceData.vendorId;
      if (!vendorId) {
        return res.status(400).json({ success: false, message: 'El campo vendorId es obligatorio' });
      }
      console.log('Using invoiceData.vendorId:', vendorId);
      // Impedir que el vendedor se compre su propio item
      if ((req as any).user?.role === 'vendor' && (req as any).user.id === vendorId) {
        return res.status(403).json({ success: false, message: 'No puedes comprar tu propio producto' });
      }
      // Asignar empresa del usuario autenticado
      if (!(req as any).user?.companyId) {
        return res.status(400).json({ success: false, message: 'Usuario no asociado a una empresa' });
      }
      invoiceData.companyId = (req as any).user.companyId;
      console.log('Assigned invoiceData.companyId:', invoiceData.companyId);

      // Crear factura
      const invoice = await this.invoiceService.createInvoice(invoiceData, items);

      return res.status(201).json({
        success: true,
        message: 'Factura creada exitosamente',
        data: invoice
      });
    } catch (error) {
      console.error('Error al crear factura:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear la factura',
        error: error.message
      });
    }
  };

  /**
   * Obtiene una factura por su ID
   * @param req Request
   * @param res Response
   */
  public getInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const invoice = await this.invoiceService.getInvoiceWithRelations(id);

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('Error al obtener factura:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la factura',
        error: error.message
      });
    }
  };

  /**
   * Obtiene todas las facturas de una empresa con opciones de filtrado
   * @param req Request
   * @param res Response
   */
  public getCompanyInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      const { status, customerId, createdBy } = req.query;

      console.log('Filtros de búsqueda:', { companyId, status, customerId, createdBy });

      // Obtener facturas con filtros
      const invoices = await this.invoiceService.getCompanyInvoices(
        companyId,
        status as InvoiceStatus,
        customerId as string,
        createdBy as string
      );

      // Agrupar facturas por cliente para la vista de resumen
      const invoicesByCustomer = invoices.reduce<Record<string, any[]>>((acc, invoice) => {
        const customerId = invoice.customerId;
        if (!acc[customerId]) {
          acc[customerId] = [];
        }
        acc[customerId].push(invoice);
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: invoices,
        summary: {
          invoicesByCustomer,
          totalInvoices: invoices.length,
          totalAmount: invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)
        }
      });
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas',
        error: error.message
      });
    }
  };

  /**
   * Envía una factura a la DIAN (simulado)
   * @param req Request
   * @param res Response
   */
  public sendInvoiceToDian = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Verificar que la factura existe
      const invoice = await this.invoiceService.getInvoiceWithRelations(id);

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
        return;
      }

      // Verificar que la factura está en estado borrador o rechazada
      if (invoice.status !== InvoiceStatus.DRAFT && invoice.status !== InvoiceStatus.REJECTED) {
        res.status(400).json({
          success: false,
          message: `No se puede enviar una factura con estado ${invoice.status}`
        });
        return;
      }

      // Enviar a la DIAN
      const updatedInvoice = await this.invoiceService.sendInvoiceToDian(id);

      res.status(200).json({
        success: true,
        message: updatedInvoice.status === InvoiceStatus.APPROVED
          ? 'Factura enviada y aprobada por la DIAN'
          : 'Factura enviada pero rechazada por la DIAN',
        data: updatedInvoice
      });
    } catch (error) {
      console.error('Error al enviar factura a la DIAN:', error);
      res.status(500).json({
        success: false,
        message: 'Error al enviar la factura a la DIAN',
        error: error.message
      });
    }
  };

  /**
   * Envía una factura por correo electrónico (simulado)
   * @param req Request
   * @param res Response
   */
  public sendInvoiceByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Verificar que la factura existe
      const invoice = await this.invoiceService.getInvoiceWithRelations(id);

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: 'Factura no encontrada'
        });
        return;
      }

      // Verificar que la factura está aprobada
      if (invoice.status !== InvoiceStatus.APPROVED) {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden enviar por correo facturas aprobadas por la DIAN'
        });
        return;
      }

      // Enviar por correo
      await this.invoiceService.sendInvoiceByEmail(invoice);

      res.status(200).json({
        success: true,
        message: `Factura enviada por correo a ${invoice.customer.email} (simulado)`
      });
    } catch (error) {
      console.error('Error al enviar factura por correo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al enviar la factura por correo',
        error: error.message
      });
    }
  };

  /**
   * Obtiene las facturas más recientes (para el dashboard)
   * @param req Request
   * @param res Response
   */
  public getRecentInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtener el ID de la empresa del usuario autenticado
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          message: 'Usuario no asociado a una empresa'
        });
        return;
      }

      // Obtener las facturas recientes (limitadas a 5)
      const invoices = await this.invoiceService.getCompanyInvoices(companyId);
      const recentInvoices = invoices.slice(0, 5);

      res.status(200).json({
        success: true,
        data: recentInvoices
      });
    } catch (error) {
      console.error('Error al obtener facturas recientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas recientes',
        error: error.message
      });
    }
  };

  /**
   * Obtiene todas las facturas de un cliente específico
   * @param req Request
   * @param res Response
   */
  public getCustomerInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { customerId } = req.params;
      const { status } = req.query;

      // Validar que el cliente existe
      const customerRepository = AppDataSource.getRepository(Customer);
      const customer = await customerRepository.findOne({ where: { id: customerId } });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
        return;
      }

      // Obtener facturas del cliente
      const invoiceRepository = AppDataSource.getRepository(Invoice);
      let query = invoiceRepository.createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.customer', 'customer')
        .leftJoinAndSelect('invoice.items', 'items')
        .where('invoice.customerId = :customerId', { customerId });

      if (status) {
        query = query.andWhere('invoice.status = :status', { status });
      }

      const invoices = await query.getMany();

      res.status(200).json({
        success: true,
        data: invoices,
        customer: {
          id: customer.id,
          name: customer.name,
          identificationType: customer.identificationType,
          identificationNumber: customer.identificationNumber
        }
      });
    } catch (error) {
      console.error('Error al obtener facturas del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las facturas del cliente',
        error: error.message
      });
    }
  };

  /**
   * Obtiene todas las facturas de la empresa autenticada
   */
  public getAllInvoices = async (req: Request, res: Response): Promise<Response> => {
    const companyId = (req as any).user?.companyId;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Usuario no asociado a una empresa' });
    }
    try {
      const invoices = await this.invoiceService.getCompanyInvoices(companyId);
      return res.status(200).json(invoices);
    } catch (error) {
      console.error('Error al obtener todas las facturas:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener las facturas', error: error.message });
    }
  };

  /**
   * Descarga PDF o XML de una factura
   * @param req Request
   * @param res Response
   */
  public async downloadInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id, format } = req.params;
      const invoice = await this.invoiceService.getInvoiceWithRelations(id);
      if (!invoice) {
        res.status(404).json({ success: false, message: 'Factura no encontrada' });
        return;
      }
      if (format === 'pdf') {
        const filePath = await this.invoiceService.generateAndSavePDF(invoice);
        res.download(filePath, `${invoice.prefix}${invoice.number}.pdf`, () => {
          res.end();
        });
      } else if (format === 'xml') {
        const filePath = await this.invoiceService.generateAndSaveXML(invoice);
        res.download(filePath, `${invoice.prefix}${invoice.number}.xml`, () => {
          res.end();
        });
      } else if (format === 'email') {
        const pdfPath = await this.invoiceService.generateAndSavePDF(invoice);
        const xmlPath = await this.invoiceService.generateAndSaveXML(invoice);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${invoice.prefix}${invoice.number}.zip"`);
        const archive = archiver('zip');
        archive.on('error', (err: Error) => { throw err; });
        archive.pipe(res);
        archive.file(pdfPath, { name: `${invoice.prefix}${invoice.number}.pdf` });
        archive.file(xmlPath, { name: `${invoice.prefix}${invoice.number}.xml` });
        await archive.finalize();
      } else {
        res.status(400).json({ success: false, message: 'Formato inválido' });
      }
    } catch (error) {
      console.error('Error al descargar factura:', error);
      res.status(500).json({ success: false, message: 'Error al descargar la factura', error: error.message });
    }
  }
}
