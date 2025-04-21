import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Company } from './Company';

export enum TaxType {
  IVA = 'IVA',
  RETENCION = 'RETENCION',
  IMPOCONSUMO = 'IMPOCONSUMO'
}

@Entity('tax_rates')
export class TaxRate extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'simple-enum',
    enum: TaxType,
    default: TaxType.IVA
  })
  type: TaxType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rate: number;

  @Column({ length: 10 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  companyId: string;
}
