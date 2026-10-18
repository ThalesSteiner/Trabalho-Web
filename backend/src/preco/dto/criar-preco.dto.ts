import { IsDateString, IsInt, IsNumber, IsOptional, Matches, Max, Min, NotEquals, Validate, ValidatorConstraint } from 'class-validator';
import type { ValidationArguments, ValidatorConstraintInterface } from 'class-validator';

export const DATA_HORA_COM_FUSO = /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/;

@ValidatorConstraint({ name: 'periodoPreco', async: false })
export class PeriodoPrecoValidator implements ValidatorConstraintInterface {
  validate(fim: unknown, argumentos: ValidationArguments) {
    const { inicioVigencia } = argumentos.object as { inicioVigencia?: unknown };
    if (typeof inicioVigencia !== 'string' || typeof fim !== 'string') return true;
    const inicio = Date.parse(inicioVigencia);
    const termino = Date.parse(fim);
    if (!Number.isFinite(inicio) || !Number.isFinite(termino)) return true;
    return termino > inicio;
  }

  defaultMessage() {
    return 'fimVigencia deve ser posterior a inicioVigencia';
  }
}

export class CriarPrecoDto {
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  itemId: number;

  @IsInt()
  @Min(-1)
  @NotEquals(0, { message: 'lojaId deve ser positivo ou -1 para o preço padrão de todas as lojas' })
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  valor: number;

  @IsDateString({ strict: true })
  @Matches(DATA_HORA_COM_FUSO, { message: 'inicioVigencia deve incluir hora e fuso, por exemplo 2026-10-15T12:00:00-03:00' })
  inicioVigencia: string;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(DATA_HORA_COM_FUSO, { message: 'fimVigencia deve incluir hora e fuso' })
  @Validate(PeriodoPrecoValidator)
  fimVigencia?: string | null;
}
