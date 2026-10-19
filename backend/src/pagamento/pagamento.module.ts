import { Module } from '@nestjs/common';
import { EstoqueModule } from '../estoque/estoque.module';
import { NotaFiscalModule } from '../nota-fiscal/nota-fiscal.module';
import { GatewayService } from './gateway.service';
import { PagamentoController } from './pagamento.controller';
import { PagamentoRepository } from './pagamento.repository';
import { PagamentoService } from './pagamento.service';

@Module({
  imports: [NotaFiscalModule, EstoqueModule],
  controllers: [PagamentoController],
  providers: [PagamentoService, PagamentoRepository, GatewayService],
})
export class PagamentoModule {}
