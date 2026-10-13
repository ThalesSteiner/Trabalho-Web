import { Module } from '@nestjs/common';
import { PagamentoRepository } from './pagamento.repository';

@Module({
  providers: [PagamentoRepository],
})
export class PagamentoModule {}
