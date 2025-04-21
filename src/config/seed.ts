import { getConnection } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';
import { Company } from '../models/Company';
import { TaxRate, TaxType } from '../models/TaxRate';
import { Customer, CustomerType, IdentificationType } from '../models/Customer';
import { Product } from '../models/Product';
import { Certificate, CertificateStatus } from '../models/Certificate';

/**
 * Seed the database with initial data
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Iniciando proceso de seed de la base de datos...');
    
    // Create first company
    const company1 = new Company();
    company1.name = 'Empresa Ejemplo S.A.S';
    company1.nit = '900123456';
    company1.dv = '7';
    company1.address = 'Calle 123 # 45-67';
    company1.city = 'Bogotá';
    company1.department = 'Cundinamarca';
    company1.phone = '6011234567';
    company1.email = 'contacto@empresaejemplo.com';
    company1.website = 'www.empresaejemplo.com';
    company1.economicActivity = '6201';
    company1.taxRegime = 'Régimen Simple';
    company1.isAuthorized = true;
    company1.authorizationDate = new Date();
    company1.authorizationNumber = '18764020842746';
    company1.authorizationPrefix = 'FE';
    company1.authorizationRangeFrom = 1;
    company1.authorizationRangeTo = 5000;
    
    await getConnection().manager.save(company1);
    console.log('✅ Empresa 1 creada');
    
    // Create second company
    const company2 = new Company();
    company2.name = 'Comercial XYZ S.A.S';
    company2.nit = '901987654';
    company2.dv = '3';
    company2.address = 'Avenida El Dorado # 68C-61';
    company2.city = 'Medellín';
    company2.department = 'Antioquia';
    company2.phone = '6044567890';
    company2.email = 'contacto@comercialxyz.com';
    company2.website = 'www.comercialxyz.com';
    company2.economicActivity = '4791';
    company2.taxRegime = 'Régimen Común';
    company2.isAuthorized = false;
    
    await getConnection().manager.save(company2);
    console.log('✅ Empresa 2 creada');
    
    // Create admin user
    const adminUser = new User();
    adminUser.firstName = 'Admin';
    adminUser.lastName = 'Sistema';
    adminUser.email = 'admin@sistema.com';
    adminUser.password = await bcrypt.hash('admin123', 10);
    adminUser.role = UserRole.ADMIN;
    adminUser.companyId = company1.id;
    
    await getConnection().manager.save(adminUser);
    console.log('✅ Usuario administrador creado');

    // Crear usuarios vendor
    const vendorUser1 = new User();
    vendorUser1.firstName = 'Vendor';
    vendorUser1.lastName = 'Uno';
    vendorUser1.email = 'vendor1@example.com';
    vendorUser1.password = await bcrypt.hash('vendor123', 10);
    vendorUser1.role = UserRole.VENDOR;
    vendorUser1.companyId = company1.id;
    await getConnection().manager.save(vendorUser1);
    console.log('✅ Usuario vendor1 creado');
    const vendorUser2 = new User();
    vendorUser2.firstName = 'Vendor';
    vendorUser2.lastName = 'Dos';
    vendorUser2.email = 'vendor2@example.com';
    vendorUser2.password = await bcrypt.hash('vendor456', 10);
    vendorUser2.role = UserRole.VENDOR;
    vendorUser2.companyId = company1.id;
    await getConnection().manager.save(vendorUser2);
    console.log('✅ Usuario vendor2 creado');
    
    // Create tax rates
    const taxRates = [
      {
        name: 'IVA 19%',
        type: TaxType.IVA,
        rate: 19,
        code: '01',
        companyId: company1.id
      },
      {
        name: 'IVA 5%',
        type: TaxType.IVA,
        rate: 5,
        code: '02',
        companyId: company1.id
      },
      {
        name: 'Exento de IVA',
        type: TaxType.IVA,
        rate: 0,
        code: '03',
        companyId: company1.id
      }
    ];
    
    for (const taxRateData of taxRates) {
      const taxRate = new TaxRate();
      Object.assign(taxRate, taxRateData);
      await getConnection().manager.save(taxRate);
    }
    console.log('✅ Tasas de impuestos creadas');
    
    // Create customers
    const customers = [
      {
        type: CustomerType.NATURAL,
        name: 'Juan Pérez',
        identificationType: IdentificationType.CC,
        identificationNumber: '1020304050',
        address: 'Carrera 15 # 30-45',
        city: 'Bogotá',
        department: 'Cundinamarca',
        phone: '3101234567',
        email: 'juan.perez@mail.com',
        // independent customer, no companyId
      },
      {
        type: CustomerType.JURIDICA,
        name: 'Comercial XYZ S.A.S',
        businessName: 'Comercial XYZ S.A.S',
        identificationType: IdentificationType.NIT,
        identificationNumber: '901234567',
        dv: '8',
        address: 'Avenida El Dorado # 68C-61',
        city: 'Bogotá',
        department: 'Cundinamarca',
        phone: '6014567890',
        email: 'contacto@comercialxyz.com',
        taxRegime: 'Régimen Común',
        // independent customer, no companyId
      }
    ];
    
    for (const customerData of customers) {
      const customer = new Customer();
      Object.assign(customer, customerData);
      await getConnection().manager.save(customer);
    }
    console.log('✅ Clientes creados');
    
    // Create products
    const products = [
      {
        code: 'PROD-001',
        name: 'Servicio de desarrollo de software',
        description: 'Horas de desarrollo de software a medida',
        unitPrice: 120000,
        unit: 'hora',
        companyId: company1.id
      },
      {
        code: 'PROD-002',
        name: 'Licencia de software',
        description: 'Licencia mensual de uso de software',
        unitPrice: 500000,
        unit: 'mes',
        companyId: company1.id
      },
      {
        code: 'PROD-003',
        name: 'Soporte técnico',
        description: 'Horas de soporte técnico',
        unitPrice: 80000,
        unit: 'hora',
        companyId: company1.id
      }
    ];
    
    for (const productData of products) {
      const product = new Product();
      Object.assign(product, productData);
      await getConnection().manager.save(product);
    }
    console.log('✅ Productos creados');
    
    // Create a simulated certificate
    const certificate = new Certificate();
    certificate.name = 'Certificado Digital Simulado';
    certificate.publicKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvz4Tz6QJBGQp2lTHGmTT\n3IbPcEBEQcS9AxXFEAEAAhUAg+7cuLIcTwJBAKBzXhpzCgVw2QLgakDghn4ShXRw\nLTdIODQ5NQqclyUwcRJIFPJBIRERERERERERERERERERERERERERERERERERERER\nEREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREQ==\n-----END PUBLIC KEY-----';
    certificate.privateKey = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/PhPPpAkEZCna\nVMcaZNPchs9wQERBxL0DFcUQAQACFQCD7ty4shxPAkEAoHNeGnMKBXDZAuBqQOCG\nfhKFdHAtN0g4NDk1CpyXJTBxEkgU8kEhEREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREQ==\n-----END PRIVATE KEY-----';
    certificate.issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    certificate.expiryDate = expiryDate;
    certificate.serialNumber = '12345678901234567890';
    certificate.issuer = 'Autoridad Certificadora Simulada';
    certificate.status = CertificateStatus.ACTIVE;
    certificate.isDefault = true;
    certificate.companyId = company1.id;
    
    await getConnection().manager.save(certificate);
    console.log('✅ Certificado digital simulado creado');
    
    console.log('✅ Proceso de seed completado con éxito');
  } catch (error) {
    console.error('❌ Error durante el proceso de seed:', error);
    throw error;
  }
};
