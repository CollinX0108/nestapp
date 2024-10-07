import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecursosService } from './recursos.service';

@Controller('api/recursos')
@UseGuards(JwtAuthGuard)
export class RecursosController {
  constructor(private readonly recursosService: RecursosService) {}

  @Get('disponibles')
  obtenerRecursosDisponibles(@Query('fecha') fecha: string, @Query('hora') hora: string) {
    return this.recursosService.obtenerDisponibles(new Date(fecha), new Date(hora));
  }
}