import { Type } from 'class-transformer';
import { IsDateString, IsInt, Matches, Max, Min, ValidateIf } from 'class-validator';
export class FiltrosDashboardDto {
  @ValidateIf((_obj, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  de?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  ate?: string;
}

export class MaisVendidosDto extends FiltrosDashboardDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 5;
}
