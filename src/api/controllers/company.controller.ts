import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Company } from '../../models/Company';

export class CompanyController {
  /**
   * Obtener todas las empresas
   */
  public getAllCompanies = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const companyRepository = AppDataSource.getRepository(Company);
      const companies = await companyRepository.find();

      return res.status(200).json({
        success: true,
        data: companies
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener empresas',
        error: error.message
      });
    }
  };

  /**
   * Obtener una empresa por su ID
   */
  public getCompanyById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const companyRepository = AppDataSource.getRepository(Company);
      const company = await companyRepository.findOne({ where: { id } });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        data: company
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener la empresa',
        error: error.message
      });
    }
  };

  /**
   * Crear una nueva empresa
   */
  public createCompany = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        name,
        nit,
        address,
        phone,
        email,
        legalRepresentative,
        legalRepresentativeId,
        city,
        department,
        isAuthorized
      } = req.body;
      
      // Validar datos
      if (!name || !nit) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y NIT son obligatorios'
        });
      }

      const companyRepository = AppDataSource.getRepository(Company);
      
      // Verificar si el NIT ya existe
      const existingCompany = await companyRepository.findOne({ where: { nit } });
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'El NIT ya está registrado'
        });
      }

      // Crear la empresa
      const company = new Company();
      company.name = name;
      company.nit = nit;
      company.address = address;
      company.phone = phone;
      company.email = email;
      company.legalRepresentative = legalRepresentative;
      company.legalRepresentativeId = legalRepresentativeId;
      company.city = city;
      company.department = department;
      company.isAuthorized = isAuthorized || false;

      await companyRepository.save(company);

      return res.status(201).json({
        success: true,
        message: 'Empresa creada exitosamente',
        data: company
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear la empresa',
        error: error.message
      });
    }
  };

  /**
   * Actualizar una empresa existente
   */
  public updateCompany = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const {
        name,
        nit,
        address,
        phone,
        email,
        legalRepresentative,
        legalRepresentativeId,
        city,
        department,
        isAuthorized
      } = req.body;
      
      const companyRepository = AppDataSource.getRepository(Company);
      const company = await companyRepository.findOne({ where: { id } });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      // Actualizar campos
      if (name) company.name = name;
      if (nit) company.nit = nit;
      if (address) company.address = address;
      if (phone) company.phone = phone;
      if (email) company.email = email;
      if (legalRepresentative) company.legalRepresentative = legalRepresentative;
      if (legalRepresentativeId) company.legalRepresentativeId = legalRepresentativeId;
      if (city) company.city = city;
      if (department) company.department = department;
      if (isAuthorized !== undefined) company.isAuthorized = isAuthorized;

      await companyRepository.save(company);

      return res.status(200).json({
        success: true,
        message: 'Empresa actualizada exitosamente',
        data: company
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la empresa',
        error: error.message
      });
    }
  };

  /**
   * Eliminar una empresa
   */
  public deleteCompany = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const companyRepository = AppDataSource.getRepository(Company);
      
      const company = await companyRepository.findOne({ where: { id } });
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      await companyRepository.remove(company);

      return res.status(200).json({
        success: true,
        message: 'Empresa eliminada exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar la empresa',
        error: error.message
      });
    }
  };
}
