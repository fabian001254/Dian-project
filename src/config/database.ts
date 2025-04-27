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

// Database configuration options
export const dbConfig = {
  type: 'sqlite' as const,
  database: process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite'),
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
  database: process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite'),
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
