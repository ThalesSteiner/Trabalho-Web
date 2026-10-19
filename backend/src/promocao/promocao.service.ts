import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AtualizarPromocaoDto } from './dto/atualizar-promocao.dto';
import { CriarPromocaoDto } from './dto/criar-promocao.dto';
import { ListarPromocoesDto, ListarTiposPromocaoDto } from './dto/listar-promocoes.dto';
import { PromocaoRepository } from './promocao.repository';
import type { DadosPromocao } from './promocao.types';

@Injectable()
export class PromocaoService {
  constructor(private readonly repository: PromocaoRepository) {}

  tipos(filtros: ListarTiposPromocaoDto) {
    return this.repository.tipos(filtros);
  }

  listar(filtros: ListarPromocoesDto) {
    return this.repository.listar(filtros);
  }

  async buscarPorId(id: number) {
    const promocao = await this.repository.buscarPorId(id);
    if (!promocao) throw new NotFoundException('Promoção não encontrada');
    return promocao;
  }

  criar(dto: CriarPromocaoDto) {
    const dados = this.validarDados(dto);
    return this.repository.transacao(async trx => {
      if (!await this.repository.bloquearItem(dto.itemId, trx)) throw new NotFoundException('Item não encontrado');
      if (await this.repository.buscarPorItem(dto.itemId, trx)) {
        throw new ConflictException('Este item já possui uma promoção; altere a promoção existente');
      }
      return this.repository.criar(dados, trx);
    });
  }

  async atualizar(id: number, dto: AtualizarPromocaoDto) {
    const anterior = await this.buscarPorId(id);
    const campos = Object.fromEntries(Object.entries(dto).filter(([, valor]) => valor !== undefined));
    return this.repository.transacao(async trx => {
      await this.repository.bloquearItem(anterior.itemId, trx);
      const atual = await this.repository.buscarPorId(id, trx);
      if (!atual) throw new NotFoundException('Promoção não encontrada');
      const mudouTipo = dto.tipoPromocaoId !== undefined && dto.tipoPromocaoId !== atual.tipoPromocaoId;
      const base = mudouTipo ? { ...atual, valor: null, qtdLeve: null, qtdPague: null } : atual;
      const dados = this.validarDados({ ...base, ...campos });
      return this.repository.atualizar(id, dados, trx);
    });
  }

  async excluir(id: number) {
    const promocao = await this.buscarPorId(id);
    try {
      return await this.repository.transacao(async trx => {
        await this.repository.bloquearItem(promocao.itemId, trx);
        if (!await this.repository.buscarPorId(id, trx)) throw new NotFoundException('Promoção não encontrada');
        if (await this.repository.possuiVendas(id, trx)) {
          throw new ConflictException('A promoção possui vendas vinculadas e não pode ser excluída');
        }
        await this.repository.excluir(id, trx);
        return { mensagem: 'Promoção excluída com sucesso' };
      });
    } catch (erro) {
      if ((erro as { code?: string }).code === '23503') {
        throw new ConflictException('A promoção possui vendas vinculadas e não pode ser excluída');
      }
      throw erro;
    }
  }

  private validarDados(dto: CriarPromocaoDto): DadosPromocao {
    const valor = dto.valor ?? null;
    const qtdLeve = dto.qtdLeve ?? null;
    const qtdPague = dto.qtdPague ?? null;
    if (dto.tipoPromocaoId === 'LEVE_PAGUE') {
      if (valor !== null || qtdLeve === null || qtdPague === null || qtdLeve <= qtdPague) {
        throw new BadRequestException('LEVE_PAGUE exige qtdLeve maior que qtdPague e não utiliza valor');
      }
    } else {
      if (valor === null || qtdLeve !== null || qtdPague !== null) {
        throw new BadRequestException('Este tipo de promoção exige valor e não utiliza qtdLeve nem qtdPague');
      }
      if (dto.tipoPromocaoId === 'DESCONTO' && valor > 100) {
        throw new BadRequestException('O desconto percentual não pode ultrapassar 100');
      }
    }
    return { itemId: dto.itemId, tipoPromocaoId: dto.tipoPromocaoId, nome: dto.nome, valor, qtdLeve, qtdPague };
  }
}