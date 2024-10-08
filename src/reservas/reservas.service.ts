import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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
    const usuario = await this.usersRepository.findOne({ where: { id: user.userId } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si hay conflictos de horario
    const conflicto = await this.verificarConflictoHorario(new Date(createReservaDto.fechaHora));
    if (conflicto) {
      throw new ConflictException('Ya existe una reserva en ese horario');
    }

    const reserva = this.reservasRepository.create(createReservaDto);
    reserva.usuario = usuario;
    return this.reservasRepository.save(reserva);
  }

  async findAll(): Promise<Reserva[]> {
    return this.reservasRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: number): Promise<Reserva> {
    const reserva = await this.reservasRepository.findOne({ where: { id }, relations: ['usuario'] });
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
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

  private async verificarConflictoHorario(fechaHora: Date): Promise<boolean> {
    const fechaInicio = new Date(fechaHora);
    const fechaFin = new Date(fechaHora);
    fechaFin.setHours(fechaFin.getHours() + 2);

    const reservasConflicto = await this.reservasRepository.find({
      where: {
        fechaHora: Between(fechaInicio, fechaFin)
      }
    });

    return reservasConflicto.length > 0;
  }
}