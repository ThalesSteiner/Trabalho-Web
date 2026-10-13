import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CriarPagamentoDto } from './dto/criar-pagamento.dto';
import { PagamentoRepository, Promocao } from './pagamento.repository';
import { ItemPago } from './pagamento.types';

const centavos = (valor: number) => Math.round(valor * 100) / 100;

@Injectable()
export class PagamentoService {
  constructor(private readonly repository: PagamentoRepository) {}

  formas() {
    return this.repository.formas();
  }

  async criar(usuarioId: string, { lojaId, formaPagamentoId, itens }: CriarPagamentoDto) {
    if (!(await this.repository.buscarLoja(lojaId))) throw new NotFoundException('Loja não encontrada');

    const forma = await this.repository.buscarForma(formaPagamentoId);
    if (!forma) throw new NotFoundException('Forma de pagamento não encontrada');

    const itensPagos = await Promise.all(itens.map((item) => this.calcularItem(lojaId, item.itemId, item.quantidade)));
    const valor = centavos(itensPagos.reduce((soma, item) => soma + item.valorPago, 0));

    return this.repository.criar({ usuarioId, lojaId, formaPagamentoId, itens: itensPagos, valor });
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
