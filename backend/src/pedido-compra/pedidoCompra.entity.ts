export class PedidoCompra {
  constructor(public id: number,
    public dataRecebimento: string,
    public lojaId: number,
    public itemId: number,
    public fornecedorId: number,
    public funcionarioId: number,
    public quantidade: number,
    public custoUnitario: number
  ) {}
}

export type CriarPedidoCompra = Omit<PedidoCompra, 'id'>;

export type AtualizarPedidoCompra = Partial<Pick<PedidoCompra, 'fornecedorId' | 'custoUnitario'>>;

export class Promocao {
  constructor(public id: number,
    public itemId: number,
    public nome: string,
    public tipo: string,
    public valor: number | null,
    public leve: number | null,
    public pague: number | null
  ) {}
}

export type TotalPedidoCompra = {pedidoId: number;
  item: string;
  quantidade: number;
  custoUnitario: number;
  total: number;
};

export type FiltrosPedidoCompra = {
  lojaId?: number;
  itemId?: number;
  fornecedorId?: number;
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
