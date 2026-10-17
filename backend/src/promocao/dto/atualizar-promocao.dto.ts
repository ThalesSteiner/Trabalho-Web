import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { TIPOS_PROMOCAO, type TipoPromocao } from './criar-promocao.dto';

export class AtualizarPromocaoDto {
  @IsOptional()
  @IsIn(TIPOS_PROMOCAO)
  tipoPromocaoId?: TipoPromocao;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0.01)
  @Max(99999999.99)
  valor?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  qtdLeve?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  qtdPague?: number | null;
}
