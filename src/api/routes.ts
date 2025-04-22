import { Router } from 'express';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import invoiceRoutes from './routes/invoice.routes';
import taxRateRoutes from './routes/taxRate.routes';
import certificateRoutes from './routes/certificate.routes';
import dianSimulatorRoutes from './routes/dianSimulator.routes';
import setupRoutes from './routes/setup.routes';
import dashboardRoutes from './routes/dashboard.routes';
import vendorRoutes from './routes/vendor.routes';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.use('/auth', authRoutes);
router.use('/setup', setupRoutes);

// Protected routes
router.use('/users', authMiddleware, userRoutes);
router.use('/companies', authMiddleware, companyRoutes);
router.use('/customers', authMiddleware, customerRoutes);
router.use('/products', authMiddleware, productRoutes);
// Habilitar authMiddleware en facturas para que req.user esté disponible
router.use('/invoices', authMiddleware, invoiceRoutes);
router.use('/tax-rates', authMiddleware, taxRateRoutes);
router.use('/certificates', authMiddleware, certificateRoutes);
router.use('/dian-simulator', authMiddleware, dianSimulatorRoutes);
router.use('/vendors', authMiddleware, vendorRoutes);
router.use('/dashboard', authMiddleware, dashboardRoutes);

export default router;
