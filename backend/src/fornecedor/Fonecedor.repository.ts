import { Injectable } from '@nestjs/common';

@Injectable()
export class FornecedorRepository {
  async listar(): Promise<string> {
    return 'OK';
  }

  async buscarPorId(id: number): Promise<string> {
    return 'OK';
  }

  async criar(): Promise<string> {
    return 'OK';
  }

  async atualizar(): Promise<string> {
    return 'OK';
  }

  async atualizarParcial(): Promise<string> {
    return 'OK';
  }

  async excluir(): Promise<string> {
    return 'OK';
  }
}
