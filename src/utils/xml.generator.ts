// @ts-nocheck

import * as xml2js from 'xml2js';
import { Invoice } from '../models/Invoice';

/**
 * Genera el XML de una factura electrónica según el estándar UBL 2.1
 * @param invoice Factura con todas sus relaciones
 */
export async function generateInvoiceXML(invoice: Invoice): Promise<string> {
  // Validar que la factura tenga todas las relaciones necesarias
  if (!invoice.company || !invoice.customer || !invoice.items || invoice.items.length === 0) {
    throw new Error('La factura no tiene todos los datos necesarios para generar el XML');
  }

  // Crear el objeto base del XML
  const invoiceObject = {
    'fe:Invoice': {
      $: {
        'xmlns:fe': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        'xmlns:sts': 'dian:gov:co:facturaelectronica:Structures-2-1',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2 http://docs.oasis-open.org/ubl/os-UBL-2.1/xsd/maindoc/UBL-Invoice-2.1.xsd'
      },
      // UBL Extensions (para firma digital y otros elementos DIAN)
      'ext:UBLExtensions': {
        'ext:UBLExtension': [
          {
            'ext:ExtensionContent': {
              'sts:DianExtensions': {
                'sts:InvoiceControl': {
                  'sts:InvoiceAuthorization': invoice.company.authorizationNumber,
                  'sts:AuthorizationPeriod': {
                    'cbc:StartDate': formatDate(invoice.company.authorizationDate),
                    'cbc:EndDate': formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 2))) // 2 años por defecto
                  },
                  'sts:AuthorizedInvoices': {
                    'sts:Prefix': invoice.prefix,
                    'sts:From': invoice.company.authorizationRangeFrom,
                    'sts:To': invoice.company.authorizationRangeTo
                  }
                },
                'sts:InvoiceSource': {
                  'cbc:IdentificationCode': {
                    _: 'CO',
                    $: { 'listAgencyID': '6', 'listAgencyName': 'United Nations Economic Commission for Europe', 'listSchemeURI': 'urn:oasis:names:specification:ubl:codelist:gc:CountryIdentificationCode-2.1' }
                  }
                },
                'sts:SoftwareProvider': {
                  'sts:ProviderID': {
                    _: invoice.company.nit,
                    $: { 'schemeAgencyID': '195', 'schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', 'schemeID': invoice.company.dv, 'schemeName': '31' }
                  },
                  'sts:SoftwareID': {
                    _: 'FACTURADOR-EDUCATIVO-1.0',
                    $: { 'schemeAgencyID': '195', 'schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)' }
                  }
                },
                'sts:SoftwareSecurityCode': {
                  _: generateSecurityCode(invoice),
                  $: { 'schemeAgencyID': '195', 'schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)' }
                }
              }
            }
          },
          {
            'ext:ExtensionContent': {
              // Espacio reservado para la firma digital
              'ds:Signature': { $: { 'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#', 'Id': 'xmldsig-' + invoice.id } }
            }
          }
        ]
      },
      // Versión UBL
      'cbc:UBLVersionID': '2.1',
      // Versión del formato DIAN
      'cbc:CustomizationID': '10',
      // Versión del esquema de numeración
      'cbc:ProfileID': 'DIAN 2.1',
      // Tipo de operación
      'cbc:ProfileExecutionID': '1',
      // ID de la factura (prefijo + número)
      'cbc:ID': invoice.prefix + invoice.number,
      // Copia del ID
      'cbc:UUID': {
        _: invoice.cufe || 'PENDIENTE',
        $: { 'schemeID': '1', 'schemeName': 'CUFE-SHA384' }
      },
      // Fecha y hora de emisión
      'cbc:IssueDate': formatDate(invoice.issueDate),
      'cbc:IssueTime': formatTime(invoice.issueDate),
      // Tipo de factura
      'cbc:InvoiceTypeCode': mapInvoiceTypeCode(invoice.type),
      // Moneda
      'cbc:DocumentCurrencyCode': {
        _: 'COP',
        $: { 'listAgencyID': '6', 'listAgencyName': 'United Nations Economic Commission for Europe', 'listID': 'ISO 4217 Alpha' }
      },
      // Información del emisor
      'cac:AccountingSupplierParty': {
        'cbc:AdditionalAccountID': getPersonType(invoice.company.nit),
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': {
              _: invoice.company.nit,
              $: { 'schemeAgencyID': '195', 'schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', 'schemeID': invoice.company.dv, 'schemeName': '31' }
            }
          },
          'cac:PartyName': {
            'cbc:Name': invoice.company.name
          },
          'cac:PhysicalLocation': {
            'cac:Address': {
              'cbc:ID': '11001', // Código postal Bogotá por defecto
              'cbc:CityName': invoice.company.city,
              'cbc:CountrySubentity': invoice.company.department,
              'cbc:CountrySubentityCode': '11', // Código Cundinamarca por defecto
              'cac:AddressLine': {
                'cbc:Line': invoice.company.address
              },
              'cac:Country': {
                'cbc:IdentificationCode': 'CO',
                'cbc:Name': {
                  _: 'Colombia',
                  $: { 'languageID': 'es' }
                }
              }
            }
          },
          'cac:PartyTaxScheme': {
            'cbc:RegistrationName': invoice.company.name,
            'cbc:CompanyID': {
              _: invoice.company.nit,
              $: { 'schemeAgencyID': '195', 'schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', 'schemeID': invoice.company.dv, 'schemeName': '31' }
            },
            'cbc:TaxLevelCode': {
              _: 'O-99', // Código de régimen tributario
              $: { 'listName': 'No aplica' }
            },
            'cac:RegistrationAddress': {
              'cbc:ID': '11001',
              'cbc:CityName': invoice.company.city,
              'cbc:CountrySubentity': invoice.company.department,
              'cbc:CountrySubentityCode': '11',
              'cac:AddressLine': {
                'cbc:Line': invoice.company.address
              },
              'cac:Country': {
                'cbc:IdentificationCode': 'CO',
                'cbc:Name': {
                  _: 'Colombia',
                  $: { 'languageID': 'es' }
                }
              }
            },
            'cac:TaxScheme': {
              'cbc:ID': '01',
              'cbc:Name': 'IVA'
            }
          },
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': invoice.company.name,
            'cbc:CompanyID': {
              _: invoice.company.nit,
              $: { 'schemeAgencyID': '195', 'schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', 'schemeID': invoice.company.dv, 'schemeName': '31' }
            },
            'cac:CorporateRegistrationScheme': {
              'cbc:ID': invoice.prefix
            }
          },
          'cac:Contact': {
            'cbc:ElectronicMail': invoice.company.email
          }
        }
      },
      // Información del receptor (cliente)
      'cac:AccountingCustomerParty': {
        'cbc:AdditionalAccountID': getPersonType(invoice.customer.identificationNumber),
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': {
              _: invoice.customer.identificationNumber,
              $: { 'schemeAgencyID': '195', 'schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', 'schemeID': invoice.customer.dv || '', 'schemeName': mapIdentificationTypeToCode(invoice.customer.identificationType) }
            }
          },
          'cac:PartyName': {
            'cbc:Name': invoice.customer.name
          },
          'cac:PhysicalLocation': {
            'cac:Address': {
              'cbc:ID': '11001',
              'cbc:CityName': invoice.customer.city,
              'cbc:CountrySubentity': invoice.customer.department,
              'cbc:CountrySubentityCode': '11',
              'cac:AddressLine': {
                'cbc:Line': invoice.customer.address
              },
              'cac:Country': {
                'cbc:IdentificationCode': 'CO',
                'cbc:Name': {
                  _: 'Colombia',
                  $: { 'languageID': 'es' }
                }
              }
            }
          },
          'cac:PartyTaxScheme': {
            'cbc:RegistrationName': invoice.customer.businessName || invoice.customer.name,
            'cbc:CompanyID': {
              _: invoice.customer.identificationNumber,
              $: { 'schemeAgencyID': '195', 'schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', 'schemeID': invoice.customer.dv || '', 'schemeName': mapIdentificationTypeToCode(invoice.customer.identificationType) }
            },
            'cbc:TaxLevelCode': {
              _: 'R-99-PN', // Código de régimen tributario
              $: { 'listName': 'No aplica' }
            },
            'cac:RegistrationAddress': {
              'cbc:ID': '11001',
              'cbc:CityName': invoice.customer.city,
              'cbc:CountrySubentity': invoice.customer.department,
              'cbc:CountrySubentityCode': '11',
              'cac:AddressLine': {
                'cbc:Line': invoice.customer.address
              },
              'cac:Country': {
                'cbc:IdentificationCode': 'CO',
                'cbc:Name': {
                  _: 'Colombia',
                  $: { 'languageID': 'es' }
                }
              }
            },
            'cac:TaxScheme': {
              'cbc:ID': '01',
              'cbc:Name': 'IVA'
            }
          },
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': invoice.customer.businessName || invoice.customer.name,
            'cbc:CompanyID': {
              _: invoice.customer.identificationNumber,
              $: { 'schemeAgencyID': '195', 'schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', 'schemeID': invoice.customer.dv || '', 'schemeName': mapIdentificationTypeToCode(invoice.customer.identificationType) }
            }
          },
          'cac:Contact': {
            'cbc:ElectronicMail': invoice.customer.email
          },
          'cac:Person': invoice.customer.type === 'natural' ? {
            'cbc:FirstName': invoice.customer.name.split(' ')[0] || '',
            'cbc:FamilyName': invoice.customer.name.split(' ').slice(1).join(' ') || ''
          } : undefined
        }
      },
      // Información de pago
      'cac:PaymentMeans': {
        'cbc:ID': mapPaymentMethodToCode(invoice.paymentMethod),
        'cbc:PaymentMeansCode': mapPaymentMethodToCode(invoice.paymentMethod),
        'cbc:PaymentDueDate': formatDate(invoice.dueDate),
        'cbc:PaymentID': invoice.paymentReference || `REF-${invoice.prefix}${invoice.number}`
      },
      // Información de impuestos
      'cac:TaxTotal': {
        'cbc:TaxAmount': {
          _: formatAmount(invoice.taxTotal),
          $: { 'currencyID': 'COP' }
        },
        'cac:TaxSubtotal': {
          'cbc:TaxableAmount': {
            _: formatAmount(invoice.subtotal),
            $: { 'currencyID': 'COP' }
          },
          'cbc:TaxAmount': {
            _: formatAmount(invoice.taxTotal),
            $: { 'currencyID': 'COP' }
          },
          'cac:TaxCategory': {
            'cbc:Percent': '19.00',
            'cac:TaxScheme': {
              'cbc:ID': '01',
              'cbc:Name': 'IVA'
            }
          }
        }
      },
      // Totales
      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': {
          _: formatAmount(invoice.subtotal),
          $: { 'currencyID': 'COP' }
        },
        'cbc:TaxExclusiveAmount': {
          _: formatAmount(invoice.subtotal),
          $: { 'currencyID': 'COP' }
        },
        'cbc:TaxInclusiveAmount': {
          _: formatAmount(invoice.total),
          $: { 'currencyID': 'COP' }
        },
        'cbc:PayableAmount': {
          _: formatAmount(invoice.total),
          $: { 'currencyID': 'COP' }
        }
      },
      // Líneas de detalle
      'cac:InvoiceLine': invoice.items.map((item, index) => ({
        'cbc:ID': index + 1,
        'cbc:InvoicedQuantity': {
          _: formatAmount(item.quantity),
          $: { 'unitCode': 'EA' } // Unidad de medida
        },
        'cbc:LineExtensionAmount': {
          _: formatAmount(item.subtotal),
          $: { 'currencyID': 'COP' }
        },
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            _: formatAmount(item.taxAmount),
            $: { 'currencyID': 'COP' }
          },
          'cbc:RoundingAmount': {
            _: '0.00',
            $: { 'currencyID': 'COP' }
          },
          'cac:TaxSubtotal': {
            'cbc:TaxableAmount': {
              _: formatAmount(item.subtotal),
              $: { 'currencyID': 'COP' }
            },
            'cbc:TaxAmount': {
              _: formatAmount(item.taxAmount),
              $: { 'currencyID': 'COP' }
            },
            'cac:TaxCategory': {
              'cbc:Percent': formatAmount(item.taxRate),
              'cac:TaxScheme': {
                'cbc:ID': '01',
                'cbc:Name': 'IVA'
              }
            }
          }
        },
        'cac:Item': {
          'cbc:Description': item.description,
          'cac:SellersItemIdentification': {
            'cbc:ID': item.product.code
          },
          'cac:StandardItemIdentification': {
            'cbc:ID': {
              _: item.product.code,
              $: { 'schemeAgencyID': '10', 'schemeID': '001', 'schemeName': 'UNSPSC' }
            }
          }
        },
        'cac:Price': {
          'cbc:PriceAmount': {
            _: formatAmount(item.unitPrice),
            $: { 'currencyID': 'COP' }
          },
          'cbc:BaseQuantity': {
            _: '1',
            $: { 'unitCode': 'EA' }
          }
        }
      }))
    }
  };

  // Convertir el objeto a XML
  const builder = new xml2js.Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8', standalone: false },
    renderOpts: { pretty: true, indent: '  ', newline: '\n' },
    headless: false
  });

  const xml = builder.buildObject(invoiceObject);
  console.debug('Generated XML:', xml.substring(0, 200));
  return xml;
}

/**
 * Genera un código de seguridad para la factura
 * @param invoice Factura
 */
function generateSecurityCode(invoice: Invoice): string {
  // En un sistema real, este código se generaría según el algoritmo definido por la DIAN
  // Para este simulador educativo, generamos un código aleatorio
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
}

/**
 * Formatea una fecha para el XML
 * @param date Fecha
 */
function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Formatea una hora para el XML
 * @param date Fecha con hora
 */
function formatTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[1].substring(0, 8);
}

/**
 * Formatea un monto para el XML
 * @param amount Monto
 */
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Mapea el tipo de factura a su código correspondiente
 * @param type Tipo de factura
 */
function mapInvoiceTypeCode(type: string): string {
  const typeMap: { [key: string]: string } = {
    'factura-venta': '01',
    'nota-credito': '91',
    'nota-debito': '92'
  };
  return typeMap[type] || '01';
}

/**
 * Mapea el método de pago a su código correspondiente
 * @param method Método de pago
 */
function mapPaymentMethodToCode(method: string): string {
  const methodMap: { [key: string]: string } = {
    'efectivo': '10',
    'transferencia': '42',
    'tarjeta-credito': '48',
    'tarjeta-debito': '49',
    'cheque': '20',
    'otro': '1'
  };
  return methodMap[method] || '1';
}

/**
 * Mapea el tipo de identificación a su código correspondiente
 * @param type Tipo de identificación
 */
function mapIdentificationTypeToCode(type: string): string {
  const typeMap: { [key: string]: string } = {
    'Cédula de Ciudadanía': '13',
    'Cédula de Extranjería': '22',
    'NIT': '31',
    'Pasaporte': '41',
    'Tarjeta de Identidad': '12'
  };
  return typeMap[type] || '13';
}

/**
 * Determina el tipo de persona (natural o jurídica) según el NIT
 * @param nit NIT
 */
function getPersonType(nit: string): string {
  // En Colombia, las personas jurídicas suelen tener NIT de 9 dígitos
  // mientras que las personas naturales usan su cédula
  return nit.length >= 9 ? '1' : '2'; // 1 = Jurídica, 2 = Natural
}
