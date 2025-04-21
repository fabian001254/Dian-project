import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Company } from './Company';
import { TaxRate } from './TaxRate';
import { Customer } from './Customer';
import { User } from './User';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ length: 100 })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ length: 50 })
  unit: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  companyId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendorId' })
  vendor: User;

  @Column({ nullable: true })
  vendorId: string;

  @Column({ nullable: true })
  taxRateId: string;

  @Column({ nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToMany(() => TaxRate)
  @JoinTable({
    name: 'product_tax_rates',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'taxRateId', referencedColumnName: 'id' }
  })
  taxRates: TaxRate[];
}
