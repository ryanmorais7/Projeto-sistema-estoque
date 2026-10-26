// ============================================
// VENDER · histórico de vendas
// ============================================
// Uma linha por venda (os itens do carrinho ficam juntos). Vendas antigas, de antes do
// carrinho, aparecem uma por item e sem número.
// Ao abrir uma venda: itens, valores, pagamento e as correções (devolução/cancelamento).
// Cancelar e devolver só o dono pode, e nada é apagado: o banco grava lançamentos novos
// (sql/014), o estoque volta e o faturamento do dia da correção diminui.

const HIST = {
  busca: $('hist-busca'),
  periodo: $('hist-periodo'),
  custom: $('hist-periodo-custom'),
  de: $('hist-de'),
  ate: $('hist-ate'),
  forma: $('hist-forma'),
  csv: $('hist-csv'),
  tabela: $('hist-tabela'),
  corpo: $('hist-corpo'),
  vazio: $('hist-vazio'),
  vazioTexto: $('hist-vazio-texto'),
  contagem: $('hist-contagem'),
  total: $('hist-total'),
  hoje: $('resumo-vendas-hoje'),
  semana: $('resumo-vendas-7dias'),
  mes: $('resumo-vendas-mes'),
};

const COLUNAS_MOVIMENTO = 'id, tipo, produto_id, produto_snapshot, quantidade, preco_unitario, subtotal, desconto, total, venda_id, motivo, responsavel_email, created_at';

let vendasHistorico = [];
let intervaloHistorico = () => intervaloPeriodo('30');
let requisicaoHistorico = 0;

// Junta os lançamentos em vendas.
function agruparVendas(lancamentos) {
  const mapa = new Map();
  lancamentos.forEach(m => {
    const chave = chaveVenda(m);
    if (!mapa.has(chave)) {
      mapa.set(chave, {
        chave, vendaId: m.venda_id || null, numero: m.venda_numero || null,
        status: m.venda_status || 'concluida', forma: m.forma_pagamento || null,
        data: m.venda_created_at || m.created_at, vendedor: m.responsavel_email,
        itens: [], correcoes: [],
      });
    }
    const v = mapa.get(chave);
    if ((m.tipo || 'venda') === 'venda') {
      v.itens.push(m);
      v.data = m.venda_created_at || m.created_at;
      v.vendedor = m.responsavel_email;
    } else {
      v.correcoes.push(m);
    }
  });

  return [...mapa.values()]
    .filter(v => v.itens.length) // devolução de venda de outro período: não vira linha
    .map(v => ({
      ...v,
      subtotalC: v.itens.reduce((s, m) => s + centavos(m.subtotal ?? m.total), 0),
      descontoC: v.itens.reduce((s, m) => s + centavos(m.desconto), 0),
      totalC: v.itens.reduce((s, m) => s + centavos(m.total), 0),
      unidades: v.itens.reduce((s, m) => s + Math.abs(m.quantidade), 0),
    }))
    .sort((a, b) => new Date(b.data) - new Date(a.data));
}

function textoProdutos(v) {
  const nomes = v.itens.map(m => nomeProduto(m.produto_snapshot || {}));
  return nomes.length <= 2 ? nomes.join(', ') : `${nomes.slice(0, 2).join(', ')} e mais ${nomes.length - 2}`;
}

function badgeStatusVenda(status) {
  const s = STATUS_VENDA[status] || STATUS_VENDA.concluida;
  return `<span class="badge ${s.classe}">${s.label}</span>`;
}

function filtrarVendasHistorico() {
  const termo = HIST.busca.value.trim();
  const forma = HIST.forma.value;
  const numero = termo.replace(/^#|^n[ºo°]?\s*/i, '');
  const buscaNumero = /^\d+$/.test(numero) ? Number(numero) : null;

  return vendasHistorico.filter(v => {
    if (forma && (v.forma || 'nao_informado') !== forma) return false;
    if (!termo) return true;
    if (buscaNumero !== null && v.numero === buscaNumero) return true;
    return v.itens.some(m => matchesSearchTerm(m.produto_snapshot || {}, termo));
  });
}

// "26/10 18:17" (com o ano só quando não é o ano atual).
function dataCurta(iso) {
  const d = new Date(iso);
  const opcoes = { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' };
  if (d.getFullYear() !== new Date().getFullYear()) opcoes.year = '2-digit';
  return d.toLocaleString('pt-BR', opcoes).replace(',', '');
}

function vendedorCurto(email) {
  const nome = nomeDoVendedor(email);
  return `<span class="vendedor-chip" title="${esc(nome)}"><span class="avatar avatar--sm avatar--soft">${esc(obterIniciaisPessoa(nome))}</span>${esc(nome.split(' ')[0])}</span>`;
}

function renderHistorico() {
  const lista = filtrarVendasHistorico();
  HIST.tabela.classList.toggle('hidden', lista.length === 0);
  HIST.vazio.classList.toggle('hidden', lista.length > 0);
  HIST.vazioTexto.textContent = vendasHistorico.length ? 'Nenhuma venda com esses filtros.' : 'Nenhuma venda nesse período.';

  HIST.corpo.innerHTML = lista.map(v => `
    <tr data-venda="${esc(v.chave)}" tabindex="0" class="${v.status === 'cancelada' ? 'row-arquivado' : ''}">
      <td data-label="Nº"><strong>${v.numero ? `#${v.numero}` : '<span class="texto-muted">—</span>'}</strong></td>
      <td data-label="Data" class="texto-muted nowrap" title="${formatarDataHora(v.data)}">${dataCurta(v.data)}</td>
      <td data-label="" class="td-titulo"><span class="hist-produtos">${esc(textoProdutos(v))}</span></td>
      <td data-label="Quantidade" class="num">${v.unidades}</td>
      <td data-label="Subtotal" class="num col-subtotal">${brlC(v.subtotalC)}</td>
      <td data-label="Desconto" class="num">${v.descontoC ? `<span class="texto-desconto">− ${brlC(v.descontoC)}</span>` : '<span class="texto-muted">—</span>'}</td>
      <td data-label="Total" class="num"><strong>${brlC(v.totalC)}</strong></td>
      <td data-label="Pagamento">${esc(rotuloPagamento(v.forma))}</td>
      <td data-label="Vendedor">${vendedorCurto(v.vendedor)}</td>
      <td data-label="Situação">${badgeStatusVenda(v.status)}</td>
    </tr>`).join('');

  const validas = lista.filter(v => v.status !== 'cancelada');
  const totalC = validas.reduce((s, v) => s + v.totalC, 0);
  HIST.contagem.textContent = `${lista.length} ${pluralize(lista.length, 'venda')}${lista.length !== validas.length ? ` (${lista.length - validas.length} ${pluralize(lista.length - validas.length, 'cancelada', 'canceladas')})` : ''}`;
  HIST.total.textContent = lista.length ? `Total vendido: ${brlC(totalC)}` : '';
}

async function carregarResumoHistorico() {
  const inicio = new Date(Math.min(inicioDoMes().getTime(), somarDias(inicioDoDia(), -6).getTime()));
  const { erro, vendas } = await buscarVendasEntre(inicio, null);
  if (erro) return;
  const hoje = inicioDoDia();
  const semana = somarDias(hoje, -6);
  const mes = inicioDoMes();
  const fat = (desde) => reais(resumirLancamentos(vendas.filter(m => new Date(m.created_at) >= desde)).faturamento);
  animarContagem(HIST.hoje, fat(hoje), formatCurrency);
  animarContagem(HIST.semana, fat(semana), formatCurrency);
  animarContagem(HIST.mes, fat(mes), formatCurrency);
}

async function carregarHistorico() {
  const intervalo = intervaloHistorico();
  carregarResumoHistorico();
  if (!intervalo) {
    vendasHistorico = [];
    renderHistorico();
    HIST.vazioTexto.textContent = 'Escolha as datas de início e fim.';
    return;
  }

  const minha = ++requisicaoHistorico;
  HIST.corpo.innerHTML = '<tr><td colspan="10"><span class="skeleton" style="height:14px;width:50%"></span></td></tr>';
  const { erro, vendas } = await buscarVendasEntre(intervalo.inicio, intervalo.fim);
  if (minha !== requisicaoHistorico) return;
  if (erro) {
    showToast('Não foi possível carregar o histórico de vendas.', 'error');
    vendasHistorico = [];
  } else {
    vendasHistorico = agruparVendas(vendas);
  }
  renderHistorico();
}

function exportarHistoricoCSV() {
  const lista = filtrarVendasHistorico();
  if (!lista.length) {
    showToast('Não há vendas para exportar nesse período.', 'warning');
    return;
  }
  const linhas = lista.flatMap(v => v.itens.map(m => {
    const snap = m.produto_snapshot || {};
    return [
      v.numero || '', formatarDataHora(v.data), STATUS_VENDA[v.status]?.label || v.status,
      TIPO_LABEL_SINGULAR[snap.type] || snap.type, snap.brand, snap.model, snap.variacao,
      Math.abs(m.quantidade), m.preco_unitario, m.subtotal ?? m.total, m.desconto || 0, m.total,
      rotuloPagamento(v.forma), v.vendedor,
    ];
  }));
  const cabecalho = ['Nº da venda', 'Data', 'Situação', 'Categoria', 'Marca', 'Modelo', 'Linha/Tipo', 'Quantidade', 'Preço unitário', 'Subtotal', 'Desconto', 'Total', 'Pagamento', 'Vendido por'];
  baixarArquivo(gerarCSV(cabecalho, linhas), `caseon-vendas-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  showToast('Planilha de vendas exportada.', 'success');
}

// ---- Detalhes da venda ---------------------------------------------------------------------

async function buscarDadosVenda(v) {
  if (!v.vendaId) return { cabecalho: null, movimentos: [...v.itens, ...v.correcoes] };
  const [cab, movs] = await Promise.all([
    supabaseClient.from('vendas').select('*').eq('id', v.vendaId).maybeSingle(),
    supabaseClient.from('movimentacoes_estoque').select(COLUNAS_MOVIMENTO).eq('loja_id', lojaAtual.id).eq('venda_id', v.vendaId).order('created_at', { ascending: true }),
  ]);
  return {
    cabecalho: cab.error ? null : cab.data,
    movimentos: movs.error ? [...v.itens, ...v.correcoes] : movs.data,
  };
}

// Quanto de cada item ainda pode voltar.
function saldoDosItens(movimentos) {
  const itens = movimentos.filter(m => m.tipo === 'venda');
  return itens.map(m => {
    const voltou = movimentos
      .filter(r => r.tipo !== 'venda' && r.produto_id === m.produto_id)
      .reduce((s, r) => s + Number(r.quantidade), 0);
    return { ...m, vendido: -m.quantidade, restante: -m.quantidade - voltou };
  });
}

async function abrirDetalheVenda(chave) {
  const v = vendasHistorico.find(x => x.chave === chave);
  if (!v) return;
  abrirModal('<p class="modal-message"><span class="skeleton" style="height:14px;width:60%"></span></p>', { largo: true });

  const { cabecalho, movimentos } = await buscarDadosVenda(v);
  const itens = saldoDosItens(movimentos);
  const correcoes = movimentos.filter(m => m.tipo !== 'venda');
  const status = cabecalho?.status || v.status;
  const subtotalC = itens.reduce((s, m) => s + centavos(m.subtotal ?? m.total), 0);
  const descontoC = itens.reduce((s, m) => s + centavos(m.desconto), 0);
  const totalC = itens.reduce((s, m) => s + centavos(m.total), 0);
  const voltouC = -correcoes.reduce((s, m) => s + centavos(m.total), 0);
  const podeCorrigir = souDono() && cabecalho && status !== 'cancelada';
  const temRestante = itens.some(i => i.restante > 0);

  const linhas = itens.map(m => `
    <tr>
      <td>${renderProdutoCell(m.produto_snapshot || {}, { comCategoria: true })}</td>
      <td class="num">${m.vendido}${m.restante < m.vendido ? `<br><small class="texto-muted">${m.vendido - m.restante} voltou</small>` : ''}</td>
      <td class="num">${formatCurrency(m.preco_unitario)}</td>
      <td class="num">${centavos(m.desconto) ? `<span class="texto-desconto">− ${formatCurrency(m.desconto)}</span>` : '—'}</td>
      <td class="num"><strong>${formatCurrency(m.total)}</strong></td>
    </tr>`).join('');

  const listaCorrecoes = correcoes.length ? `
    <h4 class="detalhe-subtitulo">Correções</h4>
    <ul class="lista-simples">${correcoes.map(m => `
      <li>
        <div><strong>${m.tipo === 'estorno' ? 'Cancelamento' : 'Devolução'}</strong> · ${m.quantidade}× ${esc(nomeProduto(m.produto_snapshot || {}))}
          <div class="produto-meta">${formatarDataHora(m.created_at)}${m.motivo ? ` · ${esc(m.motivo)}` : ''}</div></div>
        <span class="texto-desconto">${formatCurrency(m.total)}</span>
      </li>`).join('')}</ul>` : '';

  const pagamento = cabecalho?.forma_pagamento || v.forma;
  const troco = cabecalho && cabecalho.valor_recebido !== null ? `<div><dt>Recebido · troco</dt><dd>${formatCurrency(cabecalho.valor_recebido)} · ${formatCurrency(cabecalho.troco)}</dd></div>` : '';

  abrirModal(`
    <div class="detalhe-topo">
      <div>
        <h3 class="modal-title" style="padding:0">${v.numero ? `Venda nº ${v.numero}` : 'Venda'}</h3>
        <p class="card-desc">${formatarDataHora(cabecalho?.created_at || v.data)} · ${esc(nomeDoVendedor(cabecalho?.responsavel_email || v.vendedor))}</p>
      </div>
      <span style="margin-left:auto">${badgeStatusVenda(status)}</span>
    </div>
    <div class="table-wrap detalhe-tabela">
      <table class="table">
        <thead><tr><th>Produto</th><th class="num">Qtd</th><th class="num">Preço</th><th class="num">Desconto</th><th class="num">Total</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>
    <dl class="detalhe-lista">
      <div><dt>Subtotal</dt><dd>${brlC(subtotalC)}</dd></div>
      ${descontoC ? `<div><dt>Desconto${cabecalho?.desconto_tipo === 'percentual' ? ` (${formatarPercentual(Number(cabecalho.desconto_informado))})` : ''}</dt><dd class="texto-desconto">− ${brlC(descontoC)}</dd></div>` : ''}
      <div><dt>Total da venda</dt><dd>${brlC(totalC)}</dd></div>
      ${voltouC ? `<div><dt>Devolvido / cancelado</dt><dd class="texto-desconto">− ${brlC(voltouC)}</dd></div><div><dt>Ficou para a loja</dt><dd>${brlC(totalC - voltouC)}</dd></div>` : ''}
      <div><dt>Pagamento</dt><dd>${esc(rotuloPagamento(pagamento))}</dd></div>
      ${troco}
      ${cabecalho?.motivo_cancelamento ? `<div><dt>Motivo do cancelamento</dt><dd>${esc(cabecalho.motivo_cancelamento)}</dd></div>` : ''}
    </dl>
    ${listaCorrecoes}
    <div class="modal-actions">
      ${podeCorrigir && temRestante ? `
        <button type="button" class="btn btn-ghost" data-hist="cancelar" style="margin-right:auto;color:var(--red-ink)"><i class="ti ti-ban"></i>Cancelar venda</button>
        <button type="button" class="btn btn-secondary" data-hist="devolver"><i class="ti ti-arrow-back-up"></i>Devolver itens</button>` : ''}
      <button type="button" class="btn btn-primary" data-hist="fechar">Fechar</button>
    </div>
    ${!cabecalho && souDono() ? '<p class="card-desc" style="margin-top:12px">Venda registrada antes do carrinho: não dá para cancelar ou devolver pelo sistema.</p>' : ''}
  `, { largo: true });

  DOM.modalBody.querySelector('[data-hist="fechar"]').addEventListener('click', fecharModal);
  DOM.modalBody.querySelector('[data-hist="cancelar"]')?.addEventListener('click', () => abrirCancelamento(v, cabecalho));
  DOM.modalBody.querySelector('[data-hist="devolver"]')?.addEventListener('click', () => abrirDevolucao(v, cabecalho, itens));
}

async function depoisDaCorrecao(mensagem) {
  fecharModal();
  showToast(mensagem, 'success', 4500);
  await recarregarProdutos();
  carregarHistorico();
}

function abrirCancelamento(v, cabecalho) {
  abrirModal(`
    <h3 class="modal-title">Cancelar a venda nº ${cabecalho.numero}?</h3>
    <p class="modal-message">Todos os itens que ainda não voltaram retornam ao estoque e o valor sai do faturamento de hoje. A venda continua no histórico como cancelada.</p>
    <form class="modal-form" id="form-cancelar">
      <label class="field"><span class="field-label">Motivo <span class="opcional">opcional</span></span>
        <input type="text" id="cancelar-motivo" maxlength="120" placeholder="Ex: digitei errado, cliente desistiu" /></label>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" data-hist="voltar">Voltar</button>
        <button type="submit" class="btn btn-danger">Cancelar venda</button>
      </div>
    </form>
  `);
  DOM.modalBody.querySelector('[data-hist="voltar"]').addEventListener('click', () => abrirDetalheVenda(v.chave));
  DOM.modalBody.querySelector('#form-cancelar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const botao = e.submitter || DOM.modalBody.querySelector('.btn-danger');
    botao.disabled = true;
    const { error } = await supabaseClient.rpc('cancelar_venda', {
      p_venda_id: cabecalho.id,
      p_motivo: DOM.modalBody.querySelector('#cancelar-motivo').value.trim() || null,
    });
    if (error) {
      botao.disabled = false;
      showToast(error.message || 'Não foi possível cancelar.', 'error', 5000);
      return;
    }
    depoisDaCorrecao(`Venda nº ${cabecalho.numero} cancelada. O estoque voltou.`);
  });
}

function abrirDevolucao(v, cabecalho, itens) {
  const disponiveis = itens.filter(i => i.restante > 0);
  abrirModal(`
    <h3 class="modal-title">Devolver itens da venda nº ${cabecalho.numero}</h3>
    <p class="modal-message">Escolha quantas unidades voltaram. O estoque volta e o valor pago por elas (já com o desconto) sai do faturamento de hoje.</p>
    <form class="modal-form" id="form-devolver">
      <div class="devolucao-lista">
        ${disponiveis.map(i => `
          <div class="devolucao-item" data-produto="${i.produto_id}">
            <div style="min-width:0">
              <div class="produto-nome">${esc(nomeProduto(i.produto_snapshot || {}))}</div>
              <div class="produto-meta">Pode voltar até ${i.restante} · ${formatCurrency(Number(i.total) / i.vendido)} cada</div>
            </div>
            <div class="stepper stepper--sm">
              <button type="button" data-dev="menos" aria-label="Menos"><i class="ti ti-minus"></i></button>
              <input type="number" min="0" max="${i.restante}" value="0" inputmode="numeric" aria-label="Unidades devolvidas" />
              <button type="button" data-dev="mais" aria-label="Mais"><i class="ti ti-plus"></i></button>
            </div>
          </div>`).join('')}
      </div>
      <label class="field"><span class="field-label">Motivo <span class="opcional">opcional</span></span>
        <input type="text" id="devolver-motivo" maxlength="120" placeholder="Ex: defeito, troca de modelo" /></label>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" data-hist="voltar">Voltar</button>
        <button type="submit" class="btn btn-primary">Registrar devolução</button>
      </div>
    </form>
  `);

  const lista = DOM.modalBody.querySelector('.devolucao-lista');
  lista.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-dev]');
    if (!botao) return;
    const input = botao.closest('.stepper').querySelector('input');
    const max = Number(input.max);
    input.value = Math.max(0, Math.min(max, (Number(input.value) || 0) + (botao.dataset.dev === 'mais' ? 1 : -1)));
  });
  DOM.modalBody.querySelector('[data-hist="voltar"]').addEventListener('click', () => abrirDetalheVenda(v.chave));
  DOM.modalBody.querySelector('#form-devolver').addEventListener('submit', async (e) => {
    e.preventDefault();
    const itensDev = [...lista.querySelectorAll('.devolucao-item')]
      .map(el => {
        const input = el.querySelector('input');
        const q = Math.max(0, Math.min(Number(input.max), Math.floor(Number(input.value) || 0)));
        return { produto_id: Number(el.dataset.produto), quantidade: q };
      })
      .filter(i => i.quantidade > 0);
    if (!itensDev.length) {
      showToast('Escolha pelo menos uma unidade para devolver.', 'warning');
      return;
    }
    const botao = DOM.modalBody.querySelector('#form-devolver .btn-primary');
    botao.disabled = true;
    const { error } = await supabaseClient.rpc('devolver_itens', {
      p_venda_id: cabecalho.id,
      p_itens: itensDev,
      p_motivo: DOM.modalBody.querySelector('#devolver-motivo').value.trim() || null,
    });
    if (error) {
      botao.disabled = false;
      showToast(error.message || 'Não foi possível registrar a devolução.', 'error', 5000);
      return;
    }
    const unidades = itensDev.reduce((s, i) => s + i.quantidade, 0);
    depoisDaCorrecao(`Devolução registrada: ${unidades} ${pluralize(unidades, 'unidade voltou', 'unidades voltaram')} ao estoque.`);
  });
}

function initHistorico() {
  intervaloHistorico = ligarSeletorPeriodo({
    select: HIST.periodo, caixaCustom: HIST.custom, de: HIST.de, ate: HIST.ate, aoMudar: carregarHistorico,
  });
  HIST.busca.addEventListener('input', renderHistorico);
  HIST.forma.addEventListener('change', renderHistorico);
  HIST.csv.addEventListener('click', exportarHistoricoCSV);
  HIST.corpo.addEventListener('click', (e) => {
    const linha = e.target.closest('[data-venda]');
    if (linha) abrirDetalheVenda(linha.dataset.venda);
  });
  HIST.corpo.addEventListener('keydown', (e) => {
    const linha = e.target.closest('[data-venda]');
    if (linha && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrirDetalheVenda(linha.dataset.venda); }
  });
}
