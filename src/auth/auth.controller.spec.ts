import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const loginDto = { username: 'test', password: 'password' };
      await controller.login(loginDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const createUserDto = { username: 'test', password: 'password', email: 'test@example.com' };
      await controller.register(createUserDto);
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const req = {
        headers: {
          authorization: 'Bearer test-token'
        }
      } as unknown as Request;
      await controller.logout(req);
      expect(authService.logout).toHaveBeenCalledWith('test-token');
    });
  });
});