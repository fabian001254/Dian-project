import { AppDataSource } from './config/database';
import { User, UserRole } from './models/User';
import { Company } from './models/Company';
import { TaxRate, TaxType } from './models/TaxRate';
import { Customer, CustomerType, IdentificationType } from './models/Customer';
import { Product } from './models/Product';
import { Certificate, CertificateStatus } from './models/Certificate';
import { Vendor } from './models/Vendor';
const bcrypt = require('bcryptjs');

/**
 * Script para asegurar que existan datos básicos en la base de datos
 * Este script verifica si hay datos y los crea solo si no existen
 */
const ensureData = async () => {
  try {
    console.log(' Iniciando conexión a la base de datos...');
    
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log(' Conexión a la base de datos establecida');
    
    // Verificar si ya existen empresas
    const companyRepository = AppDataSource.getRepository(Company);
    const companyCount = await companyRepository.count();
    
    // Verificar si ya existen usuarios
    const userRepository = AppDataSource.getRepository(User);
    const userCount = await userRepository.count();
    
    console.log(` Empresas existentes: ${companyCount}`);
    console.log(` Usuarios existentes: ${userCount}`);
    
    if (companyCount === 0 && userCount === 0) {
      console.log(' No se encontraron datos. Creando datos iniciales...');
      
      // Crear primera empresa
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
      
      await companyRepository.save(company1);
      console.log(' Empresa 1 creada');
      
      // Crear segunda empresa
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
      
      await companyRepository.save(company2);
      console.log(' Empresa 2 creada');
      
      // Crear usuario administrador
      const adminUser = new User();
      adminUser.firstName = 'Admin';
      adminUser.lastName = 'Sistema';
      adminUser.email = 'admin@sistema.com';
      adminUser.password = bcrypt.hashSync('admin123', 10);
      adminUser.role = UserRole.ADMIN;
      adminUser.companyId = company1.id;
      
      await userRepository.save(adminUser);
      console.log('✅ Usuario administrador creado');
      
      // Crear usuarios vendedores
      const vendor1 = new User();
      vendor1.firstName = 'Proveedor';
      vendor1.lastName = 'Uno';
      vendor1.email = 'vendor1@empresa.com';
      vendor1.password = bcrypt.hashSync('vendor123', 10);
      vendor1.role = UserRole.VENDOR;
      vendor1.companyId = company1.id;
      // Asignar datos de identificación del usuario vendedor
      vendor1.identificationType = IdentificationType.CC;
      vendor1.identificationNumber = '123456789';
      await userRepository.save(vendor1);
      console.log('✅ Usuario vendedor creado: vendor1@empresa.com');
      
      const vendor2 = new User();
      vendor2.firstName = 'Proveedor';
      vendor2.lastName = 'Dos';
      vendor2.email = 'vendor2@comercialxyz.com';
      vendor2.password = bcrypt.hashSync('vendor123', 10);
      vendor2.role = UserRole.VENDOR;
      vendor2.companyId = company2.id;
      // Asignar datos de identificación del usuario vendedor
      vendor2.identificationType = IdentificationType.CC;
      vendor2.identificationNumber = '987654321';
      await userRepository.save(vendor2);
      console.log('✅ Usuario vendedor creado: vendor2@comercialxyz.com');
      
      // Crear registros en tabla vendors
      const vendorRepository = AppDataSource.getRepository(Vendor);
      const vendorsInfo = [
        { userId: vendor1.id, companyId: company1.id, name: `${vendor1.firstName} ${vendor1.lastName}` },
        { userId: vendor2.id, companyId: company2.id, name: `${vendor2.firstName} ${vendor2.lastName}` }
      ];
      for (const info of vendorsInfo) {
        const vendorEntity = vendorRepository.create(info);
        await vendorRepository.save(vendorEntity);
      }
      console.log('✅ Vendors iniciales creados');
      
      // Crear tasas de impuestos
      const taxRateRepository = AppDataSource.getRepository(TaxRate);
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
        await taxRateRepository.save(taxRate);
      }
      console.log(' Tasas de impuestos creadas');
      
      // Crear clientes
      const customerRepository = AppDataSource.getRepository(Customer);
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
          companyId: company1.id
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
          companyId: company1.id
        }
      ];
      
      for (const customerData of customers) {
        const customer = new Customer();
        Object.assign(customer, customerData);
        await customerRepository.save(customer);
      }
      console.log(' Clientes creados');
      
      // Crear productos
      const productRepository = AppDataSource.getRepository(Product);
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
        // Asegurar que price no sea null
        product.price = product.unitPrice;
        await productRepository.save(product);
      }
      console.log(' Productos creados');
      
      // Crear certificado simulado
      const certificateRepository = AppDataSource.getRepository(Certificate);
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
      
      await certificateRepository.save(certificate);
      console.log(' Certificado digital simulado creado');
      
      console.log(' Datos iniciales creados correctamente');
    } else {
      console.log(' Ya existen datos en la base de datos. No se crearán datos iniciales.');
    }
    
    console.log(' Proceso completado con éxito');
    process.exit(0);
  } catch (error) {
    console.error(' Error al asegurar los datos iniciales:', error);
    process.exit(1);
  }
};

// Ejecutar el script
ensureData();
