import { Response } from 'express';
import { getConnection } from 'typeorm';
import { Company } from '../../models/Company';
import { Certificate, CertificateStatus } from '../../models/Certificate';
import { DianHabilitacionSimulator } from '../../simulators/dian.habilitacion.simulator';
import { CertificateSimulator } from '../../simulators/certificate.simulator';
import { AuthRequest } from '../../middleware/auth.middleware';

/**
 * Controlador para el proceso de habilitación como facturador electrónico
 */
export class HabilitacionController {
  private habilitacionSimulator: DianHabilitacionSimulator;
  private certificateSimulator: CertificateSimulator;

  constructor() {
    this.habilitacionSimulator = DianHabilitacionSimulator.getInstance();
    this.certificateSimulator = CertificateSimulator.getInstance();
  }

  /**
   * Registra una empresa como facturador electrónico
   * @param req Request
   * @param res Response
   */
  public registrarFacturadorElectronico = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      
      // Verificar que la empresa existe
      const company = await getConnection()
        .getRepository(Company)
        .findOne(companyId);
      
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
        return;
      }
      
      // Verificar que el usuario tiene acceso a esta empresa
      if (req.user.companyId !== companyId) {
        res.status(403).json({
          success: false,
          message: 'No tiene permisos para realizar esta acción'
        });
        return;
      }
      
      // Verificar que la empresa no esté ya autorizada
      if (company.isAuthorized) {
        res.status(400).json({
          success: false,
          message: 'La empresa ya está registrada como facturador electrónico'
        });
        return;
      }
      
      // Simular el registro
      const registroResponse = await this.habilitacionSimulator.registrarFacturadorElectronico(company);
      
      // Si el registro fue exitoso, actualizar la empresa
      if (registroResponse.success) {
        // No marcamos como autorizada aún, eso ocurre después del test de habilitación
        // Solo actualizamos algunos datos
        company.economicActivity = company.economicActivity || req.body.economicActivity || '6201';
        company.taxRegime = company.taxRegime || req.body.taxRegime || 'Régimen Simple';
        
        await getConnection().manager.save(company);
      }
      
      res.status(200).json({
        success: registroResponse.success,
        message: registroResponse.success 
          ? 'Registro como facturador electrónico exitoso' 
          : 'Error en el registro como facturador electrónico',
        data: registroResponse
      });
    } catch (error) {
      console.error('Error al registrar como facturador electrónico:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar como facturador electrónico',
        error: error.message
      });
    }
  };

  /**
   * Solicita una resolución de facturación
   * @param req Request
   * @param res Response
   */
  public solicitarResolucionFacturacion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      const { prefix, rangeFrom, rangeTo } = req.body;
      
      // Validar datos mínimos
      if (!prefix || !rangeFrom || !rangeTo) {
        res.status(400).json({
          success: false,
          message: 'Debe especificar prefijo y rango de numeración'
        });
        return;
      }
      
      // Verificar que la empresa existe
      const company = await getConnection()
        .getRepository(Company)
        .findOne(companyId);
      
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
        return;
      }
      
      // Verificar que el usuario tiene acceso a esta empresa
      if (req.user.companyId !== companyId) {
        res.status(403).json({
          success: false,
          message: 'No tiene permisos para realizar esta acción'
        });
        return;
      }
      
      // Verificar que la empresa no tenga ya una resolución
      if (company.authorizationNumber) {
        res.status(400).json({
          success: false,
          message: 'La empresa ya tiene una resolución de facturación'
        });
        return;
      }
      
      // Simular la solicitud de resolución
      const resolucionResponse = await this.habilitacionSimulator.solicitarResolucionFacturacion(company, {
        prefix,
        rangeFrom,
        rangeTo
      });
      
      // Si la solicitud fue exitosa, actualizar la empresa
      if (resolucionResponse.success) {
        company.authorizationNumber = resolucionResponse.resolutionData.resolutionNumber;
        company.authorizationDate = new Date(resolucionResponse.resolutionData.issueDate);
        company.authorizationPrefix = resolucionResponse.resolutionData.prefix;
        company.authorizationRangeFrom = resolucionResponse.resolutionData.rangeFrom;
        company.authorizationRangeTo = resolucionResponse.resolutionData.rangeTo;
        
        await getConnection().manager.save(company);
      }
      
      res.status(200).json({
        success: resolucionResponse.success,
        message: resolucionResponse.success 
          ? 'Resolución de facturación obtenida exitosamente' 
          : 'Error al solicitar resolución de facturación',
        data: resolucionResponse
      });
    } catch (error) {
      console.error('Error al solicitar resolución de facturación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al solicitar resolución de facturación',
        error: error.message
      });
    }
  };

  /**
   * Genera un certificado digital para la empresa
   * @param req Request
   * @param res Response
   */
  public generarCertificadoDigital = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      
      // Verificar que la empresa existe
      const company = await getConnection()
        .getRepository(Company)
        .findOne(companyId);
      
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
        return;
      }
      
      // Verificar que el usuario tiene acceso a esta empresa
      if (req.user.companyId !== companyId) {
        res.status(403).json({
          success: false,
          message: 'No tiene permisos para realizar esta acción'
        });
        return;
      }
      
      // Generar certificado digital simulado
      const certificadoData = this.certificateSimulator.generateCertificate(company.name, company.nit);
      
      // Guardar certificado en la base de datos
      const certificate = new Certificate();
      certificate.name = certificadoData.name;
      certificate.publicKey = certificadoData.publicKey;
      certificate.privateKey = certificadoData.privateKey;
      certificate.issueDate = certificadoData.issueDate;
      certificate.expiryDate = certificadoData.expiryDate;
      certificate.serialNumber = certificadoData.serialNumber;
      certificate.issuer = certificadoData.issuer;
      certificate.status = certificadoData.status;
      certificate.isDefault = certificadoData.isDefault;
      certificate.companyId = companyId;
      
      await getConnection().manager.save(certificate);
      
      // Ocultar la clave privada en la respuesta
      const { privateKey, ...certificadoPublico } = certificate;
      
      res.status(201).json({
        success: true,
        message: 'Certificado digital generado exitosamente',
        data: certificadoPublico
      });
    } catch (error) {
      console.error('Error al generar certificado digital:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar certificado digital',
        error: error.message
      });
    }
  };

  /**
   * Realiza el test de habilitación
   * @param req Request
   * @param res Response
   */
  public realizarTestHabilitacion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      const { certificateId, testInvoiceXml } = req.body;
      
      // Validar datos mínimos
      if (!certificateId) {
        res.status(400).json({
          success: false,
          message: 'Debe especificar un certificado digital'
        });
        return;
      }
      
      // Verificar que la empresa existe
      const company = await getConnection()
        .getRepository(Company)
        .findOne(companyId);
      
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
        return;
      }
      
      // Verificar que el usuario tiene acceso a esta empresa
      if (req.user.companyId !== companyId) {
        res.status(403).json({
          success: false,
          message: 'No tiene permisos para realizar esta acción'
        });
        return;
      }
      
      // Verificar que la empresa tiene resolución
      if (!company.authorizationNumber) {
        res.status(400).json({
          success: false,
          message: 'La empresa debe tener una resolución de facturación antes de realizar el test'
        });
        return;
      }
      
      // Verificar que el certificado existe y pertenece a la empresa
      const certificate = await getConnection()
        .getRepository(Certificate)
        .findOne({
          where: {
            id: certificateId,
            companyId: companyId,
            status: CertificateStatus.ACTIVE
          }
        });
      
      if (!certificate) {
        res.status(404).json({
          success: false,
          message: 'Certificado digital no encontrado o no válido'
        });
        return;
      }
      
      // Simular el test de habilitación
      const testResponse = await this.habilitacionSimulator.realizarTestHabilitacion(company, {
        certificateId,
        testInvoiceXml: testInvoiceXml || '<fe:Invoice>...</fe:Invoice>' // XML de prueba si no se proporciona
      });
      
      // Si el test fue exitoso, marcar la empresa como autorizada
      if (testResponse.success) {
        company.isAuthorized = true;
        await getConnection().manager.save(company);
      }
      
      res.status(200).json({
        success: testResponse.success,
        message: testResponse.success 
          ? 'Test de habilitación exitoso. Empresa habilitada como facturador electrónico' 
          : 'Error en el test de habilitación',
        data: testResponse
      });
    } catch (error) {
      console.error('Error al realizar test de habilitación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al realizar test de habilitación',
        error: error.message
      });
    }
  };

  /**
   * Obtiene el estado de habilitación de una empresa
   * @param req Request
   * @param res Response
   */
  public obtenerEstadoHabilitacion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { companyId } = req.params;
      
      // Verificar que la empresa existe
      const company = await getConnection()
        .getRepository(Company)
        .findOne(companyId);
      
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
        return;
      }
      
      // Verificar que el usuario tiene acceso a esta empresa
      if (req.user.companyId !== companyId) {
        res.status(403).json({
          success: false,
          message: 'No tiene permisos para realizar esta acción'
        });
        return;
      }
      
      // Obtener certificados de la empresa
      const certificates = await getConnection()
        .getRepository(Certificate)
        .find({
          where: { companyId: companyId },
          order: { isDefault: 'DESC', createdAt: 'DESC' }
        });
      
      // Preparar respuesta con el estado de habilitación
      const estadoHabilitacion = {
        registrado: true, // Siempre true en este simulador educativo
        tieneResolucion: !!company.authorizationNumber,
        tieneCertificado: certificates.length > 0,
        habilitado: company.isAuthorized,
        resolucion: company.authorizationNumber ? {
          numero: company.authorizationNumber,
          fecha: company.authorizationDate,
          prefijo: company.authorizationPrefix,
          rangoDesde: company.authorizationRangeFrom,
          rangoHasta: company.authorizationRangeTo
        } : null,
        certificados: certificates.map((cert: Certificate) => ({
          id: cert.id,
          nombre: cert.name,
          fechaEmision: cert.issueDate,
          fechaExpiracion: cert.expiryDate,
          numeroSerie: cert.serialNumber,
          emisor: cert.issuer,
          estado: cert.status,
          esPredeterminado: cert.isDefault
        }))
      };
      
      res.status(200).json({
        success: true,
        data: estadoHabilitacion
      });
    } catch (error) {
      console.error('Error al obtener estado de habilitación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado de habilitación',
        error: error.message
      });
    }
  };
}
