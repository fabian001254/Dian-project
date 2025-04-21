import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { CertificateStatus } from '../models/Certificate';

/**
 * Simulador de certificados digitales para facturación electrónica
 * Este simulador permite generar y gestionar certificados digitales simulados
 * para firmar facturas electrónicas sin valor legal (solo educativo).
 */
export class CertificateSimulator {
  private static instance: CertificateSimulator;

  private constructor() {}

  /**
   * Obtiene la instancia del simulador (Singleton)
   */
  public static getInstance(): CertificateSimulator {
    if (!CertificateSimulator.instance) {
      CertificateSimulator.instance = new CertificateSimulator();
    }
    return CertificateSimulator.instance;
  }

  /**
   * Genera un nuevo par de claves (pública y privada)
   */
  public generateKeyPair(): { publicKey: string; privateKey: string } {
    // Generar un par de claves RSA
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  /**
   * Genera un certificado digital simulado
   * @param companyName Nombre de la empresa
   * @param nit NIT de la empresa
   */
  public generateCertificate(companyName: string, nit: string): any {
    // Generar par de claves
    const { publicKey, privateKey } = this.generateKeyPair();
    
    // Fecha actual
    const issueDate = new Date();
    
    // Fecha de expiración (1 año)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    // Generar número de serie único
    const serialNumber = this.generateSerialNumber();
    
    // Crear certificado simulado, incluyendo NIT
    const certificate = {
      name: `Certificado Digital ${companyName} (NIT ${nit})`,
      publicKey,
      privateKey,
      issueDate,
      expiryDate,
      serialNumber,
      issuer: 'Autoridad Certificadora Simulada (Educativa)',
      status: CertificateStatus.ACTIVE,
      isDefault: true
    };
    
    return certificate;
  }

  /**
   * Firma un documento XML con la clave privada del certificado
   * @param xmlContent Contenido XML a firmar
   * @param privateKey Clave privada del certificado
   */
  public signXML(xmlContent: string, privateKey: string): string {
    // Crear firma digital
    const sign = crypto.createSign('SHA256');
    sign.update(xmlContent);
    sign.end();
    
    // Firmar el documento
    const signature = sign.sign(privateKey, 'base64');
    
    // En un sistema real, la firma se incorporaría al XML según el estándar XAdES
    // Para este simulador educativo, simplemente añadimos la firma como un nodo
    const signedXml = xmlContent.replace('</fe:Invoice>', `<fe:Signature>${signature}</fe:Signature></fe:Invoice>`);
    
    return signedXml;
  }

  /**
   * Verifica la firma de un documento XML
   * @param signedXml XML firmado
   * @param publicKey Clave pública del certificado
   */
  public verifySignature(signedXml: string, publicKey: string): boolean {
    try {
      // Extraer la firma (en un sistema real esto sería más complejo)
      const signatureMatch = signedXml.match(/<fe:Signature>(.*?)<\/fe:Signature>/);
      if (!signatureMatch) return false;
      
      const signature = signatureMatch[1];
      const xmlContent = signedXml.replace(/<fe:Signature>.*?<\/fe:Signature>/, '');
      
      // Verificar firma
      const verify = crypto.createVerify('SHA256');
      verify.update(xmlContent);
      verify.end();
      
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      console.error('Error al verificar firma:', error);
      return false;
    }
  }

  /**
   * Genera un número de serie único para el certificado
   */
  private generateSerialNumber(): string {
    // Generar un UUID y convertirlo a formato hexadecimal sin guiones
    return uuidv4().replace(/-/g, '').toUpperCase();
  }
}
