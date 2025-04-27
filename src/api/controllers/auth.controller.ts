import { Request, Response } from 'express';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import { User, UserRole } from '../../models/User';
import { Company } from '../../models/Company';
import { AppDataSource } from '../../config/database';

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Controlador para la autenticación de usuarios
 */
export class AuthController {
  /**
   * Registra un nuevo usuario
   * @param req Request
   * @param res Response
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Verificar si el usuario es administrador
      const currentUser = req.user;
      
      // Si la ruta es protegida y requiere autenticación, verificar que sea administrador
      if (currentUser && currentUser.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden registrar nuevos usuarios'
        });
        return;
      }
      
      const { firstName, lastName, email, password, companyId, role } = req.body;
      
      // Validar datos mínimos
      if (!firstName || !lastName || !email || !password || !companyId) {
        res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios'
        });
        return;
      }
      
      // Verificar si el correo ya está registrado
      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .getOne();
      
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
        return;
      }
      
      // Verificar que la empresa existe
      const companyRepository = AppDataSource.getRepository(Company);
      const company = await companyRepository.findOne({ where: { id: companyId } });
      
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
        return;
      }
      
      // Encriptar la contraseña usando bcrypt con require
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      
      // Crear el usuario
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = hashedPassword;
      user.companyId = companyId;
      user.role = role || UserRole.VIEWER; // Por defecto, rol de visualizador
      
      // Guardar el usuario
      await userRepository.save(user);
      
      // Generar token JWT
      const token = this.generateToken(user);
      
      // Responder con el usuario creado (sin la contraseña)
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar el usuario',
        error: error.message
      });
    }
  };

  /**
   * Inicia sesión de un usuario
   * @param req Request
   * @param res Response
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      // Validar datos mínimos
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Correo y contraseña son obligatorios'
        });
        return;
      }
      
      // Buscar el usuario por correo
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository
        .createQueryBuilder('user')
        .addSelect('user.password') // Incluir el campo password que está excluido por defecto
        .leftJoinAndSelect('user.company', 'company')
        .where('user.email = :email', { email })
        .getOne();
      console.log('[Auth] login: retrieved user for email', email, '=>', user);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }
      
      // Verificar si el usuario está activo
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Usuario inactivo. Contacte al administrador'
        });
        return;
      }
      
      // Verificar la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('[Auth] login: password compare result =>', isPasswordValid);
      
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
        return;
      }
      
      // Actualizar fecha de último inicio de sesión
      user.lastLogin = new Date();
      await userRepository.save(user);
      
      // Generar token JWT
      const token = this.generateToken(user);
      
      // Responder con el usuario (sin la contraseña)
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  };

  /**
   * Obtiene el perfil del usuario autenticado
   * @param req Request
   * @param res Response
   */
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // El usuario ya está disponible gracias al middleware de autenticación
      const user = req.user;
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el perfil',
        error: error.message
      });
    }
  };

  /**
   * Genera un token JWT para un usuario
   * @param user Usuario
   */
  private generateToken(user: User): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
    const options = { expiresIn: process.env.JWT_EXPIRES_IN || '1d' };
    
    return jwt.sign(payload, secret, options);
  }
}
