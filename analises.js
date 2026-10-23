// ============================================
// ANÁLISES
// ============================================
// Tudo aqui sai do livro-caixa (movimentacoes_estoque) e do estoque atual. Nenhum
// gráfico é decorativo: se não há dado, a seção diz isso.
// Seções: Vendas e faturamento · Lucratividade · Produtos · Estoque.

const ANL = {
  periodo: $('analises-periodo'),
  conteudo: $('analises-conteudo'),
};

let periodoAnalises = '30';
let graficoAnalises = null;
let requisicaoAnalises = 0;

function intervalosAnalise() {
  const hoje = inicioDoDia();
  const fim = new Date(hoje); fim.setDate(fim.getDate() + 1);

  if (periodoAnalises === 'mes') {
    const inicio = inicioDoMes();
    const dias = Math.round((fim - inicio) / 86400000);
    // Compara com os mesmos dias do mês anterior (1 a N).
    const inicioAnterior = new Date(inicio.getFullYear(), inicio.getMonth() - 1, 1);
    const fimAnterior = new Date(inicioAnterior); fimAnterior.setDate(fimAnterior.getDate() + dias);
    return { inicio, fim, inicioAnterior, fimAnterior: fimAnterior > inicio ? inicio : fimAnterior, rotuloAnterior: 'mesmo período do mês passado' };
  }

  const dias = Number(periodoAnalises);
  const inicio = new Date(hoje); inicio.setDate(inicio.getDate() - (dias - 1));
  const inicioAnterior = new Date(inicio); inicioAnterior.setDate(inicioAnterior.getDate() - dias);
  return { inicio, fim, inicioAnterior, fimAnterior: inicio, rotuloAnterior: `${dias} dias anteriores` };
}

function resumirVendas(vendas) {
  let faturamento = 0, itens = 0, lucro = 0, receitaComCusto = 0, semCusto = 0;
  vendas.forEach(m => {
    const total = Number(m.total) || 0;
    faturamento += total;
    itens += Math.abs(Number(m.quantidade) || 0);
    const l = lucroDaMovimentacao(m);
    if (l === null) semCusto += 1;
    else { lucro += l; receitaComCusto += total; }
  });
  const nVendas = contarVendas(vendas);
  return {
    faturamento, itens, lucro, semCusto, nVendas,
    ticket: nVendas ? faturamento / nVendas : 0,
    margem: receitaComCusto ? (lucro / receitaComCusto) * 100 : null,
  };
}

function htmlVariacao(atual, anterior, { pontos = false } = {}) {
  if (atual === null || anterior === null || anterior === undefined) return '<span class="variacao-pct variacao-pct--neutra">—</span>';
  if (pontos) {
    const diff = atual - anterior;
    const classe = Math.abs(diff) < 0.05 ? 'neutra' : diff > 0 ? 'alta' : 'queda';
    return `<span class="variacao-pct variacao-pct--${classe}"><i class="ti ti-${diff >= 0 ? 'arrow-up-right' : 'arrow-down-right'}"></i>${Math.abs(diff).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p.</span>`;
  }
  if (!anterior) return atual ? '<span class="variacao-pct variacao-pct--alta">novo</span>' : '<span class="variacao-pct variacao-pct--neutra">—</span>';
  const pct = ((atual - anterior) / anterior) * 100;
  const classe = Math.abs(pct) < 0.5 ? 'neutra' : pct > 0 ? 'alta' : 'queda';
  return `<span class="variacao-pct variacao-pct--${classe}"><i class="ti ti-${pct >= 0 ? 'arrow-up-right' : 'arrow-down-right'}"></i>${Math.abs(Math.round(pct))}%</span>`;
}

function htmlStat(rotulo, valor, variacao) {
  return `<div class="stat"><span class="stat-label">${rotulo}</span><strong class="stat-value">${valor}</strong>${variacao}</div>`;
}

function htmlBarras(linhas, { classe = '', formatar = formatCurrency } = {}) {
  if (!linhas.length) return '<p class="empty-inline">Sem dados no período.</p>';
  const maior = Math.max(...linhas.map(l => l.valor), 0);
  return `<div class="barras">${linhas.map(l => `
    <div class="barra-linha">
      <span class="barra-nome" title="${esc(l.nome)}">${esc(l.nome)}</span>
      <span class="barra-valor">${formatar(l.valor)}${l.extra ? `<small>${esc(l.extra)}</small>` : ''}</span>
      <span class="barra-trilho"><span class="barra-preench ${classe}" data-largura="${maior ? Math.max((l.valor / maior) * 100, 2) : 0}"></span></span>
    </div>`).join('')}</div>`;
}

function animarBarras() {
  requestAnimationFrame(() => {
    ANL.conteudo.querySelectorAll('.barra-preench').forEach(el => { el.style.width = `${el.dataset.largura}%`; });
  });
}

function agruparPorProduto(vendas) {
  const mapa = new Map();
  vendas.forEach(m => {
    const chave = m.produto_id;
    const snap = m.produto_snapshot || {};
    if (!mapa.has(chave)) mapa.set(chave, { id: chave, snap, qtd: 0, total: 0 });
    const g = mapa.get(chave);
    g.qtd += Math.abs(Number(m.quantidade) || 0);
    g.total += Number(m.total) || 0;
  });
  return [...mapa.values()];
}

function agruparPorCategoria(vendas) {
  const mapa = {};
  vendas.forEach(m => {
    const tipo = m.produto_snapshot?.type || 'outros';
    if (!mapa[tipo]) mapa[tipo] = { tipo, total: 0, lucro: 0, receitaComCusto: 0, qtd: 0 };
    const g = mapa[tipo];
    g.total += Number(m.total) || 0;
    g.qtd += Math.abs(Number(m.quantidade) || 0);
    const l = lucroDaMovimentacao(m);
    if (l !== null) { g.lucro += l; g.receitaComCusto += Number(m.total) || 0; }
  });
  return Object.values(mapa).sort((a, b) => b.total - a.total);
}

function renderGraficoAnalises(vendas, inicio, fim) {
  const canvas = ANL.conteudo.querySelector('#analises-grafico');
  if (!canvas || typeof Chart === 'undefined') return;
  const pontos = montarSeries(vendas, inicio, fim);
  const muted = corVar('--muted', '#8591A7');

  if (graficoAnalises) graficoAnalises.destroy();
  graficoAnalises = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: pontos.map(p => p.rotulo),
      datasets: [{
        label: 'Faturamento', data: pontos.map(p => p.vendas),
        backgroundColor: corVar('--teal', '#2CC5B5'), hoverBackgroundColor: '#22B0A1',
        borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'bottom', maxBarThickness: 26,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: prefereMenosMovimento() ? false : { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#101A32', padding: 12, cornerRadius: 10, displayColors: false,
          callbacks: { title: (i) => pontos[i[0].dataIndex].completo, label: (i) => `Faturamento: ${formatCurrency(i.raw)}` },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { color: '#E6EAF2' }, ticks: { maxRotation: 0, autoSkipPadding: 12, color: muted } },
        y: { beginAtZero: true, border: { display: false }, grid: { color: '#EEF1F6' }, ticks: { maxTicksLimit: 5, color: muted, callback: valorCompacto } },
      },
    },
  });
}

function renderAnalisesCarregando() {
  const bloco = '<div class="card analise-card"><span class="skeleton" style="height:14px;width:40%;margin-bottom:16px"></span><span class="skeleton" style="height:140px;width:100%"></span></div>';
  ANL.conteudo.innerHTML = `<div class="analise-grid">${bloco}${bloco}</div>`;
}

async function carregarAnalises() {
  if (!lojaAtual) return;
  const intervalo = intervalosAnalise();
  const minha = ++requisicaoAnalises;
  renderAnalisesCarregando();

  const { erro, vendas: todas } = await buscarVendasEntre(intervalo.inicioAnterior, intervalo.fim);
  if (minha !== requisicaoAnalises) return;

  if (erro) {
    ANL.conteudo.innerHTML = '<div class="card empty"><i class="ti ti-wifi-off"></i><p>Não foi possível carregar as vendas. Confira a internet e tente de novo.</p></div>';
    return;
  }

  const vendas = todas.filter(m => new Date(m.created_at) >= intervalo.inicio);
  const anteriores = todas.filter(m => {
    const d = new Date(m.created_at);
    return d >= intervalo.inicioAnterior && d < intervalo.fimAnterior;
  });
  const atual = resumirVendas(vendas);
  const ant = resumirVendas(anteriores);

  // ---- Produtos
  const porProduto = agruparPorProduto(vendas);
  const maisVendidos = [...porProduto].sort((a, b) => b.qtd - a.qtd || b.total - a.total).slice(0, 8);
  const categorias = agruparPorCategoria(vendas);
  const vendidosNoPeriodo = new Map(porProduto.map(g => [g.id, g.qtd]));
  const parados = products
    .filter(p => p.quantity > 0 && !vendidosNoPeriodo.has(p.id) && (!p.created_at || new Date(p.created_at) < intervalo.inicio))
    .map(p => ({ p, valor: Number(p.price) * p.quantity }))
    .sort((a, b) => b.valor - a.valor);

  // ---- Estoque
  const criticos = products
    .filter(p => situacaoEstoque(p) !== 'ok')
    .map(p => {
      const vendidos = vendidosNoPeriodo.get(p.id) || 0;
      // Repor até o dobro do mínimo, ou o que vendeu no período, o que for maior.
      const alvo = Math.max(estoqueMinimo(p) * 2, vendidos);
      return { p, vendidos, repor: Math.max(alvo - p.quantity, 0) };
    })
    .sort((a, b) => (a.p.quantity > 0) - (b.p.quantity > 0) || b.vendidos - a.vendidos || a.p.quantity - b.p.quantity);
  const recentes = [...vendas].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);

  const notaCusto = atual.semCusto
    ? `<p class="card-desc" style="margin-top:12px"><i class="ti ti-info-circle"></i> ${atual.semCusto} ${pluralize(atual.semCusto, 'item vendido', 'itens vendidos')} sem preço de custo não ${pluralize(atual.semCusto, 'entra', 'entram')} no lucro.</p>`
    : '';

  ANL.conteudo.innerHTML = `
    <section class="analise-secao" aria-labelledby="anl-vendas">
      <h2 class="analise-secao-titulo" id="anl-vendas"><span class="icon-box icon-box--teal"><i class="ti ti-receipt"></i></span>Vendas e faturamento</h2>
      <div class="card analise-kpis">
        ${htmlStat('Faturamento', formatCurrency(atual.faturamento), htmlVariacao(atual.faturamento, ant.faturamento))}
        ${htmlStat('Vendas', formatarNumero(atual.nVendas), htmlVariacao(atual.nVendas, ant.nVendas))}
        ${htmlStat('Ticket médio', formatCurrency(atual.ticket), htmlVariacao(atual.ticket, ant.ticket))}
        ${htmlStat('Itens vendidos', formatarNumero(atual.itens), htmlVariacao(atual.itens, ant.itens))}
      </div>
      <div class="card analise-card">
        <h3 class="card-title">Evolução do faturamento</h3>
        <p class="card-desc">Comparação com ${intervalo.rotuloAnterior}: ${formatCurrency(ant.faturamento)}.</p>
        ${atual.faturamento ? '<div class="analise-chart"><canvas id="analises-grafico" role="img" aria-label="Faturamento por dia no período"></canvas></div>' : '<div class="empty empty--compact"><i class="ti ti-chart-bar-off"></i><p>Nenhuma venda no período.</p></div>'}
      </div>
    </section>

    <section class="analise-secao" aria-labelledby="anl-lucro">
      <h2 class="analise-secao-titulo" id="anl-lucro"><span class="icon-box icon-box--green"><i class="ti ti-trending-up"></i></span>Lucratividade</h2>
      <div class="analise-grid">
        <div class="card analise-card">
          <h3 class="card-title">Lucro bruto</h3>
          <p class="card-desc">Vendas menos o custo dos produtos vendidos.</p>
          <div class="analise-kpis" style="margin:0;grid-template-columns:repeat(2,minmax(0,1fr))">
            ${htmlStat('Lucro bruto', formatCurrency(atual.lucro), htmlVariacao(atual.lucro, ant.lucro))}
            ${htmlStat('Margem bruta', atual.margem === null ? '—' : formatarPercentual(atual.margem), htmlVariacao(atual.margem, ant.margem, { pontos: true }))}
          </div>
          ${notaCusto}
        </div>
        <div class="card analise-card">
          <h3 class="card-title">Lucro por categoria</h3>
          <p class="card-desc">Lucro bruto e margem de cada categoria no período.</p>
          ${htmlBarras(categorias.filter(c => c.receitaComCusto > 0).map(c => ({
            nome: TIPO_LABELS[c.tipo] || c.tipo,
            valor: c.lucro,
            extra: `margem ${formatarPercentual((c.lucro / c.receitaComCusto) * 100)}`,
          })), { classe: 'barra-preench--azul' })}
        </div>
      </div>
    </section>

    <section class="analise-secao" aria-labelledby="anl-produtos">
      <h2 class="analise-secao-titulo" id="anl-produtos"><span class="icon-box icon-box--blue"><i class="ti ti-package"></i></span>Produtos</h2>
      <div class="analise-grid">
        <div class="card analise-card">
          <h3 class="card-title">Mais vendidos</h3>
          <p class="card-desc">Por unidades vendidas no período.</p>
          ${htmlBarras(maisVendidos.map(g => ({
            nome: [nomeProduto(g.snap), g.snap.variacao].filter(Boolean).join(' · '),
            valor: g.qtd,
            extra: formatCurrency(g.total),
          })), { formatar: (v) => `${formatarNumero(v)} un.` })}
        </div>
        <div class="card analise-card">
          <h3 class="card-title">Categorias mais vendidas</h3>
          <p class="card-desc">Por faturamento no período.</p>
          ${htmlBarras(categorias.map(c => ({ nome: TIPO_LABELS[c.tipo] || c.tipo, valor: c.total, extra: `${formatarNumero(c.qtd)} un.` })))}
        </div>
        <div class="card analise-card" style="grid-column:1/-1">
          <h3 class="card-title">Produtos parados <span class="badge badge-neutral">${parados.length}</span></h3>
          <p class="card-desc">Têm estoque e não venderam nenhuma unidade no período.</p>
          ${parados.length ? `<ul class="lista-simples">${parados.slice(0, 8).map(({ p, valor }) => `
            <li>${renderProdutoCell(p, { comCategoria: true })}<span class="barra-valor">${p.quantity} un.<small>${formatCurrency(valor)}</small></span></li>
          `).join('')}</ul>${parados.length > 8 ? `<p class="card-desc lista-mais">E mais ${parados.length - 8}.</p>` : ''}` : '<p class="empty-inline">Nenhum produto parado. Tudo com estoque vendeu pelo menos uma vez.</p>'}
        </div>
      </div>
    </section>

    <section class="analise-secao" aria-labelledby="anl-estoque">
      <h2 class="analise-secao-titulo" id="anl-estoque"><span class="icon-box icon-box--orange"><i class="ti ti-alert-triangle"></i></span>Estoque</h2>
      <div class="analise-grid">
        <div class="card analise-card" style="grid-column:1/-1;padding:0">
          <div style="padding:20px 20px 12px">
            <h3 class="card-title">Itens críticos e reposição <span class="badge badge-baixo">${criticos.length}</span></h3>
            <p class="card-desc">Sugestão: repor até o dobro do estoque mínimo, ou o que vendeu no período, o que for maior.</p>
          </div>
          ${criticos.length ? `<div class="table-wrap"><table class="table table--cards">
            <thead><tr><th>Produto</th><th>Situação</th><th class="num">Em estoque</th><th class="num">Vendidos no período</th><th class="num">Repor</th></tr></thead>
            <tbody>${criticos.slice(0, 15).map(({ p, vendidos, repor }) => `
              <tr>
                <td data-label="" class="td-titulo">${renderProdutoCell(p, { comCategoria: true })}</td>
                <td data-label="Situação">${renderBadgeSituacao(p)}</td>
                <td data-label="Em estoque" class="num">${p.quantity}</td>
                <td data-label="Vendidos no período" class="num">${vendidos}</td>
                <td data-label="Repor" class="num"><strong>${repor ? `+${repor}` : '—'}</strong></td>
              </tr>`).join('')}</tbody>
          </table></div>${criticos.length > 15 ? `<div class="table-foot"><span>Mostrando 15 de ${criticos.length}</span><button type="button" class="btn-link" data-anl="ver-baixo">Ver todos em Produtos</button></div>` : ''}` : '<div class="empty empty--compact"><i class="ti ti-circle-check"></i><p>Nenhum item com estoque baixo ou zerado.</p></div>'}
        </div>
        <div class="card analise-card" style="grid-column:1/-1">
          <h3 class="card-title">Movimentações recentes</h3>
          <p class="card-desc">Últimas saídas por venda no período.</p>
          ${recentes.length ? `<ul class="lista-simples">${recentes.map(m => `
            <li>${renderProdutoCell(m.produto_snapshot || {}, { comCategoria: true })}<span class="barra-valor">−${Math.abs(m.quantidade)} un.<small>${formatarDataHora(m.created_at)}</small></span></li>
          `).join('')}</ul><button type="button" class="btn-link lista-mais" data-anl="historico">Ver histórico completo</button>` : '<p class="empty-inline">Nenhuma movimentação no período.</p>'}
        </div>
      </div>
    </section>
  `;

  if (atual.faturamento) renderGraficoAnalises(vendas, intervalo.inicio, intervalo.fim);
  animarBarras();
}

function initAnalises() {
  ANL.periodo.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dias]');
    if (!btn) return;
    periodoAnalises = btn.dataset.dias;
    ANL.periodo.querySelectorAll('[data-dias]').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    carregarAnalises();
  });
  ANL.conteudo.addEventListener('click', (e) => {
    const acao = e.target.closest('[data-anl]')?.dataset.anl;
    if (acao === 'ver-baixo') changeTab('estoque-baixo');
    if (acao === 'historico') changeTab('historico');
  });
}
