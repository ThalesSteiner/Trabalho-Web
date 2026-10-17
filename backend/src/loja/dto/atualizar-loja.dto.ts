import { Transform } from 'class-transformer';
import { IsNumber, IsString, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

export class AtualizarLojaDto {
  @ValidateIf((_, val) => val !== undefined)
  @Transform(({ value }) => (value as string)?.trim())
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nomeLoja?: string;

  @ValidateIf((_, val) => val !== undefined)
  @Transform(({ value }) => (value as string)?.trim())
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nomeCondominio?: string;

  @ValidateIf((_, val) => val !== undefined)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ValidateIf((_, val) => val !== undefined)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  longitude?: number;
}