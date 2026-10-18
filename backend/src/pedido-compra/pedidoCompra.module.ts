import { Module } from '@nestjs/common';
import { EstoqueModule } from '../estoque/estoque.module';
import { PedidoCompraController } from './pedidoCompra.controller';
import { PedidoCompraService } from './pedidoCompra.service';
import { PedidoCompraRepository } from './pedidoCompra.repository';

@Module({
  imports: [EstoqueModule],
  controllers: [PedidoCompraController],
  providers: [PedidoCompraService, PedidoCompraRepository]
})
export class PedidoCompraModule {} //só para garantir que funcione, pedidoCompra
