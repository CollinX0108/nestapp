import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/users.entity';
import { Role } from '../users/role.enum';
import { TokenBlacklistService } from './token-blacklist.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let tokenBlacklistService: TokenBlacklistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByUsername: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            isBlacklisted: jest.fn(),
            addToBlacklist: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user object when credentials are valid', async () => {
      const user: User = { 
        id: 1, 
        username: 'testuser', 
        password: await bcrypt.hash('testpass', 10),
        email: 'test@example.com',
        role: Role.JUGADOR,
        reservas: [],
        equiposCreados: [],
        equipos: []
      };
      jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(user);
      
      const result = await service.validateUser('testuser', 'testpass');
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: Role.JUGADOR,
        reservas: [],
        equiposCreados: [],
        equipos: []
      });
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(null);
      
      const result = await service.validateUser('testuser', 'testpass');
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const user: User = { 
        id: 1, 
        username: 'testuser', 
        password: await bcrypt.hash('testpass', 10),
        email: 'test@example.com',
        role: Role.JUGADOR,
        reservas: [],
        equiposCreados: [],
        equipos: []
      };
      jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(user);
      
      const result = await service.validateUser('testuser', 'wrongpass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token when credentials are valid', async () => {
      const user: User = { 
        id: 1, 
        username: 'testuser', 
        password: await bcrypt.hash('testpass', 10),
        email: 'test@example.com',
        role: Role.JUGADOR,
        reservas: [],
        equiposCreados: [],
        equipos: []
      };
      jest.spyOn(usersService, 'findOneByUsername').mockResolvedValue(user);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test-token');
      
      const result = await service.login({ username: 'testuser', password: 'testpass' });
      expect(result.access_token).toBe('test-token');
      expect(result.user).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: Role.JUGADOR
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return access token', async () => {
      const createUserDto = {
        username: 'newuser',
        password: 'newpass',
        email: 'newuser@example.com',
      };
      const newUser: User = { 
        id: 2, 
        ...createUserDto, 
        role: Role.JUGADOR,
        password: await bcrypt.hash('newpass', 10),
        reservas: [],
        equiposCreados: [],
        equipos: []
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(newUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new-token');
      
      const result = await service.register(createUserDto);
      expect(result.accessToken).toBe('new-token');
      expect(result.user).toEqual({
        id: 2,
        username: 'newuser',
        email: 'newuser@example.com',
        role: Role.JUGADOR
      });
    });
  });
});