import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Company } from './Company';
import { Invoice } from './Invoice';
import { User } from './User';

@Entity('vendors')
export class Vendor extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ length: 150, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Relación al usuario que es vendedor para usar su identificación
  @Column({ nullable: true, default: null })
  userId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Invoice, invoice => invoice.customer)
  invoices: Invoice[];
}
