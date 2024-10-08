import { Test, TestingModule } from '@nestjs/testing';
import { EquiposController } from './equipos.controller';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';

describe('EquiposController', () => {
  let controller: EquiposController;
  let service: EquiposService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquiposController],
      providers: [
        {
          provide: EquiposService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            addJugador: jest.fn(),
            removeJugador: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EquiposController>(EquiposController);
    service = module.get<EquiposService>(EquiposService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call equiposService.create', async () => {
      const createEquipoDto: CreateEquipoDto = { nombre: 'Test Team' };
      const req = { user: { userId: 1 } };
      await controller.create(createEquipoDto, req);
      expect(service.create).toHaveBeenCalledWith(createEquipoDto, 1);
    });
  });

  describe('findAll', () => {
    it('should call equiposService.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call equiposService.findOne', async () => {
      await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('addJugador', () => {
    it('should call equiposService.addJugador', async () => {
      const req = { user: { userId: 1 } };
      await controller.addJugador('1', '2', req);
      expect(service.addJugador).toHaveBeenCalledWith(1, 2, 1);
    });
  });

  describe('removeJugador', () => {
    it('should call equiposService.removeJugador', async () => {
      const req = { user: { userId: 1 } };
      await controller.removeJugador('1', '2', req);
      expect(service.removeJugador).toHaveBeenCalledWith(1, 2, 1);
    });
  });

  describe('remove', () => {
    it('should call equiposService.remove', async () => {
      const req = { user: { userId: 1 } };
      await controller.remove('1', req);
      expect(service.remove).toHaveBeenCalledWith(1, 1);
    });
  });
});