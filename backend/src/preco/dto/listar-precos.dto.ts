import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class HistoricoPrecoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId?: number;
}

export class ListarPrecosDto extends HistoricoPrecoDto {
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
}