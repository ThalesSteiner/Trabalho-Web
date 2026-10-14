export interface Fornecedor {
  id: number;
  razaoSocial: string;
  categoria: string[];
  cnpj: string;
}

export type FornecedorSemId = { //usado em criar e em post
  razaoSocial: string;
  categoria: string[];
  cnpj: string;
}

export type AtualizarParcialFornecedor = {
  razaoSocial?: string;
  categoria?: string[];
  cnpj?: string;
};
