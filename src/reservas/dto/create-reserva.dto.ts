import { IsString, IsEmail, IsPhoneNumber, IsInt, Min, Max, IsEnum, IsDateString } from 'class-validator';
import { DeporteTipo } from '../reservas.entity';

export class CreateReservaDto {
  @IsString()
  nombreReservante: string;

  @IsEmail()
  correo: string;

  @IsPhoneNumber()
  telefono: string;

  @IsInt()
  @Min(1)
  @Max(10)
  cantidadPersonas: number;

  @IsDateString()
  fechaHora: string;

  @IsEnum(DeporteTipo)
  deporte: DeporteTipo;
}