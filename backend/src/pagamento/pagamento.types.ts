export type StatusPagamento = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'ESTORNADO';

export type ItemPago = {
  itemId: number;
  quantidade: number;
  precoId: number;
  valorUnitario: number;
  promocaoId: number;
  valorPago: number;
};

export type Pagamento = {
  id: string;
  usuarioId: string;
  lojaId: number;
  formaPagamentoId: number;
  notaFiscalId: number | null;
  itens: ItemPago[];
  valor: number;
  status: StatusPagamento;
  codigoTransacao: string | null;
  motivo: string | null;
  criadoEm: Date;
  processadoEm: Date | null;
};

export type NovoPagamento = Pick<Pagamento, 'usuarioId' | 'lojaId' | 'formaPagamentoId' | 'itens' | 'valor'>;
