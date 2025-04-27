import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Customer } from '../../models/Customer';
import { User } from '../../models/User';
import { UserRole } from '../../models/User';
import bcrypt from 'bcryptjs';

export class CustomerController {
  /**
   * Obtener todos los clientes
   */
  public getAllCustomers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const customerRepository = AppDataSource.getRepository(Customer);
      const { vendorId } = req.query;
      const currentUser = req.user as User;
      
      // Construir la consulta base
      let queryBuilder = customerRepository.createQueryBuilder('customer');
      
      // Si el usuario es un vendedor, solo mostrar sus clientes
      if (currentUser && currentUser.role === UserRole.VENDOR) {
        console.log(`Filtrando clientes para el vendedor: ${currentUser.id}`);
        queryBuilder = queryBuilder.where('customer.vendorId = :vendorId', { vendorId: currentUser.id });
      }
      // Si se proporciona un vendorId específico en la consulta
      else if (vendorId) {
        console.log(`Filtrando clientes para el vendedor especificado: ${vendorId}`);
        queryBuilder = queryBuilder.where('customer.vendorId = :vendorId', { vendorId });
      }
      
      // Ejecutar la consulta
      const customers = await queryBuilder.getMany();

      return res.status(200).json({
        success: true,
        data: customers
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener clientes',
        error: error.message
      });
    }
  };

  /**
   * Obtener un cliente por su ID
   */
  public getCustomerById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const customerRepository = AppDataSource.getRepository(Customer);
      const customer = await customerRepository.findOne({ where: { id } });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el cliente',
        error: error.message
      });
    }
  };

  /**
   * Crear un nuevo cliente
   */
  public createCustomer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        name,
        businessName,
        documentType,
        documentNumber,
        dv,
        address,
        phone,
        email,
        city,
        department,
        password,
        vendorId
      } = req.body;
      
      const currentUser = req.user as User;
      
      // Validar datos
      if (!name || !documentType || !documentNumber) {
        return res.status(400).json({
          success: false,
          message: 'El nombre, tipo de documento y número de documento son obligatorios'
        });
      }

      const customerRepository = AppDataSource.getRepository(Customer);
      
      // Verificar si el cliente ya existe con el mismo documento
      const existingCustomer = await customerRepository.findOne({ 
        where: { identificationNumber: documentNumber } 
      });
      
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con este número de documento'
        });
      }

      // Crear el cliente
      const customer = new Customer();
      customer.name = name;
      customer.businessName = businessName;
      customer.dv = dv;
      customer.identificationType = documentType;
      customer.identificationNumber = documentNumber;
      customer.address = address;
      customer.phone = phone;
      customer.email = email;
      customer.city = city;
      customer.department = department;
      
      // Si se proporciona una contraseña, la ciframos, sino usamos una por defecto
      if (password) {
        customer.password = await bcrypt.hash(password, 10);
      } else {
        // Contraseña por defecto para clientes que no inician sesión
        customer.password = await bcrypt.hash('Cliente123', 10);
      }
      
      // Si el usuario actual es un vendedor, asignar automáticamente
      if (currentUser && currentUser.role === UserRole.VENDOR) {
        customer.vendorId = currentUser.id;
        console.log(`Cliente asignado automáticamente al vendedor: ${currentUser.id}`);
      } 
      // Si se proporciona un vendorId específico y el usuario no es vendedor
      else if (vendorId) {
        customer.vendorId = vendorId;
        console.log(`Cliente asignado al vendedor especificado: ${vendorId}`);
      }

      await customerRepository.save(customer);

      return res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: customer
      });
    } catch (error) {
      console.error('Error detallado al crear cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear el cliente',
        error: error.message,
        stack: error.stack,
        details: JSON.stringify(error)
      });
    }
  };

  /**
   * Actualizar un cliente existente
   */
  public updateCustomer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const {
        name,
        documentType,
        documentNumber,
        address,
        phone,
        email,
        city,
        department
      } = req.body;
      
      const customerRepository = AppDataSource.getRepository(Customer);
      const customer = await customerRepository.findOne({ where: { id } });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      // Actualizar campos
      if (name) customer.name = name;
      if (documentType) customer.identificationType = documentType;
      if (documentNumber) customer.identificationNumber = documentNumber;
      if (address) customer.address = address;
      if (phone) customer.phone = phone;
      if (email) customer.email = email;
      if (city) customer.city = city;
      if (department) customer.department = department;
      
      console.log('Cliente actualizado:', {
        id: customer.id,
        name: customer.name,
        identificationType: customer.identificationType,
        identificationNumber: customer.identificationNumber
      });

      await customerRepository.save(customer);

      return res.status(200).json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: customer
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el cliente',
        error: error.message
      });
    }
  };

  /**
   * Eliminar un cliente
   */
  public deleteCustomer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const customerRepository = AppDataSource.getRepository(Customer);
      
      const customer = await customerRepository.findOne({ where: { id } });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      await customerRepository.remove(customer);

      return res.status(200).json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el cliente',
        error: error.message
      });
    }
  };
}
