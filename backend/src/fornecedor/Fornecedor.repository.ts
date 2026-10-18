import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { Fornecedor, FornecedorSemId, AtualizarParcialFornecedor } from './Fornecedor.entity';

@Injectable()
export class FornecedorRepository {
  private readonly tabela = 'fornecedores';

  constructor(@Inject(KNEX) private readonly db: Knex) {}

  async listar(filtros: FiltrosFornecedor,pagina: number,limite: number): Promise<ResultadoPaginado<Fornecedor>>{
  const aplicarFiltros = (qb: Knex.QueryBuilder) => {
    if (filtros.razaoSocial){
      qb.whereILike('razaoSocial', `%${filtros.razaoSocial}%`);
    }
    if (filtros.cnpj){
      qb.where('cnpj', 'like', `${filtros.cnpj}%`);
    }
    if (filtros.categoria){
      qb.whereRaw('EXISTS (SELECT 1 FROM unnest(categorias) AS c WHERE lower(c) = lower(?))',[filtros.categoria]);
    }
  };
  const [{ total }] = await this.db(this.tabela).modify(aplicarFiltros).count<{ total: string }[]>('* as total');

  const dados = await this.db<Fornecedor>(this.tabela).modify(aplicarFiltros).select('*').orderBy('id').limit(limite).offset((pagina - 1) * limite);

  const totalNumero = Number(total);

  return {
    dados,
    total: totalNumero,
    pagina,
    limite,
    totalPaginas: Math.ceil(totalNumero / limite),
  };
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
