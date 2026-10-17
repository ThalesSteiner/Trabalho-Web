import { IsInt, Max, Min } from 'class-validator';

export class DescarteVencidosDto {
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId: number;
}