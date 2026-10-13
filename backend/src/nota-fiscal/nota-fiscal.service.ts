import { Injectable, NotFoundException } from '@nestjs/common';
import { randomInt } from 'crypto';
import type { Knex } from 'knex';
import { ListarNotasDto } from './dto/listar-notas.dto';
import { NotaFiscalRepository } from './nota-fiscal.repository';
import { NotaFiscal } from './nota-fiscal.types';

@Injectable()
export class NotaFiscalService {
  constructor(private readonly repository: NotaFiscalRepository) {}

  async listar(filtros: ListarNotasDto) {
    const { data, total } = await this.repository.listar(filtros);
    return { data, total, page: filtros.page, limit: filtros.limit };
  }

  async buscarPorUuid(uuid: string) {
    return this.detalhar(await this.repository.buscarPorUuid(uuid));
  }

  async buscarPorChave(chaveAcesso: string) {
    return this.detalhar(await this.repository.buscarPorChave(chaveAcesso));
  }

  async emitir(trx: Knex.Transaction) {
    const numero = await this.repository.proximoNumero(trx);
    const chaveAcesso = ('3526' + '12345678000190' + '65001' + numero + '1' + randomInt(10000000, 100000000)).padEnd(44, '0');
    return this.repository.salvar({ numero, chaveAcesso, emitidaEm: new Date() }, trx);
  }

  cancelar(id: number, trx: Knex.Transaction) {
    return this.repository.cancelar(id, trx);
  }

  private async detalhar(nota?: NotaFiscal) {
    if (!nota) throw new NotFoundException('Nota fiscal não encontrada');

    const itens = await this.repository.itens(nota.id);
    const venda = await this.repository.venda(nota.id);
    const total = Math.round(itens.reduce((soma, item) => soma + item.valorPago, 0) * 100) / 100;

    return { ...nota, ...venda, total, itens };
  }
}
