import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './reservas.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { User } from '../users/users.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private reservasRepository: Repository<Reserva>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createReservaDto: CreateReservaDto, user: any): Promise<Reserva> {
    const reserva = this.reservasRepository.create(createReservaDto);
    const userEntity = await this.usersRepository.findOne({ where: { id: user.userId } });
    if (!userEntity) {
      throw new Error('Usuario no encontrado');
    }
    reserva.usuario = userEntity;
    return this.reservasRepository.save(reserva);
  }

  async findAll(): Promise<Reserva[]> {
    // Devuelve todas las reservas, independientemente del usuario
    return this.reservasRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: number): Promise<Reserva> {
    const reserva = await this.reservasRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    return reserva;
  }

  async update(id: number, updateReservaDto: UpdateReservaDto, user: any): Promise<Reserva> {
    const reserva = await this.findOne(id);
    
    if (user.role !== 'admin' && reserva.usuario.id !== user.userId) {
      throw new ForbiddenException('No tienes permiso para editar esta reserva');
    }
    
    Object.assign(reserva, updateReservaDto);
    return this.reservasRepository.save(reserva);
  }

  async remove(id: number, user: any): Promise<void> {
    const reserva = await this.findOne(id);
    
    if (user.role !== 'admin' && reserva.usuario.id !== user.userId) {
      throw new ForbiddenException('No tienes permiso para cancelar esta reserva');
    }
    
    await this.reservasRepository.remove(reserva);
  }
}