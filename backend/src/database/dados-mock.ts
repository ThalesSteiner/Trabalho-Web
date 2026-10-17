export const senhaPadrao = 'Senha@123';

export const condominios = [
  { id: 1, nome: 'Condomínio Península', bairro: 'Barra da Tijuca', latitude: -22.990254, longitude: -43.35119, lojas: ['Mercadinho Península Norte', 'Mercadinho Península Sul'] },
  { id: 2, nome: 'Condomínio Nova Ipanema', bairro: 'Barra da Tijuca', latitude: -23.00314, longitude: -43.362015, lojas: ['Mercadinho Nova Ipanema'] },
  { id: 3, nome: 'Condomínio Novo Leblon', bairro: 'Barra da Tijuca', latitude: -23.003621, longitude: -43.383349, lojas: ['Mercadinho Novo Leblon'] },
  { id: 4, nome: 'Condomínio Mandala', bairro: 'Barra da Tijuca', latitude: -23.003761, longitude: -43.375521, lojas: ['Mercadinho Mandala'] },
  { id: 5, nome: 'Condomínio Vivendas da Barra', bairro: 'Barra da Tijuca', latitude: -23.008835, longitude: -43.325553, lojas: ['Mercadinho Vivendas'] },
  { id: 6, nome: 'Alphaville Barra da Tijuca', bairro: 'Barra da Tijuca', latitude: -22.99199, longitude: -43.396929, lojas: ['Mercadinho Alphaville'] },
  { id: 7, nome: 'Condomínio Riserva Uno', bairro: 'Barra da Tijuca', latitude: -23.002616, longitude: -43.401603, lojas: ['Mercadinho Riserva Uno'] },
  { id: 8, nome: 'Condomínio Interlagos de Itaúna', bairro: 'Barra da Tijuca', latitude: -22.996501, longitude: -43.414808, lojas: ['Mercadinho Interlagos'] },
  { id: 9, nome: 'Condomínio Mansões', bairro: 'Barra da Tijuca', latitude: -23.005234, longitude: -43.416252, lojas: ['Mercadinho Mansões'] },
  { id: 10, nome: 'Condomínio Pedra de Itaúna', bairro: 'Barra da Tijuca', latitude: -23.00729, longitude: -43.422209, lojas: ['Mercadinho Pedra de Itaúna'] },
  { id: 11, nome: 'Ilha Pura', bairro: 'Barra Olímpica', latitude: -22.985512, longitude: -43.417923, lojas: ['Mercadinho Ilha Pura'] },
  { id: 12, nome: 'Selva de Pedra', bairro: 'Leblon', latitude: -22.980328, longitude: -43.219668, lojas: ['Mercadinho Selva de Pedra'] },
  { id: 13, nome: 'Cruzada São Sebastião', bairro: 'Leblon', latitude: -22.98198, longitude: -43.215882, lojas: ['Mercadinho Cruzada'] },
];

export const lojas = condominios.flatMap((c) =>
  c.lojas.map((nome) => ({ nome, condominio: c.nome, bairro: c.bairro, latitude: c.latitude, longitude: c.longitude })),
);

export const bairrosComPrecoProprio = ['Leblon'];

export const administrador = { nome: 'Administrador do Sistema', email: 'admin@mercado.com' };

const primeirosNomes = [
  'Ana', 'Bruno', 'Camila', 'Daniel', 'Elisa', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João',
  'Larissa', 'Mateus', 'Natália', 'Otávio', 'Paula', 'Rafael', 'Sofia', 'Thiago', 'Vanessa', 'Lucas',
];

const sobrenomes = [
  'Souza', 'Martins', 'Ferreira', 'Ribeiro', 'Carvalho', 'Barbosa', 'Nunes', 'Castro', 'Moreira', 'Pereira',
  'Duarte', 'Cardoso', 'Freitas', 'Mendes', 'Azevedo', 'Correia', 'Teixeira', 'Rocha', 'Almeida', 'Gomes',
];

const nomes = Array.from(
  { length: lojas.length * 2 + 60 },
  (_, i) => `${primeirosNomes[i % 20]} ${sobrenomes[(i + Math.floor(i / 20) * 3) % 20]}`,
);

export const funcionarios = lojas.flatMap((_, loja) => [
  { nome: nomes[loja * 2], cargo: 'GERENTE', loja },
  { nome: nomes[loja * 2 + 1], cargo: 'REPOSITOR', loja },
]);

export const clientes = nomes.slice(lojas.length * 2);

export const fornecedores = [
  { id: 1, razaoSocial: 'Distribuidora Bebidas Sul Ltda', categorias: ['Bebidas'], cnpj: 12345678901234 },
  { id: 2, razaoSocial: 'Laticínios Serra Azul S.A.', categorias: ['Laticínios', 'Congelados'], cnpj: 22345678901234  },
  { id: 3, razaoSocial: 'Atacadão Mercearia Paulista Ltda', categorias: ['Mercearia', 'Limpeza', 'Higiene'], cnpj: 32345678901234  },
  { id: 4, razaoSocial: 'Padaria Pão Dourado Ltda', categorias: ['Padaria'], cnpj: 42345678901234  },
  { id: 5, razaoSocial: 'Hortifruti Campo Verde Ltda', categorias: ['Hortifruti'], cnpj: 52345678901234  },
];

export const validadePorCategoria: Record<string, number> = {
  Bebidas: 180,
  Laticínios: 25,
  Padaria: 6,
  Mercearia: 365,
  Limpeza: 720,
  Higiene: 720,
  Hortifruti: 8,
  Congelados: 120,
};

export const itens = [
  { id: 1,nome: 'Água mineral 500ml', categoria: 'Bebidas', preco: 2.5 },
  { id: 2,nome: 'Refrigerante lata 350ml', categoria: 'Bebidas', preco: 4.5 },
  { id: 3,nome: 'Suco de laranja 1L', categoria: 'Bebidas', preco: 8.9 },
  { id: 4,nome: 'Cerveja long neck 355ml', categoria: 'Bebidas', preco: 6.5 },
  { id: 5,nome: 'Leite integral 1L', categoria: 'Laticínios', preco: 5.49 },
  { id: 6,nome: 'Iogurte natural 170g', categoria: 'Laticínios', preco: 3.2 },
  { id: 7,nome: 'Queijo muçarela 200g', categoria: 'Laticínios', preco: 12.9 },
  { id: 8,nome: 'Pão de forma 500g', categoria: 'Padaria', preco: 9.8 },
  { id: 9,nome: 'Bolo de cenoura', categoria: 'Padaria', preco: 14.9 },
  { id: 10,nome: 'Café torrado 500g', categoria: 'Mercearia', preco: 18.9 },
  { id: 11,nome: 'Arroz branco 5kg', categoria: 'Mercearia', preco: 27.9 },
  { id: 12,nome: 'Feijão carioca 1kg', categoria: 'Mercearia', preco: 8.49 },
  { id: 13,nome: 'Macarrão espaguete 500g', categoria: 'Mercearia', preco: 4.79 },
  { id: 14,nome: 'Biscoito recheado 140g', categoria: 'Mercearia', preco: 3.99 },
  { id: 15,nome: 'Detergente 500ml', categoria: 'Limpeza', preco: 2.79 },
  { id: 16,nome: 'Sabão em pó 1kg', categoria: 'Limpeza', preco: 15.9 },
  { id: 17,nome: 'Papel higiênico 12 rolos', categoria: 'Higiene', preco: 21.9 },
  { id: 18,nome: 'Creme dental 90g', categoria: 'Higiene', preco: 4.99 },
  { id: 19,nome: 'Banana prata kg', categoria: 'Hortifruti', preco: 6.99 },
  { id: 20,nome: 'Tomate kg', categoria: 'Hortifruti', preco: 8.49 },
  { id: 21,nome: 'Pizza congelada 460g', categoria: 'Congelados', preco: 19.9 },
  { id: 22,nome: 'Sorvete 1,5L', categoria: 'Congelados', preco: 24.9 },
];

export const promocoes = [
  { id: 1,item: 'Iogurte natural 170g', nome: 'Iogurte 20% off', tipo: 'DESCONTO', valor: 20 },
  { id:2,item: 'Café torrado 500g', nome: 'Café com R$ 2 de desconto', tipo: 'DINHEIRO', valor: 2 },
  { id: 3,item: 'Pão de forma 500g', nome: 'Pão de forma por R$ 7,99', tipo: 'PRECO_FIXO', valor: 7.99 },
  { id: 4,item: 'Refrigerante lata 350ml', nome: 'Refrigerante leve 3 pague 2', tipo: 'LEVE_PAGUE', leve: 3, pague: 2 },
];

export const formasPagamento = ['PIX', 'Cartão de crédito', 'Cartão de débito', 'Vale-alimentação'];

export const categoriasCusto = ['Aluguel', 'Energia', 'Internet', 'Manutenção do totem', 'Limpeza', 'Salários'];

export const pedidosCompra = [
  { id: 1, item: 'Água mineral 500ml', quantidade: 6, formaPagamento: 'PIX' },
  { id: 2, item: 'Refrigerante lata 350ml', quantidade: 3, formaPagamento: 'Cartão de crédito' },
  { id: 3, item: 'Suco de laranja 1L', quantidade: 2, formaPagamento: 'Cartão de débito' },
  { id: 4, item: 'Cerveja long neck 355ml', quantidade: 12, formaPagamento: 'PIX' },
  { id: 5, item: 'Leite integral 1L', quantidade: 4, formaPagamento: 'Vale-alimentação' },
  { id: 6, item: 'Iogurte natural 170g', quantidade: 5, formaPagamento: 'Cartão de crédito' },
  { id: 7, item: 'Queijo muçarela 200g', quantidade: 2, formaPagamento: 'PIX' },
  { id: 8, item: 'Pão de forma 500g', quantidade: 1, formaPagamento: 'Cartão de débito' },
  { id: 9, item: 'Bolo de cenoura', quantidade: 1, formaPagamento: 'PIX' },
  { id: 10, item: 'Café torrado 500g', quantidade: 2, formaPagamento: 'Vale-alimentação' },
  { id: 11, item: 'Arroz branco 5kg', quantidade: 1, formaPagamento: 'Cartão de crédito' },
  { id: 12, item: 'Feijão carioca 1kg', quantidade: 3, formaPagamento: 'Vale-alimentação' },
  { id: 13, item: 'Macarrão espaguete 500g', quantidade: 4, formaPagamento: 'Cartão de débito' },
  { id: 14, item: 'Biscoito recheado 140g', quantidade: 6, formaPagamento: 'PIX' },
  { id: 15, item: 'Detergente 500ml', quantidade: 3, formaPagamento: 'Cartão de crédito' },
  { id: 16, item: 'Sabão em pó 1kg', quantidade: 2, formaPagamento: 'Cartão de débito' },
  { id: 17, item: 'Papel higiênico 12 rolos', quantidade: 1, formaPagamento: 'PIX' },
  { id: 18, item: 'Creme dental 90g', quantidade: 2, formaPagamento: 'Cartão de crédito' },
  { id: 19, item: 'Banana prata kg', quantidade: 2, formaPagamento: 'Vale-alimentação' },
  { id: 20, item: 'Tomate kg', quantidade: 1, formaPagamento: 'PIX' },
  { id: 21, item: 'Pizza congelada 460g', quantidade: 2, formaPagamento: 'Cartão de débito' },
  { id: 22, item: 'Sorvete 1,5L', quantidade: 1, formaPagamento: 'Cartão de crédito' },
];
