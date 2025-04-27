import path from 'path';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Customer } from '../models/Customer';
import { Product } from '../models/Product';
import { Invoice } from '../models/Invoice';
import { InvoiceItem } from '../models/InvoiceItem';
import { TaxRate } from '../models/TaxRate';
import { Certificate } from '../models/Certificate';
import { Vendor } from '../models/Vendor';

// Importar DataSource usando require para evitar problemas con TypeScript
const { DataSource } = require('typeorm');

// Determinar la ruta de la base de datos
// En Railway, usamos /data para almacenamiento persistente
const getDatabasePath = () => {
  // Si estamos en Railway (producción), usar la carpeta /data para persistencia
  if (process.env.RAILWAY_ENVIRONMENT) {
    return process.env.DATABASE_PATH || '/data/database.sqlite';
  }
  // En desarrollo, usar la ruta local
  return process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');
};

// Database configuration options
export const dbConfig = {
  type: 'sqlite' as const,
  database: getDatabasePath(),
  entities: [
    User,
    Company,
    Customer,
    Product,
    Invoice,
    InvoiceItem,
    TaxRate,
    Certificate,
    Vendor
  ],
  synchronize: true, // ADVERTENCIA: Esto puede causar pérdida de datos en producción // Set to false in production
  logging: process.env.NODE_ENV === 'development',
};

// Create and export the DataSource instance
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: getDatabasePath(),
  entities: [
    User,
    Company,
    Customer,
    Product,
    Invoice,
    InvoiceItem,
    TaxRate,
    Certificate,
    Vendor
  ],
  synchronize: true, // ADVERTENCIA: Esto puede causar pérdida de datos en producción
  logging: false
});

// Export entity list for use in other parts of the application
export const entities = [
  User,
  Company,
  Customer,
  Product,
  Invoice,
  InvoiceItem,
  TaxRate,
  Certificate,
  Vendor
];
