import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import type { Perfil } from '../usuario.types';

export class AtualizarUsuarioDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'cpf deve ter 11 números' })
  cpf?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  senha?: string;

  @IsOptional()
  @IsIn(['ADMIN', 'CLIENTE', 'FUNCIONARIO'])
  perfil?: Perfil;
}
