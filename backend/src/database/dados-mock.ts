export const senhaPadrao = 'Senha@123';

export const condominios = [
  { nome: 'Condomínio Península', bairro: 'Barra da Tijuca', latitude: -22.990254, longitude: -43.35119, lojas: ['Mercadinho Península Norte', 'Mercadinho Península Sul'] },
  { nome: 'Condomínio Nova Ipanema', bairro: 'Barra da Tijuca', latitude: -23.00314, longitude: -43.362015, lojas: ['Mercadinho Nova Ipanema'] },
  { nome: 'Condomínio Novo Leblon', bairro: 'Barra da Tijuca', latitude: -23.003621, longitude: -43.383349, lojas: ['Mercadinho Novo Leblon'] },
  { nome: 'Condomínio Mandala', bairro: 'Barra da Tijuca', latitude: -23.003761, longitude: -43.375521, lojas: ['Mercadinho Mandala'] },
  { nome: 'Condomínio Vivendas da Barra', bairro: 'Barra da Tijuca', latitude: -23.008835, longitude: -43.325553, lojas: ['Mercadinho Vivendas'] },
  { nome: 'Alphaville Barra da Tijuca', bairro: 'Barra da Tijuca', latitude: -22.99199, longitude: -43.396929, lojas: ['Mercadinho Alphaville'] },
  { nome: 'Condomínio Riserva Uno', bairro: 'Barra da Tijuca', latitude: -23.002616, longitude: -43.401603, lojas: ['Mercadinho Riserva Uno'] },
  { nome: 'Condomínio Interlagos de Itaúna', bairro: 'Barra da Tijuca', latitude: -22.996501, longitude: -43.414808, lojas: ['Mercadinho Interlagos'] },
  { nome: 'Condomínio Mansões', bairro: 'Barra da Tijuca', latitude: -23.005234, longitude: -43.416252, lojas: ['Mercadinho Mansões'] },
  { nome: 'Condomínio Pedra de Itaúna', bairro: 'Barra da Tijuca', latitude: -23.00729, longitude: -43.422209, lojas: ['Mercadinho Pedra de Itaúna'] },
  { nome: 'Ilha Pura', bairro: 'Barra Olímpica', latitude: -22.985512, longitude: -43.417923, lojas: ['Mercadinho Ilha Pura'] },
  { nome: 'Selva de Pedra', bairro: 'Leblon', latitude: -22.980328, longitude: -43.219668, lojas: ['Mercadinho Selva de Pedra'] },
  { nome: 'Cruzada São Sebastião', bairro: 'Leblon', latitude: -22.98198, longitude: -43.215882, lojas: ['Mercadinho Cruzada'] },
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
  { razaoSocial: 'Distribuidora Bebidas Sul Ltda', categorias: ['Bebidas'], cnpj: 12345678901234 },
  { razaoSocial: 'Laticínios Serra Azul S.A.', categorias: ['Laticínios', 'Congelados'], cnpj: 22345678901234  },
  { razaoSocial: 'Atacadão Mercearia Paulista Ltda', categorias: ['Mercearia', 'Limpeza', 'Higiene'], cnpj: 32345678901234  },
  { razaoSocial: 'Padaria Pão Dourado Ltda', categorias: ['Padaria'], cnpj: 42345678901234  },
  { razaoSocial: 'Hortifruti Campo Verde Ltda', categorias: ['Hortifruti'], cnpj: 52345678901234  },
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
  { nome: 'Água mineral 500ml', categoria: 'Bebidas', preco: 2.5 },
  { nome: 'Refrigerante lata 350ml', categoria: 'Bebidas', preco: 4.5 },
  { nome: 'Suco de laranja 1L', categoria: 'Bebidas', preco: 8.9 },
  { nome: 'Cerveja long neck 355ml', categoria: 'Bebidas', preco: 6.5 },
  { nome: 'Leite integral 1L', categoria: 'Laticínios', preco: 5.49 },
  { nome: 'Iogurte natural 170g', categoria: 'Laticínios', preco: 3.2 },
  { nome: 'Queijo muçarela 200g', categoria: 'Laticínios', preco: 12.9 },
  { nome: 'Pão de forma 500g', categoria: 'Padaria', preco: 9.8 },
  { nome: 'Bolo de cenoura', categoria: 'Padaria', preco: 14.9 },
  { nome: 'Café torrado 500g', categoria: 'Mercearia', preco: 18.9 },
  { nome: 'Arroz branco 5kg', categoria: 'Mercearia', preco: 27.9 },
  { nome: 'Feijão carioca 1kg', categoria: 'Mercearia', preco: 8.49 },
  { nome: 'Macarrão espaguete 500g', categoria: 'Mercearia', preco: 4.79 },
  { nome: 'Biscoito recheado 140g', categoria: 'Mercearia', preco: 3.99 },
  { nome: 'Detergente 500ml', categoria: 'Limpeza', preco: 2.79 },
  { nome: 'Sabão em pó 1kg', categoria: 'Limpeza', preco: 15.9 },
  { nome: 'Papel higiênico 12 rolos', categoria: 'Higiene', preco: 21.9 },
  { nome: 'Creme dental 90g', categoria: 'Higiene', preco: 4.99 },
  { nome: 'Banana prata kg', categoria: 'Hortifruti', preco: 6.99 },
  { nome: 'Tomate kg', categoria: 'Hortifruti', preco: 8.49 },
  { nome: 'Pizza congelada 460g', categoria: 'Congelados', preco: 19.9 },
  { nome: 'Sorvete 1,5L', categoria: 'Congelados', preco: 24.9 },
];

export const promocoes = [
  { item: 'Iogurte natural 170g', nome: 'Iogurte 20% off', tipo: 'DESCONTO', valor: 20 },
  { item: 'Café torrado 500g', nome: 'Café com R$ 2 de desconto', tipo: 'DINHEIRO', valor: 2 },
  { item: 'Pão de forma 500g', nome: 'Pão de forma por R$ 7,99', tipo: 'PRECO_FIXO', valor: 7.99 },
  { item: 'Refrigerante lata 350ml', nome: 'Refrigerante leve 3 pague 2', tipo: 'LEVE_PAGUE', leve: 3, pague: 2 },
];

export const formasPagamento = ['PIX', 'Cartão de crédito', 'Cartão de débito', 'Vale-alimentação'];

export const categoriasCusto = ['Aluguel', 'Energia', 'Internet', 'Manutenção do totem', 'Limpeza', 'Salários'];
