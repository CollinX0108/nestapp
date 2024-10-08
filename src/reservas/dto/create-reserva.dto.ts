import { IsString, IsEmail, IsPhoneNumber, IsInt, Min, Max, IsEnum, IsISO8601 } from 'class-validator';
import { DeporteTipo } from '../reservas.entity';

export class CreateReservaDto {
  @IsString()
  nombreReservante: string;

  @IsEmail()
  correo: string;

  @IsPhoneNumber('CO')
  telefono: string;

  @IsInt()
  @Min(1)
  @Max(10)
  cantidadPersonas: number;

  @IsISO8601()
  fechaHora: string;

  @IsEnum(DeporteTipo)
  deporte: DeporteTipo;
}