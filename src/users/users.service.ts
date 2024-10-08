import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto, creatorRole?: Role): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ 
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email }
      ] 
    });
    if (existingUser) {
      throw new ConflictException('El nombre de usuario o email ya existe');
    }

    if (createUserDto.role === Role.ADMIN && creatorRole !== Role.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden crear otros administradores');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || Role.JUGADOR,
    });

    return this.usersRepository.save(newUser);
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ 
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email }
      ] 
    });
    if (existingUser) {
      throw new ConflictException('El nombre de usuario o email ya existe');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: Role.ADMIN,
    });

    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    console.log(`UsersService - Buscando usuario con ID: ${id}`);
    const user = await this.usersRepository.findOne({ where: { id } });
    console.log('UsersService - Usuario encontrado:', user);
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  } 

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    console.log(`Buscando usuario con username: ${username}`);
    const user = await this.usersRepository.findOne({ where: { username } });
    console.log('Usuario encontrado:', user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }
}