import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Invoice } from './Invoice';
import { Certificate } from './Certificate';

@Entity('companies')
export class Company extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ length: 20, unique: true })
  nit: string;

  @Column({ length: 1, default: '2' })
  dv: string; // Dígito de verificación

  @Column({ length: 150 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  department: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 200, nullable: true })
  website: string;

  @Column({ length: 50, nullable: true })
  economicActivity: string;

  @Column({ length: 50, nullable: true })
  taxRegime: string;

  @Column({ default: false })
  isAuthorized: boolean;

  @Column({ nullable: true })
  authorizationDate: Date;

  @Column({ nullable: true })
  authorizationNumber: string;

  @Column({ nullable: true })
  authorizationPrefix: string;

  @Column({ nullable: true })
  authorizationRangeFrom: number;

  @Column({ nullable: true })
  authorizationRangeTo: number;

  @Column({ length: 200, nullable: true })
  logo: string;

  @Column({ length: 150, nullable: true })
  legalRepresentative: string;

  @Column({ length: 20, nullable: true })
  legalRepresentativeId: string;

  @OneToMany(() => User, user => user.company)
  users: User[];

  @OneToMany(() => Invoice, invoice => invoice.company)
  invoices: Invoice[];

  @OneToMany(() => Certificate, certificate => certificate.company)
  certificates: Certificate[];
}
