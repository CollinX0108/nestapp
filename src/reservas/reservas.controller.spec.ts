import { Test, TestingModule } from '@nestjs/testing';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { DeporteTipo } from './reservas.entity';

describe('ReservasController', () => {
  let controller: ReservasController;
  let service: ReservasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [
        {
          provide: ReservasService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReservasController>(ReservasController);
    service = module.get<ReservasService>(ReservasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call reservasService.create', async () => {
      const createReservaDto: CreateReservaDto = {
        nombreReservante: 'Test User',
        correo: 'test@example.com',
        telefono: '+573001234567',
        cantidadPersonas: 5,
        fechaHora: new Date('2023-05-01T10:00:00Z').toISOString(),
        deporte: DeporteTipo.FUTBOL,
      };
      const req = { user: { userId: 1 } };
      await controller.create(createReservaDto, req);
      expect(service.create).toHaveBeenCalledWith(createReservaDto, req.user);
    });
  });

  describe('findAll', () => {
    it('should call reservasService.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call reservasService.findOne', async () => {
      await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call reservasService.update', async () => {
      const updateReservaDto: UpdateReservaDto = {
        nombreReservante: 'Test User',
        correo: 'test@example.com',
        telefono: '+573001234567',
        cantidadPersonas: 5,
        fechaHora: new Date('2023-05-01T10:00:00Z').toISOString(),
        deporte: DeporteTipo.FUTBOL,
      };
      const req = { user: { userId: 1 } };
      await controller.update('1', updateReservaDto, req);
      expect(service.update).toHaveBeenCalledWith(1, updateReservaDto, req.user);
    });
  });

  describe('remove', () => {
    it('should call reservasService.remove', async () => {
      const req = { user: { userId: 1 } };
      await controller.remove('1', req);
      expect(service.remove).toHaveBeenCalledWith(1, req.user);
    });
  });
});