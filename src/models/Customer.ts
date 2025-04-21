import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Invoice } from './Invoice';

export enum CustomerType {
  NATURAL = 'natural',
  JURIDICA = 'juridica'
}

export enum IdentificationType {
  CC = 'Cédula de Ciudadanía',
  CE = 'Cédula de Extranjería',
  NIT = 'NIT',
  PASAPORTE = 'Pasaporte',
  TI = 'Tarjeta de Identidad'
}

@Entity('customers')
export class Customer extends BaseEntity {
  @Column({
    type: 'simple-enum',
    enum: CustomerType,
    default: CustomerType.NATURAL
  })
  type: CustomerType;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 150, nullable: true })
  businessName: string;

  @Column({
    type: 'simple-enum',
    enum: IdentificationType,
    default: IdentificationType.CC
  })
  identificationType: IdentificationType;

  @Column({ length: 20 })
  identificationNumber: string;

  @Column({ length: 1, nullable: true })
  dv: string; // Dígito de verificación (solo para NIT)

  @Column({ length: 150 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  department: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 50, nullable: true })
  taxRegime: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Invoice, invoice => invoice.customer)
  invoices: Invoice[];
}
