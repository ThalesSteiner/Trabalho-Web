import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LojaRepository } from './loja.repository';
import { CriarLojaDto } from './dto/criar-loja.dto';
import { AtualizarLojaDto } from './dto/atualizar-loja.dto';
import { ListarLojasDto } from './dto/filtros-loja.dto';

@Injectable()
export class LojaService {
  constructor(private readonly repository: LojaRepository) {}

  async criar(dto: CriarLojaDto) {
    this.validarCoordenadas(dto.latitude, dto.longitude);
    await this.validarNomeRepetido(dto.nomeLoja, dto.nomeCondominio ?? null);
    return this.repository.criar(dto);
  }

  listar(filtros: ListarLojasDto) {
    return this.repository.listar(filtros);
  }
  async buscarPorId(id: number) {
    this.validarId(id);
    const loja = await this.repository.buscarPorId(id);
    if (!loja) throw new NotFoundException('Loja não encontrada');
    return loja;
  }

  async atualizar(id: number, dto: AtualizarLojaDto) {
    const loja = await this.buscarPorId(id);
    
    if (!Object.values(dto).some(valor => valor !== undefined)) {
      throw new BadRequestException('Informe pelo menos um campo para atualizar');
    }

    this.validarCoordenadas(dto.latitude, dto.longitude);
    await this.validarNomeRepetido(dto.nomeLoja ?? loja.nomeLoja, dto.nomeCondominio ?? loja.nomeCondominio, id);
    
    const atualizada = await this.repository.atualizar(id, dto);
    if (!atualizada) throw new NotFoundException('Loja não encontrada');
    return atualizada;
  }
  async excluir(id: number) {
    await this.buscarPorId(id);
    try {
      await this.repository.excluir(id);
    } catch (erro) {
      if ((erro as { code?: string }).code === '23503') {
        throw new ConflictException('A loja possui vendas, compras, estoque, preços ou custos vinculados e não pode ser excluída');
      }
      throw erro;
    }
    return { mensagem: 'Loja excluída com sucesso' };
  }
  private validarId(id: number) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new BadRequestException('Informe um ID positivo válido');
  }

  private validarCoordenadas(latitude?: number, longitude?: number) {
    if ((latitude === undefined) !== (longitude === undefined)) {
      throw new BadRequestException('Informe latitude e longitude juntas');
    }
  }

  private async validarNomeRepetido(nomeLoja: string, nomeCondominio: string | null, ignorarId?: number) {
    if (await this.repository.buscarMesmoNome(nomeLoja, nomeCondominio, ignorarId)) {
      throw new ConflictException('Já existe uma loja com esse nome nesse condomínio');
    }
}
}