import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import type { StatusPagamento } from '../pagamento.types';

export class ListarPagamentosDto {
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
  @IsIn(['PENDENTE', 'APROVADO', 'RECUSADO', 'ESTORNADO'])
  status?: StatusPagamento;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lojaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  formaPagamentoId?: number;

  @IsOptional()
  @IsDateString()
  de?: string;

  @IsOptional()
  @IsDateString()
  ate?: string;
}
