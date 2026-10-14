import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class AtualizarCustoDto {
  @ValidateIf((_obj, value) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataCusto deve estar no formato AAAA-MM-DD' })
  dataCusto?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsInt()
  @Min(-1)
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  categoriaCustoId?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(200)
  descricao?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0.01)
  @Max(9999999999.99)
  valor?: number;
}
