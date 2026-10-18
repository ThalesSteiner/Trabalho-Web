import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min, NotEquals, ValidateIf } from 'class-validator';

export class ItemIdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  itemId: number;
}

export class HistoricoPrecoDto {
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
  @Min(-1)
  @NotEquals(0, { message: 'lojaId deve ser positivo ou -1 para o preço padrão de todas as lojas' })
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  valor?: number;
}

export class ListarPrecosDto extends HistoricoPrecoDto {
  @ValidateIf((_obj, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  itemId?: number;
}