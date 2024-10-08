import { Test, TestingModule } from '@nestjs/testing';
import { EquiposService } from './equipos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo } from './equipo.entity';
import { User } from '../users/users.entity';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('EquiposService', () => {
  let service: EquiposService;
  let equipoRepository: Repository<Equipo>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquiposService,
        {
          provide: getRepositoryToken(Equipo),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<EquiposService>(EquiposService);
    equipoRepository = module.get<Repository<Equipo>>(getRepositoryToken(Equipo));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new equipo', async () => {
      const createEquipoDto: CreateEquipoDto = { nombre: 'Equipo Test' };
      const userId = 1;
      const user = { id: userId, equiposCreados: [], equipos: [] } as User;
      const newEquipo = { id: 1, ...createEquipoDto, dueno: user, jugadores: [user] } as Equipo;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(equipoRepository, 'create').mockReturnValue(newEquipo);
      jest.spyOn(equipoRepository, 'save').mockResolvedValue(newEquipo);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await service.create(createEquipoDto, userId);

      expect(result).toEqual(expect.objectContaining({
        id: newEquipo.id,
        nombre: newEquipo.nombre,
        dueno: expect.objectContaining({ id: user.id }),
        jugadores: expect.arrayContaining([expect.objectContaining({ id: user.id })])
      }));
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create({ nombre: 'Equipo Test' }, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user already has a team', async () => {
      const user = { id: 1, equiposCreados: [{}], equipos: [] } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.create({ nombre: 'Equipo Test' }, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return an array of equipos', async () => {
      const equipos = [
        { id: 1, nombre: 'Equipo 1', dueno: { id: 1 }, jugadores: [{ id: 1 }] },
        { id: 2, nombre: 'Equipo 2', dueno: { id: 2 }, jugadores: [{ id: 2 }] },
      ] as Equipo[];

      jest.spyOn(equipoRepository, 'find').mockResolvedValue(equipos);

      const result = await service.findAll();

      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 1, nombre: 'Equipo 1' }),
        expect.objectContaining({ id: 2, nombre: 'Equipo 2' }),
      ]));
    });
  });

  describe('findOne', () => {
    it('should return a single equipo', async () => {
      const equipo = { id: 1, nombre: 'Equipo 1', dueno: { id: 1 }, jugadores: [{ id: 1 }] } as Equipo;

      jest.spyOn(equipoRepository, 'findOne').mockResolvedValue(equipo);

      const result = await service.findOne(1);

      expect(result).toEqual(expect.objectContaining({
        id: 1,
        nombre: 'Equipo 1',
        dueno: expect.objectContaining({ id: 1 }),
        jugadores: expect.arrayContaining([expect.objectContaining({ id: 1 })])
      }));
    });

    it('should throw NotFoundException if equipo is not found', async () => {
      jest.spyOn(equipoRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addJugador', () => {
    it('should add a jugador to the equipo', async () => {
      const equipo = { id: 1, nombre: 'Equipo 1', dueno: { id: 1 }, jugadores: [] } as Equipo;
      const jugador = { id: 2, equipos: [] } as User;
      const user = { id: 1, role: 'admin' } as User;

      jest.spyOn(equipoRepository, 'findOne').mockResolvedValue(equipo);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user).mockResolvedValueOnce(jugador);
      jest.spyOn(userRepository, 'save').mockResolvedValue(jugador);
      jest.spyOn(equipoRepository, 'save').mockResolvedValue({ ...equipo, jugadores: [jugador] } as Equipo);

      const result = await service.addJugador(1, 2, 1);

      expect(result).toEqual(expect.objectContaining({
        id: 1,
        nombre: 'Equipo 1',
        jugadores: expect.arrayContaining([expect.objectContaining({ id: 2 })])
      }));
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const equipo = { id: 1, nombre: 'Equipo 1', dueno: { id: 2 }, jugadores: [] } as Equipo;
      const user = { id: 1, role: 'jugador' } as User;

      jest.spyOn(equipoRepository, 'findOne').mockResolvedValue(equipo);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.addJugador(1, 3, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeJugador', () => {
    it('should remove a jugador from the equipo', async () => {
      const jugador = { id: 2, equipos: [{ id: 1 }] } as User;
      const equipo = { id: 1, nombre: 'Equipo 1', dueno: { id: 1 }, jugadores: [jugador] } as Equipo;
      const user = { id: 1, role: 'admin' } as User;

      jest.spyOn(equipoRepository, 'findOne').mockResolvedValue(equipo);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user).mockResolvedValueOnce(jugador);
      jest.spyOn(userRepository, 'save').mockResolvedValue(jugador);
      jest.spyOn(equipoRepository, 'save').mockResolvedValue({ ...equipo, jugadores: [] } as Equipo);

      const result = await service.removeJugador(1, 2, 1);

      expect(result).toEqual(expect.objectContaining({
        id: 1,
        nombre: 'Equipo 1',
        jugadores: expect.arrayContaining([])
      }));
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const equipo = { id: 1, nombre: 'Equipo 1', dueno: { id: 2 }, jugadores: [] } as Equipo;
      const user = { id: 1, role: 'jugador' } as User;

      jest.spyOn(equipoRepository, 'findOne').mockResolvedValue(equipo);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.removeJugador(1, 3, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove an equipo', async () => {
      const equipo = { 
        id: 1, 
        nombre: 'Equipo 1', 
        dueno: { id: 1, equiposCreados: [{ id: 1 }] }, 
        jugadores: [{ id: 2, equipos: [{ id: 1 }] }] 
      } as unknown as Equipo;
      const user = { id: 1, role: 'admin' } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(equipoRepository, 'findOne').mockResolvedValue(equipo);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(equipo.jugadores[0] as User);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(equipo.dueno as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({} as User);
      jest.spyOn(equipoRepository, 'remove').mockResolvedValue(equipo);

      const result = await service.remove(1, 1);

      expect(result).toEqual({ message: 'Equipo eliminado exitosamente' });
    });

    it('should throw ForbiddenException if user is not an admin', async () => {
      const user = { id: 1, role: 'jugador' } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});