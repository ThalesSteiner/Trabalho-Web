import { Injectable } from '@nestjs/common';
import { FornecedorRepository } from 'Trabalho-Web/tree/main/backend/src/fornecedor/Fornecedor.repository.ts';

import * as FornecedorEntity from 'Trabalho-Web/tree/main/backend/src/fornecedor/Fornecedor.entity.ts';

@Injectable()
export class FornecedorService {
  private fornecedores: Fornecedor[] = []; 
  private proximoId = 1; //util para um id maneiro e disponivel
  constructor(private repository: FornecedorRepository ) {}

  async listar(): Promise<Fornecedor[]> {
    await this.repository.listar();
    return this.fornecedores;
  }

  async buscarPorId(idRecebido: string): Promise<Fornecedor> {
    const id = this.validarId(idRecebido);
    await this.repository.buscarPorId(id);
    const fornecedor = this.fornecedores.find((f) => f.id === id);
    if (!fornecedor) {
      throw { status: 404 , message: "fornecedor não encontrado ou não existe" } }
    return fornecedor;
  }
  
  async criar(caminho: CriarFornecedorDto): Promise<Fornecedor> {
    this.validarCampos(caminho, ['cnpj', 'razaoSocial']);
    this.validarCnpj(caminho.cnpj);
    this.validarRazaoSocial(caminho.razaoSocial);
    const fornecedor: Fornecedor = {
      id: this.proximoId++,
      cnpj: caminho.cnpj,
      razaoSocial: caminho.razaoSocial.trim(),
    };
    await this.repository.criar();
    this.fornecedores.push(fornecedor);
    return fornecedor;
  }

  async atualizar(idRecebido: string,caminho: AtualizarFornecedorDto): Promise<Fornecedor> {
    const id = this.validarId(idRecebido);
    this.validarCampos(caminho, ['cnpj', 'razaoSocial']);
    this.validarCnpj(caminho.cnpj);
    this.validarRazaoSocial(caminho.razaoSocial);
    const fornecedor = await this.buscarPorId(String(id));
    await this.repository.atualizar();
    fornecedor.cnpj = caminho.cnpj;
    fornecedor.razaoSocial = caminho.razaoSocial.trim();
    return fornecedor;
  }

  async atualizarParcial(idRecebido: string, dados: AtualizarParcialFornecedorDto): Promise<Fornecedor> {
    const id = this.validarId(idRecebido);
    this.validarCampos(dados, ['cnpj', 'razaoSocial']);
    if (dados.cnpj === undefined && dados.razaoSocial === undefined) {
      throw { status: 500 , message: "Informe no mínimo um campo para ser atualizado" }
    }
    if (dados.cnpj !== undefined) {
      this.validarCnpj(dados.cnpj);
    }
    if (dados.razaoSocial !== undefined) {
      this.validarRazaoSocial(dados.razaoSocial);
    }

    const fornecedor = await this.buscarPorId(String(id));
    await this.repository.atualizarParcial();
    if (dados.cnpj !== undefined) {
      fornecedor.cnpj = dados.cnpj;
    }
    if (dados.razaoSocial !== undefined) {
      fornecedor.razaoSocial = dados.razaoSocial.trim();
    }
    return fornecedor;
  }

  async excluir(idRecebido: string,): Promise<{ mensagem: string }> {
    const id = this.validarId(idRecebido);
    await this.buscarPorId(String(id));
    await this.repository.excluir();
    this.fornecedores = this.fornecedores.filter(
      (f) => f.id !== id
    );
    return {status: 204, mensagem: "Fornecedor excluido"};
  }

  private validarId(idRecebido: string): number { //validar os ids e outras coisas das regras de negócios
    if (typeof idRecebido !== 'string' || idRecebido === undefined || idRecebido.trim() === "") {
      throw { status: 500 , message: "Informe um Id válido" }
    }

    const id = Number(idRecebido);
    if (!Number.isSafeInteger(id)) {
      throw { status: 500 , message: "Informe um Id válido" }
    }
    return id;
  }

  private validarCnpj(cnpj: unknown): void {
    if ( typeof cnpj !== 'string' || !/^\d{14}$/.test(cnpj)) { // ve se tem o tamanho certo de um cnpj, 14 numeros
      throw { status: 500 , message: "CNPJ inválido, verifique se tem 14 números" }
    }
  }

  private validarRazaoSocial(razaoSocial: unknown): void {
    if ( typeof razaoSocial !== 'string' || razaoSocial.trim().length === 0) {
      throw { status: 500 , message: "A razão social é obrigatória e não pode estar vazia" }
    }
  }

  private validarCampos(dados: unknown,camposPermitidos: string[]): void {
    if (
      dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
       throw { status: 500 , message: "Os dados devem estar em um json válido" }
    }

    const camposRecebidos = Object.keys(dados);
    const camposInvalidos = camposRecebidos.filter((campo) => !camposPermitidos.includes(campo));
    if (camposInvalidos.length > 0) {
       throw { status: 500 , message: "Erro nos campos, inválido!" }
    }
  }
}

