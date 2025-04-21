import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Company } from './Company';
import { Customer } from './Customer';
import { InvoiceItem } from './InvoiceItem';
import { User } from './User';

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum InvoiceType {
  FACTURA_VENTA = 'factura-venta',
  NOTA_CREDITO = 'nota-credito',
  NOTA_DEBITO = 'nota-debito'
}

export enum PaymentMethod {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  TARJETA_CREDITO = 'tarjeta-credito',
  TARJETA_DEBITO = 'tarjeta-debito',
  CHEQUE = 'cheque',
  OTRO = 'otro'
}

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ length: 20 })
  number: string;

  @Column({ length: 10, nullable: true })
  prefix: string;

  @Column({
    type: 'simple-enum',
    enum: InvoiceType,
    default: InvoiceType.FACTURA_VENTA
  })
  type: InvoiceType;

  @Column({
    type: 'simple-enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT
  })
  status: InvoiceStatus;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'simple-enum',
    enum: PaymentMethod,
    default: PaymentMethod.EFECTIVO
  })
  paymentMethod: PaymentMethod;

  @Column({ length: 100, nullable: true })
  paymentReference: string;

  @Column({ nullable: true })
  paidDate: Date;

  @Column({ length: 100, nullable: true })
  cufe: string;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ nullable: true })
  xmlPath: string;

  @Column({ nullable: true })
  pdfPath: string;

  @Column({ nullable: true })
  sentToCustomerAt: Date;

  @Column({ nullable: true })
  sentToDianAt: Date;

  @Column({ nullable: true })
  dianResponseAt: Date;

  @Column({ type: 'text', nullable: true })
  dianResponse: string;

  // Vendedor asociado
  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendorId' })
  vendor: User;

  @Column()
  vendorId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  companyId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column()
  customerId: string;

  @OneToMany(() => InvoiceItem, item => item.invoice)
  items: InvoiceItem[];
}
