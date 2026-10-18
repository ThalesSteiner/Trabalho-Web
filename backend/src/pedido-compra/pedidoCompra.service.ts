import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { validarAcessoLoja } from '../auth/acesso-loja';
import type { UsuarioToken } from '../auth/auth.decorators';
import { EstoqueService } from '../estoque/estoque.service';
import { PedidoCompraRepository } from './pedidoCompra.repository';
import { PedidoCompra, Promocao, TotalPedidoCompra, ResultadoPaginado } from './pedidoCompra.entity';
import { CriarPedidoCompraDto, AtualizarPedidoCompraDto, ListarPedidosCompraDto } from './pedidoCompra.dto';

@Injectable()
export class PedidoCompraService {
  constructor(
    private readonly repository: PedidoCompraRepository,
    private readonly estoqueService: EstoqueService,
  ) {}

  async listar(dto: ListarPedidosCompraDto): Promise<ResultadoPaginado<PedidoCompra>> {
    const { pagina, limite, ...filtros } = dto;

    if (filtros.quantidadeMin !== undefined && filtros.quantidadeMax !== undefined && filtros.quantidadeMin > filtros.quantidadeMax) {
      throw new BadRequestException('quantidade mínima não pode ser maior que quantidade máxima');
    }
    return this.repository.listar(filtros, pagina ?? 1, limite ?? 10);
  }

  async buscarPorId(id: number): Promise<PedidoCompra> {
    const pedido = await this.repository.buscarPorId(id);
    if (!pedido) throw new NotFoundException('Pedido de compra não encontrado');
    return pedido;
  }

  async criar(usuario: UsuarioToken, { lote, dataValidade, ...dados }: CriarPedidoCompraDto): Promise<PedidoCompra> {
    validarAcessoLoja(usuario, dados.lojaId);
    if (!(await this.repository.fornecedorExiste(dados.fornecedorId))) throw new NotFoundException('Fornecedor não encontrado');

    const funcionarioId = usuario.perfil === 'FUNCIONARIO' ? await this.repository.funcionarioDoUsuario(usuario.sub) : -1;
    const dataRecebimento = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

    const id = await this.repository.transacao(async (trx) => {
      await this.estoqueService.registrarEntrada({ lojaId: dados.lojaId, itemId: dados.itemId, lote, dataValidade, quantidade: dados.quantidade }, trx);
      return this.repository.criar({ ...dados, dataRecebimento, funcionarioId }, trx);
    });
    return this.buscarPorId(id);
  }

  async atualizar(id: number, dto: AtualizarPedidoCompraDto): Promise<PedidoCompra> {
    if (dto.fornecedorId === undefined && dto.custoUnitario === undefined) {
      throw new BadRequestException('Informe no mínimo um campo para ser atualizado');
    }
    await this.buscarPorId(id);
    if (dto.fornecedorId !== undefined && !(await this.repository.fornecedorExiste(dto.fornecedorId))) {
      throw new NotFoundException('Fornecedor não encontrado');
    }
    const pedido = await this.repository.atualizar(id, dto);
    if (!pedido) throw new NotFoundException('Pedido de compra não encontrado');
    return pedido;
  }

  async remover(id: number): Promise<void> {
    const pedido = await this.buscarPorId(id);
    await this.repository.transacao(async (trx) => {
      await this.estoqueService.registrarBaixa({ lojaId: pedido.lojaId, itemId: pedido.itemId, quantidade: pedido.quantidade }, trx);
      await this.repository.remover(id, trx);
    });
  }

  async buscarPromocao(id: number): Promise<Promocao> {
    const pedido = await this.buscarPorId(id);
    const promocao = await this.repository.buscarPromocaoPorItem(pedido.itemId);
    if (!promocao) throw new NotFoundException('Item do pedido não possui promoções');
    return promocao;
  }

  async calcularTotal(id: number): Promise<TotalPedidoCompra> {
    const pedido = await this.buscarPorId(id);
    const item = await this.repository.buscarNomeDoItem(pedido.itemId);
    if (!item) throw new NotFoundException('Item do pedido não encontrado na tabela de itens');
    const totalEmCentavos = Math.round(pedido.custoUnitario * 100) * pedido.quantidade;

    return {
      pedidoId: pedido.id,
      item,
      quantidade: pedido.quantidade,
      custoUnitario: pedido.custoUnitario,
      total: totalEmCentavos / 100
    };
  }
}
