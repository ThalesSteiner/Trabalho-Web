export type LoteEstoque = {
  dataReferencia: string;
  lojaId: number;
  itemId: number;
  lote: string;
  dataValidade: string | null;
  quantidade: number;
};