import { IsDateString, IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';
import { DATA_HORA_COM_FUSO } from './criar-preco.dto';

export class AtualizarPrecoDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false })
  @Min(0.01)
  @Max(99999999.99)
  valor?: number;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(DATA_HORA_COM_FUSO, { message: 'inicioVigencia deve incluir hora e fuso' })
  inicioVigencia?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(DATA_HORA_COM_FUSO, { message: 'fimVigencia deve incluir hora e fuso' })
  fimVigencia?: string | null;
}
