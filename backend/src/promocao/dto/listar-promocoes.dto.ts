import { Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min, ValidateIf } from 'class-validator';
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

  @ValidateIf((_obj, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  itemId?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsIn(TIPOS_PROMOCAO)
  tipoPromocaoId?: TipoPromocao;
}
