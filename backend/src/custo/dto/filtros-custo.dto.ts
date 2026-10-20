import { Type } from 'class-transformer';
import { IsDateString, IsInt, Matches, Max, Min, ValidateIf, NotEquals, Validate, ValidatorConstraint } from 'class-validator';
import type { ValidationArguments, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'intervaloDatas', async: false })
class IntervaloDatasValidator implements ValidatorConstraintInterface {
  validate(ate: unknown, argumentos: ValidationArguments) {
    const { de } = argumentos.object as { de?: unknown };

    if (typeof de !== 'string' || typeof ate !== 'string') return true;

    return de <= ate;
  }

  defaultMessage() {
    return 'A data inicial não pode ser posterior à data final';
  }
}
export class FiltrosCustoDto {
  @ValidateIf((_obj, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  @NotEquals(0, { message: 'lojaId deve ser positivo ou -1 para a matriz' })
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  categoriaCustoId?: number;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  de?: string;

  @ValidateIf((_obj, value) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @Validate(IntervaloDatasValidator)
  ate?: string;
}

export class ListarCustosDto extends FiltrosCustoDto {
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
