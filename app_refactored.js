// ============================================
// CONSTANTS & DATA
// ============================================

const STORAGE_KEY = 'invenstore-products';
const AUTH_KEY = 'invenstore-auth';

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
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  userDisplay: document.getElementById('user-display'),
  logoutButton: document.getElementById('logout-button'),
  themeToggle: document.getElementById('theme-toggle'),
  
  // Sidebar
  sidebar: document.getElementById('sidebar'),
  menuToggle: document.getElementById('menu-toggle'),
  sidebarClose: document.getElementById('sidebar-close'),
  navItems: document.querySelectorAll('.nav-item'),
  
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
    image: document.getElementById('image'),
    notes: document.getElementById('notes'),
    imagePreview: document.getElementById('image-preview'),
  },
  cancelEditBtn: document.getElementById('cancel-edit'),
  
  // Tables
  productTableBody: document.getElementById('product-table-body'),
  salesTableBody: document.getElementById('sales-table-body'),
  stockCountDisplay: document.getElementById('stock-count'),
  
  // Templates
  productRowTemplate: document.getElementById('product-row-template'),
  salesRowTemplate: document.getElementById('sales-row-template'),
  
  // Stock Filters
  filterSearch: document.getElementById('filter-search'),
  filterType: document.getElementById('filter-type'),
  filterBrand: document.getElementById('filter-brand'),
  filterModel: document.getElementById('filter-model'),
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
  stockChart: document.getElementById('stock-chart'),
  
  // Toast
  toastContainer: document.getElementById('toast-container'),
};

// ============================================
// STATE
// ============================================

let products = [];
let filteredProducts = [];
let editingId = null;
let currentUser = null;

// ============================================
// STORAGE & AUTH
// ============================================

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadProducts() {
  products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveTheme(theme) {
  localStorage.setItem('invenstore-theme', theme);
}

function loadTheme() {
  const saved = localStorage.getItem('invenstore-theme');
  const theme = saved || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}

function loadAuth() {
  const auth = localStorage.getItem(AUTH_KEY);
  return auth ? JSON.parse(auth) : null;
}

function saveAuth(username) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ username, timestamp: Date.now() }));
  currentUser = username;
}

function logoutAuth() {
  localStorage.removeItem(AUTH_KEY);
  currentUser = null;
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

function createProductRow(product) {
  const template = DOM.productRowTemplate.content.cloneNode(true);
  const row = template.querySelector('tr');
  
  row.querySelector('.product-type').textContent = product.type;
  const imageCell = row.querySelector('.product-image');
  if (product.image) {
    imageCell.innerHTML = `<img class="product-thumbnail" src="${product.image}" alt="${product.brand} ${product.model}" />`;
  } else {
    imageCell.innerHTML = '<span class="no-image">Sem imagem</span>';
  }
  row.querySelector('.product-name').textContent = `${product.brand} ${product.model}`;
  row.querySelector('.product-color').textContent = product.color;
  row.querySelector('.product-manufacture').textContent = product.manufacture;
  row.querySelector('.product-price').textContent = formatCurrency(product.price);
  row.querySelector('.product-quantity').textContent = product.quantity;
  
  const actionsCell = row.querySelector('.product-actions');
  actionsCell.innerHTML = `
    <input class="sell-qty" type="number" min="1" value="1" title="Qtd a vender" />
    <button class="delete-btn delete">🗑️ Remover</button>
    <button class="sell-btn">💳 Vender</button>
    <button class="edit-btn">✏️ Editar</button>
  `;
  
  const qtyInput = actionsCell.querySelector('.sell-qty');
  qtyInput.max = product.quantity;
  qtyInput.value = 1;

  actionsCell.querySelector('.sell-btn').addEventListener('click', () => {
    const amount = Number(qtyInput.value) || 1;
    sellProduct(product.id, amount);
  });
  actionsCell.querySelector('.edit-btn').addEventListener('click', () => startEditProduct(product.id));
  actionsCell.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(product.id));
  
  return row;
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

function renderProductsTables() {
  DOM.productTableBody.innerHTML = '';
  DOM.salesTableBody.innerHTML = '';
  
  filteredProducts.forEach(product => {
    DOM.productTableBody.appendChild(createProductRow(product));
    DOM.salesTableBody.appendChild(createSalesRow(product));
  });
  
  updateFilterBrands();
  updateFilterResultCount();
  updateStockCount();
}

function updateStockCount() {
  const count = products.length;
  DOM.stockCountDisplay.textContent = `${count} ${pluralize(count, 'produto')} ${pluralize(count, 'cadastrado')}`;
}

function renderDashboardCharts() {
  renderStockChart();
}

function createChartBar(label, value, max, colorClass = '') {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return `
    <div class="dashboard-bar ${colorClass}">
      <div class="dashboard-bar-label">${label}</div>
      <div class="dashboard-bar-track">
        <div class="dashboard-bar-fill" style="width: ${percentage}%;"></div>
      </div>
      <div class="dashboard-bar-value">${value}</div>
    </div>
  `;
}

function renderStockChart() {
  if (!DOM.stockChart) return;
  const zeroStock = products.filter(p => p.quantity === 0).length;
  const lowStock = products.filter(p => p.quantity >= 1 && p.quantity <= 5).length;
  const mediumStock = products.filter(p => p.quantity >= 6 && p.quantity <= 20).length;
  const highStock = products.filter(p => p.quantity > 20).length;
  const max = Math.max(zeroStock, lowStock, mediumStock, highStock, 1);

  DOM.stockChart.innerHTML = `
    ${createChartBar('Sem estoque', zeroStock, max)}
    ${createChartBar('Baixo', lowStock, max)}
    ${createChartBar('Médio', mediumStock, max)}
    ${createChartBar('Alto', highStock, max)}
  `;
}

// `renderTypeChart` removed — feature deprecated per user request

// ============================================
// FILTERING
// ============================================

function getFilterValues() {
  return {
    search: DOM.filterSearch.value.toLowerCase(),
    type: DOM.filterType.value,
    brand: DOM.filterBrand.value,
    model: DOM.filterModel.value,
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

function matchesModelFilter(productModel, filter) {
  return !filter || productModel === filter;
}

function filterProducts() {
  const { search, type, brand, model, color, stock } = getFilterValues();
  
  return products.filter(product =>
    matchesSearchTerm(product, search) &&
    (!type || product.type === type) &&
    (!brand || product.brand === brand) &&
    matchesModelFilter(product.model, model) &&
    (!color || product.color === color) &&
    matchesStockFilter(product.quantity, stock)
  );
}

function applyFilters() {
  filteredProducts = filterProducts();
  renderProductsTables();
}

function clearAllFilters() {
  DOM.filterSearch.value = '';
  DOM.filterType.value = '';
  DOM.filterBrand.value = '';
  DOM.filterModel.value = '';
  DOM.filterColor.value = '';
  DOM.filterStock.value = '';
  applyFilters();
}

function clearSalesFilters() {
  DOM.filterSalesSearch.value = '';
  DOM.filterSalesBrand.value = '';
  applyFilters();
}

function getUniqueModels(brand = '') {
  const list = brand ? products.filter(p => p.brand === brand) : products;
  return [...new Set(list.map(p => p.model))].sort();
}

function updateFilterBrands() {
  const brands = getUniqueBrands();
  const models = getUniqueModels(DOM.filterBrand.value);
  
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

  const currentModel = DOM.filterModel.value;
  DOM.filterModel.innerHTML = '<option value="">Todos</option>';
  models.forEach(model => {
    const opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    DOM.filterModel.appendChild(opt);
  });
  DOM.filterModel.value = currentModel;
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
// FORM OPERATIONS
// ============================================

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem'));
    reader.readAsDataURL(file);
  });
}

function updateImagePreview() {
  const file = DOM.formInputs.image.files[0];
  if (file) {
    DOM.formInputs.imagePreview.classList.remove('hidden');
    DOM.formInputs.imagePreview.classList.add('skeleton');
    readImageFileAsDataUrl(file).then(src => {
      DOM.formInputs.imagePreview.src = src;
      DOM.formInputs.imagePreview.classList.remove('skeleton');
      DOM.formInputs.imagePreview.classList.remove('hidden');
    }).catch(() => {
      DOM.formInputs.imagePreview.src = '';
      DOM.formInputs.imagePreview.classList.remove('skeleton');
      DOM.formInputs.imagePreview.classList.add('hidden');
    });
  } else {
    DOM.formInputs.imagePreview.src = '';
    DOM.formInputs.imagePreview.classList.remove('skeleton');
    DOM.formInputs.imagePreview.classList.add('hidden');
  }
}

function showSkeletonRows(count = 6) {
  if (DOM.productTableBody) {
    DOM.productTableBody.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div class="skeleton-line" style="width:60%"></div></td>
        <td><div class="skeleton-thumbnail"></div></td>
        <td><div class="skeleton-line" style="width:50%"></div></td>
        <td><div class="skeleton-line" style="width:40%"></div></td>
        <td><div class="skeleton-line" style="width:35%"></div></td>
        <td><div class="skeleton-line" style="width:20%"></div></td>
        <td><div class="skeleton-line" style="width:80%"></div></td>
      `;
      DOM.productTableBody.appendChild(tr);
    }
  }

  if (DOM.salesTableBody) {
    DOM.salesTableBody.innerHTML = '';
    for (let i = 0; i < Math.min(count, 4); i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div class="skeleton-line" style="width:60%"></div></td>
        <td><div class="skeleton-line" style="width:40%"></div></td>
        <td><div class="skeleton-line" style="width:20%"></div></td>
        <td><div class="skeleton-line" style="width:30%"></div></td>
        <td><div class="skeleton-line" style="width:20%"></div></td>
        <td><div class="skeleton-line" style="width:40%"></div></td>
      `;
      DOM.salesTableBody.appendChild(tr);
    }
  }
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
  DOM.formInputs.imagePreview.src = '';
  DOM.formInputs.imagePreview.classList.add('hidden');
  editingId = null;
  DOM.cancelEditBtn.classList.add('hidden');
  document.getElementById('save-button').textContent = '✓ Salvar produto';
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
  DOM.formInputs.image.value = '';
  if (product.image) {
    DOM.formInputs.imagePreview.src = product.image;
    DOM.formInputs.imagePreview.classList.remove('hidden');
  } else {
    DOM.formInputs.imagePreview.src = '';
    DOM.formInputs.imagePreview.classList.add('hidden');
  }
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
  const validModels = BRAND_MODELS[brand] || [];
  
  if (!brand) {
    showToast('❌ Selecione uma marca válida.', 'error');
    return;
  }
  
  if (!model || !validModels.includes(model)) {
    showToast(`❌ Selecione um modelo válido para ${brand}.`, 'error');
    return;
  }
  
  const imageFile = DOM.formInputs.image.files[0];
  let imageData = '';

  if (imageFile) {
    imageData = await readImageFileAsDataUrl(imageFile);
  } else if (editingId) {
    const existing = products.find(p => p.id === editingId);
    imageData = existing ? existing.image || '' : '';
  }

  const newProduct = {
    id: editingId || Date.now().toString(),
    type: DOM.formInputs.type.value,
    brand,
    model,
    color: DOM.formInputs.color.value.trim(),
    manufacture: DOM.formInputs.manufacture.value.trim(),
    price: parsePriceValue(DOM.formInputs.price.value),
    quantity: Number(DOM.formInputs.quantity.value),
    image: imageData,
    notes: DOM.formInputs.notes.value.trim(),
  };
  
  if (newProduct.price < 0 || newProduct.quantity < 0) {
    showToast('❌ Valores inválidos.', 'error');
    return;
  }
  
  if (editingId) {
    products = products.map(p => p.id === editingId ? newProduct : p);
    showToast(`✅ ${brand} ${model} atualizado!`, 'success');
  } else {
    products.unshift(newProduct);
    showToast(`✅ ${brand} ${model} cadastrado!`, 'success');
  }
  
  saveProducts();
  applyFilters();
  updateDashboard();
  resetForm();
}

// ============================================
// PRODUCT OPERATIONS
// ============================================

function deleteProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product || !confirm(`Remover ${product.brand} ${product.model}?`)) return;
  
  products = products.filter(p => p.id !== id);
  saveProducts();
  applyFilters();
  updateDashboard();
  showToast(`✅ Produto removido.`, 'success');
}

function sellProduct(id, amount) {
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
  
  product.quantity -= amount;
  saveProducts();
  applyFilters();
  updateDashboard();
  showToast(`✅ ${amount}x ${product.brand} ${product.model} vendido!`, 'success');
}

// ============================================
// DASHBOARD
// ============================================

function updateDashboard() {
  if (!products.length) {
    DOM.dashTotal.textContent = '0';
    DOM.dashValue.textContent = 'R$ 0,00';
    DOM.dashLow.textContent = '0';
    DOM.dashZero.textContent = '0';
    if (DOM.stockChart) DOM.stockChart.innerHTML = '<div class="dashboard-bar-label">Nenhum produto cadastrado.</div>';
    return;
  }
  
  const total = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStock = products.filter(p => p.quantity >= 1 && p.quantity <= 5).length;
  const zeroStock = products.filter(p => p.quantity === 0).length;
  
  DOM.dashTotal.textContent = total;
  DOM.dashValue.textContent = formatCurrency(totalValue);
  DOM.dashLow.textContent = lowStock;
  DOM.dashZero.textContent = zeroStock;
  
  renderDashboardCharts();
}

// ============================================
// UI & NAVIGATION
// ============================================

function changeTab(tabId) {
  DOM.navItems.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
  DOM.panels.forEach(panel => panel.classList.toggle('active', panel.id === tabId));

  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  if (window.innerWidth <= 760) {
    DOM.sidebar.classList.remove('active');
  }
}

function toggleSidebar() {
  DOM.sidebar.classList.toggle('active');
}

function closeSidebar() {
  DOM.sidebar.classList.remove('active');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  saveTheme(newTheme);
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
// AUTH
// ============================================

function handleLogin(event) {
  event.preventDefault();
  
  const username = DOM.loginUsername.value.trim();
  const password = DOM.loginPassword.value.trim();
  
  if (!username || !password) {
    showToast('Preencha usuário e senha', 'error');
    return;
  }
  
  if (username === 'admin' && password === '1234') {
    saveAuth(username);
    DOM.userDisplay.textContent = username;
    DOM.loginScreen.classList.add('hidden');
    DOM.appContainer.classList.remove('hidden');
    showToast(`Bem-vindo, ${username}!`, 'success');
  } else {
    showToast('Usuário ou senha inválidos', 'error');
    DOM.loginPassword.value = '';
  }
}

function handleLogout() {
  if (confirm('Tem certeza que deseja sair?')) {
    logoutAuth();
    DOM.loginScreen.classList.remove('hidden');
    DOM.appContainer.classList.add('hidden');
    DOM.loginForm.reset();
    showToast('Até logo!', 'info');
  }
}

function checkAuth() {
  const auth = loadAuth();
  if (auth) {
    currentUser = auth.username;
    DOM.userDisplay.textContent = auth.username;
    DOM.loginScreen.classList.add('hidden');
    DOM.appContainer.classList.remove('hidden');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
  // Auth
  DOM.loginForm.addEventListener('submit', handleLogin);
  DOM.logoutButton.addEventListener('click', handleLogout);
  DOM.themeToggle.addEventListener('click', toggleTheme);
  
  // Sidebar
  DOM.menuToggle.addEventListener('click', toggleSidebar);
  DOM.sidebarClose.addEventListener('click', closeSidebar);
  DOM.navItems.forEach(btn => btn.addEventListener('click', () => changeTab(btn.dataset.tab)));
  
  // Form
  DOM.productForm.addEventListener('submit', handleFormSubmit);
  DOM.cancelEditBtn.addEventListener('click', resetForm);
  DOM.formInputs.brand.addEventListener('change', updateModelOptions);
  DOM.formInputs.image.addEventListener('change', updateImagePreview);
  
  DOM.formInputs.price.addEventListener('focus', () => {
    const value = parsePriceValue(DOM.formInputs.price.value);
    DOM.formInputs.price.value = value ? value.toString().replace('.', ',') : '';
  });
  
  DOM.formInputs.price.addEventListener('blur', () => {
    DOM.formInputs.price.value = formatPriceInput(DOM.formInputs.price.value);
  });
  
  // Filters - Stock
  [DOM.filterSearch, DOM.filterType, DOM.filterBrand, DOM.filterModel, DOM.filterColor, DOM.filterStock].forEach(el => {
    el.addEventListener('change', applyFilters);
    el.addEventListener('input', applyFilters);
  });
  DOM.filterClearBtn.addEventListener('click', clearAllFilters);
  
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
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  loadTheme();
  checkAuth();
  loadProducts();
  initEventListeners();
  updateModelOptions();
  applyFilters();
  updateDashboard();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
