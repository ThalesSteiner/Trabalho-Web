export type Preco = {
  id: number;
  itemId: number;
  lojaId: number;
  valor: number;
  inicioVigencia: string | Date;
  fimVigencia: string | Date | null;
};

export type DadosPreco = Omit<Preco, 'id'>;
