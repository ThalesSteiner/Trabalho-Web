export type Perfil = 'ADMIN' | 'CLIENTE' | 'FUNCIONARIO';

export type Usuario = {
  id: string;
  nome: string;
  cpf: string | null;
  criadoEm: Date;
};

export type Login = {
  id: string;
  usuarioId: string;
  email: string;
  senhaHash: string;
  perfil: Perfil;
};

export type Funcionario = {
  lojaId: number;
  cargo?: string;
};
