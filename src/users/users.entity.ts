import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';
import { Reserva } from '../reservas/reservas.entity';
import { Role } from './role.enum';
import { Equipo } from '../equipos/equipo.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.JUGADOR
  })
  role: Role;

  @OneToMany(() => Reserva, reserva => reserva.usuario)
  reservas: Reserva[];

  @OneToMany(() => Equipo, equipo => equipo.dueno)
  equiposCreados: Equipo[];

  @ManyToMany(() => Equipo, equipo => equipo.jugadores)
  equipos: Equipo[];
}