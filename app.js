const STORAGE_KEY = 'invenstore-products';

const BRAND_MODELS = {
  'Apple': [
    'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
    'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
    'iPhone 13', 'iPhone 13 mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
    'iPhone 12', 'iPhone 12 mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
    'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max'
  ],
  'Samsung': [
    'Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra',
    'Galaxy S23', 'Galaxy S23+', 'Galaxy S23 Ultra',
    'Galaxy S22', 'Galaxy S22+', 'Galaxy S22 Ultra',
    'Galaxy A54', 'Galaxy A53', 'Galaxy A52', 'Galaxy A51',
    'Galaxy Z Fold 6', 'Galaxy Z Flip 6'
  ],
  'Xiaomi': [
    'Xiaomi 14', 'Xiaomi 14 Ultra', 'Xiaomi 14 Pro',
    'Xiaomi 13', 'Xiaomi 13 Ultra', 'Xiaomi 13 Pro',
    'Xiaomi 12', 'Xiaomi 12 Pro', 'Xiaomi 12 Ultra',
    'Redmi Note 13 Pro', 'Redmi Note 13', 'Redmi Note 12 Pro',
    'Redmi 12', 'Redmi 11'
  ],
  'Motorola': [
    'Edge 50 Pro', 'Edge 50', 'Edge 50 Fusion',
    'Edge 40', 'Edge 40 Pro', 'Edge 40 Fusion',
    'Moto G54', 'Moto G53', 'Moto G52',
    'Razr 40', 'Razr 50'
  ],
  'LG': [
    'LG G9', 'LG V50', 'LG V60', 'LG Wing',
    'LG Velvet', 'LG K42', 'LG K52'
  ],
  'Huawei': [
    'Huawei P60', 'Huawei P60 Pro', 'Huawei P50 Pro',
    'Huawei Mate 60 Pro', 'Huawei Mate 50 Pro',
    'Huawei Nova 11 Pro', 'Huawei Nova 10 Pro'
  ],
  'OnePlus': [
    'OnePlus 12', 'OnePlus 12 Pro', 'OnePlus 11 Pro',
    'OnePlus 11', 'OnePlus 10 Pro', 'OnePlus 10',
    'OnePlus Nord 3', 'OnePlus Nord 2'
  ],
  'TCL': [
    'TCL 30 Ultra', 'TCL 40 Ultra', 'TCL 50 Pro',
    'TCL Fold', 'TCL 30'
  ],
  'Nokia': [
    'Nokia G60', 'Nokia G50', 'Nokia G40',
    'Nokia X30', 'Nokia X20', 'Nokia C3'
  ],
  'Realme': [
    'Realme 13 Pro', 'Realme 12 Pro', 'Realme 12',
    'Realme 11 Pro', 'Realme 11', 'Realme 10 Pro',
    'Realme GT 6', 'Realme GT 5 Pro'
  ],
  'Vivo': [
    'Vivo X100 Pro', 'Vivo X100', 'Vivo X90 Pro+',
    'Vivo X90 Pro', 'Vivo X80 Pro', 'Vivo V29 Pro',
    'Vivo Y200', 'Vivo Y100'
  ],
  'Oppo': [
    'Oppo Find X8 Pro', 'Oppo Find X8', 'Oppo Find X7',
    'Oppo Reno 11 Pro', 'Oppo Reno 11', 'Oppo A79',
    'Oppo A78'
  ],
  'Sony': [
    'Sony Xperia 1 VI', 'Sony Xperia 1 V', 'Sony Xperia 5 V',
    'Sony Xperia 10 V', 'Sony Xperia 1 IV', 'Sony Xperia Pro'
  ],
  'Google Pixel': [
    'Pixel 9 Pro', 'Pixel 9 Pro XL', 'Pixel 9 Pro Fold',
    'Pixel 9', 'Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7'
  ],
  'Outro': ['Modelo personalizado']
};

const elements = {
  sidebar: document.getElementById('sidebar'),
  menuToggle: document.getElementById('menu-toggle'),
  sidebarClose: document.getElementById('sidebar-close'),
  navItems: document.querySelectorAll('.nav-item'),
  panels: document.querySelectorAll('.tab-panel'),
  form: document.getElementById('product-form'),
  inputs: {
    type: document.getElementById('type'),
    brand: document.getElementById('brand'),
    model: document.getElementById('model'),
    color: document.getElementById('color'),
    manufacture: document.getElementById('manufacture'),
    price: document.getElementById('price'),
    quantity: document.getElementById('quantity'),
    notes: document.getElementById('notes'),
  },
  cancelEdit: document.getElementById('cancel-edit'),
  tableBody: document.getElementById('product-table-body'),
  salesBody: document.getElementById('sales-table-body'),
  stockCount: document.getElementById('stock-count'),
  productRowTemplate: document.getElementById('product-row-template'),
  salesRowTemplate: document.getElementById('sales-row-template'),
  // Filtros Estoque
  filterSearch: document.getElementById('filter-search'),
  filterType: document.getElementById('filter-type'),
  filterBrand: document.getElementById('filter-brand'),
  filterColor: document.getElementById('filter-color'),
  filterStock: document.getElementById('filter-stock'),
  clearFilters: document.getElementById('clear-filters'),
  filterResultCount: document.getElementById('filter-result-count'),
  // Filtros Vendas
  filterSalesSearch: document.getElementById('filter-sales-search'),
  filterSalesBrand: document.getElementById('filter-sales-brand'),
  clearSalesFilters: document.getElementById('clear-sales-filters'),
  salesFilterResultCount: document.getElementById('sales-filter-result-count'),
};

let products = [];
let editingId = null;
let filteredProducts = [];

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  products = saved ? JSON.parse(saved) : [];
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function createProductRow(product) {
  const template = elements.productRowTemplate.content.cloneNode(true);
  const row = template.querySelector('tr');
  row.querySelector('.product-type').textContent = product.type;
  row.querySelector('.product-name').textContent = `${product.brand} ${product.model}`;
  row.querySelector('.product-color').textContent = product.color;
  row.querySelector('.product-manufacture').textContent = product.manufacture;
  row.querySelector('.product-price').textContent = formatCurrency(product.price);
  row.querySelector('.product-quantity').textContent = product.quantity;

  const actionsCell = row.querySelector('.product-actions');
  const editButton = document.createElement('button');
  editButton.textContent = '✏️ Editar';
  editButton.addEventListener('click', () => startEditProduct(product.id));
  const deleteButton = document.createElement('button');
  deleteButton.textContent = '🗑️ Remover';
  deleteButton.classList.add('delete');
  deleteButton.addEventListener('click', () => deleteProduct(product.id));

  actionsCell.append(editButton, deleteButton);

  return row;
}

function createSalesRow(product) {
  const template = elements.salesRowTemplate.content.cloneNode(true);
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

function renderProducts() {
  elements.tableBody.innerHTML = '';
  elements.salesBody.innerHTML = '';

  filteredProducts = filterProducts();
  
  filteredProducts.forEach((product) => {
    elements.tableBody.appendChild(createProductRow(product));
    elements.salesBody.appendChild(createSalesRow(product));
  });

  updateFilterBrands();
  updateFilterResultCount();
  elements.stockCount.textContent = `${products.length} produto${products.length === 1 ? '' : 's'} cadastrad${products.length === 1 ? 'o' : 'os'}`;
}

function filterProducts() {
  return products.filter(product => {
    const searchTerm = elements.filterSearch.value.toLowerCase();
    const typeFilter = elements.filterType.value;
    const brandFilter = elements.filterBrand.value;
    const colorFilter = elements.filterColor.value;
    const stockFilter = elements.filterStock.value;

    const matchesSearch = !searchTerm || 
      product.brand.toLowerCase().includes(searchTerm) ||
      product.model.toLowerCase().includes(searchTerm) ||
      product.color.toLowerCase().includes(searchTerm);

    const matchesType = !typeFilter || product.type === typeFilter;
    const matchesBrand = !brandFilter || product.brand === brandFilter;
    const matchesColor = !colorFilter || product.color === colorFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = product.quantity >= 1 && product.quantity <= 5;
    else if (stockFilter === 'medium') matchesStock = product.quantity >= 6 && product.quantity <= 20;
    else if (stockFilter === 'high') matchesStock = product.quantity > 20;

    return matchesSearch && matchesType && matchesBrand && matchesColor && matchesStock;
  });
}

function updateFilterBrands() {
  const uniqueBrands = [...new Set(products.map(p => p.brand))].sort();
  const currentValue = elements.filterBrand.value;
  
  elements.filterBrand.innerHTML = '<option value="">Todas</option>';
  uniqueBrands.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    elements.filterBrand.appendChild(option);
  });
  elements.filterBrand.value = currentValue;

  // Atualizar select de marcas das vendas
  const currentSalesValue = elements.filterSalesBrand.value;
  elements.filterSalesBrand.innerHTML = '<option value="">Todas</option>';
  uniqueBrands.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    elements.filterSalesBrand.appendChild(option);
  });
  elements.filterSalesBrand.value = currentSalesValue;
}

function updateFilterResultCount() {
  const count = filteredProducts.length;
  const total = products.length;
  
  if (count < total && count > 0) {
    elements.filterResultCount.textContent = `${count} de ${total} produtos`;
    elements.filterResultCount.classList.add('active');
    elements.salesFilterResultCount.textContent = `${count} de ${total} produtos`;
    elements.salesFilterResultCount.classList.add('active');
  } else if (count === 0 && total > 0) {
    elements.filterResultCount.textContent = 'Nenhum produto encontrado';
    elements.filterResultCount.classList.add('active');
    elements.salesFilterResultCount.textContent = 'Nenhum produto encontrado';
    elements.salesFilterResultCount.classList.add('active');
  } else {
    elements.filterResultCount.classList.remove('active');
    elements.salesFilterResultCount.classList.remove('active');
  }
}

function clearAllFilters() {
  elements.filterSearch.value = '';
  elements.filterType.value = '';
  elements.filterBrand.value = '';
  elements.filterColor.value = '';
  elements.filterStock.value = '';
  renderProducts();
}

function clearSalesFilters() {
  elements.filterSalesSearch.value = '';
  elements.filterSalesBrand.value = '';
  renderProducts();
}

function resetForm() {
  elements.form.reset();
  editingId = null;
  elements.saveButton?.setAttribute('disabled', false);
  elements.cancelEdit.classList.add('hidden');
  document.getElementById('save-button').textContent = 'Salvar produto';
}

function fillForm(product) {
  elements.inputs.type.value = product.type;
  elements.inputs.brand.value = product.brand;
  updateModelOptions();
  elements.inputs.model.value = product.model;
  elements.inputs.color.value = product.color || '';
  elements.inputs.manufacture.value = product.manufacture;
  elements.inputs.price.value = formatPriceInput(product.price);
  elements.inputs.quantity.value = product.quantity;
  elements.inputs.notes.value = product.notes || '';
}

function startEditProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  editingId = id;
  fillForm(product);
  document.getElementById('save-button').textContent = 'Atualizar produto';
  elements.cancelEdit.classList.remove('hidden');
  changeTab('cadastro');
}

function deleteProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!confirm(`🗑️ Tem certeza que deseja remover este produto?\n\n${product.brand} ${product.model}`)) {
    return;
  }

  products = products.filter((item) => item.id !== id);
  saveProducts();
  renderProducts();
  updateDashboard();
  showToast(`✅ Produto ${product.brand} ${product.model} removido do estoque.`, 'success');
}

function sellProduct(id, amount) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  if (amount < 1) {
    showToast('⚠️ Informe uma quantidade válida para venda.', 'warning');
    return;
  }

  if (amount > product.quantity) {
    showToast('❌ Quantidade maior que o estoque disponível.', 'error');
    return;
  }

  product.quantity -= amount;
  saveProducts();
  renderProducts();
  updateDashboard();
  showToast(`✅ ${amount}x ${product.brand} ${product.model} vendido! Total: ${formatCurrency(product.price * amount)}`, 'success');
}

function handleSubmit(event) {
  event.preventDefault();

  const selectedBrand = elements.inputs.brand.value.trim();
  const selectedModel = elements.inputs.model.value.trim();
  const validModels = BRAND_MODELS[selectedBrand] || [];

  if (!selectedBrand) {
    showToast('❌ Selecione uma marca válida.', 'error');
    return;
  }

  if (!selectedModel) {
    showToast('❌ Selecione um modelo válido para a marca selecionada.', 'error');
    return;
  }

  if (!validModels.includes(selectedModel)) {
    showToast(`❌ Erro: O modelo "${selectedModel}" não existe para ${selectedBrand}.`, 'error');
    return;
  }

  const newProduct = {
    id: editingId || Date.now().toString(),
    type: elements.inputs.type.value,
    brand: selectedBrand,
    model: selectedModel,
    color: elements.inputs.color.value.trim(),
    manufacture: elements.inputs.manufacture.value.trim(),
    price: parsePriceValue(elements.inputs.price.value),
    quantity: Number(elements.inputs.quantity.value),
    notes: elements.inputs.notes.value.trim(),
  };

  if (!newProduct.brand || !newProduct.model || newProduct.price < 0 || newProduct.quantity < 0) {
    showToast('❌ Preencha todos os campos obrigatórios corretamente.', 'error');
    return;
  }

  if (editingId) {
    products = products.map((item) => (item.id === editingId ? newProduct : item));
    showToast(`✅ Produto ${newProduct.brand} ${newProduct.model} atualizado!`, 'success');
  } else {
    products.unshift(newProduct);
    showToast(`✅ Produto ${newProduct.brand} ${newProduct.model} cadastrado com sucesso!`, 'success');
  }

  saveProducts();
  renderProducts();
  updateDashboard();
  resetForm();
}

function changeTab(tabId) {
  elements.navItems.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tabId);
  });
  elements.panels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === tabId);
  });
  
  // Fechar sidebar no mobile após selecionar aba
  if (window.innerWidth <= 760) {
    elements.sidebar.classList.remove('active');
  }
}

function toggleSidebar() {
  elements.sidebar.classList.toggle('active');
}

function closeSidebar() {
  elements.sidebar.classList.remove('active');
}

function updateModelOptions() {
  const selectedBrand = elements.inputs.brand.value;
  const models = BRAND_MODELS[selectedBrand] || [];
  
  elements.inputs.model.innerHTML = '';
  
  if (!selectedBrand || models.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '-- Selecione a marca primeiro --';
    option.selected = true;
    elements.inputs.model.appendChild(option);
    elements.inputs.model.disabled = true;
  } else {
    elements.inputs.model.disabled = false;
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `-- Selecione um modelo de ${selectedBrand} --`;
    defaultOption.selected = true;
    elements.inputs.model.appendChild(defaultOption);
    
    models.forEach((model) => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      elements.inputs.model.appendChild(option);
    });
  }
}

function initEvents() {
  elements.navItems.forEach((button) => {
    button.addEventListener('click', () => changeTab(button.dataset.tab));
  });

  elements.menuToggle.addEventListener('click', toggleSidebar);
  elements.sidebarClose.addEventListener('click', closeSidebar);

  elements.form.addEventListener('submit', handleSubmit);
  elements.cancelEdit.addEventListener('click', resetForm);

  elements.inputs.brand.addEventListener('change', updateModelOptions);

  elements.inputs.price.addEventListener('focus', () => {
    const value = parsePriceValue(elements.inputs.price.value);
    elements.inputs.price.value = value ? value.toString().replace('.', ',') : '';
  });

  elements.inputs.price.addEventListener('blur', () => {
    elements.inputs.price.value = formatPriceInput(elements.inputs.price.value);
  });

  // Event listeners para filtros
  elements.filterSearch.addEventListener('input', () => renderProducts());
  elements.filterType.addEventListener('change', () => renderProducts());
  elements.filterBrand.addEventListener('change', () => renderProducts());
  elements.filterColor.addEventListener('change', () => renderProducts());
  elements.filterStock.addEventListener('change', () => renderProducts());
  elements.clearFilters.addEventListener('click', clearAllFilters);

  elements.filterSalesSearch.addEventListener('input', () => {
    const searchTerm = elements.filterSalesSearch.value.toLowerCase();
    const salesFiltered = products.filter(p => 
      p.brand.toLowerCase().includes(searchTerm) ||
      p.model.toLowerCase().includes(searchTerm) ||
      p.color.toLowerCase().includes(searchTerm)
    );
    renderSalesTable(salesFiltered);
  });

  elements.filterSalesBrand.addEventListener('change', () => {
    const brand = elements.filterSalesBrand.value;
    const salesFiltered = brand 
      ? products.filter(p => p.brand === brand)
      : products;
    renderSalesTable(salesFiltered);
  });

  elements.clearSalesFilters.addEventListener('click', clearSalesFilters);

  // Fechar sidebar ao clicar fora dela no mobile
  document.addEventListener('click', (event) => {
    if (window.innerWidth <= 760) {
      const isClickOnSidebar = elements.sidebar.contains(event.target);
      const isClickOnToggle = elements.menuToggle.contains(event.target);
      
      if (!isClickOnSidebar && !isClickOnToggle && elements.sidebar.classList.contains('active')) {
        closeSidebar();
      }
    }
  });
}

function renderSalesTable(productsToShow) {
  elements.salesBody.innerHTML = '';
  productsToShow.forEach((product) => {
    elements.salesBody.appendChild(createSalesRow(product));
  });
  
  const count = productsToShow.length;
  const total = products.length;
  
  if (count < total && count > 0) {
    elements.salesFilterResultCount.textContent = `${count} de ${total} produtos`;
    elements.salesFilterResultCount.classList.add('active');
  } else if (count === 0 && total > 0) {
    elements.salesFilterResultCount.textContent = 'Nenhum produto encontrado';
    elements.salesFilterResultCount.classList.add('active');
  } else {
    elements.salesFilterResultCount.classList.remove('active');
  }
}

function init() {
  initEvents();
  updateModelOptions();
  loadProducts();
  renderProducts();
  updateDashboard();
}

init();
function parsePriceValue(value) {
  const cleaned = value.replace(/\s/g, '').replace(/R\$\s?/, '').replace(/\./g, '').replace(/,/g, '.');
  return Number(cleaned) || 0;
}

function formatPriceInput(value) {
  if (value === '' || value === null || value === undefined) return '';
  const numberValue = typeof value === 'number' ? value : parsePriceValue(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
}

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"></div>
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

function updateDashboard() {
  if (products.length === 0) {
    document.getElementById('dash-total').textContent = '0';
    document.getElementById('dash-value').textContent = 'R$ 0,00';
    document.getElementById('dash-low').textContent = '0';
    document.getElementById('dash-zero').textContent = '0';
    return;
  }

  const total = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStock = products.filter(p => p.quantity >= 1 && p.quantity <= 5).length;
  const zeroStock = products.filter(p => p.quantity === 0).length;

  document.getElementById('dash-total').textContent = total;
  document.getElementById('dash-value').textContent = formatCurrency(totalValue);
  document.getElementById('dash-low').textContent = lowStock;
  document.getElementById('dash-zero').textContent = zeroStock;

  const brandCounts = {};
  products.forEach(p => {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  });

  const sortedBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

 const brandList = document.getElementById('brand-list');
brandList.innerHTML = sortedBrands.map(([brand]) => `
  <div class="brand-item">
    <span class="brand-item-name">${brand}</span>
  </div>
`).join('');
}