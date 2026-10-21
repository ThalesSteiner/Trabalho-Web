import { Transform, Type } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class ListarLojasDto {
  @ValidateIf((_, val) => val !== undefined)
  @Transform(({ value }) => (value as string)?.trim())
  @IsString()
  @MaxLength(120)
  nome?: string;

  @ValidateIf((_, val) => val !== undefined)
  @Transform(({ value }) => (value as string)?.trim())
  @IsString()
  @MaxLength(120)
  condominio?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}