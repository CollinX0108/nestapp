import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo } from './equipo.entity';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { User } from '../users/users.entity';

type CleanEquipo = Omit<Equipo, 'dueno' | 'jugadores'> & {
    dueno: Partial<User>;
    jugadores: Partial<User>[];
};

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo)
    private equiposRepository: Repository<Equipo>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createEquipoDto: CreateEquipoDto, userId: number): Promise<CleanEquipo> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['equiposCreados', 'equipos'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.equiposCreados.length > 0) {
      throw new ForbiddenException('Ya has creado un equipo');
    }

    if (user.equipos.length > 0) {
      throw new ForbiddenException('Ya eres parte de un equipo');
    }

    const equipo = this.equiposRepository.create({
      ...createEquipoDto,
      dueno: user,
      jugadores: [user],
    });

    await this.equiposRepository.save(equipo);

    user.equiposCreados.push(equipo);
    user.equipos.push(equipo);
    await this.usersRepository.save(user);

    return this.cleanEquipo(equipo);
  }

  async findAll(): Promise<CleanEquipo[]> {
    const equipos = await this.equiposRepository.find({ relations: ['dueno', 'jugadores'] });
    return equipos.map(equipo => this.cleanEquipo(equipo));
  }

  async findOne(id: number): Promise<CleanEquipo> {
    const equipo = await this.equiposRepository.findOne({
      where: { id },
      relations: ['dueno', 'jugadores'],
    });
    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }
    return this.cleanEquipo(equipo);
  }

  async addJugador(equipoId: number, jugadorId: number, userId: number): Promise<CleanEquipo> {
    const equipo = await this.equiposRepository.findOne({
      where: { id: equipoId },
      relations: ['dueno', 'jugadores'],
    });
    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }
  
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'role'], // Solo necesitamos el id y el rol
    });
  
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  
    // Permitir al dueño del equipo o a un administrador añadir jugadores
    if (equipo.dueno.id !== userId && user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para modificar este equipo');
    }
  
    const jugador = await this.usersRepository.findOne({ 
      where: { id: jugadorId },
      relations: ['equipos']
    });
    if (!jugador) {
      throw new NotFoundException('Jugador no encontrado');
    }
    if (jugador.equipos.length > 0) {
      throw new ForbiddenException('El jugador ya pertenece a un equipo');
    }
    equipo.jugadores.push(jugador);
    jugador.equipos.push(equipo);
    await this.usersRepository.save(jugador);
    await this.equiposRepository.save(equipo);
    return this.cleanEquipo(equipo);
  }

  async removeJugador(equipoId: number, jugadorId: number, userId: number): Promise<CleanEquipo> {
    const equipo = await this.equiposRepository.findOne({
      where: { id: equipoId },
      relations: ['dueno', 'jugadores'],
    });
    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }
  
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'role'],
    });
  
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  
    // Permitir al dueño del equipo o a un administrador eliminar jugadores
    if (equipo.dueno.id !== userId && user.role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para modificar este equipo');
    }
  
    const jugadorIndex = equipo.jugadores.findIndex(j => j.id === jugadorId);
    if (jugadorIndex === -1) {
      throw new NotFoundException('El jugador no pertenece a este equipo');
    }
  
    equipo.jugadores.splice(jugadorIndex, 1);
  
    const jugador = await this.usersRepository.findOne({ 
      where: { id: jugadorId },
      relations: ['equipos']
    });
    if (jugador) {
      jugador.equipos = jugador.equipos.filter(e => e.id !== equipoId);
      await this.usersRepository.save(jugador);
    }
  
    await this.equiposRepository.save(equipo);
    return this.cleanEquipo(equipo);
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'role'],
    });
  
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
  
    if (user.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden eliminar equipos');
    }
  
    const equipo = await this.equiposRepository.findOne({
      where: { id },
      relations: ['dueno', 'jugadores'],
    });
  
    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }
  
    // Eliminar las referencias del equipo en los jugadores
    if (equipo.jugadores && equipo.jugadores.length > 0) {
      for (const jugador of equipo.jugadores) {
        const jugadorCompleto = await this.usersRepository.findOne({
          where: { id: jugador.id },
          relations: ['equipos'],
        });
        if (jugadorCompleto && jugadorCompleto.equipos) {
          jugadorCompleto.equipos = jugadorCompleto.equipos.filter(e => e.id !== id);
          await this.usersRepository.save(jugadorCompleto);
        }
      }
    }
  
    // Eliminar la referencia del equipo en el dueño
    if (equipo.dueno) {
      const dueno = await this.usersRepository.findOne({
        where: { id: equipo.dueno.id },
        relations: ['equiposCreados'],
      });
      if (dueno && dueno.equiposCreados) {
        dueno.equiposCreados = dueno.equiposCreados.filter(e => e.id !== id);
        await this.usersRepository.save(dueno);
      }
    }
  
    await this.equiposRepository.remove(equipo);
  
    return { message: 'Equipo eliminado exitosamente' };
  }

  private cleanEquipo(equipo: Equipo): CleanEquipo {
    const { dueno, jugadores, ...rest } = equipo;
    return {
      ...rest,
      dueno: this.cleanUser(dueno),
      jugadores: jugadores.map(jugador => this.cleanUser(jugador))
    };
  }

  private cleanUser(user: User): Partial<User> {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }
}