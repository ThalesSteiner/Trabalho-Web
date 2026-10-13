import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { UsuarioToken } from '../auth/auth.decorators';
import { NotaFiscalService } from '../nota-fiscal/nota-fiscal.service';
import { CriarPagamentoDto } from './dto/criar-pagamento.dto';
import { ListarPagamentosDto } from './dto/listar-pagamentos.dto';
import { GatewayService } from './gateway.service';
import { PagamentoRepository, Promocao } from './pagamento.repository';
import { ItemPago } from './pagamento.types';

const centavos = (valor: number) => Math.round(valor * 100) / 100;

@Injectable()
export class PagamentoService {
  constructor(
    private readonly repository: PagamentoRepository,
    private readonly gateway: GatewayService,
    private readonly notaFiscalService: NotaFiscalService,
  ) {}

  formas() {
    return this.repository.formas();
  }

  async listar(usuario: UsuarioToken, filtros: ListarPagamentosDto) {
    const usuarioId = usuario.perfil === 'CLIENTE' ? usuario.sub : undefined;
    const { data, total } = await this.repository.listar(filtros, usuarioId);
    return { data, total, page: filtros.page, limit: filtros.limit };
  }

  async buscar(usuario: UsuarioToken, id: string) {
    const pagamento = await this.repository.buscarPorId(id);
    if (!pagamento || (usuario.perfil === 'CLIENTE' && pagamento.usuarioId !== usuario.sub)) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return pagamento;
  }

  async criar(usuarioId: string, { lojaId, formaPagamentoId, itens }: CriarPagamentoDto) {
    if (!(await this.repository.buscarLoja(lojaId))) throw new NotFoundException('Loja não encontrada');

    const forma = await this.repository.buscarForma(formaPagamentoId);
    if (!forma) throw new NotFoundException('Forma de pagamento não encontrada');

    const itensPagos = await Promise.all(itens.map((item) => this.calcularItem(lojaId, item.itemId, item.quantidade)));
    const valor = centavos(itensPagos.reduce((soma, item) => soma + item.valorPago, 0));
    const pagamento = await this.repository.criar({ usuarioId, lojaId, formaPagamentoId, itens: itensPagos, valor });

    const resposta = await this.gateway.cobrar(forma.nome, valor);
    const processadoEm = new Date();
    if (!resposta.aprovado) {
      await this.repository.atualizar(pagamento.id, { status: 'RECUSADO', motivo: resposta.motivo, processadoEm });
      return this.repository.buscarPorId(pagamento.id);
    }

    await this.repository.transacao(async (trx) => {
      const nota = await this.notaFiscalService.emitir(trx);
      const clienteId = await this.repository.clienteDoUsuario(usuarioId, trx);
      await this.repository.registrarVenda({ ...pagamento, processadoEm }, clienteId, nota.id, trx);
      await this.repository.atualizar(
        pagamento.id,
        { status: 'APROVADO', codigoTransacao: resposta.codigo, notaFiscalId: nota.id, processadoEm },
        trx,
      );
    });
    return this.repository.buscarPorId(pagamento.id);
  }

  async estornar(id: string) {
    const pagamento = await this.repository.buscarPorId(id);
    if (!pagamento) throw new NotFoundException('Pagamento não encontrado');
    if (pagamento.status !== 'APROVADO') throw new BadRequestException('Só pagamento aprovado pode ser estornado');

    await this.repository.transacao(async (trx) => {
      await this.repository.removerVenda(id, trx);
      await this.notaFiscalService.cancelar(pagamento.notaFiscalId, trx);
      await this.repository.atualizar(id, { status: 'ESTORNADO' }, trx);
    });
    return this.repository.buscarPorId(id);
  }

  private async calcularItem(lojaId: number, itemId: number, quantidade: number): Promise<ItemPago> {
    const preco = await this.repository.precoVigente(itemId, lojaId);
    if (!preco) throw new BadRequestException(`Item ${itemId} sem preço nesta loja`);

    const promocao = await this.repository.promocaoDoItem(itemId);
    const cheio = centavos(preco.valor * quantidade);
    const valorPago = centavos(this.aplicarPromocao(preco.valor, quantidade, promocao));

    return {
      itemId,
      quantidade,
      precoId: preco.id,
      valorUnitario: preco.valor,
      promocaoId: promocao && valorPago < cheio ? promocao.id : -1,
      valorPago,
    };
  }

  private aplicarPromocao(unitario: number, quantidade: number, promocao?: Promocao) {
    const valor = promocao?.valor ?? 0;
    switch (promocao?.tipo) {
      case 'DESCONTO':
        return unitario * quantidade * (1 - valor / 100);
      case 'DINHEIRO':
        return Math.max(unitario - valor, 0) * quantidade;
      case 'PRECO_FIXO':
        return Math.min(valor, unitario) * quantidade;
      case 'LEVE_PAGUE': {
        const leve = promocao.leve!;
        return (Math.floor(quantidade / leve) * promocao.pague! + (quantidade % leve)) * unitario;
      }
      default:
        return unitario * quantidade;
    }
  }
}
