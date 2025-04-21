import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Certificate } from '../../models/Certificate';

export class CertificateController {
  /**
   * Obtiene todos los certificados
   * @param _req Request
   * @param res Response
   */
  public getAllCertificates = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const certificateRepository = AppDataSource.getRepository(Certificate);
      const certificates = await certificateRepository.find();

      return res.status(200).json({
        success: true,
        data: certificates
      });
    } catch (error) {
      console.error('Error al obtener certificados:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener los certificados',
        error: error.message
      });
    }
  };

  /**
   * Obtiene un certificado por su ID
   * @param req Request
   * @param res Response
   */
  public getCertificateById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const certificateRepository = AppDataSource.getRepository(Certificate);
      const certificate = await certificateRepository.findOne({ where: { id } });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificado no encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: certificate
      });
    } catch (error) {
      console.error('Error al obtener certificado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el certificado',
        error: error.message
      });
    }
  };

  /**
   * Crea un nuevo certificado
   * @param req Request
   * @param res Response
   */
  public createCertificate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { 
        name, 
        serialNumber, 
        issuer, 
        validFrom, 
        validTo, 
        companyId 
      } = req.body;
      
      // Validar datos mínimos
      if (!name || !serialNumber || !issuer || !validFrom || !validTo || !companyId) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios'
        });
      }

      const certificateRepository = AppDataSource.getRepository(Certificate);
      
      // Verificar si ya existe un certificado con el mismo número de serie
      const existingCertificate = await certificateRepository.findOne({ where: { serialNumber } });
      if (existingCertificate) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un certificado con ese número de serie'
        });
      }
      
      // Crear el certificado
      const certificate = new Certificate();
      certificate.name = name;
      certificate.serialNumber = serialNumber;
      certificate.issuer = issuer;
      certificate.validFrom = new Date(validFrom);
      certificate.validTo = new Date(validTo);
      certificate.companyId = companyId;
      
      // Guardar el certificado
      await certificateRepository.save(certificate);
      
      return res.status(201).json({
        success: true,
        message: 'Certificado creado exitosamente',
        data: certificate
      });
    } catch (error) {
      console.error('Error al crear certificado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear el certificado',
        error: error.message
      });
    }
  };

  /**
   * Actualiza un certificado existente
   * @param req Request
   * @param res Response
   */
  public updateCertificate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, serialNumber, issuer, validFrom, validTo } = req.body;
      
      const certificateRepository = AppDataSource.getRepository(Certificate);
      const certificate = await certificateRepository.findOne({ where: { id } });

      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificado no encontrado'
        });
      }

      // Actualizar campos
      if (name) certificate.name = name;
      if (serialNumber) certificate.serialNumber = serialNumber;
      if (issuer) certificate.issuer = issuer;
      if (validFrom) certificate.validFrom = new Date(validFrom);
      if (validTo) certificate.validTo = new Date(validTo);
      
      // Guardar cambios
      await certificateRepository.save(certificate);
      
      return res.status(200).json({
        success: true,
        message: 'Certificado actualizado exitosamente',
        data: certificate
      });
    } catch (error) {
      console.error('Error al actualizar certificado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el certificado',
        error: error.message
      });
    }
  };

  /**
   * Elimina un certificado
   * @param req Request
   * @param res Response
   */
  public deleteCertificate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const certificateRepository = AppDataSource.getRepository(Certificate);
      
      const certificate = await certificateRepository.findOne({ where: { id } });
      if (!certificate) {
        return res.status(404).json({
          success: false,
          message: 'Certificado no encontrado'
        });
      }
      
      await certificateRepository.remove(certificate);
      
      return res.status(200).json({
        success: true,
        message: 'Certificado eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar certificado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el certificado',
        error: error.message
      });
    }
  };

  /**
   * Obtiene certificados por ID de empresa
   */
  public getCertificatesByCompany = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { companyId } = req.params;
      const certificateRepository = AppDataSource.getRepository(Certificate);
      const certificates = await certificateRepository.find({ where: { companyId } });
      return res.status(200).json({ success: true, data: certificates });
    } catch (error) {
      console.error('Error al obtener certificados por empresa:', error);
      return res.status(500).json({ success: false, message: 'Error al obtener certificados de la empresa', error: error.message });
    }
  }
}
