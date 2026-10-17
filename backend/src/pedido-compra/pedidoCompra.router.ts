import { Router } from 'express';
import knex from 'knex';
import config from '../common/database/knexfile';
import { PedidoCompraRepository } from './pedidoCompra.repository';
import { PedidoCompraService } from './pedidoCompra.service';
import { PedidoCompraController } from './pedidoCompra.controller';

const repository = new PedidoCompraRepository(knex(config));
const service = new PedidoCompraService(repository);
const controller = new PedidoCompraController(service);

export const rota = Router();

rota.get('/', controller.listar);
rota.get('/:id', controller.buscarPorId);
rota.post('/', controller.criar);
rota.put('/:id', controller.atualizar);
rota.delete('/:id', controller.remover);
rota.get('/:id/promocao', controller.buscarPromocao); //esse volta se tem uma promoção com o item de tal id
rota.get('/:id/total', controller.calcularTotal); //esse volta o custo total do pedido-compra
