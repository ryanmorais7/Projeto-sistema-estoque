// ============================================
// VENDER · frente de caixa
// ============================================
// Busca → toque no produto (entra 1 no carrinho) → ajusta quantidades → Finalizar.
// A venda inteira vai numa chamada só (registrar_venda_carrinho, sql/013): baixa o
// estoque de todos os itens e grava no livro-caixa, ou não faz nada se algo der errado.
// O venda_id é criado quando o carrinho recebe o primeiro item e serve de chave contra
// clique duplo: tentar de novo com o mesmo id nunca vende duas vezes.
// Preço é sempre o de cadastro (desconto ainda não existe no sistema).

const PDV = {
  busca: $('pdv-busca'),
  categorias: $('pdv-categorias'),
  lista: $('pdv-lista'),
  vazio: $('pdv-vazio'),
  vazioTexto: $('pdv-vazio-texto'),
  carrinho: $('pdv-carrinho'),
  backdrop: $('pdv-backdrop'),
  itens: $('pdv-itens'),
  carrinhoVazio: $('pdv-carrinho-vazio'),
  qtdItens: $('pdv-qtd-itens'),
  unidades: $('pdv-unidades'),
  subtotal: $('pdv-subtotal'),
  total: $('pdv-total'),
  finalizar: $('pdv-finalizar'),
  limpar: $('pdv-limpar'),
  fechar: $('pdv-fechar'),
  abrir: $('pdv-abrir'),
  barraQtd: $('pdv-barra-qtd'),
  barraTotal: $('pdv-barra-total'),
};

const PDV_LIMITE_LISTA = 80;

let carrinho = []; // [{ produtoId, quantidade }]
let vendaIdAtual = null;
let tipoPdv = '';
let finalizandoVenda = false;
let ultimoAdicionado = null;

function novoIdVenda() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  // Navegadores antigos: UUID v4 a partir de números aleatórios.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function produtoDoCarrinho(item) {
  return products.find(p => p.id === item.produtoId) || null;
}

function qtdNoCarrinho(produtoId) {
  return carrinho.find(i => i.produtoId === produtoId)?.quantidade || 0;
}

// ---- Lista de produtos --------------------------------------------------------------

function produtosPdv() {
  const termo = PDV.busca.value;
  return products
    .filter(p => (!tipoPdv || p.type === tipoPdv) && matchesSearchTerm(p, termo))
    .sort((a, b) => (b.quantity > 0) - (a.quantity > 0) || nomeProduto(a).localeCompare(nomeProduto(b), 'pt-BR'));
}

function renderPdv() {
  const lista = produtosPdv();
  const mostrados = lista.slice(0, PDV_LIMITE_LISTA);

  PDV.lista.innerHTML = mostrados.map(p => {
    const noCarrinho = qtdNoCarrinho(p.id);
    const semEstoque = p.quantity <= 0;
    const esgotouNoCarrinho = noCarrinho >= p.quantity;
    const meta = metaProduto(p, { comCategoria: true });
    return `
      <li class="pdv-item${semEstoque ? ' sem-estoque' : ''}${ultimoAdicionado === p.id ? ' flash' : ''}" data-id="${p.id}">
        <span class="produto-icone"><i class="ti ${TIPO_ICONES[p.type] || 'ti-package'}"></i></span>
        <div style="min-width:0">
          <div class="produto-nome">${esc(nomeProduto(p))}</div>
          <div class="produto-meta">${meta}${meta ? '<span class="sep">·</span>' : ''}${semEstoque ? 'sem estoque' : `${p.quantity} em estoque`}</div>
        </div>
        <span class="pdv-item-preco">${formatCurrency(p.price)}</span>
        <button type="button" class="pdv-add${noCarrinho ? ' no-carrinho' : ''}" ${semEstoque || esgotouNoCarrinho ? 'disabled' : ''}
          aria-label="${noCarrinho ? `${noCarrinho} no carrinho. Adicionar mais 1` : 'Adicionar ao carrinho'}: ${esc(nomeProduto(p))}">
          ${noCarrinho ? `<span class="pdv-add-qtd">${noCarrinho}</span>` : '<i class="ti ti-plus"></i>'}
        </button>
      </li>`;
  }).join('');
  ultimoAdicionado = null;

  const vazio = lista.length === 0;
  PDV.vazio.classList.toggle('hidden', !vazio);
  if (vazio) {
    PDV.vazioTexto.textContent = products.length === 0
      ? (souDono() ? 'Nenhum produto cadastrado ainda. Cadastre em Produtos.' : 'Nenhum produto cadastrado ainda.')
      : 'Nenhum produto encontrado com essa busca.';
  }
  if (lista.length > PDV_LIMITE_LISTA) {
    PDV.lista.insertAdjacentHTML('beforeend', `<li class="empty-inline" style="padding:12px 8px">Mostrando ${PDV_LIMITE_LISTA} de ${lista.length}. Digite na busca para achar mais rápido.</li>`);
  }

  // Produto que sumiu (arquivado/excluído) ou ficou com menos estoque sai/ajusta no carrinho.
  carrinho = carrinho
    .map(i => {
      const p = produtoDoCarrinho(i);
      return p ? { ...i, quantidade: Math.min(i.quantidade, Math.max(p.quantity, 0)) } : null;
    })
    .filter(i => i && i.quantidade > 0);
  renderCarrinho();
}

// ---- Carrinho ----------------------------------------------------------------------------

function adicionarAoCarrinho(produtoId) {
  const p = products.find(x => x.id === produtoId);
  if (!p) return;
  const atual = qtdNoCarrinho(produtoId);
  if (atual >= p.quantity) {
    showToast(p.quantity <= 0 ? `${nomeProduto(p)} está sem estoque.` : `Só tem ${p.quantity} de ${nomeProduto(p)} em estoque.`, 'warning');
    return;
  }

  if (!vendaIdAtual) vendaIdAtual = novoIdVenda();
  const item = carrinho.find(i => i.produtoId === produtoId);
  if (item) item.quantidade += 1;
  else carrinho.push({ produtoId, quantidade: 1, novo: true });

  ultimoAdicionado = produtoId;
  renderPdv();

  PDV.abrir.classList.remove('pulso');
  void PDV.abrir.offsetWidth; // reinicia a animação
  PDV.abrir.classList.add('pulso');
}

function alterarQuantidade(produtoId, delta) {
  const item = carrinho.find(i => i.produtoId === produtoId);
  const p = products.find(x => x.id === produtoId);
  if (!item || !p) return;
  const nova = item.quantidade + delta;
  if (nova > p.quantity) {
    showToast(`Só tem ${p.quantity} em estoque.`, 'warning');
    return;
  }
  definirQuantidade(produtoId, nova);
}

function definirQuantidade(produtoId, quantidade) {
  const p = products.find(x => x.id === produtoId);
  if (!p) return;
  const q = Math.max(0, Math.min(Math.floor(Number(quantidade) || 0), p.quantity));
  if (q === 0) carrinho = carrinho.filter(i => i.produtoId !== produtoId);
  else carrinho.find(i => i.produtoId === produtoId).quantidade = q;
  if (!carrinho.length) vendaIdAtual = null;
  renderPdv();
}

function limparCarrinho() {
  carrinho = [];
  vendaIdAtual = null;
  if (PDV.lista) renderPdv();
  fecharCarrinhoMobile();
}

function totaisCarrinho() {
  return carrinho.reduce((acc, i) => {
    const p = produtoDoCarrinho(i);
    if (!p) return acc;
    acc.unidades += i.quantidade;
    acc.total += Number(p.price) * i.quantidade;
    return acc;
  }, { unidades: 0, total: 0 });
}

function renderCarrinho() {
  PDV.itens.innerHTML = carrinho.map(i => {
    const p = produtoDoCarrinho(i);
    if (!p) return '';
    const html = `
      <li class="pdv-carrinho-item${i.novo ? ' entrou' : ''}" data-id="${p.id}">
        <div style="min-width:0">
          <div class="produto-nome">${esc(nomeProduto(p))}</div>
          <div class="produto-meta">${p.variacao ? `${esc(p.variacao)}<span class="sep">·</span>` : ''}${formatCurrency(p.price)} cada</div>
        </div>
        <span class="pdv-carrinho-item-total">${formatCurrency(Number(p.price) * i.quantidade)}</span>
        <div class="pdv-carrinho-item-controles">
          <div class="stepper stepper--sm">
            <button type="button" data-pdv="menos" aria-label="Tirar 1 de ${esc(nomeProduto(p))}"><i class="ti ti-minus"></i></button>
            <input type="number" min="1" max="${p.quantity}" value="${i.quantidade}" data-pdv="qtd" inputmode="numeric" aria-label="Quantidade de ${esc(nomeProduto(p))}" />
            <button type="button" data-pdv="mais" ${i.quantidade >= p.quantity ? 'disabled' : ''} aria-label="Mais 1 de ${esc(nomeProduto(p))}"><i class="ti ti-plus"></i></button>
          </div>
          <button type="button" class="btn-link" data-pdv="remover" style="color:var(--red-ink)">Remover</button>
        </div>
      </li>`;
    i.novo = false;
    return html;
  }).join('');

  const { unidades, total } = totaisCarrinho();
  const vazio = carrinho.length === 0;
  PDV.carrinhoVazio.classList.toggle('hidden', !vazio);
  PDV.limpar.classList.toggle('hidden', vazio);
  PDV.qtdItens.textContent = carrinho.length;
  PDV.unidades.textContent = unidades;
  PDV.subtotal.textContent = formatCurrency(total);
  PDV.total.textContent = formatCurrency(total);
  PDV.finalizar.disabled = vazio || finalizandoVenda;
  PDV.barraQtd.textContent = unidades;
  PDV.barraTotal.textContent = formatCurrency(total);
  PDV.abrir.classList.toggle('vazia', vazio);
  if (vazio) fecharCarrinhoMobile();
}

function abrirCarrinhoMobile() {
  PDV.carrinho.classList.add('aberto');
  PDV.backdrop.classList.add('active');
  PDV.finalizar.focus({ preventScroll: true });
}

function fecharCarrinhoMobile() {
  PDV.carrinho?.classList.remove('aberto');
  PDV.backdrop?.classList.remove('active');
}

// ---- Finalizar -----------------------------------------------------------------------------

function textoComprovante(movs) {
  const total = movs.reduce((s, m) => s + Number(m.total), 0);
  return [
    `Comprovante de venda · ${lojaAtual?.nome || 'Vault'}`,
    formatarDataHora(movs[0]?.created_at || new Date().toISOString()),
    '',
    ...movs.map(m => `${Math.abs(m.quantidade)}x ${nomeProduto(m.produto_snapshot || {})}${m.produto_snapshot?.variacao ? ` (${m.produto_snapshot.variacao})` : ''} · ${formatCurrency(m.total)}`),
    '',
    `Total: ${formatCurrency(total)}`,
    '',
    'Comprovante simples, não é nota fiscal.',
  ].join('\n');
}

function abrirModalVendaConcluida(movs) {
  const total = movs.reduce((s, m) => s + Number(m.total), 0);
  const unidades = movs.reduce((s, m) => s + Math.abs(m.quantidade), 0);

  abrirModal(`
    <div class="sucesso-icone"><i class="ti ti-check"></i></div>
    <h3 class="modal-title modal-title--center">Venda concluída</h3>
    <p class="modal-message" style="text-align:center">${unidades} ${pluralize(unidades, 'item', 'itens')} · ${formatCurrency(total)}</p>
    <div class="recibo">
      ${movs.map(m => `
        <div class="recibo-item"><span>${Math.abs(m.quantidade)}× ${esc(nomeProduto(m.produto_snapshot || {}))}</span><span>${formatCurrency(m.total)}</span></div>
      `).join('')}
      <div class="recibo-item recibo-total"><span>Total</span><span>${formatCurrency(total)}</span></div>
      <div class="recibo-data">${formatarDataHora(movs[0]?.created_at || new Date().toISOString())}</div>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" id="venda-copiar"><i class="ti ti-copy"></i>Copiar comprovante</button>
      <button type="button" class="btn btn-primary" id="venda-nova" autofocus>Nova venda</button>
    </div>
  `);

  DOM.modalBody.querySelector('#venda-nova').addEventListener('click', () => { fecharModal(); PDV.busca.focus(); });
  DOM.modalBody.querySelector('#venda-copiar').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textoComprovante(movs));
      showToast('Comprovante copiado. Cole no WhatsApp do cliente.', 'success');
    } catch {
      showToast('Não foi possível copiar. Tente de novo.', 'error');
    }
  });
}

async function registrarVenda(itens) {
  const { data, error } = await supabaseClient.rpc('registrar_venda_carrinho', {
    p_itens: itens.map(i => ({ produto_id: i.produtoId, quantidade: i.quantidade })),
    p_venda_id: vendaIdAtual,
  });
  if (!error) return { movs: data || [] };

  // Banco sem o sql/013: venda de um item só ainda funciona pela função antiga, que
  // também é tudo-ou-nada. Com vários itens não dá para garantir isso, então recusa.
  if (erroDeFuncaoAusente(error) && itens.length === 1) {
    const r = await supabaseClient.rpc('registrar_venda_v2', { p_produto_id: itens[0].produtoId, p_quantidade: itens[0].quantidade });
    if (r.error) return { erro: r.error.message };
    return { movs: [r.data] };
  }
  if (erroDeFuncaoAusente(error)) {
    return { erro: 'Venda com vários produtos precisa do banco atualizado (sql/013_vault_3.sql). Por enquanto, venda um produto por vez.' };
  }
  return { erro: error.message || 'Não foi possível registrar a venda.' };
}

async function finalizarVenda() {
  if (finalizandoVenda || !carrinho.length) return;

  // Confere com o estoque que está na tela antes de enviar.
  const faltando = carrinho.find(i => (produtoDoCarrinho(i)?.quantity ?? 0) < i.quantidade);
  if (faltando) {
    showToast('Algum item ficou com mais unidades que o estoque. Confira o carrinho.', 'warning');
    renderPdv();
    return;
  }

  finalizandoVenda = true;
  PDV.finalizar.disabled = true;
  PDV.finalizar.innerHTML = '<i class="ti ti-loader-2"></i>Registrando...';

  try {
    const resultado = await registrarVenda(carrinho);
    if (resultado.erro) {
      showToast(`${resultado.erro} Nada foi vendido.`, 'error', 6000);
      await recarregarProdutos();
      return;
    }

    carrinho = [];
    vendaIdAtual = null;
    fecharCarrinhoMobile();
    await recarregarProdutos();
    abrirModalVendaConcluida(resultado.movs);
    PDV.busca.value = '';
    renderPdv();
  } finally {
    finalizandoVenda = false;
    PDV.finalizar.innerHTML = '<i class="ti ti-check"></i>Finalizar venda';
    renderCarrinho();
  }
}

// ---- Eventos -------------------------------------------------------------------------------

function initPdv() {
  PDV.busca.addEventListener('input', renderPdv);
  PDV.busca.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    // Um resultado só: Enter já adiciona (rápido para quem digita o modelo).
    const lista = produtosPdv().filter(p => p.quantity > 0);
    if (lista.length === 1) { adicionarAoCarrinho(lista[0].id); PDV.busca.select(); }
  });

  PDV.categorias.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-tipo]');
    if (!chip) return;
    tipoPdv = chip.dataset.tipo;
    PDV.categorias.querySelectorAll('[data-tipo]').forEach(c => {
      c.classList.toggle('active', c === chip);
      c.setAttribute('aria-pressed', String(c === chip));
    });
    renderPdv();
  });

  PDV.lista.addEventListener('click', (e) => {
    const linha = e.target.closest('.pdv-item');
    if (!linha || linha.classList.contains('sem-estoque')) return;
    adicionarAoCarrinho(Number(linha.dataset.id));
  });

  PDV.itens.addEventListener('click', (e) => {
    const acao = e.target.closest('[data-pdv]')?.dataset.pdv;
    const id = Number(e.target.closest('.pdv-carrinho-item')?.dataset.id);
    if (!acao || !id) return;
    if (acao === 'mais') alterarQuantidade(id, 1);
    if (acao === 'menos') alterarQuantidade(id, -1);
    if (acao === 'remover') definirQuantidade(id, 0);
  });
  PDV.itens.addEventListener('change', (e) => {
    if (e.target.dataset.pdv !== 'qtd') return;
    const id = Number(e.target.closest('.pdv-carrinho-item')?.dataset.id);
    const p = products.find(x => x.id === id);
    if (p && Number(e.target.value) > p.quantity) showToast(`Só tem ${p.quantity} em estoque.`, 'warning');
    definirQuantidade(id, e.target.value);
  });

  PDV.finalizar.addEventListener('click', finalizarVenda);
  PDV.limpar.addEventListener('click', limparCarrinho);
  PDV.abrir.addEventListener('click', abrirCarrinhoMobile);
  PDV.fechar.addEventListener('click', fecharCarrinhoMobile);
  PDV.backdrop.addEventListener('click', fecharCarrinhoMobile);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && PDV.carrinho.classList.contains('aberto')) fecharCarrinhoMobile();
  });
}
