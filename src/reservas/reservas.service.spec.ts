import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from './reservas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reserva, DeporteTipo } from './reservas.entity';
import { Repository, Between } from 'typeorm';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { User } from '../users/users.entity';

describe('ReservasService', () => {
  let service: ReservasService;
  let reservaRepository: Repository<Reserva>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        {
          provide: getRepositoryToken(Reserva),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ReservasService>(ReservasService);
    reservaRepository = module.get<Repository<Reserva>>(getRepositoryToken(Reserva));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new reserva when there is no conflict', async () => {
        const createReservaDto: CreateReservaDto = {
          nombreReservante: 'Test User',
          correo: 'test@example.com',
          telefono: '+573001234567',
          cantidadPersonas: 5,
          fechaHora: new Date('2023-05-01T10:00:00Z').toISOString(),
          deporte: DeporteTipo.FUTBOL,
        };
        const user = { userId: 1, username: 'testuser', role: 'jugador' };
        const userEntity = { id: 1, username: 'testuser' } as User;
        const newReserva = {
          id: 1,
          ...createReservaDto,
          fechaHora: new Date(createReservaDto.fechaHora), // Convertir string a Date
          usuario: userEntity,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Reserva;
    
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntity);
        jest.spyOn(reservaRepository, 'find').mockResolvedValue([]); // No hay conflictos
        jest.spyOn(reservaRepository, 'create').mockReturnValue(newReserva);
        jest.spyOn(reservaRepository, 'save').mockResolvedValue(newReserva);
    
        const result = await service.create(createReservaDto, user);
        expect(result).toEqual(newReserva);
    });

    it('should throw ConflictException when there is a time conflict', async () => {
      const createReservaDto: CreateReservaDto = {
        nombreReservante: 'Test User',
        correo: 'test@example.com',
        telefono: '+573001234567',
        cantidadPersonas: 5,
        fechaHora: new Date('2023-05-01T10:00:00Z').toISOString(),
        deporte: DeporteTipo.FUTBOL,
      };
      const user = { userId: 1, username: 'testuser', role: 'jugador' };
      const userEntity = { id: 1, username: 'testuser' } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntity);
      jest.spyOn(reservaRepository, 'find').mockResolvedValue([{ id: 2 } as Reserva]); // Simula una reserva existente

      await expect(service.create(createReservaDto, user)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const createReservaDto: CreateReservaDto = {
        nombreReservante: 'Test User',
        correo: 'test@example.com',
        telefono: '+573001234567',
        cantidadPersonas: 5,
        fechaHora: new Date('2023-05-01T10:00:00Z').toISOString(),
        deporte: DeporteTipo.FUTBOL,
      };
      const user = { userId: 1, username: 'testuser', role: 'jugador' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createReservaDto, user)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of reservas', async () => {
      const reservas = [
        { id: 1, nombreReservante: 'User 1', correo: 'user1@example.com', telefono: '+573001234567', cantidadPersonas: 5, fechaHora: new Date(), deporte: DeporteTipo.FUTBOL },
        { id: 2, nombreReservante: 'User 2', correo: 'user2@example.com', telefono: '+573007654321', cantidadPersonas: 3, fechaHora: new Date(), deporte: DeporteTipo.TENNIS },
      ];
      jest.spyOn(reservaRepository, 'find').mockResolvedValue(reservas as Reserva[]);

      const result = await service.findAll();
      expect(result).toEqual(reservas);
    });
  });

  describe('findOne', () => {
    it('should return a reserva if found', async () => {
      const reserva = { id: 1, nombreReservante: 'User 1', correo: 'user1@example.com', telefono: '+573001234567', cantidadPersonas: 5, fechaHora: new Date(), deporte: DeporteTipo.FUTBOL };
      jest.spyOn(reservaRepository, 'findOne').mockResolvedValue(reserva as Reserva);

      const result = await service.findOne(1);
      expect(result).toEqual(reserva);
    });

    it('should throw NotFoundException if reserva is not found', async () => {
      jest.spyOn(reservaRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a reserva', async () => {
      const updateReservaDto: UpdateReservaDto = { cantidadPersonas: 6 };
      const existingReserva = { id: 1, nombreReservante: 'User 1', correo: 'user1@example.com', telefono: '+573001234567', cantidadPersonas: 5, fechaHora: new Date(), deporte: DeporteTipo.FUTBOL, usuario: { id: 1 } };
      const updatedReserva = { ...existingReserva, ...updateReservaDto };
      const user = { userId: 1, role: 'jugador' };
      
      jest.spyOn(reservaRepository, 'findOne').mockResolvedValue(existingReserva as Reserva);
      jest.spyOn(reservaRepository, 'save').mockResolvedValue(updatedReserva as Reserva);

      const result = await service.update(1, updateReservaDto, user);
      expect(result).toEqual(updatedReserva);
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const updateReservaDto: UpdateReservaDto = { cantidadPersonas: 6 };
      const existingReserva = { id: 1, nombreReservante: 'User 1', correo: 'user1@example.com', telefono: '+573001234567', cantidadPersonas: 5, fechaHora: new Date(), deporte: DeporteTipo.FUTBOL, usuario: { id: 2 } };
      const user = { userId: 1, role: 'jugador' };

      jest.spyOn(reservaRepository, 'findOne').mockResolvedValue(existingReserva as Reserva);

      await expect(service.update(1, updateReservaDto, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a reserva', async () => {
      const reserva = { id: 1, nombreReservante: 'User 1', correo: 'user1@example.com', telefono: '+573001234567', cantidadPersonas: 5, fechaHora: new Date(), deporte: DeporteTipo.FUTBOL, usuario: { id: 1 } };
      const user = { userId: 1, role: 'jugador' };

      jest.spyOn(reservaRepository, 'findOne').mockResolvedValue(reserva as Reserva);
      jest.spyOn(reservaRepository, 'remove').mockResolvedValue(reserva as Reserva);

      await service.remove(1, user);
      expect(reservaRepository.remove).toHaveBeenCalledWith(reserva);
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const reserva = { id: 1, nombreReservante: 'User 1', correo: 'user1@example.com', telefono: '+573001234567', cantidadPersonas: 5, fechaHora: new Date(), deporte: DeporteTipo.FUTBOL, usuario: { id: 2 } };
      const user = { userId: 1, role: 'jugador' };

      jest.spyOn(reservaRepository, 'findOne').mockResolvedValue(reserva as Reserva);

      await expect(service.remove(1, user)).rejects.toThrow(ForbiddenException);
    });
  });
});