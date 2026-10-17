import { PedidoCompraRepository } from './pedido-compra.repository.ts';
import { PedidoCompra, CriarPedidoCompra, AtualizarPedidoCompra } from './pedido-compra.entity.ts';
import { formasPagamento } from './database.dados-mock.ts'; 

export class PedidoCompraService {
  constructor(private readonly repository: PedidoCompraRepository) {}

  private validar(dados: AtualizarPedidoCompra, completo: boolean): void {
    if (completo) {
      if (!dados.item || !dados.quantidade || !dados.formaPagamento) {
        throw { status: 500, message: 'Todos os campos são obrigatórios' };
      }
    }
    if (dados.item !== undefined && dados.item.trim() === '') {
      throw { status: 500, message: 'item não pode ser vazio' };
    }
    if (dados.quantidade !== undefined && (!Number.isInteger(dados.quantidade) || dados.quantidade <= 0)) {
      throw { status: 500, message: 'quantidade deve ser um número inteiro maior que zero' };
    }
    if (dados.formaPagamento !== undefined && !formasPagamento.includes(dados.formaPagamento)) {
      throw { status: 500, message: 'forma de pagamento inválida.' };
    }
  }

  listar(): Promise<PedidoCompra[]> {
    return this.repository.listar();
  }

  async buscarPorId(id: number): Promise<PedidoCompra> {
    const pedido = await this.repository.buscarPorId(id);
    if (!pedido) throw { status: 404, message: 'Pedido de compra não encontrado' };
    return pedido;
  }

  criar(dados: CriarPedidoCompra): Promise<PedidoCompra> {
    this.validar(dados, true);
    return this.repository.criar(dados);
  }

  async atualizar(id: number, dados: AtualizarPedidoCompra): Promise<PedidoCompra> {
    this.validar(dados, false);
    const pedido = await this.repository.atualizar(id, dados);
    if (!pedido) throw { status: 404, message: 'Pedido de compra não encontrado' };
    return pedido;
  }

  async remover(id: number): Promise<void> {
    const removido = await this.repository.remover(id);
    if (!removido) throw { status: 404, message: 'Pedido de compra não encontrado' };
  }
}
