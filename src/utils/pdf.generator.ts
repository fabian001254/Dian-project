// @ts-nocheck

import { Invoice, InvoiceStatus } from '../models/Invoice';
import { formatDateDDMMYYYY, formatLongDate } from './date.utils';
import puppeteer from 'puppeteer';
import crypto from 'crypto';

/**
 * Genera un PDF a partir de una factura
 * @param invoice Factura con todas sus relaciones
 * @returns Buffer con el contenido del PDF
 */
export async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
  // Render styled HTML invoice and convert to PDF via Puppeteer
  const html = generateInvoiceHTML(invoice);
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '50px', bottom: '50px', left: '50px', right: '50px' } });
  await browser.close();
  return pdfBuffer;
}

/**
 * Genera el HTML para la representación gráfica de la factura
 * @param invoice Factura con todas sus relaciones
 */
function generateInvoiceHTML(invoice: Invoice): string {
  // Validar que la factura tenga todas las relaciones necesarias
  if (!invoice.company || !invoice.customer || !invoice.items || invoice.items.length === 0) {
    throw new Error('La factura no tiene todos los datos necesarios para generar el PDF');
  }
  
  // Fallback CUFE
  const cufeVal = invoice.status === InvoiceStatus.APPROVED
    ? (invoice.cufe || Array.from({length:16},()=>Math.floor(Math.random()*16).toString(16)).join('').toUpperCase())
    : 'Pendiente de generación';
  
  // Generar tabla de items
  let itemsHTML = '';
  let subtotal = 0, taxTotal = 0;
  
  invoice.items.forEach((item, index) => {
    subtotal += item.subtotal;
    taxTotal += item.taxAmount;
    
    itemsHTML += `
      <tr>
        <td>${index+1}</td>
        <td>${item.product.code}</td>
        <td>${item.product.name}</td>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>${item.product.unit}</td>
        <td>$${item.unitPrice.toLocaleString('es-CO')}</td>
        <td>$${item.subtotal.toLocaleString('es-CO')}</td>
        <td>${item.taxRate}%</td>
        <td>$${item.taxAmount.toLocaleString('es-CO')}</td>
        <td>$${item.total.toLocaleString('es-CO')}</td>
      </tr>
    `;
  });
  
  const total = subtotal + taxTotal;
  
  // Return full HTML with inline CSS
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura ${invoice.prefix}${invoice.number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .header { background: #3066BE; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .header .title { font-size: 24px; }
        .header .invoice-id { font-size: 20px; }
        .section { padding: 20px; border-bottom: 1px solid #eee; }
        .section h3 { margin: 0 0 10px; color: #119DA4; }
        .details table { width: 100%; }
        .details td { padding: 5px; }
        .parties { display: flex; justify-content: space-between; }
        .party { width: 48%; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.items th, table.items td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        table.items th { background: #f5f5f5; }
        .totals { display: flex; justify-content: flex-end; padding: 20px; }
        .totals table { border-collapse: collapse; }
        .totals td { padding: 5px 10px; }
        .footer { text-align: center; font-size: 12px; color: #666; padding: 20px; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">FACTURA ELECTRÓNICA</div>
          <div class="invoice-id">${invoice.prefix}${invoice.number}</div>
        </div>
        <div class="section details">
          <h3>Factura Info</h3>
          <table>
            <tr><td><strong>Fecha emisión:</strong> ${formatLongDate(invoice.issueDate)}</td><td><strong>Fecha venc:</strong> ${formatDateDDMMYYYY(invoice.dueDate)}</td></tr>
            <tr><td><strong>CUFE:</strong> ${cufeVal}</td><td><strong>Pago:</strong> ${getPaymentMethodName(invoice.paymentMethod)}</td></tr>
          </table>
        </div>
        <div class="section parties">
          <div class="party">
            <h3>Emisor</h3>
            <p><strong>${invoice.company.name}</strong></p>
            <p>NIT: ${invoice.company.nit}-${invoice.company.dv}</p>
            <p>${invoice.company.address}</p>
          </div>
          <div class="party">
            <h3>Adquiriente</h3>
            <p><strong>${invoice.customer.name}</strong></p>
            <p>${getIdentificationTypeName(invoice.customer.identificationType)}: ${invoice.customer.identificationNumber}${invoice.customer.dv ? '-'+invoice.customer.dv : ''}</p>
            <p>${invoice.customer.address}</p>
          </div>
        </div>
        <div class="section">
          <h3>Detalle de Productos</h3>
          <table class="items">
            <thead><tr><th>#</th><th>Código</th><th>Nombre</th><th>Desc</th><th>Cant</th><th>Unidad</th><th>PU</th><th>Subtot</th><th>%Imp</th><th>IVA</th><th>Total</th></tr></thead>
            <tbody>${itemsHTML}</tbody>
          </table>
        </div>
        <div class="totals">
          <table>
            <tr><td><strong>Subtotal:</strong></td><td>${subtotal.toLocaleString('es-CO')}</td></tr>
            <tr><td><strong>IVA:</strong></td><td>${taxTotal.toLocaleString('es-CO')}</td></tr>
            <tr><td><strong>Total:</strong></td><td>${total.toLocaleString('es-CO')}</td></tr>
          </table>
        </div>
        <div class="footer">
          Factura generada electrónicamente - Simulación educativa
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Obtiene el nombre del método de pago a partir de su código
 * @param method Método de pago
 */
function getPaymentMethodName(method: string): string {
  const methodMap: { [key: string]: string } = {
    'efectivo': 'Efectivo',
    'transferencia': 'Transferencia Bancaria',
    'tarjeta-credito': 'Tarjeta de Crédito',
    'tarjeta-debito': 'Tarjeta de Débito',
    'cheque': 'Cheque',
    'otro': 'Otro'
  };
  return methodMap[method] || 'Otro';
}

/**
 * Obtiene el nombre del tipo de identificación a partir de su código
 * @param type Tipo de identificación
 */
function getIdentificationTypeName(type: string): string {
  return type || 'Documento';
}
