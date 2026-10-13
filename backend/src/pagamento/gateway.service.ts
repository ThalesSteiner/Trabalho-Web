import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

type Resposta = { aprovado: true; codigo: string } | { aprovado: false; motivo: string };

const limites: Record<string, number> = {
  'Cartão de crédito': 1000,
  'Cartão de débito': 500,
  'Vale-alimentação': 500,
};

@Injectable()
export class GatewayService {
  async cobrar(forma: string, valor: number): Promise<Resposta> {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));
    if (valor > (limites[forma] ?? Infinity)) return { aprovado: false, motivo: 'Limite insuficiente' };
    return { aprovado: true, codigo: 'SIM-' + randomUUID().slice(0, 8).toUpperCase() };
  }
}
