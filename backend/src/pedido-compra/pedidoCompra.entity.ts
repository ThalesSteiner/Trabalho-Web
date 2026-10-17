import { formasPagamento } from './database/dados-mock';

export class PedidoCompra {
  constructor(public id: number, public item: string, public quantidade: number,public formaPagamento: string) {}
}
export type FormaPagamento = (typeof formasPagamento)[number];
 
export type CriarPedidoCompra = Omit<PedidoCompra, 'id'>;
 
export type AtualizarPedidoCompra = Partial<CriarPedidoCompra>;
