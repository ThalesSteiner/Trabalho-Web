export interface Fornecedor {
  id: number;
  razaoSocial: string;
  categorias: string[];
  cnpj: string;
}

export type FornecedorSemId = { //usado em criar e em post
  razaoSocial: string;
  categorias: string[];
  cnpj: string;
}

export type AtualizarParcialFornecedor = {
  razaoSocial?: string;
  categorias?: string[];
  cnpj?: string;
};

export type FiltrosFornecedor = {
  razaoSocial?: string;
  cnpj?: string;
  categoria?: string;
};

export type ResultadoPaginado<T> = {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
};
