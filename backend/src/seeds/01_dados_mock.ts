import { hashSync } from 'bcryptjs';
import type { Knex } from 'knex';
import {
  administrador,
  bairrosComPrecoProprio,
  categoriasCusto,
  clientes,
  formasPagamento,
  fornecedores,
  funcionarios,
  itens,
  lojas,
  promocoes,
  senhaPadrao,
  validadePorCategoria,
} from '../common/database/dados-mock';

type Linha = Record<string, unknown>;

type Preco = { item_id: number; loja_id: number; valor: number; inicio_vigencia: string; fim_vigencia: string | null };

const DIAS_DE_VENDA = 60;

const criarSorteio = (semente: number) => () => {
  semente = (semente + 0x6d2b79f5) | 0;
  let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const meiaNoite = (data: string) => `${data}T00:00:00-03:00`;

const dia = (deslocamento: number) => {
  const data = new Date(Date.now() - 3 * 60 * 60 * 1000);
  data.setUTCHours(12, 0, 0, 0);
  data.setUTCDate(data.getUTCDate() + deslocamento);
  return data.toISOString().slice(0, 10);
};

const centavos = (valor: number) => Math.round(valor * 100) / 100;

const digito = (base: string, pesos: number[]) => {
  const resto = [...base].reduce((soma, c, i) => soma + Number(c) * pesos[i], 0) % 11;
  return resto < 2 ? '0' : String(11 - resto);
};

const pesosCpf = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const pesosCnpj = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const cpf = (n: number) => {
  let base = String(123456789 + n * 7654321).slice(-9);
  base += digito(base, pesosCpf.slice(1));
  return base + digito(base, pesosCpf);
};

const cnpj = (n: number) => {
  let base = String(10203040 + n * 1357911).slice(-8) + '0001';
  base += digito(base, pesosCnpj.slice(1));
  return base + digito(base, pesosCnpj);
};

const email = (nome: string, dominio: string) =>
  nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(' ').join('.') + '@' + dominio;

const inserir = async (knex: Knex, tabela: string, linhas: Linha[], retorno = 'id') => {
  const colunas = Object.keys(linhas[0]);
  const resultado: Linha[] = [];
  for (let i = 0; i < linhas.length; i += 1000) {
    const lote = linhas.slice(i, i + 1000);
    const valores = lote.map(() => `(${colunas.map(() => '?').join(', ')})`).join(', ');
    const parametros = lote.flatMap((linha) => colunas.map((coluna) => linha[coluna] ?? null));
    const { rows } = await knex.raw(
      `insert into ${tabela} (${colunas.join(', ')}) values ${valores} returning ${retorno}`,
      parametros as Knex.Value[],
    );
    resultado.push(...rows);
  }
  return resultado;
};

const mapa = (linhas: Linha[], chave: string) => new Map(linhas.map((l) => [String(l[chave]), Number(l.id)]));

// apaga os dados de exemplo e cria de novo, então pode rodar quantas vezes quiser
export async function seed(knex: Knex) {
  await limpar(knex);

  const sorteio = criarSorteio(2026);
  const entre = (min: number, max: number) => min + Math.floor(sorteio() * (max - min + 1));
  const umDe = <T>(lista: T[]) => lista[Math.floor(sorteio() * lista.length)];
  const alguns = <T>(lista: T[], quantidade: number) =>
    lista
      .map((valor) => ({ valor, ordem: sorteio() }))
      .sort((a, b) => a.ordem - b.ordem)
      .slice(0, quantidade)
      .map((v) => v.valor);
  const uuid = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const n = Math.floor(sorteio() * 16);
      return (c === 'x' ? n : (n & 0x3) | 0x8).toString(16);
    });

  const lojaPorNome = mapa(
    await inserir(
      knex,
      'dim_loja',
      lojas.map((l) => ({ nome_loja: l.nome, nome_condominio: l.condominio, latitude: l.latitude, longitude: l.longitude })),
      'id, nome_loja',
    ),
    'nome_loja',
  );
  const lojaIds = lojas.map((l) => lojaPorNome.get(l.nome)!);
  const lojasComPrecoProprio = lojas.filter((l) => bairrosComPrecoProprio.includes(l.bairro)).map((l) => lojaPorNome.get(l.nome)!);

  const pessoas = [
    { nome: administrador.nome, email: administrador.email, perfil: 'ADMIN' },
    ...funcionarios.map((f) => ({ nome: f.nome, email: email(f.nome, 'mercado.com'), perfil: 'FUNCIONARIO' })),
    ...clientes.map((nome) => ({ nome, email: email(nome, 'email.com'), perfil: 'CLIENTE' })),
  ];
  const usuarioPorCpf = new Map(
    (
      await inserir(
        knex,
        'usuario',
        pessoas.map((p, i) => ({ nome: p.nome, cpf: cpf(i + 1) })),
        'id, cpf',
      )
    ).map((u) => [String(u.cpf), String(u.id)]),
  );
  const usuarioIds = pessoas.map((_, i) => usuarioPorCpf.get(cpf(i + 1))!);

  const senhaHash = hashSync(senhaPadrao, 10);
  await inserir(
    knex,
    'login',
    pessoas.map((p, i) => ({ usuario_id: usuarioIds[i], email: p.email, senha_hash: senhaHash, perfil: p.perfil })),
  );

  const funcionarioPorUsuario = mapa(
    await inserir(
      knex,
      'dim_funcionario',
      funcionarios.map((f, i) => ({ usuario_id: usuarioIds[i + 1], loja_id: lojaIds[f.loja], nome: f.nome, cargo: f.cargo })),
      'id, usuario_id',
    ),
    'usuario_id',
  );
  const funcionariosDaLoja = lojaIds.map((_, l) =>
    funcionarios
      .map((f, i) => ({ ...f, id: funcionarioPorUsuario.get(usuarioIds[i + 1])! }))
      .filter((f) => f.loja === l)
      .map((f) => f.id),
  );

  const clienteIds = [
    ...mapa(
      await inserir(
        knex,
        'dim_cliente',
        clientes.map((nome, i) => ({ usuario_id: usuarioIds[i + 1 + funcionarios.length], nome })),
        'id, usuario_id',
      ),
      'usuario_id',
    ).values(),
  ];

  const fornecedorPorNome = mapa(
    await inserir(
      knex,
      'dim_fornecedor',
      fornecedores.map((f, i) => ({ razao_social: f.razaoSocial, cnpj: cnpj(i + 1), categorias: f.categorias })),
      'id, razao_social',
    ),
    'razao_social',
  );
  const fornecedorDaCategoria = (categoria: string) =>
    fornecedorPorNome.get(fornecedores.find((f) => f.categorias.includes(categoria))!.razaoSocial)!;

  const itemPorNome = mapa(
    await inserir(
      knex,
      'dim_item',
      itens.map((i) => ({ nome: i.nome, categoria: i.categoria })),
      'id, nome',
    ),
    'nome',
  );
  const catalogo = itens.map((i) => ({ ...i, id: itemPorNome.get(i.nome)! }));

  const precos: Preco[] = catalogo.flatMap((item) => {
    const linhas: Preco[] = [
      { item_id: item.id, loja_id: -1, valor: centavos(item.preco * 0.92), inicio_vigencia: dia(-120), fim_vigencia: dia(-30) },
      { item_id: item.id, loja_id: -1, valor: item.preco, inicio_vigencia: dia(-30), fim_vigencia: null },
    ];
    if (item.categoria === 'Bebidas') {
      for (const lojaId of lojasComPrecoProprio) {
        linhas.push({ item_id: item.id, loja_id: lojaId, valor: centavos(item.preco * 1.1), inicio_vigencia: dia(-45), fim_vigencia: null });
      }
    }
    return linhas;
  });
  const precoIds = await inserir(
    knex,
    'dim_preco',
    precos.map((p) => ({ ...p, inicio_vigencia: meiaNoite(p.inicio_vigencia), fim_vigencia: p.fim_vigencia && meiaNoite(p.fim_vigencia) })),
    `id, item_id, loja_id, to_char(inicio_vigencia, 'YYYY-MM-DD') as inicio`,
  );
  const tabelaDePrecos = precos.map((p) => ({
    ...p,
    id: Number(
      precoIds.find(
        (r) => Number(r.item_id) === p.item_id && Number(r.loja_id) === p.loja_id && r.inicio === p.inicio_vigencia,
      )!.id,
    ),
  }));
  const precoVigente = (itemId: number, lojaId: number, data: string) => {
    const vigentes = tabelaDePrecos.filter(
      (p) =>
        p.item_id === itemId &&
        p.inicio_vigencia <= data &&
        (p.fim_vigencia === null || data < p.fim_vigencia),
    );
    return vigentes.find((p) => p.loja_id === lojaId) ?? vigentes.find((p) => p.loja_id === -1)!;
  };

  const promocaoPorNome = mapa(
    await inserir(
      knex,
      'dim_promocao',
      promocoes.map((p) => ({
        item_id: itemPorNome.get(p.item),
        tipo_promocao_id: p.tipo,
        nome: p.nome,
        valor: p.valor ?? null,
        qtd_leve: p.leve ?? null,
        qtd_pague: p.pague ?? null,
      })),
      'id, nome',
    ),
    'nome',
  );
  const promocaoDoItem = new Map(
    promocoes.map((p) => [itemPorNome.get(p.item)!, { ...p, id: promocaoPorNome.get(p.nome)! }]),
  );

  const formaIds = [
    ...mapa(await inserir(knex, 'dim_forma_pagamento', formasPagamento.map((nome) => ({ nome })), 'id, nome'), 'nome').values(),
  ];
  const categoriaCustoPorNome = mapa(
    await inserir(knex, 'dim_categoria_custo', categoriasCusto.map((nome) => ({ nome })), 'id, nome'),
    'nome',
  );

  const vendas: Linha[] = [];
  const notas: { numero: string; emitida_em: string }[] = [];
  for (let d = -DIAS_DE_VENDA + 1; d <= 0; d++) {
    const data = dia(d);
    const horaMaxima = d === 0 ? Math.min(22, new Date(Date.now() - 3 * 60 * 60 * 1000).getUTCHours() - 1) : 22;
    if (horaMaxima < 7) continue;
    const fimDeSemana = [0, 6].includes(new Date(`${data}T12:00:00Z`).getUTCDay());
    for (const lojaId of lojaIds) {
      const pedidos = entre(3, 7) + (fimDeSemana ? 3 : 0);
      for (let p = 0; p < pedidos; p++) {
        const pedidoId = uuid();
        const hora = `${String(entre(7, horaMaxima)).padStart(2, '0')}:${String(entre(0, 59)).padStart(2, '0')}:00`;
        const clienteId = sorteio() < 0.8 ? umDe(clienteIds) : -1;
        const formaId = umDe(formaIds);
        const numeroNota = sorteio() < 0.7 ? String(notas.length + 1).padStart(9, '0') : null;
        if (numeroNota) notas.push({ numero: numeroNota, emitida_em: `${data}T${hora}-03:00` });

        for (const item of alguns(catalogo, entre(1, 4))) {
          const preco = precoVigente(item.id, lojaId, data);
          const valorUnitario = preco.valor;
          const promocao = promocaoDoItem.get(item.id);
          let quantidade = entre(1, 3);
          let valor = valorUnitario * quantidade;
          let promocaoId = -1;

          if (promocao && sorteio() < 0.4) {
            promocaoId = promocao.id;
            if (promocao.tipo === 'DESCONTO') valor = valorUnitario * quantidade * (1 - promocao.valor! / 100);
            if (promocao.tipo === 'DINHEIRO') valor = (valorUnitario - promocao.valor!) * quantidade;
            if (promocao.tipo === 'PRECO_FIXO') valor = promocao.valor! * quantidade;
            if (promocao.tipo === 'LEVE_PAGUE') {
              quantidade = promocao.leve! * entre(1, 2);
              valor = valorUnitario * (quantidade / promocao.leve!) * promocao.pague!;
            }
          }

          vendas.push({
            data_hora_venda: `${data}T${hora}-03:00`,
            loja_id: lojaId,
            item_id: item.id,
            cliente_id: clienteId,
            preco_id: preco.id,
            promocao_id: promocaoId,
            forma_pagamento_id: formaId,
            nota_fiscal_id: numeroNota,
            pedido_id: pedidoId,
            quantidade,
            valor_pago: centavos(valor),
          });
        }
      }
    }
  }

  const notaPorNumero = mapa(
    await inserir(
      knex,
      'dim_nota_fiscal',
      notas.map(({ numero, emitida_em }) => ({
        numero,
        chave_acesso: ('3526' + '12345678000190' + '65001' + numero + '1' + String(entre(10000000, 99999999))).padEnd(44, '0'),
        emitida_em,
      })),
      'id, numero',
    ),
    'numero',
  );
  await inserir(
    knex,
    'fat_venda',
    vendas.map((v) => ({ ...v, nota_fiscal_id: v.nota_fiscal_id ? notaPorNumero.get(v.nota_fiscal_id as string) : -1 })),
  );
  await knex.raw(`select setval('nota_fiscal_numero_seq', ${notas.length + 1}, false)`);

  const compras: Linha[] = [];
  const lotes = new Map<string, { lote: string; validade: string; quantidade: number }[]>();
  for (let d = -56, semana = 0; d <= 0; d += 7, semana++) {
    const data = dia(d);
    lojaIds.forEach((lojaId, l) => {
      catalogo.forEach((item, i) => {
        const validade = validadePorCategoria[item.categoria];
        if (validade > 30 && semana % 2 === 1) return;
        const quantidade = entre(12, 48);
        compras.push({
          data_recebimento: data,
          loja_id: lojaId,
          item_id: item.id,
          fornecedor_id: fornecedorDaCategoria(item.categoria),
          funcionario_id: sorteio() < 0.9 ? umDe(funcionariosDaLoja[l]) : -1,
          quantidade,
          custo_unitario: centavos(item.preco * (0.55 + sorteio() * 0.1)),
        });
        const chave = `${lojaId}-${item.id}`;
        lotes.set(chave, [
          ...(lotes.get(chave) ?? []),
          { lote: `L${data.replaceAll('-', '')}-${l + 1}-${i + 1}`, validade: dia(d + validade), quantidade },
        ]);
      });
    });
  }
  await inserir(knex, 'fat_compra', compras);

  const estoque: Linha[] = [];
  for (const [chave, historico] of lotes) {
    const [lojaId, itemId] = chave.split('-').map(Number);
    const [anterior, atual] = historico.slice(-2);
    if (anterior) {
      const sobra = entre(0, 5);
      if (sobra > 0) estoque.push({ data_referencia: dia(0), loja_id: lojaId, item_id: itemId, lote: anterior.lote, data_validade: anterior.validade, quantidade: sobra });
    }
    if (atual) {
      estoque.push({ data_referencia: dia(0), loja_id: lojaId, item_id: itemId, lote: atual.lote, data_validade: atual.validade, quantidade: entre(5, atual.quantidade) });
    }
  }
  await inserir(knex, 'fat_estoque', estoque, 'lote');

  const custos: Linha[] = [];
  const hoje = new Date();
  for (let m = 2; m >= 0; m--) {
    const mes = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - m, 5));
    if (mes > hoje) continue;
    const data = mes.toISOString().slice(0, 10);
    const referencia = data.slice(0, 7);
    lojaIds.forEach((lojaId) => {
      custos.push(
        { data_custo: data, loja_id: lojaId, categoria_custo_id: categoriaCustoPorNome.get('Aluguel'), descricao: `Aluguel ${referencia}`, valor: entre(2500, 4000) },
        { data_custo: data, loja_id: lojaId, categoria_custo_id: categoriaCustoPorNome.get('Energia'), descricao: `Energia ${referencia}`, valor: centavos(400 + sorteio() * 500) },
        { data_custo: data, loja_id: lojaId, categoria_custo_id: categoriaCustoPorNome.get('Internet'), descricao: `Internet ${referencia}`, valor: 149.9 },
        { data_custo: data, loja_id: lojaId, categoria_custo_id: categoriaCustoPorNome.get('Limpeza'), descricao: `Limpeza ${referencia}`, valor: centavos(300 + sorteio() * 300) },
      );
      if (sorteio() < 0.5) {
        custos.push({ data_custo: data, loja_id: lojaId, categoria_custo_id: categoriaCustoPorNome.get('Manutenção do totem'), descricao: `Manutenção do totem ${referencia}`, valor: centavos(150 + sorteio() * 200) });
      }
    });
    custos.push({ data_custo: data, loja_id: -1, categoria_custo_id: categoriaCustoPorNome.get('Salários'), descricao: `Folha de pagamento ${referencia}`, valor: entre(18000, 22000) });
  }
  await inserir(knex, 'fat_custo', custos);
}

async function limpar(knex: Knex) {
  for (const tabela of ['pagamento', 'fat_estoque', ...fatos]) {
    await knex.raw(`delete from ${tabela}`);
  }
  for (const tabela of dimensoes) {
    await knex.raw(`delete from ${tabela} where id <> -1`);
  }
  await knex.raw(`delete from usuario`);
  await knex.raw(`alter sequence nota_fiscal_numero_seq restart`);

  // ids voltam a começar do 1, então cada seed gera sempre os mesmos ids
  for (const tabela of [...fatos, ...dimensoes]) {
    await knex.raw(`alter table ${tabela} alter column id restart`);
  }
}

const fatos = ['fat_custo', 'fat_compra', 'fat_venda'];
const dimensoes = [
  'dim_preco',
  'dim_promocao',
  'dim_nota_fiscal',
  'dim_item',
  'dim_cliente',
  'dim_funcionario',
  'dim_fornecedor',
  'dim_forma_pagamento',
  'dim_categoria_custo',
  'dim_loja',
];
