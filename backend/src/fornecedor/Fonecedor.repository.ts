import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { db } from 'database'
import { Fornecedor, FornecedorSemId, AtualizarParcialFornecedor } from 'Trabalho-Web/tree/main/backend/src/fornecedor/Fornecedor.entity.ts';

@Injectable()
export class FornecedorRepository {
  private readonly tabela = 'fornecedores';

  async listar(): Promise<Fornecedor[]> {
    return await db<Fornecedor>(this.tabela).select('*');
  }

  async buscarPorId(id: number): Promise<Fornecedor> {
    const fornecedor = await db<Fornecedor>(this.tabela)
      .where({ id })
      .first();

    if (!fornecedor) {
      throw { status: 404, message: "Fornecedor não encontrado com esse id" }
    }
    return fornecedor;
  }

  async buscarPorCnpj(cnpj: string): Promise<Fornecedor> {
    const fornecedor = await db<Fornecedor>(this.tabela)
      .where({ cnpj })
      .first();

    if (!fornecedor) {
      throw { status: 404, message: "Fornecedor não encontrado com esse cnpj" }
    }
    return fornecedor;
  }

  async criar(dados: FornecedorSemId): Promise<Fornecedor> {
    const [fornecedor] = await db<Fornecedor>(this.tabela)
      .insert(dados)
      .returning('*');
    return fornecedor;
  }

  async atualizar(id: number, dados: FornecedorSemId): Promise<Fornecedor> {
    const [fornecedor] = await db<Fornecedor>(this.tabela)
      .where({ id })
      .update(dados)
      .returning('*');

    if (!fornecedor) {
      throw { status: 404, message: "Fornecedor não encontrado" }
    }
    return fornecedor;
  }

  async atualizarParcial(id: number, dados: AtualizarParcialFornecedor): Promise<Fornecedor> {
    const [fornecedor] = await db<Fornecedor>(this.tabela)
      .where({ id })
      .update(dados)
      .returning('*');

    if (!fornecedor) {
      throw { status: 404, message: "Fornecedor não encontrado" }
    }
    return fornecedor;
  }

  async excluir(id: number): Promise<void> {
    const quantidade = await db<Fornecedor>(this.tabela)
      .where({ id })
      .delete();

    if (quantidade === 0) {
      throw { status: 404, message: "Fornecedor não encontrado" }
    }
  }
}
