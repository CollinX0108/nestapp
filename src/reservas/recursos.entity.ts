import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Recurso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  tipo: string;

  @Column({ default: true })
  disponible: boolean;
}