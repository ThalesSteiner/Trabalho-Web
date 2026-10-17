import { Router } from 'express';
import { PedidoCompraRepository } from './pedido-compra.repository.ts';
import { PedidoCompraService } from './pedido-compra.service.ts';
import { PedidoCompraController } from './pedido-compra.controller.ts';

const repository = new PedidoCompraRepository();
const service = new PedidoCompraService(repository);
const controller = new PedidoCompraController(service);

export const rota = Router();

rota.get('/', controller.listar);
rota.get('/:id', controller.buscarPorId);
rota.post('/', controller.criar);
rota.put('/:id', controller.atualizar);
rota.delete('/:id', controller.remover);
