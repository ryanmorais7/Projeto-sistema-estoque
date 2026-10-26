// ============================================
// VENDER · frente de caixa
// ============================================
// Busca → toque no produto (entra 1 no carrinho) → ajusta quantidades → desconto e
// pagamento → Finalizar.
//
// A venda inteira vai numa chamada só (registrar_venda_caixa, sql/014). O desconto é
// calculado aqui só para mostrar o total na hora; quem decide o valor final é o
// servidor, com as mesmas regras (centavos inteiros, limites e permissões). Mudar
// valores no navegador não passa dos limites.
// O venda_id é criado quando o carrinho recebe o primeiro item e serve de chave contra
// clique duplo: tentar de novo com o mesmo id nunca vende duas vezes.

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
  extras: $('pdv-extras'),
  qtdItens: $('pdv-qtd-itens'),
  unidades: $('pdv-unidades'),
  subtotal: $('pdv-subtotal'),
  descontoLinha: $('pdv-desconto-linha'),
  descontoPct: $('pdv-desconto-pct'),
  descontoValor: $('pdv-desconto-valor'),
  total: $('pdv-total'),
  descontoTipo: $('pdv-desconto-tipo'),
  desconto: $('pdv-desconto'),
  descontoLimpar: $('pdv-desconto-limpar'),
  descontoErro: $('pdv-desconto-erro'),
  pagamento: $('pdv-pagamento'),
  trocoBloco: $('pdv-troco-bloco'),
  recebido: $('pdv-recebido'),
  troco: $('pdv-troco'),
  finalizar: $('pdv-finalizar'),
  limpar: $('pdv-limpar'),
  fechar: $('pdv-fechar'),
  abrir: $('pdv-abrir'),
  barraQtd: $('pdv-barra-qtd'),
  barraTotal: $('pdv-barra-total'),
};

const PDV_LIMITE_LISTA = 80;
const CHAVE_ULTIMA_FORMA = 'caseon-ultima-forma-pagamento';

let carrinho = []; // [{ produtoId, quantidade }]
let vendaIdAtual = null;
let tipoPdv = '';
let finalizandoVenda = false;
let ultimoAdicionado = null;
let tipoDesconto = 'valor';
let formaPagamento = lerUltimaForma();

function lerUltimaForma() {
  try { return localStorage.getItem(CHAVE_ULTIMA_FORMA) || null; } catch { return null; }
}

function guardarUltimaForma(forma) {
  try { localStorage.setItem(CHAVE_ULTIMA_FORMA, forma); } catch { /* sem armazenamento: tudo bem */ }
}

function novoIdVenda() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
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
  limparDesconto();
  if (PDV.recebido) PDV.recebido.value = '';
  if (PDV.lista) renderPdv();
  fecharCarrinhoMobile();
}

function subtotalCentavos() {
  return carrinho.reduce((acc, i) => {
    const p = produtoDoCarrinho(i);
    return p ? acc + centavos(p.price) * i.quantidade : acc;
  }, 0);
}

// ---- Desconto ------------------------------------------------------------------------------

// Lê o número digitado aceitando "10", "10,5", "R$ 1.234,50" e também "10.5" (teclado
// de celular que só tem ponto): sem vírgula, um ponto seguido de 1 ou 2 dígitos no fim
// é decimal; nos outros casos o ponto é separador de milhar.
function lerNumeroDigitado(texto) {
  let limpo = String(texto ?? '').replace(/R\$|%|\s| /g, '');
  if (limpo.includes(',')) limpo = limpo.replace(/\./g, '').replace(',', '.');
  else if (!/^-?\d+\.\d{1,2}$/.test(limpo)) limpo = limpo.replace(/\./g, '');
  if (!limpo) return null;
  if (!/^-?\d*(\.\d*)?$/.test(limpo)) return NaN;
  return Number(limpo);
}

function limiteDescontoPct() {
  if (souDono()) return null;
  const limite = membroAtual?.desconto_maximo_pct;
  return limite === null || limite === undefined ? null : Number(limite);
}

// Mesmas regras do registrar_venda_caixa: { descontoC, valorEnviado, pct, erro }.
function calcularDesconto(subtotalC) {
  const valor = lerNumeroDigitado(PDV.desconto.value);
  if (valor === null || valor === 0) return { descontoC: 0, valorEnviado: 0, pct: 0, erro: null };
  if (Number.isNaN(valor)) return { descontoC: 0, erro: 'Digite só números (ex: 10 ou 10,50).' };
  if (valor < 0) return { descontoC: 0, erro: 'O desconto não pode ser negativo.' };

  let descontoC;
  let valorEnviado;
  if (tipoDesconto === 'valor') {
    descontoC = Math.round(valor * 100);
    valorEnviado = descontoC / 100;
    if (descontoC > subtotalC) return { descontoC: 0, erro: `O desconto não pode passar do subtotal (${brlC(subtotalC)}).` };
  } else {
    if (valor > 100) return { descontoC: 0, erro: 'O desconto não pode passar de 100%.' };
    const pctC = Math.round(valor * 100); // em centésimos de ponto percentual
    valorEnviado = pctC / 100;
    descontoC = Math.floor((subtotalC * pctC + 5000) / 10000);
  }

  const limite = limiteDescontoPct();
  if (limite !== null && descontoC > Math.round(subtotalC * limite / 100)) {
    return { descontoC: 0, erro: `Seu limite de desconto é ${formatarPercentual(limite)}. Peça ao dono da loja.` };
  }
  return { descontoC, valorEnviado, pct: subtotalC ? (descontoC / subtotalC) * 100 : 0, erro: null };
}

function limparDesconto() {
  if (!PDV.desconto) return;
  PDV.desconto.value = '';
  renderCarrinho();
}

function selecionarTipoDesconto(tipo) {
  tipoDesconto = tipo;
  PDV.descontoTipo.querySelectorAll('[data-tipo]').forEach(b => {
    const ativo = b.dataset.tipo === tipo;
    b.classList.toggle('active', ativo);
    b.setAttribute('aria-checked', String(ativo));
  });
  PDV.desconto.placeholder = tipo === 'valor' ? 'Sem desconto · ex: 5,00' : 'Sem desconto · ex: 10';
  renderCarrinho();
}

// ---- Pagamento ------------------------------------------------------------------------------

function selecionarForma(forma) {
  formaPagamento = forma;
  guardarUltimaForma(forma);
  renderCarrinho();
  if (forma === 'dinheiro') PDV.recebido.focus({ preventScroll: true });
}

function calcularTroco(totalC) {
  if (formaPagamento !== 'dinheiro') return { recebidoC: null, trocoC: null, erro: null };
  const valor = lerNumeroDigitado(PDV.recebido.value);
  if (valor === null) return { recebidoC: null, trocoC: null, erro: null };
  if (Number.isNaN(valor) || valor < 0) return { recebidoC: null, erro: 'Valor recebido inválido.' };
  const recebidoC = Math.round(valor * 100);
  if (recebidoC < totalC) return { recebidoC, erro: `Faltam ${brlC(totalC - recebidoC)} para o total.` };
  return { recebidoC, trocoC: recebidoC - totalC, erro: null };
}

// ---- Totais e carrinho na tela -----------------------------------------------------------------

function estadoDaVenda() {
  const subtotalC = subtotalCentavos();
  const unidades = carrinho.reduce((s, i) => s + i.quantidade, 0);
  const desc = calcularDesconto(subtotalC);
  const totalC = subtotalC - desc.descontoC;
  const troco = calcularTroco(totalC);
  return { subtotalC, unidades, desc, totalC, troco };
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
        <span class="pdv-carrinho-item-total">${brlC(centavos(p.price) * i.quantidade)}</span>
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

  const { subtotalC, unidades, desc, totalC, troco } = estadoDaVenda();
  const vazio = carrinho.length === 0;

  PDV.carrinhoVazio.classList.toggle('hidden', !vazio);
  PDV.extras.classList.toggle('hidden', vazio);
  PDV.limpar.classList.toggle('hidden', vazio);
  PDV.qtdItens.textContent = carrinho.length;
  PDV.unidades.textContent = unidades;
  PDV.subtotal.textContent = brlC(subtotalC);
  PDV.total.textContent = brlC(totalC);

  // Desconto
  PDV.descontoLimpar.classList.toggle('hidden', !PDV.desconto.value);
  PDV.descontoErro.textContent = desc.erro || '';
  PDV.descontoErro.classList.toggle('hidden', !desc.erro);
  PDV.desconto.setAttribute('aria-invalid', String(Boolean(desc.erro)));
  PDV.descontoLinha.classList.toggle('hidden', !desc.descontoC);
  PDV.descontoValor.textContent = `− ${brlC(desc.descontoC)}`;
  PDV.descontoPct.textContent = desc.descontoC ? `(${formatarPercentual(Math.round(desc.pct * 10) / 10)})` : '';
  const limite = limiteDescontoPct();
  PDV.desconto.title = limite !== null ? `Seu limite: ${formatarPercentual(limite)}` : '';

  // Pagamento e troco
  PDV.pagamento.querySelectorAll('[data-forma]').forEach(b => {
    const ativo = b.dataset.forma === formaPagamento;
    b.classList.toggle('active', ativo);
    b.setAttribute('aria-checked', String(ativo));
  });
  PDV.trocoBloco.classList.toggle('hidden', formaPagamento !== 'dinheiro');
  if (troco.erro) {
    PDV.troco.textContent = troco.erro;
    PDV.troco.className = 'troco-valor troco-valor--erro';
  } else if (troco.trocoC !== null && troco.trocoC !== undefined) {
    PDV.troco.textContent = `Troco: ${brlC(troco.trocoC)}`;
    PDV.troco.className = 'troco-valor';
  } else {
    PDV.troco.textContent = '';
    PDV.troco.className = 'troco-valor';
  }

  // Botão
  const bloqueio = vazio ? 'vazio' : desc.erro ? 'desconto' : !formaPagamento ? 'pagamento' : troco.erro ? 'troco' : null;
  PDV.finalizar.disabled = Boolean(bloqueio) || finalizandoVenda;
  if (!finalizandoVenda) {
    PDV.finalizar.innerHTML = bloqueio === 'pagamento'
      ? '<i class="ti ti-hand-click"></i>Escolha o pagamento'
      : '<i class="ti ti-check"></i>Finalizar venda';
  }

  PDV.barraQtd.textContent = unidades;
  PDV.barraTotal.textContent = brlC(totalC);
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

// ---- Comprovante -------------------------------------------------------------------------

function textoComprovante(venda, itens) {
  const linhas = [
    `Comprovante de venda · ${lojaAtual?.nome || 'CASEON'}`,
    `${venda?.numero ? `Venda nº ${venda.numero} · ` : ''}${formatarDataHora(venda?.created_at || itens[0]?.created_at || new Date().toISOString())}`,
    '',
    ...itens.map(m => `${Math.abs(m.quantidade)}x ${nomeProduto(m.produto_snapshot || {})}${m.produto_snapshot?.variacao ? ` (${m.produto_snapshot.variacao})` : ''} · ${formatCurrency(m.subtotal ?? m.total)}`),
    '',
  ];
  const desconto = centavos(venda?.desconto);
  if (desconto) {
    linhas.push(`Subtotal: ${formatCurrency(venda.subtotal)}`);
    linhas.push(`Desconto: − ${formatCurrency(venda.desconto)}`);
  }
  linhas.push(`Total: ${formatCurrency(venda?.total ?? itens.reduce((s, m) => s + Number(m.total), 0))}`);
  if (venda?.forma_pagamento) linhas.push(`Pagamento: ${rotuloPagamento(venda.forma_pagamento)}`);
  if (venda?.valor_recebido !== null && venda?.valor_recebido !== undefined) {
    linhas.push(`Recebido: ${formatCurrency(venda.valor_recebido)} · Troco: ${formatCurrency(venda.troco)}`);
  }
  linhas.push('', 'Comprovante simples, não é nota fiscal.');
  return linhas.join('\n');
}

function abrirModalVendaConcluida(venda, itens) {
  const total = venda ? Number(venda.total) : itens.reduce((s, m) => s + Number(m.total), 0);
  const unidades = itens.reduce((s, m) => s + Math.abs(m.quantidade), 0);
  const temDesconto = venda && centavos(venda.desconto) > 0;
  const temTroco = venda && venda.valor_recebido !== null && venda.valor_recebido !== undefined;

  abrirModal(`
    <div class="sucesso-icone"><i class="ti ti-check"></i></div>
    <h3 class="modal-title modal-title--center">Venda concluída</h3>
    <p class="modal-message" style="text-align:center">${venda?.numero ? `Venda nº ${venda.numero} · ` : ''}${unidades} ${pluralize(unidades, 'item', 'itens')} · ${formatCurrency(total)}</p>
    <div class="recibo">
      ${itens.map(m => `
        <div class="recibo-item"><span>${Math.abs(m.quantidade)}× ${esc(nomeProduto(m.produto_snapshot || {}))}</span><span>${formatCurrency(m.subtotal ?? m.total)}</span></div>
      `).join('')}
      ${temDesconto ? `
        <div class="recibo-item recibo-sub"><span>Subtotal</span><span>${formatCurrency(venda.subtotal)}</span></div>
        <div class="recibo-item recibo-desconto"><span>Desconto</span><span>− ${formatCurrency(venda.desconto)}</span></div>` : ''}
      <div class="recibo-item recibo-total"><span>Total</span><span>${formatCurrency(total)}</span></div>
      ${venda?.forma_pagamento ? `<div class="recibo-item"><span>Pagamento</span><span>${esc(rotuloPagamento(venda.forma_pagamento))}</span></div>` : ''}
      ${temTroco ? `<div class="recibo-item"><span>Recebido · troco</span><span>${formatCurrency(venda.valor_recebido)} · ${formatCurrency(venda.troco)}</span></div>` : ''}
      <div class="recibo-data">${formatarDataHora(venda?.created_at || itens[0]?.created_at || new Date().toISOString())}</div>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-secondary" id="venda-copiar"><i class="ti ti-copy"></i>Copiar comprovante</button>
      <button type="button" class="btn btn-primary" id="venda-nova" autofocus>Nova venda</button>
    </div>
  `);

  DOM.modalBody.querySelector('#venda-nova').addEventListener('click', () => { fecharModal(); PDV.busca.focus(); });
  DOM.modalBody.querySelector('#venda-copiar').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textoComprovante(venda, itens));
      showToast('Comprovante copiado. Cole no WhatsApp do cliente.', 'success');
    } catch {
      showToast('Não foi possível copiar. Tente de novo.', 'error');
    }
  });
}

// ---- Finalizar -----------------------------------------------------------------------------

async function registrarVenda(itens, desc, troco) {
  const itensRpc = itens.map(i => ({ produto_id: i.produtoId, quantidade: i.quantidade }));
  const { data, error } = await supabaseClient.rpc('registrar_venda_caixa', {
    p_itens: itensRpc,
    p_venda_id: vendaIdAtual,
    p_desconto_tipo: desc.descontoC ? tipoDesconto : null,
    p_desconto_valor: desc.descontoC ? desc.valorEnviado : 0,
    p_forma_pagamento: formaPagamento,
    p_valor_recebido: troco.recebidoC !== null && troco.recebidoC !== undefined ? troco.recebidoC / 100 : null,
  });
  if (!error) return { venda: data.venda, itens: data.itens || [] };

  if (!erroDeFuncaoAusente(error)) return { erro: error.message || 'Não foi possível registrar a venda.' };

  // Banco sem o sql/014: desconto e forma de pagamento ainda não têm onde ser gravados.
  if (desc.descontoC) {
    return { erro: 'Desconto precisa do banco atualizado (sql/014_vendas_descontos.sql). Venda sem desconto por enquanto.' };
  }
  const r013 = await supabaseClient.rpc('registrar_venda_carrinho', { p_itens: itensRpc, p_venda_id: vendaIdAtual });
  if (!r013.error) return { venda: null, itens: r013.data || [] };
  if (erroDeFuncaoAusente(r013.error) && itens.length === 1) {
    const r = await supabaseClient.rpc('registrar_venda_v2', { p_produto_id: itens[0].produtoId, p_quantidade: itens[0].quantidade });
    if (r.error) return { erro: r.error.message };
    return { venda: null, itens: [r.data] };
  }
  if (erroDeFuncaoAusente(r013.error)) {
    return { erro: 'Venda com vários produtos precisa do banco atualizado (sql/013 e 014). Por enquanto, venda um produto por vez.' };
  }
  return { erro: r013.error.message || 'Não foi possível registrar a venda.' };
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
  const { desc, troco } = estadoDaVenda();
  if (desc.erro || troco.erro || !formaPagamento) {
    renderCarrinho();
    return;
  }

  finalizandoVenda = true;
  PDV.finalizar.disabled = true;
  PDV.finalizar.innerHTML = '<i class="ti ti-loader-2"></i>Registrando...';

  try {
    const resultado = await registrarVenda(carrinho, desc, troco);
    if (resultado.erro) {
      showToast(`${resultado.erro} Nada foi vendido.`, 'error', 6000);
      await recarregarProdutos();
      return;
    }

    carrinho = [];
    vendaIdAtual = null;
    PDV.desconto.value = '';
    PDV.recebido.value = '';
    fecharCarrinhoMobile();
    await recarregarProdutos();
    abrirModalVendaConcluida(resultado.venda, resultado.itens);
    PDV.busca.value = '';
    renderPdv();
  } finally {
    finalizandoVenda = false;
    renderCarrinho();
  }
}

// ---- Máscara de dinheiro nos campos do carrinho ---------------------------------------------

function formatarCampoNoBlur(input, comoMoeda) {
  input.addEventListener('blur', () => {
    const v = lerNumeroDigitado(input.value);
    if (v === null || Number.isNaN(v) || v < 0) return;
    if (comoMoeda()) input.value = formatPriceInput(Math.round(v * 100) / 100) || '';
    else input.value = String(Math.round(v * 100) / 100).replace('.', ',');
  });
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

  PDV.descontoTipo.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tipo]');
    if (b) selecionarTipoDesconto(b.dataset.tipo);
  });
  PDV.desconto.addEventListener('input', renderCarrinho);
  PDV.desconto.addEventListener('focus', () => {
    const v = lerNumeroDigitado(PDV.desconto.value);
    if (v !== null && !Number.isNaN(v)) PDV.desconto.value = String(v).replace('.', ',');
  });
  formatarCampoNoBlur(PDV.desconto, () => tipoDesconto === 'valor');
  PDV.descontoLimpar.addEventListener('click', () => { limparDesconto(); PDV.desconto.focus(); });

  PDV.pagamento.addEventListener('click', (e) => {
    const b = e.target.closest('[data-forma]');
    if (b) selecionarForma(b.dataset.forma);
  });
  PDV.recebido.addEventListener('input', renderCarrinho);
  PDV.recebido.addEventListener('focus', () => {
    const v = lerNumeroDigitado(PDV.recebido.value);
    if (v !== null && !Number.isNaN(v)) PDV.recebido.value = String(v).replace('.', ',');
  });
  formatarCampoNoBlur(PDV.recebido, () => true);

  PDV.finalizar.addEventListener('click', finalizarVenda);
  PDV.limpar.addEventListener('click', limparCarrinho);
  PDV.abrir.addEventListener('click', abrirCarrinhoMobile);
  PDV.fechar.addEventListener('click', fecharCarrinhoMobile);
  PDV.backdrop.addEventListener('click', fecharCarrinhoMobile);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && PDV.carrinho.classList.contains('aberto')) fecharCarrinhoMobile();
  });

  selecionarTipoDesconto('valor');
}
