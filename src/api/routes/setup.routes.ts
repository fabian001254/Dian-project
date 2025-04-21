import { Router } from 'express';
import { SetupController } from '../controllers/setup.controller';

const router = Router();
const setupController = new SetupController();

// Rutas públicas para la configuración inicial
router.post('/create-admin', setupController.createInitialAdmin);
router.post('/create-company', setupController.createCompany);
router.post('/assign-user-to-company', setupController.assignUserToCompany);

export default router;
