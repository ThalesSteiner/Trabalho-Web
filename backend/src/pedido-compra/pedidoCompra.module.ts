import { Module } from '@nestjs/common';
import { pedidoCompraController } from 'main/backend/src/pedido-compra/pedidoCompra.controller.ts';
import { pedidoCompraService } from 'main/backend/src/pedido-compra/pedidoCompra.service.ts';
import { pedidoCompraRepository } from 'main/backend/src/pedido-compra/pedidoCompra.repository.ts';

@Module({
  controllers: [pedidoCompraController],
  providers: [pedidoCompraService, pedidoCompraRepository]
})
export class pedidoCompraModule {} //só para garantir que funcione, pedidoCompra
