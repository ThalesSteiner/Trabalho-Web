import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TIPOS_PROMOCAO, type TipoPromocao } from '../promocao.types';

export class ListarPromocoesDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  itemId?: number;

  @IsOptional()
  @IsIn(TIPOS_PROMOCAO)
  tipoPromocaoId?: TipoPromocao;
}
