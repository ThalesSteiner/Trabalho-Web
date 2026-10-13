export const FornecedorRoutes = {
  listar: { method: 'GET', path: '/fornecedores'},
  buscarPorId: { method: 'GET', path: '/fornecedores/:id'},
  criar: { method: 'POST', path: '/fornecedores'},
  atualizar: { method: 'PUT', path: '/fornecedores/:id'},
  atualizarParcial: { method: 'PATCH', path: '/fornecedores/:id'},
  excluir: { method: 'DELETE', path: '/fornecedores/:id'}
};
