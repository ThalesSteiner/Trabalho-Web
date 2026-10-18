import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CriarUsuarioDto } from './criar-usuario.dto';

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
