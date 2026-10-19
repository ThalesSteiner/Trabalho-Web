import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { Perfil } from '../usuario.types';

export class ListarUsuariosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsIn(['ADMIN', 'CLIENTE', 'FUNCIONARIO'])
  perfil?: Perfil;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lojaId?: number;
}
