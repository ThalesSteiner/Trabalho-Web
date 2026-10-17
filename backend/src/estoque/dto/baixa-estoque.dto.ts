import { IsInt, Max, Min } from 'class-validator';

export class BaixaEstoqueDto {
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  lojaId: number;

  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  itemId: number;

  @IsInt()
  @Min(1)
  @Max(100000)
  quantidade: number;
}