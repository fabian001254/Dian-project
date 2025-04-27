import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Rutas públicas
// Se eliminó la ruta de registro público para que solo los administradores puedan crear usuarios
router.post('/login', authController.login);

// Rutas protegidas
router.get('/profile', authMiddleware, authController.getProfile);

// Ruta para registro de usuarios (solo administradores)
router.post('/admin/register', authMiddleware, authController.register);

export default router;
