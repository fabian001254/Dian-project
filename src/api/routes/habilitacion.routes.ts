import { Router } from 'express';
import { HabilitacionController } from '../controllers/habilitacion.controller';
import { authMiddleware, roleMiddleware } from '../../middleware/auth.middleware';
import { UserRole } from '../../models/User';

const router = Router();
const habilitacionController = new HabilitacionController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para el proceso de habilitación
router.post('/empresa/:companyId/registro', 
  roleMiddleware([UserRole.ADMIN]), 
  habilitacionController.registrarFacturadorElectronico);

router.post('/empresa/:companyId/resolucion', 
  roleMiddleware([UserRole.ADMIN]), 
  habilitacionController.solicitarResolucionFacturacion);

router.post('/empresa/:companyId/certificado', 
  roleMiddleware([UserRole.ADMIN]), 
  habilitacionController.generarCertificadoDigital);

router.post('/empresa/:companyId/test', 
  roleMiddleware([UserRole.ADMIN]), 
  habilitacionController.realizarTestHabilitacion);

router.get('/empresa/:companyId/estado', 
  habilitacionController.obtenerEstadoHabilitacion);

export default router;
