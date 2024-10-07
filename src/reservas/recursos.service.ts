import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recurso } from './recursos.entity';

@Injectable()
export class RecursosService {
  constructor(
    @InjectRepository(Recurso)
    private recursosRepository: Repository<Recurso>,
  ) {}

  async obtenerDisponibles(fecha: Date, hora: Date): Promise<Recurso[]> {
    // Implementar lógica para obtener recursos disponibles
    // Esto podría implicar verificar las reservas existentes y filtrar los recursos disponibles
    return await this.recursosRepository.find();
  }
}