import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CriarUsuarioDto } from './criar-usuario.dto';

// no PATCH o perfil pode não vir; quem decide se loja e cargo valem é o perfil gravado, no service
export class AtualizarUsuarioDto extends PartialType(OmitType(CriarUsuarioDto, ['lojaId', 'cargo'])) {
  @IsOptional()
  @IsInt()
  @Min(1)
  lojaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cargo?: string;
}
