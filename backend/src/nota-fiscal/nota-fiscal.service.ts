import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import type { Knex } from 'knex';
import { NotaFiscalRepository } from './nota-fiscal.repository';

@Injectable()
export class NotaFiscalService {
  constructor(private readonly repository: NotaFiscalRepository) {}

  async emitir(trx: Knex.Transaction) {
    const numero = await this.repository.proximoNumero(trx);
    const chaveAcesso = ('3526' + '12345678000190' + '65001' + numero + '1' + randomInt(10000000, 100000000)).padEnd(44, '0');
    return this.repository.salvar({ numero, chaveAcesso, emitidaEm: new Date() }, trx);
  }
}
