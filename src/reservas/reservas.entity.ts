import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';

export enum DeporteTipo {
  FUTBOLITO = 'futbolito',
  PINGPONG = 'pingpong',
  VOLLEYBALL = 'volleyball',
  FUTBOL = 'futbol',
  TENNIS = 'tennis',
  BASKETBALL = 'basketball'
}

@Entity()
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombreReservante: string;

  @Column()
  correo: string;

  @Column()
  telefono: string;

  @Column()
  cantidadPersonas: number;

  @Column({ type: 'timestamp' })
  fechaHora: Date;

  @Column({
    type: 'enum',
    enum: DeporteTipo,
  })
  deporte: DeporteTipo;

  @ManyToOne(() => User, user => user.reservas)
  usuario: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}