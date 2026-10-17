export const TIPOS_PROMOCAO = ['DESCONTO', 'DINHEIRO', 'PRECO_FIXO', 'LEVE_PAGUE'] as const;
export type TipoPromocao = typeof TIPOS_PROMOCAO[number];

export type Promocao = {
  id: number;
  itemId: number;
  tipoPromocaoId: TipoPromocao;
  nome: string;
  valor: number | null;
  qtdLeve: number | null;
  qtdPague: number | null;
};

export type DadosPromocao = Omit<Promocao, 'id'>;
