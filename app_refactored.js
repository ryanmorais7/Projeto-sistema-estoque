// ============================================
// CONSTANTS & DATA
// ============================================

// Mesmo critério "baixo" usado no dashboard (disco do cofre e lista de estoque baixo): 1-5 unidades.
const LIMITE_ESTOQUE_BAIXO = 5;
const PAPEL_LABELS = {
  dono: 'Dono',
  vendedor: 'Vendedor',
};

const PAPEL_DESCRICOES = {
  vendedor: 'Acessa só a aba Vendas, pode vender produtos e ajustar quantidade através da venda, não edita estoque nem cadastro.',
  dono: 'Acesso total ao sistema, incluindo cadastro, estoque e gestão da equipe.',
};
const URL_CONSULTA_ANATEL = 'https://www.consultaserialaparelho.com.br/public-web/home';

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
  low: 'Baixo (1-5)',
  medium: 'Médio (6-20)',
  high: 'Alto (20+)',
};

// Mesma lista de cores que já existia no <select> — só muda a forma de escolher.
const CORES_MAPA = {
  'Preto': '#111114',
  'Branco': '#F5F5F5',
  'Prata': '#C6C9CD',
  'Cinza': '#8A8F98',
  'Azul': '#2563EB',
  'Vermelho': '#DC2626',
  'Verde': '#16A34A',
  'Amarelo': '#F5C518',
  'Rosa': '#EC4899',
  'Dourado': '#D4AF37',
  'Roxo': '#7C3AED',
  'Laranja': '#EA580C',
  'Marrom': '#7C4A25',
  'Outro': 'linear-gradient(135deg, #EC4899, #7C3AED, #2563EB)',
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
  
  // Forms & Inputs
  productForm: document.getElementById('product-form'),
  formInputs: {
    type: document.getElementById('type'),
    brand: document.getElementById('brand'),
    model: document.getElementById('model'),
    color: document.getElementById('color'),
    manufacture: document.getElementById('manufacture'),
    price: document.getElementById('price'),
    quantity: document.getElementById('quantity'),
    notes: document.getElementById('notes'),
  },
  cancelEditBtn: document.getElementById('cancel-edit'),

  // Cadastro — seletor de tipo, paleta de cor, stepper, prévia, duplicidade
  typeOptions: document.querySelectorAll('.type-option'),
  colorPalette: document.getElementById('color-palette'),
  quantityIncrement: document.getElementById('quantity-increment'),
  quantityDecrement: document.getElementById('quantity-decrement'),
  duplicateWarning: document.getElementById('duplicate-warning'),
  previewImage: document.getElementById('preview-image'),
  previewName: document.getElementById('preview-name'),
  previewMeta: document.getElementById('preview-meta'),
  previewPrice: document.getElementById('preview-price'),

  // Unidades (IMEI)
  unidadesSection: document.getElementById('unidades-section'),
  unidadesContainer: document.getElementById('unidades-container'),
  unidadesStatus: document.getElementById('unidades-status'),
  addUnidadeBtn: document.getElementById('add-unidade-btn'),
  unidadeTemplate: document.getElementById('unidade-template'),

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
  filterColor: document.getElementById('filter-color'),
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
  dashValue: document.getElementById('dash-value'),
  dashVendasHoje: document.getElementById('dash-vendas-hoje'),
  dashVendasHojeValor: document.getElementById('dash-vendas-hoje-valor'),
  dashVendasHojeTrend: document.getElementById('dash-vendas-hoje-trend'),
  dashTicketMedio: document.getElementById('dash-ticket-medio'),
  dashImeiImpedido: document.getElementById('dash-imei-impedido'),
  dashboardAlertasCard: document.getElementById('dashboard-alertas-card'),
  dashboardAlertasIconBox: document.getElementById('dashboard-alertas-icon-box'),
  dashboardAlertasSubtitle: document.getElementById('dashboard-alertas-subtitle'),
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

let products = [];
let filteredProducts = [];
let filteredSalesProducts = [];
let editingId = null;
let sortConfig = { field: null, direction: 'asc' };
let historicoVendas = [];

// ============================================
// PRODUTOS (Supabase)
// ============================================

// Cache de unidades por produto — carregado uma vez junto com os produtos (em vez de
// refazer a consulta a cada filtro/render) pra permitir busca por IMEI no filtro sem
// bater no banco a cada tecla, e pra manter a linha expansível em sincronia.
let unidadesPorProdutoCache = {};

async function refrescarUnidadesCache() {
  const idsAparelhos = products.filter(p => p.type === 'aparelhos').map(p => p.id);
  unidadesPorProdutoCache = await buscarUnidadesPorProdutos(idsAparelhos);
}

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('loja_id', lojaAtual.id)
    .order('id', { ascending: false });

  if (error) {
    showToast('❌ Erro ao carregar produtos do Supabase.', 'error');
    products = [];
    unidadesPorProdutoCache = {};
    return;
  }

  products = data;
  await refrescarUnidadesCache();
}

async function insertProduct(productData) {
  const { data, error } = await supabaseClient
    .from('products')
    .insert([{ ...productData, loja_id: lojaAtual.id }])
    .select()
    .single();

  if (error) {
    showToast('❌ Erro ao salvar produto no Supabase.', 'error');
    return null;
  }

  return data;
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
  return [...new Set(products.map(p => p.brand))].sort();
}

function pluralize(count, singular, plural = singular + 's') {
  return count === 1 ? singular : plural;
}

// ============================================
// TABLE RENDERING
// ============================================

const ICONES_ACAO = {
  editar: '<i class="ti ti-edit"></i>',
  excluir: '<i class="ti ti-trash"></i>',
  unidades: '<i class="ti ti-barcode"></i>',
};

function renderBadgeEstoque(quantity) {
  let classe = 'ok';
  let texto = `${quantity} em estoque`;

  if (quantity === 0) {
    classe = 'esgotado';
    texto = 'Esgotado';
  } else if (quantity <= LIMITE_ESTOQUE_BAIXO) {
    classe = 'baixo';
    texto = `${quantity} (baixo)`;
  }

  return `<span class="badge-estoque ${classe}">${texto}</span>`;
}

function createProductRow(product, unidadesDoProduto = []) {
  const template = DOM.productRowTemplate.content.cloneNode(true);
  const row = template.querySelector('tr');

  const temImeiImpedido = unidadesDoProduto.some(u => u.status_anatel === 'impedido');

  row.querySelector('.product-type').innerHTML = `<i class="ti ${TIPO_ICONES[product.type] || 'ti-package'}"></i> ${TIPO_LABELS[product.type] || product.type}`;
  row.querySelector('.product-name').innerHTML = `${product.brand} ${product.model}${temImeiImpedido ? ' ' + renderBadgeImeiAlerta() : ''}`;
  row.querySelector('.product-color').innerHTML = `<span class="table-color-dot" style="background:${CORES_MAPA[product.color] || 'var(--bg-tertiary)'}"></span>${product.color}`;
  row.querySelector('.product-manufacture').textContent = product.manufacture;
  row.querySelector('.product-price').textContent = formatCurrency(product.price);
  row.querySelector('.product-quantity').innerHTML = renderBadgeEstoque(product.quantity);

  const actionsCell = row.querySelector('.product-actions');
  actionsCell.innerHTML = `
    ${product.type === 'aparelhos' ? `<button class="unidades-toggle-btn" title="Ver unidades / IMEI">${ICONES_ACAO.unidades}</button>` : '<span class="action-spacer"></span>'}
    ${souDono() ? `<button class="edit-btn" title="Editar produto">${ICONES_ACAO.editar}</button>` : '<span class="action-spacer"></span>'}
    ${souDono() ? `<button class="delete-btn delete" title="Excluir produto">${ICONES_ACAO.excluir}</button>` : '<span class="action-spacer"></span>'}
  `;

  actionsCell.querySelector('.edit-btn')?.addEventListener('click', () => startEditProduct(product.id));
  actionsCell.querySelector('.delete-btn')?.addEventListener('click', () => deleteProduct(product.id));

  return row;
}

function createUnidadesSubRow(unidadesDoProduto) {
  const tr = document.createElement('tr');
  tr.className = 'unidades-subrow';
  const td = document.createElement('td');
  td.colSpan = 8;
  td.className = 'unidades-subrow-content';
  td.innerHTML = renderUnidadesSubTable(unidadesDoProduto);
  tr.appendChild(td);
  wireUnidadesSubTableEvents(td);
  return tr;
}

function createSalesRow(product) {
  const template = DOM.salesRowTemplate.content.cloneNode(true);
  const row = template.querySelector('tr');

  row.querySelector('.sale-name').textContent = `${product.brand} ${product.model}`;
  row.querySelector('.sale-color').innerHTML = `<span class="table-color-dot" style="background:${CORES_MAPA[product.color] || 'var(--bg-tertiary)'}"></span>${product.color}`;
  row.querySelector('.sale-stock').innerHTML = renderBadgeEstoque(product.quantity);
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
    const unidadesDoProduto = unidadesPorProdutoCache[product.id] || [];
    const row = createProductRow(product, unidadesDoProduto);
    DOM.productTableBody.appendChild(row);

    if (product.type === 'aparelhos') {
      const subRow = createUnidadesSubRow(unidadesDoProduto);
      DOM.productTableBody.appendChild(subRow);

      row.querySelector('.unidades-toggle-btn').addEventListener('click', (e) => {
        toggleUnidadesSubRow(subRow, e.currentTarget);
      });
    }
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
      ${Array.from({ length: 7 }).map(() => '<td><div class="skeleton-cell"></div></td>').join('')}
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
    color: DOM.filterColor.value,
    stock: DOM.filterStock.value,
  };
}

function matchesSearchTerm(product, searchTerm) {
  if (!searchTerm) return true;

  if (product.brand.toLowerCase().includes(searchTerm) ||
      product.model.toLowerCase().includes(searchTerm) ||
      product.color.toLowerCase().includes(searchTerm)) {
    return true;
  }

  const unidades = unidadesPorProdutoCache[product.id] || [];
  return unidades.some(u =>
    (u.imei && u.imei.includes(searchTerm)) || (u.imei2 && u.imei2.includes(searchTerm))
  );
}

function matchesStockFilter(quantity, filter) {
  if (!filter) return true;
  if (filter === 'zero') return quantity === 0;
  if (filter === 'low') return quantity >= 1 && quantity <= 5;
  if (filter === 'medium') return quantity >= 6 && quantity <= 20;
  if (filter === 'high') return quantity > 20;
  return true;
}

function filterProducts() {
  const { search, type, brand, color, stock } = getFilterValues();

  return products.filter(product =>
    matchesSearchTerm(product, search) &&
    (!type || product.type === type) &&
    (!brand || product.brand === brand) &&
    (!color || product.color === color) &&
    matchesStockFilter(product.quantity, stock)
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
  DOM.filterColor.value = '';
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
  if (DOM.filterColor.value) {
    chips.push({ label: `Cor: ${DOM.filterColor.value}`, limpar: () => { DOM.filterColor.value = ''; applyFilters(); } });
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
      ${chip.label}
      <button type="button" class="filter-chip-remove" aria-label="Remover filtro"><i class="ti ti-x"></i></button>
    </span>
  `).join('') + `<button type="button" class="filter-chip-clear-all" id="filter-chip-clear-all">Limpar tudo</button>`;

  DOM.filtersChips.querySelectorAll('.filter-chip-remove').forEach((btn, i) => {
    btn.addEventListener('click', () => chips[i].limpar());
  });
  document.getElementById('filter-chip-clear-all').addEventListener('click', clearAllFilters);

  // Se algum filtro do painel "Mais filtros" estiver ativo, deixa o painel já aberto.
  if (DOM.filterBrand.value || DOM.filterColor.value || DOM.filterStock.value) {
    toggleFiltersPanel(true);
  }
}

// ---- Chips de atalho por status (acima da tabela) ------------------------------

function renderStatusChips() {
  const total = products.length;
  const baixo = products.filter(p => p.quantity >= 1 && p.quantity <= 5).length;
  const zerado = products.filter(p => p.quantity === 0).length;
  const stockAtivo = DOM.filterStock.value;

  DOM.statusChips.innerHTML = `
    <button type="button" class="status-chip ${!stockAtivo ? 'active' : ''}" data-stock="">Todos <span class="status-chip-count">${total}</span></button>
    <button type="button" class="status-chip ${stockAtivo === 'low' ? 'active' : ''}" data-stock="low">Estoque baixo <span class="status-chip-count">${baixo}</span></button>
    <button type="button" class="status-chip ${stockAtivo === 'zero' ? 'active' : ''}" data-stock="zero">Sem estoque <span class="status-chip-count">${zerado}</span></button>
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
      ${chip.label}
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
// UNIDADES COM IMEI (Supabase)
// ============================================

function validarImei(imei) {
  return /^\d{15}$/.test(imei);
}

// IDs (uuid) das unidades que já existiam no banco quando o formulário foi aberto pra
// edição — usado em salvarUnidades() pra saber quais linhas foram removidas no form e
// precisam ser apagadas do banco também (em vez de só inserir tudo de novo).
let unidadeIdsCarregadas = [];

// Tipo selecionado antes da última troca — usado por handleTypeChange() pra saber se
// está saindo de 'aparelhos' com IMEIs já digitados (e precisa confirmar o descarte).
let tipoAnteriorDoForm = 'aparelhos';

function toggleUnidadesSection() {
  const ehAparelho = DOM.formInputs.type.value === 'aparelhos';
  DOM.unidadesSection.classList.toggle('hidden', !ehAparelho);
}

function handleTypeChange() {
  const novoTipo = DOM.formInputs.type.value;
  const totalImeisPreenchidos = contarImeisValidosNoForm();

  if (tipoAnteriorDoForm === 'aparelhos' && novoTipo !== 'aparelhos' && totalImeisPreenchidos > 0) {
    DOM.formInputs.type.value = 'aparelhos';
    sincronizarTypeSelector();

    abrirModalConfirmacao({
      titulo: 'Descartar IMEIs cadastrados?',
      mensagem: `Você já preencheu ${totalImeisPreenchidos} ${pluralize(totalImeisPreenchidos, 'IMEI', 'IMEIs')} nesse formulário. Trocar o tipo do produto vai descartá-los. Deseja continuar?`,
      textoConfirmar: 'Descartar e trocar',
      aoConfirmar: () => {
        DOM.formInputs.type.value = novoTipo;
        sincronizarTypeSelector();
        tipoAnteriorDoForm = novoTipo;
        limparUnidadesForm();
        toggleUnidadesSection();
        atualizarPreview();
      },
    });
    return;
  }

  tipoAnteriorDoForm = novoTipo;
  toggleUnidadesSection();
  atualizarStatusUnidades();
  atualizarPreview();
}

function contarImeisValidosNoForm() {
  const blocos = DOM.unidadesContainer.querySelectorAll('.unidade-block');
  let total = 0;
  blocos.forEach(bloco => {
    if (bloco.querySelector('.unidade-imei').value.trim()) total++;
  });
  return total;
}

function atualizarStatusUnidades() {
  if (DOM.formInputs.type.value !== 'aparelhos') {
    DOM.unidadesStatus.textContent = '';
    DOM.unidadesStatus.className = 'unidades-status hidden';
    return;
  }

  const quantidade = Number(DOM.formInputs.quantity.value) || 0;
  const cadastrados = contarImeisValidosNoForm();
  const faltam = quantidade - cadastrados;

  DOM.unidadesStatus.classList.remove('hidden');

  if (quantidade === 0) {
    DOM.unidadesStatus.textContent = 'Informe a quantidade em estoque para saber quantos IMEIs cadastrar.';
    DOM.unidadesStatus.className = 'unidades-status unidades-status--neutro';
  } else if (faltam > 0) {
    DOM.unidadesStatus.textContent = `Adicione mais ${faltam} ${pluralize(faltam, 'IMEI', 'IMEIs')} para completar a quantidade em estoque (${cadastrados} de ${quantidade} cadastrados).`;
    DOM.unidadesStatus.className = 'unidades-status unidades-status--pendente';
  } else if (faltam < 0) {
    const excedente = Math.abs(faltam);
    DOM.unidadesStatus.textContent = `Você cadastrou ${cadastrados} IMEIs, mas a quantidade em estoque é ${quantidade}. Remova ${excedente} ${pluralize(excedente, 'unidade', 'unidades')} ou ajuste a quantidade.`;
    DOM.unidadesStatus.className = 'unidades-status unidades-status--pendente';
  } else {
    DOM.unidadesStatus.textContent = `✓ ${cadastrados} de ${quantidade} IMEIs cadastrados.`;
    DOM.unidadesStatus.className = 'unidades-status unidades-status--ok';
  }
}

function criarBlocoUnidade(unidadeExistente = null) {
  const bloco = DOM.unidadeTemplate.content.cloneNode(true);
  const elBloco = bloco.querySelector('.unidade-block');

  if (unidadeExistente) {
    elBloco.dataset.unidadeId = unidadeExistente.id;
    bloco.querySelector('.unidade-imei').value = unidadeExistente.imei || '';
    bloco.querySelector('.unidade-imei2').value = unidadeExistente.imei2 || '';
    bloco.querySelector('.unidade-grade').value = unidadeExistente.grade || 'novo';
    bloco.querySelector('.unidade-saude-bateria').value = unidadeExistente.saude_bateria ?? '';
    bloco.querySelector('.unidade-origem').value = unidadeExistente.origem || 'compra_fornecedor';
    bloco.querySelector('.unidade-nota-fiscal').value = unidadeExistente.nota_fiscal_fornecedor || '';
    bloco.querySelector('.unidade-garantia').value = unidadeExistente.garantia_fornecedor_ate || '';
  }

  bloco.querySelector('.unidade-remove-btn').addEventListener('click', (e) => {
    e.target.closest('.unidade-block').remove();
    atualizarStatusUnidades();
  });

  DOM.unidadesContainer.appendChild(bloco);
  atualizarStatusUnidades();
}

function limparUnidadesForm() {
  DOM.unidadesContainer.innerHTML = '';
  unidadeIdsCarregadas = [];
}

function coletarUnidadesDoForm() {
  const blocos = DOM.unidadesContainer.querySelectorAll('.unidade-block');
  const unidades = [];

  for (const bloco of blocos) {
    const imei = bloco.querySelector('.unidade-imei').value.trim();
    if (!imei) continue;

    if (!validarImei(imei)) {
      showToast('❌ IMEI inválido. Deve conter exatamente 15 dígitos.', 'error');
      return null;
    }

    const imei2 = bloco.querySelector('.unidade-imei2').value.trim();
    if (imei2 && !validarImei(imei2)) {
      showToast('❌ IMEI 2 inválido. Deve conter exatamente 15 dígitos.', 'error');
      return null;
    }

    const saudeBateria = bloco.querySelector('.unidade-saude-bateria').value;
    const notaFiscal = bloco.querySelector('.unidade-nota-fiscal').value.trim();
    const garantia = bloco.querySelector('.unidade-garantia').value;

    unidades.push({
      id: bloco.dataset.unidadeId || null,
      imei,
      imei2: imei2 || null,
      grade: bloco.querySelector('.unidade-grade').value,
      saude_bateria: saudeBateria ? Number(saudeBateria) : null,
      origem: bloco.querySelector('.unidade-origem').value,
      nota_fiscal_fornecedor: notaFiscal || null,
      garantia_fornecedor_ate: garantia || null,
    });
  }

  return unidades;
}

async function verificarImeisDuplicados(imeis, produtoIdExcluir) {
  if (!imeis.length) return [];

  const { data, error } = await supabaseClient
    .from('unidades_produto')
    .select('imei, produto_id')
    .eq('loja_id', lojaAtual.id)
    .in('imei', imeis);

  if (error) return [];

  return [...new Set(
    data.filter(u => u.produto_id !== produtoIdExcluir).map(u => u.imei)
  )];
}

async function salvarUnidades(produtoId, unidades) {
  const idsAtuais = unidades.filter(u => u.id).map(u => u.id);
  const idsRemovidos = unidadeIdsCarregadas.filter(id => !idsAtuais.includes(id));

  if (idsRemovidos.length) {
    const { error } = await supabaseClient.from('unidades_produto').delete().in('id', idsRemovidos);
    if (error) {
      showToast('❌ Produto salvo, mas houve erro ao remover unidades excluídas.', 'error');
      return false;
    }
  }

  const novas = unidades
    .filter(u => !u.id)
    .map(({ id, ...resto }) => ({ ...resto, produto_id: produtoId, loja_id: lojaAtual.id }));

  if (novas.length) {
    const { error } = await supabaseClient.from('unidades_produto').insert(novas);
    if (error) {
      showToast('❌ Produto salvo, mas houve erro ao salvar as unidades com IMEI.', 'error');
      return false;
    }
  }

  const existentes = unidades.filter(u => u.id);
  for (const unidade of existentes) {
    const { id, ...campos } = unidade;
    const { error } = await supabaseClient.from('unidades_produto').update(campos).eq('id', id);
    if (error) {
      showToast('❌ Produto salvo, mas houve erro ao atualizar uma unidade com IMEI.', 'error');
      return false;
    }
  }

  return true;
}

async function buscarUnidadesPorProdutos(produtoIds) {
  if (!produtoIds.length) return {};

  const { data, error } = await supabaseClient
    .from('unidades_produto')
    .select('*')
    .eq('loja_id', lojaAtual.id)
    .in('produto_id', produtoIds)
    .order('created_at', { ascending: false });

  if (error) {
    showToast('❌ Erro ao carregar unidades dos produtos.', 'error');
    return {};
  }

  const mapa = {};
  data.forEach(u => {
    if (!mapa[u.produto_id]) mapa[u.produto_id] = [];
    mapa[u.produto_id].push(u);
  });
  return mapa;
}

async function atualizarStatusAnatel(unidadeId, novoStatus) {
  const { error } = await supabaseClient
    .from('unidades_produto')
    .update({ status_anatel: novoStatus, data_consulta_anatel: new Date().toISOString() })
    .eq('id', unidadeId);

  if (error) {
    showToast('❌ Erro ao atualizar status Anatel.', 'error');
    return;
  }

  showToast('✅ Status Anatel atualizado.', 'success');
  await refrescarUnidadesCache();
  await applyFilters();
}

function abrirConsultaAnatel() {
  window.open(URL_CONSULTA_ANATEL, '_blank');
}

const GRADE_LABELS = {
  novo: 'Novo',
  seminovo_a: 'Seminovo A',
  seminovo_b: 'Seminovo B',
  seminovo_c: 'Seminovo C',
  usado: 'Usado',
};

function renderUnidadesSubTable(unidades) {
  if (!unidades.length) {
    return '<p class="unidades-empty-msg">Nenhuma unidade com IMEI cadastrada para este produto.</p>';
  }

  const linhas = unidades.map(u => `
    <tr data-unidade-id="${u.id}">
      <td>${u.imei}${u.imei2 ? ` / ${u.imei2}` : ''}</td>
      <td>${GRADE_LABELS[u.grade] || u.grade || '-'}</td>
      <td>
        ${u.status_anatel === 'impedido' ? renderBadgeImeiAlerta() : renderBadgeStatusAnatel(u.status_anatel)}
        <div class="unidade-status-actions">
          <button type="button" class="unidade-consultar-btn">🔍 Consultar situação</button>
          <select class="unidade-status-select">
            <option value="nao_consultado" ${u.status_anatel === 'nao_consultado' ? 'selected' : ''}>Não consultado</option>
            <option value="regular" ${u.status_anatel === 'regular' ? 'selected' : ''}>Regular</option>
            <option value="impedido" ${u.status_anatel === 'impedido' ? 'selected' : ''}>Impedido</option>
          </select>
        </div>
      </td>
      <td><span class="badge-estoque ok">Em estoque</span></td>
    </tr>
  `).join('');

  return `
    <table class="unidades-subtable">
      <thead>
        <tr>
          <th>IMEI</th>
          <th>Grade</th>
          <th>Status Anatel</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

function renderBadgeStatusAnatel(status) {
  if (status === 'regular') {
    return '<span class="badge-estoque ok">Regular</span>';
  }
  return '<span class="badge-estoque baixo">Não consultado</span>';
}

function renderBadgeImeiAlerta() {
  return '<span class="badge-imei-alerta">IMEI IMPEDIDO - NÃO NEGOCIAR</span>';
}

function wireUnidadesSubTableEvents(container) {
  container.querySelectorAll('tr[data-unidade-id]').forEach(tr => {
    const unidadeId = tr.dataset.unidadeId;

    tr.querySelector('.unidade-consultar-btn').addEventListener('click', abrirConsultaAnatel);

    tr.querySelector('.unidade-status-select').addEventListener('change', (e) => {
      atualizarStatusAnatel(unidadeId, e.target.value);
    });
  });
}

function toggleUnidadesSubRow(subRow, botao) {
  const jaAberta = subRow.classList.contains('active');
  subRow.classList.toggle('active', !jaAberta);
  botao.classList.toggle('expanded', !jaAberta);
}

// ============================================
// FORM OPERATIONS
// ============================================

// ---- Tipo (seletor visual) --------------------------------------------------

function sincronizarTypeSelector() {
  const tipoAtual = DOM.formInputs.type.value;
  DOM.typeOptions.forEach(btn => btn.classList.toggle('active', btn.dataset.type === tipoAtual));
}

function selecionarTipo(tipo) {
  if (DOM.formInputs.type.value === tipo) return;
  DOM.formInputs.type.value = tipo;
  sincronizarTypeSelector();
  DOM.formInputs.type.dispatchEvent(new Event('change', { bubbles: true }));
}

// ---- Cor (paleta de bolinhas) -----------------------------------------------

function renderColorPalette() {
  DOM.colorPalette.innerHTML = Object.keys(CORES_MAPA).map(nome => `
    <button type="button" class="color-swatch-btn" data-color="${nome}" title="${nome}">
      <span class="color-swatch" style="background:${CORES_MAPA[nome]}"></span>
      <span class="color-swatch-label">${nome}</span>
    </button>
  `).join('');
}

function sincronizarColorPalette() {
  const corAtual = DOM.formInputs.color.value;
  DOM.colorPalette.querySelectorAll('.color-swatch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === corAtual);
  });
}

function selecionarCor(cor) {
  DOM.formInputs.color.value = cor;
  sincronizarColorPalette();
  DOM.formInputs.color.dispatchEvent(new Event('change', { bubbles: true }));
}

// ---- Prévia ao vivo -----------------------------------------------------------

function atualizarPreview() {
  const brand = DOM.formInputs.brand.value.trim();
  const model = DOM.formInputs.model.value.trim();
  const color = DOM.formInputs.color.value;
  const type = DOM.formInputs.type.value;
  const price = parsePriceValue(DOM.formInputs.price.value);

  const temNome = Boolean(brand && model);
  DOM.previewName.textContent = temNome ? `${brand} ${model}` : 'Marca e modelo';
  DOM.previewName.classList.toggle('preview-placeholder', !temNome);

  const metaPartes = [color, TIPO_LABELS[type]].filter(Boolean);
  DOM.previewMeta.textContent = metaPartes.length ? metaPartes.join(' · ') : 'Cor e tipo';
  DOM.previewMeta.classList.toggle('preview-placeholder', metaPartes.length === 0);

  DOM.previewPrice.textContent = formatCurrency(price || 0);
}

// ---- Aviso de produto duplicado -----------------------------------------------

function verificarProdutoDuplicado() {
  const brand = DOM.formInputs.brand.value.trim();
  const model = DOM.formInputs.model.value.trim();
  const color = DOM.formInputs.color.value;

  if (!brand || !model || !color) {
    DOM.duplicateWarning.classList.add('hidden');
    return;
  }

  const existente = products.find(p =>
    p.brand === brand && p.model === model && p.color === color && p.id !== editingId
  );

  if (!existente) {
    DOM.duplicateWarning.classList.add('hidden');
    return;
  }

  DOM.duplicateWarning.innerHTML = `
    <i class="ti ti-alert-circle"></i>
    <span>Já existe um produto com essa marca, modelo e cor no estoque — quantidade atual: <strong>${existente.quantity}</strong> ${pluralize(existente.quantity, 'unidade')}.</span>
    <button type="button" class="duplicate-warning-link" id="duplicate-warning-link">Editar produto existente</button>
  `;
  DOM.duplicateWarning.classList.remove('hidden');
  DOM.duplicateWarning.querySelector('#duplicate-warning-link').addEventListener('click', () => startEditProduct(existente.id));
}

function atualizarPreviewEDuplicidade() {
  atualizarPreview();
  verificarProdutoDuplicado();
}

function updateModelOptions() {
  const brand = DOM.formInputs.brand.value;
  const models = BRAND_MODELS[brand] || [];
  
  DOM.formInputs.model.innerHTML = '';
  
  if (!models.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '-- Selecione a marca primeiro --';
    opt.selected = true;
    DOM.formInputs.model.appendChild(opt);
    DOM.formInputs.model.disabled = true;
  } else {
    DOM.formInputs.model.disabled = false;
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = `-- Selecione um modelo de ${brand} --`;
    opt.selected = true;
    DOM.formInputs.model.appendChild(opt);
    
    models.forEach(model => {
      const o = document.createElement('option');
      o.value = model;
      o.textContent = model;
      DOM.formInputs.model.appendChild(o);
    });
  }
}

function resetForm() {
  DOM.productForm.reset();
  editingId = null;
  DOM.cancelEditBtn.classList.add('hidden');
  document.getElementById('save-button').textContent = '✓ Salvar produto';
  limparUnidadesForm();
  toggleUnidadesSection();
  tipoAnteriorDoForm = DOM.formInputs.type.value;
  sincronizarTypeSelector();
  sincronizarColorPalette();
  atualizarStatusUnidades();
  atualizarPreviewEDuplicidade();
}

async function fillForm(product) {
  DOM.formInputs.type.value = product.type;
  sincronizarTypeSelector();
  DOM.formInputs.brand.value = product.brand;
  updateModelOptions();
  DOM.formInputs.model.value = product.model;
  DOM.formInputs.color.value = product.color || '';
  sincronizarColorPalette();
  DOM.formInputs.manufacture.value = product.manufacture;
  DOM.formInputs.price.value = formatPriceInput(product.price);
  DOM.formInputs.quantity.value = product.quantity;
  DOM.formInputs.notes.value = product.notes || '';
  limparUnidadesForm();
  toggleUnidadesSection();
  tipoAnteriorDoForm = product.type;

  if (product.type === 'aparelhos') {
    const unidadesPorProduto = await buscarUnidadesPorProdutos([product.id]);
    const unidadesExistentes = unidadesPorProduto[product.id] || [];
    unidadeIdsCarregadas = unidadesExistentes.map(u => u.id);
    unidadesExistentes.forEach(u => criarBlocoUnidade(u));
  }

  atualizarStatusUnidades();
  atualizarPreviewEDuplicidade();
}

async function startEditProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  editingId = id;
  await fillForm(product);
  document.getElementById('save-button').textContent = '↻ Atualizar produto';
  DOM.cancelEditBtn.classList.remove('hidden');
  changeTab('cadastro');
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const brand = DOM.formInputs.brand.value.trim();
  const model = DOM.formInputs.model.value.trim();
  const type = DOM.formInputs.type.value;
  const validModels = BRAND_MODELS[brand] || [];

  if (!brand) {
    showToast('❌ Selecione uma marca válida.', 'error');
    return;
  }

  if (!model || !validModels.includes(model)) {
    showToast(`❌ Selecione um modelo válido para ${brand}.`, 'error');
    return;
  }

  if (!DOM.formInputs.color.value) {
    showToast('❌ Selecione uma cor.', 'error');
    return;
  }

  const productData = {
    type,
    brand,
    model,
    color: DOM.formInputs.color.value.trim(),
    manufacture: DOM.formInputs.manufacture.value.trim(),
    price: parsePriceValue(DOM.formInputs.price.value),
    quantity: Number(DOM.formInputs.quantity.value),
    notes: DOM.formInputs.notes.value.trim(),
  };

  if (productData.price < 0 || productData.quantity < 0) {
    showToast('❌ Valores inválidos.', 'error');
    return;
  }

  let unidades = [];
  if (type === 'aparelhos') {
    unidades = coletarUnidadesDoForm();
    if (unidades === null) return;

    if (unidades.length !== productData.quantity) {
      atualizarStatusUnidades();
      const faltam = productData.quantity - unidades.length;
      if (faltam > 0) {
        showToast(`❌ Adicione mais ${faltam} ${pluralize(faltam, 'IMEI', 'IMEIs')} para completar a quantidade em estoque (${unidades.length} de ${productData.quantity} cadastrados).`, 'error');
      } else {
        const excedente = Math.abs(faltam);
        showToast(`❌ Você cadastrou ${unidades.length} IMEIs, mas a quantidade em estoque é ${productData.quantity}. Remova ${excedente} ${pluralize(excedente, 'unidade', 'unidades')} ou ajuste a quantidade.`, 'error');
      }
      return;
    }

    const imeis = unidades.map(u => u.imei);
    if (new Set(imeis).size !== imeis.length) {
      showToast('❌ Há IMEIs duplicados nesse formulário. Cada unidade precisa de um IMEI único.', 'error');
      return;
    }

    const duplicadosNoBanco = await verificarImeisDuplicados(imeis, editingId);
    if (duplicadosNoBanco.length) {
      showToast(`❌ IMEI já cadastrado em outro produto: ${duplicadosNoBanco[0]}.`, 'error');
      return;
    }
  }

  if (editingId) {
    const ok = await updateProductRow(editingId, productData);
    if (!ok) return;
    if (type === 'aparelhos') await salvarUnidades(editingId, unidades);
    showToast(`✅ ${brand} ${model} atualizado!`, 'success');
  } else {
    const created = await insertProduct(productData);
    if (!created) return;
    if (type === 'aparelhos') await salvarUnidades(created.id, unidades);
    showToast(`✅ ${brand} ${model} cadastrado!`, 'success');
  }

  await loadProducts();
  applyFilters();
  updateDashboard();
  resetForm();
}

// ============================================
// PRODUCT OPERATIONS
// ============================================

function deleteProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

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

  // registrar_venda (RPC, sql/008_movimentacoes_estoque.sql) faz o decremento de estoque e o
  // lançamento no livro-caixa como uma operação atômica só (select ... for update + insert),
  // evitando a corrida que existia aqui quando sellProduct fazia select e update em duas
  // chamadas separadas.
  const { data: movimentacao, error } = await supabaseClient.rpc('registrar_venda', {
    p_produto_id: id,
    p_quantidade: amount,
  });

  if (error) {
    showToast('❌ Erro ao registrar a venda.', 'error');
    return;
  }

  await loadProducts();
  applyFilters();
  updateDashboard();
  await atualizarAbaVendas();
  abrirModalRecibo(movimentacao, product);
}

// ============================================
// DASHBOARD
// ============================================

async function buscarTotalImeiImpedido() {
  const { count, error } = await supabaseClient
    .from('unidades_produto')
    .select('id', { count: 'exact', head: true })
    .eq('loja_id', lojaAtual.id)
    .eq('status_anatel', 'impedido');

  if (error) return 0;
  return count || 0;
}

function corVar(nomeVariavel, fallback) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nomeVariavel).trim();
  return valor || fallback;
}

function renderDashboardSkeleton() {
  [DOM.dashTotal, DOM.dashValue, DOM.dashVendasHoje, DOM.dashTicketMedio, DOM.dashImeiImpedido].forEach(el => {
    el.classList.add('loading');
  });
}

function animarContagem(elemento, valorFinal, formatar = (v) => Math.round(v).toString()) {
  elemento.classList.remove('loading');

  const duracaoMs = 650;
  const inicio = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracaoMs, 1);
    const facilitado = 1 - Math.pow(1 - progresso, 3);
    elemento.textContent = formatar(valorFinal * facilitado);
    if (progresso < 1) requestAnimationFrame(passo);
  }

  requestAnimationFrame(passo);
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

  const arc = (percent, offsetPercent, color) => {
    if (percent <= 0) return '';
    const length = (percent / 100) * circumference;
    const gap = circumference - length;
    const rotation = (offsetPercent / 100) * 360 - 90;
    return `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="${length} ${gap}" stroke-linecap="round" transform="rotate(${rotation} ${center} ${center})"></circle>`;
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
      <text x="${center}" y="${center - 2}" text-anchor="middle" class="vault-dial-value" fill="${dominante.cor}">${Math.round(dominante.pct)}%</text>
      <text x="${center}" y="${center + 20}" text-anchor="middle" class="vault-dial-caption" fill="${dominante.cor}">${dominante.label}</text>
    </svg>
  `;
}

function renderVaultDialLegend(container, { saudavel, baixo, zerado }) {
  const total = saudavel + baixo + zerado;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  container.innerHTML = `
    <div class="vault-dial-legend-item"><span class="vault-dial-dot" style="background:${corVar('--color-secondary', '#22D3C5')}"></span>Estoque saudável <strong>${pct(saudavel)}%</strong></div>
    <div class="vault-dial-legend-item"><span class="vault-dial-dot" style="background:${corVar('--color-warning', '#F5A623')}"></span>Estoque baixo <strong>${pct(baixo)}%</strong></div>
    <div class="vault-dial-legend-item"><span class="vault-dial-dot" style="background:${corVar('--color-danger', '#FF5C7A')}"></span>Sem estoque <strong>${pct(zerado)}%</strong></div>
  `;
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
          <span class="dashboard-brandlist-name">${marca}</span>
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
    .filter(p => p.quantity >= 1 && p.quantity <= 5)
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
      <span class="dashboard-lowstock-name">${p.brand} ${p.model}<span class="dashboard-lowstock-color">${p.color || ''}</span></span>
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

function renderAlertasCard(totalImeiImpedido) {
  const ativo = totalImeiImpedido > 0;

  DOM.dashboardAlertasCard.classList.toggle('dashboard-card-alertas--ativo', ativo);
  DOM.dashboardAlertasIconBox.classList.toggle('dashboard-card-icon-box--danger', ativo);
  DOM.dashboardAlertasIconBox.classList.toggle('dashboard-card-icon-box--neutro', !ativo);
  DOM.dashboardAlertasIconBox.innerHTML = ativo
    ? '<i class="ti ti-alert-triangle"></i>'
    : '<i class="ti ti-check"></i>';

  if (ativo) {
    DOM.dashImeiImpedido.classList.remove('hidden');
    animarContagem(DOM.dashImeiImpedido, totalImeiImpedido);
    DOM.dashboardAlertasSubtitle.textContent = `${pluralize(totalImeiImpedido, 'unidade')} com IMEI impedido — não negociar`;
  } else {
    DOM.dashImeiImpedido.classList.add('hidden');
    DOM.dashboardAlertasSubtitle.textContent = 'Tudo certo por aqui';
  }
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
    `Produto: ${produto.brand} ${produto.model}${produto.color ? ' - ' + produto.color : ''}`,
    `Quantidade: ${Math.abs(mov.quantidade)}`,
    `Preço unitário: ${formatCurrency(mov.preco_unitario)}`,
    `Total: ${formatCurrency(mov.total)}`,
    `Data: ${formatarDataHora(mov.created_at)}`,
  ].join('\n');
}

function abrirModalRecibo(mov, produto) {
  const texto = montarTextoRecibo(mov, produto);

  DOM.modalBody.innerHTML = `
    <h3 class="modal-title">✅ Venda registrada</h3>
    <div class="recibo-card">
      <div class="recibo-linha"><span>Produto</span><strong>${produto.brand} ${produto.model}</strong></div>
      <div class="recibo-linha"><span>Cor</span><strong>${produto.color || '-'}</strong></div>
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

  DOM.modalBackdrop.classList.add('active');
  DOM.modal.classList.add('active');
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
      ${chip.label}
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
      <span class="vendedor-avatar">${iniciais}</span>
      ${nomeExibicao}
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
      <td>${snap.brand || ''} ${snap.model || ''}</td>
      <td>${snap.color ? `<span class="table-color-dot" style="background:${CORES_MAPA[snap.color] || 'var(--bg-tertiary)'}"></span>${snap.color}` : '-'}</td>
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

async function updateDashboard() {
  const [totalImeiImpedido, vendasHojeEOntem, ticketMedio, vendas7dias] = await Promise.all([
    buscarTotalImeiImpedido(),
    buscarVendasHojeEOntem(),
    buscarTicketMedio(),
    buscarVendas7Dias(),
  ]);

  renderAlertasCard(totalImeiImpedido);
  animarContagem(DOM.dashVendasHoje, vendasHojeEOntem.hoje.quantidade);
  DOM.dashVendasHojeValor.textContent = formatCurrency(vendasHojeEOntem.hoje.valor);
  renderVendasHojeTrend(vendasHojeEOntem.hoje.valor, vendasHojeEOntem.ontem.valor);
  animarContagem(DOM.dashTicketMedio, ticketMedio, formatCurrency);
  renderVendas7DiasChart(vendas7dias);
  renderSparklinesKPI();

  const total = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStock = products.filter(p => p.quantity >= 1 && p.quantity <= 5).length;
  const zeroStock = products.filter(p => p.quantity === 0).length;
  const saudavel = Math.max(total - lowStock - zeroStock, 0);

  animarContagem(DOM.dashTotal, total);
  animarContagem(DOM.dashValue, totalValue, formatCurrency);
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
  cadastro: { titulo: 'Cadastro de produto', subtitulo: 'Adicione um novo item ao estoque' },
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
    <h3 class="modal-title">${titulo}</h3>
    <p class="modal-message">${mensagem}</p>
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

  DOM.modalBackdrop.classList.add('active');
  DOM.modal.classList.add('active');
}

function fecharModal() {
  DOM.modalContent.classList.add('closing');
  DOM.modalBackdrop.classList.remove('active');

  setTimeout(() => {
    DOM.modal.classList.remove('active');
    DOM.modalContent.classList.remove('closing');
  }, 150);
}

function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"></div>
    <div class="toast-message">${message}</div>
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
  return `<span class="badge-papel ${classe}">${PAPEL_LABELS[papel] || papel}</span>`;
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
            ${c.email}
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

  // Form
  DOM.productForm.addEventListener('submit', handleFormSubmit);
  DOM.cancelEditBtn.addEventListener('click', resetForm);
  DOM.formInputs.brand.addEventListener('change', () => {
    updateModelOptions();
    atualizarPreviewEDuplicidade();
  });
  DOM.formInputs.model.addEventListener('change', atualizarPreviewEDuplicidade);
  DOM.formInputs.color.addEventListener('change', atualizarPreviewEDuplicidade);
  DOM.formInputs.type.addEventListener('change', handleTypeChange);
  DOM.formInputs.quantity.addEventListener('input', atualizarStatusUnidades);
  DOM.unidadesContainer.addEventListener('input', atualizarStatusUnidades);
  DOM.addUnidadeBtn.addEventListener('click', () => criarBlocoUnidade());

  // Tipo (seletor visual) e Cor (paleta)
  DOM.typeOptions.forEach(btn => btn.addEventListener('click', () => selecionarTipo(btn.dataset.type)));
  DOM.colorPalette.addEventListener('click', (e) => {
    const btn = e.target.closest('.color-swatch-btn');
    if (btn) selecionarCor(btn.dataset.color);
  });

  // Quantidade (stepper +/-)
  DOM.quantityIncrement.addEventListener('click', () => {
    DOM.formInputs.quantity.value = (Number(DOM.formInputs.quantity.value) || 0) + 1;
    DOM.formInputs.quantity.dispatchEvent(new Event('input', { bubbles: true }));
  });
  DOM.quantityDecrement.addEventListener('click', () => {
    DOM.formInputs.quantity.value = Math.max((Number(DOM.formInputs.quantity.value) || 0) - 1, 0);
    DOM.formInputs.quantity.dispatchEvent(new Event('input', { bubbles: true }));
  });

  DOM.formInputs.price.addEventListener('focus', () => {
    const value = parsePriceValue(DOM.formInputs.price.value);
    DOM.formInputs.price.value = value ? value.toString().replace('.', ',') : '';
  });

  DOM.formInputs.price.addEventListener('blur', () => {
    DOM.formInputs.price.value = formatPriceInput(DOM.formInputs.price.value);
  });

  DOM.formInputs.price.addEventListener('input', atualizarPreview);

  // Filters - Stock
  [DOM.filterSearch, DOM.filterBrand, DOM.filterColor, DOM.filterStock].forEach(el => {
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
  renderColorPalette();
  initEventListeners();
  updateModelOptions();
  toggleUnidadesSection();
  sincronizarTypeSelector();
  sincronizarPapelSelector();
  atualizarStatusUnidades();
  atualizarPreview();
  aplicarModoLogin(false);
  moverIndicadorAtivo(document.querySelector('.nav-item.active')?.dataset.tab || 'dashboard');
  await iniciarSessao();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
