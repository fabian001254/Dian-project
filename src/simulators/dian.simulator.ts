import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as xml2js from 'xml2js';

/**
 * Simulador de la API de la DIAN para facturación electrónica
 * Este simulador replica el comportamiento de la API real de la DIAN
 * pero sin realizar peticiones reales, todo es simulado internamente.
 */
export class DianSimulator {
  private static instance: DianSimulator;
  private simulationDelay: { min: number; max: number };
  private errorRate: number;

  private constructor() {
    // Configuración de la simulación
    this.simulationDelay = {
      min: Number(process.env.SIMULATION_DELAY_MIN || 1000),
      max: Number(process.env.SIMULATION_DELAY_MAX || 3000)
    };
    this.errorRate = Number(process.env.SIMULATION_ERROR_RATE || 0.05);
  }

  /**
   * Obtiene la instancia del simulador (Singleton)
   */
  public static getInstance(): DianSimulator {
    if (!DianSimulator.instance) {
      DianSimulator.instance = new DianSimulator();
    }
    return DianSimulator.instance;
  }

  /**
   * Simula el envío de una factura electrónica a la DIAN
   * @param xmlContent Contenido XML de la factura
   * @param certificate Certificado digital
   */
  public async sendInvoice(xmlContent: string, certificate: any): Promise<any> {
    // Registrar el inicio de la simulación
    console.log('🔄 Iniciando simulación de envío a DIAN...');
    
    // Generar un retraso aleatorio para simular el tiempo de respuesta
    const delay = this.getRandomDelay();
    console.log(`⏱️ Tiempo estimado de respuesta: ${delay}ms`);
    
    // Simular el proceso de validación
    const logs = await this.simulateValidationProcess(xmlContent, certificate);
    
    // Decidir si la factura será aceptada o rechazada
    const isRejected = Math.random() < this.errorRate;
    
    // Preparar la respuesta
    const response = {
      success: !isRejected,
      trackId: uuidv4(),
      timestamp: new Date().toISOString(),
      logs,
      errors: isRejected ? this.generateRandomErrors() : [],
      cufe: isRejected ? null : this.generateCUFE(xmlContent)
    };
    
    // Simular el retraso de la API
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`✅ Simulación completada. Resultado: ${isRejected ? 'RECHAZADO' : 'APROBADO'}`);
    
    return response;
  }

  /**
   * Genera un CUFE (Código Único de Factura Electrónica)
   * @param xmlContent Contenido XML de la factura
   */
  public generateCUFE(xmlContent: string): string {
    // En un sistema real, el CUFE se genera según el algoritmo definido por la DIAN
    // Para este simulador, generamos un hash SHA-256 del contenido XML
    const hash = crypto.createHash('sha256').update(xmlContent).digest('hex');
    return hash.substring(0, 32).toUpperCase();
  }

  /**
   * Simula el proceso de validación de la factura
   * @param xmlContent Contenido XML de la factura
   * @param certificate Certificado digital
   */
  private async simulateValidationProcess(xmlContent: string, certificate: any): Promise<string[]> {
    const logs: string[] = [];
    
    // Paso 1: Verificar estructura del XML
    logs.push(`[${new Date().toISOString()}] Verificando estructura del documento XML...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      await xml2js.parseStringPromise(xmlContent);
      logs.push(`[${new Date().toISOString()}] ✓ Estructura XML válida según UBL 2.1`);
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] ✗ Error en estructura XML: ${error.message}`);
      return logs;
    }
    
    // Paso 2: Verificar certificado digital
    logs.push(`[${new Date().toISOString()}] Verificando certificado digital...`);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!certificate || !certificate.publicKey) {
      logs.push(`[${new Date().toISOString()}] ✗ Certificado digital inválido o no proporcionado`);
      return logs;
    }
    
    logs.push(`[${new Date().toISOString()}] ✓ Certificado digital válido`);
    
    // Paso 3: Verificar firma digital
    logs.push(`[${new Date().toISOString()}] Verificando firma digital...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`[${new Date().toISOString()}] ✓ Firma digital válida`);
    
    // Paso 4: Validar información del emisor
    logs.push(`[${new Date().toISOString()}] Validando información del emisor...`);
    await new Promise(resolve => setTimeout(resolve, 250));
    logs.push(`[${new Date().toISOString()}] ✓ Información del emisor validada`);
    
    // Paso 5: Validar información del receptor
    logs.push(`[${new Date().toISOString()}] Validando información del receptor...`);
    await new Promise(resolve => setTimeout(resolve, 250));
    logs.push(`[${new Date().toISOString()}] ✓ Información del receptor validada`);
    
    // Paso 6: Validar cálculos de impuestos
    logs.push(`[${new Date().toISOString()}] Validando cálculos de impuestos...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`[${new Date().toISOString()}] ✓ Cálculos de impuestos validados`);
    
    // Paso 7: Generar CUFE
    logs.push(`[${new Date().toISOString()}] Generando CUFE...`);
    await new Promise(resolve => setTimeout(resolve, 200));
    const cufe = this.generateCUFE(xmlContent);
    logs.push(`[${new Date().toISOString()}] ✓ CUFE generado: ${cufe}`);
    
    return logs;
  }

  /**
   * Genera errores aleatorios para simular rechazos
   */
  private generateRandomErrors(): any[] {
    const possibleErrors = [
      {
        code: 'DIAN-FAC-001',
        message: 'El NIT del emisor no está autorizado para facturar electrónicamente'
      },
      {
        code: 'DIAN-FAC-002',
        message: 'La numeración de la factura no corresponde a rangos autorizados'
      },
      {
        code: 'DIAN-FAC-003',
        message: 'Error en los cálculos de impuestos. Valores inconsistentes'
      },
      {
        code: 'DIAN-FAC-004',
        message: 'La fecha de emisión es posterior a la fecha actual'
      },
      {
        code: 'DIAN-FAC-005',
        message: 'El certificado digital ha expirado o no es válido'
      },
      {
        code: 'DIAN-FAC-006',
        message: 'La firma digital no es válida o no corresponde al emisor'
      },
      {
        code: 'DIAN-FAC-007',
        message: 'El XML no cumple con el esquema UBL 2.1 requerido'
      }
    ];
    
    // Seleccionar 1 o 2 errores aleatorios
    const numErrors = Math.floor(Math.random() * 2) + 1;
    const selectedErrors = [];
    
    for (let i = 0; i < numErrors; i++) {
      const randomIndex = Math.floor(Math.random() * possibleErrors.length);
      selectedErrors.push(possibleErrors[randomIndex]);
      // Evitar duplicados
      possibleErrors.splice(randomIndex, 1);
    }
    
    return selectedErrors;
  }

  /**
   * Genera un retraso aleatorio dentro del rango configurado
   */
  private getRandomDelay(): number {
    return Math.floor(Math.random() * (this.simulationDelay.max - this.simulationDelay.min + 1)) + this.simulationDelay.min;
  }
}
