import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import type { Perfil } from '../usuario.types';

@ValidatorConstraint({ name: 'soParaFuncionario' })
class SoParaFuncionario implements ValidatorConstraintInterface {
  validate(valor: unknown, { object }: ValidationArguments) {
    return valor === undefined || (object as CriarUsuarioDto).perfil === 'FUNCIONARIO';
  }

  defaultMessage({ property }: ValidationArguments) {
    return `${property} é só para funcionário`;
  }
}

export class CriarUsuarioDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
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

  @IsIn(['ADMIN', 'CLIENTE', 'FUNCIONARIO'])
  perfil: Perfil;

  @ValidateIf((dto: CriarUsuarioDto) => dto.perfil === 'FUNCIONARIO' || dto.lojaId !== undefined)
  @Validate(SoParaFuncionario)
  @IsDefined({ message: 'Informe a loja do funcionário' })
  @IsInt()
  @Min(1)
  lojaId?: number;

  @IsOptional()
  @Validate(SoParaFuncionario)
  @IsString()
  @MaxLength(20)
  cargo?: string;
}
