import { formasPagamento } from '../common/database/dados-mock';

export class PedidoCompra {
  constructor(public id: number, public item: string, public quantidade: number,public formaPagamento: FormaPagamento) {}
}
export type FormaPagamento = (typeof formasPagamento)[number];
 
export type CriarPedidoCompra = Omit<PedidoCompra, 'id'>;
 
export type AtualizarPedidoCompra = Partial<CriarPedidoCompra>;

export class Promocao {
  constructor(public id: number,
    public item: string,
    public nome: string,
    public tipo: string,
    public valor: number | null,
    public leve: number | null,
    public pague: number | null
  ) {}
}

export class Item {
  constructor(public id: number,
    public nome: string,
    public categoria: string,
    public preco: number
  ) {}
}

export type TotalPedidoCompra = {pedidoId: number;
  item: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
};

export type FiltrosPedidoCompra = {
  item?: string;
  formaPagamento?: FormaPagamento;
  quantidadeMin?: number;
  quantidadeMax?: number;
};

export type ResultadoPaginado<T> = {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
};
