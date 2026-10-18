import { IsDateString, IsDefined, IsNumber, IsOptional, Matches, Max, Min, Validate, ValidateIf } from 'class-validator';
import { DATA_HORA_COM_FUSO, PeriodoPrecoValidator } from './criar-preco.dto';

export class AtualizarPrecoDto {
  @ValidateIf((dto, value) => value !== undefined || Object.values(dto).every(campo => campo === undefined))
  @IsDefined({ message: 'Informe pelo menos um campo para atualizar' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  valor?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(DATA_HORA_COM_FUSO, { message: 'inicioVigencia deve incluir hora e fuso' })
  inicioVigencia?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(DATA_HORA_COM_FUSO, { message: 'fimVigencia deve incluir hora e fuso' })
  @Validate(PeriodoPrecoValidator)
  fimVigencia?: string | null;
}