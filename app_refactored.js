// ============================================
// CONSTANTS & DATA
// ============================================

// Estoque mínimo padrão, usado quando o produto não tem um estoque_minimo próprio.
// A regra de "baixo/zerado" fica toda em situacaoEstoque().
const LIMITE_ESTOQUE_BAIXO = 5;
const PAPEL_LABELS = {
  dono: 'Dono',
  vendedor: 'Vendedor',
};

const PAPEL_DESCRICOES = {
  vendedor: 'Acessa só a aba Vendas, pode vender produtos e ajustar quantidade através da venda, não edita estoque nem cadastro.',
  dono: 'Acesso total ao sistema, incluindo cadastro, estoque e gestão da equipe.',
};

const BRAND_MODELS = {
  'Apple': ['iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max', 'iPhone 13', 'iPhone 13 mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max', 'iPhone 12', 'iPhone 12 mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max', 'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max'],
  'Samsung': ['Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra', 'Galaxy S23', 'Galaxy S23+', 'Galaxy S23 Ultra', 'Galaxy S22', 'Galaxy S22+', 'Galaxy S22 Ultra', 'Galaxy A54', 'Galaxy A53', 'Galaxy A52', 'Galaxy A51', 'Galaxy Z Fold 6', 'Galaxy Z Flip 6'],
  'Xiaomi': ['Xiaomi 14', 'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 13', 'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 12', 'Xiaomi 12 Pro', 'Xiaomi 12 Ultra', 'Redmi Note 13 Pro', 'Redmi Note 13', 'Redmi Note 12 Pro', 'Redmi 12', 'Redmi 11'],
  'Motorola': ['Edge 50 Pro', 'Edge 50', 'Edge 50 Fusion', 'Edge 40', 'Edge 40 Pro', 'Edge 40 Fusion', 'Moto G54', 'Moto G53', 'Moto G52', 'Razr 40', 'Razr 50'],
  'LG': ['LG G9', 'LG V50', 'LG V60', 'LG Wing', 'LG Velvet', 'LG K42', 'LG K52'],
  'Huawei': ['Huawei P60', 'Huawei P60 Pro', 'Huawei P50 Pro', 'Huawei Mate 60 Pro', 'Huawei Mate 50 Pro', 'Huawei Nova 11 Pro', 'Huawei Nova 10 Pro'],
  'OnePlus': ['OnePlus 12', 'OnePlus 12 Pro', 'OnePlus 11 Pro', 'OnePlus 11', 'OnePlus 10 Pro', 'OnePlus 10', 'OnePlus Nord 3', 'OnePlus Nord 2'],
  'TCL': ['TCL 30 Ultra', 'TCL 40 Ultra', 'TCL 50 Pro', 'TCL Fold', 'TCL 30'],
  'Nokia': ['Nokia G60', 'Nokia G50', 'Nokia G40', 'Nokia X30', 'Nokia X20', 'Nokia C3'],
  'Realme': ['Realme 13 Pro', 'Realme 12 Pro', 'Realme 12', 'Realme 11 Pro', 'Realme 11', 'Realme 10 Pro', 'Realme GT 6', 'Realme GT 5 Pro'],
  'Vivo': ['Vivo X100 Pro', 'Vivo X100', 'Vivo X90 Pro+', 'Vivo X90 Pro', 'Vivo X80 Pro', 'Vivo V29 Pro', 'Vivo Y200', 'Vivo Y100'],
  'Oppo': ['Oppo Find X8 Pro', 'Oppo Find X8', 'Oppo Find X7', 'Oppo Reno 11 Pro', 'Oppo Reno 11', 'Oppo A79', 'Oppo A78'],
  'Sony': ['Sony Xperia 1 VI', 'Sony Xperia 1 V', 'Sony Xperia 5 V', 'Sony Xperia 10 V', 'Sony Xperia 1 IV', 'Sony Xperia Pro'],
  'Google Pixel': ['Pixel 9 Pro', 'Pixel 9 Pro XL', 'Pixel 9 Pro Fold', 'Pixel 9', 'Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7'],
  'Outro': ['Modelo personalizado']
};

const TIPO_LABELS = {
  aparelhos: 'Aparelhos',
  capinhas: 'Capinhas',
  peliculas: 'Películas',
  acessorios: 'Acessórios',
};

const TIPO_ICONES = {
  aparelhos: 'ti-device-mobile',
  capinhas: 'ti-shield',
  peliculas: 'ti-square-rounded',
  acessorios: 'ti-plug',
};

const STOCK_FILTER_LABELS = {
  zero: 'Zerado',
  low: 'Baixo',
  sem_custo: 'Custo não informado',
  arquivados: 'Arquivados',
  medium: 'Médio (6-20)',
  high: 'Alto (20+)',
};

// ============================================
// DOM ELEMENTS
// ============================================

const DOM = {
  // Auth
  loginScreen: document.getElementById('login-screen'),
  appContainer: document.getElementById('app-container'),
  loginForm: document.getElementById('login-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  loginSubtitle: document.getElementById('login-subtitle'),
  loginSubmitBtn: document.getElementById('login-submit-btn'),
  loginToggleText: document.getElementById('login-toggle-text'),
  loginToggleMode: document.getElementById('login-toggle-mode'),
  userDisplay: document.getElementById('user-display'),
  logoutButton: document.getElementById('logout-button'),
  themeToggle: document.getElementById('theme-toggle'),

  // Onboarding
  onboardingScreen: document.getElementById('onboarding-screen'),
  onboardingForm: document.getElementById('onboarding-form'),
  onboardingNome: document.getElementById('onboarding-nome'),
  onboardingTipo: document.getElementById('onboarding-tipo'),
  lojaAtualNome: document.getElementById('loja-atual-nome'),
  dashboardSaudacao: document.getElementById('dashboard-saudacao'),

  // Header (barra de identidade, reaproveitada em todas as telas)
  headerPageTitle: document.getElementById('header-page-title'),
  headerPageSubtitle: document.getElementById('header-page-subtitle'),
  headerAvatar: document.getElementById('header-avatar'),

  // Equipe
  inviteForm: document.getElementById('invite-form'),
  inviteEmail: document.getElementById('invite-email'),
  invitePapel: document.getElementById('invite-papel'),
  papelOptions: document.querySelectorAll('#papel-selector .type-option'),
  papelDescricao: document.getElementById('papel-descricao'),
  equipeTableBody: document.getElementById('equipe-table-body'),

  // Sidebar
  sidebar: document.getElementById('sidebar'),
  menuToggle: document.getElementById('menu-toggle'),
  sidebarClose: document.getElementById('sidebar-close'),
  sidebarBackdrop: document.getElementById('sidebar-backdrop'),
  navItems: document.querySelectorAll('.nav-item'),
  navIndicator: document.getElementById('nav-indicator'),
  
  // Content
  panels: document.querySelectorAll('.tab-panel'),
  
  // O formulário de cadastro tem as próprias referências em cadastro.js.

  // Tables
  productTableBody: document.getElementById('product-table-body'),
  salesTableBody: document.getElementById('sales-table-body'),
  stockCountDisplay: document.getElementById('stock-count'),
  estoqueTable: document.getElementById('estoque-table'),
  estoqueEmptyState: document.getElementById('estoque-empty-state'),
  emptyStateCta: document.getElementById('empty-state-cta'),
  sortableHeaders: document.querySelectorAll('#estoque-table th.sortable'),
  exportCsvBtn: document.getElementById('export-csv-btn'),

  // Templates
  productRowTemplate: document.getElementById('product-row-template'),
  salesRowTemplate: document.getElementById('sales-row-template'),
  
  // Stock Filters
  filterSearch: document.getElementById('filter-search'),
  filterType: document.getElementById('filter-type'),
  typeQuickfilterBtns: document.querySelectorAll('.type-quickfilter-btn'),
  filtersToggleBtn: document.getElementById('filters-toggle-btn'),
  filtersPanel: document.getElementById('filters-panel'),
  filtersChips: document.getElementById('filters-chips'),
  statusChips: document.getElementById('status-chips'),
  filterBrand: document.getElementById('filter-brand'),
  filterStock: document.getElementById('filter-stock'),
  filterResultCount: document.getElementById('filter-result-count'),

  // Sales Filters
  filterSalesSearch: document.getElementById('filter-sales-search'),
  filterSalesBrand: document.getElementById('filter-sales-brand'),
  filtersSalesChips: document.getElementById('filters-sales-chips'),
  salesFilterResultCount: document.getElementById('sales-filter-result-count'),

  // Resumo e histórico de vendas
  resumoVendasHoje: document.getElementById('resumo-vendas-hoje'),
  resumoVendas7dias: document.getElementById('resumo-vendas-7dias'),
  resumoVendasMes: document.getElementById('resumo-vendas-mes'),
  filterHistoricoSearch: document.getElementById('filter-historico-search'),
  filterHistoricoPeriodo: document.getElementById('filter-historico-periodo'),
  filterHistoricoBrand: document.getElementById('filter-historico-brand'),
  filtersHistoricoChips: document.getElementById('filters-historico-chips'),
  historicoCount: document.getElementById('historico-count'),
  historicoVendasTable: document.getElementById('historico-vendas-table'),
  historicoVendasBody: document.getElementById('historico-vendas-body'),
  historicoVendasEmpty: document.getElementById('historico-vendas-empty'),
  historicoTotalRow: document.getElementById('historico-total-row'),
  historicoTotalValor: document.getElementById('historico-total-valor'),
  exportHistoricoCsvBtn: document.getElementById('export-historico-csv-btn'),

  // Dashboard
  dashTotal: document.getElementById('dash-total'),
  dashValorCompra: document.getElementById('dash-valor-compra'),
  dashValorVenda: document.getElementById('dash-valor-venda'),
  dashCustoPendente: document.getElementById('dash-custo-pendente'),
  dashCustoPendenteTexto: document.getElementById('dash-custo-pendente-texto'),
  dashCustoPendenteLink: document.getElementById('dash-custo-pendente-link'),
  dashVendasHoje: document.getElementById('dash-vendas-hoje'),
  dashVendasHojeValor: document.getElementById('dash-vendas-hoje-valor'),
  dashVendasHojeTrend: document.getElementById('dash-vendas-hoje-trend'),
  dashTicketMedio: document.getElementById('dash-ticket-medio'),
  vendas7dChartContainer: document.getElementById('dashboard-vendas7d-chart'),
  vaultDialContainer: document.getElementById('vault-dial-container'),
  vaultDialLegend: document.getElementById('vault-dial-legend'),
  dashboardBrandlist: document.getElementById('dashboard-brandlist'),
  dashboardBrandlistEmpty: document.getElementById('dashboard-brandlist-empty'),
  dashboardBrandlistCta: document.getElementById('dashboard-brandlist-cta'),
  lowStockList: document.getElementById('dashboard-lowstock-list'),
  lowStockEmpty: document.getElementById('dashboard-lowstock-empty'),
  lowStockCount: document.getElementById('dashboard-lowstock-count'),
  lowStockVerTodos: document.getElementById('dashboard-lowstock-vertodos'),

  // Toast
  toastContainer: document.getElementById('toast-container'),

  // Modal
  modalBackdrop: document.getElementById('modal-backdrop'),
  modal: document.getElementById('modal'),
  modalClose: document.getElementById('modal-close'),
  modalBody: document.querySelector('#modal .modal-body'),
  modalContent: document.querySelector('#modal .modal-content'),
};

// ============================================
// STATE
// ============================================

// products = só os ativos (o que aparece em estoque, vendas e dashboard).
// produtosArquivados = produtos com histórico que o dono "excluiu"; só aparecem no
// filtro "Arquivados" do estoque, de onde podem ser restaurados.
let products = [];
let produtosArquivados = [];
let filteredProducts = [];
let filteredSalesProducts = [];
let sortConfig = { field: null, direction: 'asc' };
let historicoVendas = [];

// ============================================
// PRODUTOS (Supabase)
// ============================================

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('loja_id', lojaAtual.id)
    .order('id', { ascending: false });

  if (error) {
    showToast('❌ Erro ao carregar produtos do Supabase.', 'error');
    products = [];
    produtosArquivados = [];
    return;
  }

  products = data.filter(p => !p.arquivado_em);
  produtosArquivados = data.filter(p => p.arquivado_em);
  await carregarCustos();
}

// ============================================
// CUSTOS (produtos_custos — só o dono lê, sql/011)
// ============================================

// produto_id → custo unitário (número). Produto ausente do mapa = custo não informado,
// que NUNCA é tratado como zero nas contas.
let custoPorProduto = {};

async function carregarCustos() {
  custoPorProduto = {};
  if (!souDono()) return;

  const { data, error } = await supabaseClient
    .from('produtos_custos')
    .select('produto_id, custo_unitario')
    .eq('loja_id', lojaAtual.id);

  if (error) return;

  data.forEach(c => {
    if (c.custo_unitario !== null) custoPorProduto[c.produto_id] = Number(c.custo_unitario);
  });
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
    showToast('❌ Produto salvo, mas não foi possível salvar o preço de custo.', 'error');
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

// Valores do estoque atual para o dashboard. Produto com quantidade e sem custo
// entra em "pendentes" e não soma nada no total de compra.
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
    showToast('❌ Erro ao atualizar produto no Supabase.', 'error');
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
    showToast('❌ Erro ao excluir produto no Supabase.', 'error');
    return false;
  }

  return true;
}

// ============================================
// STORAGE & AUTH
// ============================================

function saveTheme(theme) {
  localStorage.setItem('invenstore-theme', theme);
}

function loadTheme() {
  const saved = localStorage.getItem('invenstore-theme');
  const theme = saved || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

// ============================================
// FORMATTING & UTILITIES
// ============================================

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function parsePriceValue(value) {
  return Number(value.replace(/\s/g, '').replace(/R\$\s?/, '').replace(/\./g, '').replace(/,/g, '.')) || 0;
}

function formatPriceInput(value) {
  if (!value) return '';
  const num = typeof value === 'number' ? value : parsePriceValue(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function getUniqueBrands() {
  return [...new Set(products.map(p => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function pluralize(count, singular, plural = singular + 's') {
  return count === 1 ? singular : plural;
}

// Escapa texto vindo do banco antes de entrar num innerHTML (nome de produto, cor,
// e-mail, observações...). Sem isso, um nome como "<img onerror=...>" viraria código.
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// Estoque mínimo do produto: o que o dono configurou nele ou, se não configurou, o padrão.
function estoqueMinimo(product) {
  const minimo = product.estoque_minimo;
  return Number.isInteger(minimo) && minimo >= 0 ? minimo : LIMITE_ESTOQUE_BAIXO;
}

// Única regra de situação do estoque, usada no badge, nos filtros, nos chips e no dashboard.
function situacaoEstoque(product) {
  if (product.quantity <= 0) return 'zerado';
  if (product.quantity <= estoqueMinimo(product)) return 'baixo';
  return 'ok';
}

// ============================================
// TABLE RENDERING
// ============================================

const ICONES_ACAO = {
  editar: '<i class="ti ti-edit"></i>',
  excluir: '<i class="ti ti-trash"></i>',
  restaurar: '<i class="ti ti-archive-off"></i>',
};

function renderBadgeEstoque(product) {
  const quantity = product.quantity;
  const situacao = situacaoEstoque(product);

  if (situacao === 'zerado') return '<span class="badge-estoque esgotado">Esgotado</span>';
  if (situacao === 'baixo') return `<span class="badge-estoque baixo">${quantity} (baixo)</span>`;
  return `<span class="badge-estoque ok">${quantity} em estoque</span>`;
}

// "Samsung Galaxy S24" — marca é opcional, então pode ser só o modelo/nome.
function nomeProduto(product) {
  return [product.brand, product.model].filter(Boolean).join(' ').trim() || 'Sem nome';
}

// Nome para tabelas. Cor não é mais cadastrada, mas produtos antigos que têm cor
// continuam mostrando ela em letra pequena, pra não perder a informação.
function renderNomeProduto(product) {
  const cor = product.color ? `<span class="produto-nome-meta">${esc(product.color)}</span>` : '';
  return `${esc(nomeProduto(product))}${cor}`;
}

function createProductRow(product) {
  const template = DOM.productRowTemplate.content.cloneNode(true);
  const row = template.querySelector('tr');
  const arquivado = Boolean(product.arquivado_em);

  row.classList.toggle('product-row--arquivado', arquivado);
  row.querySelector('.product-type').innerHTML = `<i class="ti ${TIPO_ICONES[product.type] || 'ti-package'}"></i> ${esc(TIPO_LABELS[product.type] || product.type)}`;
  row.querySelector('.product-name').innerHTML = renderNomeProduto(product);
  row.querySelector('.product-price').textContent = formatCurrency(product.price);
  row.querySelector('.product-quantity').innerHTML = arquivado
    ? '<span class="badge-estoque arquivado">Arquivado</span>'
    : renderBadgeEstoque(product);

  const actionsCell = row.querySelector('.product-actions');
  const espaco = '<span class="action-spacer"></span>';

  if (arquivado) {
    actionsCell.innerHTML = `
      ${espaco}
      ${souDono() ? `<button class="restaurar-btn" title="Restaurar produto">${ICONES_ACAO.restaurar}</button>` : espaco}
    `;
    actionsCell.querySelector('.restaurar-btn')?.addEventListener('click', () => restaurarProduto(product.id));
    return row;
  }

  actionsCell.innerHTML = `
    ${souDono() ? `<button class="edit-btn" title="Editar produto">${ICONES_ACAO.editar}</button>` : espaco}
    ${souDono() ? `<button class="delete-btn delete" title="Excluir produto">${ICONES_ACAO.excluir}</button>` : espaco}
  `;

  actionsCell.querySelector('.edit-btn')?.addEventListener('click', () => startEditProduct(product.id));
  actionsCell.querySelector('.delete-btn')?.addEventListener('click', () => deleteProduct(product.id));

  return row;
}

function createSalesRow(product) {
  const template = DOM.salesRowTemplate.content.cloneNode(true);
  const row = template.querySelector('tr');

  row.querySelector('.sale-name').innerHTML = renderNomeProduto(product);
  row.querySelector('.sale-stock').innerHTML = renderBadgeEstoque(product);
  row.querySelector('.sale-price').textContent = formatCurrency(product.price);

  const qtyInput = row.querySelector('.sale-qty');
  qtyInput.max = product.quantity;

  row.querySelector('.sale-qty-increment').addEventListener('click', () => {
    qtyInput.value = Math.min((Number(qtyInput.value) || 0) + 1, product.quantity);
  });
  row.querySelector('.sale-qty-decrement').addEventListener('click', () => {
    qtyInput.value = Math.max((Number(qtyInput.value) || 0) - 1, 1);
  });

  row.querySelector('.sell-button').addEventListener('click', () => {
    const amount = Number(qtyInput.value) || 1;
    sellProduct(product.id, amount);
  });

  return row;
}

async function renderProductsTables() {
  DOM.productTableBody.innerHTML = '';
  DOM.salesTableBody.innerHTML = '';

  filteredProducts.forEach(product => {
    DOM.productTableBody.appendChild(createProductRow(product));
  });

  filteredSalesProducts.forEach(product => {
    DOM.salesTableBody.appendChild(createSalesRow(product));
  });

  updateFilterBrands();
  updateFilterResultCount();
  updateSalesFilterResultCount();
  updateStockCount();
  updateEstoqueEmptyState();
  renderStatusChips();
  renderFilterChips();
  renderVenderFilterChips();
}

function renderSkeletonRows(quantidade = 3) {
  DOM.estoqueTable.style.display = '';
  DOM.estoqueEmptyState.classList.remove('active');
  DOM.productTableBody.innerHTML = Array.from({ length: quantidade }).map(() => `
    <tr class="skeleton-row">
      ${Array.from({ length: 6 }).map(() => '<td><div class="skeleton-cell"></div></td>').join('')}
    </tr>
  `).join('');
}

function updateEstoqueEmptyState() {
  const semProdutos = products.length === 0;
  DOM.estoqueTable.style.display = semProdutos ? 'none' : '';
  DOM.estoqueEmptyState.classList.toggle('active', semProdutos);
}

function updateStockCount() {
  const count = products.length;
  DOM.stockCountDisplay.textContent = `${count} ${pluralize(count, 'produto')} ${pluralize(count, 'cadastrado')}`;
}

// ============================================
// FILTERING
// ============================================

function getFilterValues() {
  return {
    search: DOM.filterSearch.value.toLowerCase(),
    type: DOM.filterType.value,
    brand: DOM.filterBrand.value,
    stock: DOM.filterStock.value,
  };
}

// Busca por marca, modelo/nome, cor (produtos antigos) ou observação. Aceita
// "s24 samsung" na ordem que for: todas as palavras precisam aparecer.
function matchesSearchTerm(product, searchTerm) {
  if (!searchTerm) return true;
  const texto = [product.brand, product.model, product.color, product.notes].filter(Boolean).join(' ').toLowerCase();
  return searchTerm.trim().split(/\s+/).every(palavra => texto.includes(palavra));
}

function matchesStockFilter(product, filter) {
  const quantity = product.quantity;
  if (!filter || filter === 'arquivados') return true;
  if (filter === 'zero') return situacaoEstoque(product) === 'zerado';
  if (filter === 'low') return situacaoEstoque(product) === 'baixo';
  if (filter === 'sem_custo') return custoDoProduto(product.id) === null;
  if (filter === 'medium') return quantity >= 6 && quantity <= 20;
  if (filter === 'high') return quantity > 20;
  return true;
}

function filterProducts() {
  const { search, type, brand, stock } = getFilterValues();
  const base = stock === 'arquivados' ? produtosArquivados : products;

  return base.filter(product =>
    matchesSearchTerm(product, search) &&
    (!type || product.type === type) &&
    (!brand || product.brand === brand) &&
    matchesStockFilter(product, stock)
  );
}

// Filtro da tabela "selecionar produto pra vender" — independente do filtro de Estoque
// (tabs diferentes, cada um com sua própria busca/marca).
function filterSalesProducts() {
  const search = DOM.filterSalesSearch.value.toLowerCase();
  const brand = DOM.filterSalesBrand.value;

  return products.filter(product =>
    matchesSearchTerm(product, search) &&
    (!brand || product.brand === brand)
  );
}

function ordenarFiltrados(lista) {
  if (!sortConfig.field) return lista;

  const fator = sortConfig.direction === 'asc' ? 1 : -1;
  return [...lista].sort((a, b) => (a[sortConfig.field] - b[sortConfig.field]) * fator);
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
    if (th.dataset.sort === sortConfig.field) {
      th.classList.add(sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });

  applyFilters();
}

async function applyFilters() {
  filteredProducts = ordenarFiltrados(filterProducts());
  filteredSalesProducts = filterSalesProducts();
  await renderProductsTables();
}

function clearAllFilters() {
  DOM.filterSearch.value = '';
  DOM.filterType.value = '';
  sincronizarTypeQuickfilter();
  DOM.filterBrand.value = '';
  DOM.filterStock.value = '';
  applyFilters();
}

// ---- Tipo (filtro rápido em ícones) ------------------------------------------

function sincronizarTypeQuickfilter() {
  const tipoAtivo = DOM.filterType.value;
  DOM.typeQuickfilterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.type === tipoAtivo));
}

function selecionarFiltroTipo(tipo) {
  DOM.filterType.value = (DOM.filterType.value === tipo) ? '' : tipo;
  sincronizarTypeQuickfilter();
  applyFilters();
}

// ---- "Mais filtros" (painel de marca/cor/estoque) ------------------------------

function toggleFiltersPanel(forcarAberto = null) {
  const abrir = forcarAberto !== null ? forcarAberto : DOM.filtersPanel.classList.contains('hidden');
  DOM.filtersPanel.classList.toggle('hidden', !abrir);
  DOM.filtersToggleBtn.classList.toggle('active', abrir);
}

// ---- Chips de filtro ativo (marca/cor/estoque/tipo) ----------------------------

function renderFilterChips() {
  const chips = [];

  if (DOM.filterType.value) {
    chips.push({ label: `Tipo: ${TIPO_LABELS[DOM.filterType.value] || DOM.filterType.value}`, limpar: () => selecionarFiltroTipo(DOM.filterType.value) });
  }
  if (DOM.filterBrand.value) {
    chips.push({ label: `Marca: ${DOM.filterBrand.value}`, limpar: () => { DOM.filterBrand.value = ''; applyFilters(); } });
  }
  if (DOM.filterStock.value) {
    chips.push({ label: `Estoque: ${STOCK_FILTER_LABELS[DOM.filterStock.value] || DOM.filterStock.value}`, limpar: () => { DOM.filterStock.value = ''; applyFilters(); } });
  }

  if (!chips.length) {
    DOM.filtersChips.classList.add('hidden');
    DOM.filtersChips.innerHTML = '';
    return;
  }

  DOM.filtersChips.classList.remove('hidden');
  DOM.filtersChips.innerHTML = chips.map((chip, i) => `
    <span class="filter-chip" data-chip-index="${i}">
      ${esc(chip.label)}
      <button type="button" class="filter-chip-remove" aria-label="Remover filtro"><i class="ti ti-x"></i></button>
    </span>
  `).join('') + `<button type="button" class="filter-chip-clear-all" id="filter-chip-clear-all">Limpar tudo</button>`;

  DOM.filtersChips.querySelectorAll('.filter-chip-remove').forEach((btn, i) => {
    btn.addEventListener('click', () => chips[i].limpar());
  });
  document.getElementById('filter-chip-clear-all').addEventListener('click', clearAllFilters);

  // Se algum filtro do painel "Mais filtros" estiver ativo, deixa o painel já aberto.
  if (DOM.filterBrand.value || DOM.filterStock.value) {
    toggleFiltersPanel(true);
  }
}

// ---- Chips de atalho por status (acima da tabela) ------------------------------

function renderStatusChips() {
  const total = products.length;
  const baixo = products.filter(p => situacaoEstoque(p) === 'baixo').length;
  const zerado = products.filter(p => situacaoEstoque(p) === 'zerado').length;
  const arquivados = produtosArquivados.length;
  const semCusto = souDono() ? products.filter(p => custoDoProduto(p.id) === null).length : 0;
  const stockAtivo = DOM.filterStock.value;

  DOM.statusChips.innerHTML = `
    <button type="button" class="status-chip ${!stockAtivo ? 'active' : ''}" data-stock="">Todos <span class="status-chip-count">${total}</span></button>
    <button type="button" class="status-chip ${stockAtivo === 'low' ? 'active' : ''}" data-stock="low">Estoque baixo <span class="status-chip-count">${baixo}</span></button>
    <button type="button" class="status-chip ${stockAtivo === 'zero' ? 'active' : ''}" data-stock="zero">Sem estoque <span class="status-chip-count">${zerado}</span></button>
    ${semCusto ? `<button type="button" class="status-chip ${stockAtivo === 'sem_custo' ? 'active' : ''}" data-stock="sem_custo">Custo não informado <span class="status-chip-count">${semCusto}</span></button>` : ''}
    ${arquivados ? `<button type="button" class="status-chip ${stockAtivo === 'arquivados' ? 'active' : ''}" data-stock="arquivados">Arquivados <span class="status-chip-count">${arquivados}</span></button>` : ''}
  `;
}

function selecionarChipStatus(valor) {
  DOM.filterStock.value = valor;
  applyFilters();
}

function clearSalesFilters() {
  DOM.filterSalesSearch.value = '';
  DOM.filterSalesBrand.value = '';
  applyFilters();
}

function renderVenderFilterChips() {
  const chips = [];

  if (DOM.filterSalesSearch.value) {
    chips.push({ label: `Busca: "${DOM.filterSalesSearch.value}"`, limpar: () => { DOM.filterSalesSearch.value = ''; applyFilters(); } });
  }
  if (DOM.filterSalesBrand.value) {
    chips.push({ label: `Marca: ${DOM.filterSalesBrand.value}`, limpar: () => { DOM.filterSalesBrand.value = ''; applyFilters(); } });
  }

  if (!chips.length) {
    DOM.filtersSalesChips.classList.add('hidden');
    DOM.filtersSalesChips.innerHTML = '';
    return;
  }

  DOM.filtersSalesChips.classList.remove('hidden');
  DOM.filtersSalesChips.innerHTML = chips.map((chip, i) => `
    <span class="filter-chip" data-chip-index="${i}">
      ${esc(chip.label)}
      <button type="button" class="filter-chip-remove" aria-label="Remover filtro"><i class="ti ti-x"></i></button>
    </span>
  `).join('') + `<button type="button" class="filter-chip-clear-all" id="filter-chip-clear-all-vendas">Limpar tudo</button>`;

  DOM.filtersSalesChips.querySelectorAll('.filter-chip-remove').forEach((btn, i) => {
    btn.addEventListener('click', () => chips[i].limpar());
  });
  document.getElementById('filter-chip-clear-all-vendas').addEventListener('click', clearSalesFilters);
}

function updateFilterBrands() {
  const brands = getUniqueBrands();
  
  [DOM.filterBrand, DOM.filterSalesBrand].forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '<option value="">Todas</option>';
    brands.forEach(brand => {
      const opt = document.createElement('option');
      opt.value = brand;
      opt.textContent = brand;
      select.appendChild(opt);
    });
    select.value = currentValue;
  });
}

function updateFilterResultCount() {
  const count = filteredProducts.length;
  const total = products.length;
  const hasFilter = count < total && total > 0;
  const isEmpty = count === 0 && total > 0;

  let text = '';
  if (hasFilter) text = `${count} de ${total} produtos`;
  if (isEmpty) text = 'Nenhum produto encontrado';

  DOM.filterResultCount.textContent = text;
  DOM.filterResultCount.classList.toggle('active', text !== '');
}

function updateSalesFilterResultCount() {
  const count = filteredSalesProducts.length;
  const total = products.length;
  const hasFilter = count < total && total > 0;
  const isEmpty = count === 0 && total > 0;

  let text = '';
  if (hasFilter) text = `${count} de ${total} produtos`;
  if (isEmpty) text = 'Nenhum produto encontrado';

  DOM.salesFilterResultCount.textContent = text;
  DOM.salesFilterResultCount.classList.toggle('active', text !== '');
}

// ============================================
// EXPORTAÇÃO CSV
// ============================================

function gerarCSVEstoque(lista) {
  const cabecalho = ['Tipo', 'Marca', 'Modelo', 'Cor', 'Fabricação', 'Preço', 'Quantidade', 'Observações'];
  const escaparCampo = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;

  const linhas = lista.map(p => [
    p.type, p.brand, p.model, p.color, p.manufacture, p.price, p.quantity, p.notes,
  ].map(escaparCampo).join(','));

  return [cabecalho.map(escaparCampo).join(','), ...linhas].join('\r\n');
}

function exportarEstoqueCSV() {
  if (!products.length) {
    showToast('⚠️ Não há produtos para exportar.', 'warning');
    return;
  }

  const csv = gerarCSVEstoque(products);
  const BOM_UTF8 = '﻿';
  const blob = new Blob([BOM_UTF8 + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `vault-estoque-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('✅ CSV exportado com sucesso!', 'success');
}

// ============================================
// PRODUCT OPERATIONS
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
    showToast(arquivar ? '❌ Erro ao arquivar o produto.' : '❌ Erro ao restaurar o produto.', 'error');
    return false;
  }

  await loadProducts();
  applyFilters();
  updateDashboard();
  return true;
}

async function restaurarProduto(id) {
  const product = produtosArquivados.find(p => p.id === id);
  if (!product) return;

  if (await definirArquivado(id, false)) {
    showToast(`✅ ${product.brand} ${product.model} voltou para o estoque.`, 'success');
  }
}

async function deleteProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  // O livro-caixa aponta para o produto, então quem já teve venda/movimentação não
  // pode ser apagado sem perder histórico. Nesse caso o produto é arquivado.
  if (await produtoTemHistorico(id)) {
    abrirModalConfirmacao({
      titulo: 'Arquivar produto',
      mensagem: `${product.brand} ${product.model} já tem vendas registradas, então não pode ser excluído sem apagar esse histórico. Ele será arquivado: sai do estoque e das vendas, mas o histórico continua nos relatórios. Dá pra restaurar depois em Estoque → Arquivados.`,
      textoConfirmar: 'Arquivar',
      aoConfirmar: async () => {
        if (await definirArquivado(id, true)) {
          showToast('✅ Produto arquivado.', 'success');
        }
      },
    });
    return;
  }

  abrirModalConfirmacao({
    titulo: 'Excluir produto',
    mensagem: `Tem certeza que deseja excluir ${product.brand} ${product.model}? Essa ação não pode ser desfeita.`,
    textoConfirmar: 'Excluir',
    aoConfirmar: async () => {
      const ok = await deleteProductRow(id);
      if (!ok) return;
      await loadProducts();
      applyFilters();
      updateDashboard();
      showToast(`✅ Produto removido.`, 'success');
    },
  });
}

async function sellProduct(id, amount) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  if (amount < 1) {
    showToast('⚠️ Quantidade inválida.', 'warning');
    return;
  }

  if (amount > product.quantity) {
    showToast('❌ Quantidade maior que estoque.', 'error');
    return;
  }

  await confirmarVenda(product, amount);
}

let vendaEmAndamento = false;

async function confirmarVenda(product, amount) {
  // Trava contra clique duplo: só uma venda por vez sai desta tela.
  if (vendaEmAndamento) return;
  vendaEmAndamento = true;

  try {
    // registrar_venda_v2 (sql/011 e 012) baixa o estoque e lança no livro-caixa numa
    // única transação, com a linha do produto travada.
    const { data: movimentacao, error } = await supabaseClient.rpc('registrar_venda_v2', {
      p_produto_id: product.id,
      p_quantidade: amount,
    });

    if (error) {
      showToast(`❌ ${error.message || 'Erro ao registrar a venda.'}`, 'error');
      return;
    }

    await loadProducts();
    applyFilters();
    updateDashboard();
    await atualizarAbaVendas();
    abrirModalRecibo(movimentacao, product);
  } finally {
    vendaEmAndamento = false;
  }
}

// ============================================
// DASHBOARD
// ============================================

function corVar(nomeVariavel, fallback) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nomeVariavel).trim();
  return valor || fallback;
}

function renderDashboardSkeleton() {
  [DOM.dashTotal, DOM.dashValorCompra, DOM.dashValorVenda, DOM.dashVendasHoje, DOM.dashTicketMedio].forEach(el => {
    el.classList.add('loading');
  });
}

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

function animarContagem(elemento, valorFinal, formatar = (v) => Math.round(v).toString()) {
  elemento.classList.remove('loading');
  animar(elemento, (p) => { elemento.textContent = formatar(valorFinal * p); });
}

// ============================================
// DISCO DO COFRE (Vault Dial)
// ============================================
// Gauge circular em SVG puro (sem dependência nova): três arcos proporcionais a
// saudável/baixo/zerado. É o elemento de assinatura do dashboard, não decorativo —
// muda de verdade conforme o estoque muda.

function renderVaultDial(container, { saudavel, baixo, zerado }) {
  const total = saudavel + baixo + zerado;
  const pct = (n) => (total ? (n / total) * 100 : 0);
  const pctSaudavel = pct(saudavel);
  const pctBaixo = pct(baixo);
  const pctZerado = pct(zerado);

  const size = 176;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Cada arco nasce com comprimento 0 e cresce até o tamanho real (ver animação abaixo);
  // o início de cada um também acompanha o crescimento dos anteriores, então o anel
  // "se fecha" de forma contínua em vez de três arcos pulando de uma vez.
  const arc = (percent, offsetPercent, color) => {
    if (percent <= 0) return '';
    return `<circle class="vault-dial-arc" data-pct="${percent}" data-offset="${offsetPercent}" cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="0 ${circumference}" stroke-linecap="round" transform="rotate(-90 ${center} ${center})"></circle>`;
  };

  let cursor = 0;
  const corSaudavel = corVar('--color-secondary', '#22D3C5');
  const corBaixo = corVar('--color-warning', '#F5A623');
  const corZerado = corVar('--color-danger', '#FF5C7A');

  const arcoSaudavel = arc(pctSaudavel, cursor, corSaudavel);
  cursor += pctSaudavel;
  const arcoBaixo = arc(pctBaixo, cursor, corBaixo);
  cursor += pctBaixo;
  const arcoZerado = arc(pctZerado, cursor, corZerado);

  // Texto central: mostra o status que domina a distribuição agora (não sempre
  // "saudável"). Em empate, prioriza o pior dos empatados — mais importante chamar
  // atenção pra um problema real do que esconder atrás de um "saudável" que empatou.
  const statusPorPrioridade = [
    { pct: pctZerado, label: 'sem estoque', cor: corZerado },
    { pct: pctBaixo, label: 'baixo', cor: corBaixo },
    { pct: pctSaudavel, label: 'saudável', cor: corSaudavel },
  ];
  const maiorPct = Math.max(pctZerado, pctBaixo, pctSaudavel);
  const dominante = statusPorPrioridade.find(s => s.pct === maiorPct);

  container.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${Math.round(dominante.pct)}% do estoque está ${dominante.label}">
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="var(--border-color)" stroke-width="${strokeWidth}"></circle>
      ${arcoSaudavel}${arcoBaixo}${arcoZerado}
      <text x="${center}" y="${center - 2}" text-anchor="middle" class="vault-dial-value" fill="${dominante.cor}">0%</text>
      <text x="${center}" y="${center + 20}" text-anchor="middle" class="vault-dial-caption" fill="${dominante.cor}">${dominante.label}</text>
    </svg>
  `;

  const arcos = [...container.querySelectorAll('.vault-dial-arc')];
  const textoValor = container.querySelector('.vault-dial-value');
  const pctFinal = Math.round(dominante.pct);

  animar(container, (p) => {
    arcos.forEach(el => {
      const length = (Number(el.dataset.pct) / 100) * circumference * p;
      const rotation = (Number(el.dataset.offset) * p / 100) * 360 - 90;
      el.setAttribute('stroke-dasharray', `${length} ${circumference - length}`);
      el.setAttribute('transform', `rotate(${rotation} ${center} ${center})`);
      // A ponta arredondada desenharia um "pontinho" com comprimento zero.
      el.style.opacity = length > 0.5 ? 1 : 0;
    });
    textoValor.textContent = `${Math.round(pctFinal * p)}%`;
  });
}

function renderVaultDialLegend(container, { saudavel, baixo, zerado }) {
  const total = saudavel + baixo + zerado;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const itens = [
    { cor: corVar('--color-secondary', '#22D3C5'), label: 'Estoque saudável', valor: pct(saudavel) },
    { cor: corVar('--color-warning', '#F5A623'), label: 'Estoque baixo', valor: pct(baixo) },
    { cor: corVar('--color-danger', '#FF5C7A'), label: 'Sem estoque', valor: pct(zerado) },
  ];

  container.innerHTML = itens.map(i => `
    <div class="vault-dial-legend-item"><span class="vault-dial-dot" style="background:${i.cor}"></span>${i.label} <strong>0%</strong></div>
  `).join('');

  const numeros = [...container.querySelectorAll('strong')];
  animar(container, (p) => {
    numeros.forEach((el, idx) => { el.textContent = `${Math.round(itens[idx].valor * p)}%`; });
  });
}

// ============================================
// VENDAS (livro-caixa — movimentacoes_estoque)
// ============================================

function inicioDoDiaISO(diasAtras = 0) {
  const data = new Date();
  data.setHours(0, 0, 0, 0);
  data.setDate(data.getDate() - diasAtras);
  return data.toISOString();
}

async function buscarVendasHojeEOntem() {
  const vazio = { hoje: { quantidade: 0, valor: 0 }, ontem: { valor: 0 } };

  const { data, error } = await supabaseClient
    .from('movimentacoes_estoque')
    .select('quantidade, total, created_at')
    .eq('loja_id', lojaAtual.id)
    .eq('tipo', 'venda')
    .gte('created_at', inicioDoDiaISO(1));

  if (error) return vazio;

  const hojeChave = new Date().toDateString();
  const ontemChave = new Date(Date.now() - 86400000).toDateString();

  return data.reduce((acc, m) => {
    const chave = new Date(m.created_at).toDateString();
    const valor = Number(m.total) || 0;
    if (chave === hojeChave) {
      acc.hoje.quantidade += Math.abs(m.quantidade);
      acc.hoje.valor += valor;
    } else if (chave === ontemChave) {
      acc.ontem.valor += valor;
    }
    return acc;
  }, vazio);
}

function renderVendasHojeTrend(hoje, ontem) {
  const el = DOM.dashVendasHojeTrend;

  if (!ontem || ontem <= 0) {
    el.classList.add('hidden');
    return;
  }

  const variacao = ((hoje - ontem) / ontem) * 100;
  const alta = variacao >= 0;

  el.classList.remove('hidden');
  el.classList.toggle('dashboard-trend--alta', alta);
  el.classList.toggle('dashboard-trend--queda', !alta);
  el.innerHTML = `
    <span class="dashboard-trend-arrow">${alta ? '▲' : '▼'}</span>
    <span class="dashboard-trend-pct">${Math.abs(Math.round(variacao))}%</span>
    <span class="dashboard-trend-label">vs. ontem</span>
  `;
}

async function buscarTicketMedio() {
  const { data, error } = await supabaseClient
    .from('movimentacoes_estoque')
    .select('total')
    .eq('loja_id', lojaAtual.id)
    .eq('tipo', 'venda')
    .gte('created_at', inicioDoDiaISO(30));

  if (error || !data.length) return 0;

  const soma = data.reduce((acc, m) => acc + (Number(m.total) || 0), 0);
  return soma / data.length;
}

async function buscarVendas7Dias() {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    dias.push({
      chave: data.toDateString(),
      label: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
      labelCompleto: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total: 0,
    });
  }

  const { data, error } = await supabaseClient
    .from('movimentacoes_estoque')
    .select('total, created_at')
    .eq('loja_id', lojaAtual.id)
    .eq('tipo', 'venda')
    .gte('created_at', inicioDoDiaISO(6));

  if (!error) {
    data.forEach(m => {
      const chave = new Date(m.created_at).toDateString();
      const dia = dias.find(d => d.chave === chave);
      if (dia) dia.total += Number(m.total) || 0;
    });
  }

  return dias;
}

function renderTop5MarcasValorList() {
  if (!products.length) {
    DOM.dashboardBrandlist.innerHTML = '';
    DOM.dashboardBrandlistEmpty.classList.remove('hidden');
    return;
  }

  DOM.dashboardBrandlistEmpty.classList.add('hidden');

  const valorPorMarca = {};
  products.forEach(p => {
    valorPorMarca[p.brand] = (valorPorMarca[p.brand] || 0) + p.price * p.quantity;
  });

  const top5 = Object.entries(valorPorMarca).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maiorValor = top5.length ? top5[0][1] : 0;

  DOM.dashboardBrandlist.innerHTML = top5.map(([marca, valor]) => {
    const largura = maiorValor ? Math.max((valor / maiorValor) * 100, 4) : 0;
    return `
      <div class="dashboard-brandlist-row">
        <div class="dashboard-brandlist-info">
          <span class="dashboard-brandlist-name">${esc(marca)}</span>
          <span class="dashboard-brandlist-value">${formatCurrency(valor)}</span>
        </div>
        <div class="dashboard-brandlist-bar-track">
          <div class="dashboard-brandlist-bar" style="width:${largura}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Alinha os rótulos (dia da semana / valor em destaque) sem deixar a metade do texto
// vazar pra fora do card nas duas pontas — centralizado no meio, ancorado nas bordas.
function alinhamentoBordaSegura(indice, total) {
  if (indice === 0) return { left: '0%', transform: 'translateX(0)' };
  if (indice === total - 1) return { left: '100%', transform: 'translateX(-100%)' };
  return { left: `${(indice / (total - 1)) * 100}%`, transform: 'translateX(-50%)' };
}

function renderVendas7DiasChart(dias) {
  const valores = dias.map(d => Number(d.total) || 0);
  const maiorValor = Math.max(...valores, 0);
  const semVendas = maiorValor === 0;

  const indicesPico = semVendas
    ? []
    : valores.reduce((acc, v, i) => (v === maiorValor ? [...acc, i] : acc), []);

  // Espaço de coordenadas do SVG é fixo (o CSS `aspect-ratio` que escala o desenho pro
  // tamanho real do card) — evita ter que reler clientWidth ou reagir a resize.
  const VBW = 700;
  const VBH = 128;
  const padX = 26;
  const padTopoSvg = 12;
  const padBaseSvg = 10;
  const baselineY = VBH - padBaseSvg;
  const alturaPlot = baselineY - padTopoSvg;

  const pontos = dias.map((d, i) => {
    const valor = valores[i];
    const xFrac = dias.length > 1 ? i / (dias.length - 1) : 0.5;
    const x = padX + xFrac * (VBW - padX * 2);
    const valorFrac = semVendas ? 0 : valor / maiorValor;
    const y = baselineY - valorFrac * alturaPlot;
    return { x, y, valor, dia: d };
  });

  const ptAt = (i) => pontos[Math.max(0, Math.min(pontos.length - 1, i))];

  // Catmull-Rom -> Bézier cúbica (curva suave passando por todos os pontos). O `y` dos
  // pontos de controle é limitado à baseline pra curva nunca "afundar" abaixo do zero
  // entre dois dias vizinhos — o que pareceria venda negativa.
  let curvaPath = `M ${pontos[0].x},${pontos[0].y}`;
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = ptAt(i - 1), p1 = pontos[i], p2 = pontos[i + 1], p3 = ptAt(i + 2);
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = Math.min(p1.y + (p2.y - p0.y) / 6, baselineY);
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = Math.min(p2.y - (p3.y - p1.y) / 6, baselineY);
    curvaPath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  const ultimo = pontos[pontos.length - 1];
  const areaPath = `${curvaPath} L ${ultimo.x},${baselineY} L ${pontos[0].x},${baselineY} Z`;

  const circulosSvg = pontos.map((p, i) => {
    const ehPico = indicesPico.includes(i);
    return `<circle class="vendas7d-dot${ehPico ? ' vendas7d-dot--peak' : ''}" cx="${p.x}" cy="${p.y}" r="${ehPico ? 6 : 3.5}"><title>${p.dia.labelCompleto}: ${formatCurrency(p.valor)}</title></circle>`;
  }).join('');

  const picosHtml = indicesPico.map(i => {
    const { left, transform } = alinhamentoBordaSegura(i, pontos.length);
    return `<span class="vendas7d-peak-value" style="left:${left};transform:${transform}">${formatCurrency(pontos[i].valor)}</span>`;
  }).join('');

  const eixoHtml = pontos.map((p, i) => {
    const ehPico = indicesPico.includes(i);
    const { left, transform } = alinhamentoBordaSegura(i, pontos.length);
    return `<span class="vendas7d-axis-label${ehPico ? ' vendas7d-axis-label--peak' : ''}" style="left:${left};transform:${transform}">${p.dia.label}</span>`;
  }).join('');

  DOM.vendas7dChartContainer.innerHTML = `
    <div class="vendas7d-topline">${picosHtml}</div>
    <div class="vendas7d-plot">
      <svg class="vendas7d-svg" viewBox="0 0 ${VBW} ${VBH}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vendas7dLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="var(--color-primary)"></stop>
            <stop offset="100%" stop-color="var(--color-secondary)"></stop>
          </linearGradient>
          <linearGradient id="vendas7dAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--color-secondary)" stop-opacity="0.32"></stop>
            <stop offset="100%" stop-color="var(--color-secondary)" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <line class="vendas7d-baseline" x1="${padX - 6}" y1="${baselineY}" x2="${VBW - padX + 6}" y2="${baselineY}"></line>
        ${!semVendas ? `<path class="vendas7d-area" d="${areaPath}" fill="url(#vendas7dAreaGrad)"></path>` : ''}
        <path class="vendas7d-line" d="${curvaPath}" stroke="${semVendas ? 'var(--border-color)' : 'url(#vendas7dLineGrad)'}"></path>
        ${circulosSvg}
      </svg>
    </div>
    <div class="vendas7d-axis">${eixoHtml}</div>
    ${semVendas ? '<p class="vendas7d-empty-msg">Nenhuma venda nos últimos 7 dias</p>' : ''}
  `;
}

const LOWSTOCK_LIMITE_EXIBICAO = 5;

function renderLowStockList() {
  const lowStockProducts = products
    .filter(p => situacaoEstoque(p) === 'baixo')
    .sort((a, b) => a.quantity - b.quantity);

  DOM.lowStockList.innerHTML = '';

  if (!lowStockProducts.length) {
    DOM.lowStockCount.classList.add('hidden');
    DOM.lowStockVerTodos.classList.add('hidden');
    DOM.lowStockEmpty.classList.remove('hidden');
    DOM.lowStockEmpty.textContent = products.length === 0
      ? 'Cadastre seu primeiro produto para ver alertas de estoque aqui.'
      : 'Nenhum produto com estoque baixo agora. 🎉';
    return;
  }

  DOM.lowStockEmpty.classList.add('hidden');
  DOM.lowStockCount.textContent = `${lowStockProducts.length} ${pluralize(lowStockProducts.length, 'item', 'itens')}`;
  DOM.lowStockCount.classList.remove('hidden');
  DOM.lowStockVerTodos.classList.toggle('hidden', lowStockProducts.length <= LOWSTOCK_LIMITE_EXIBICAO);

  lowStockProducts.slice(0, LOWSTOCK_LIMITE_EXIBICAO).forEach(p => {
    const li = document.createElement('li');
    li.className = 'dashboard-lowstock-item';
    li.innerHTML = `
      <span class="dashboard-lowstock-name">${esc(nomeProduto(p))}</span>
      <span class="badge-estoque baixo">${p.quantity} un.</span>
    `;
    li.addEventListener('click', () => startEditProduct(p.id));
    DOM.lowStockList.appendChild(li);
  });
}

function irParaEstoqueBaixo() {
  DOM.filterStock.value = 'low';
  applyFilters();
  changeTab('estoque');
}

// ============================================
// RECIBO DE VENDA
// ============================================

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function montarTextoRecibo(mov, produto) {
  return [
    '🧾 Recibo de venda — Vault',
    '',
    `Produto: ${nomeProduto(produto)}`,
    `Quantidade: ${Math.abs(mov.quantidade)}`,
    `Preço unitário: ${formatCurrency(mov.preco_unitario)}`,
    `Total: ${formatCurrency(mov.total)}`,
    `Data: ${formatarDataHora(mov.created_at)}`,
    '',
    'Comprovante simples, não é nota fiscal.',
  ].join('\n');
}

function abrirModalRecibo(mov, produto) {
  const texto = montarTextoRecibo(mov, produto);

  DOM.modalBody.innerHTML = `
    <h3 class="modal-title">✅ Venda registrada</h3>
    <div class="recibo-card">
      <div class="recibo-linha"><span>Produto</span><strong>${esc(nomeProduto(produto))}</strong></div>
      <div class="recibo-linha"><span>Quantidade</span><strong>${Math.abs(mov.quantidade)}</strong></div>
      <div class="recibo-linha"><span>Preço unitário</span><strong>${formatCurrency(mov.preco_unitario)}</strong></div>
      <div class="recibo-linha recibo-total"><span>Total</span><strong>${formatCurrency(mov.total)}</strong></div>
      <div class="recibo-linha recibo-data"><span>${formatarDataHora(mov.created_at)}</span></div>
    </div>
    <div class="modal-actions">
      <button type="button" class="secondary" id="modal-recibo-fechar">Fechar</button>
      <button type="button" class="primary" id="modal-recibo-copiar">📋 Copiar recibo</button>
    </div>
  `;

  DOM.modalBody.querySelector('#modal-recibo-fechar').addEventListener('click', fecharModal);
  DOM.modalBody.querySelector('#modal-recibo-copiar').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(texto);
      showToast('✅ Recibo copiado!', 'success');
    } catch {
      showToast('❌ Não foi possível copiar. Copie manualmente.', 'error');
    }
  });

  abrirModal();
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
    .limit(300);

  const desde = inicioPeriodoISO(DOM.filterHistoricoPeriodo.value);
  if (desde) query = query.gte('created_at', desde);

  const { data, error } = await query;
  if (error) {
    showToast('❌ Erro ao carregar histórico de vendas.', 'error');
    historicoVendas = [];
    return;
  }

  historicoVendas = data;
}

function updateHistoricoBrandFilter() {
  const marcas = [...new Set(historicoVendas.map(m => m.produto_snapshot?.brand).filter(Boolean))].sort();
  const select = DOM.filterHistoricoBrand;
  const atual = select.value;

  select.innerHTML = '<option value="">Todas</option>';
  marcas.forEach(marca => {
    const opt = document.createElement('option');
    opt.value = marca;
    opt.textContent = marca;
    select.appendChild(opt);
  });
  select.value = atual;
}

const PERIODO_LABELS = {
  '7': 'Últimos 7 dias',
  '30': 'Últimos 30 dias',
  '90': 'Últimos 90 dias',
  '0': 'Tudo',
};

function filtrarHistoricoAtual() {
  const marca = DOM.filterHistoricoBrand.value;
  const busca = DOM.filterHistoricoSearch.value.toLowerCase();

  return historicoVendas.filter(m => {
    const snap = m.produto_snapshot || {};
    const combinaMarca = !marca || snap.brand === marca;
    const combinaBusca = !busca ||
      (snap.brand || '').toLowerCase().includes(busca) ||
      (snap.model || '').toLowerCase().includes(busca) ||
      (snap.color || '').toLowerCase().includes(busca);
    return combinaMarca && combinaBusca;
  });
}

function limparFiltrosHistorico() {
  DOM.filterHistoricoSearch.value = '';
  DOM.filterHistoricoPeriodo.value = '30';
  DOM.filterHistoricoBrand.value = '';
  atualizarAbaVendas();
}

function renderHistoricoFilterChips() {
  const chips = [];

  if (DOM.filterHistoricoSearch.value) {
    chips.push({ label: `Busca: "${DOM.filterHistoricoSearch.value}"`, limpar: () => { DOM.filterHistoricoSearch.value = ''; renderHistoricoVendas(); } });
  }
  if (DOM.filterHistoricoBrand.value) {
    chips.push({ label: `Marca: ${DOM.filterHistoricoBrand.value}`, limpar: () => { DOM.filterHistoricoBrand.value = ''; renderHistoricoVendas(); } });
  }
  if (DOM.filterHistoricoPeriodo.value !== '30') {
    chips.push({
      label: `Período: ${PERIODO_LABELS[DOM.filterHistoricoPeriodo.value] || DOM.filterHistoricoPeriodo.value}`,
      limpar: async () => {
        DOM.filterHistoricoPeriodo.value = '30';
        await carregarHistoricoVendas();
        updateHistoricoBrandFilter();
        renderHistoricoVendas();
      },
    });
  }

  if (!chips.length) {
    DOM.filtersHistoricoChips.classList.add('hidden');
    DOM.filtersHistoricoChips.innerHTML = '';
    return;
  }

  DOM.filtersHistoricoChips.classList.remove('hidden');
  DOM.filtersHistoricoChips.innerHTML = chips.map((chip, i) => `
    <span class="filter-chip" data-chip-index="${i}">
      ${esc(chip.label)}
      <button type="button" class="filter-chip-remove" aria-label="Remover filtro"><i class="ti ti-x"></i></button>
    </span>
  `).join('') + `<button type="button" class="filter-chip-clear-all" id="filter-chip-clear-all-historico">Limpar tudo</button>`;

  DOM.filtersHistoricoChips.querySelectorAll('.filter-chip-remove').forEach((btn, i) => {
    btn.addEventListener('click', () => chips[i].limpar());
  });
  document.getElementById('filter-chip-clear-all-historico').addEventListener('click', limparFiltrosHistorico);
}

function obterIniciaisPessoa(texto) {
  if (!texto) return '?';
  const partes = texto.replace(/[._-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

// Não existe campo de nome cadastrado pra membros da loja hoje (só e-mail) — usa a
// parte antes do @ como nome de exibição, conforme combinado. Reaproveitado tanto no
// histórico de vendas ("Vendido por") quanto na lista de membros da Equipe.
function renderPessoaChip(email) {
  if (!email) return '<span class="vendedor-vazio">-</span>';

  const usuario = email.split('@')[0];
  const nomeExibicao = usuario.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const iniciais = obterIniciaisPessoa(usuario);

  return `
    <span class="vendedor-chip">
      <span class="vendedor-avatar">${esc(iniciais)}</span>
      ${esc(nomeExibicao)}
    </span>
  `;
}

function renderHistoricoVendas() {
  const filtrado = filtrarHistoricoAtual();

  DOM.historicoVendasBody.innerHTML = '';
  DOM.historicoCount.textContent = `${filtrado.length} ${pluralize(filtrado.length, 'venda')} no período`;
  DOM.historicoVendasTable.style.display = filtrado.length === 0 ? 'none' : '';
  DOM.historicoVendasEmpty.classList.toggle('active', filtrado.length === 0);

  filtrado.forEach(m => {
    const snap = m.produto_snapshot || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="historico-data">${formatarDataHora(m.created_at)}</td>
      <td>${renderNomeProduto(snap)}</td>
      <td>${Math.abs(m.quantidade)}</td>
      <td>${formatCurrency(m.preco_unitario)}</td>
      <td class="historico-total">${formatCurrency(m.total)}</td>
      <td>${renderPessoaChip(m.responsavel_email)}</td>
    `;
    DOM.historicoVendasBody.appendChild(tr);
  });

  const totalPeriodo = filtrado.reduce((soma, m) => soma + (Number(m.total) || 0), 0);
  DOM.historicoTotalRow.classList.toggle('hidden', filtrado.length === 0);
  DOM.historicoTotalValor.textContent = formatCurrency(totalPeriodo);

  renderHistoricoFilterChips();
}

function gerarCSVHistoricoVendas(lista) {
  const cabecalho = ['Data', 'Marca', 'Modelo', 'Cor', 'Quantidade', 'Preço unitário', 'Total', 'Vendido por'];
  const escaparCampo = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;

  const linhas = lista.map(m => {
    const snap = m.produto_snapshot || {};
    return [
      formatarDataHora(m.created_at),
      snap.brand,
      snap.model,
      snap.color,
      Math.abs(m.quantidade),
      m.preco_unitario,
      m.total,
      m.responsavel_email,
    ].map(escaparCampo).join(',');
  });

  return [cabecalho.map(escaparCampo).join(','), ...linhas].join('\r\n');
}

function exportarHistoricoCSV() {
  const filtrado = filtrarHistoricoAtual();

  if (!filtrado.length) {
    showToast('⚠️ Não há vendas para exportar nesse período.', 'warning');
    return;
  }

  const csv = gerarCSVHistoricoVendas(filtrado);
  const BOM_UTF8 = '﻿';
  const blob = new Blob([BOM_UTF8 + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `vault-vendas-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('✅ CSV exportado com sucesso!', 'success');
}

async function carregarResumoVendas() {
  const { data, error } = await supabaseClient
    .from('movimentacoes_estoque')
    .select('total, created_at')
    .eq('loja_id', lojaAtual.id)
    .eq('tipo', 'venda')
    .gte('created_at', inicioDoDiaISO(31));

  if (error) {
    [DOM.resumoVendasHoje, DOM.resumoVendas7dias, DOM.resumoVendasMes].forEach(el => {
      el.textContent = formatCurrency(0);
    });
    return;
  }

  const hojeChave = new Date().toDateString();
  const seteDiasAtras = new Date(inicioDoDiaISO(6));
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  let hoje = 0;
  let seteDias = 0;
  let mes = 0;

  data.forEach(m => {
    const dataVenda = new Date(m.created_at);
    const valor = Number(m.total) || 0;
    if (dataVenda.toDateString() === hojeChave) hoje += valor;
    if (dataVenda >= seteDiasAtras) seteDias += valor;
    if (dataVenda >= inicioMes) mes += valor;
  });

  DOM.resumoVendasHoje.textContent = formatCurrency(hoje);
  DOM.resumoVendas7dias.textContent = formatCurrency(seteDias);
  DOM.resumoVendasMes.textContent = formatCurrency(mes);
}

async function atualizarAbaVendas() {
  await carregarHistoricoVendas();
  updateHistoricoBrandFilter();
  renderHistoricoVendas();
  await carregarResumoVendas();
}

function obterHistoricoMetrica() {
  // Nenhum histórico de séries temporais é persistido ainda (exigiria uma tabela de
  // snapshots diários). Retorna null propositalmente para manter os sparklines ocultos
  // graciosamente até essa base de dados existir.
  return null;
}

function renderSparklinesKPI() {
  document.querySelectorAll('.kpi-sparkline').forEach(canvas => {
    const historico = obterHistoricoMetrica(canvas.dataset.metric);
    if (!historico || historico.length < 2) {
      canvas.classList.add('hidden');
      return;
    }

    canvas.classList.remove('hidden');
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: historico.map(() => ''),
        datasets: [{ data: historico, borderColor: corVar('--color-primary', '#6366f1'), pointRadius: 0, tension: 0.4 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });
  });
}

// Valor total de compra (custo × quantidade) e de venda (preço × quantidade) do estoque
// atual. Custo desconhecido não vira zero: o total de compra fica marcado como
// incompleto e o aviso leva para a lista de produtos sem custo.
function renderValoresEstoque() {
  const { compra, venda, pendentes, comCusto } = calcularValoresEstoque(products);

  animarContagem(DOM.dashValorVenda, venda, formatCurrency);

  if (comCusto === 0 && pendentes > 0) {
    DOM.dashValorCompra.classList.remove('loading');
    cancelAnimationFrame(animacoesAtivas.get(DOM.dashValorCompra));
    DOM.dashValorCompra.textContent = 'Custo pendente';
    DOM.dashValorCompra.classList.add('dashboard-hero-amount--pendente');
  } else {
    DOM.dashValorCompra.classList.remove('dashboard-hero-amount--pendente');
    animarContagem(DOM.dashValorCompra, compra, formatCurrency);
  }

  DOM.dashCustoPendente.classList.toggle('hidden', pendentes === 0);
  if (pendentes > 0) {
    DOM.dashCustoPendenteTexto.textContent = comCusto === 0
      ? `Nenhum produto em estoque tem preço de custo ainda (${pendentes} ${pluralize(pendentes, 'produto')}).`
      : `${pendentes} ${pluralize(pendentes, 'produto')} sem preço de custo: o total de compra está incompleto.`;
  }
}

async function updateDashboard() {
  const [vendasHojeEOntem, ticketMedio, vendas7dias] = await Promise.all([
    buscarVendasHojeEOntem(),
    buscarTicketMedio(),
    buscarVendas7Dias(),
  ]);

  animarContagem(DOM.dashVendasHoje, vendasHojeEOntem.hoje.quantidade);
  DOM.dashVendasHojeValor.textContent = formatCurrency(vendasHojeEOntem.hoje.valor);
  renderVendasHojeTrend(vendasHojeEOntem.hoje.valor, vendasHojeEOntem.ontem.valor);
  animarContagem(DOM.dashTicketMedio, ticketMedio, formatCurrency);
  renderVendas7DiasChart(vendas7dias);
  renderSparklinesKPI();

  const total = products.length;
  const lowStock = products.filter(p => situacaoEstoque(p) === 'baixo').length;
  const zeroStock = products.filter(p => situacaoEstoque(p) === 'zerado').length;
  const saudavel = Math.max(total - lowStock - zeroStock, 0);

  animarContagem(DOM.dashTotal, total);
  renderValoresEstoque();
  renderVaultDial(DOM.vaultDialContainer, { saudavel, baixo: lowStock, zerado: zeroStock });
  renderVaultDialLegend(DOM.vaultDialLegend, { saudavel, baixo: lowStock, zerado: zeroStock });
  renderTop5MarcasValorList();
  renderLowStockList();
}

// ============================================
// UI & NAVIGATION
// ============================================

const TITULOS_PAGINA = {
  dashboard: { titulo: 'Dashboard', subtitulo: 'Visão geral da loja' },
  cadastro: { titulo: 'Cadastro de produtos', subtitulo: 'Cadastre vários modelos de uma vez' },
  estoque: { titulo: 'Estoque', subtitulo: 'Controle e consulta de estoque' },
  vendas: { titulo: 'Vendas', subtitulo: 'Registre vendas e acompanhe o histórico' },
  equipe: { titulo: 'Equipe', subtitulo: 'Gerencie quem tem acesso à loja' },
};

function atualizarTituloPagina(tabId) {
  const info = TITULOS_PAGINA[tabId];
  if (!info) return;
  DOM.headerPageTitle.textContent = info.titulo;
  DOM.headerPageSubtitle.textContent = info.subtitulo;
}

function changeTab(tabId) {
  DOM.navItems.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
  DOM.panels.forEach(panel => panel.classList.toggle('active', panel.id === tabId));
  moverIndicadorAtivo(tabId);
  atualizarTituloPagina(tabId);

  if (tabId === 'equipe') renderEquipe();
  if (tabId === 'vendas') atualizarAbaVendas();

  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (window.innerWidth <= 760) {
    DOM.sidebar.classList.remove('active');
  }
}

function moverIndicadorAtivo(tabId) {
  const btnAtivo = Array.from(DOM.navItems).find(btn => btn.dataset.tab === tabId);
  if (!btnAtivo || !DOM.navIndicator) return;

  // btnAtivo.offsetTop já é relativo ao .sidebar-nav (offsetParent), que corresponde
  // à posição estática "top: 16px" do indicador — por isso o deslocamento é a diferença.
  DOM.navIndicator.style.height = `${btnAtivo.offsetHeight}px`;
  DOM.navIndicator.style.transform = `translateY(${btnAtivo.offsetTop - 16}px)`;
}

function toggleSidebar() {
  DOM.sidebar.classList.toggle('active');
  DOM.sidebarBackdrop.classList.toggle('active');
}

function closeSidebar() {
  DOM.sidebar.classList.remove('active');
  DOM.sidebarBackdrop.classList.remove('active');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  saveTheme(newTheme);
}

// ============================================
// MODAL DE CONFIRMAÇÃO
// ============================================

function abrirModalConfirmacao({ titulo, mensagem, textoConfirmar = 'Confirmar', aoConfirmar }) {
  DOM.modalBody.innerHTML = `
    <h3 class="modal-title">${esc(titulo)}</h3>
    <p class="modal-message">${esc(mensagem)}</p>
    <div class="modal-actions">
      <button type="button" class="secondary" id="modal-cancel-btn">Cancelar</button>
      <button type="button" class="danger" id="modal-confirm-btn">${textoConfirmar}</button>
    </div>
  `;

  DOM.modalBody.querySelector('#modal-cancel-btn').addEventListener('click', fecharModal);
  DOM.modalBody.querySelector('#modal-confirm-btn').addEventListener('click', () => {
    fecharModal();
    aoConfirmar();
  });

  abrirModal();
}

let timerFechamentoModal = null;

function abrirModal() {
  // Se um modal acabou de fechar, cancela o fim da animação dele — senão o timer
  // fecharia este que está abrindo agora (ex.: escolha de IMEI → recibo).
  clearTimeout(timerFechamentoModal);
  DOM.modalContent.classList.remove('closing');
  DOM.modalBackdrop.classList.add('active');
  DOM.modal.classList.add('active');
}

function fecharModal() {
  DOM.modalContent.classList.add('closing');
  DOM.modalBackdrop.classList.remove('active');

  clearTimeout(timerFechamentoModal);
  timerFechamentoModal = setTimeout(() => {
    DOM.modal.classList.remove('active');
    DOM.modalContent.classList.remove('closing');
  }, 150);
}

function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"></div>
    <div class="toast-message">${esc(message)}</div>
  `;
  
  DOM.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// AUTH / MULTI-TENANT (loja atual)
// ============================================

let modoCadastro = false;

function mostrarTela(nome) {
  DOM.loginScreen.classList.toggle('active', nome === 'login');
  DOM.onboardingScreen.classList.toggle('active', nome === 'onboarding');
  DOM.appContainer.classList.toggle('active', nome === 'app');

  if (nome === 'app') {
    // A sidebar só existe em layout (display:flex) a partir daqui — antes disso,
    // qualquer offsetTop/offsetHeight medido dá 0, e é por isso que o indicador da aba
    // ativa (a pílula atrás de "Dashboard") nascia com altura zero e ficava invisível
    // até a pessoa clicar em outra aba pra recalcular. Recalcula agora que dá pra medir.
    requestAnimationFrame(() => {
      moverIndicadorAtivo(document.querySelector('.nav-item.active')?.dataset.tab || 'dashboard');
    });
  }
}

function aplicarModoLogin(cadastro) {
  modoCadastro = cadastro;
  DOM.loginSubtitle.textContent = modoCadastro ? 'Criar sua conta' : 'Entrar na sua conta';
  DOM.loginSubmitBtn.textContent = modoCadastro ? 'Criar conta' : 'Entrar';
  DOM.loginToggleText.textContent = modoCadastro ? 'Já tem conta?' : 'Ainda não tem conta?';
  DOM.loginToggleMode.textContent = modoCadastro ? 'Entrar' : 'Criar conta';
}

function handleLoginToggleMode() {
  aplicarModoLogin(!modoCadastro);
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const email = DOM.loginEmail.value.trim();
  const senha = DOM.loginPassword.value;

  if (modoCadastro) {
    const { data, error } = await cadastrarUsuario(email, senha);
    if (error) {
      showToast(`❌ ${error.message}`, 'error');
      return;
    }

    if (!data.session) {
      showToast('✅ Conta criada! Confirme seu e-mail e depois faça login.', 'success');
      aplicarModoLogin(false);
      DOM.loginForm.reset();
      return;
    }

    await carregarContextoLoja(data.user);
    return;
  }

  const { data, error } = await entrarComSenha(email, senha);
  if (error) {
    showToast('❌ E-mail ou senha inválidos.', 'error');
    return;
  }

  await carregarContextoLoja(data.user);
}

async function handleOnboardingSubmit(event) {
  event.preventDefault();

  const nome = DOM.onboardingNome.value.trim();
  const tipo = DOM.onboardingTipo.value;

  if (!nome) {
    showToast('❌ Informe o nome da loja.', 'error');
    return;
  }

  const resultado = await criarLojaEVincularDono(nome, tipo, usuarioAtual);
  if (resultado.error) {
    console.error('Erro ao criar a loja:', resultado.error);
    showToast(`❌ Erro ao criar a loja: ${resultado.error.message}`, 'error');
    return;
  }

  lojaAtual = resultado.loja;
  membroAtual = resultado.membro;

  mostrarTela('app');
  atualizarCabecalhoLoja();
  aplicarGatingDeModulos();
  await carregarDadosDoApp();
  showToast(`✅ Loja "${lojaAtual.nome}" criada!`, 'success');
}

async function carregarContextoLoja(usuario) {
  usuarioAtual = usuario;
  membroAtual = await buscarMembroDoUsuario(usuario.id);

  if (!membroAtual) {
    membroAtual = await aceitarConviteSeExistir(usuario);
  }

  if (!membroAtual) {
    mostrarTela('onboarding');
    return;
  }

  lojaAtual = await buscarLoja(membroAtual.loja_id);
  mostrarTela('app');
  atualizarCabecalhoLoja();
  aplicarGatingDeModulos();
  await carregarDadosDoApp();

  // Vendedor não tem Dashboard no menu — a tela inicial já cai direto em Vendas.
  if (membroAtual.papel === 'vendedor') {
    changeTab('vendas');
  }
}

async function carregarDadosDoApp() {
  renderSkeletonRows();
  renderDashboardSkeleton();
  await loadProducts();
  applyFilters();
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

function obterIniciaisLoja(nome) {
  if (!nome) return '--';
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
  return (palavras[0][0] + palavras[1][0]).toUpperCase();
}

function atualizarCabecalhoLoja() {
  DOM.lojaAtualNome.textContent = lojaAtual ? lojaAtual.nome : '';
  DOM.dashboardSaudacao.textContent = lojaAtual ? `Olá, ${lojaAtual.nome}!` : '';
  DOM.userDisplay.textContent = usuarioAtual ? usuarioAtual.email : '';
  DOM.headerAvatar.textContent = obterIniciaisLoja(lojaAtual?.nome);
}

function souDono() {
  return membroAtual?.papel === 'dono';
}

function aplicarGatingDeModulos() {
  const tipo = lojaAtual?.tipo_negocio || 'ambos';
  const modulosRestritosPorTipoNegocio = {
    cadastro: ['revenda', 'ambos'],
    estoque: ['revenda', 'ambos'],
    vendas: ['revenda', 'ambos'],
  };

  // Vendedor só acessa Vendas, independente do tipo de negócio da loja — a real barreira
  // de permissão é o RLS no Supabase, isso aqui só evita mostrar botão pra algo que a
  // pessoa não pode usar.
  const souVendedor = membroAtual?.papel === 'vendedor';
  const modulosPermitidosVendedor = ['vendas'];

  DOM.navItems.forEach(btn => {
    const tab = btn.dataset.tab;
    const permitidoPorTipoNegocio = !modulosRestritosPorTipoNegocio[tab] || modulosRestritosPorTipoNegocio[tab].includes(tipo);
    const permitidoPorPapel = !souVendedor || modulosPermitidosVendedor.includes(tab);
    btn.classList.toggle('hidden', !(permitidoPorTipoNegocio && permitidoPorPapel));
  });
}

function handleLogout() {
  abrirModalConfirmacao({
    titulo: 'Sair',
    mensagem: 'Tem certeza que deseja sair?',
    textoConfirmar: 'Sair',
    aoConfirmar: async () => {
      await sair();
      products = [];
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
  DOM.papelOptions.forEach(btn => btn.classList.toggle('active', btn.dataset.papel === papel));
  DOM.papelDescricao.textContent = PAPEL_DESCRICOES[papel] || '';
}

function selecionarPapelConvite(papel) {
  DOM.invitePapel.value = papel;
  sincronizarPapelSelector();
}

function renderBadgePapel(papel) {
  const classe = papel === 'dono' ? 'badge-papel--dono' : 'badge-papel--vendedor';
  return `<span class="badge-papel ${classe}">${esc(PAPEL_LABELS[papel] || papel)}</span>`;
}

async function renderEquipe() {
  DOM.inviteForm.classList.toggle('hidden', !podeGerenciarEquipe());

  const [membros, convites] = await Promise.all([
    buscarMembrosDaLoja(lojaAtual.id),
    podeGerenciarEquipe() ? buscarConvitesPendentes(lojaAtual.id) : Promise.resolve([]),
  ]);

  DOM.equipeTableBody.innerHTML = '';

  membros.forEach(m => {
    const tr = document.createElement('tr');
    const desde = new Date(m.created_at).toLocaleDateString('pt-BR');

    tr.innerHTML = `
      <td>${renderPessoaChip(m.email)}</td>
      <td>${renderBadgePapel(m.papel)}</td>
      <td>${desde}</td>
      <td class="product-actions"></td>
    `;

    const acoesCellMembro = tr.querySelector('td:last-child');
    acoesCellMembro.innerHTML = '<span class="action-spacer"></span>';

    if (podeGerenciarEquipe() && m.usuario_id !== usuarioAtual.id) {
      const btnRemover = document.createElement('button');
      btnRemover.className = 'delete';
      btnRemover.title = 'Remover membro';
      btnRemover.innerHTML = ICONES_ACAO.excluir;
      btnRemover.addEventListener('click', () => removerMembroDaEquipe(m));
      acoesCellMembro.appendChild(btnRemover);
    } else {
      acoesCellMembro.insertAdjacentHTML('beforeend', '<span class="action-spacer"></span>');
    }

    DOM.equipeTableBody.appendChild(tr);
  });

  convites.forEach(c => {
    const tr = document.createElement('tr');
    const enviado = new Date(c.created_at).toLocaleDateString('pt-BR');

    tr.innerHTML = `
      <td>
        <span class="vendedor-chip">
          <span class="vendedor-avatar vendedor-avatar--pendente"><i class="ti ti-clock"></i></span>
          <span>
            ${esc(c.email)}
            <span class="convite-pendente-texto">Convite pendente</span>
          </span>
        </span>
      </td>
      <td>${renderBadgePapel(c.papel)}</td>
      <td>${enviado}</td>
      <td class="product-actions"></td>
    `;

    const acoesCell = tr.querySelector('td:last-child');

    const btnReenviar = document.createElement('button');
    btnReenviar.title = 'Reenviar convite';
    btnReenviar.innerHTML = '<i class="ti ti-send"></i>';
    btnReenviar.addEventListener('click', () => reenviarConvite(c));
    acoesCell.appendChild(btnReenviar);

    const btnCancelar = document.createElement('button');
    btnCancelar.className = 'delete';
    btnCancelar.title = 'Cancelar convite';
    btnCancelar.innerHTML = ICONES_ACAO.excluir;
    btnCancelar.addEventListener('click', () => cancelarConviteNaTela(c));
    acoesCell.appendChild(btnCancelar);

    DOM.equipeTableBody.appendChild(tr);
  });
}

function removerMembroDaEquipe(membro) {
  abrirModalConfirmacao({
    titulo: 'Remover membro',
    mensagem: `Tem certeza que deseja remover ${membro.email} da equipe?`,
    textoConfirmar: 'Remover',
    aoConfirmar: async () => {
      const ok = await removerMembro(membro.id);
      if (!ok) {
        showToast('❌ Erro ao remover membro.', 'error');
        return;
      }
      showToast('✅ Membro removido.', 'success');
      renderEquipe();
    },
  });
}

async function reenviarConvite(convite) {
  const resultado = await convidarMembro(convite.email, convite.papel, lojaAtual.id);
  if (resultado.error) {
    showToast(`❌ ${resultado.error}`, 'error');
    return;
  }
  showToast(`✅ Convite reenviado para ${convite.email}!`, 'success');
  renderEquipe();
}

function cancelarConviteNaTela(convite) {
  abrirModalConfirmacao({
    titulo: 'Cancelar convite',
    mensagem: `Cancelar o convite pendente enviado para ${convite.email}?`,
    textoConfirmar: 'Cancelar convite',
    aoConfirmar: async () => {
      const ok = await cancelarConvite(convite.id);
      if (!ok) {
        showToast('❌ Erro ao cancelar convite.', 'error');
        return;
      }
      showToast('✅ Convite cancelado.', 'success');
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
    showToast(`❌ ${resultado.error}`, 'error');
    return;
  }

  showToast(`✅ Convite enviado para ${email}!`, 'success');
  DOM.inviteForm.reset();
  sincronizarPapelSelector();
  renderEquipe();
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
  // Auth
  DOM.loginForm.addEventListener('submit', handleAuthSubmit);
  DOM.loginToggleMode.addEventListener('click', handleLoginToggleMode);
  DOM.onboardingForm.addEventListener('submit', handleOnboardingSubmit);
  DOM.logoutButton.addEventListener('click', handleLogout);
  DOM.themeToggle.addEventListener('click', toggleTheme);

  // Equipe
  DOM.inviteForm.addEventListener('submit', handleInviteSubmit);
  DOM.papelOptions.forEach(btn => btn.addEventListener('click', () => selecionarPapelConvite(btn.dataset.papel)));

  // Sidebar
  DOM.menuToggle.addEventListener('click', toggleSidebar);
  DOM.sidebarClose.addEventListener('click', closeSidebar);
  DOM.navItems.forEach(btn => btn.addEventListener('click', () => changeTab(btn.dataset.tab)));

  // Cadastro: eventos próprios em cadastro.js
  initCadastro();

  // Dashboard: aviso de custo pendente leva direto à lista de produtos sem custo.
  DOM.dashCustoPendenteLink.addEventListener('click', () => {
    DOM.filterStock.value = 'sem_custo';
    applyFilters();
    changeTab('estoque');
  });

  // Filters - Stock
  [DOM.filterSearch, DOM.filterBrand, DOM.filterStock].forEach(el => {
    el.addEventListener('change', applyFilters);
    el.addEventListener('input', applyFilters);
  });
  DOM.typeQuickfilterBtns.forEach(btn => btn.addEventListener('click', () => selecionarFiltroTipo(btn.dataset.type)));
  DOM.filtersToggleBtn.addEventListener('click', () => toggleFiltersPanel());
  DOM.statusChips.addEventListener('click', (e) => {
    const btn = e.target.closest('.status-chip');
    if (btn) selecionarChipStatus(btn.dataset.stock);
  });
  DOM.exportCsvBtn.addEventListener('click', exportarEstoqueCSV);
  DOM.exportHistoricoCsvBtn.addEventListener('click', exportarHistoricoCSV);

  // Ordenação da tabela
  DOM.sortableHeaders.forEach(th => {
    th.addEventListener('click', () => ordenarPor(th.dataset.sort));
  });

  // Filters - Sales
  DOM.filterSalesSearch.addEventListener('input', applyFilters);
  DOM.filterSalesBrand.addEventListener('change', applyFilters);

  // Filters - Histórico de vendas
  DOM.filterHistoricoSearch.addEventListener('input', renderHistoricoVendas);
  DOM.filterHistoricoPeriodo.addEventListener('change', async () => {
    await carregarHistoricoVendas();
    updateHistoricoBrandFilter();
    renderHistoricoVendas();
  });
  DOM.filterHistoricoBrand.addEventListener('change', renderHistoricoVendas);


  // Close sidebar on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 760 && DOM.sidebar.classList.contains('active')) {
      if (!DOM.sidebar.contains(e.target) && !DOM.menuToggle.contains(e.target)) {
        closeSidebar();
      }
    }
  });

  DOM.sidebarBackdrop.addEventListener('click', closeSidebar);

  // Modal
  DOM.modalClose.addEventListener('click', fecharModal);
  DOM.modalBackdrop.addEventListener('click', fecharModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.modal.classList.contains('active')) {
      fecharModal();
    }
  });

  // Empty state CTA
  DOM.emptyStateCta.addEventListener('click', () => changeTab('cadastro'));

  // Dashboard - painéis de marcas e estoque baixo
  DOM.dashboardBrandlistCta.addEventListener('click', () => changeTab('cadastro'));
  DOM.lowStockVerTodos.addEventListener('click', irParaEstoqueBaixo);
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  loadTheme();
  initEventListeners();
  sincronizarPapelSelector();
  aplicarModoLogin(false);
  moverIndicadorAtivo(document.querySelector('.nav-item.active')?.dataset.tab || 'dashboard');
  await iniciarSessao();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
