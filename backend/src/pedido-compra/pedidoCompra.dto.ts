import { Transform, Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CriarPedidoCompraDto {
  @IsInt({ message: 'lojaId deve ser um número inteiro' })
  @Min(1)
  lojaId: number;

  @IsInt({ message: 'itemId deve ser um número inteiro' })
  @Min(1)
  itemId: number;

  @IsInt({ message: 'fornecedorId deve ser um número inteiro' })
  @Min(1)
  fornecedorId: number;

  @IsInt({ message: 'quantidade deve ser um número inteiro' })
  @Min(1, { message: 'quantidade deve ser maior que zero' })
  @Max(100000)
  quantidade: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'custo unitário deve ter no máximo 2 casas decimais' })
  @Min(0.01, { message: 'custo unitário deve ser maior que zero' })
  custoUnitario: number;

  @Transform(trim)
  @IsString({ message: 'lote deve ser um texto' })
  @IsNotEmpty({ message: 'lote não pode ser vazio' })
  @MaxLength(60)
  lote: string;

  @IsOptional()
  @IsDateString()
  dataValidade?: string;
}

export class AtualizarPedidoCompraDto {
  @IsOptional()
  @IsInt({ message: 'fornecedorId deve ser um número inteiro' })
  @Min(1)
  fornecedorId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'custo unitário deve ter no máximo 2 casas decimais' })
  @Min(0.01, { message: 'custo unitário deve ser maior que zero' })
  custoUnitario?: number;
}

export class ListarPedidosCompraDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pagina deve ser um inteiro' })
  @Min(1, { message: 'pagina deve ser no mínimo 1' })
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limite deve ser um inteiro' })
  @Min(1, { message: 'limite deve ser no mínimo 1' })
  @Max(100, { message: 'limite deve ser no máximo 100' })
  limite?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'lojaId deve ser um inteiro' })
  lojaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'itemId deve ser um inteiro' })
  itemId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'fornecedorId deve ser um inteiro' })
  fornecedorId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'quantidade mínima deve ser um inteiro' })
  @Min(0, { message: 'quantidade mínima deve ser maior ou igual a zero' })
  quantidadeMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'quantidade máxima deve ser um inteiro' })
  @Min(0, { message: 'quantidade máxima deve ser maior ou igual a zero' })
  quantidadeMax?: number;
}
