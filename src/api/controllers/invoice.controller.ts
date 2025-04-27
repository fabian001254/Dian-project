import { Request, Response } from 'express';
// @ts-ignore: archiver has no type declarations
import archiver from 'archiver';
import { AppDataSource } from '../../config/database';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceStatus, Invoice } from '../../models/Invoice';
import { Customer } from '../../models/Customer';
import { Vendor } from '../../models/Vendor';

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

      // Convertir vendorId (tabla vendors) a userId
      const vendorRepo = AppDataSource.getRepository(Vendor);
      const vendorEntity = await vendorRepo.findOne({ where: { id: vendorId } });
      if (!vendorEntity) {
        return res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
      }
      if (!vendorEntity.userId) {
        return res.status(400).json({ success: false, message: 'Vendedor sin userId asociado' });
      }
      invoiceData.vendorId = vendorEntity.userId;

      // Impedir que el vendedor se compre su propio item
      if ((req as any).user?.role === 'vendor' && (req as any).user.id === invoiceData.vendorId) {
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

      // Agregar datos completos del vendedor desde Vendor
      try {
        console.log('Buscando vendedor para la factura. VendorId:', invoice.vendorId);
        const vendorRepo = AppDataSource.getRepository(Vendor);
        
        // Primero intentamos buscar por userId
        let vendorEntity = await vendorRepo.findOne({ 
          where: { userId: invoice.vendorId }, 
          relations: ['user'] 
        });
        
        // Si no lo encontramos por userId, intentamos buscar por id
        if (!vendorEntity) {
          console.log('Vendedor no encontrado por userId, intentando buscar por id...');
          vendorEntity = await vendorRepo.findOne({ 
            where: { id: invoice.vendorId }, 
            relations: ['user'] 
          });
        }
        
        // Si encontramos el vendedor, extraemos sus datos
        if (vendorEntity && vendorEntity.user) {
          console.log('Vendedor encontrado:', vendorEntity.name);
          const vendorData = {
            firstName: vendorEntity.user.firstName || '',
            lastName: vendorEntity.user.lastName || '',
            identificationType: vendorEntity.user.identificationType || '',
            identificationNumber: vendorEntity.user.identificationNumber || '',
            email: vendorEntity.email || '',
            phone: vendorEntity.phone || '',
            address: vendorEntity.address || '',
            city: vendorEntity.city || ''
          };
          // Reemplazar invoice.vendor con datos detallados del vendor
          (invoice as any).vendor = vendorData;
          console.log('Datos del vendedor asignados a la factura:', vendorData);
        } else {
          console.log('No se encontró el vendedor para la factura');
          (invoice as any).vendor = {
            firstName: 'Vendedor',
            lastName: '',
            identificationType: '',
            identificationNumber: '',
            email: '',
            phone: '',
            address: '',
            city: ''
          };
        }
      } catch (vendorError) {
        console.error('Error al obtener datos del vendedor:', vendorError);
        // En caso de error, asignar un objeto vacío para evitar errores en el frontend
        (invoice as any).vendor = {
          firstName: 'Vendedor',
          lastName: '',
          identificationType: '',
          identificationNumber: '',
          email: '',
          phone: '',
          address: '',
          city: ''
        };
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
  public getInvoicesForCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      let { status, customerId, createdBy } = req.query;
      const currentUser = (req as any).user;

      // Si el usuario es un vendedor, forzar el filtro por vendedor
      if (currentUser && currentUser.role === 'vendor') {
        console.log('Usuario es vendedor, forzando filtro por vendorId:', currentUser.id);
        createdBy = currentUser.id;
      } else if (req.query.vendorId) {
        // Si se proporciona vendorId en la consulta, usarlo como createdBy
        console.log('Usando vendorId de la consulta como createdBy:', req.query.vendorId);
        createdBy = req.query.vendorId as string;
      }

      console.log('Filtros de búsqueda finales:', { companyId, status, customerId, createdBy });

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
   * Obtiene todas las facturas de un vendedor (por userId)
   */
  public getVendorInvoices = async (req: Request, res: Response): Promise<Response> => {
    const { vendorId } = req.params;
    try {
      // Filtrar facturas por ID de usuario del vendor
      const userId = vendorId;
      const invoiceRepository = AppDataSource.getRepository(Invoice);
      const invoices = await invoiceRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.customer', 'customer')
        .leftJoinAndSelect('invoice.items', 'items')
        .where('invoice.vendorId = :userId', { userId })
        .orderBy('invoice.issueDate', 'DESC')
        .getMany();
      return res.status(200).json({ success: true, data: invoices });
    } catch (error: any) {
      console.error('Error al obtener facturas de vendedor:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener las facturas', error: error.message });
    }
  };

  /**
   * Obtener todas las facturas de la empresa autenticada
   */
  public getAllInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId;
      if (!companyId) {
        res.status(400).json({ success: false, message: 'Usuario no asociado a una empresa' });
        return;
      }
      // Obtener facturas de la compañía, opcionalmente filtradas por año y mes
      const repo = AppDataSource.getRepository(Invoice);
      let qb = repo.createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.customer', 'customer')
        .where('invoice.companyId = :companyId', { companyId });
      // Filtros opcionales
      const y = req.query.year as string;
      const m = req.query.month as string;
      
      if (y) {
        const yr = parseInt(y, 10);
        // Usar strftime en lugar de EXTRACT para SQLite
        qb = qb.andWhere("strftime('%Y', invoice.issueDate) = :yr", { yr: yr.toString() });
      }
      if (m) {
        const mn = parseInt(m, 10);
        // Asegurarse de que el mes tenga dos dígitos (01, 02, etc.)
        const monthStr = mn.toString().padStart(2, '0');
        // Usar strftime en lugar de EXTRACT para SQLite
        qb = qb.andWhere("strftime('%m', invoice.issueDate) = :mn", { mn: monthStr });
        console.log(`Aplicando filtro de mes: ${monthStr} (valor original: ${m})`);
      }
      const invoices = await qb.orderBy('invoice.issueDate', 'ASC').getMany();
      res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      console.error('Error al obtener todas las facturas:', error);
      res.status(500).json({ success: false, message: 'Error al obtener las facturas', error: (error as Error).message });
    }
  };

  /**
   * Descarga PDF o XML de una factura
   * @param req Request
   * @param res Response
   */
  public downloadInvoice = async (req: Request, res: Response): Promise<void> => {
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
  };

  /**
   * Obtener estadísticas mensuales de facturas para dashboard
   */
  public getInvoicesStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId;
      
      if (!companyId) {
        res.status(400).json({ success: false, message: 'Usuario no asociado a una empresa' });
        return;
      }
      
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
      const month = req.query.month as string;
      
      console.log('Filtros recibidos en getInvoicesStats:', { year, month });
      
      const repo = AppDataSource.getRepository(Invoice);
      
      // Tipo para filas crudas de estadísticas
      type RawRow = { month: string; sales: string; tax: string };
      
      // Construir la consulta base
      let qb = repo.createQueryBuilder('invoice')
        .select("strftime('%m', invoice.issueDate)", 'month')
        .addSelect('SUM(invoice.total)', 'sales')
        .addSelect('SUM(invoice.taxTotal)', 'tax')
        .where('invoice.companyId = :companyId', { companyId })
        .andWhere("strftime('%Y', invoice.issueDate) = :year", { year: year.toString() });
        
      // Filtrar por vendedor si el usuario es un vendedor o si se proporciona un vendorId en la consulta
      const currentUser = (req as any).user;
      const queryVendorId = req.query.vendorId as string;
      
      if (currentUser && currentUser.role === 'vendor') {
        console.log('Filtrando estadísticas para el vendedor (usuario actual):', currentUser.id);
        qb = qb.andWhere('invoice.vendorId = :vendorId', { vendorId: currentUser.id });
      } else if (queryVendorId) {
        console.log('Filtrando estadísticas para el vendedor (desde query):', queryVendorId);
        qb = qb.andWhere('invoice.vendorId = :vendorId', { vendorId: queryVendorId });
      }
      
      // Aplicar filtro de mes si se proporciona
      if (month) {
        const monthStr = parseInt(month, 10).toString().padStart(2, '0');
        qb = qb.andWhere("strftime('%m', invoice.issueDate) = :month", { month: monthStr });
        console.log(`Aplicando filtro de mes en getInvoicesStats: ${monthStr} (valor original: ${month})`);
      }
      
      // Ejecutar la consulta
      const raw: RawRow[] = await qb
        .groupBy('month')
        .orderBy('month')
        .getRawMany();
      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      
      const salesData = months.map((m, idx) => {
        // En SQLite con strftime, los meses vienen como '01', '02', etc.
        const monthStr = (idx + 1).toString().padStart(2, '0');
        const entry = raw.find(r => r.month === monthStr);
        
        const sales = entry ? Number(entry.sales || 0) : 0;
        const prev = idx > 0 ?
          Number(raw.find(r => r.month === (idx).toString().padStart(2, '0'))?.sales || 0) : 0;
          
        return { period: m, sales, previousPeriodSales: prev };
      });
      const taxData = months.map((m, idx) => {
        // En SQLite con strftime, los meses vienen como '01', '02', etc.
        const monthStr = (idx + 1).toString().padStart(2, '0');
        const entry = raw.find(r => r.month === monthStr);
        
        const taxAmount = entry ? Number(entry.tax || 0) : 0;
        const sales = entry ? Number(entry.sales || 0) : 0;
        const base = sales - taxAmount;
        
        return { period: m, baseAmount: base, taxAmount };
      });
      // Document status totals - Construir consulta base para facturas
      let invoiceQuery = repo.createQueryBuilder('invoice')
        .where('invoice.companyId = :companyId', { companyId });
      
      // Aplicar el mismo filtro de vendedor que usamos para las estadísticas
      if (currentUser && currentUser.role === 'vendor') {
        console.log('Filtrando facturas para el vendedor (usuario actual):', currentUser.id);
        invoiceQuery = invoiceQuery.andWhere('invoice.vendorId = :vendorId', { vendorId: currentUser.id });
      } else if (queryVendorId) {
        console.log('Filtrando facturas para el vendedor (desde query):', queryVendorId);
        invoiceQuery = invoiceQuery.andWhere('invoice.vendorId = :vendorId', { vendorId: queryVendorId });
      }
      
      const allInv: Invoice[] = await invoiceQuery.getMany();
      
      const statusCounts: Record<string, number> = { draft:0, issued:0, approved:0, rejected:0, pending:0 };
      allInv.forEach(inv => {
        const st = inv.status || 'pending';
        // Mapear 'accepted' a 'approved' si es necesario
        const mappedStatus = st.toString() === 'accepted' ? 'approved' : st.toString();
        if (statusCounts[mappedStatus] !== undefined) statusCounts[mappedStatus]++;
      });
      
      const documentStatusData = Object.entries(statusCounts).map(([status, count]) => ({ status: status as any, count }));
      
      // Totals
      const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
      const totalIva = taxData.reduce((sum, d) => sum + d.taxAmount, 0);
      const totalInvoices = allInv.length;
      
      const salesMetrics = [
        { label: 'Ventas Totales', value: `$${totalSales.toLocaleString()}` },
        { label: 'IVA Total', value: `$${totalIva.toLocaleString()}` },
        { label: 'Facturas Emitidas', value: totalInvoices }
      ];
      
      res.status(200).json({ success: true, data: { salesMetrics, salesData, taxData, documentStatusData } });
    } catch (error) {
      console.error('Error al obtener estadísticas de facturas:', error);
      res.status(500).json({ success: false, message: 'Error al obtener estadísticas', error: (error as Error).message });
    }
  };
}
