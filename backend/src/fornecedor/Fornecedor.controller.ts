import { Controller, Get, Post, Put, Patch, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FornecedorService } from 'main/backend/src/fornecedor/Fornecedor.service.ts';
import * as FornecedorEntidade from 'main/backend/src/fornecedor/Fornecedor.entity.ts';

@Controller('fornecedores')
export class FornecedorController {
  constructor(private service: FornecedorService) {}

  @Get()
  listar() { return this.service.listar(); }

  @Get(':id')
  buscarPorId(@Param('id') id: string) { return this.service.buscarPorId(id);}

  @Get('cnpj/:cnpj')
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

  @Get(':id/categorias')//recebe as categorias que você quiser procurar do body, e retorna quais tem caso tenham no id escolhido
  buscarCategoriasExistentes(@Param('id') id: string, @Query('categorias') categorias: string) {
    const listaCategorias = categorias ? categorias.split(','): [];
    return this.service.buscarCategoriasExistentes(id,listaCategorias);
  }
  
}
