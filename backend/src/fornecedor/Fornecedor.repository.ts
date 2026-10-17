import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { Fornecedor, FornecedorSemId, AtualizarParcialFornecedor } from './Fornecedor.entity';

@Injectable()
export class FornecedorRepository {
  private readonly tabela = 'fornecedores';

  constructor(@Inject(KNEX) private readonly db: Knex) {}

  async listar(): Promise<Fornecedor[]> {
    return await this.db<Fornecedor>(this.tabela).select('*');
  }

  async buscarPorId(id: number): Promise<Fornecedor> {
    const fornecedor = await this.db<Fornecedor>(this.tabela)
      .where({ id })
      .first();

    if (!fornecedor) {
      throw { status: 404, message: "Fornecedor não encontrado com esse id" }
    }
    return fornecedor;
  }

  async buscarPorCnpj(cnpj: string): Promise<Fornecedor> {
    const fornecedor = await this.db<Fornecedor>(this.tabela)
      .where({ cnpj })
      .first();

    if (!fornecedor) {
      throw { status: 404, message: "Fornecedor não encontrado com esse cnpj" }
    }
    return fornecedor;
  }

  async criar(dados: FornecedorSemId): Promise<Fornecedor> {
    const [fornecedor] = await this.db<Fornecedor>(this.tabela)
      .insert(dados)
      .returning('*');
    return fornecedor;
  }

  async atualizar(id: number, dados: FornecedorSemId): Promise<Fornecedor> {
    const [fornecedor] = await this.db<Fornecedor>(this.tabela)
      .where({ id })
      .update(dados)
      .returning('*');

    if (!fornecedor) {
      throw { status: 404, message: "Fornecedor não encontrado com esse id" }
    }
    return fornecedor;
  }

  async atualizarParcial(id: number, dados: AtualizarParcialFornecedor): Promise<Fornecedor> {
    const [fornecedor] = await this.db<Fornecedor>(this.tabela)
      .where({ id })
      .update(dados)
      .returning('*');

    if (!fornecedor) {
      throw { status: 404, message: "Fornecedor não encontrado com esse id" }
    }
    return fornecedor;
  }

  async excluir(id: number): Promise<void> {
    const quantidade = await this.db<Fornecedor>(this.tabela)
      .where({ id })
      .delete();

    if (quantidade === 0) {
      throw { status: 404, message: "Fornecedor não encontrado com esse id" }
    }
  }

    async buscarCategoriasExistentes(id: number, categoriasBuscadas: string[]): Promise<string[]> { //retorna as categorias que existem em tal id
  const fornecedor = await this.db<Fornecedor>(this.tabela)
    .where({ id })
    .first();
  if (!fornecedor) {
    return [];
  }
  const categoriasFornecedor = fornecedor.categorias;
  return categoriasBuscadas.filter(categoria =>
    categoriasFornecedor.some(
      existente =>
        existente.toLowerCase() === categoria.toLowerCase(),
    )
  );
}
  
}
