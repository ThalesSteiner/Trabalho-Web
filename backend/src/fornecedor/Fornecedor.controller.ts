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

  @Post()
  criar(@Body() caminho: CriarFornecedorDto) {return this.service.criar(caminho);}

  @Put(':id')
  atualizar(@Param('id') id: string, @Body() caminho: AtualizarFornecedorDto) {
    return this.service.atualizar(id, caminho);
  }

  @Patch(':id')
  atualizarParcial(@Param('id') id: string,@Body() caminho: AtualizarParcialFornecedorDto) {
    return this.service.atualizarParcial(id, caminho);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  excluir(@Param('id') id: string) {
    return this.service.excluir(id);
  }
}
