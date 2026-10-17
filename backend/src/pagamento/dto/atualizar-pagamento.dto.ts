import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import type { StatusPagamento } from '../pagamento.types';

export class AtualizarPagamentoDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  formaPagamentoId?: number;

  @IsOptional()
  @IsIn(['PENDENTE', 'APROVADO', 'RECUSADO', 'ESTORNADO'])
  status?: StatusPagamento;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  codigoTransacao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo?: string;
}
