// ============================================
// CADASTRO DE PRODUTOS (vários modelos de uma vez)
// ============================================
// Fluxo: 1) tipo  2) marca + modelos (toque nas sugestões ou digite)  3) preço.
// Cada modelo da lista vira um produto. Se o modelo já existe no estoque, a quantidade
// é somada a ele (em vez de criar um produto repetido).
// Ao editar um produto existente, a mesma tela mostra só aquele produto, e a
// quantidade passa a ser o total em estoque (não soma).
//
// Depende de app_refactored.js (carregado antes): products, lojaAtual, BRAND_MODELS,
// TIPO_LABELS, TIPO_ICONES, esc, pluralize, formatCurrency, parsePriceValue,
// formatPriceInput, calcularPrecificacao, custoDoProduto, salvarCusto, loadProducts,
// applyFilters, updateDashboard, changeTab, showToast, abrirModalConfirmacao.

const CAD = {
  form: document.getElementById('product-form'),
  tipoBotoes: document.querySelectorAll('#type-selector .type-option'),
  tipoInput: document.getElementById('type'),
  tipoAparelhoBtn: document.getElementById('type-option-aparelhos'),
  tituloModelos: document.getElementById('cadastro-titulo-modelos'),
  labelMarca: document.getElementById('cadastro-label-marca'),
  marca: document.getElementById('brand'),
  marcaSugestoes: document.getElementById('brand-sugestoes'),
  sugeridos: document.getElementById('modelos-sugeridos'),
  sugeridosDica: document.getElementById('modelos-sugeridos-dica'),
  chips: document.getElementById('modelos-chips'),
  livreInput: document.getElementById('modelo-livre-input'),
  livreAdd: document.getElementById('modelo-livre-add'),
  livreWrap: document.querySelector('.modelo-livre'),
  lista: document.getElementById('lote-lista'),
  listaVazia: document.getElementById('lote-vazio'),
  dicaPreco: document.getElementById('cadastro-dica-preco'),
  preco: document.getElementById('price'),
  custo: document.getElementById('cost'),
  estoqueMinimo: document.getElementById('estoque-minimo'),
  notas: document.getElementById('notes'),
  detalhes: document.getElementById('cadastro-detalhes'),
  salvar: document.getElementById('save-button'),
  cancelar: document.getElementById('cancel-edit'),

  precificacao: document.getElementById('precificacao'),
  precLucro: document.getElementById('precificacao-lucro'),
  precMargem: document.getElementById('precificacao-margem'),
  precMarkup: document.getElementById('precificacao-markup'),
  precAviso: document.getElementById('precificacao-aviso'),

  previewIcone: document.getElementById('preview-image'),
  previewNome: document.getElementById('preview-name'),
  previewMeta: document.getElementById('preview-meta'),
  previewProdutos: document.getElementById('preview-qtd-produtos'),
  previewUnidades: document.getElementById('preview-qtd-unidades'),
  previewValor: document.getElementById('preview-valor-venda'),
  previewPreco: document.getElementById('preview-price'),
};

// Sugestões para acessórios (o lojista pode digitar qualquer outro nome).
const ACESSORIOS_SUGERIDOS = [
  'Cabo USB-C', 'Cabo Lightning', 'Cabo Micro USB', 'Carregador 20W', 'Carregador turbo',
  'Carregador veicular', 'Fone de ouvido', 'Fone Bluetooth', 'Caixa de som', 'Power bank',
  'Suporte veicular', 'Pop socket', 'Película de câmera', 'Cartão de memória',
];

const TEXTOS_TIPO = {
  capinhas: {
    titulo: 'Para quais celulares?',
    marca: 'Marca do celular',
    marcaPlaceholder: 'Ex: Samsung',
    livre: 'Outro modelo? Digite e aperte Enter · ex: Galaxy A15',
    dica: 'Toque nos modelos que você recebeu:',
  },
  peliculas: {
    titulo: 'Para quais celulares?',
    marca: 'Marca do celular',
    marcaPlaceholder: 'Ex: Apple',
    livre: 'Outro modelo? Digite e aperte Enter · ex: iPhone 16',
    dica: 'Toque nos modelos que você recebeu:',
  },
  acessorios: {
    titulo: 'Quais acessórios?',
    marca: 'Marca (opcional)',
    marcaPlaceholder: 'Ex: Baseus, JBL',
    livre: 'Nome do acessório e Enter · ex: Cabo USB-C 1m',
    dica: 'Toque para adicionar, ou digite o nome abaixo:',
  },
  aparelhos: {
    titulo: 'Celular cadastrado anteriormente',
    marca: 'Marca',
    marcaPlaceholder: 'Ex: Apple',
    livre: '',
    dica: '',
  },
};

// Abaixo desta margem aparece um aviso informativo (não impede o cadastro).
const MARGEM_MINIMA_ALERTA = 20;

let tipoAtual = 'capinhas';
let lote = []; // [{ id, modelo, quantidade }]
let produtoEmEdicao = null;
let proximoIdLote = 1;
let salvandoCadastro = false;

// ---- Utilidades -------------------------------------------------------------------

function normalizarTexto(texto) {
  return String(texto ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// "samsung" digitado vira "Samsung" se bater com uma marca conhecida.
function marcaCanonica(texto) {
  const limpa = String(texto ?? '').trim().replace(/\s+/g, ' ');
  const conhecida = Object.keys(BRAND_MODELS).find(m => normalizarTexto(m) === normalizarTexto(limpa));
  return conhecida || limpa;
}

function modelosDaMarca(marca) {
  const modelos = BRAND_MODELS[marcaCanonica(marca)] || [];
  return modelos.filter(m => m !== 'Modelo personalizado');
}

// Produto ativo com mesmo tipo, marca e modelo (ignorando maiúsculas e espaços).
function produtoExistente(tipo, marca, modelo) {
  return products.find(p =>
    p.type === tipo &&
    normalizarTexto(p.brand) === normalizarTexto(marca) &&
    normalizarTexto(p.model) === normalizarTexto(modelo)
  ) || null;
}

// Campo de custo vazio = custo não informado (null), nunca zero.
function lerCusto() {
  const bruto = CAD.custo.value.trim();
  return bruto ? parsePriceValue(bruto) : null;
}

function lerEstoqueMinimo() {
  const bruto = CAD.estoqueMinimo.value.trim();
  if (!bruto) return null;
  const n = Number(bruto);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

function formatarPercentual(valor) {
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

// ---- Tipo -----------------------------------------------------------------------

function selecionarTipoCadastro(tipo) {
  tipoAtual = tipo;
  CAD.tipoInput.value = tipo;
  CAD.tipoBotoes.forEach(btn => btn.classList.toggle('active', btn.dataset.type === tipo));

  const textos = TEXTOS_TIPO[tipo];
  CAD.tituloModelos.textContent = textos.titulo;
  CAD.labelMarca.textContent = textos.marca;
  CAD.marca.placeholder = textos.marcaPlaceholder;
  CAD.livreInput.placeholder = textos.livre;
  CAD.sugeridosDica.textContent = textos.dica;

  atualizarSugestoesMarca();
  renderChips();
  renderLote();
  atualizarResumo();
}

// Troca de tipo com modelos já na lista: os nomes valem para o tipo novo também
// (ex.: escolheu Capinha mas era Película), então a lista é mantida.
function handleCliqueTipo(tipo) {
  if (tipo !== tipoAtual) selecionarTipoCadastro(tipo);
}

// ---- Marca ----------------------------------------------------------------------

function atualizarSugestoesMarca() {
  let marcas;
  if (tipoAtual === 'acessorios') {
    marcas = [...new Set(products.filter(p => p.type === 'acessorios').map(p => p.brand).filter(Boolean))];
  } else {
    marcas = Object.keys(BRAND_MODELS).filter(m => m !== 'Outro');
  }
  CAD.marcaSugestoes.innerHTML = marcas
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map(m => `<option value="${esc(m)}"></option>`)
    .join('');
}

// ---- Sugestões de modelo (chips) ----------------------------------------------------

function sugestoesAtuais() {
  if (tipoAtual === 'acessorios') return ACESSORIOS_SUGERIDOS;
  if (tipoAtual === 'aparelhos') return [];
  return modelosDaMarca(CAD.marca.value);
}

function itemDoLote(modelo) {
  return lote.find(i => normalizarTexto(i.modelo) === normalizarTexto(modelo));
}

function renderChips() {
  const sugestoes = produtoEmEdicao ? [] : sugestoesAtuais();
  CAD.sugeridos.classList.toggle('hidden', sugestoes.length === 0);

  CAD.chips.innerHTML = sugestoes.map(modelo => {
    const ativo = Boolean(itemDoLote(modelo));
    return `<button type="button" class="modelo-chip${ativo ? ' active' : ''}" data-modelo="${esc(modelo)}" aria-pressed="${ativo}">
      <i class="ti ${ativo ? 'ti-check' : 'ti-plus'}"></i>${esc(modelo)}
    </button>`;
  }).join('');
}

// ---- Lista de modelos (lote) ----------------------------------------------------------

function adicionarAoLote(modelo, quantidade = 1) {
  const nome = String(modelo ?? '').trim().replace(/\s+/g, ' ');
  if (!nome) return;

  const existente = itemDoLote(nome);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    lote.push({ id: proximoIdLote++, modelo: nome, quantidade });
  }
  renderChips();
  renderLote();
  atualizarResumo();
}

function removerDoLote(id) {
  lote = lote.filter(i => i.id !== id);
  renderChips();
  renderLote();
  atualizarResumo();
}

function alternarChip(modelo) {
  const item = itemDoLote(modelo);
  if (item) removerDoLote(item.id);
  else adicionarAoLote(modelo);
}

function adicionarModeloLivre() {
  const valor = CAD.livreInput.value;
  if (!valor.trim()) {
    CAD.livreInput.focus();
    return;
  }
  adicionarAoLote(valor);
  CAD.livreInput.value = '';
  CAD.livreInput.focus();
}

// Texto que explica o que vai acontecer com cada linha ao salvar.
function situacaoItem(item) {
  if (produtoEmEdicao) return '';
  const existente = produtoExistente(tipoAtual, marcaCanonica(CAD.marca.value), item.modelo);
  if (!existente) return '<span class="lote-tag lote-tag--novo">Novo</span>';
  return `<span class="lote-tag lote-tag--soma">Já tem ${existente.quantity} → vai ficar com ${existente.quantity + item.quantidade}</span>`;
}

function renderLote() {
  CAD.listaVazia.classList.toggle('hidden', lote.length > 0);
  CAD.listaVazia.textContent = tipoAtual === 'acessorios'
    ? 'Nenhum acessório adicionado ainda.'
    : 'Nenhum modelo adicionado ainda. Escolha a marca e toque nos modelos.';

  const rotuloQtd = produtoEmEdicao ? 'Em estoque' : 'Quantidade';

  CAD.lista.innerHTML = lote.map(item => `
    <div class="lote-item" data-id="${item.id}">
      <div class="lote-item-nome">
        <input type="text" class="lote-item-modelo" value="${esc(item.modelo)}" aria-label="Modelo" />
        ${situacaoItem(item)}
      </div>
      <div class="lote-item-qtd">
        <span class="lote-item-qtd-label">${rotuloQtd}</span>
        <div class="quantity-stepper quantity-stepper-sm">
          <button type="button" class="quantity-btn lote-menos" aria-label="Diminuir"><i class="ti ti-minus"></i></button>
          <input type="number" class="lote-item-quantidade" min="0" step="1" inputmode="numeric" value="${item.quantidade}" aria-label="${rotuloQtd}" />
          <button type="button" class="quantity-btn lote-mais" aria-label="Aumentar"><i class="ti ti-plus"></i></button>
        </div>
      </div>
      ${produtoEmEdicao ? '' : '<button type="button" class="lote-remover" title="Tirar da lista" aria-label="Tirar da lista"><i class="ti ti-x"></i></button>'}
    </div>
  `).join('');
}

function itemPorElemento(el) {
  const id = Number(el.closest('.lote-item')?.dataset.id);
  return lote.find(i => i.id === id);
}

function handleCliqueLista(e) {
  const item = itemPorElemento(e.target);
  if (!item) return;

  if (e.target.closest('.lote-remover')) {
    removerDoLote(item.id);
    return;
  }
  if (e.target.closest('.lote-mais') || e.target.closest('.lote-menos')) {
    item.quantidade = Math.max(0, item.quantidade + (e.target.closest('.lote-mais') ? 1 : -1));
    renderLote();
    atualizarResumo();
  }
}

function handleInputLista(e) {
  const item = itemPorElemento(e.target);
  if (!item) return;

  if (e.target.classList.contains('lote-item-quantidade')) {
    const n = Math.floor(Number(e.target.value));
    item.quantidade = Number.isFinite(n) && n >= 0 ? n : 0;
    atualizarResumo();
  }
  if (e.target.classList.contains('lote-item-modelo')) {
    item.modelo = e.target.value;
    renderChips();
    atualizarResumo();
  }
}

// Ao sair do campo, atualiza a etiqueta "Novo / Já tem N" daquela linha.
function handleSaidaLista(e) {
  if (e.target.matches('.lote-item-modelo, .lote-item-quantidade')) renderLote();
}

// ---- Preço, lucro e resumo -----------------------------------------------------------

function atualizarPrecificacao() {
  const custo = lerCusto();
  const venda = parsePriceValue(CAD.preco.value);
  const { lucro, margem, markup } = calcularPrecificacao(custo, venda);

  CAD.precLucro.textContent = lucro === null ? '—' : formatCurrency(lucro);
  CAD.precMargem.textContent = margem === null ? '—' : formatarPercentual(margem);
  CAD.precMarkup.textContent = markup === null ? '—' : formatarPercentual(markup);

  let estado = 'neutro';
  let aviso = 'Preencha o custo para ver o lucro. Se não souber agora, pode deixar em branco e completar depois.';

  if (custo !== null && !venda) {
    aviso = 'Agora preencha o preço de venda.';
  } else if (custo !== null && venda < custo) {
    estado = 'perigo';
    aviso = 'Atenção: este preço está abaixo do custo cadastrado.';
  } else if (margem !== null && margem < MARGEM_MINIMA_ALERTA) {
    estado = 'atencao';
    aviso = `Margem abaixo de ${MARGEM_MINIMA_ALERTA}%. Pode ser uma promoção; só confira se é isso mesmo.`;
  } else if (lucro !== null) {
    estado = 'ok';
    aviso = 'Lucro bruto: ainda não desconta impostos, taxas de cartão e despesas da loja.';
  }

  CAD.precificacao.dataset.estado = estado;
  CAD.precAviso.textContent = aviso;
}

function atualizarResumo() {
  const preco = parsePriceValue(CAD.preco.value);
  const validos = lote.filter(i => i.modelo.trim());
  const unidades = validos.reduce((s, i) => s + i.quantidade, 0);
  const marca = marcaCanonica(CAD.marca.value);

  CAD.previewIcone.innerHTML = `<i class="ti ${TIPO_ICONES[tipoAtual] || 'ti-package'}"></i>`;

  const nome = validos.length === 1
    ? [marca, validos[0].modelo].filter(Boolean).join(' ')
    : validos.length > 1 ? `${validos.length} modelos` : 'Nenhum modelo ainda';
  CAD.previewNome.textContent = nome;
  CAD.previewNome.classList.toggle('preview-placeholder', validos.length === 0);

  CAD.previewMeta.textContent = [TIPO_LABELS[tipoAtual], validos.length > 1 ? marca : ''].filter(Boolean).join(' · ');
  CAD.previewMeta.classList.remove('preview-placeholder');

  CAD.previewProdutos.textContent = validos.length;
  CAD.previewUnidades.textContent = unidades;
  CAD.previewValor.textContent = formatCurrency(preco * unidades);
  CAD.previewPreco.textContent = formatCurrency(preco);

  CAD.dicaPreco.classList.toggle('hidden', validos.length <= 1 || Boolean(produtoEmEdicao));

  if (produtoEmEdicao) {
    CAD.salvar.textContent = '✓ Salvar alterações';
  } else {
    CAD.salvar.textContent = validos.length > 1 ? `✓ Salvar ${validos.length} produtos` : '✓ Salvar';
  }
  atualizarPrecificacao();
}

// ---- Salvar -------------------------------------------------------------------------

function validarCadastro() {
  const itens = lote
    .map(i => ({ ...i, modelo: i.modelo.trim().replace(/\s+/g, ' ') }))
    .filter(i => i.modelo);

  if (!itens.length) {
    return { erro: tipoAtual === 'acessorios'
      ? 'Adicione pelo menos um acessório na lista.'
      : 'Adicione pelo menos um modelo na lista (passo 2).' };
  }

  const nomes = itens.map(i => normalizarTexto(i.modelo));
  if (new Set(nomes).size !== nomes.length) {
    return { erro: 'Tem um modelo repetido na lista. Junte as quantidades numa linha só.' };
  }

  const preco = parsePriceValue(CAD.preco.value);
  if (!CAD.preco.value.trim() || preco <= 0) {
    return { erro: 'Informe o preço de venda (passo 3).', foco: CAD.preco };
  }

  const custo = lerCusto();
  if (custo !== null && custo < 0) return { erro: 'O preço de custo não pode ser negativo.', foco: CAD.custo };

  const estoqueMinimo = lerEstoqueMinimo();
  if (Number.isNaN(estoqueMinimo)) {
    CAD.detalhes.open = true;
    return { erro: 'O aviso de estoque precisa ser um número inteiro (ex: 3).', foco: CAD.estoqueMinimo };
  }

  return {
    itens,
    preco,
    custo,
    estoqueMinimo,
    marca: marcaCanonica(CAD.marca.value),
    notas: CAD.notas.value.trim(),
  };
}

async function salvarEdicao(dados) {
  const item = dados.itens[0];
  const ok = await updateProductRow(produtoEmEdicao.id, {
    type: tipoAtual,
    brand: dados.marca,
    model: item.modelo,
    price: dados.preco,
    quantity: item.quantidade,
    notes: dados.notas,
    estoque_minimo: dados.estoqueMinimo,
  });
  if (!ok) return false;

  await salvarCusto(produtoEmEdicao.id, dados.custo);
  showToast(`✅ ${[dados.marca, item.modelo].filter(Boolean).join(' ')} atualizado!`, 'success');
  return true;
}

async function salvarNovos(dados) {
  const novos = [];
  const somar = [];

  dados.itens.forEach(item => {
    const existente = produtoExistente(tipoAtual, dados.marca, item.modelo);
    if (existente) somar.push({ existente, item });
    else novos.push(item);
  });

  let criados = [];
  if (novos.length) {
    const { data, error } = await supabaseClient
      .from('products')
      .insert(novos.map(item => ({
        type: tipoAtual,
        brand: dados.marca,
        model: item.modelo,
        color: '',
        manufacture: '',
        price: dados.preco,
        quantity: item.quantidade,
        notes: dados.notas,
        estoque_minimo: dados.estoqueMinimo,
        loja_id: lojaAtual.id,
      })))
      .select('id');

    if (error) {
      showToast('❌ Não foi possível salvar os produtos. Nada foi cadastrado.', 'error');
      return false;
    }
    criados = data;
  }

  // Modelo que já existia: soma a quantidade e atualiza o preço para o atual.
  let falhasSoma = 0;
  for (const { existente, item } of somar) {
    const campos = { quantity: existente.quantity + item.quantidade, price: dados.preco };
    if (dados.estoqueMinimo !== null) campos.estoque_minimo = dados.estoqueMinimo;
    const ok = await updateProductRow(existente.id, campos);
    if (!ok) falhasSoma++;
  }

  if (dados.custo !== null) {
    const ids = [...criados.map(c => c.id), ...somar.map(s => s.existente.id)];
    const { error } = await supabaseClient
      .from('produtos_custos')
      .upsert(ids.map(id => ({
        produto_id: id,
        loja_id: lojaAtual.id,
        custo_unitario: dados.custo,
        updated_at: new Date().toISOString(),
        updated_by: usuarioAtual.id,
      })), { onConflict: 'produto_id' });
    if (error) showToast('⚠️ Produtos salvos, mas o preço de custo não foi gravado. Edite para tentar de novo.', 'warning', 5000);
  }

  const partes = [];
  if (criados.length) partes.push(`${criados.length} ${pluralize(criados.length, 'produto cadastrado', 'produtos cadastrados')}`);
  const somados = somar.length - falhasSoma;
  if (somados) partes.push(`${somados} ${pluralize(somados, 'atualizado', 'atualizados')} no estoque`);
  if (partes.length) showToast(`✅ ${partes.join(' e ')}!`, 'success', 4000);
  if (falhasSoma) showToast(`❌ ${falhasSoma} ${pluralize(falhasSoma, 'produto', 'produtos')} não foi atualizado. Confira no estoque.`, 'error', 5000);

  return true;
}

async function handleSalvarCadastro(event) {
  event.preventDefault();
  if (salvandoCadastro) return;

  const dados = validarCadastro();
  if (dados.erro) {
    showToast(`❌ ${dados.erro}`, 'error', 4000);
    dados.foco?.focus();
    return;
  }

  salvandoCadastro = true;
  CAD.salvar.disabled = true;

  try {
    const ok = produtoEmEdicao ? await salvarEdicao(dados) : await salvarNovos(dados);
    if (!ok) return;

    const estavaEditando = Boolean(produtoEmEdicao);
    await loadProducts();
    applyFilters();
    updateDashboard();

    if (estavaEditando) {
      resetForm();
      changeTab('estoque');
    } else {
      limparParaProximoLote();
    }
  } finally {
    salvandoCadastro = false;
    CAD.salvar.disabled = false;
  }
}

// Depois de salvar: mantém tipo e marca (pra continuar cadastrando rápido) e limpa o resto.
function limparParaProximoLote() {
  lote = [];
  CAD.preco.value = '';
  CAD.custo.value = '';
  CAD.estoqueMinimo.value = '';
  CAD.notas.value = '';
  renderChips();
  renderLote();
  atualizarResumo();
}

// ---- Edição de produto existente ------------------------------------------------------

function startEditProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  produtoEmEdicao = product;
  CAD.tipoAparelhoBtn.classList.toggle('hidden', product.type !== 'aparelhos');
  CAD.livreWrap.classList.add('hidden');
  CAD.marca.value = product.brand || '';
  lote = [{ id: proximoIdLote++, modelo: product.model || '', quantidade: product.quantity }];

  CAD.preco.value = formatPriceInput(product.price) || '';
  const custo = custoDoProduto(product.id);
  CAD.custo.value = custo === null ? '' : formatPriceInput(custo) || 'R$ 0,00';
  CAD.estoqueMinimo.value = product.estoque_minimo ?? '';
  CAD.notas.value = product.notes || '';
  CAD.detalhes.open = Boolean(product.notes || product.estoque_minimo !== null && product.estoque_minimo !== undefined);

  CAD.cancelar.classList.remove('hidden');
  selecionarTipoCadastro(product.type);
  changeTab('cadastro');
}

function resetForm() {
  produtoEmEdicao = null;
  lote = [];
  CAD.marca.value = '';
  CAD.preco.value = '';
  CAD.custo.value = '';
  CAD.estoqueMinimo.value = '';
  CAD.notas.value = '';
  CAD.livreInput.value = '';
  CAD.detalhes.open = false;
  CAD.cancelar.classList.add('hidden');
  CAD.tipoAparelhoBtn.classList.add('hidden');
  CAD.livreWrap.classList.remove('hidden');
  selecionarTipoCadastro(tipoAtual === 'aparelhos' ? 'capinhas' : tipoAtual);
}

// ---- Máscara de dinheiro --------------------------------------------------------------

function ligarCampoDinheiro(input, { vazioEhNulo }) {
  input.addEventListener('focus', () => {
    if (!input.value.trim()) return;
    const v = parsePriceValue(input.value);
    input.value = v.toString().replace('.', ',');
  });
  input.addEventListener('blur', () => {
    if (!input.value.trim()) { input.value = ''; return; }
    const v = parsePriceValue(input.value);
    input.value = formatPriceInput(v) || (vazioEhNulo ? 'R$ 0,00' : '');
  });
  input.addEventListener('input', atualizarResumo);
}

// ---- Inicialização --------------------------------------------------------------------

function initCadastro() {
  CAD.form.addEventListener('submit', handleSalvarCadastro);
  CAD.cancelar.addEventListener('click', () => { resetForm(); changeTab('estoque'); });

  CAD.tipoBotoes.forEach(btn => btn.addEventListener('click', () => handleCliqueTipo(btn.dataset.type)));

  CAD.marca.addEventListener('input', () => { renderChips(); renderLote(); atualizarResumo(); });

  CAD.chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.modelo-chip');
    if (chip) alternarChip(chip.dataset.modelo);
  });

  CAD.livreAdd.addEventListener('click', adicionarModeloLivre);
  CAD.livreInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); adicionarModeloLivre(); }
  });

  CAD.lista.addEventListener('click', handleCliqueLista);
  CAD.lista.addEventListener('input', handleInputLista);
  CAD.lista.addEventListener('focusout', handleSaidaLista);
  // Enter dentro da lista não envia o formulário sem querer.
  CAD.lista.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
  });

  ligarCampoDinheiro(CAD.preco, { vazioEhNulo: false });
  ligarCampoDinheiro(CAD.custo, { vazioEhNulo: true });

  selecionarTipoCadastro('capinhas');
}
