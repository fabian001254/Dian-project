// Declaraciones globales para TypeScript
declare var __dirname: string;
declare var __filename: string;

// Declaraciones de módulos
declare module 'typeorm' {
  export interface ConnectionOptions {
    type: string;
    database: string;
    entities: any[];
    synchronize: boolean;
    logging: boolean;
  }
  
  export function createConnection(options: ConnectionOptions): Promise<any>;
  export function getConnection(): any;
  
  export class BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
  }
  
  export function Entity(name?: string): ClassDecorator;
  export function PrimaryGeneratedColumn(type?: string): PropertyDecorator;
  export function Column(options?: any): PropertyDecorator;
  export function CreateDateColumn(): PropertyDecorator;
  export function UpdateDateColumn(): PropertyDecorator;
  export function DeleteDateColumn(): PropertyDecorator;
  export function ManyToOne(type: () => any, inverseSide?: (obj: any) => any): PropertyDecorator;
  export function OneToMany(type: () => any, inverseSide?: (obj: any) => any): PropertyDecorator;
  export function JoinColumn(options?: any): PropertyDecorator;
  export function ManyToMany(type: () => any): PropertyDecorator;
  export function JoinTable(options?: any): PropertyDecorator;
}

declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

// Extender la interfaz Request para incluir el usuario autenticado
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User & { companyId?: string };
    }
  }
}
