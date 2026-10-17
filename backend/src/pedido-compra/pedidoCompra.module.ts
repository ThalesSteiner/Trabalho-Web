import { Module } from '@nestjs/common';
import { PedidoCompraController } from './pedidoCompra.controller';
import { PedidoCompraService } from './pedidoCompra.service';
import { PedidoCompraRepository } from './pedidoCompra.repository';

@Module({
  controllers: [PedidoCompraController],
  providers: [PedidoCompraService, PedidoCompraRepository]
})
export class pedidoCompraModule {} //só para garantir que funcione, pedidoCompra
