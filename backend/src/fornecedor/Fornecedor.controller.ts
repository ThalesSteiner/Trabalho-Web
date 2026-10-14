import {Controller, Get, Post, Put, Patch, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FornecedorService } from 'Trabalho-Web/tree/main/backend/src/fornecedor/Fornecedor.service.ts';
import * as FornecedorEntidade from 'Trabalho-Web/tree/main/backend/src/fornecedor/Fornecedor.entity.ts';

@Controller('fornecedores')
export class FornecedorController {
  constructor(private service: FornecedorService) {}

  @Get()
  listar() { return this.service.listar(); }

  @Get(':id')
  buscarPorId(@Param('id') id: string) { return this.service.buscarPorId(id);}

  @Get(':cnpj')
  buscarPorCnpj(@Param('cnpj') cnpj: string) { return this.service.buscarPorCnpj(cnpj);}

  @Post()
  criar(@Body() dados: FornecedorEntidade.FornecedorSemId) {return this.service.criar(dados);}

  @Put(':id')
  atualizar(@Param('id') id: string, @Body() dados: FornecedorEntidade.FornecedorSemId) {
    return this.service.atualizar(id, dados);
  }

  @Patch(':id')
  atualizarParcial(@Param('id') id: string,@Body() dados: FornecedorEntidade.AtualizarParcialFornecedor) {
    return this.service.atualizarParcial(id, dados);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  excluir(@Param('id') id: string) {
    return this.service.excluir(id);
  }
}
