import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Vendor } from '../../models/Vendor';
import { User, UserRole } from '../../models/User';
import { IdentificationType as CustIdType } from '../../models/Customer';
import bcrypt from 'bcryptjs';

export class VendorController {
  public getAllVendors = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const repo = AppDataSource.getRepository(Vendor);
      const vendors = await repo.find({ relations: ['user'] });
      return res.status(200).json({ success: true, data: vendors });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener vendedores', error: error.message });
    }
  };

  public getVendorById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Vendor);
      const vendor = await repo.findOne({ where: { id }, relations: ['user'] });
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
      }
      return res.status(200).json({ success: true, data: vendor });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener vendedor', error: error.message });
    }
  };

  /**
   * Obtener un vendedor por su userId
   * Este método es útil para encontrar el vendedor asociado a un usuario con rol de vendedor
   */
  public getVendorByUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ success: false, message: 'El parámetro userId es requerido' });
      }
      
      console.log(`Buscando vendedor con userId: ${userId}`);
      
      const repo = AppDataSource.getRepository(Vendor);
      const vendor = await repo.findOne({ where: { userId: userId as string } });
      
      if (!vendor) {
        console.log(`No se encontró vendedor con userId: ${userId}`);
        return res.status(404).json({ success: false, message: 'Vendedor no encontrado para este usuario' });
      }
      
      console.log(`Vendedor encontrado: ${vendor.id} (nombre: ${vendor.name})`);
      return res.status(200).json({ success: true, data: vendor });
    } catch (error) {
      console.error('Error al obtener vendedor por userId:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener vendedor por userId', error: error.message });
    }
  };

  public createVendor = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const vendorRepo = AppDataSource.getRepository(Vendor);
      const {
        firstName,
        lastName,
        email,
        password,
        identificationType,
        identificationNumber,
        address,
        city,
        department,
        phone,
        companyId
      } = req.body;
      console.log('[createVendor] payload:', req.body);
      // Validación básica
      if (!firstName || !lastName || !email || !password || !identificationType || !identificationNumber || !companyId) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios de usuario o vendor' });
      }
      // Crear usuario vendor
      const newUser = new User();
      newUser.firstName = firstName;
      newUser.lastName = lastName;
      newUser.email = email;
      newUser.password = await bcrypt.hash(password, 10);
      newUser.role = UserRole.VENDOR;
      newUser.companyId = companyId;
      // Mapear tipo de documento ('CC','NIT',etc) a valor de enum (etiqueta) usado en BD
      newUser.identificationType = CustIdType[identificationType as keyof typeof CustIdType];
      newUser.identificationNumber = identificationNumber;
      const savedUser = await userRepo.save(newUser);
      // Crear registro en vendors
      const newVendor = new Vendor();
      newVendor.userId = savedUser.id;
      newVendor.companyId = companyId;
      newVendor.name = `${firstName} ${lastName}`;
      newVendor.address = address || '';
      newVendor.city = city || '';
      newVendor.department = department || '';
      newVendor.phone = phone || '';
      newVendor.email = email;
      const savedVendor = await vendorRepo.save(newVendor);
      return res.status(201).json({ success: true, message: 'Vendedor creado', data: { user: savedUser, vendor: savedVendor } });
    } catch (error) {
      // Log completo para depuración
      console.error('[createVendor] Error:', error.stack || error);
      // Manejar email duplicado (PostgreSQL 23505)
      if ((error as any).code === '23505') {
        return res.status(400).json({ success: false, message: 'El email ya está registrado' });
      }
      return res.status(500).json({ success: false, message: 'Error al crear vendedor', error: error.message });
    }
  };

  public updateVendor = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Vendor);
      let vendor = await repo.findOne({ where: { id }, relations: ['user'] });
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
      }
      repo.merge(vendor, req.body);
      const result = await repo.save(vendor);
      return res.status(200).json({ success: true, message: 'Vendedor actualizado', data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al actualizar vendedor', error: error.message });
    }
  };

  public deleteVendor = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Vendor);
      const vendor = await repo.findOne({ where: { id } });
      if (!vendor) {
        return res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
      }
      await repo.remove(vendor);
      return res.status(200).json({ success: true, message: 'Vendedor eliminado' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al eliminar vendedor', error: error.message });
    }
  };
}
