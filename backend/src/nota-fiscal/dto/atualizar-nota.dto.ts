import { IsBoolean, IsDateString, IsNumberString, IsOptional, Matches, MaxLength } from 'class-validator';

export class AtualizarNotaDto {
  @IsOptional()
  @IsNumberString()
  @MaxLength(20)
  numero?: string;

  @IsOptional()
  @Matches(/^\d{44}$/, { message: 'chaveAcesso deve ter 44 números' })
  chaveAcesso?: string;

  @IsOptional()
  @IsDateString()
  emitidaEm?: string;

  @IsOptional()
  @IsBoolean()
  cancelada?: boolean;
}
