import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Nueva ruta para obtener usuarios por rol
router.get('/role', userController.getUsersByRole);

// Rutas para usuarios
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', authMiddleware, userController.createUser);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

// Ruta para cambiar la contraseña de un usuario (solo administradores)
router.post('/:id/reset-password', authMiddleware, userController.resetPassword);

export default router;
