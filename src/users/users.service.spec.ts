import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { Role } from './role.enum';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      const newUser = { id: 1, ...createUserDto, role: Role.JUGADOR };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser as User);

      const result = await service.create(createUserDto);
      expect(result).toEqual(newUser);
    });

    it('should throw ConflictException if username already exists', async () => {
      const createUserDto = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({ id: 1 } as User);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: 1, username: 'user1', email: 'user1@example.com', role: Role.JUGADOR },
        { id: 2, username: 'user2', email: 'user2@example.com', role: Role.JUGADOR },
      ];
      jest.spyOn(userRepository, 'find').mockResolvedValue(users as User[]);

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, username: 'testuser', email: 'test@example.com', role: Role.JUGADOR };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);

      const result = await service.findOne(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, username: 'testuser', email: 'test@example.com', role: Role.JUGADOR };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);

      const result = await service.findOneByUsername('testuser');
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findOneByUsername('nonexistentuser');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = { username: 'updateduser' };
      const existingUser = { id: 1, username: 'testuser', email: 'test@example.com', role: Role.JUGADOR };
      const updatedUser = { ...existingUser, ...updateUserDto };
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as User);

      const result = await service.update(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update(1, { username: 'updateduser' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user = { id: 1, username: 'testuser', email: 'test@example.com', role: Role.JUGADOR };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(user as User);

      const result = await service.remove(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});