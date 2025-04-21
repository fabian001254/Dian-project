import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';

const router = Router();
const invoiceController = new InvoiceController();

// Rutas para facturas
// Obtener todas las facturas de la empresa autenticada
router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);

// Rutas para obtener facturas (deben ir antes de /:id para evitar conflictos)
router.get('/recent', invoiceController.getRecentInvoices);
router.get('/customer/:customerId', invoiceController.getCustomerInvoices);
router.get('/company/:companyId', invoiceController.getCompanyInvoices);

// Otras rutas
router.get('/:id', invoiceController.getInvoice);
// Descargar PDF o XML
router.get('/:id/download/:format', (req, res) => invoiceController.downloadInvoice(req, res));
router.post('/:id/send-to-dian', invoiceController.sendInvoiceToDian);
router.post('/:id/send-by-email', invoiceController.sendInvoiceByEmail);

export default router;
