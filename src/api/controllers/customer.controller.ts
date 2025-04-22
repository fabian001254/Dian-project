import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Customer } from '../../models/Customer';
import bcrypt from 'bcryptjs';

export class CustomerController {
  /**
   * Obtener todos los clientes
   */
  public getAllCustomers = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const customerRepository = AppDataSource.getRepository(Customer);
      
      // Obtener todos los clientes
      const customers = await customerRepository.find();

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
        password
      } = req.body;
      
      // Validar datos
      if (!name || !documentType || !documentNumber || !password) {
        return res.status(400).json({
          success: false,
          message: 'El nombre, tipo de documento, número de documento y contraseña son obligatorios'
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
      customer.password = await bcrypt.hash(password, 10);

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
