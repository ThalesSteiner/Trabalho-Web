export interface Fornecedor {
  id: number;
  cnpj: string;
  razaoSocial: string;
}

export type FornecedorSemId = { //usado em criar e em post
  cnpj: string;
  razaoSocial: string;
}

export type AtualizarParcialFornecedor = {
  cnpj?: string;
  razaoSocial?: string;
};
