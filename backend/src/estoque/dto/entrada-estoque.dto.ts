import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

export class EntradaEstoqueDto {
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId: number;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  itemId: number;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  lote: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataValidade deve estar no formato AAAA-MM-DD' })
  dataValidade?: string;

  @IsInt()
  @Min(1)
  @Max(100000)
  quantidade: number;
}