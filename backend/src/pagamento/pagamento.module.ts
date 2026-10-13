import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { PagamentoController } from './pagamento.controller';
import { PagamentoRepository } from './pagamento.repository';
import { PagamentoService } from './pagamento.service';

@Module({
  controllers: [PagamentoController],
  providers: [PagamentoService, PagamentoRepository, GatewayService],
})
export class PagamentoModule {}
