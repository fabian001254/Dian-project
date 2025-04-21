import { Request, Response } from 'express';
const bcrypt = require('bcryptjs');
import { User, UserRole } from '../../models/User';
import { Company } from '../../models/Company';
import { AppDataSource } from '../../config/database';

/**
 * Controlador para la configuración inicial del sistema
 */
export class SetupController {
  /**
   * Crea un usuario administrador inicial
   * @param req Request
   * @param res Response
   */
  public createInitialAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { firstName, lastName, email, password, role } = req.body;
      
      // Validar datos mínimos
      if (!firstName || !lastName || !email || !password) {
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
      
      // Encriptar la contraseña
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      
      // Crear el usuario administrador (o rol especificado) sin compañía asociada
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = hashedPassword;
      user.role = role || UserRole.ADMIN;
      
      // Guardar el usuario
      await userRepository.save(user);
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error al crear usuario administrador inicial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el usuario administrador',
        error: error.message
      });
    }
  };

  /**
   * Crea una empresa
   * @param req Request
   * @param res Response
   */
  public createCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        nit,
        dv,
        address,
        city,
        department,
        phone,
        email,
        website,
        economicActivity,
        taxRegime
      } = req.body;
      
      // Validar datos mínimos
      if (!name || !nit) {
        res.status(400).json({
          success: false,
          message: 'Nombre y NIT son obligatorios'
        });
        return;
      }
      
      // Verificar si ya existe una empresa con el mismo NIT
      const companyRepository = AppDataSource.getRepository(Company);
      const existingCompany = await companyRepository
        .createQueryBuilder('company')
        .where('company.nit = :nit', { nit })
        .getOne();
      
      if (existingCompany) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una empresa con este NIT'
        });
        return;
      }
      
      // Crear la empresa
      const company = new Company();
      company.name = name;
      company.nit = nit;
      company.dv = dv;
      company.address = address;
      company.city = city;
      company.department = department;
      company.phone = phone;
      company.email = email;
      company.website = website;
      company.economicActivity = economicActivity;
      company.taxRegime = taxRegime;
      
      // Guardar la empresa
      await companyRepository.save(company);
      
      res.status(201).json({
        success: true,
        message: 'Empresa creada exitosamente',
        data: company
      });
    } catch (error) {
      console.error('Error al crear empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la empresa',
        error: error.message
      });
    }
  };

  /**
   * Asigna un usuario a una empresa
   * @param req Request
   * @param res Response
   */
  public assignUserToCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, companyId } = req.body;
      
      // Validar datos mínimos
      if (!userId || !companyId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario y ID de empresa son obligatorios'
        });
        return;
      }
      
      // Verificar que el usuario existe
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
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
      
      // Asignar la empresa al usuario
      user.companyId = companyId;
      await userRepository.save(user);
      
      res.status(200).json({
        success: true,
        message: 'Usuario asignado a la empresa exitosamente',
        data: {
          userId: user.id,
          companyId: company.id
        }
      });
    } catch (error) {
      console.error('Error al asignar usuario a empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error al asignar usuario a empresa',
        error: error.message
      });
    }
  };
}
