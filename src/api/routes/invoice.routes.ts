import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const invoiceController = new InvoiceController();

// Rutas para facturas
// Obtener todas las facturas de la empresa autenticada
router.get('/', authMiddleware, (req, res) => {
  // Añadir el companyId del usuario autenticado a los parámetros
  const companyId = (req as any).user?.companyId;
  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: 'Usuario no asociado a una empresa'
    });
  }
  
  // Crear un nuevo objeto Request con los parámetros modificados
  const modifiedReq = Object.create(req);
  modifiedReq.params = { ...req.params, companyId };
  
  return invoiceController.getInvoicesForCompany(modifiedReq, res);
});
router.post('/', invoiceController.createInvoice);

// Rutas para obtener facturas (deben ir antes de /:id para evitar conflictos)
router.get('/recent', invoiceController.getRecentInvoices);
router.get('/customer/:customerId', invoiceController.getCustomerInvoices);
router.get('/company/:companyId', invoiceController.getInvoicesForCompany);

// Nuevo endpoint para facturas de un vendedor
router.get('/vendor/:vendorId', (req, res) => {
  // Obtener el companyId del usuario autenticado
  const companyId = (req as any).user?.companyId;
  if (!companyId) {
    return res.status(400).json({
      success: false,
      message: 'Usuario no asociado a una empresa'
    });
  }
  
  // Añadir el vendorId como createdBy en la consulta
  req.query.createdBy = req.params.vendorId;
  
  // Crear un nuevo objeto Request con los parámetros modificados
  const modifiedReq = Object.create(req);
  modifiedReq.params = { ...req.params, companyId };
  
  return invoiceController.getInvoicesForCompany(modifiedReq, res);
});

// Estadísticas mensuales de facturación
router.get('/stats', authMiddleware, invoiceController.getInvoicesStats);

// Otras rutas
router.get('/:id', invoiceController.getInvoice);
// Descargar PDF o XML
router.get('/:id/download/:format', (req, res) => invoiceController.downloadInvoice(req, res));
router.post('/:id/send-to-dian', invoiceController.sendInvoiceToDian);
// Endpoint para enviar facturas por correo electrónico
router.post('/:id/send-by-email', invoiceController.sendInvoiceByEmail);

export default router;
