import { Controller, Get, Post, Put, Patch, Delete, Param, Body, HttpCode, HttpStatus, Query, ParseIntPipe } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { FornecedorService } from './Fornecedor.service';
import { AtualizarFornecedorDto, AtualizarParcialFornecedorDto, BuscarCategoriasExistentesDto, CriarFornecedorDto, ListarFornecedoresDto } from './Fornecedor.dto';

@Perfis('ADMIN')
@Controller('fornecedores')
export class FornecedorController {
  constructor(private service: FornecedorService) {}

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get()
  listar(@Query() query: ListarFornecedoresDto) {return this.service.listar(query);}

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get('cnpj/:cnpj')
  buscarPorCnpj(@Param('cnpj') cnpj: string) { return this.service.buscarPorCnpj(cnpj);}

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) { return this.service.buscarPorId(id);}

  @Post()
  criar(@Body() dados: CriarFornecedorDto) {return this.service.criar(dados);}

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarFornecedorDto) {
    return this.service.atualizar(id, dados);
  }

  @Patch(':id')
  atualizarParcial(@Param('id', ParseIntPipe) id: number,@Body() dados: AtualizarParcialFornecedorDto) {
    return this.service.atualizarParcial(id, dados);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  excluir(@Param('id', ParseIntPipe) id: number) {
    return this.service.excluir(id);
  }

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get(':id/categorias')//recebe as categorias que você quiser procurar na query, e retorna quais tem caso tenham no id escolhido
  buscarCategoriasExistentes(@Param('id', ParseIntPipe) id: number, @Query() query: BuscarCategoriasExistentesDto) {
    return this.service.buscarCategoriasExistentes(id, query.categorias);
  }

}
