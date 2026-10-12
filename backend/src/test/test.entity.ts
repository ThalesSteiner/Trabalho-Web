export enum TestStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

export class TestEntity {
  id: number;
  nome: string;
  status: TestStatus;
  criadoEm: Date;
}
