import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';

const router = Router();
const customerController = new CustomerController();

// Rutas para clientes
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
