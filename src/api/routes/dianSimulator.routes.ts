import { Router } from 'express';
import { DianSimulatorController } from '../controllers/dianSimulator.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const dianSimulatorController = new DianSimulatorController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para el simulador DIAN
router.post('/validate-xml', dianSimulatorController.validateXml);
router.post('/send-invoice', dianSimulatorController.sendInvoice);
router.get('/logs/:trackId', dianSimulatorController.getProcessLogs);
router.get('/status/:trackId', dianSimulatorController.getProcessStatus);

export default router;
