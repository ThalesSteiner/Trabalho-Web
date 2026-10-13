import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsInt, Max, Min, ValidateNested } from 'class-validator';

class ItemPagamentoDto {
  @IsInt()
  @Min(1)
  itemId: number;

  @IsInt()
  @Min(1)
  @Max(50)
  quantidade: number;
}

export class CriarPagamentoDto {
  @IsInt()
  @Min(1)
  lojaId: number;

  @IsInt()
  @Min(1)
  formaPagamentoId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ItemPagamentoDto)
  itens: ItemPagamentoDto[];
}
