import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
const bcrypt = require('bcryptjs');
import { User } from '../../models/User';

export class UserController {
  /**
   * Obtener todos los usuarios
   */
  public getAllUsers = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find({
        select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'lastLogin', 'createdAt', 'updatedAt'],
        relations: ['company']
      });

      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios',
        error: error.message
      });
    }
  };

  /**
   * Obtener un usuario por su ID
   */
  public getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id },
        select: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'lastLogin', 'createdAt', 'updatedAt'],
        relations: ['company']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el usuario',
        error: error.message
      });
    }
  };

  /**
   * Crear un nuevo usuario
   */
  public createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { firstName, lastName, email, password, role, companyId } = req.body;
      
      // Validar datos
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios'
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      
      // Verificar si el email ya existe
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      // Crear el usuario
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      // Hash de contraseña
      user.password = bcrypt.hashSync(password, bcrypt.genSaltSync());
      user.role = role || 'viewer';
      user.companyId = companyId;
      user.isActive = true;

      await userRepository.save(user);

      // Eliminar la contraseña de la respuesta
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: userWithoutPassword
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear el usuario',
        error: error.message
      });
    }
  };

  /**
   * Obtener todos los usuarios por rol (e.g., vendors)
   */
  public getUsersByRole = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { role } = req.query;
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find({
        where: { role: role as string },
        select: ['id', 'firstName', 'lastName', 'email', 'role']
      });
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener usuarios por rol', error: error.message });
    }
  };

  /**
   * Actualizar un usuario existente
   */
  public updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role, isActive, password } = req.body;
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Actualizar campos
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      if (password) {
        user.password = bcrypt.hashSync(password, bcrypt.genSaltSync());
      }

      await userRepository.save(user);

      // Eliminar la contraseña de la respuesta
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: userWithoutPassword
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el usuario',
        error: error.message
      });
    }
  };

  /**
   * Eliminar un usuario
   */
  public deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);
      
      const user = await userRepository.findOne({ where: { id } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      await userRepository.remove(user);

      return res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el usuario',
        error: error.message
      });
    }
  };
}
