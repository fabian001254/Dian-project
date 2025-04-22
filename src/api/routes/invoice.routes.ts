import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const invoiceController = new InvoiceController();

// Rutas para facturas
// Obtener todas las facturas de la empresa autenticada
router.get('/', authMiddleware, invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);

// Rutas para obtener facturas (deben ir antes de /:id para evitar conflictos)
router.get('/recent', invoiceController.getRecentInvoices);
router.get('/customer/:customerId', invoiceController.getCustomerInvoices);
router.get('/company/:companyId', invoiceController.getCompanyInvoices);

// Nuevo endpoint para facturas de un vendedor
router.get('/vendor/:vendorId', invoiceController.getVendorInvoices);

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
