import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('reservas')
@ApiBearerAuth()
@Controller('reservas')
@UseGuards(JwtAuthGuard)  // Esto asegura que se requiera token para todos los endpoints
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post('crear')
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  create(@Body() createReservaDto: CreateReservaDto, @Request() req) {
    return this.reservasService.create(createReservaDto, req.user);
  }

  @Get('listar')
  @ApiOperation({ summary: 'Listar todas las reservas' })
  findAll() {
    return this.reservasService.findAll();
  }

  @Get('buscar/:id')
  @ApiOperation({ summary: 'Buscar una reserva por ID' })
  findOne(@Param('id') id: string) {
    return this.reservasService.findOne(+id);
  }

  @Patch('editar/:id')
  @ApiOperation({ summary: 'Editar una reserva' })
  update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto, @Request() req) {
    return this.reservasService.update(+id, updateReservaDto, req.user);
  }

  @Delete('cancelar/:id')
  @ApiOperation({ summary: 'Cancelar una reserva' })
  remove(@Param('id') id: string, @Request() req) {
    return this.reservasService.remove(+id, req.user);
  }

  @Get('mis-reservas')
  @ApiOperation({ summary: 'Obtener las reservas del usuario autenticado' })
  getMisReservas(@Request() req) {
    return this.reservasService.getMisReservas(req.user.userId);
  }
}