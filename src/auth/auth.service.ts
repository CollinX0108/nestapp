import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../users/role.enum';
import * as bcrypt from 'bcrypt';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  private blacklistedTokens: Set<string> = new Set();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async registerAdmin(createUserDto: CreateUserDto, creatorId: number) {
    console.log('Iniciando registro de administrador');
    console.log(`ID del creador: ${creatorId}`);
    
    // Verificar si el creador existe y es un administrador
    const creator = await this.usersService.findOne(creatorId);
    if (!creator) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    console.log(`Rol del usuario que intenta crear el administrador: ${creator.role}`);
    console.log(`Tipo de creator.role: ${typeof creator.role}`);
    console.log(`Valor de Role.ADMIN: ${Role.ADMIN}`);
    console.log(`Tipo de Role.ADMIN: ${typeof Role.ADMIN}`);
    
    // Comparación case-insensitive
    if (creator.role.toLowerCase() == Role.ADMIN.toLowerCase()) {
      console.log('El usuario que intenta crear el administrador es un administrador');
    } else if (creator.role.toLowerCase() !== Role.JUGADOR.toLowerCase()) {
      console.log('El usuario que intenta crear el administrador no es un administrador');
      throw new UnauthorizedException('Solo los administradores pueden crear otros administradores7');
    }

    // Verificar si el email ya está registrado
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Asignar el rol de administrador
    createUserDto.role = Role.ADMIN;

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear el nuevo usuario administrador
    const newUser = await this.usersService.createAdmin(createUserDto);

    const payload = { username: newUser.username, sub: newUser.id, role: newUser.role };
    console.log('Register Admin Payload:', payload);
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Administrador registrado exitosamente',
      accessToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async register(createUserDto: CreateUserDto, creatorId?: number) {
    console.log('Iniciando registro de usuario');
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      console.log('Email ya registrado');
      throw new ConflictException('El email ya está registrado');
    }

    if (!createUserDto.role) {
      createUserDto.role = Role.JUGADOR;
    }

    if (createUserDto.role === Role.ADMIN) {
      if (!creatorId) {
        console.log('Intento de crear admin sin creatorId');
        throw new BadRequestException('Se requiere autenticación para crear un administrador');
      }
      const creator = await this.usersService.findOne(creatorId);
      if (creator.role !== Role.ADMIN) {
        console.log('Intento de crear admin por un no-admin');
        throw new BadRequestException('Solo los administradores pueden crear otros administradores7');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.usersService.create({...createUserDto});

    const payload = { username: newUser.username, sub: newUser.id, role: newUser.role };
    console.log('Register Payload:', payload);
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Usuario registrado exitosamente',
      accessToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    console.log('Validando usuario:', username);
    const user = await this.usersService.findOneByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      console.log('Usuario validado exitosamente');
      const { password, ...result } = user;
      return result;
    }
    console.log('Validación de usuario fallida');
    return null;
  }

  async login(loginDto: LoginDto) {
    console.log('Iniciando login para usuario:', loginDto.username);
    const user = await this.usersService.findOneByUsername(loginDto.username);
    console.log('Usuario encontrado:', user);
    
    if (!user) {
      console.log('Usuario no encontrado');
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    console.log('Comparando contraseñas');
    console.log('Contraseña proporcionada:', loginDto.password);
    console.log('Hash almacenado:', user.password);
    
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    console.log('¿Contraseña válida?', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Contraseña inválida');
      throw new UnauthorizedException('Credenciales inválidas7');
    }
    
    const payload = { username: user.username, sub: user.id, role: user.role };
    console.log('Login Payload:', payload);
    
    const accessToken = this.jwtService.sign(payload);
    console.log('Token generado exitosamente');
    
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(token: string) {
    console.log('Cerrando sesión, token añadido a la lista negra');
    this.tokenBlacklistService.addToBlacklist(token);
    return { message: 'Logout exitoso' };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklistService.isBlacklisted(token);
  }
}