// ============================================
// VAULT GESTÃO · núcleo do app
// ============================================
// Este arquivo tem o que as telas compartilham: dados de produtos e custos, regras de
// estoque, navegação, tabela de produtos, histórico de vendas, equipe, login, modal e
// avisos. Cada tela maior tem o seu arquivo:
//   dashboard.js (Início) · cadastro.js · pdv.js (Vender) · analises.js · gestao.js
//   catalogo.js (marcas, famílias, modelos, linhas e tipos)

// ============================================
// CONSTANTES
// ============================================

// Estoque mínimo padrão, usado quando o produto não tem um estoque_minimo próprio.
// A regra de "baixo/zerado" fica toda em situacaoEstoque().
const LIMITE_ESTOQUE_BAIXO = 5;

const PAPEL_LABELS = { dono: 'Dono', vendedor: 'Vendedor' };

const PAPEL_DESCRICOES = {
  vendedor: 'Vendedor acessa só Vender: registra vendas e vê o histórico. Não edita produtos nem vê custos.',
  dono: 'Dono tem acesso total: produtos, custos, análises, metas e equipe.',
};

const TIPO_LABELS = {
  aparelhos: 'Aparelhos',
  capinhas: 'Capinhas',
  peliculas: 'Películas',
  acessorios: 'Acessórios',
};

const TIPO_LABEL_SINGULAR = {
  aparelhos: 'Aparelho',
  capinhas: 'Capinha',
  peliculas: 'Película',
  acessorios: 'Acessório',
};

const TIPO_ICONES = {
  aparelhos: 'ti-device-mobile-message',
  capinhas: 'ti-shield',
  peliculas: 'ti-device-mobile',
  acessorios: 'ti-plug',
};

const STOCK_FILTER_LABELS = {
  ok: 'Em estoque',
  low: 'Estoque baixo',
  zero: 'Sem estoque',
  sem_custo: 'Custo não informado',
  arquivados: 'Arquivados',
};

const SITUACAO_INFO = {
  ok: { label: 'Em estoque', classe: 'badge-ok' },
  baixo: { label: 'Estoque baixo', classe: 'badge-baixo' },
  zerado: { label: 'Sem estoque', classe: 'badge-zerado' },
};

// ============================================
// ELEMENTOS
// ============================================

const $ = (id) => document.getElementById(id);

const DOM = {
  // Login
  loginScreen: $('login-screen'),
  appContainer: $('app-container'),
  loginForm: $('login-form'),
  loginEmail: $('login-email'),
  loginPassword: $('login-password'),
  loginSubtitle: $('login-subtitle'),
  loginSubmitBtn: $('login-submit-btn'),
  loginToggleText: $('login-toggle-text'),
  loginToggleMode: $('login-toggle-mode'),
  logoutButton: $('logout-button'),

  // Onboarding
  onboardingScreen: $('onboarding-screen'),
  onboardingForm: $('onboarding-form'),
  onboardingNome: $('onboarding-nome'),
  onboardingTipo: $('onboarding-tipo'),

  // Estrutura
  navItems: document.querySelectorAll('[data-nav]'),
  panels: document.querySelectorAll('.tab-panel'),
  pageTitle: $('page-title'),
  pageDesc: $('page-desc'),
  subtabs: $('subtabs'),
  acoesPagina: document.querySelectorAll('[data-acao-de]'),
  lojaAtualNome: $('loja-atual-nome'),
  sidebarUserName: $('sidebar-user-name'),
  sidebarAvatar: $('sidebar-avatar'),
  sidebarUserBtn: $('sidebar-user-btn'),
  mobileAvatar: $('mobile-avatar'),

  // Produtos
  productTableBody: $('product-table-body'),
  produtosCards: $('produtos-cards'),
  stockCountDisplay: $('stock-count'),
  estoqueTable: $('estoque-table'),
  estoqueEmptyState: $('estoque-empty-state'),
  estoqueEmptyTexto: $('estoque-empty-texto'),
  emptyStateCta: $('empty-state-cta'),
  sortableHeaders: document.querySelectorAll('#estoque-table th.sortable'),
  exportCsvBtn: $('export-csv-btn'),
  filterSearch: $('filter-search'),
  filterType: $('filter-type'),
  filterBrand: $('filter-brand'),
  filterVariacao: $('filter-variacao'),
  filterStock: $('filter-stock'),
  filtersToggleBtn: $('filters-toggle-btn'),
  filtersCount: $('filters-count'),
  filtersPanel: $('filters-panel'),
  filtersClear: $('filters-clear'),
  filtersChips: $('filters-chips'),
  filterResultCount: $('filter-result-count'),

  // Histórico de vendas
  resumoVendasHoje: $('resumo-vendas-hoje'),
  resumoVendas7dias: $('resumo-vendas-7dias'),
  resumoVendasMes: $('resumo-vendas-mes'),
  filterHistoricoSearch: $('filter-historico-search'),
  filterHistoricoPeriodo: $('filter-historico-periodo'),
  filterHistoricoBrand: $('filter-historico-brand'),
  filtersHistoricoChips: $('filters-historico-chips'),
  historicoCount: $('historico-count'),
  historicoVendasTable: $('historico-vendas-table'),
  historicoVendasBody: $('historico-vendas-body'),
  historicoVendasEmpty: $('historico-vendas-empty'),
  historicoTotalRow: $('historico-total-row'),
  historicoTotalValor: $('historico-total-valor'),
  exportHistoricoCsvBtn: $('export-historico-csv-btn'),

  // Equipe
  inviteForm: $('invite-form'),
  inviteEmail: $('invite-email'),
  invitePapel: $('invite-papel'),
  papelOptions: document.querySelectorAll('#papel-selector [data-papel]'),
  papelDescricao: $('papel-descricao'),
  equipeTableBody: $('equipe-table-body'),

  // Modal e avisos
  toastContainer: $('toast-container'),
  modalBackdrop: $('modal-backdrop'),
  modal: $('modal'),
  modalClose: $('modal-close'),
  modalBody: document.querySelector('#modal .modal-body'),
  modalContent: document.querySelector('#modal .modal-content'),
};

// ============================================
// ESTADO
// ============================================

// products = só os ativos (o que aparece em produtos, vendas e início).
// produtosArquivados = produtos com histórico que o dono "excluiu"; só aparecem no
// filtro "Arquivados", de onde podem ser restaurados.
let products = [];
let produtosArquivados = [];
let filteredProducts = [];
let sortConfig = { field: null, direction: 'asc' };
let historicoVendas = [];
let abaAtual = 'dashboard';

// ============================================
// PRODUTOS (Supabase)
// ============================================

// Produtos e custos chegam juntos: nunca existe um momento em que a tela mostra os
// produtos com todos os custos "não informados".
async function loadProducts() {
  const [{ data, error }, custos] = await Promise.all([
    supabaseClient
      .from('products')
      .select('*')
      .eq('loja_id', lojaAtual.id)
      .order('id', { ascending: false }),
    buscarCustos(),
  ]);

  if (error) {
    showToast('Não foi possível carregar os produtos. Confira a internet e recarregue a página.', 'error', 5000);
    products = [];
    produtosArquivados = [];
    return;
  }

  custoPorProduto = custos;
  products = data.filter(p => !p.arquivado_em);
  produtosArquivados = data.filter(p => p.arquivado_em);
}

// ============================================
// CUSTOS (produtos_custos — só o dono lê, sql/011)
// ============================================

// produto_id → custo unitário (número). Produto ausente do mapa = custo não informado,
// que NUNCA é tratado como zero nas contas.
let custoPorProduto = {};

async function buscarCustos() {
  const mapa = {};
  if (!souDono()) return mapa;

  const { data, error } = await supabaseClient
    .from('produtos_custos')
    .select('produto_id, custo_unitario')
    .eq('loja_id', lojaAtual.id);

  if (error) return mapa;

  data.forEach(c => {
    if (c.custo_unitario !== null) mapa[c.produto_id] = Number(c.custo_unitario);
  });
  return mapa;
}

function custoDoProduto(produtoId) {
  return Object.prototype.hasOwnProperty.call(custoPorProduto, produtoId) ? custoPorProduto[produtoId] : null;
}

// Grava (ou limpa) o custo do produto. custo = null significa "não informado".
async function salvarCusto(produtoId, custo) {
  const jaTinha = custoDoProduto(produtoId) !== null;
  if (custo === null && !jaTinha) return true;

  const { error } = await supabaseClient
    .from('produtos_custos')
    .upsert({
      produto_id: produtoId,
      loja_id: lojaAtual.id,
      custo_unitario: custo,
      updated_at: new Date().toISOString(),
      updated_by: usuarioAtual.id,
    }, { onConflict: 'produto_id' });

  if (error) {
    showToast('Produto salvo, mas o preço de custo não foi gravado. Edite para tentar de novo.', 'warning', 5000);
    return false;
  }
  return true;
}

// Lucro bruto, margem e markup de uma unidade. Qualquer valor ausente ou que
// dividiria por zero volta como null (a tela mostra "—").
function calcularPrecificacao(custo, venda) {
  if (custo === null || custo === undefined || !Number.isFinite(custo)) {
    return { lucro: null, margem: null, markup: null };
  }
  const lucro = venda - custo;
  return {
    lucro,
    margem: venda > 0 ? (lucro / venda) * 100 : null,
    markup: custo > 0 ? (lucro / custo) * 100 : null,
  };
}

// Valores do estoque atual. Produto com quantidade e sem custo entra em "pendentes"
// e não soma nada no total de compra.
function calcularValoresEstoque(lista) {
  return lista.reduce((acc, p) => {
    const qtd = Math.max(Number(p.quantity) || 0, 0);
    acc.venda += (Number(p.price) || 0) * qtd;
    if (qtd === 0) return acc;

    const custo = custoDoProduto(p.id);
    if (custo === null) acc.pendentes += 1;
    else { acc.compra += custo * qtd; acc.comCusto += 1; }
    return acc;
  }, { compra: 0, venda: 0, pendentes: 0, comCusto: 0 });
}

async function updateProductRow(id, productData) {
  const { error } = await supabaseClient
    .from('products')
    .update(productData)
    .eq('id', id)
    .eq('loja_id', lojaAtual.id);

  if (error) {
    showToast('Não foi possível atualizar o produto.', 'error');
    return false;
  }
  return true;
}

async function deleteProductRow(id) {
  const { error } = await supabaseClient
    .from('products')
    .delete()
    .eq('id', id)
    .eq('loja_id', lojaAtual.id);

  if (error) {
    showToast('Não foi possível excluir o produto.', 'error');
    return false;
  }
  return true;
}

// Recarrega produtos e atualiza todas as telas que dependem deles.
async function recarregarProdutos() {
  await loadProducts();
  applyFilters();
  updateDashboard();
  if (typeof renderPdv === 'function') renderPdv();
  renderSubtabs();
}

// ============================================
// FORMATAÇÃO E UTILIDADES
// ============================================

const FORMATO_BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatCurrency(value) {
  return FORMATO_BRL.format(Number(value) || 0);
}

function parsePriceValue(value) {
  return Number(String(value ?? '').replace(/\s/g, '').replace(/R\$\s?/, '').replace(/\./g, '').replace(/,/g, '.')) || 0;
}

function formatPriceInput(value) {
  if (!value) return '';
  const num = typeof value === 'number' ? value : parsePriceValue(value);
  return FORMATO_BRL.format(num);
}

function formatarPercentual(valor) {
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

function formatarNumero(valor) {
  return Math.round(valor).toLocaleString('pt-BR');
}

function getUniqueBrands() {
  return [...new Set(products.map(p => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function pluralize(count, singular, plural = singular + 's') {
  return count === 1 ? singular : plural;
}

// Escapa texto vindo do banco antes de entrar num innerHTML (nome de produto, e-mail,
// observações...). Sem isso, um nome como "<img onerror=...>" viraria código.
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function corVar(nomeVariavel, fallback) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nomeVariavel).trim();
  return valor || fallback;
}

function baixarArquivo(conteudo, nome, tipo) {
  const blob = new Blob(['﻿' + conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function gerarCSV(cabecalho, linhas) {
  const campo = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;
  return [cabecalho, ...linhas].map(l => l.map(campo).join(',')).join('\r\n');
}

// Estoque mínimo do produto: o que o dono configurou nele ou, se não configurou, o padrão.
function estoqueMinimo(product) {
  const minimo = product.estoque_minimo;
  return Number.isInteger(minimo) && minimo >= 0 ? minimo : LIMITE_ESTOQUE_BAIXO;
}

// Única regra de situação do estoque: badge, filtros, dial, cards e análises usam esta.
function situacaoEstoque(product) {
  if (product.quantity <= 0) return 'zerado';
  if (product.quantity <= estoqueMinimo(product)) return 'baixo';
  return 'ok';
}

function renderBadgeSituacao(product) {
  if (product.arquivado_em) return '<span class="badge badge-arquivado">Arquivado</span>';
  const info = SITUACAO_INFO[situacaoEstoque(product)];
  return `<span class="badge ${info.classe}">${info.label}</span>`;
}

// "Samsung Galaxy S24" — marca é opcional, então pode ser só o modelo/nome.
function nomeProduto(product) {
  return [product.brand, product.model].filter(Boolean).join(' ').trim() || 'Sem nome';
}

// Linha de detalhe embaixo do nome: linha/tipo e, em produtos antigos, a cor.
function metaProduto(product, { comCategoria = false } = {}) {
  const partes = [];
  if (comCategoria) partes.push(TIPO_LABEL_SINGULAR[product.type] || product.type);
  if (product.variacao) partes.push(product.variacao);
  if (product.color) partes.push(product.color);
  return partes.map(esc).join('<span class="sep">·</span>');
}

function renderProdutoCell(product, opcoes = {}) {
  const meta = metaProduto(product, opcoes);
  return `
    <div class="produto-cell">
      <span class="produto-icone"><i class="ti ${TIPO_ICONES[product.type] || 'ti-package'}"></i></span>
      <div style="min-width:0">
        <div class="produto-nome">${esc(nomeProduto(product))}</div>
        ${meta ? `<div class="produto-meta">${meta}</div>` : ''}
      </div>
    </div>`;
}

// ============================================
// ANIMAÇÕES
// ============================================

const DURACAO_ANIMACAO_MS = 900;

function prefereMenosMovimento() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// Anima de 0 até 1 com desaceleração suave e chama aoAvancar(progresso) a cada quadro.
// Com "reduzir movimento" ligado no sistema, pula direto para o valor final.
// Uma nova animação no mesmo alvo cancela a anterior (evita números brigando).
const animacoesAtivas = new WeakMap();

function animar(alvo, aoAvancar, duracaoMs = DURACAO_ANIMACAO_MS) {
  cancelAnimationFrame(animacoesAtivas.get(alvo));

  if (prefereMenosMovimento()) {
    aoAvancar(1);
    return;
  }

  const inicio = performance.now();
  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracaoMs, 1);
    aoAvancar(1 - Math.pow(1 - progresso, 3));
    if (progresso < 1) animacoesAtivas.set(alvo, requestAnimationFrame(passo));
  }
  animacoesAtivas.set(alvo, requestAnimationFrame(passo));
}

function animarContagem(elemento, valorFinal, formatar = formatarNumero) {
  elemento.classList.remove('is-loading');
  animar(elemento, (p) => { elemento.textContent = formatar(valorFinal * p); });
}

// ============================================
// TABELA DE PRODUTOS
// ============================================

function botoesAcaoProduto(product) {
  if (!souDono()) return '';
  if (product.arquivado_em) {
    return `<button type="button" class="icon-btn" data-acao="restaurar" title="Restaurar" aria-label="Restaurar ${esc(nomeProduto(product))}"><i class="ti ti-archive-off"></i></button>`;
  }
  return `
    <button type="button" class="icon-btn" data-acao="ver" title="Ver detalhes" aria-label="Ver ${esc(nomeProduto(product))}"><i class="ti ti-eye"></i></button>
    <button type="button" class="icon-btn" data-acao="editar" title="Editar" aria-label="Editar ${esc(nomeProduto(product))}"><i class="ti ti-pencil"></i></button>
    <button type="button" class="icon-btn icon-btn--danger" data-acao="excluir" title="Excluir" aria-label="Excluir ${esc(nomeProduto(product))}"><i class="ti ti-trash"></i></button>`;
}

function renderCusto(product) {
  const custo = custoDoProduto(product.id);
  return custo === null ? '<span class="texto-pendente">Não informado</span>' : formatCurrency(custo);
}

function renderLinhaProduto(product) {
  return `
    <tr data-id="${product.id}" class="${product.arquivado_em ? 'row-arquivado' : ''}">
      <td>${renderProdutoCell(product)}</td>
      <td>${esc(TIPO_LABEL_SINGULAR[product.type] || product.type)}</td>
      <td class="num so-dono">${renderCusto(product)}</td>
      <td class="num">${formatCurrency(product.price)}</td>
      <td class="num"><strong>${product.quantity}</strong></td>
      <td>${renderBadgeSituacao(product)}</td>
      <td><div class="acoes">${botoesAcaoProduto(product)}</div></td>
    </tr>`;
}

function renderCardProduto(product) {
  return `
    <li class="produto-card ${product.arquivado_em ? 'row-arquivado' : ''}" data-id="${product.id}" tabindex="0" role="button" aria-label="${esc(nomeProduto(product))}">
      <span class="produto-icone"><i class="ti ${TIPO_ICONES[product.type] || 'ti-package'}"></i></span>
      <div style="min-width:0">
        <div class="produto-nome">${esc(nomeProduto(product))}</div>
        <div class="produto-meta">${metaProduto(product, { comCategoria: true })}<span class="sep">·</span>${product.quantity} un.</div>
      </div>
      <div class="produto-card-lado">
        <span class="produto-card-preco">${formatCurrency(product.price)}</span>
        ${renderBadgeSituacao(product)}
      </div>
    </li>`;
}

function renderProductsTables() {
  DOM.productTableBody.innerHTML = filteredProducts.map(renderLinhaProduto).join('');
  DOM.produtosCards.innerHTML = filteredProducts.map(renderCardProduto).join('');

  updateFilterOptions();
  updateEstoqueEmptyState();
  updateStockCount();
  renderFilterChips();
}

function renderSkeletonRows(quantidade = 4) {
  DOM.estoqueEmptyState.classList.add('hidden');
  DOM.productTableBody.innerHTML = Array.from({ length: quantidade }).map(() => `
    <tr>${Array.from({ length: 7 }).map(() => '<td><span class="skeleton" style="height:14px;width:70%"></span></td>').join('')}</tr>
  `).join('');
}

function updateEstoqueEmptyState() {
  const semNada = filteredProducts.length === 0;
  const lojaVazia = products.length === 0 && DOM.filterStock.value !== 'arquivados';
  DOM.estoqueTable.classList.toggle('hidden', semNada);
  DOM.estoqueEmptyState.classList.toggle('hidden', !semNada);
  DOM.emptyStateCta.classList.toggle('hidden', !lojaVazia || !souDono());
  DOM.estoqueEmptyTexto.textContent = lojaVazia
    ? 'Nenhum produto cadastrado ainda.'
    : 'Nenhum produto com esses filtros.';
}

function updateStockCount() {
  const total = products.length;
  DOM.stockCountDisplay.textContent = `${total} ${pluralize(total, 'produto')} ativos`;
  const mostrando = filteredProducts.length;
  DOM.filterResultCount.textContent = temFiltroAtivo() ? `Mostrando ${mostrando}` : '';
}

function produtoPorElemento(el) {
  const id = Number(el.closest('[data-id]')?.dataset.id);
  return products.find(p => p.id === id) || produtosArquivados.find(p => p.id === id) || null;
}

function handleCliqueTabelaProdutos(e) {
  const botao = e.target.closest('[data-acao]');
  const produto = produtoPorElemento(e.target);
  if (!produto) return;

  if (!botao) {
    if (e.currentTarget === DOM.produtosCards) abrirDetalhesProduto(produto.id);
    return;
  }
  const acao = botao.dataset.acao;
  if (acao === 'ver') abrirDetalhesProduto(produto.id);
  if (acao === 'editar') startEditProduct(produto.id);
  if (acao === 'excluir') deleteProduct(produto.id);
  if (acao === 'restaurar') restaurarProduto(produto.id);
}

// ---- Detalhes do produto (olho na tabela / toque no cartão) ----------------------

function abrirDetalhesProduto(id) {
  const product = products.find(p => p.id === id) || produtosArquivados.find(p => p.id === id);
  if (!product) return;

  const arquivado = Boolean(product.arquivado_em);
  const custo = custoDoProduto(product.id);
  const { lucro, margem } = calcularPrecificacao(custo, Number(product.price));
  const linhas = [
    ['Categoria', esc(TIPO_LABEL_SINGULAR[product.type] || product.type)],
    product.variacao ? [rotuloVariacao(product.type), esc(product.variacao)] : null,
    product.color ? ['Cor', esc(product.color)] : null,
    ['Preço de venda', formatCurrency(product.price)],
    souDono() ? ['Preço de custo', custo === null ? '<span class="texto-pendente">Não informado</span>' : formatCurrency(custo)] : null,
    souDono() && lucro !== null ? ['Lucro bruto por unidade', formatCurrency(lucro)] : null,
    souDono() && margem !== null ? ['Margem bruta', formatarPercentual(margem)] : null,
    ['Quantidade', `${product.quantity} un.`],
    ['Estoque mínimo', `${estoqueMinimo(product)} un.${product.estoque_minimo === null || product.estoque_minimo === undefined ? ' (padrão)' : ''}`],
    ['Situação', renderBadgeSituacao(product)],
    product.created_at ? ['Cadastrado em', new Date(product.created_at).toLocaleDateString('pt-BR')] : null,
    product.notes ? ['Observações', esc(product.notes)] : null,
  ].filter(Boolean);

  let acoes = '<button type="button" class="btn btn-secondary" data-modal="fechar">Fechar</button>';
  if (souDono() && arquivado) {
    acoes = '<button type="button" class="btn btn-secondary" data-modal="fechar">Fechar</button><button type="button" class="btn btn-primary" data-modal="restaurar"><i class="ti ti-archive-off"></i>Restaurar</button>';
  } else if (souDono()) {
    acoes = `
      <button type="button" class="btn btn-ghost" data-modal="excluir" style="margin-right:auto;color:var(--red-ink)"><i class="ti ti-trash"></i>Excluir</button>
      <button type="button" class="btn btn-primary" data-modal="editar"><i class="ti ti-pencil"></i>Editar</button>`;
  }

  abrirModal(`
    <div class="detalhe-topo">
      <span class="produto-icone"><i class="ti ${TIPO_ICONES[product.type] || 'ti-package'}"></i></span>
      <div><h3 class="modal-title" style="padding:0">${esc(nomeProduto(product))}</h3></div>
    </div>
    <dl class="detalhe-lista">${linhas.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <div class="modal-actions">${acoes}</div>
  `);

  DOM.modalBody.querySelector('[data-modal="fechar"]')?.addEventListener('click', fecharModal);
  DOM.modalBody.querySelector('[data-modal="editar"]')?.addEventListener('click', () => { fecharModal(); startEditProduct(product.id); });
  DOM.modalBody.querySelector('[data-modal="excluir"]')?.addEventListener('click', () => deleteProduct(product.id));
  DOM.modalBody.querySelector('[data-modal="restaurar"]')?.addEventListener('click', () => { fecharModal(); restaurarProduto(product.id); });
}

// ============================================
// FILTROS DE PRODUTOS
// ============================================

function getFilterValues() {
  return {
    search: DOM.filterSearch.value,
    type: DOM.filterType.value,
    brand: DOM.filterBrand.value,
    variacao: DOM.filterVariacao.value,
    stock: DOM.filterStock.value,
  };
}

function temFiltroAtivo() {
  const f = getFilterValues();
  return Boolean(f.search.trim() || f.type || f.brand || f.variacao || f.stock);
}

// Busca por marca, modelo, linha/tipo, cor (produtos antigos) ou observação. Aceita
// "a15 premium" em qualquer ordem: todas as palavras precisam aparecer.
function matchesSearchTerm(product, searchTerm) {
  const termo = chaveNome(searchTerm);
  if (!termo) return true;
  const texto = chaveNome([product.brand, product.model, product.variacao, product.color, product.notes].filter(Boolean).join(' '));
  return termo.split(' ').every(palavra => texto.includes(palavra));
}

function matchesStockFilter(product, filter) {
  if (!filter || filter === 'arquivados') return true;
  if (filter === 'ok') return situacaoEstoque(product) === 'ok';
  if (filter === 'zero') return situacaoEstoque(product) === 'zerado';
  if (filter === 'low') return situacaoEstoque(product) === 'baixo';
  if (filter === 'sem_custo') return custoDoProduto(product.id) === null;
  return true;
}

function filterProducts() {
  const { search, type, brand, variacao, stock } = getFilterValues();
  const base = stock === 'arquivados' ? produtosArquivados : products;

  return base.filter(product =>
    matchesSearchTerm(product, search) &&
    (!type || product.type === type) &&
    (!brand || product.brand === brand) &&
    (!variacao || product.variacao === variacao) &&
    matchesStockFilter(product, stock)
  );
}

function ordenarFiltrados(lista) {
  if (!sortConfig.field) return lista;
  const fator = sortConfig.direction === 'asc' ? 1 : -1;
  return [...lista].sort((a, b) => (Number(a[sortConfig.field]) - Number(b[sortConfig.field])) * fator);
}

function ordenarPor(campo) {
  if (sortConfig.field === campo) {
    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.field = campo;
    sortConfig.direction = 'asc';
  }

  DOM.sortableHeaders.forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    th.removeAttribute('aria-sort');
    if (th.dataset.sort === sortConfig.field) {
      th.classList.add(sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc');
      th.setAttribute('aria-sort', sortConfig.direction === 'asc' ? 'ascending' : 'descending');
    }
  });
  applyFilters();
}

function applyFilters() {
  filteredProducts = ordenarFiltrados(filterProducts());
  renderProductsTables();
  if (abaAtual === 'estoque') renderSubtabs();
}

function clearAllFilters() {
  DOM.filterSearch.value = '';
  DOM.filterType.value = '';
  DOM.filterBrand.value = '';
  DOM.filterVariacao.value = '';
  DOM.filterStock.value = '';
  applyFilters();
}

function toggleFiltersPanel(forcarAberto = null) {
  const abrir = forcarAberto !== null ? forcarAberto : DOM.filtersPanel.classList.contains('hidden');
  DOM.filtersPanel.classList.toggle('hidden', !abrir);
  DOM.filtersToggleBtn.classList.toggle('active', abrir);
  DOM.filtersToggleBtn.setAttribute('aria-expanded', String(abrir));
}

function renderFilterChips() {
  const chips = [];
  const { type, brand, variacao, stock } = getFilterValues();

  if (type) chips.push({ label: `Categoria: ${TIPO_LABELS[type] || type}`, limpar: () => { DOM.filterType.value = ''; } });
  if (brand) chips.push({ label: `Marca: ${brand}`, limpar: () => { DOM.filterBrand.value = ''; } });
  if (variacao) chips.push({ label: `Linha/tipo: ${variacao}`, limpar: () => { DOM.filterVariacao.value = ''; } });
  if (stock) chips.push({ label: STOCK_FILTER_LABELS[stock] || stock, limpar: () => { DOM.filterStock.value = ''; } });

  DOM.filtersCount.textContent = chips.length;
  DOM.filtersCount.classList.toggle('hidden', chips.length === 0);

  if (!chips.length) {
    DOM.filtersChips.classList.add('hidden');
    DOM.filtersChips.innerHTML = '';
    return;
  }

  DOM.filtersChips.classList.remove('hidden');
  DOM.filtersChips.innerHTML = chips.map((chip, i) => `
    <span class="filter-chip">${esc(chip.label)}<button type="button" data-chip="${i}" aria-label="Remover filtro ${esc(chip.label)}"><i class="ti ti-x"></i></button></span>
  `).join('') + (chips.length > 1 ? '<button type="button" class="btn-link" data-chip="todos">Limpar tudo</button>' : '');

  DOM.filtersChips.onclick = (e) => {
    const alvo = e.target.closest('[data-chip]');
    if (!alvo) return;
    if (alvo.dataset.chip === 'todos') { clearAllFilters(); return; }
    chips[Number(alvo.dataset.chip)].limpar();
    applyFilters();
  };
}

function preencherSelect(select, valores, rotuloTodos = 'Todas') {
  const atual = select.value;
  select.innerHTML = `<option value="">${rotuloTodos}</option>` +
    valores.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  select.value = valores.includes(atual) ? atual : '';
}

function updateFilterOptions() {
  preencherSelect(DOM.filterBrand, getUniqueBrands());
  const variacoes = [...new Set([...products, ...produtosArquivados].map(p => p.variacao).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  preencherSelect(DOM.filterVariacao, variacoes);
}

// ============================================
// EXPORTAÇÃO CSV
// ============================================

function exportarEstoqueCSV() {
  if (!products.length) {
    showToast('Não há produtos para exportar.', 'warning');
    return;
  }

  const cabecalho = ['Categoria', 'Marca', 'Modelo', 'Linha/Tipo', 'Preço de venda'];
  if (souDono()) cabecalho.push('Preço de custo');
  cabecalho.push('Quantidade', 'Estoque mínimo', 'Situação', 'Observações');

  const linhas = products.map(p => {
    const custo = custoDoProduto(p.id);
    const linha = [TIPO_LABEL_SINGULAR[p.type] || p.type, p.brand, p.model, p.variacao, p.price];
    if (souDono()) linha.push(custo === null ? '' : custo);
    linha.push(p.quantity, estoqueMinimo(p), SITUACAO_INFO[situacaoEstoque(p)].label, p.notes);
    return linha;
  });

  baixarArquivo(gerarCSV(cabecalho, linhas), `vault-estoque-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  showToast('Planilha do estoque exportada.', 'success');
}

// ============================================
// EXCLUIR, ARQUIVAR E RESTAURAR
// ============================================

async function produtoTemHistorico(id) {
  const { count, error } = await supabaseClient
    .from('movimentacoes_estoque')
    .select('id', { count: 'exact', head: true })
    .eq('loja_id', lojaAtual.id)
    .eq('produto_id', id);

  // Na dúvida (erro de rede), trata como "tem histórico": arquivar é reversível,
  // excluir não.
  if (error) return true;
  return count > 0;
}

async function definirArquivado(id, arquivar) {
  const { error } = await supabaseClient
    .from('products')
    .update({ arquivado_em: arquivar ? new Date().toISOString() : null })
    .eq('id', id)
    .eq('loja_id', lojaAtual.id);

  if (error) {
    showToast(arquivar ? 'Não foi possível arquivar o produto.' : 'Não foi possível restaurar o produto.', 'error');
    return false;
  }

  await recarregarProdutos();
  return true;
}

async function restaurarProduto(id) {
  const product = produtosArquivados.find(p => p.id === id);
  if (!product) return;

  if (await definirArquivado(id, false)) {
    showToast(`${nomeProduto(product)} voltou para o estoque.`, 'success');
  }
}

async function deleteProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  // O livro-caixa aponta para o produto, então quem já teve venda/movimentação não
  // pode ser apagado sem perder histórico. Nesse caso o produto é arquivado.
  if (await produtoTemHistorico(id)) {
    abrirModalConfirmacao({
      titulo: 'Arquivar produto?',
      mensagem: `${nomeProduto(product)} já tem vendas registradas, então não pode ser excluído sem apagar esse histórico. Ele será arquivado: sai do estoque e da frente de caixa, mas as vendas continuam nos relatórios. Dá para restaurar em Produtos → Filtrar → Arquivados.`,
      textoConfirmar: 'Arquivar',
      aoConfirmar: async () => {
        if (await definirArquivado(id, true)) showToast('Produto arquivado.', 'success');
      },
    });
    return;
  }

  abrirModalConfirmacao({
    titulo: 'Excluir produto?',
    mensagem: `${nomeProduto(product)} será excluído de vez. Essa ação não pode ser desfeita.`,
    textoConfirmar: 'Excluir',
    aoConfirmar: async () => {
      if (!(await deleteProductRow(id))) return;
      await recarregarProdutos();
      showToast('Produto excluído.', 'success');
    },
  });
}

// ============================================
// DATAS
// ============================================

function inicioDoDia(data = new Date()) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

function inicioDoDiaISO(diasAtras = 0) {
  const data = inicioDoDia();
  data.setDate(data.getDate() - diasAtras);
  return data.toISOString();
}

function inicioDoMes(data = new Date()) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function chaveDia(data) {
  const d = new Date(data);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// Vendas do livro-caixa entre duas datas (fim exclusivo). Usado por início e análises.
async function buscarVendasEntre(inicio, fim, colunas = 'quantidade, total, custo_unitario, created_at, venda_id, id, produto_id, produto_snapshot') {
  let query = supabaseClient
    .from('movimentacoes_estoque')
    .select(colunas)
    .eq('loja_id', lojaAtual.id)
    .eq('tipo', 'venda')
    .gte('created_at', inicio.toISOString())
    .order('created_at', { ascending: true })
    .limit(10000);
  if (fim) query = query.lt('created_at', fim.toISOString());

  const { data, error } = await query;
  if (error) return { erro: true, vendas: [] };
  return { erro: false, vendas: data };
}

// Lucro bruto de um lançamento de venda. Sem custo gravado = null (não vira zero).
function lucroDaMovimentacao(m) {
  if (m.custo_unitario === null || m.custo_unitario === undefined) return null;
  return (Number(m.total) || 0) - Number(m.custo_unitario) * Math.abs(Number(m.quantidade) || 0);
}

// Uma venda do carrinho gera um lançamento por item com o mesmo venda_id. Vendas
// antigas (um item por venda) não têm venda_id: cada lançamento é uma venda.
function contarVendas(movimentacoes) {
  return new Set(movimentacoes.map(m => m.venda_id || m.id)).size;
}

// ============================================
// HISTÓRICO DE VENDAS
// ============================================

function inicioPeriodoISO(dias) {
  if (!dias || dias === '0') return null;
  return inicioDoDiaISO(Number(dias) - 1);
}

async function carregarHistoricoVendas() {
  let query = supabaseClient
    .from('movimentacoes_estoque')
    .select('*')
    .eq('loja_id', lojaAtual.id)
    .eq('tipo', 'venda')
    .order('created_at', { ascending: false })
    .limit(500);

  const desde = inicioPeriodoISO(DOM.filterHistoricoPeriodo.value);
  if (desde) query = query.gte('created_at', desde);

  const { data, error } = await query;
  if (error) {
    showToast('Não foi possível carregar o histórico de vendas.', 'error');
    historicoVendas = [];
    return;
  }
  historicoVendas = data;
}

function updateHistoricoBrandFilter() {
  const marcas = [...new Set(historicoVendas.map(m => m.produto_snapshot?.brand).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  preencherSelect(DOM.filterHistoricoBrand, marcas, 'Todas as marcas');
}

const PERIODO_LABELS = { '7': 'Últimos 7 dias', '30': 'Últimos 30 dias', '90': 'Últimos 90 dias', '0': 'Tudo' };

function filtrarHistoricoAtual() {
  const marca = DOM.filterHistoricoBrand.value;
  const busca = DOM.filterHistoricoSearch.value;

  return historicoVendas.filter(m => {
    const snap = m.produto_snapshot || {};
    return (!marca || snap.brand === marca) && matchesSearchTerm(snap, busca);
  });
}

function renderHistoricoFilterChips() {
  const chips = [];
  if (DOM.filterHistoricoBrand.value) {
    chips.push({ label: `Marca: ${DOM.filterHistoricoBrand.value}`, limpar: () => { DOM.filterHistoricoBrand.value = ''; renderHistoricoVendas(); } });
  }
  if (DOM.filterHistoricoPeriodo.value !== '30') {
    chips.push({
      label: PERIODO_LABELS[DOM.filterHistoricoPeriodo.value] || DOM.filterHistoricoPeriodo.value,
      limpar: () => { DOM.filterHistoricoPeriodo.value = '30'; atualizarAbaVendas(); },
    });
  }

  DOM.filtersHistoricoChips.classList.toggle('hidden', chips.length === 0);
  DOM.filtersHistoricoChips.innerHTML = chips.map((chip, i) => `
    <span class="filter-chip">${esc(chip.label)}<button type="button" data-chip="${i}" aria-label="Remover filtro"><i class="ti ti-x"></i></button></span>
  `).join('');
  DOM.filtersHistoricoChips.onclick = (e) => {
    const alvo = e.target.closest('[data-chip]');
    if (alvo) chips[Number(alvo.dataset.chip)].limpar();
  };
}

function obterIniciaisPessoa(texto) {
  if (!texto) return '?';
  const partes = texto.replace(/[._-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

// Não existe nome cadastrado para os membros da loja (só e-mail): usa a parte antes do
// @ como nome de exibição. O nome do próprio usuário vem do perfil (nomeUsuario()).
function nomeDoEmail(email) {
  const usuario = String(email || '').split('@')[0];
  return usuario.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

function renderPessoaChip(email, nome = null) {
  if (!email) return '<span class="texto-muted">—</span>';
  const exibicao = nome || nomeDoEmail(email);
  return `
    <span class="vendedor-chip">
      <span class="avatar avatar--sm avatar--soft">${esc(obterIniciaisPessoa(exibicao))}</span>
      ${esc(exibicao)}
    </span>`;
}

function renderHistoricoVendas() {
  const filtrado = filtrarHistoricoAtual();

  DOM.historicoCount.textContent = `${filtrado.length} ${pluralize(filtrado.length, 'item vendido', 'itens vendidos')} no período`;
  DOM.historicoVendasTable.classList.toggle('hidden', filtrado.length === 0);
  DOM.historicoVendasEmpty.classList.toggle('hidden', filtrado.length > 0);

  DOM.historicoVendasBody.innerHTML = filtrado.map(m => {
    const snap = m.produto_snapshot || {};
    return `
      <tr>
        <td data-label="Data" class="texto-muted">${formatarDataHora(m.created_at)}</td>
        <td data-label="" class="td-titulo">${renderProdutoCell(snap, { comCategoria: true })}</td>
        <td data-label="Quantidade" class="num">${Math.abs(m.quantidade)}</td>
        <td data-label="Preço unit." class="num">${formatCurrency(m.preco_unitario)}</td>
        <td data-label="Total" class="num"><strong>${formatCurrency(m.total)}</strong></td>
        <td data-label="Vendido por">${renderPessoaChip(m.responsavel_email)}</td>
      </tr>`;
  }).join('');

  const totalPeriodo = filtrado.reduce((soma, m) => soma + (Number(m.total) || 0), 0);
  DOM.historicoTotalRow.classList.toggle('hidden', filtrado.length === 0);
  DOM.historicoTotalValor.textContent = formatCurrency(totalPeriodo);

  renderHistoricoFilterChips();
}

function exportarHistoricoCSV() {
  const filtrado = filtrarHistoricoAtual();
  if (!filtrado.length) {
    showToast('Não há vendas para exportar nesse período.', 'warning');
    return;
  }

  const linhas = filtrado.map(m => {
    const snap = m.produto_snapshot || {};
    return [
      formatarDataHora(m.created_at),
      TIPO_LABEL_SINGULAR[snap.type] || snap.type,
      snap.brand, snap.model, snap.variacao,
      Math.abs(m.quantidade), m.preco_unitario, m.total, m.responsavel_email,
    ];
  });
  const cabecalho = ['Data', 'Categoria', 'Marca', 'Modelo', 'Linha/Tipo', 'Quantidade', 'Preço unitário', 'Total', 'Vendido por'];
  baixarArquivo(gerarCSV(cabecalho, linhas), `vault-vendas-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  showToast('Planilha de vendas exportada.', 'success');
}

async function carregarResumoVendas() {
  const { erro, vendas } = await buscarVendasEntre(new Date(inicioDoDiaISO(31)), null, 'total, created_at');
  const alvos = [DOM.resumoVendasHoje, DOM.resumoVendas7dias, DOM.resumoVendasMes];
  if (erro) {
    alvos.forEach(el => { el.textContent = formatCurrency(0); });
    return;
  }

  const hojeChave = chaveDia(new Date());
  const seteDiasAtras = new Date(inicioDoDiaISO(6));
  const mes = inicioDoMes();
  let hoje = 0, seteDias = 0, noMes = 0;

  vendas.forEach(m => {
    const data = new Date(m.created_at);
    const valor = Number(m.total) || 0;
    if (chaveDia(data) === hojeChave) hoje += valor;
    if (data >= seteDiasAtras) seteDias += valor;
    if (data >= mes) noMes += valor;
  });

  animarContagem(DOM.resumoVendasHoje, hoje, formatCurrency);
  animarContagem(DOM.resumoVendas7dias, seteDias, formatCurrency);
  animarContagem(DOM.resumoVendasMes, noMes, formatCurrency);
}

async function atualizarAbaVendas() {
  await carregarHistoricoVendas();
  updateHistoricoBrandFilter();
  renderHistoricoVendas();
  await carregarResumoVendas();
}

// ============================================
// NAVEGAÇÃO
// ============================================
// Menu: Início · Vender · Produtos · Análises · Gestão. Cada item agrupa uma ou mais
// páginas (abas internas). "estoque-baixo" é a lista de produtos já filtrada.

const NAV = {
  inicio: { paginas: [['dashboard', 'Início']] },
  vender: {
    titulo: 'Vender',
    desc: 'Registre vendas e acompanhe o histórico.',
    paginas: [['vendas', 'Frente de caixa'], ['historico', 'Histórico']],
  },
  produtos: {
    titulo: 'Produtos',
    desc: 'Consulte e organize seu estoque.',
    paginas: [['estoque', 'Todos os produtos'], ['cadastro', 'Cadastrar produto'], ['estoque-baixo', 'Estoque baixo']],
  },
  analises: {
    titulo: 'Análises',
    desc: 'Vendas, lucro, produtos e estoque em detalhe.',
    paginas: [['analises', 'Análises']],
  },
  gestao: {
    titulo: 'Gestão',
    desc: 'Metas, equipe e configurações da loja.',
    paginas: [['metas', 'Metas'], ['equipe', 'Equipe'], ['config', 'Configurações']],
  },
};

const GRUPO_DA_ABA = {
  dashboard: 'inicio', vendas: 'vender', historico: 'vender',
  estoque: 'produtos', cadastro: 'produtos', 'estoque-baixo': 'produtos',
  analises: 'analises', metas: 'gestao', equipe: 'gestao', config: 'gestao',
};

// Vendedor só acessa Vender (o RLS do Supabase é a barreira real; aqui é só para não
// mostrar o que a pessoa não pode usar).
const ABAS_VENDEDOR = ['vendas', 'historico'];

function abasPermitidas() {
  const tipo = lojaAtual?.tipo_negocio || 'ambos';
  const comVenda = ['revenda', 'ambos'].includes(tipo);
  return Object.keys(GRUPO_DA_ABA).filter(aba => {
    if (!souDono()) return ABAS_VENDEDOR.includes(aba);
    if (!comVenda && ['vendas', 'historico', 'estoque', 'cadastro', 'estoque-baixo'].includes(aba)) return false;
    return true;
  });
}

function primeiraAbaDoGrupo(grupo) {
  const permitidas = abasPermitidas();
  return NAV[grupo].paginas.map(([aba]) => aba).find(aba => permitidas.includes(aba)) || null;
}

function nomeUsuario() {
  const doPerfil = usuarioAtual?.user_metadata?.nome;
  if (doPerfil && String(doPerfil).trim()) return String(doPerfil).trim();
  return nomeDoEmail(usuarioAtual?.email) || 'você';
}

function primeiroNome() {
  return nomeUsuario().split(/\s+/)[0];
}

function atualizarCabecalho() {
  const grupo = GRUPO_DA_ABA[abaAtual];
  if (grupo === 'inicio') {
    DOM.pageTitle.textContent = `Olá, ${primeiroNome()}!`;
    DOM.pageDesc.textContent = 'Confira o resumo da sua loja.';
  } else {
    DOM.pageTitle.textContent = NAV[grupo].titulo;
    DOM.pageDesc.textContent = NAV[grupo].desc;
  }

  DOM.acoesPagina.forEach(btn => {
    const visivel = btn.dataset.acaoDe === abaAtual && (btn.id !== 'acao-nova-venda' || abasPermitidas().includes('vendas'));
    btn.classList.toggle('visivel', visivel && souDono());
  });
}

function abaVisivelNoSubmenu() {
  if (abaAtual === 'estoque' && DOM.filterStock.value === 'low') return 'estoque-baixo';
  return abaAtual;
}

function renderSubtabs() {
  const grupo = GRUPO_DA_ABA[abaAtual];
  const permitidas = abasPermitidas();
  const paginas = NAV[grupo].paginas.filter(([aba]) => permitidas.includes(aba));

  if (paginas.length < 2) {
    DOM.subtabs.classList.add('hidden');
    DOM.subtabs.innerHTML = '';
    return;
  }

  const ativa = abaVisivelNoSubmenu();
  const baixos = products.filter(p => situacaoEstoque(p) === 'baixo').length;
  DOM.subtabs.classList.remove('hidden');
  DOM.subtabs.innerHTML = paginas.map(([aba, rotulo]) => {
    const contador = aba === 'estoque-baixo' && baixos ? `<span class="badge badge-baixo">${baixos}</span>` : '';
    const rotuloFinal = aba === 'cadastro' && typeof estaEditandoProduto === 'function' && estaEditandoProduto() ? 'Editar produto' : rotulo;
    return `<button type="button" class="subtab ${aba === ativa ? 'active' : ''}" data-subtab="${aba}" ${aba === ativa ? 'aria-current="page"' : ''}>${rotuloFinal}${contador}</button>`;
  }).join('');
}

function changeTab(tabId) {
  let destino = tabId;

  // "Estoque baixo" é a lista de produtos com o filtro de estoque baixo.
  if (destino === 'estoque-baixo') {
    DOM.filterStock.value = 'low';
    applyFilters();
    destino = 'estoque';
  }

  if (!abasPermitidas().includes(destino)) {
    destino = abasPermitidas()[0] || 'vendas';
  }

  const anterior = abaAtual;
  if (anterior === 'cadastro' && destino !== 'cadastro' && typeof cadastroAoSair === 'function') cadastroAoSair();

  abaAtual = destino;
  const grupo = GRUPO_DA_ABA[destino];
  DOM.navItems.forEach(btn => {
    const ativo = btn.dataset.nav === grupo;
    btn.classList.toggle('active', ativo);
    if (ativo) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
  });
  DOM.panels.forEach(panel => panel.classList.toggle('active', panel.id === destino));

  atualizarCabecalho();
  renderSubtabs();

  if (destino === 'vendas' && typeof renderPdv === 'function') renderPdv();
  if (destino === 'historico') atualizarAbaVendas();
  if (destino === 'equipe') renderEquipe();
  if (destino === 'analises' && typeof carregarAnalises === 'function') carregarAnalises();
  if (destino === 'metas' && typeof renderMetas === 'function') renderMetas();
  if (destino === 'config' && typeof renderConfig === 'function') renderConfig();
  if (destino === 'cadastro' && typeof cadastroAoEntrar === 'function') cadastroAoEntrar();

  if (anterior !== destino) window.scrollTo({ top: 0, behavior: prefereMenosMovimento() ? 'auto' : 'smooth' });
}

function handleCliqueSubtab(e) {
  const btn = e.target.closest('[data-subtab]');
  if (!btn) return;
  const aba = btn.dataset.subtab;
  // Sair de "Estoque baixo" para "Todos os produtos" tira o filtro.
  if (aba === 'estoque' && DOM.filterStock.value === 'low') {
    DOM.filterStock.value = '';
    applyFilters();
  }
  changeTab(aba);
}

function aplicarPermissoesNaTela() {
  const permitidas = abasPermitidas();
  DOM.navItems.forEach(btn => {
    const temAlguma = NAV[btn.dataset.nav].paginas.some(([aba]) => permitidas.includes(aba));
    btn.classList.toggle('hidden', !temAlguma);
  });
  document.body.classList.toggle('papel-vendedor', !souDono());
}

// ============================================
// MODAL
// ============================================

let timerFechamentoModal = null;
let focoAntesDoModal = null;

function abrirModal(html, { largo = false } = {}) {
  if (html !== undefined) DOM.modalBody.innerHTML = html;
  // Se um modal acabou de fechar, cancela o fim da animação dele — senão o timer
  // fecharia este que está abrindo agora (ex.: confirmação → recibo).
  clearTimeout(timerFechamentoModal);
  focoAntesDoModal = document.activeElement;
  DOM.modalContent.classList.remove('closing');
  DOM.modalContent.classList.toggle('modal-content--wide', largo);
  DOM.modalBackdrop.classList.add('active');
  DOM.modal.classList.add('active');
  requestAnimationFrame(() => {
    const alvo = DOM.modalBody.querySelector('[autofocus], input, .btn-primary, .btn-danger, button');
    alvo?.focus();
  });
}

function fecharModal() {
  DOM.modalContent.classList.add('closing');
  DOM.modalBackdrop.classList.remove('active');

  clearTimeout(timerFechamentoModal);
  timerFechamentoModal = setTimeout(() => {
    DOM.modal.classList.remove('active');
    DOM.modalContent.classList.remove('closing');
    focoAntesDoModal?.focus?.();
  }, 150);
}

function abrirModalConfirmacao({ titulo, mensagem, textoConfirmar = 'Confirmar', aoConfirmar, perigo = true }) {
  abrirModal(`
    <h3 class="modal-title">${esc(titulo)}</h3>
    <p class="modal-message">${esc(mensagem)}</p>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancelar</button>
      <button type="button" class="btn ${perigo ? 'btn-danger' : 'btn-primary'}" id="modal-confirm-btn">${esc(textoConfirmar)}</button>
    </div>
  `);

  DOM.modalBody.querySelector('#modal-cancel-btn').addEventListener('click', fecharModal);
  DOM.modalBody.querySelector('#modal-confirm-btn').addEventListener('click', () => {
    fecharModal();
    aoConfirmar();
  });
}

// ============================================
// AVISOS (toasts)
// ============================================

const TOAST_ICONES = { success: 'ti-check', error: 'ti-x', warning: 'ti-alert-triangle', info: 'ti-info-small' };

function showToast(message, type = 'info', duration = 3200) {
  // Mensagens antigas vinham com emoji na frente; o ícone do aviso já faz esse papel.
  const texto = String(message).replace(/^[\s✅❌⚠️📋🎉️]+/u, '');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.innerHTML = `
    <span class="toast-icone"><i class="ti ${TOAST_ICONES[type] || TOAST_ICONES.info}"></i></span>
    <div class="toast-message">${esc(texto)}</div>
  `;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 220);
  }, duration);
}

// ============================================
// LOGIN E LOJA
// ============================================

let modoCadastro = false;

function mostrarTela(nome) {
  DOM.loginScreen.classList.toggle('active', nome === 'login');
  DOM.onboardingScreen.classList.toggle('active', nome === 'onboarding');
  DOM.appContainer.classList.toggle('active', nome === 'app');
}

function aplicarModoLogin(cadastro) {
  modoCadastro = cadastro;
  DOM.loginSubtitle.textContent = modoCadastro ? 'Criar sua conta' : 'Entrar na sua conta';
  DOM.loginSubmitBtn.textContent = modoCadastro ? 'Criar conta' : 'Entrar';
  DOM.loginToggleText.textContent = modoCadastro ? 'Já tem conta?' : 'Ainda não tem conta?';
  DOM.loginToggleMode.textContent = modoCadastro ? 'Entrar' : 'Criar conta';
  DOM.loginPassword.autocomplete = modoCadastro ? 'new-password' : 'current-password';
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = DOM.loginEmail.value.trim();
  const senha = DOM.loginPassword.value;
  DOM.loginSubmitBtn.disabled = true;

  try {
    if (modoCadastro) {
      const { data, error } = await cadastrarUsuario(email, senha);
      if (error) {
        showToast(error.message, 'error');
        return;
      }
      if (!data.session) {
        showToast('Conta criada! Confirme seu e-mail e depois entre.', 'success', 5000);
        aplicarModoLogin(false);
        DOM.loginForm.reset();
        return;
      }
      await carregarContextoLoja(data.user);
      return;
    }

    const { data, error } = await entrarComSenha(email, senha);
    if (error) {
      showToast('E-mail ou senha inválidos.', 'error');
      return;
    }
    await carregarContextoLoja(data.user);
  } finally {
    DOM.loginSubmitBtn.disabled = false;
  }
}

async function handleOnboardingSubmit(event) {
  event.preventDefault();
  const nome = DOM.onboardingNome.value.trim();
  const tipo = DOM.onboardingTipo.value;

  if (!nome) {
    showToast('Informe o nome da loja.', 'error');
    return;
  }

  const resultado = await criarLojaEVincularDono(nome, tipo, usuarioAtual);
  if (resultado.error) {
    console.error('Erro ao criar a loja:', resultado.error);
    showToast(`Não foi possível criar a loja: ${resultado.error.message}`, 'error', 5000);
    return;
  }

  lojaAtual = resultado.loja;
  membroAtual = resultado.membro;
  await entrarNoApp();
  showToast(`Loja "${lojaAtual.nome}" criada!`, 'success');
}

async function carregarContextoLoja(usuario) {
  usuarioAtual = usuario;
  membroAtual = await buscarMembroDoUsuario(usuario.id);
  if (!membroAtual) membroAtual = await aceitarConviteSeExistir(usuario);

  if (!membroAtual) {
    mostrarTela('onboarding');
    return;
  }

  lojaAtual = await buscarLoja(membroAtual.loja_id);
  await entrarNoApp();
}

async function entrarNoApp() {
  mostrarTela('app');
  atualizarIdentidade();
  aplicarPermissoesNaTela();
  changeTab(souDono() ? 'dashboard' : 'vendas');
  await carregarDadosDoApp();
}

async function carregarDadosDoApp() {
  renderSkeletonRows();
  if (typeof renderDashboardSkeleton === 'function') renderDashboardSkeleton();
  await Promise.all([loadProducts(), carregarCatalogo()]);
  applyFilters();
  renderSubtabs();
  if (typeof renderPdv === 'function') renderPdv();
  if (typeof cadastroAoCarregar === 'function') cadastroAoCarregar();
  updateDashboard();
}

async function iniciarSessao() {
  const sessao = await obterSessaoAtual();
  if (!sessao) {
    mostrarTela('login');
    return;
  }
  await carregarContextoLoja(sessao.user);
}

function atualizarIdentidade() {
  const nome = nomeUsuario();
  const iniciais = obterIniciaisPessoa(nome);
  DOM.lojaAtualNome.textContent = lojaAtual ? lojaAtual.nome : '';
  DOM.sidebarUserName.textContent = nome;
  DOM.sidebarAvatar.textContent = iniciais;
  DOM.mobileAvatar.textContent = iniciais;
  if (GRUPO_DA_ABA[abaAtual] === 'inicio') atualizarCabecalho();
}

function souDono() {
  return membroAtual?.papel === 'dono';
}

// Conta: nome de exibição (fica no perfil do usuário no Supabase Auth), loja e sair.
function abrirModalConta() {
  abrirModal(`
    <div class="detalhe-topo">
      <span class="avatar">${esc(obterIniciaisPessoa(nomeUsuario()))}</span>
      <div>
        <h3 class="modal-title" style="padding:0">Minha conta</h3>
        <p class="card-desc">${esc(usuarioAtual?.email || '')}</p>
      </div>
    </div>
    <form class="modal-form" id="conta-form">
      <label class="field">
        <span class="field-label">Como quer ser chamado?</span>
        <input type="text" id="conta-nome" maxlength="40" value="${esc(usuarioAtual?.user_metadata?.nome || '')}" placeholder="${esc(nomeDoEmail(usuarioAtual?.email))}" />
      </label>
      <dl class="detalhe-lista">
        <div><dt>Loja</dt><dd>${esc(lojaAtual?.nome || '')}</dd></div>
        <div><dt>Perfil</dt><dd>${esc(PAPEL_LABELS[membroAtual?.papel] || '')}</dd></div>
      </dl>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" id="conta-sair" style="margin-right:auto"><i class="ti ti-logout"></i>Sair</button>
        <button type="submit" class="btn btn-primary">Salvar</button>
      </div>
    </form>
  `);

  DOM.modalBody.querySelector('#conta-sair').addEventListener('click', () => { fecharModal(); handleLogout(); });
  DOM.modalBody.querySelector('#conta-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = DOM.modalBody.querySelector('#conta-nome').value.trim().slice(0, 40);
    const { data, error } = await supabaseClient.auth.updateUser({ data: { nome } });
    if (error) {
      showToast('Não foi possível salvar o nome.', 'error');
      return;
    }
    if (data?.user) usuarioAtual = data.user;
    else usuarioAtual = { ...usuarioAtual, user_metadata: { ...(usuarioAtual.user_metadata || {}), nome } };
    atualizarIdentidade();
    fecharModal();
    showToast('Nome atualizado.', 'success');
  });
}

function handleLogout() {
  abrirModalConfirmacao({
    titulo: 'Sair da conta?',
    mensagem: 'Você vai precisar do e-mail e da senha para entrar de novo.',
    textoConfirmar: 'Sair',
    perigo: false,
    aoConfirmar: async () => {
      await sair();
      products = [];
      produtosArquivados = [];
      if (typeof limparCarrinho === 'function') limparCarrinho();
      DOM.loginForm.reset();
      aplicarModoLogin(false);
      mostrarTela('login');
      showToast('Até logo!', 'info');
    },
  });
}

// ============================================
// EQUIPE
// ============================================

function podeGerenciarEquipe() {
  return souDono();
}

function sincronizarPapelSelector() {
  const papel = DOM.invitePapel.value;
  DOM.papelOptions.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.papel === papel);
    btn.setAttribute('aria-checked', String(btn.dataset.papel === papel));
  });
  DOM.papelDescricao.textContent = PAPEL_DESCRICOES[papel] || '';
}

function selecionarPapelConvite(papel) {
  DOM.invitePapel.value = papel;
  sincronizarPapelSelector();
}

function renderBadgePapel(papel) {
  const classe = papel === 'dono' ? 'badge-roxo' : 'badge-blue';
  return `<span class="badge badge-plain ${classe}">${esc(PAPEL_LABELS[papel] || papel)}</span>`;
}

async function renderEquipe() {
  DOM.inviteForm.classList.toggle('hidden', !podeGerenciarEquipe());
  DOM.equipeTableBody.innerHTML = '<tr><td colspan="5"><span class="skeleton" style="height:14px;width:40%"></span></td></tr>';

  const [membros, convites] = await Promise.all([
    buscarMembrosDaLoja(lojaAtual.id),
    podeGerenciarEquipe() ? buscarConvitesPendentes(lojaAtual.id) : Promise.resolve([]),
  ]);

  const linhasMembros = membros.map(m => {
    const ehVoce = m.usuario_id === usuarioAtual.id;
    const nome = ehVoce ? nomeUsuario() : null;
    const podeRemover = podeGerenciarEquipe() && !ehVoce;
    return `
      <tr>
        <td data-label="" class="td-titulo">${renderPessoaChip(m.email, nome)}${ehVoce ? ' <span class="texto-muted">(você)</span>' : ''}</td>
        <td data-label="Perfil">${renderBadgePapel(m.papel)}</td>
        <td data-label="Situação"><span class="badge badge-ok">Ativo</span></td>
        <td data-label="Desde">${new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
        <td data-label=""><div class="acoes">${podeRemover ? `<button type="button" class="icon-btn icon-btn--danger" data-remover-membro="${esc(m.id)}" title="Remover da equipe" aria-label="Remover ${esc(m.email)}"><i class="ti ti-user-minus"></i></button>` : ''}</div></td>
      </tr>`;
  });

  const linhasConvites = convites.map(c => `
      <tr>
        <td data-label="" class="td-titulo">
          <span class="vendedor-chip"><span class="avatar avatar--sm avatar--soft"><i class="ti ti-mail"></i></span>${esc(c.email)}</span>
        </td>
        <td data-label="Perfil">${renderBadgePapel(c.papel)}</td>
        <td data-label="Situação"><span class="badge badge-baixo">Convite pendente</span></td>
        <td data-label="Enviado">${new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
        <td data-label="">
          <div class="acoes">
            <button type="button" class="icon-btn" data-reenviar="${esc(c.id)}" title="Reenviar convite" aria-label="Reenviar convite"><i class="ti ti-send"></i></button>
            <button type="button" class="icon-btn icon-btn--danger" data-cancelar="${esc(c.id)}" title="Cancelar convite" aria-label="Cancelar convite"><i class="ti ti-x"></i></button>
          </div>
        </td>
      </tr>`);

  DOM.equipeTableBody.innerHTML = [...linhasMembros, ...linhasConvites].join('');
  DOM.equipeTableBody.onclick = (e) => {
    const remover = e.target.closest('[data-remover-membro]');
    const reenviar = e.target.closest('[data-reenviar]');
    const cancelar = e.target.closest('[data-cancelar]');
    if (remover) removerMembroDaEquipe(membros.find(m => String(m.id) === remover.dataset.removerMembro));
    if (reenviar) reenviarConvite(convites.find(c => String(c.id) === reenviar.dataset.reenviar));
    if (cancelar) cancelarConviteNaTela(convites.find(c => String(c.id) === cancelar.dataset.cancelar));
  };
}

function removerMembroDaEquipe(membro) {
  if (!membro) return;
  abrirModalConfirmacao({
    titulo: 'Remover da equipe?',
    mensagem: `${membro.email} perde o acesso à loja.`,
    textoConfirmar: 'Remover',
    aoConfirmar: async () => {
      if (!(await removerMembro(membro.id))) {
        showToast('Não foi possível remover.', 'error');
        return;
      }
      showToast('Pessoa removida da equipe.', 'success');
      renderEquipe();
    },
  });
}

async function reenviarConvite(convite) {
  if (!convite) return;
  const resultado = await convidarMembro(convite.email, convite.papel, lojaAtual.id);
  if (resultado.error) {
    showToast(resultado.error, 'error');
    return;
  }
  showToast(`Convite reenviado para ${convite.email}.`, 'success');
  renderEquipe();
}

function cancelarConviteNaTela(convite) {
  if (!convite) return;
  abrirModalConfirmacao({
    titulo: 'Cancelar convite?',
    mensagem: `O convite enviado para ${convite.email} deixa de valer.`,
    textoConfirmar: 'Cancelar convite',
    aoConfirmar: async () => {
      if (!(await cancelarConvite(convite.id))) {
        showToast('Não foi possível cancelar o convite.', 'error');
        return;
      }
      showToast('Convite cancelado.', 'success');
      renderEquipe();
    },
  });
}

async function handleInviteSubmit(event) {
  event.preventDefault();
  const email = DOM.inviteEmail.value.trim();
  const papel = DOM.invitePapel.value;

  const resultado = await convidarMembro(email, papel, lojaAtual.id);
  if (resultado.error) {
    showToast(resultado.error, 'error');
    return;
  }

  showToast(`Convite enviado para ${email}.`, 'success');
  DOM.inviteForm.reset();
  DOM.invitePapel.value = 'vendedor';
  sincronizarPapelSelector();
  renderEquipe();
}

// ============================================
// EVENTOS
// ============================================

function initEventListeners() {
  // Login
  DOM.loginForm.addEventListener('submit', handleAuthSubmit);
  DOM.loginToggleMode.addEventListener('click', () => aplicarModoLogin(!modoCadastro));
  DOM.onboardingForm.addEventListener('submit', handleOnboardingSubmit);
  DOM.logoutButton.addEventListener('click', handleLogout);
  DOM.sidebarUserBtn.addEventListener('click', abrirModalConta);
  DOM.mobileAvatar.addEventListener('click', abrirModalConta);

  // Navegação
  DOM.navItems.forEach(btn => btn.addEventListener('click', () => {
    const aba = primeiraAbaDoGrupo(btn.dataset.nav);
    if (!aba) return;
    // Voltar a "Produtos" pelo menu mostra todos (sem o filtro de estoque baixo).
    if (aba === 'estoque' && DOM.filterStock.value === 'low') { DOM.filterStock.value = ''; applyFilters(); }
    changeTab(aba);
  }));
  DOM.subtabs.addEventListener('click', handleCliqueSubtab);
  $('acao-nova-venda').addEventListener('click', () => changeTab('vendas'));
  $('acao-novo-produto').addEventListener('click', () => changeTab('cadastro'));

  // Equipe
  DOM.inviteForm.addEventListener('submit', handleInviteSubmit);
  DOM.papelOptions.forEach(btn => btn.addEventListener('click', () => selecionarPapelConvite(btn.dataset.papel)));

  // Cadastro, início, frente de caixa, análises e gestão têm os próprios eventos.
  if (typeof initCadastro === 'function') initCadastro();
  if (typeof initDashboard === 'function') initDashboard();
  if (typeof initPdv === 'function') initPdv();
  if (typeof initAnalises === 'function') initAnalises();
  if (typeof initGestao === 'function') initGestao();

  // Produtos: busca, filtros, tabela
  DOM.filterSearch.addEventListener('input', applyFilters);
  [DOM.filterType, DOM.filterBrand, DOM.filterVariacao, DOM.filterStock].forEach(el => el.addEventListener('change', applyFilters));
  DOM.filtersToggleBtn.addEventListener('click', () => toggleFiltersPanel());
  DOM.filtersClear.addEventListener('click', clearAllFilters);
  DOM.exportCsvBtn.addEventListener('click', exportarEstoqueCSV);
  DOM.productTableBody.addEventListener('click', handleCliqueTabelaProdutos);
  DOM.produtosCards.addEventListener('click', handleCliqueTabelaProdutos);
  DOM.produtosCards.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCliqueTabelaProdutos(e); }
  });
  DOM.sortableHeaders.forEach(th => {
    th.tabIndex = 0;
    th.addEventListener('click', () => ordenarPor(th.dataset.sort));
    th.addEventListener('keydown', (e) => { if (e.key === 'Enter') ordenarPor(th.dataset.sort); });
  });
  DOM.emptyStateCta.addEventListener('click', () => changeTab('cadastro'));

  // Histórico de vendas
  DOM.filterHistoricoSearch.addEventListener('input', renderHistoricoVendas);
  DOM.filterHistoricoPeriodo.addEventListener('change', atualizarAbaVendas);
  DOM.filterHistoricoBrand.addEventListener('change', renderHistoricoVendas);
  DOM.exportHistoricoCsvBtn.addEventListener('click', exportarHistoricoCSV);

  // Modal
  DOM.modalClose.addEventListener('click', fecharModal);
  DOM.modalBackdrop.addEventListener('click', fecharModal);
  DOM.modal.addEventListener('click', (e) => { if (e.target === DOM.modal) fecharModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.modal.classList.contains('active')) fecharModal();
  });
}

// ============================================
// INÍCIO
// ============================================

async function init() {
  initEventListeners();
  sincronizarPapelSelector();
  aplicarModoLogin(false);
  await iniciarSessao();
}

document.addEventListener('DOMContentLoaded', init);
