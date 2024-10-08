import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToOne(() => User, user => user.equiposCreados)
  dueno: User;

  @ManyToMany(() => User, user => user.equipos)
  @JoinTable()
  jugadores: User[];
}