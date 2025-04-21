import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

/**
 * Interfaz para extender Request con el usuario autenticado
 */
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware para verificar la autenticación mediante JWT
 */
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Se requiere token de autenticación'
      });
      return;
    }
    
    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here') as JwtPayload;
    const userId = decoded.id as string;
    
    // Buscar el usuario en la base de datos
    const user = await AppDataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company')
      .where('user.id = :id', { id: userId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getOne();
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
      return;
    }
    
    // Añadir el usuario al request
    req.user = user;
    
    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor, inicie sesión nuevamente'
      });
      return;
    }
    
    res.status(401).json({
      success: false,
      message: 'Token inválido. Por favor, inicie sesión nuevamente'
    });
  }
};

/**
 * Middleware para verificar roles de usuario
 * @param roles Roles permitidos
 */
export const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Se requiere autenticación'
      });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acceso prohibido. No tiene los permisos necesarios'
      });
      return;
    }
    
    next();
  };
};
