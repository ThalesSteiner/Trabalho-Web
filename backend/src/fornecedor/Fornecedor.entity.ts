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
