import { IsDateString, IsInt, IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';

export const DATA_HORA_COM_FUSO = /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/;

export class CriarPrecoDto {
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  itemId: number;

  @IsInt()
  @Min(-1)
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  valor: number;

  @IsDateString({ strict: true })
  @Matches(DATA_HORA_COM_FUSO, { message: 'inicioVigencia deve incluir hora e fuso, por exemplo 2026-10-15T12:00:00-03:00' })
  inicioVigencia: string;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(DATA_HORA_COM_FUSO, { message: 'fimVigencia deve incluir hora e fuso' })
  fimVigencia?: string | null;
}
