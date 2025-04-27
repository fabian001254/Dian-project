import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const vendorController = new VendorController();

// Vendor routes
router.get('/', vendorController.getAllVendors);
router.get('/by-user', vendorController.getVendorByUserId); // Nuevo endpoint para buscar por userId
router.get('/:id', vendorController.getVendorById);
router.post('/', authMiddleware, vendorController.createVendor);
router.put('/:id', authMiddleware, vendorController.updateVendor);
router.delete('/:id', authMiddleware, vendorController.deleteVendor);

export default router;
