import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '../users/role.enum';

@ApiTags('equipos')
@ApiBearerAuth()
@Controller('equipos')
@UseGuards(JwtAuthGuard)
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Post('create')
  @ApiOperation({ summary: 'Crear un nuevo equipo' })
  @ApiResponse({ status: 201, description: 'Equipo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Usuario ya tiene un equipo' })
  create(@Body() createEquipoDto: CreateEquipoDto, @Request() req) {
    return this.equiposService.create(createEquipoDto, req.user.userId);
  }

  @Get('list')
  @ApiOperation({ summary: 'Listar todos los equipos' })
  findAll() {
    return this.equiposService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar un equipo por ID' })
  findOne(@Param('id') id: string) {
    return this.equiposService.findOne(+id);
  }

  @Patch(':id/add-jugador/:jugadorId')
  @ApiOperation({ summary: 'Añadir un jugador al equipo' })
  addJugador(@Param('id') id: string, @Param('jugadorId') jugadorId: string, @Request() req) {
    return this.equiposService.addJugador(+id, +jugadorId, req.user.userId);
  }

  @Patch(':id/remove-jugador/:jugadorId')
  @ApiOperation({ summary: 'Eliminar un jugador del equipo' })
  removeJugador(@Param('id') id: string, @Param('jugadorId') jugadorId: string, @Request() req) {
    return this.equiposService.removeJugador(+id, +jugadorId, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un equipo' })
  @ApiResponse({ status: 200, description: 'Equipo eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Solo los administradores pueden eliminar equipos' })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 404, description: 'El jugador no pertenece a este equipo' })
  @ApiResponse({ status: 404, description: 'El equipo no tiene un dueño' })
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    return this.equiposService.remove(+id, req.user.userId);
  }
}
