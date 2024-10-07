import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-db')
  async testDB() {
    try {
      // Aquí deberías hacer una consulta simple a la base de datos
      return { message: 'Conexión a la base de datos exitosa' };
    } catch (error) {
      return { message: 'Error de conexión a la base de datos', error: error.message };
    }
  }
}