import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private blacklistedTokens: Set<string> = new Set();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }
  
    // Validar la contraseña
    if (createUserDto.password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }
  
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  
    // Crear el nuevo usuario
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  
    // Generar token JWT
    const payload = { username: newUser.username, sub: newUser.id };
    const accessToken = this.jwtService.sign(payload);
  
    return {
      message: 'Usuario registrado exitosamente',
      accessToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      access_token: accessToken,
    };
  }

  async logout(token: string) {
    this.blacklistedTokens.add(token);
    return { message: 'Logout exitoso' };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (this.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token no válido');
      }
      return this.usersService.findOne(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Token no válido');
    }
  }
}