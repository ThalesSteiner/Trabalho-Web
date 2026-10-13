export type NotaFiscal = {
  id: number;
  uuid: string;
  numero: string | null;
  chaveAcesso: string | null;
  emitidaEm: Date | null;
  cancelada: boolean;
};
