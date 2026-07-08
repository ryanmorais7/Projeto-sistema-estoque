// ============================================
// CONSTANTS & DATA
// ============================================

const LIMITE_ESTOQUE_BAIXO = 3;
const PAPEL_LABELS = {
  dono: 'Dono',
  vendedor: 'Vendedor',
  tecnico: 'Técnico',
  financeiro: 'Financeiro',
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

  // Equipe
  inviteForm: document.getElementById('invite-form'),
  inviteEmail: document.getElementById('invite-email'),
  invitePapel: document.getElementById('invite-papel'),
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

  // Unidades (IMEI)
  unidadesSection: document.getElementById('unidades-section'),
  unidadesContainer: document.getElementById('unidades-container'),
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
  filterBrand: document.getElementById('filter-brand'),
  filterColor: document.getElementById('filter-color'),
  filterStock: document.getElementById('filter-stock'),
  filterClearBtn: document.getElementById('clear-filters'),
  filterResultCount: document.getElementById('filter-result-count'),
  
  // Sales Filters
  filterSalesSearch: document.getElementById('filter-sales-search'),
  filterSalesBrand: document.getElementById('filter-sales-brand'),
  filterSalesClearBtn: document.getElementById('clear-sales-filters'),
  salesFilterResultCount: document.getElementById('sales-filter-result-count'),
  
  // Dashboard
  dashTotal: document.getElementById('dash-total'),
  dashValue: document.getElementById('dash-value'),
  dashLow: document.getElementById('dash-low'),
  dashZero: document.getElementById('dash-zero'),
  dashImeiImpedido: document.getElementById('dash-imei-impedido'),
  brandChartCanvas: document.getElementById('dashboard-brand-chart'),
  statusVendaChartCanvas: document.getElementById('dashboard-status-venda-chart'),
  top5ChartCanvas: document.getElementById('dashboard-top5-chart'),
  
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
let editingId = null;
let sortConfig = { field: null, direction: 'asc' };
let brandChartInstance = null;
let statusVendaChartInstance = null;
let top5ChartInstance = null;

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
    return;
  }

  products = data;
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
  const theme = saved || 'light';
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
  editar: '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"></path></svg>',
  excluir: '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>',
  unidades: '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
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

  row.querySelector('.product-type').textContent = product.type;
  row.querySelector('.product-name').innerHTML = `${product.brand} ${product.model}${temImeiImpedido ? ' ' + renderBadgeImeiAlerta() : ''}`;
  row.querySelector('.product-color').textContent = product.color;
  row.querySelector('.product-manufacture').textContent = product.manufacture;
  row.querySelector('.product-price').textContent = formatCurrency(product.price);
  row.querySelector('.product-quantity').innerHTML = renderBadgeEstoque(product.quantity);

  const actionsCell = row.querySelector('.product-actions');
  actionsCell.innerHTML = `
    ${product.type === 'aparelhos' ? `<button class="unidades-toggle-btn" title="Ver unidades / IMEI">${ICONES_ACAO.unidades}</button>` : ''}
    <button class="edit-btn" title="Editar produto">${ICONES_ACAO.editar}</button>
    <button class="delete-btn delete" title="Excluir produto">${ICONES_ACAO.excluir}</button>
  `;

  actionsCell.querySelector('.edit-btn').addEventListener('click', () => startEditProduct(product.id));
  actionsCell.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(product.id));

  return row;
}

function createUnidadesSubRow(unidadesDoProduto) {
  const tr = document.createElement('tr');
  tr.className = 'unidades-subrow';
  const td = document.createElement('td');
  td.colSpan = 7;
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
  row.querySelector('.sale-color').textContent = product.color;
  row.querySelector('.sale-stock').textContent = product.quantity;
  row.querySelector('.sale-price').textContent = formatCurrency(product.price);
  
  const qtyInput = row.querySelector('.sale-qty');
  qtyInput.max = product.quantity;
  
  const sellButton = row.querySelector('.sell-button');
  sellButton.textContent = '💳 Vender';
  sellButton.addEventListener('click', () => {
    const amount = Number(qtyInput.value) || 1;
    sellProduct(product.id, amount);
  });
  
  return row;
}

async function renderProductsTables() {
  DOM.productTableBody.innerHTML = '';
  DOM.salesTableBody.innerHTML = '';

  const idsAparelhos = filteredProducts.filter(p => p.type === 'aparelhos').map(p => p.id);
  const unidadesPorProduto = await buscarUnidadesPorProdutos(idsAparelhos);

  filteredProducts.forEach(product => {
    const unidadesDoProduto = unidadesPorProduto[product.id] || [];
    const row = createProductRow(product, unidadesDoProduto);
    DOM.productTableBody.appendChild(row);

    if (product.type === 'aparelhos') {
      const subRow = createUnidadesSubRow(unidadesDoProduto);
      DOM.productTableBody.appendChild(subRow);

      row.querySelector('.unidades-toggle-btn').addEventListener('click', (e) => {
        toggleUnidadesSubRow(subRow, e.currentTarget);
      });
    }

    DOM.salesTableBody.appendChild(createSalesRow(product));
  });

  updateFilterBrands();
  updateFilterResultCount();
  updateStockCount();
  updateEstoqueEmptyState();
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
  return product.brand.toLowerCase().includes(searchTerm) ||
         product.model.toLowerCase().includes(searchTerm) ||
         product.color.toLowerCase().includes(searchTerm);
}

function matchesStockFilter(quantity, filter) {
  if (!filter) return true;
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
  await renderProductsTables();
}

function clearAllFilters() {
  DOM.filterSearch.value = '';
  DOM.filterType.value = '';
  DOM.filterBrand.value = '';
  DOM.filterColor.value = '';
  DOM.filterStock.value = '';
  applyFilters();
}

function clearSalesFilters() {
  DOM.filterSalesSearch.value = '';
  DOM.filterSalesBrand.value = '';
  applyFilters();
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
  
  [DOM.filterResultCount, DOM.salesFilterResultCount].forEach(el => {
    el.textContent = text;
    el.classList.toggle('active', text !== '');
  });
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

function toggleUnidadesSection() {
  const ehAparelho = DOM.formInputs.type.value === 'aparelhos';
  DOM.unidadesSection.classList.toggle('hidden', !ehAparelho);
}

function criarBlocoUnidade() {
  const bloco = DOM.unidadeTemplate.content.cloneNode(true);
  bloco.querySelector('.unidade-remove-btn').addEventListener('click', (e) => {
    e.target.closest('.unidade-block').remove();
  });
  DOM.unidadesContainer.appendChild(bloco);
}

function limparUnidadesForm() {
  DOM.unidadesContainer.innerHTML = '';
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

async function inserirUnidades(produtoId, unidades) {
  if (!unidades.length) return true;

  const linhas = unidades.map(u => ({ ...u, produto_id: produtoId, loja_id: lojaAtual.id }));
  const { error } = await supabaseClient.from('unidades_produto').insert(linhas);

  if (error) {
    showToast('❌ Produto salvo, mas houve erro ao salvar as unidades com IMEI.', 'error');
    return false;
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

const STATUS_VENDA_LABELS = {
  disponivel: 'Disponível',
  vendido: 'Vendido',
  em_reparo: 'Em reparo',
  reservado: 'Reservado',
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
      <td>${STATUS_VENDA_LABELS[u.status_venda] || u.status_venda}</td>
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
}

function fillForm(product) {
  DOM.formInputs.type.value = product.type;
  DOM.formInputs.brand.value = product.brand;
  updateModelOptions();
  DOM.formInputs.model.value = product.model;
  DOM.formInputs.color.value = product.color || '';
  DOM.formInputs.manufacture.value = product.manufacture;
  DOM.formInputs.price.value = formatPriceInput(product.price);
  DOM.formInputs.quantity.value = product.quantity;
  DOM.formInputs.notes.value = product.notes || '';
  limparUnidadesForm();
  toggleUnidadesSection();
}

function startEditProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  editingId = id;
  fillForm(product);
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
  }

  if (editingId) {
    const ok = await updateProductRow(editingId, productData);
    if (!ok) return;
    if (unidades.length) await inserirUnidades(editingId, unidades);
    showToast(`✅ ${brand} ${model} atualizado!`, 'success');
  } else {
    const created = await insertProduct(productData);
    if (!created) return;
    if (unidades.length) await inserirUnidades(created.id, unidades);
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
  
  const novaQuantidade = product.quantity - amount;
  const ok = await updateProductRow(id, { quantity: novaQuantidade });
  if (!ok) return;

  await loadProducts();
  applyFilters();
  updateDashboard();
  showToast(`✅ ${amount}x ${product.brand} ${product.model} vendido!`, 'success');
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
  [DOM.dashTotal, DOM.dashValue, DOM.dashLow, DOM.dashZero, DOM.dashImeiImpedido].forEach(el => {
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

function renderBrandChart(brandCounts) {
  const marcas = Object.keys(brandCounts);
  const valores = Object.values(brandCounts);

  if (brandChartInstance) brandChartInstance.destroy();

  brandChartInstance = new Chart(DOM.brandChartCanvas, {
    type: 'doughnut',
    data: {
      labels: marcas,
      datasets: [{
        data: valores,
        backgroundColor: [corVar('--color-primary', '#6366f1'), corVar('--color-secondary', '#8b5cf6'), corVar('--color-success', '#10b981'), corVar('--color-warning', '#f59e0b'), corVar('--color-info', '#3b82f6'), corVar('--color-danger', '#ef4444')],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: corVar('--text-secondary', '#6b7280') } } },
    },
  });
}

async function buscarDistribuicaoStatusVenda() {
  const { data, error } = await supabaseClient
    .from('unidades_produto')
    .select('status_venda')
    .eq('loja_id', lojaAtual.id);
  if (error) return {};

  const contagem = {};
  data.forEach(u => {
    contagem[u.status_venda] = (contagem[u.status_venda] || 0) + 1;
  });
  return contagem;
}

function renderStatusVendaChart(contagem) {
  const chaves = Object.keys(contagem);
  const labels = chaves.map(k => STATUS_VENDA_LABELS[k] || k);
  const valores = Object.values(contagem);

  if (statusVendaChartInstance) statusVendaChartInstance.destroy();

  statusVendaChartInstance = new Chart(DOM.statusVendaChartCanvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: [corVar('--color-success', '#10b981'), corVar('--color-info', '#3b82f6'), corVar('--color-warning', '#f59e0b'), corVar('--color-neutral', '#475569')],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: corVar('--text-secondary', '#6b7280') } } },
    },
  });
}

function renderTop5Chart() {
  const top5 = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  if (top5ChartInstance) top5ChartInstance.destroy();

  top5ChartInstance = new Chart(DOM.top5ChartCanvas, {
    type: 'bar',
    data: {
      labels: top5.map(p => `${p.brand} ${p.model}`),
      datasets: [{
        label: 'Quantidade em estoque',
        data: top5.map(p => p.quantity),
        backgroundColor: corVar('--color-primary', '#6366f1'),
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
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
  const [totalImeiImpedido, statusVendaCounts] = await Promise.all([
    buscarTotalImeiImpedido(),
    buscarDistribuicaoStatusVenda(),
  ]);

  animarContagem(DOM.dashImeiImpedido, totalImeiImpedido);
  renderStatusVendaChart(statusVendaCounts);
  renderSparklinesKPI();

  if (!products.length) {
    animarContagem(DOM.dashTotal, 0);
    animarContagem(DOM.dashValue, 0, formatCurrency);
    animarContagem(DOM.dashLow, 0);
    animarContagem(DOM.dashZero, 0);
    renderBrandChart({});
    renderTop5Chart();
    return;
  }

  const total = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStock = products.filter(p => p.quantity >= 1 && p.quantity <= 5).length;
  const zeroStock = products.filter(p => p.quantity === 0).length;

  animarContagem(DOM.dashTotal, total);
  animarContagem(DOM.dashValue, totalValue, formatCurrency);
  animarContagem(DOM.dashLow, lowStock);
  animarContagem(DOM.dashZero, zeroStock);

  const brandCounts = {};
  products.forEach(p => {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  });

  renderBrandChart(brandCounts);
  renderTop5Chart();
}

// ============================================
// UI & NAVIGATION
// ============================================

function changeTab(tabId) {
  DOM.navItems.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
  DOM.panels.forEach(panel => panel.classList.toggle('active', panel.id === tabId));
  moverIndicadorAtivo(tabId);

  if (tabId === 'equipe') renderEquipe();

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

function atualizarCabecalhoLoja() {
  DOM.lojaAtualNome.textContent = lojaAtual ? lojaAtual.nome : '';
  DOM.userDisplay.textContent = usuarioAtual ? usuarioAtual.email : '';
}

function aplicarGatingDeModulos() {
  const tipo = lojaAtual?.tipo_negocio || 'ambos';
  const modulosRestritos = {
    cadastro: ['revenda', 'ambos'],
    estoque: ['revenda', 'ambos'],
    vendas: ['revenda', 'ambos'],
  };

  DOM.navItems.forEach(btn => {
    const tab = btn.dataset.tab;
    const permitido = !modulosRestritos[tab] || modulosRestritos[tab].includes(tipo);
    btn.classList.toggle('hidden', !permitido);
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
  return membroAtual?.papel === 'dono';
}

async function renderEquipe() {
  DOM.inviteForm.classList.toggle('hidden', !podeGerenciarEquipe());

  const membros = await buscarMembrosDaLoja(lojaAtual.id);
  DOM.equipeTableBody.innerHTML = '';

  membros.forEach(m => {
    const tr = document.createElement('tr');
    const desde = new Date(m.created_at).toLocaleDateString('pt-BR');
    tr.innerHTML = `
      <td>${m.email}</td>
      <td>${PAPEL_LABELS[m.papel] || m.papel}</td>
      <td>${desde}</td>
      <td></td>
    `;

    if (podeGerenciarEquipe() && m.usuario_id !== usuarioAtual.id) {
      const btnRemover = document.createElement('button');
      btnRemover.className = 'delete';
      btnRemover.title = 'Remover membro';
      btnRemover.innerHTML = ICONES_ACAO.excluir;
      btnRemover.addEventListener('click', () => removerMembroDaEquipe(m));
      tr.querySelector('td:last-child').appendChild(btnRemover);
    }

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

  // Sidebar
  DOM.menuToggle.addEventListener('click', toggleSidebar);
  DOM.sidebarClose.addEventListener('click', closeSidebar);
  DOM.navItems.forEach(btn => btn.addEventListener('click', () => changeTab(btn.dataset.tab)));

  // Form
  DOM.productForm.addEventListener('submit', handleFormSubmit);
  DOM.cancelEditBtn.addEventListener('click', resetForm);
  DOM.formInputs.brand.addEventListener('change', updateModelOptions);
  DOM.formInputs.type.addEventListener('change', toggleUnidadesSection);
  DOM.addUnidadeBtn.addEventListener('click', criarBlocoUnidade);

  DOM.formInputs.price.addEventListener('focus', () => {
    const value = parsePriceValue(DOM.formInputs.price.value);
    DOM.formInputs.price.value = value ? value.toString().replace('.', ',') : '';
  });
  
  DOM.formInputs.price.addEventListener('blur', () => {
    DOM.formInputs.price.value = formatPriceInput(DOM.formInputs.price.value);
  });
  
  // Filters - Stock
  [DOM.filterSearch, DOM.filterType, DOM.filterBrand, DOM.filterColor, DOM.filterStock].forEach(el => {
    el.addEventListener('change', applyFilters);
    el.addEventListener('input', applyFilters);
  });
  DOM.filterClearBtn.addEventListener('click', clearAllFilters);
  DOM.exportCsvBtn.addEventListener('click', exportarEstoqueCSV);

  // Ordenação da tabela
  DOM.sortableHeaders.forEach(th => {
    th.addEventListener('click', () => ordenarPor(th.dataset.sort));
  });

  // Filters - Sales
  DOM.filterSalesSearch.addEventListener('input', applyFilters);
  DOM.filterSalesBrand.addEventListener('change', applyFilters);
  DOM.filterSalesClearBtn.addEventListener('click', clearSalesFilters);
  
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
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
  loadTheme();
  initEventListeners();
  updateModelOptions();
  toggleUnidadesSection();
  aplicarModoLogin(false);
  moverIndicadorAtivo(document.querySelector('.nav-item.active')?.dataset.tab || 'dashboard');
  await iniciarSessao();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
