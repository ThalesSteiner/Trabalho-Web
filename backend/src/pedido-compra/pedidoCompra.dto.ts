import { PartialType } from '@nestjs/mapped-types';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, validate } from 'class-validator';
import { formasPagamento } from '../common/database/dados-mock';
import type { FormaPagamento } from './pedidoCompra.entity';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CriarPedidoCompraDto {
  @Transform(trim)
  @IsString({ message: 'item deve ser um texto' })
  @IsNotEmpty({ message: 'item não pode ser vazio' })
  item: string;

  @IsInt({ message: 'quantidade deve ser um número inteiro' })
  @Min(1, { message: 'quantidade deve ser maior que zero' })
  quantidade: number;

  @IsIn([...formasPagamento], { message: 'forma de pagamento inválida.' })
  formaPagamento: FormaPagamento;
}

export class AtualizarPedidoCompraDto extends PartialType(CriarPedidoCompraDto) {}

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
  @Transform(trim)
  @IsString({ message: 'item deve ser um texto' })
  item?: string;

  @IsOptional()
  @IsIn([...formasPagamento], { message: 'forma de pagamento inválida.' })
  formaPagamento?: FormaPagamento;

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

export async function validarDto<T extends object>(classe: new () => T,dados: unknown): Promise<T> {
  if (dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
    throw { status: 400, message: 'Os dados devem estar em um json válido' };
  }
  const instancia = plainToInstance(classe, dados);
  const erros = await validate(instancia, {
    whitelist: true,
    forbidNonWhitelisted: true
  });
  if (erros.length > 0) {
    const mensagens = erros.flatMap((e) => Object.values(e.constraints ?? {}));
    throw { status: 400, message: mensagens };
  }
  return instancia;
}
