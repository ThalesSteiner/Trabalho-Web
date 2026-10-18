import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsString, Matches, Max, MaxLength, Min, ValidateIf, NotEquals } from 'class-validator';

export class CriarCustoDto {
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataCusto deve estar no formato AAAA-MM-DD' })
  dataCusto: string;

  @IsInt()
  @Min(-1)
  @NotEquals(0, { message: 'lojaId deve ser positivo ou -1 para a matriz' })
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId: number;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  categoriaCustoId: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(200)
  descricao?: string;

  @IsNumber({ maxDecimalPlaces: 2})
  @Min(0.01)
  @Max(9999999999.99)
  valor: number;
}
