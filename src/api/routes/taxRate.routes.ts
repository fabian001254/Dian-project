import { Router } from 'express';
import { TaxRateController } from '../controllers';

const router = Router();
const taxRateController = new TaxRateController();

// Rutas para tasas de impuestos
router.get('/', taxRateController.getAllTaxRates);
router.get('/:id', taxRateController.getTaxRateById);
router.post('/', taxRateController.createTaxRate);
router.put('/:id', taxRateController.updateTaxRate);
router.delete('/:id', taxRateController.deleteTaxRate);

export default router;
