import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumberString, IsOptional, Max, Min } from 'class-validator';

export class ListarNotasDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsNumberString()
  numero?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lojaId?: number;

  @IsOptional()
  @IsDateString()
  de?: string;

  @IsOptional()
  @IsDateString()
  ate?: string;
}
