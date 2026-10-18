import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { FornecedorRepository } from './Fornecedor.repository';
import { Fornecedor, ResultadoPaginado } from './Fornecedor.entity';
import { CriarFornecedorDto, AtualizarFornecedorDto, AtualizarParcialFornecedorDto, ListarFornecedoresDto } from './Fornecedor.dto';

@Injectable()
export class FornecedorService{
  constructor(private readonly repository: FornecedorRepository) {}

  async listar(dto: ListarFornecedoresDto): Promise<ResultadoPaginado<Fornecedor>>{
    const { pagina, limite, ...filtros } = dto;
    return this.repository.listar(filtros, pagina ?? 1, limite ?? 10);
  }

  async buscarPorId(id: number): Promise<Fornecedor>{
    return this.repository.buscarPorId(id);
  }

  async buscarPorCnpj(cnpjRecebido: string): Promise<Fornecedor>{
    this.validarCnpj(cnpjRecebido);
    return this.repository.buscarPorCnpj(cnpjRecebido);
  }

  async criar(fornecedor: CriarFornecedorDto): Promise<Fornecedor>{
    await this.validarCnpjUnico(fornecedor.cnpj);
    return this.repository.criar(fornecedor);
  }

  async atualizar(id: number, fornecedor: AtualizarFornecedorDto): Promise<Fornecedor>{
    await this.repository.buscarPorId(id);
    await this.validarCnpjUnico(fornecedor.cnpj, id);
    return this.repository.atualizar(id, fornecedor);
  }

  async atualizarParcial(id: number, dto: AtualizarParcialFornecedorDto): Promise<Fornecedor>{
    const atualizacao = Object.fromEntries(
      Object.entries(dto).filter(([, valor]) => valor !== undefined) //só retorna as chaves
    );

    if (Object.keys(atualizacao).length === 0){
      throw new BadRequestException('Informe no mínimo um campo para ser atualizado');
    }
    await this.repository.buscarPorId(id);
    if (dto.cnpj !== undefined) await this.validarCnpjUnico(dto.cnpj, id);
    return this.repository.atualizarParcial(id, atualizacao);
  }

  async excluir(id: number): Promise<{ mensagem: string }>{
    try {
      await this.repository.excluir(id);
    } catch (erro) {
      if ((erro as { code?: string }).code === '23503') {
        throw new ConflictException('O fornecedor possui compras registradas e não pode ser excluído');
      }
      throw erro;
    }
    return { mensagem: 'Fornecedor excluído com sucesso.' };
  }

  async buscarCategoriasExistentes(id: number, categorias: string[]): Promise<string[]> {
    return this.repository.buscarCategoriasExistentes(id, categorias);
  }

  private validarCnpj(cnpj: unknown): void {
    if (typeof cnpj !== 'string' || !/^\d{14}$/.test(cnpj)) {
      throw new BadRequestException('CNPJ inválido, verifique se tem 14 números');
    }
  }

  private async validarCnpjUnico(cnpj: string, ignorarId?: number) {
    if (await this.repository.cnpjEmUso(cnpj, ignorarId)) {
      throw new ConflictException('Já existe um fornecedor com esse CNPJ');
    }
  }
}
