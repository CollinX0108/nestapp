import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../users/role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const adminUser: CreateUserDto = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'adminpassword123',
    role: Role.ADMIN
  };

  try {
    //const result = await authService.register(adminUser, Role.ADMIN);
    //console.log('Admin user created successfully:', result);
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
  }

  await app.close();
}

bootstrap();