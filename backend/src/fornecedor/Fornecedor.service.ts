import { Injectable } from '@nestjs/common';
import { FornecedorRepository } from './Fornecedor.repository';
import { Fornecedor } from './Fornecedor.entity';
import { CriarFornecedorDto, AtualizarFornecedorDto, AtualizarParcialFornecedorDto, BuscarCategoriasExistentesDto, validarDto } from './Fornecedor.dto';

@Injectable()
export class FornecedorService{
  constructor(private readonly repository: FornecedorRepository) {}

  async listar(query: unknown): Promise<ResultadoPaginado<Fornecedor>>{
    const dto = await validarDto(ListarFornecedoresDto, query);
    const { pagina, limite, ...filtros } = dto;
    return this.repository.listar(filtros, pagina ?? 1, limite ?? 10);
  }

  async buscarPorId(idRecebido: string): Promise<Fornecedor>{
    const id = this.validarId(idRecebido);
    return this.repository.buscarPorId(id);
  }

  async buscarPorCnpj(cnpjRecebido: string): Promise<Fornecedor>{
    this.validarCnpj(cnpjRecebido);
    return this.repository.buscarPorCnpj(cnpjRecebido);
  }

  async criar(dados: unknown): Promise<Fornecedor>{
    const fornecedor = await validarDto(CriarFornecedorDto, dados);
    return this.repository.criar(fornecedor);
  }

  async atualizar(idRecebido: string, dados: unknown): Promise<Fornecedor>{
    const id = this.validarId(idRecebido);
    const fornecedor = await validarDto(AtualizarFornecedorDto, dados);
    return this.repository.atualizar(id, fornecedor);
  }

  async atualizarParcial(idRecebido: string, dados: unknown): Promise<Fornecedor>{
    const id = this.validarId(idRecebido);
    const dto = await validarDto(AtualizarParcialFornecedorDto, dados);
    const atualizacao = Object.fromEntries(
      Object.entries(dto).filter(([, valor]) => valor !== undefined) //só retorna as chaves
    );

    if (Object.keys(atualizacao).length === 0){
      throw { status: 500, message: 'Informe no mínimo um campo para ser atualizado' };
    }
    return this.repository.atualizarParcial(id, atualizacao);
  }

  async excluir(idRecebido: string): Promise<{ mensagem: string }>{
    const id = this.validarId(idRecebido);
    await this.repository.excluir(id);
    return { mensagem: 'Fornecedor excluído com sucesso.' };
  }

  async buscarCategoriasExistentes( idRecebido: string,categoriasRecebidas: unknown): Promise<string[]> {
    const id = this.validarId(idRecebido);
    const { categorias } = await validarDto(BuscarCategoriasExistentesDto, {
      categorias: categoriasRecebidas,
    });
    return this.repository.buscarCategoriasExistentes(id, categorias);
  }
  
  private validarId(idRecebido: string): number {
    if (typeof idRecebido !== 'string' || idRecebido.trim() === '') {
      throw { status: 500, message: 'Informe um Id válido' };
    }
    const id = Number(idRecebido);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw { status: 500, message: 'Informe um Id válido' };
    }
    return id;
  }

  private validarCnpj(cnpj: unknown): void {
    if (typeof cnpj !== 'string' || !/^\d{14}$/.test(cnpj)) {
      throw { status: 500, message: 'CNPJ inválido, verifique se tem 14 números' };
    }
  }
}
