# Vault Gestão 2.0 — Auditoria e plano de execução

Data da auditoria: 20/10/2026 · Base: commit `c832bd4` (main)

## 1. Como o sistema funciona hoje

| Item | Situação |
|---|---|
| Stack | HTML + CSS + JS puro, sem build. Supabase via CDN (`supabase-js@2`), Chart.js via CDN. |
| Arquivos | `index.html` (707 linhas), `app_refactored.js` (~2.900 linhas, tudo num arquivo), `auth.js`, `styles.css` (~2.500 linhas), `supabase-client.js`, `anatel-service.js`. |
| Deploy | Vercel, site estático, sem `vercel.json`. **Push na `main` = produção.** |
| Banco | Um único projeto Supabase (`vkoqsjfykybrtwhhrpiz`), que é o de produção. Não existe banco de testes. |
| Autenticação | Supabase Auth (e-mail e senha). Cadastro aberto. Onboarding cria a loja pela RPC `criar_loja`. |
| Multi-loja | `lojas` + `membros_loja` (papéis `dono` e `vendedor`). RLS por loja usando `minhas_lojas()` e `sou_dono_da_loja()`. |
| Produtos | Tabela `products` (criada pelo painel, sem script no repo): `id, type, brand, model, color, manufacture, price, quantity, notes, image, loja_id`. **Sem custo, sem data de criação, sem estoque mínimo, sem arquivamento.** |
| Aparelhos | `unidades_produto` (IMEI único, grade, bateria, Anatel, `status_venda`). |
| Vendas | RPC `registrar_venda(produto, quantidade)`: 1 produto por venda, preço cheio, trava a linha (`for update`). Registra em `movimentacoes_estoque` (tipo `venda`). |
| Permissões | Vendedor: só vê a aba Vendas e o banco bloqueia a escrita dele. Dono: tudo. |
| Testes | 1 teste Cypress desatualizado (usa campos que não existem mais). |

## 2. Problemas encontrados

### Corrigidos nesta sessão
- Policies públicas antigas deixavam qualquer pessoa ler, alterar e apagar `unidades_produto` sem login (`sql/010`).
- Qualquer usuário logado via o nome de todas as lojas (`sql/010`).

### Pendentes, por gravidade
1. **Vender aparelho não baixa o IMEI.** A venda diminui `quantity`, mas a unidade continua `disponivel`. Depois disso, o produto não pode mais ser editado: o formulário exige 1 IMEI por unidade em estoque e a conta não fecha.
2. **Excluir produto que já teve venda falha.** `movimentacoes_estoque.produto_id` não tem `on delete`, então o banco recusa e o usuário vê só "Erro ao excluir".
3. **Cadastro força marca e modelo de celular para tudo.** Um "cabo USB-C" ou "carregador" precisa escolher marca e modelo de celular da lista fixa, e a validação recusa qualquer modelo fora dela.
4. **"Saldo total em estoque" é preço de venda × quantidade**, não custo. Hoje mostra potencial de venda como se fosse patrimônio.
5. **Venda com desconto ou com vários itens não existe.** O preço é sempre o de cadastro e cada item vira uma venda separada, o que distorce o ticket médio.
6. **Sem cancelamento e devolução.** O livro-caixa não permite editar e só o dono pode apagar uma linha. Apagar não devolve o estoque.
7. **Limite de estoque baixo está fixo em 5** e espalhado pelo código (constante + número solto no dashboard).
8. **CDN sem versão fixa** (`supabase-js@2`, `chart.js`): uma atualização deles pode quebrar o site sem nenhuma mudança nossa.
9. **HTML montado com dados do banco sem escapar** (nome do produto, cor, observações em `innerHTML`). Hoje só o dono escreve produtos, então o risco é baixo, mas precisa corrigir antes de abrir mais permissões.
10. **Sem ambiente de teste.** Toda migração roda direto no banco de produção.
12. **IMEI é único no banco inteiro, não por loja.** Se a loja recompra um aparelho que já vendeu, ou se outra loja cadastra o mesmo IMEI, o cadastro é recusado. Tratar na Etapa 2 (único por loja e só entre unidades não vendidas).
11. `app_refactored.js` concentra tudo em ~2.900 linhas. Dá pra seguir assim, mas módulos novos (carrinho, metas, caixa) devem ir em arquivos separados.

## 3. Decisões de arquitetura

- **Sem trocar de stack.** Continua HTML/CSS/JS puro. Módulos novos entram como arquivos `.js` separados, carregados por `<script>` no `index.html`.
- **Custo fica numa tabela separada (`produtos_custos`), só o dono lê.** A RLS do Supabase filtra linhas, não colunas: se o custo ficasse em `products`, qualquer vendedor conseguiria ler pela API, mesmo com a tela escondendo. Custo nulo = "Custo não informado" (nunca zero).
- **Custo médio ponderado.** Cada entrada de mercadoria com custo recalcula o custo médio do produto. Cada venda grava o custo do momento, então o lucro histórico não muda quando o custo mudar.
- **Venda nova = `vendas` + `vendas_itens` + `vendas_pagamentos`, finalizada por uma única RPC** (`finalizar_venda`) que:
  trava os produtos em ordem de id (evita deadlock), valida estoque, aplica o desconto proporcional entre os itens, baixa o IMEI quando o item é aparelho, grava as movimentações e recebe uma **chave de idempotência** (clique duplo não gera duas vendas).
- **Relatórios leem o livro-caixa (`movimentacoes_estoque`)**, que ganha `venda_id`, `custo_unitario` e os tipos `devolucao`, `perda`, `entrada`, `ajuste`. As vendas antigas (antes do carrinho) continuam contando normalmente.
- **Cancelamento** gera movimentações de estorno (nunca apaga) e marca a venda como cancelada. Faturamento conta só vendas válidas.
- **Arquivar em vez de excluir** produto com histórico (`products.arquivado_em`). Exclusão definitiva só para produto sem nenhuma movimentação.
- **Toda migração é aditiva** (`add column ... null`, tabelas novas). Nada é apagado nem reescrito. Cada script tem um bloco de rollback comentado no final.

## 4. Plano em etapas

Cada etapa vai num branch próprio, vira preview na Vercel e só entra na `main` depois de você testar.

### Etapa 1 — Fundação e correções ✅ (branch `vault-2/etapa-1`)
- Decisão: sem banco de teste; migrações rodam direto em produção, sempre aditivas.
- ✅ Versões dos CDNs fixadas (`supabase-js@2.118.0`, `chart.js@4.5.1`, `icons-webfont@3.49.0`).
- ✅ `esc()` aplicado em todo `innerHTML` com dado do banco, inclusive toasts e modais.
- ✅ Estoque baixo numa regra só (`situacaoEstoque`), já preparada para o `estoque_minimo` por produto.
- ✅ Venda de aparelho pede o IMEI e marca a unidade como vendida (`registrar_venda_v2`). IMEI impedido fica bloqueado.
- ✅ Acerto das vendas antigas: no estoque, o dono marca qual IMEI já saiu (`marcar_unidade_vendida`).
- ✅ Excluir produto com histórico → arquivar; filtro "Arquivados" com botão restaurar.
- ✅ Trava contra clique duplo na venda; modal seguinte não é mais fechado pelo anterior.
- ✅ Teste Cypress refeito. Os testes de navegador rodaram no Edge headless: 14/14 passaram.

**SQL:** `011_fundacao_comercial.sql` → `products.created_at`, `estoque_minimo`, `arquivado_em`; tabela `produtos_custos`; `movimentacoes_estoque.venda_id`, `custo_unitario`, novos tipos; RPCs `registrar_venda_v2` e `marcar_unidade_vendida`.

### Etapa 2 — Base comercial
- Cadastro: custo, lucro, margem e markup ao vivo; alerta de preço abaixo do custo; estoque mínimo; campos por categoria (acessório com nome livre, película com tipo, capinha com material).
- Produtos antigos com selo "Custo não informado".
- Entrada de mercadoria (quantidade, custo, fornecedor).
- **Frente de caixa:** busca, carrinho, quantidades, desconto (só dono, ou vendedor dentro de um limite), Pix/dinheiro/débito/crédito/misto, troco, comprovante.
- Histórico com cancelamento e devolução.

**SQL:** `012_vendas_carrinho.sql` → `vendas`, `vendas_itens`, `vendas_pagamentos`, RPCs `finalizar_venda`, `cancelar_venda`, `registrar_entrada`.
**Arquivos:** `index.html`, `styles.css`, `app_refactored.js`, novo `pdv.js`.

### Etapa 3 — Dashboard e metas
- Disco do cofre mantido, com animação 0→valor no arco, no centro e na legenda (respeita "reduzir movimento").
- Três valores separados: estoque a custo, potencial de venda, lucro bruto potencial.
- Cards: vendas hoje, lucro bruto hoje + margem, ticket médio, meta, estoque baixo, unidades vendidas.
- Filtro de período (hoje, ontem, 7, 30, mês, personalizado).
- Gráfico faturamento × lucro e top produtos.
- "Insights da loja" (até 3, calculados dos dados reais).
- Metas diária, semanal e mensal, com meta diária necessária e projeção.

**SQL:** `013_metas.sql` → `metas`, `lojas.dias_funcionamento`.
**Arquivos:** novo `dashboard.js`, `metas.js`.

### Etapa 4 — Relatórios, estoque e caixa
- Página Análises: faturamento, lucro, ranking, categorias, produtos parados (30/60/90 dias), desempenho por vendedor, exportar CSV.
- Estoque: filtros de ativos/arquivados, ordenar por última movimentação, área de reposição com sugestão.
- Caixa: abertura, sangria/suprimento, fechamento com divergência por forma de pagamento.

**SQL:** `014_caixa.sql` → `caixas`, `caixa_lancamentos`.

### Etapa 5 — Navegação e polimento
- Menu: Início · Vender · Produtos · Análises · Gestão.
- Barra inferior no celular.
- Cores semânticas como tokens, estados vazios, skeletons, acessibilidade.
- Testes Cypress dos 15 cenários críticos.

## 5. Como publicar com segurança

1. Antes de cada migração: **backup** (Supabase → Database → Backups, ou exportar as tabelas em CSV no plano grátis).
2. Rodar o SQL primeiro no banco de teste e depois no de produção.
3. Código num branch (`vault-2/etapa-N`): a Vercel gera uma URL de preview.
4. Testar no preview com login de teste e só então fazer o merge na `main`.
5. Os scripts SQL são todos aditivos: a versão atual do site continua funcionando mesmo depois de rodar a migração da próxima etapa.
