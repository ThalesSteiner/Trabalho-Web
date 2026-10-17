import { Injectable } from '@nestjs/common';
import { FornecedorRepository } from './Fornecedor.repository';
import { Fornecedor , FornecedorSemId, AtualizarParcialFornecedor} from './Fornecedor.entity';

@Injectable()
export class FornecedorService {
  constructor(private readonly repository: FornecedorRepository) {}

  async listar(): Promise<Fornecedor[]>{
    return this.repository.listar();
  }

  async buscarPorId(idRecebido: string): Promise<Fornecedor> {
    const id = this.validarId(idRecebido);
    return this.repository.buscarPorId(id);
  }

  async buscarPorCnpj(cnpjrecebido: string): Promise<Fornecedor> {
    this.validarCnpj(cnpjrecebido);
    return this.repository.buscarPorCnpj(cnpjrecebido);
  }

  async criar(dados: FornecedorSemId): Promise<Fornecedor> {
    this.validarCampos(dados, ['cnpj', 'razaoSocial', 'categorias']);
    this.validarCnpj(dados.cnpj);
    this.validarRazaoSocial(dados.razaoSocial);
    this.validarCategorias(dados.categorias);
    const fornecedor: FornecedorSemId = {
      cnpj: dados.cnpj,
      razaoSocial: dados.razaoSocial.trim(),
      categorias: dados.categorias.map(
        categoria => categoria.trim()
      )
    };
    return this.repository.criar(fornecedor);
  }

  async atualizar(idRecebido: string, dados: FornecedorSemId ): Promise<Fornecedor>{
    const id = this.validarId(idRecebido);
    this.validarCampos(dados, ['cnpj', 'razaoSocial', 'categorias']);
    this.validarCnpj(dados.cnpj);
    this.validarRazaoSocial(dados.razaoSocial);
    this.validarCategorias(dados.categorias);
    const fornecedor: FornecedorSemId = {
      cnpj: dados.cnpj,
      razaoSocial: dados.razaoSocial.trim(),
      categorias: dados.categorias.map(
        categoria => categoria.trim()
      )
    };
    return this.repository.atualizar(id, fornecedor);
  }

  async atualizarParcial(idRecebido: string,dados: AtualizarParcialFornecedor): Promise<Fornecedor> {
    const id = this.validarId(idRecebido);
    this.validarCampos(dados, ['cnpj', 'razaoSocial', 'categorias']);
    if (dados.cnpj === undefined && dados.razaoSocial === undefined && dados.categorias === undefined) {
      throw { status: 500 , message: "Informe no mínimo um campo para ser atualizado" }
    }

    if (dados.cnpj !== undefined) {
      this.validarCnpj(dados.cnpj);
    }

    if (dados.razaoSocial !== undefined) {
      this.validarRazaoSocial(dados.razaoSocial);
    }

    const atualizacao: AtualizarParcialFornecedor = {};

    if (dados.cnpj !== undefined) {
      atualizacao.cnpj = dados.cnpj;
    }

    if (dados.razaoSocial !== undefined) {
      atualizacao.razaoSocial = dados.razaoSocial.trim();
    }

    if (dados.categorias !== undefined) {
      this.validarCategorias(dados.categorias);
      atualizacao.categorias = dados.categorias.map(
        categoria => categoria.trim()
      );
    }
    
    return this.repository.atualizarParcial(id, atualizacao);
  }

  async excluir(idRecebido: string): Promise<{ mensagem: string }> {
    const id = this.validarId(idRecebido);
    await this.repository.excluir(id);
    return { mensagem: 'Fornecedor excluído com sucesso.'};
  }

    async buscarCategoriasExistentes( idRecebido: string, categoriasRecebidas: string[]): Promise<string[]>{
    const id = this.validarId(idRecebido);
    if (!Array.isArray(categoriasRecebidas) || categoriasRecebidas.length === 0 || !categoriasRecebidas.every(categoria =>typeof categoria === 'string' &&categoria.trim().length > 0)
    ) {
      throw { status: 500, message: "Informe uma categoria válida" }
    }
    const categorias = categoriasRecebidas.map(
      categoria => categoria.trim()
    );
    return this.repository.buscarCategoriasExistentes(id,categorias);
}
  

  private validarId(idRecebido: string): number {
    if (typeof idRecebido !== 'string' ||idRecebido.trim() === '') {
      throw { status: 500 , message: "Informe um Id válido" }
    }
    const id = Number(idRecebido);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw { status: 500 , message: "Informe um Id válido" }
    }
    return id;
  }

  private validarCnpj(cnpj: unknown): void {
    if (typeof cnpj !== 'string' ||!/^\d{14}$/.test(cnpj)) {//ve se tem 14 numeros mesmo
      throw { status: 500 , message: "CNPJ inválido, verifique se tem 14 números" }
    }
  }

  private validarRazaoSocial(razaoSocial: unknown): void {
    if (typeof razaoSocial !== 'string' ||razaoSocial.trim().length === 0) {
      throw { status: 500 , message: "A razão social é obrigatória e não pode estar vazia" }
    }
  }

  private validarCategorias(categorias: unknown): void {
    if ( !Array.isArray(categorias) || categorias.length === 0 || !categorias.every( categoria => typeof categoria === 'string' && categoria.trim().length > 0)){
      throw { status: 500 , message: "Categoria não descrita adequadamente" }
    }
  }
  
  private validarCampos( dados: unknown, camposPermitidos: string[]): void {
    if (dados === null || typeof dados !== 'object' || Array.isArray(dados)
    ) {
      throw { status: 500 , message: "Os dados devem estar em um json válido" }
    }
    const camposRecebidos = Object.keys(dados);
    const camposInvalidos = camposRecebidos.filter(
      (campo) => !camposPermitidos.includes(campo),
    );
    if (camposInvalidos.length > 0) {
      throw { status: 500 , message: "Erro nos campos, inválido!" }
    }
  }
}
