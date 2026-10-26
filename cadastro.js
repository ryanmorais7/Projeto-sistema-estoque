// ============================================
// CADASTRO DE PRODUTOS (em lote)
// ============================================
// Fluxo pensado para o balcão:
//   Categoria → Linha/Tipo → Marca → Família → marcar vários modelos →
//   preço igual para todos (com ajuste por modelo) → quantidade e mínimo de cada um →
//   Cadastrar.
// Cada modelo marcado vira um produto com estoque próprio. Família só ajuda a achar os
// modelos: não quer dizer que uma capinha serve em outro aparelho.
//
// Produto que já existe (mesma categoria, marca, modelo e linha/tipo, ignorando
// maiúsculas, acentos e espaços) nunca é sobrescrito sem perguntar: a linha pede para
// escolher entre somar ao estoque ou ignorar.
// Tudo é gravado de uma vez pela RPC cadastrar_lote (sql/013): ou entra o lote inteiro,
// ou nada.
//
// Ao editar um produto, a mesma tela mostra só ele e a quantidade passa a ser o total
// em estoque (não soma).

const CAD = {
  form: $('product-form'),
  titulo: $('cadastro-titulo'),
  desc: $('cadastro-desc'),
  tipoBotoes: document.querySelectorAll('#type-selector [data-type]'),
  tipoAparelhoBtn: $('type-option-aparelhos'),

  variacaoBloco: $('variacao-bloco'),
  variacaoRotulo: $('variacao-rotulo'),
  variacaoChips: $('variacao-chips'),
  variacaoEditar: $('variacao-editar'),
  variacaoOutra: $('variacao-outra'),
  variacaoOutraInput: $('variacao-outra-input'),
  variacaoOutraGuardar: $('variacao-outra-guardar'),

  marcaBloco: $('marca-bloco'),
  labelMarca: $('cadastro-label-marca'),
  marcaChips: $('marca-chips'),
  marca: $('brand'),
  marcaSugestoes: $('brand-sugestoes'),

  modelosBloco: $('modelos-bloco'),
  modelosRotulo: $('modelos-rotulo'),
  familias: $('familias-tabs'),
  busca: $('modelo-busca'),
  contagem: $('modelos-contagem'),
  marcarTodos: $('modelos-marcar-todos'),
  chips: $('modelos-chips'),
  livreInput: $('modelo-livre-input'),
  livreAdd: $('modelo-livre-add'),

  dicaPreco: $('cadastro-dica-preco'),
  preco: $('price'),
  custo: $('cost'),
  precificacao: $('precificacao'),
  precLucro: $('precificacao-lucro'),
  precMargem: $('precificacao-margem'),
  precAviso: $('precificacao-aviso'),

  padroes: $('lote-padroes'),
  qtdPadrao: $('lote-qtd-padrao'),
  qtdAplicar: $('lote-qtd-aplicar'),
  minPadrao: $('estoque-minimo'),
  minAplicar: $('lote-min-aplicar'),
  loteHead: $('lote-head'),
  lista: $('lote-lista'),
  listaVazia: $('lote-vazio'),
  detalhes: $('cadastro-detalhes'),
  notas: $('notes'),

  resumoCategoria: $('resumo-categoria'),
  resumoVariacaoRotulo: $('resumo-variacao-rotulo'),
  resumoVariacao: $('resumo-variacao'),
  resumoMarca: $('resumo-marca'),
  resumoModelos: $('resumo-modelos'),
  resumoUnidades: $('resumo-unidades'),
  resumoCusto: $('resumo-custo'),
  resumoVenda: $('resumo-venda'),
  resumoAlerta: $('resumo-alerta'),
  salvar: $('save-button'),
  cancelar: $('cancel-edit'),
};

// Abaixo desta margem aparece um aviso informativo (não impede o cadastro).
const MARGEM_MINIMA_ALERTA = 20;
const VARIACAO_OUTRA = '__outra__';

let tipoAtual = 'capinhas';
let variacaoAtual = null; // nome escolhido, VARIACAO_OUTRA (digitando) ou null (nenhuma)
let marcaAtual = '';
let familiaAtual = null;
let lote = [];
let produtoEmEdicao = null;
let proximoIdLote = 1;
let salvandoCadastro = false;

// ---- Leitura dos campos ---------------------------------------------------------------

function lerDinheiro(input) {
  const bruto = input.value.trim();
  return bruto ? parsePriceValue(bruto) : null;
}

function lerInteiro(input) {
  const bruto = String(input.value ?? '').trim();
  if (!bruto) return null;
  const n = Number(bruto);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

function variacaoEscolhida() {
  if (!temVariacao()) return null;
  if (variacaoAtual === VARIACAO_OUTRA) return limparNome(CAD.variacaoOutraInput.value) || null;
  return variacaoAtual;
}

function temVariacao() {
  return tipoAtual === 'capinhas' || tipoAtual === 'peliculas';
}

function usaCatalogoDeCelular() {
  return temVariacao();
}

function precoVendaDoItem(item) {
  return item.venda ?? lerDinheiro(CAD.preco);
}

function precoCustoDoItem(item) {
  return item.custo !== undefined ? item.custo : lerDinheiro(CAD.custo);
}

function itensAtivos() {
  return lote.filter(i => limparNome(i.modelo) && i.decisao !== 'ignorar');
}

function estaEditandoProduto() {
  return Boolean(produtoEmEdicao);
}

// Produto ativo igual a este item (ignorando o próprio produto em edição).
function produtoExistente(tipo, marca, modelo, variacao) {
  return products.find(p =>
    p.id !== produtoEmEdicao?.id &&
    p.type === tipo &&
    chaveNome(p.brand) === chaveNome(marca) &&
    chaveNome(p.model) === chaveNome(modelo) &&
    chaveNome(p.variacao) === chaveNome(variacao)
  ) || null;
}

function existenteDoItem(item) {
  return produtoExistente(tipoAtual, item.marca, item.modelo, variacaoEscolhida());
}

// ---- Categoria -----------------------------------------------------------------------

const TEXTOS_TIPO = {
  capinhas: { marca: 'Marca do celular', modelos: 'Modelos', livre: 'Não achou? Digite o modelo e aperte Enter' },
  peliculas: { marca: 'Marca do celular', modelos: 'Modelos', livre: 'Não achou? Digite o modelo e aperte Enter' },
  acessorios: { marca: 'Marca (opcional)', modelos: 'Acessórios', livre: 'Nome do acessório e Enter · ex: Cabo USB-C 1m' },
  aparelhos: { marca: 'Marca', modelos: 'Modelo', livre: '' },
};

function selecionarTipoCadastro(tipo) {
  const mudou = tipo !== tipoAtual;
  tipoAtual = tipo;
  CAD.tipoBotoes.forEach(btn => {
    const ativo = btn.dataset.type === tipo;
    btn.classList.toggle('active', ativo);
    btn.setAttribute('aria-checked', String(ativo));
  });

  // A linha de capinha não vale para película (e vice-versa).
  if (mudou) {
    variacaoAtual = null;
    CAD.variacaoOutraInput.value = '';
  }

  const textos = TEXTOS_TIPO[tipo];
  CAD.labelMarca.textContent = textos.marca;
  CAD.modelosRotulo.textContent = textos.modelos;
  CAD.livreInput.placeholder = textos.livre;

  renderVariacoes();
  renderMarcas();
  renderModelos();
  renderLote();
  atualizarResumo();
}

// ---- Linha / tipo ----------------------------------------------------------------------

function renderVariacoes() {
  CAD.variacaoBloco.classList.toggle('hidden', !temVariacao());
  if (!temVariacao()) return;

  CAD.variacaoRotulo.textContent = rotuloVariacao(tipoAtual);
  CAD.variacaoOutraInput.placeholder = tipoAtual === 'capinhas' ? 'Nome da linha · ex: Magsafe' : 'Nome do tipo · ex: Hidrogel';

  // Produto antigo pode ter uma variação que não está mais na lista: mostra mesmo assim.
  const opcoes = [...variacoesDoTipo(tipoAtual)];
  if (variacaoAtual && variacaoAtual !== VARIACAO_OUTRA && !opcoes.some(o => chaveNome(o) === chaveNome(variacaoAtual))) {
    opcoes.push(variacaoAtual);
  }

  CAD.variacaoChips.innerHTML = opcoes.map(nome => {
    const ativo = variacaoAtual === nome;
    return `<button type="button" class="chip" role="radio" aria-checked="${ativo}" data-variacao="${esc(nome)}">${ativo ? '<i class="ti ti-check"></i>' : ''}${esc(nome)}</button>`;
  }).join('') + `<button type="button" class="chip chip--dashed" role="radio" aria-checked="${variacaoAtual === VARIACAO_OUTRA}" data-variacao="${VARIACAO_OUTRA}"><i class="ti ti-plus"></i>Outra</button>`;

  CAD.variacaoOutra.classList.toggle('hidden', variacaoAtual !== VARIACAO_OUTRA);
  CAD.variacaoOutraGuardar.closest('label').classList.toggle('hidden', !catalogoLoja.disponivel || !souDono());
}

function escolherVariacao(valor) {
  // Tocar de novo na mesma opção tira a seleção (linha/tipo é opcional).
  variacaoAtual = variacaoAtual === valor ? null : valor;
  // O produto "igual" depende da linha/tipo: decisões de somar/ignorar valem de novo.
  lote.forEach(i => { i.decisao = null; });
  renderVariacoes();
  if (variacaoAtual === VARIACAO_OUTRA) CAD.variacaoOutraInput.focus();
  renderLote();
  atualizarResumo();
}

// ---- Marca -----------------------------------------------------------------------------

function marcasDeAcessorios() {
  return semRepetidos(products.filter(p => p.type === 'acessorios').map(p => limparNome(p.brand))).slice(0, 10);
}

function renderMarcas() {
  const editandoAparelho = tipoAtual === 'aparelhos';
  CAD.marcaChips.classList.toggle('hidden', editandoAparelho);

  const marcas = usaCatalogoDeCelular() ? [...MARCAS_PRINCIPAIS] : marcasDeAcessorios();
  if (marcaAtual && !marcas.some(m => chaveNome(m) === chaveNome(marcaAtual))) marcas.push(marcaAtual);

  CAD.marcaChips.innerHTML = marcas.map(m => {
    const ativo = chaveNome(m) === chaveNome(marcaAtual);
    const extra = !MARCAS_PRINCIPAIS.includes(m) && usaCatalogoDeCelular();
    const dica = MARCA_DICA[m] ? `<small>${esc(MARCA_DICA[m])}</small>` : '';
    return `<button type="button" class="marca-opcao${ativo ? ' active' : ''}${extra ? ' marca-opcao--extra' : ''}" role="radio" aria-checked="${ativo}" data-marca="${esc(m)}">${esc(m)}${dica}</button>`;
  }).join('');
  CAD.marcaChips.classList.toggle('hidden', editandoAparelho || marcas.length === 0);

  const sugestoes = usaCatalogoDeCelular() ? marcasConhecidas(products) : semRepetidos(products.filter(p => p.type === 'acessorios').map(p => limparNome(p.brand)));
  CAD.marcaSugestoes.innerHTML = sugestoes.map(m => `<option value="${esc(m)}"></option>`).join('');
}

function definirMarca(texto) {
  const canonica = usaCatalogoDeCelular() ? marcaCanonica(texto, products) : limparNome(texto);
  if (chaveNome(canonica) === chaveNome(marcaAtual)) return;
  marcaAtual = canonica;
  familiaAtual = null;
  CAD.busca.value = '';
  // Em edição, a marca vale para o único item; no lote, cada item guarda a sua.
  if (produtoEmEdicao && lote[0]) lote[0].marca = canonica;
  renderMarcas();
  renderModelos();
  renderLote();
  atualizarResumo();
}

// ---- Famílias e modelos --------------------------------------------------------------------

function familiasAtuais() {
  if (tipoAtual === 'acessorios') return [{ familia: 'Sugestões', modelos: ACESSORIOS_SUGERIDOS }];
  if (!usaCatalogoDeCelular() || !marcaAtual) return [];
  return familiasDaMarca(marcaAtual, products, tipoAtual);
}

function itemDoLote(modelo, marca = marcaAtual) {
  return lote.find(i => chaveNome(i.modelo) === chaveNome(modelo) && chaveNome(i.marca) === chaveNome(marca));
}

function modelosVisiveis() {
  const termo = CAD.busca.value;
  if (chaveNome(termo)) {
    if (tipoAtual === 'acessorios') {
      const palavras = chaveNome(termo).split(' ');
      return ACESSORIOS_SUGERIDOS.filter(a => palavras.every(p => chaveNome(a).includes(p))).map(m => ({ modelo: m, familia: 'Sugestões' }));
    }
    return buscarModelos(marcaAtual, termo, products, tipoAtual);
  }
  const familia = familiasAtuais().find(f => f.familia === familiaAtual);
  return familia ? familia.modelos.map(m => ({ modelo: m, familia: familia.familia })) : [];
}

function renderModelos() {
  const mostrar = !produtoEmEdicao && (tipoAtual === 'acessorios' || Boolean(marcaAtual));
  CAD.modelosBloco.classList.toggle('hidden', !mostrar);
  if (!mostrar) return;

  const familias = familiasAtuais();
  if (!familias.some(f => f.familia === familiaAtual)) familiaAtual = familias[0]?.familia || null;

  const buscando = Boolean(chaveNome(CAD.busca.value));
  const mostrarFamilias = familias.length > 1 || (familias.length === 1 && tipoAtual !== 'acessorios');
  CAD.familias.classList.toggle('hidden', !mostrarFamilias || buscando);
  CAD.familias.innerHTML = familias.map(f => {
    const marcados = f.modelos.filter(m => itemDoLote(m)).length;
    const ativo = f.familia === familiaAtual;
    return `<button type="button" class="familia-tab${ativo ? ' active' : ''}" role="tab" aria-selected="${ativo}" data-familia="${esc(f.familia)}">${esc(f.familia)}${marcados ? `<span class="familia-conta">${marcados}</span>` : ''}</button>`;
  }).join('');

  CAD.busca.closest('.search').classList.toggle('hidden', tipoAtual === 'acessorios' || familias.length === 0);

  const visiveis = modelosVisiveis();
  const marcados = visiveis.filter(v => itemDoLote(v.modelo)).length;
  CAD.chips.innerHTML = visiveis.map(({ modelo, familia }) => {
    const ativo = Boolean(itemDoLote(modelo));
    const sub = buscando && familia ? `<small>${esc(familia)}</small>` : '';
    return `<button type="button" class="modelo-chip${ativo ? ' active' : ''}" aria-pressed="${ativo}" data-modelo="${esc(modelo)}" data-familia="${esc(familia || '')}">
      <span class="caixa"><i class="ti ti-check"></i></span><span>${esc(modelo)}${sub}</span>
    </button>`;
  }).join('');

  let contagem = '';
  if (buscando) contagem = visiveis.length ? `${visiveis.length} ${pluralize(visiveis.length, 'modelo encontrado', 'modelos encontrados')}` : 'Nenhum modelo com esse nome. Adicione abaixo.';
  else if (familias.length === 0) contagem = 'Marca sem modelos sugeridos. Digite os modelos abaixo.';
  else contagem = `${marcados} de ${visiveis.length} ${pluralize(marcados, 'marcado', 'marcados')}`;
  CAD.contagem.textContent = contagem;

  CAD.marcarTodos.classList.toggle('hidden', visiveis.length < 2);
  CAD.marcarTodos.textContent = visiveis.length && marcados === visiveis.length ? 'Desmarcar todos' : 'Marcar todos';
}

function alternarModelo(modelo, familia) {
  const item = itemDoLote(modelo);
  if (item) removerDoLote(item.id);
  else adicionarAoLote(modelo, { familia });
}

function marcarTodosVisiveis() {
  const visiveis = modelosVisiveis();
  const todosMarcados = visiveis.every(v => itemDoLote(v.modelo));
  if (todosMarcados) {
    const remover = new Set(visiveis.map(v => itemDoLote(v.modelo).id));
    lote = lote.filter(i => !remover.has(i.id));
  } else {
    visiveis.forEach(v => { if (!itemDoLote(v.modelo)) lote.push(novoItem(v.modelo, { familia: v.familia })); });
  }
  renderModelos();
  renderLote();
  atualizarResumo();
}

// ---- Lote --------------------------------------------------------------------------------

function novoItem(modelo, { familia = null, quantidade = null, doCatalogo = true } = {}) {
  const qtdPadrao = lerInteiro(CAD.qtdPadrao);
  const minPadrao = lerInteiro(CAD.minPadrao);
  return {
    id: proximoIdLote++,
    modelo: limparNome(modelo),
    marca: marcaAtual,
    familia,
    quantidade: quantidade ?? (Number.isInteger(qtdPadrao) ? qtdPadrao : 1),
    minimo: Number.isInteger(minPadrao) ? minPadrao : null,
    venda: undefined, // undefined = usa o preço padrão
    custo: undefined,
    precoAberto: false,
    decisao: null, // 'somar' | 'ignorar' quando o produto já existe
    doCatalogo,
    novo: true, // só para a animação de entrada
  };
}

function adicionarAoLote(modelo, opcoes = {}) {
  const nome = limparNome(modelo);
  if (!nome) return;
  const existente = itemDoLote(nome);
  if (existente) {
    existente.quantidade += 1;
  } else {
    lote.push(novoItem(nome, opcoes));
  }
  renderModelos();
  renderLote();
  atualizarResumo();
}

function removerDoLote(id) {
  lote = lote.filter(i => i.id !== id);
  renderModelos();
  renderLote();
  atualizarResumo();
}

function adicionarModeloLivre() {
  const valor = limparNome(CAD.livreInput.value);
  if (!valor) { CAD.livreInput.focus(); return; }

  // Se o nome digitado já é um modelo sugerido, usa a grafia do catálogo.
  const sugerido = familiasAtuais().flatMap(f => f.modelos.map(m => ({ m, f: f.familia }))).find(x => chaveNome(x.m) === chaveNome(valor));
  if (sugerido) {
    if (!itemDoLote(sugerido.m)) adicionarAoLote(sugerido.m, { familia: sugerido.f });
  } else {
    adicionarAoLote(valor, { familia: tipoAtual === 'acessorios' ? null : (familiaAtual && familiaAtual !== FAMILIA_OUTROS ? familiaAtual : null), doCatalogo: false });
  }
  CAD.livreInput.value = '';
  CAD.livreInput.focus();
}

function marcasNoLote() {
  return semRepetidos(lote.map(i => i.marca));
}

function tagsDoItem(item) {
  const tags = [];
  if (marcasNoLote().length > 1 && item.marca) tags.push(`<span class="badge badge-neutral">${esc(item.marca)}</span>`);
  if (item.venda !== undefined || item.custo !== undefined) tags.push('<span class="badge badge-blue">Preço próprio</span>');
  return tags.join('');
}

function decisaoDoItem(item) {
  if (produtoEmEdicao) return '';
  const existente = existenteDoItem(item);
  if (!existente) {
    if (item.decisao) item.decisao = null;
    return limparNome(item.modelo) ? '<span class="badge badge-ok">Novo</span>' : '';
  }

  const precoNovo = precoVendaDoItem(item);
  const mudaPreco = precoNovo && Math.abs(precoNovo - Number(existente.price)) > 0.004;
  let detalhe = `Já existe · ${existente.quantity} un.`;
  if (item.decisao === 'somar') {
    detalhe = `Vai ficar com ${existente.quantity + item.quantidade} un.`;
    if (mudaPreco) detalhe += ` · preço ${formatCurrency(existente.price)} → ${formatCurrency(precoNovo)}`;
  }
  return `
    <span class="lote-decisao${item.decisao ? '' : ' pendente'}">
      <i class="ti ti-alert-circle"></i>${detalhe}
      <span class="segmented" role="radiogroup" aria-label="O que fazer com ${esc(item.modelo)}">
        <button type="button" class="${item.decisao === 'somar' ? 'active' : ''}" data-decisao="somar" aria-checked="${item.decisao === 'somar'}">Somar ao estoque</button>
        <button type="button" class="${item.decisao === 'ignorar' ? 'active' : ''}" data-decisao="ignorar" aria-checked="${item.decisao === 'ignorar'}">Ignorar</button>
      </span>
    </span>`;
}

function htmlPrecoDoItem(item) {
  if (!item.precoAberto) return '';
  const venda = precoVendaDoItem(item);
  const custo = precoCustoDoItem(item);
  const { lucro, margem } = calcularPrecificacao(custo, venda || 0);
  const resumo = lucro === null || !venda ? 'Sem custo, sem cálculo de lucro.' : `Lucro ${formatCurrency(lucro)} · margem ${formatarPercentual(margem)}`;
  return `
    <div class="lote-item-preco">
      <label class="field"><span class="field-label">Custo deste modelo</span>
        <input type="text" inputmode="decimal" class="item-custo" value="${item.custo === undefined || item.custo === null ? '' : esc(formatPriceInput(item.custo) || 'R$ 0,00')}" placeholder="${esc(formatPriceInput(lerDinheiro(CAD.custo)) || 'Padrão')}" /></label>
      <label class="field"><span class="field-label">Venda deste modelo</span>
        <input type="text" inputmode="decimal" class="item-venda" value="${item.venda === undefined ? '' : esc(formatPriceInput(item.venda))}" placeholder="${esc(formatPriceInput(lerDinheiro(CAD.preco)) || 'Padrão')}" /></label>
      <span class="margem-mini">${resumo}</span>
      <button type="button" class="btn-link item-preco-padrao">Usar o preço padrão</button>
    </div>`;
}

function htmlItemLote(item) {
  const rotuloQtd = produtoEmEdicao ? 'Em estoque' : 'Quantidade';
  const ignorado = item.decisao === 'ignorar';
  const existente = !produtoEmEdicao && existenteDoItem(item);
  return `
    <div class="lote-item${existente ? ' duplicado' : ''}${ignorado ? ' ignorado' : ''}${item.novo ? ' entrou' : ''}" data-id="${item.id}">
      <div class="lote-item-nome">
        <input type="text" class="lote-item-modelo" value="${esc(item.modelo)}" maxlength="80" aria-label="Nome do modelo" />
        <div class="lote-item-tags">${decisaoDoItem(item)}${tagsDoItem(item)}</div>
      </div>
      <div class="lote-item-qtd" data-label="${rotuloQtd}">
        <div class="stepper stepper--sm">
          <button type="button" class="lote-menos" aria-label="Diminuir quantidade de ${esc(item.modelo)}" ${item.quantidade <= 0 || ignorado ? 'disabled' : ''}><i class="ti ti-minus"></i></button>
          <input type="number" class="lote-item-quantidade" min="0" step="1" inputmode="numeric" value="${item.quantidade}" aria-label="${rotuloQtd} de ${esc(item.modelo)}" ${ignorado ? 'disabled' : ''} />
          <button type="button" class="lote-mais" aria-label="Aumentar quantidade de ${esc(item.modelo)}" ${ignorado ? 'disabled' : ''}><i class="ti ti-plus"></i></button>
        </div>
      </div>
      <div class="lote-item-min" data-label="Mínimo">
        <input type="number" class="lote-item-minimo" min="0" step="1" inputmode="numeric" value="${item.minimo ?? ''}" placeholder="${LIMITE_ESTOQUE_BAIXO}" aria-label="Estoque mínimo de ${esc(item.modelo)}" style="height:34px;width:100%;max-width:90px" ${ignorado ? 'disabled' : ''} />
      </div>
      <div class="lote-item-acoes">
        <button type="button" class="icon-btn lote-preco${item.precoAberto ? ' active' : ''}" title="Preço deste modelo" aria-label="Preço próprio para ${esc(item.modelo)}" aria-expanded="${item.precoAberto}"><i class="ti ti-currency-real"></i></button>
        ${produtoEmEdicao ? '' : `<button type="button" class="icon-btn icon-btn--danger lote-remover" title="Tirar da lista" aria-label="Tirar ${esc(item.modelo)} da lista"><i class="ti ti-x"></i></button>`}
      </div>
      ${htmlPrecoDoItem(item)}
    </div>`;
}

function renderLote() {
  CAD.listaVazia.classList.toggle('hidden', lote.length > 0);
  CAD.listaVazia.textContent = tipoAtual === 'acessorios'
    ? 'Nenhum acessório na lista ainda. Toque nas sugestões ou digite o nome.'
    : 'Nenhum modelo marcado ainda. Escolha a marca e toque nos modelos.';
  CAD.padroes.classList.toggle('hidden', Boolean(produtoEmEdicao));
  CAD.lista.innerHTML = lote.map(htmlItemLote).join('');
  lote.forEach(i => { i.novo = false; });
}

// Redesenha só uma linha (mantém o foco do resto da lista).
function renderItem(item) {
  const atual = CAD.lista.querySelector(`.lote-item[data-id="${item.id}"]`);
  if (!atual) { renderLote(); return; }
  const tmp = document.createElement('div');
  tmp.innerHTML = htmlItemLote(item).trim();
  atual.replaceWith(tmp.firstElementChild);
}

function itemPorElemento(el) {
  const id = Number(el.closest('.lote-item')?.dataset.id);
  return lote.find(i => i.id === id);
}

function handleCliqueLista(e) {
  const item = itemPorElemento(e.target);
  if (!item) return;

  if (e.target.closest('.lote-remover')) { removerDoLote(item.id); return; }

  const decisao = e.target.closest('[data-decisao]');
  if (decisao) {
    item.decisao = decisao.dataset.decisao;
    renderItem(item);
    atualizarResumo();
    return;
  }

  if (e.target.closest('.lote-mais') || e.target.closest('.lote-menos')) {
    item.quantidade = Math.max(0, item.quantidade + (e.target.closest('.lote-mais') ? 1 : -1));
    renderItem(item);
    CAD.lista.querySelector(`.lote-item[data-id="${item.id}"] ${e.target.closest('.lote-mais') ? '.lote-mais' : '.lote-menos'}`)?.focus();
    atualizarResumo();
    return;
  }

  if (e.target.closest('.lote-preco')) {
    item.precoAberto = !item.precoAberto;
    renderItem(item);
    if (item.precoAberto) CAD.lista.querySelector(`.lote-item[data-id="${item.id}"] .item-venda`)?.focus();
    return;
  }

  if (e.target.closest('.item-preco-padrao')) {
    item.venda = undefined;
    item.custo = undefined;
    item.precoAberto = false;
    renderItem(item);
    atualizarResumo();
  }
}

function handleInputLista(e) {
  const item = itemPorElemento(e.target);
  if (!item) return;
  const alvo = e.target;

  if (alvo.classList.contains('lote-item-quantidade')) {
    const n = Math.floor(Number(alvo.value));
    item.quantidade = Number.isFinite(n) && n >= 0 ? n : 0;
  } else if (alvo.classList.contains('lote-item-minimo')) {
    const n = lerInteiro(alvo);
    item.minimo = Number.isInteger(n) ? n : null;
  } else if (alvo.classList.contains('lote-item-modelo')) {
    item.modelo = alvo.value;
    item.doCatalogo = false;
    renderModelos();
  } else if (alvo.classList.contains('item-venda')) {
    item.venda = alvo.value.trim() ? parsePriceValue(alvo.value) : undefined;
  } else if (alvo.classList.contains('item-custo')) {
    item.custo = alvo.value.trim() ? parsePriceValue(alvo.value) : undefined;
  }
  atualizarResumo();
}

// Ao sair de um campo da linha, atualiza etiquetas (novo/já existe, preço próprio).
function handleSaidaLista(e) {
  const item = itemPorElemento(e.target);
  if (!item) return;
  if (e.target.matches('.item-venda, .item-custo')) {
    const proximo = e.relatedTarget;
    const mesmaLinha = proximo && proximo.closest?.('.lote-item') === e.target.closest('.lote-item');
    if (mesmaLinha) {
      // Só formata o valor, sem redesenhar a linha (o foco vai para o outro campo).
      if (e.target.value.trim()) e.target.value = formatPriceInput(parsePriceValue(e.target.value)) || 'R$ 0,00';
      return;
    }
  }
  if (e.target.matches('.lote-item-modelo, .lote-item-quantidade, .item-venda, .item-custo')) {
    item.modelo = limparNome(item.modelo);
    renderItem(item);
  }
}

function aplicarQuantidadePadrao() {
  const n = lerInteiro(CAD.qtdPadrao);
  if (!Number.isInteger(n)) {
    showToast('Digite a quantidade (ex: 10).', 'warning');
    CAD.qtdPadrao.focus();
    return;
  }
  lote.forEach(i => { if (i.decisao !== 'ignorar') i.quantidade = n; });
  renderLote();
  atualizarResumo();
}

function aplicarMinimoPadrao() {
  const n = lerInteiro(CAD.minPadrao);
  if (Number.isNaN(n)) {
    showToast('O estoque mínimo precisa ser um número inteiro (ex: 3).', 'warning');
    CAD.minPadrao.focus();
    return;
  }
  lote.forEach(i => { i.minimo = n; });
  renderLote();
}

// ---- Preço, lucro e resumo -----------------------------------------------------------------

function atualizarPrecificacao() {
  const custo = lerDinheiro(CAD.custo);
  const venda = lerDinheiro(CAD.preco) || 0;
  const { lucro, margem } = calcularPrecificacao(custo, venda);

  CAD.precLucro.textContent = lucro === null || !venda ? '—' : formatCurrency(lucro);
  CAD.precMargem.textContent = margem === null || !venda ? '—' : formatarPercentual(margem);

  let estado = 'neutro';
  let aviso = 'Sem o custo, o lucro fica em branco. Dá para completar depois.';

  if (custo !== null && !venda) {
    aviso = 'Agora preencha o preço de venda.';
  } else if (custo !== null && venda < custo) {
    estado = 'perigo';
    aviso = 'Atenção: o preço de venda está abaixo do custo.';
  } else if (margem !== null && margem < MARGEM_MINIMA_ALERTA) {
    estado = 'atencao';
    aviso = `Margem abaixo de ${MARGEM_MINIMA_ALERTA}%. Pode ser promoção; só confira se é isso mesmo.`;
  } else if (lucro !== null) {
    estado = 'ok';
    aviso = 'Lucro bruto: ainda não desconta impostos, taxas de cartão e despesas.';
  }

  CAD.precificacao.dataset.estado = estado;
  CAD.precAviso.textContent = aviso;
}

function pendencias() {
  const ativos = itensAtivos();
  const lista = [];
  if (!produtoEmEdicao) {
    const semDecisao = lote.filter(i => limparNome(i.modelo) && existenteDoItem(i) && !i.decisao).length;
    if (semDecisao) lista.push(`${semDecisao} ${pluralize(semDecisao, 'modelo já existe', 'modelos já existem')} no estoque: escolha somar ou ignorar.`);
  }
  if (ativos.length && !lerDinheiro(CAD.preco) && ativos.some(i => !i.venda)) lista.push('Falta o preço de venda.');
  return lista;
}

function atualizarResumo() {
  const ativos = itensAtivos();
  const unidades = ativos.reduce((s, i) => s + i.quantidade, 0);
  const marcas = marcasNoLote().filter(Boolean);
  const variacao = variacaoEscolhida();
  const custo = lerDinheiro(CAD.custo);
  const venda = lerDinheiro(CAD.preco);

  CAD.resumoCategoria.textContent = TIPO_LABEL_SINGULAR[tipoAtual] || '—';
  CAD.resumoVariacaoRotulo.textContent = rotuloVariacao(tipoAtual);
  CAD.resumoVariacaoRotulo.parentElement.classList.toggle('hidden', !temVariacao());
  CAD.resumoVariacao.textContent = variacao || 'Sem';
  CAD.resumoMarca.textContent = produtoEmEdicao ? (marcaAtual || '—') : (marcas.length ? marcas.join(', ') : (marcaAtual || '—'));
  CAD.resumoModelos.textContent = ativos.length;
  CAD.resumoUnidades.textContent = formatarNumero(unidades);
  CAD.resumoCusto.textContent = custo === null ? 'Não informado' : formatCurrency(custo);
  CAD.resumoVenda.textContent = venda ? formatCurrency(venda) : '—';
  CAD.resumoModelos.parentElement.classList.add('resumo-essencial');
  CAD.resumoUnidades.parentElement.classList.add('resumo-essencial');

  const avisos = pendencias();
  const somados = ativos.filter(i => i.decisao === 'somar').length;
  const ignorados = lote.filter(i => i.decisao === 'ignorar').length;
  if (avisos.length) {
    CAD.resumoAlerta.className = 'resumo-alerta';
    CAD.resumoAlerta.innerHTML = `<i class="ti ti-alert-triangle"></i><span>${avisos.map(esc).join('<br>')}</span>`;
  } else if (somados || ignorados) {
    CAD.resumoAlerta.className = 'resumo-alerta resumo-alerta--info';
    const partes = [];
    if (ativos.length - somados) partes.push(`${ativos.length - somados} ${pluralize(ativos.length - somados, 'novo', 'novos')}`);
    if (somados) partes.push(`${somados} ${pluralize(somados, 'somado', 'somados')} ao estoque`);
    if (ignorados) partes.push(`${ignorados} ${pluralize(ignorados, 'ignorado', 'ignorados')}`);
    CAD.resumoAlerta.innerHTML = `<i class="ti ti-info-circle"></i><span>${partes.join(' · ')}</span>`;
  } else {
    CAD.resumoAlerta.className = 'resumo-alerta hidden';
  }

  CAD.dicaPreco.classList.toggle('hidden', Boolean(produtoEmEdicao) || ativos.length <= 1);

  if (produtoEmEdicao) CAD.salvar.textContent = 'Salvar alterações';
  else if (ativos.length > 1) CAD.salvar.textContent = `Cadastrar ${ativos.length} produtos`;
  else CAD.salvar.textContent = 'Cadastrar produto';
  CAD.salvar.disabled = salvandoCadastro;

  atualizarPrecificacao();
}

// ---- Validação ---------------------------------------------------------------------------

function validarCadastro() {
  lote.forEach(i => { i.modelo = limparNome(i.modelo); });
  const ativos = itensAtivos();

  if (!ativos.length) {
    if (lote.length && lote.every(i => i.decisao === 'ignorar')) return { erro: 'Todos os modelos estão marcados para ignorar. Não há nada para cadastrar.' };
    return { erro: tipoAtual === 'acessorios' ? 'Adicione pelo menos um acessório.' : 'Marque pelo menos um modelo.' };
  }
  if (lote.some(i => !i.modelo)) return { erro: 'Tem um modelo sem nome na lista.' };

  const chaves = ativos.map(i => `${chaveNome(i.marca)}|${chaveNome(i.modelo)}`);
  if (new Set(chaves).size !== chaves.length) return { erro: 'Tem um modelo repetido na lista. Junte as quantidades numa linha só.' };

  if (variacaoAtual === VARIACAO_OUTRA && !variacaoEscolhida()) {
    return { erro: `Digite o nome da ${rotuloVariacao(tipoAtual).toLowerCase()} ou escolha uma da lista.`, foco: CAD.variacaoOutraInput };
  }

  const pendentes = !produtoEmEdicao && lote.filter(i => i.decisao === null && existenteDoItem(i));
  if (pendentes && pendentes.length) {
    return { erro: `Escolha somar ou ignorar para: ${pendentes.map(i => i.modelo).slice(0, 3).join(', ')}${pendentes.length > 3 ? '...' : ''}.` };
  }

  const vendaPadrao = lerDinheiro(CAD.preco);
  const semPreco = ativos.find(i => !(precoVendaDoItem(i) > 0));
  if (semPreco) return { erro: 'Informe o preço de venda.', foco: CAD.preco };

  const custoPadrao = lerDinheiro(CAD.custo);
  if ((custoPadrao !== null && custoPadrao < 0) || ativos.some(i => i.custo !== undefined && i.custo !== null && i.custo < 0)) {
    return { erro: 'O preço de custo não pode ser negativo.', foco: CAD.custo };
  }

  if (Number.isNaN(lerInteiro(CAD.minPadrao))) return { erro: 'O estoque mínimo precisa ser um número inteiro.', foco: CAD.minPadrao };

  return { itens: ativos, vendaPadrao, custoPadrao, variacao: variacaoEscolhida(), notas: CAD.notas.value.trim() };
}

// ---- Salvar --------------------------------------------------------------------------------

async function salvarNovos(dados) {
  const itensRpc = dados.itens.map(item => {
    const existente = existenteDoItem(item);
    const custo = precoCustoDoItem(item);
    return {
      acao: existente ? 'somar' : 'criar',
      produto_id: existente ? existente.id : null,
      type: tipoAtual,
      brand: item.marca || '',
      model: item.modelo,
      variacao: dados.variacao,
      price: precoVendaDoItem(item),
      custo: custo === null || custo === undefined ? null : custo,
      quantity: item.quantidade,
      estoque_minimo: item.minimo,
      notes: dados.notas,
    };
  });

  const { data, error } = await supabaseClient.rpc('cadastrar_lote', {
    p_loja_id: lojaAtual.id,
    p_itens: itensRpc,
  });

  if (error) {
    if (erroDeFuncaoAusente(error)) {
      showToast('O banco ainda não foi atualizado para o cadastro em lote. Rode o arquivo sql/013_vault_3.sql no Supabase. Nada foi cadastrado.', 'error', 8000);
    } else {
      showToast(`${error.message || 'Não foi possível cadastrar.'} Nada foi cadastrado.`, 'error', 6000);
    }
    return false;
  }

  // Guarda no catálogo o que foi digitado à mão (marca nova e modelos fora da lista),
  // para aparecer como opção da próxima vez. Falhar aqui não desfaz o cadastro.
  if (catalogoLoja.disponivel) {
    const tarefas = [];
    if (usaCatalogoDeCelular()) {
      semRepetidos(dados.itens.map(i => i.marca)).filter(Boolean)
        .filter(m => !marcasConhecidas([]).some(k => chaveNome(k) === chaveNome(m)))
        .forEach(m => tarefas.push(guardarNoCatalogo({ grupo: 'marca', nome: m })));
      dados.itens.filter(i => !i.doCatalogo && i.marca).forEach(i => {
        const jaSugerido = familiasDaMarca(i.marca, [], tipoAtual).some(f => f.modelos.some(m => chaveNome(m) === chaveNome(i.modelo)));
        if (!jaSugerido) tarefas.push(guardarNoCatalogo({ grupo: 'modelo', nome: i.modelo, marca: i.marca, familia: i.familia || FAMILIA_OUTROS }));
      });
    }
    if (variacaoAtual === VARIACAO_OUTRA && dados.variacao && CAD.variacaoOutraGuardar.checked) {
      const grupo = tipoAtual === 'capinhas' ? 'linha_capinha' : 'tipo_pelicula';
      const atual = variacoesDoTipo(tipoAtual);
      if (!atual.some(v => chaveNome(v) === chaveNome(dados.variacao))) {
        tarefas.push(salvarListaVariacoes(grupo, [...atual, dados.variacao]).then(r => {
          if (r.ok) variacaoAtual = dados.variacao;
        }));
      }
    }
    await Promise.allSettled(tarefas);
  }

  const criados = data?.criados?.length || 0;
  const somados = data?.somados?.length || 0;
  const partes = [];
  if (criados) partes.push(`${criados} ${pluralize(criados, 'produto cadastrado', 'produtos cadastrados')}`);
  if (somados) partes.push(`${somados} ${pluralize(somados, 'somado', 'somados')} ao estoque`);
  showToast(partes.length ? `${partes.join(' e ')}.` : 'Pronto.', 'success', 4500);
  return true;
}

async function salvarEdicao(dados) {
  const item = dados.itens[0];
  const conflito = produtoExistente(tipoAtual, item.marca, item.modelo, dados.variacao);
  if (conflito) {
    showToast(`Já existe outro produto igual (${nomeProduto(conflito)}${conflito.variacao ? ` · ${conflito.variacao}` : ''}). Mude o nome ou a ${rotuloVariacao(tipoAtual).toLowerCase()}.`, 'error', 6000);
    return false;
  }

  const campos = {
    type: tipoAtual,
    brand: item.marca || '',
    model: item.modelo,
    price: precoVendaDoItem(item),
    quantity: item.quantidade,
    notes: dados.notas,
    estoque_minimo: item.minimo,
  };
  // Só manda a coluna nova quando faz sentido, para editar continuar funcionando
  // mesmo antes do sql/013 rodar.
  if (temVariacao() || produtoEmEdicao.variacao) campos.variacao = temVariacao() ? dados.variacao : null;

  const ok = await updateProductRow(produtoEmEdicao.id, campos);
  if (!ok) return false;

  const custo = precoCustoDoItem(item);
  await salvarCusto(produtoEmEdicao.id, custo === undefined ? null : custo);
  showToast(`${[item.marca, item.modelo].filter(Boolean).join(' ')} atualizado.`, 'success');
  return true;
}

async function handleSalvarCadastro(event) {
  event.preventDefault();
  if (salvandoCadastro) return;

  const dados = validarCadastro();
  if (dados.erro) {
    showToast(dados.erro, 'error', 5000);
    dados.foco?.focus();
    renderLote();
    atualizarResumo();
    return;
  }

  salvandoCadastro = true;
  CAD.salvar.disabled = true;
  const textoOriginal = CAD.salvar.textContent;
  CAD.salvar.innerHTML = '<i class="ti ti-loader-2"></i>Salvando...';

  try {
    const editando = Boolean(produtoEmEdicao);
    const ok = editando ? await salvarEdicao(dados) : await salvarNovos(dados);
    if (!ok) { CAD.salvar.textContent = textoOriginal; return; }

    await recarregarProdutos();

    if (editando) {
      resetForm();
      changeTab('estoque');
    } else {
      limparParaProximoLote();
    }
  } finally {
    salvandoCadastro = false;
    CAD.salvar.disabled = false;
    atualizarResumo();
  }
}

// Depois de salvar: mantém categoria, linha e marca (pra continuar cadastrando rápido)
// e limpa o resto.
function limparParaProximoLote() {
  lote = [];
  CAD.preco.value = '';
  CAD.custo.value = '';
  CAD.qtdPadrao.value = '';
  CAD.minPadrao.value = '';
  CAD.notas.value = '';
  CAD.busca.value = '';
  renderVariacoes();
  renderMarcas();
  renderModelos();
  renderLote();
  atualizarResumo();
}

// ---- Edição de produto existente ---------------------------------------------------------

function startEditProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  produtoEmEdicao = product;
  CAD.tipoAparelhoBtn.classList.toggle('hidden', product.type !== 'aparelhos');
  tipoAtual = product.type;
  variacaoAtual = product.variacao || null;
  marcaAtual = limparNome(product.brand);
  familiaAtual = null;

  const custo = custoDoProduto(product.id);
  lote = [{
    ...novoItem(product.model || '', { quantidade: product.quantity }),
    marca: marcaAtual,
    minimo: Number.isInteger(product.estoque_minimo) ? product.estoque_minimo : null,
    venda: undefined,
    custo: undefined,
    novo: false,
  }];

  CAD.marca.value = '';
  CAD.preco.value = formatPriceInput(Number(product.price)) || '';
  CAD.custo.value = custo === null ? '' : formatPriceInput(custo) || 'R$ 0,00';
  CAD.notas.value = product.notes || '';
  CAD.detalhes.open = Boolean(product.notes);

  CAD.titulo.textContent = 'Editar produto';
  CAD.desc.textContent = nomeProduto(product);
  CAD.cancelar.textContent = 'Cancelar edição';

  selecionarTipoCadastro(product.type);
  changeTab('cadastro');
}

function resetForm() {
  produtoEmEdicao = null;
  lote = [];
  marcaAtual = '';
  familiaAtual = null;
  variacaoAtual = null;
  CAD.marca.value = '';
  CAD.busca.value = '';
  CAD.preco.value = '';
  CAD.custo.value = '';
  CAD.qtdPadrao.value = '';
  CAD.minPadrao.value = '';
  CAD.notas.value = '';
  CAD.livreInput.value = '';
  CAD.variacaoOutraInput.value = '';
  CAD.detalhes.open = false;
  CAD.tipoAparelhoBtn.classList.add('hidden');
  CAD.titulo.textContent = 'Novo produto';
  CAD.desc.textContent = 'Preencha as informações para adicionar um produto ao estoque.';
  CAD.cancelar.textContent = 'Cancelar';
  selecionarTipoCadastro(tipoAtual === 'aparelhos' ? 'capinhas' : tipoAtual);
}

function handleCancelar() {
  if (produtoEmEdicao) {
    resetForm();
    changeTab('estoque');
    return;
  }
  if (!lote.length) {
    resetForm();
    changeTab('estoque');
    return;
  }
  abrirModalConfirmacao({
    titulo: 'Descartar o cadastro?',
    mensagem: `Os ${lote.length} ${pluralize(lote.length, 'modelo', 'modelos')} da lista não serão salvos.`,
    textoConfirmar: 'Descartar',
    aoConfirmar: () => { resetForm(); changeTab('estoque'); },
  });
}

// Chamadas pelo app_refactored.js ao trocar de tela.
function cadastroAoSair() {
  // Edição abandonada (o usuário foi para outra tela) é descartada; um lote novo em
  // andamento fica guardado até ele voltar.
  if (produtoEmEdicao) resetForm();
}

function cadastroAoEntrar() {
  renderVariacoes();
  renderMarcas();
  renderModelos();
  atualizarResumo();
}

function cadastroAoCarregar() {
  cadastroAoEntrar();
  renderLote();
}

// ---- Máscara de dinheiro -----------------------------------------------------------------

function ligarCampoDinheiro(input) {
  input.addEventListener('focus', () => {
    if (!input.value.trim()) return;
    const v = parsePriceValue(input.value);
    input.value = v ? v.toString().replace('.', ',') : '0';
  });
  input.addEventListener('blur', () => {
    if (!input.value.trim()) { input.value = ''; atualizarResumo(); return; }
    input.value = formatPriceInput(parsePriceValue(input.value)) || 'R$ 0,00';
    // Preço padrão mudou: as linhas que somam ao estoque mostram o preço novo.
    renderLote();
    atualizarResumo();
  });
  input.addEventListener('input', atualizarResumo);
}

// ---- Inicialização -------------------------------------------------------------------------

function initCadastro() {
  CAD.form.addEventListener('submit', handleSalvarCadastro);
  CAD.cancelar.addEventListener('click', handleCancelar);

  CAD.tipoBotoes.forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.type === tipoAtual) return;
    if (produtoEmEdicao?.type === 'aparelhos' && btn.dataset.type !== 'aparelhos') {
      showToast('Aparelho cadastrado antes não pode mudar de categoria.', 'warning');
      return;
    }
    selecionarTipoCadastro(btn.dataset.type);
  }));

  CAD.variacaoChips.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-variacao]');
    if (chip) escolherVariacao(chip.dataset.variacao);
  });
  CAD.variacaoOutraInput.addEventListener('input', () => {
    lote.forEach(i => { i.decisao = null; });
    renderLote();
    atualizarResumo();
  });
  CAD.variacaoOutraInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); CAD.variacaoOutraInput.blur(); } });
  CAD.variacaoEditar.addEventListener('click', () => changeTab('config'));

  CAD.marcaChips.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-marca]');
    if (!chip) return;
    CAD.marca.value = '';
    definirMarca(chaveNome(chip.dataset.marca) === chaveNome(marcaAtual) && !produtoEmEdicao ? '' : chip.dataset.marca);
  });
  CAD.marca.addEventListener('change', () => { if (CAD.marca.value.trim()) definirMarca(CAD.marca.value); });
  CAD.marca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); if (CAD.marca.value.trim()) definirMarca(CAD.marca.value); }
  });

  CAD.familias.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-familia]');
    if (!tab) return;
    familiaAtual = tab.dataset.familia;
    renderModelos();
  });
  CAD.busca.addEventListener('input', renderModelos);
  CAD.busca.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const visiveis = modelosVisiveis();
    if (visiveis.length === 1) { alternarModelo(visiveis[0].modelo, visiveis[0].familia); CAD.busca.select(); }
  });
  CAD.chips.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-modelo]');
    if (chip) alternarModelo(chip.dataset.modelo, chip.dataset.familia || null);
  });
  CAD.marcarTodos.addEventListener('click', marcarTodosVisiveis);

  CAD.livreAdd.addEventListener('click', adicionarModeloLivre);
  CAD.livreInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); adicionarModeloLivre(); }
  });

  CAD.lista.addEventListener('click', handleCliqueLista);
  CAD.lista.addEventListener('input', handleInputLista);
  CAD.lista.addEventListener('focusout', handleSaidaLista);
  // Enter dentro da lista não envia o formulário sem querer.
  CAD.lista.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); e.target.blur(); }
  });
  CAD.lista.addEventListener('focusin', (e) => {
    if (e.target.matches('.item-venda, .item-custo') && e.target.value.trim()) {
      const v = parsePriceValue(e.target.value);
      e.target.value = v ? v.toString().replace('.', ',') : '0';
    }
  });

  CAD.qtdAplicar.addEventListener('click', aplicarQuantidadePadrao);
  CAD.minAplicar.addEventListener('click', aplicarMinimoPadrao);
  [CAD.qtdPadrao, CAD.minPadrao].forEach(el => el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); (el === CAD.qtdPadrao ? aplicarQuantidadePadrao : aplicarMinimoPadrao)(); }
  }));

  ligarCampoDinheiro(CAD.preco);
  ligarCampoDinheiro(CAD.custo);

  selecionarTipoCadastro('capinhas');
}
