import { Module } from '@nestjs/common';
import { PagamentoController } from './pagamento.controller';
import { PagamentoRepository } from './pagamento.repository';
import { PagamentoService } from './pagamento.service';

@Module({
  controllers: [PagamentoController],
  providers: [PagamentoService, PagamentoRepository],
})
export class PagamentoModule {}
