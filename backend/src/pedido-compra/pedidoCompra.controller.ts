import { Controller, Get, Post, Put, Patch, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { pedidoCompraService } from 'main/backend/src/pedido-compra/pedidoCompra.service.ts';
import * as pedidoCompraEntidade from 'main/backend/src/pedido-compra/pedidoCompra.entity.ts';

@Controller('pedido-compras')
export class pedidoCompraController {
  constructor(private readonly service: pedidoCompraService) {}

  @Get()
  listar() { return this.service.listar(); }

  @Get(':id')
  buscarPorId(@Param('id') id: string) { return this.service.buscarPorId(id);}

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  excluir(@Param('id') id: string) {
    return this.service.excluir(id);
  }
  
}
