import { v4 as uuidv4 } from 'uuid';
import { Company } from '../models/Company';

/**
 * Simulador del proceso de habilitación como facturador electrónico ante la DIAN
 * Este simulador replica el proceso de registro, solicitud de resolución y habilitación
 * sin realizar peticiones reales a la DIAN.
 */
export class DianHabilitacionSimulator {
  private static instance: DianHabilitacionSimulator;
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
  public static getInstance(): DianHabilitacionSimulator {
    if (!DianHabilitacionSimulator.instance) {
      DianHabilitacionSimulator.instance = new DianHabilitacionSimulator();
    }
    return DianHabilitacionSimulator.instance;
  }

  /**
   * Simula el registro como facturador electrónico
   * @param company Datos de la empresa
   */
  public async registrarFacturadorElectronico(company: Company): Promise<any> {
    console.log('🔄 Iniciando simulación de registro como facturador electrónico...');
    
    // Generar un retraso aleatorio para simular el tiempo de respuesta
    const delay = this.getRandomDelay();
    console.log(`⏱️ Tiempo estimado de respuesta: ${delay}ms`);
    
    // Simular el proceso de validación
    const logs = await this.simulateRegistrationProcess(company);
    
    // Decidir si el registro será aceptado o rechazado
    const isRejected = Math.random() < this.errorRate;
    
    // Preparar la respuesta
    const response = {
      success: !isRejected,
      trackId: uuidv4(),
      timestamp: new Date().toISOString(),
      logs,
      errors: isRejected ? this.generateRandomRegistrationErrors() : [],
      registrationData: isRejected ? null : {
        registrationId: uuidv4(),
        registrationDate: new Date().toISOString(),
        status: 'REGISTERED',
        message: 'Registro exitoso como facturador electrónico'
      }
    };
    
    // Simular el retraso de la API
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`✅ Simulación completada. Resultado: ${isRejected ? 'RECHAZADO' : 'APROBADO'}`);
    
    return response;
  }

  /**
   * Simula la solicitud de resolución de facturación
   * @param company Datos de la empresa
   * @param requestData Datos de la solicitud
   */
  public async solicitarResolucionFacturacion(company: Company, requestData: any): Promise<any> {
    console.log('🔄 Iniciando simulación de solicitud de resolución de facturación...');
    
    // Generar un retraso aleatorio para simular el tiempo de respuesta
    const delay = this.getRandomDelay() * 2; // Este proceso toma más tiempo
    console.log(`⏱️ Tiempo estimado de respuesta: ${delay}ms`);
    
    // Simular el proceso de validación
    const logs = await this.simulateResolutionRequestProcess(company, requestData);
    
    // Decidir si la solicitud será aceptada o rechazada
    const isRejected = Math.random() < this.errorRate;
    
    // Generar número de resolución
    const resolutionNumber = this.generateResolutionNumber();
    
    // Calcular fechas
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 años de vigencia
    
    // Preparar la respuesta
    const response = {
      success: !isRejected,
      trackId: uuidv4(),
      timestamp: new Date().toISOString(),
      logs,
      errors: isRejected ? this.generateRandomResolutionErrors() : [],
      resolutionData: isRejected ? null : {
        resolutionNumber,
        prefix: requestData.prefix || 'FE',
        rangeFrom: requestData.rangeFrom || 1,
        rangeTo: requestData.rangeTo || 5000,
        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        status: 'APPROVED'
      }
    };
    
    // Simular el retraso de la API
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`✅ Simulación completada. Resultado: ${isRejected ? 'RECHAZADO' : 'APROBADO'}`);
    
    return response;
  }

  /**
   * Simula el test de habilitación como facturador electrónico
   * @param company Datos de la empresa
   * @param testData Datos del test
   */
  public async realizarTestHabilitacion(company: Company, testData: any): Promise<any> {
    console.log('🔄 Iniciando simulación de test de habilitación...');
    
    // Generar un retraso aleatorio para simular el tiempo de respuesta
    const delay = this.getRandomDelay() * 3; // Este proceso toma aún más tiempo
    console.log(`⏱️ Tiempo estimado de respuesta: ${delay}ms`);
    
    // Simular el proceso de validación
    const logs = await this.simulateTestProcess(company, testData);
    
    // Decidir si el test será aprobado o rechazado
    const isRejected = Math.random() < this.errorRate;
    
    // Preparar la respuesta
    const response = {
      success: !isRejected,
      trackId: uuidv4(),
      timestamp: new Date().toISOString(),
      logs,
      errors: isRejected ? this.generateRandomTestErrors() : [],
      testResults: {
        status: isRejected ? 'FAILED' : 'APPROVED',
        message: isRejected ? 'Test de habilitación fallido' : 'Test de habilitación exitoso',
        details: isRejected ? 'Se encontraron errores en el proceso de habilitación' : 'Todos los criterios de habilitación cumplidos',
        approvalDate: isRejected ? null : new Date().toISOString()
      }
    };
    
    // Simular el retraso de la API
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`✅ Simulación completada. Resultado: ${isRejected ? 'RECHAZADO' : 'APROBADO'}`);
    
    return response;
  }

  /**
   * Simula el proceso de registro
   * @param company Datos de la empresa
   */
  private async simulateRegistrationProcess(company: Company): Promise<string[]> {
    const logs: string[] = [];
    
    // Paso 1: Verificar datos de la empresa
    logs.push(`[${new Date().toISOString()}] Verificando datos de la empresa...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!company.nit || !company.dv) {
      logs.push(`[${new Date().toISOString()}] ✗ NIT o dígito de verificación inválido`);
      return logs;
    }
    
    logs.push(`[${new Date().toISOString()}] ✓ NIT y dígito de verificación válidos`);
    
    // Paso 2: Verificar existencia en el RUT
    logs.push(`[${new Date().toISOString()}] Verificando existencia en el RUT...`);
    await new Promise(resolve => setTimeout(resolve, 700));
    logs.push(`[${new Date().toISOString()}] ✓ Empresa encontrada en el RUT`);
    
    // Paso 3: Verificar actividad económica
    logs.push(`[${new Date().toISOString()}] Verificando actividad económica...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!company.economicActivity) {
      logs.push(`[${new Date().toISOString()}] ✗ Actividad económica no especificada`);
      return logs;
    }
    
    logs.push(`[${new Date().toISOString()}] ✓ Actividad económica válida`);
    
    // Paso 4: Verificar régimen tributario
    logs.push(`[${new Date().toISOString()}] Verificando régimen tributario...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!company.taxRegime) {
      logs.push(`[${new Date().toISOString()}] ✗ Régimen tributario no especificado`);
      return logs;
    }
    
    logs.push(`[${new Date().toISOString()}] ✓ Régimen tributario válido`);
    
    // Paso 5: Registrar como facturador electrónico
    logs.push(`[${new Date().toISOString()}] Registrando como facturador electrónico...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    logs.push(`[${new Date().toISOString()}] ✓ Registro completado exitosamente`);
    
    return logs;
  }

  /**
   * Simula el proceso de solicitud de resolución
   * @param company Datos de la empresa
   * @param requestData Datos de la solicitud
   */
  private async simulateResolutionRequestProcess(company: Company, requestData: any): Promise<string[]> {
    const logs: string[] = [];
    
    // Paso 1: Verificar registro como facturador electrónico
    logs.push(`[${new Date().toISOString()}] Verificando registro como facturador electrónico...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    logs.push(`[${new Date().toISOString()}] ✓ Empresa registrada como facturador electrónico`);
    
    // Paso 2: Verificar datos de la solicitud
    logs.push(`[${new Date().toISOString()}] Verificando datos de la solicitud...`);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    if (!requestData.prefix) {
      logs.push(`[${new Date().toISOString()}] ✗ Prefijo no especificado`);
      return logs;
    }
    
    logs.push(`[${new Date().toISOString()}] ✓ Prefijo válido: ${requestData.prefix}`);
    
    // Paso 3: Verificar rango solicitado
    logs.push(`[${new Date().toISOString()}] Verificando rango solicitado...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!requestData.rangeFrom || !requestData.rangeTo || requestData.rangeFrom >= requestData.rangeTo) {
      logs.push(`[${new Date().toISOString()}] ✗ Rango inválido`);
      return logs;
    }
    
    logs.push(`[${new Date().toISOString()}] ✓ Rango válido: ${requestData.rangeFrom} - ${requestData.rangeTo}`);
    
    // Paso 4: Verificar disponibilidad del prefijo
    logs.push(`[${new Date().toISOString()}] Verificando disponibilidad del prefijo...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    logs.push(`[${new Date().toISOString()}] ✓ Prefijo disponible`);
    
    // Paso 5: Generar resolución
    logs.push(`[${new Date().toISOString()}] Generando resolución...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    logs.push(`[${new Date().toISOString()}] ✓ Resolución generada exitosamente`);
    
    return logs;
  }

  /**
   * Simula el proceso de test de habilitación
   * @param company Datos de la empresa
   * @param testData Datos del test
   */
  private async simulateTestProcess(company: Company, testData: any): Promise<string[]> {
    const logs: string[] = [];
    
    // Paso 1: Verificar resolución de facturación
    logs.push(`[${new Date().toISOString()}] Verificando resolución de facturación...`);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    if (!company.authorizationNumber) {
      logs.push(`[${new Date().toISOString()}] ✗ Resolución de facturación no encontrada`);
      return logs;
    }
    
    logs.push(`[${new Date().toISOString()}] ✓ Resolución de facturación válida`);
    
    // Paso 2: Verificar certificado digital
    logs.push(`[${new Date().toISOString()}] Verificando certificado digital...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!testData.certificateId) {
      logs.push(`[${new Date().toISOString()}] ✗ Certificado digital no proporcionado`);
      return logs;
    }
    
    logs.push(`[${new Date().toISOString()}] ✓ Certificado digital válido`);
    
    // Paso 3: Verificar factura de prueba
    logs.push(`[${new Date().toISOString()}] Verificando factura de prueba...`);
    await new Promise(resolve => setTimeout(resolve, 900));
    
    if (!testData.testInvoiceXml) {
      logs.push(`[${new Date().toISOString()}] ✗ Factura de prueba no proporcionada`);
      return logs;
    }
    
    logs.push(`[${new Date().toISOString()}] ✓ Factura de prueba válida`);
    
    // Paso 4: Verificar firma digital
    logs.push(`[${new Date().toISOString()}] Verificando firma digital...`);
    await new Promise(resolve => setTimeout(resolve, 700));
    logs.push(`[${new Date().toISOString()}] ✓ Firma digital válida`);
    
    // Paso 5: Verificar estructura UBL
    logs.push(`[${new Date().toISOString()}] Verificando estructura UBL...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    logs.push(`[${new Date().toISOString()}] ✓ Estructura UBL válida`);
    
    // Paso 6: Verificar CUFE
    logs.push(`[${new Date().toISOString()}] Verificando CUFE...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    logs.push(`[${new Date().toISOString()}] ✓ CUFE válido`);
    
    // Paso 7: Aprobar habilitación
    logs.push(`[${new Date().toISOString()}] Procesando habilitación...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    logs.push(`[${new Date().toISOString()}] ✓ Habilitación completada exitosamente`);
    
    return logs;
  }

  /**
   * Genera errores aleatorios para el proceso de registro
   */
  private generateRandomRegistrationErrors(): any[] {
    const possibleErrors = [
      {
        code: 'REG-001',
        message: 'NIT no registrado en el RUT'
      },
      {
        code: 'REG-002',
        message: 'Dígito de verificación incorrecto'
      },
      {
        code: 'REG-003',
        message: 'Actividad económica no compatible con facturación electrónica'
      },
      {
        code: 'REG-004',
        message: 'Régimen tributario no especificado'
      },
      {
        code: 'REG-005',
        message: 'Datos de contacto incompletos'
      }
    ];
    
    return this.getRandomErrors(possibleErrors);
  }

  /**
   * Genera errores aleatorios para el proceso de solicitud de resolución
   */
  private generateRandomResolutionErrors(): any[] {
    const possibleErrors = [
      {
        code: 'RES-001',
        message: 'Empresa no registrada como facturador electrónico'
      },
      {
        code: 'RES-002',
        message: 'Prefijo ya utilizado por otro facturador'
      },
      {
        code: 'RES-003',
        message: 'Rango de numeración inválido'
      },
      {
        code: 'RES-004',
        message: 'Solicitud incompleta'
      },
      {
        code: 'RES-005',
        message: 'Excede el límite de resoluciones permitidas'
      }
    ];
    
    return this.getRandomErrors(possibleErrors);
  }

  /**
   * Genera errores aleatorios para el proceso de test de habilitación
   */
  private generateRandomTestErrors(): any[] {
    const possibleErrors = [
      {
        code: 'TEST-001',
        message: 'Certificado digital inválido o expirado'
      },
      {
        code: 'TEST-002',
        message: 'Factura de prueba no cumple con el estándar UBL 2.1'
      },
      {
        code: 'TEST-003',
        message: 'Firma digital inválida'
      },
      {
        code: 'TEST-004',
        message: 'CUFE generado incorrectamente'
      },
      {
        code: 'TEST-005',
        message: 'Campos obligatorios faltantes en la factura de prueba'
      },
      {
        code: 'TEST-006',
        message: 'Error en la comunicación con el servicio de validación'
      }
    ];
    
    return this.getRandomErrors(possibleErrors);
  }

  /**
   * Selecciona errores aleatorios de una lista
   * @param possibleErrors Lista de posibles errores
   */
  private getRandomErrors(possibleErrors: any[]): any[] {
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
   * Genera un número de resolución aleatorio
   */
  private generateResolutionNumber(): string {
    // Formato: 18764XXXXXXXX (13 dígitos)
    const base = '18764';
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return base + random;
  }

  /**
   * Genera un retraso aleatorio dentro del rango configurado
   */
  private getRandomDelay(): number {
    return Math.floor(Math.random() * (this.simulationDelay.max - this.simulationDelay.min + 1)) + this.simulationDelay.min;
  }
}
