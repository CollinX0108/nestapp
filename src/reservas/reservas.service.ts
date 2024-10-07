import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
  ) {}

  async create(createReservaDto: CreateReservaDto, user: User): Promise<Reserva> {
    const reserva = this.reservasRepository.create({
      ...createReservaDto,
      usuario: user,
    });
    return this.reservasRepository.save(reserva);
  }

  async findAll(): Promise<Reserva[]> {
    return this.reservasRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: number): Promise<Reserva> {
    const reserva = await this.reservasRepository.findOne({ where: { id }, relations: ['usuario'] });
    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }
    return reserva;
  }

  async update(id: number, updateReservaDto: UpdateReservaDto, user: User): Promise<Reserva> {
    const reserva = await this.findOne(id);
    if (reserva.usuario.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para editar esta reserva');
    }
    Object.assign(reserva, updateReservaDto);
    return this.reservasRepository.save(reserva);
  }

  async remove(id: number, user: User): Promise<void> {
    const reserva = await this.findOne(id);
    if (reserva.usuario.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para cancelar esta reserva');
    }
    await this.reservasRepository.remove(reserva);
  }
}