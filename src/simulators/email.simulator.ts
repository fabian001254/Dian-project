import { v4 as uuidv4 } from 'uuid';

/**
 * Simulador de envío de correos electrónicos
 * Este simulador permite simular el envío de correos electrónicos
 * sin enviarlos realmente, guardando un registro de los mismos.
 */
export class EmailSimulator {
  private static instance: EmailSimulator;
  private emails: SimulatedEmail[] = [];

  private constructor() {}

  /**
   * Obtiene la instancia del simulador (Singleton)
   */
  public static getInstance(): EmailSimulator {
    if (!EmailSimulator.instance) {
      EmailSimulator.instance = new EmailSimulator();
    }
    return EmailSimulator.instance;
  }

  /**
   * Simula el envío de un correo electrónico
   * @param to Destinatario
   * @param subject Asunto
   * @param body Cuerpo del mensaje (HTML)
   * @param attachments Archivos adjuntos
   */
  public sendEmail(to: string, subject: string, body: string, attachments: EmailAttachment[] = []): SimulatedEmail {
    // Crear un nuevo correo simulado
    const email: SimulatedEmail = {
      id: uuidv4(),
      from: process.env.APP_NAME || 'Sistema de Facturación Electrónica',
      to,
      subject,
      body,
      attachments,
      sentAt: new Date(),
      status: 'sent'
    };
    
    // Guardar el correo en la lista
    this.emails.push(email);
    
    console.log(`📧 Correo simulado enviado a: ${to}`);
    console.log(`📧 Asunto: ${subject}`);
    
    return email;
  }

  /**
   * Envía una factura electrónica por correo
   * @param to Destinatario
   * @param invoiceNumber Número de factura
   * @param customerName Nombre del cliente
   * @param pdfPath Ruta al archivo PDF de la factura
   * @param xmlPath Ruta al archivo XML de la factura
   */
  public sendInvoiceEmail(to: string, invoiceNumber: string, customerName: string, pdfPath: string, xmlPath: string): SimulatedEmail {
    // Crear asunto del correo
    const subject = `Factura Electrónica ${invoiceNumber}`;
    
    // Crear cuerpo del correo con HTML
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3066BE; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">Factura Electrónica ${invoiceNumber}</h2>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 10px 10px;">
          <p>Estimado(a) <strong>${customerName}</strong>,</p>
          <p>Adjunto encontrará su factura electrónica ${invoiceNumber} en formato PDF y XML, de acuerdo con la normativa vigente de la DIAN.</p>
          <p>Este correo es generado automáticamente, por favor no responda a esta dirección.</p>
          <p>Si tiene alguna inquietud sobre su factura, por favor comuníquese con nuestro departamento de facturación.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>Este es un correo simulado con fines educativos. No se ha enviado ningún correo real.</p>
          </div>
        </div>
      </div>
    `;
    
    // Crear adjuntos
    const attachments: EmailAttachment[] = [
      {
        filename: `Factura_${invoiceNumber}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      },
      {
        filename: `Factura_${invoiceNumber}.xml`,
        path: xmlPath,
        contentType: 'application/xml'
      }
    ];
    
    // Enviar el correo simulado
    return this.sendEmail(to, subject, body, attachments);
  }

  /**
   * Obtiene todos los correos simulados
   */
  public getAllEmails(): SimulatedEmail[] {
    return this.emails;
  }

  /**
   * Obtiene un correo simulado por su ID
   * @param id ID del correo
   */
  public getEmailById(id: string): SimulatedEmail | undefined {
    return this.emails.find(email => email.id === id);
  }

  /**
   * Obtiene los correos enviados a un destinatario específico
   * @param to Dirección de correo del destinatario
   */
  public getEmailsByRecipient(to: string): SimulatedEmail[] {
    return this.emails.filter(email => email.to === to);
  }

  /**
   * Limpia todos los correos simulados (útil para pruebas)
   */
  public clearEmails(): void {
    this.emails = [];
  }
}

/**
 * Interfaz para un correo electrónico simulado
 */
export interface SimulatedEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  attachments: EmailAttachment[];
  sentAt: Date;
  status: 'sent' | 'failed';
}

/**
 * Interfaz para un archivo adjunto de correo electrónico
 */
export interface EmailAttachment {
  filename: string;
  path: string;
  contentType: string;
}
