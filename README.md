# Trabalho Web — API RESTful de Gestão de Mercados de Condomínio

API REST desenvolvida com **NestJS**, **TypeScript**, **Knex.js** e **PostgreSQL** para administrar mercados de condomínio.

O sistema reúne cadastro de usuários, lojas, itens e fornecedores; compras de fornecedores; controle de estoque por lote; preços com histórico de vigência; promoções; pagamentos; vendas; notas fiscais de demonstração; despesas e relatórios.

---

## Atendimento aos Requisitos do Trabalho

Requisitos obrigatórios exigidos na especificação do trabalho e como foram implementados no projeto:

| Requisito Obrigatório | Implementação no Projeto |
| :--- | :--- |
| **Mínimo de 60 Endpoints** | Mais de 60 endpoints distribuídos entre autenticação, controle de acesso (perfis e permissões), dimensões e tabela fato. |
| **Documentação via Swagger/OpenAPI** | Todos os endpoints, DTOs de entrada/saída, parâmetros de query e autenticação Bearer documentados em `/docs`. |
| **Body das Requisições e Validações de DTO** | Uso de `class-validator` e `class-transformer` com `ValidationPipe` global (validações de formato, obrigatoriedade e tipagem isoladas no DTO). |
| **Paginação e Mínimo de 2 Filtros em todo GET de listagem** | Todos os endpoints de listagem possuem paginação (`page`, `limit`) e suporte a múltiplos filtros combinados por campos específicos de cada tabela. |
| **Autenticação (JWT)** | Autenticação via JSON Web Token (`Bearer Token`) com proteção de rotas via Guards do NestJS e Passport. |
| **Controle de Acesso por Perfil e Permissão (RBAC)** | Implementação completa de Perfis e Permissões conforme demonstrado em sala, utilizando Decorators e Guards customizados para validar o acesso por recurso e ação. |
| **Uso Obrigatório de Migrations e Seeds** | Estrutura completa do banco versionada via Knex Migrations e carga inicial de dados automatizada via Knex Seeds. |
| **Mínimo de 10 Regras de Negócio Complexas (Camada de Service)** |25 regras de negócio contextuais e temporais implementadas na camada de Service. |


---

## Regras de Negócio

As validações de formato, tipo, tamanho e obrigatoriedade das entradas são implementadas nos DTOs. Os services verificam vínculos, condições do domínio e regras que dependem dos dados existentes.

Entre as regras implementadas estão:

- **Indicadores apurados no horário de Brasília:** As vendas são salvas em UTC, mas os filtros e agrupamentos por dia consideram o fuso de Brasília para evitar que vendas noturnas sejam contabilizadas no dia posterior.
- **Pedidos contados por pedido, e não por item:** A quantidade total de pedidos considera apenas registros distintos de pedidos (e não a soma de itens vendidos), servindo de base para o cálculo do ticket médio.
- **Nome de loja único por condomínio:** Impede a existência de duas lojas com o mesmo nome dentro de um mesmo condomínio (sem diferenciar maiúsculas e minúsculas), retornando status 409 em caso de duplicidade.
- **Loja com movimentação não pode ser excluída:** A exclusão é bloqueada caso a loja possua vínculos com vendas, compras, estoque, preços ou custos, preservando o histórico das operações.
- **Entrada de lote vencido bloqueada:** O sistema rejeita o registro de entrada de mercadorias cuja data de validade já tenha expirado.
- **Baixa pelo lote que vence primeiro (PEPS/FIFO):** O sistema seleciona automaticamente os lotes com vencimento mais próximo para dar baixa, executando a operação em transação atômica e desconsiderando lotes já vencidos.
- **Categoria com despesas vinculadas não pode ser excluída:** A remoção de uma categoria de custo é impedida com status 409 caso existam despesas atreladas a ela, mantendo a classificação contábil.
- **Consistência do lote:** Um mesmo lote mantém obrigatoriamente a mesma data de validade em novas entradas; se der entrada novamente no mesmo dia, as quantidades são consolidadas no registro existente.
- **Cada item pode possuir apenas uma promoção cadastrada:** O cadastro de uma nova promoção é bloqueado se o item já tiver uma promoção ativa, exigindo a atualização da campanha existente.
- **Períodos de preço do mesmo item na mesma loja não podem se sobrepor:** Bloqueia cadastros ou atualizações que gerem conflito temporal de vigência de preços para um mesmo produto em uma loja específica.

O detalhamento completo e as demais regras de negócio estão descritos no documento PDF disponível na raiz deste repositório.

---

## Modelagem de Dados

O banco utiliza modelagem dimensional, com dimensões compartilhadas por tabelas fato de vendas, compras, estoque e custos.

| Tabela fato | Finalidade |
| --- | --- |
| `fat_venda` | Itens vendidos, quantidades, valores e vínculos com as dimensões. |
| `fat_compra` | Compras de itens dos fornecedores. |
| `fat_estoque` | Estoque por data de referência, loja, item e lote. |
| `fat_custo` | Despesas associadas a loja ou matriz e categoria de custo. |

As dimensões incluem `dim_item`, `dim_loja`, `dim_cliente`, `dim_funcionario`, `dim_fornecedor`, `dim_preco`, `dim_promocao`, `dim_nota_fiscal`, `dim_forma_pagamento` e `dim_categoria_custo`. A tabela `tipo_promocao` define as modalidades promocionais.

As tabelas `usuario` e `login` armazenam os dados de cadastro e autenticação. O perfil do usuário fica no registro de login.

---
## Autenticação, Perfis e Permissões

O controle de acesso foi implementado seguindo o modelo de **Perfis e Permissões** :

- **Autenticação JWT:** O endpoint de login valida as credenciais (com hash `bcrypt`) e emite um token JWT assinado contendo o identificador e as credenciais de acesso do usuário.
- **Guards e Decorators Customizados:** As rotas utilizam decorators específicos para exigir perfis e acesso por perfis, definido com @Perfis e verificado pelo guard global.
- **Segregação de Acesso:** Operações de leitura (`GET`), criação (`POST`), atualização (`PUT`/`PATCH`) e remoção (`DELETE`) são validadas de acordo com as permissões atribuídas ao perfil do usuário autenticado.

---
## Bônus

- **Cache Redis:** armazenamento temporário de respostas GET, com TTL configurável, chave por usuário e URL e indicação de `HIT` ou `MISS` no cabeçalho `x-cache`.
- **Invalidação do cache:** operações de escrita concluídas limpam o cache para que consultas posteriores reflitam as alterações.
- **Continuidade sem cache:** falhas ou demora nas operações do Redis são tratadas para permitir que a requisição prossiga.
- **Limitação de requisições:** rate limit global e limite específico para login e registro.
- **Rastreamento:** OpenTelemetry registra a execução de requisições, consultas PostgreSQL e operações de cache, com visualização no Jaeger.
- **CORS configurável:** definição das origens permitidas pela variável `CORS_ORIGIN`, com suporte a requisições com credenciais, permitindo a comunicação entre frontend e API em origens diferentes.

---
## Tecnologias Utilizadas

- **Node.js & TypeScript**
- **NestJS** — Arquitetura modular (Controllers, Services, Repositories, DTOs, Guards)
- **PostgreSQL** — SGBD Relacional
- **Knex.js** — Query Builder SQL, Migrations, Seeds e Controle de Transações
- **Supabase CLI:** provisionamento do PostgreSQL local.
- **Swagger (@nestjs/swagger)** — Documentação OpenAPI 3.0
- **JWT e bcryptjs** — Autenticação e hash de senhas
- **Class-Validator & Class-Transformer** — Validação de Payloads e Query Params
- **Redis e Keyv:** Cache
- **OpenTelemetry e Jaeger:** Rastreamento
- **NestJS Throttler:** Limitação de requisições

---


## Integrantes do Grupo

- **Daniel da Costa Carvalho**
- **Isabela Rezende**
- **Iuri Sajnin**
- **Pedro Favato**
- **Thales Steiner** 


