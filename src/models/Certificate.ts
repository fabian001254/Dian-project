import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Company } from './Company';

export enum CertificateStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

@Entity('certificates')
export class Certificate extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  publicKey: string;

  @Column({ type: 'text', select: false })
  privateKey: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'date' })
  validFrom: Date;

  @Column({ type: 'date' })
  validTo: Date;

  @Column({ length: 100 })
  serialNumber: string;

  @Column({ length: 200 })
  issuer: string;

  @Column({
    type: 'simple-enum',
    enum: CertificateStatus,
    default: CertificateStatus.PENDING
  })
  status: CertificateStatus;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => Company, company => company.certificates)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  companyId: string;
}
