import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegistrarDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'cpf deve ter 11 números' })
  cpf?: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsString()
  @MinLength(8)
  senha: string;
}
