import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class ListarVendasDto {
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
  @Type(() => Number)
  @IsInt()
  lojaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  itemId?: number;

  @IsOptional()
  @IsUUID()
  pedidoId?: string;

  @IsOptional()
  @IsDateString()
  de?: string;

  @IsOptional()
  @IsDateString()
  ate?: string;
}
