// ============================================
// ANÁLISES · relatórios comerciais e financeiros
// ============================================
// Abas: Visão geral · Vendas · Produtos · Financeiro. Tudo sai do livro-caixa
// (vendas_periodo, sql/014) e do estoque atual, com as mesmas contas do Início:
//   faturamento = vendas − devoluções − cancelamentos (já com descontos);
//   custo das mercadorias vendidas (CMV) = custo gravado na hora de cada venda;
//   lucro bruto = faturamento − CMV (só dos itens com custo gravado; o resto é avisado).
// Nunca mostra lucro líquido: o sistema não registra despesas nem taxas.
// Os PDFs (pdf.js) usam os mesmos números calculados aqui.

const ANL = {
  periodo: $('anl-periodo'),
  custom: $('anl-periodo-custom'),
  de: $('anl-de'),
  ate: $('anl-ate'),
  filtrosBtn: $('anl-filtros-btn'),
  filtrosQtd: $('anl-filtros-qtd'),
  filtros: $('anl-filtros'),
  fCategoria: $('anl-f-categoria'),
  fProduto: $('anl-f-produto'),
  fProdutos: $('anl-f-produtos'),
  fVendedor: $('anl-f-vendedor'),
  fForma: $('anl-f-forma'),
  filtrosLimpar: $('anl-filtros-limpar'),
  chips: $('anl-chips'),
  abas: $('anl-abas'),
  escopo: $('anl-escopo'),
  conteudo: $('analises-conteudo'),
  pdfBtn: $('anl-pdf-btn'),
  pdfMenu: $('anl-pdf-menu'),
  pdfAbaRotulo: $('anl-pdf-aba-rotulo'),
};

const ABAS_ANALISES = { geral: 'Visão geral', vendas: 'Vendas', produtos: 'Produtos', financeiro: 'Financeiro' };

let abaAnalises = 'geral';
let ordemProdutos = 'faturamento';
let todosProdutos = false;
let granularidade = 'dia';
let intervaloAnalises = () => intervaloPeriodo('30');
let requisicaoAnalises = 0;
let dadosAnalises = null; // { intervalo, anterior, brutoAtual, brutoAnterior }
let graficosAnalises = [];

// ---- Filtros ---------------------------------------------------------------------------

function filtrosAnalises() {
  return {
    categoria: ANL.fCategoria.value,
    produto: ANL.fProduto.value.trim(),
    vendedor: ANL.fVendedor.value,
    forma: ANL.fForma.value,
  };
}

function aplicarFiltrosAnalises(lancamentos) {
  const f = filtrosAnalises();
  return lancamentos.filter(m => {
    const snap = m.produto_snapshot || {};
    if (f.categoria && snap.type !== f.categoria) return false;
    if (f.produto && !matchesSearchTerm(snap, f.produto)) return false;
    if (f.vendedor && m.responsavel_email !== f.vendedor) return false;
    if (f.forma && (m.forma_pagamento || 'nao_informado') !== f.forma) return false;
    return true;
  });
}

// Texto dos filtros ativos (também vai para o PDF).
function descricaoFiltrosAnalises() {
  const f = filtrosAnalises();
  const partes = [];
  if (f.categoria) partes.push(`Categoria: ${TIPO_LABELS[f.categoria] || f.categoria}`);
  if (f.produto) partes.push(`Produto: "${f.produto}"`);
  if (f.vendedor) partes.push(`Vendedor: ${nomeDoVendedor(f.vendedor)}`);
  if (f.forma) partes.push(`Pagamento: ${f.forma === 'nao_informado' ? 'Não informado' : rotuloPagamento(f.forma)}`);
  return partes;
}

function renderChipsAnalises() {
  const f = filtrosAnalises();
  const chips = [];
  if (f.categoria) chips.push({ label: `Categoria: ${TIPO_LABELS[f.categoria]}`, limpar: () => { ANL.fCategoria.value = ''; } });
  if (f.produto) chips.push({ label: `Produto: ${f.produto}`, limpar: () => { ANL.fProduto.value = ''; } });
  if (f.vendedor) chips.push({ label: `Vendedor: ${nomeDoVendedor(f.vendedor)}`, limpar: () => { ANL.fVendedor.value = ''; } });
  if (f.forma) chips.push({ label: `Pagamento: ${f.forma === 'nao_informado' ? 'Não informado' : rotuloPagamento(f.forma)}`, limpar: () => { ANL.fForma.value = ''; } });

  ANL.filtrosQtd.textContent = chips.length;
  ANL.filtrosQtd.classList.toggle('hidden', !chips.length);
  ANL.chips.classList.toggle('hidden', !chips.length);
  ANL.chips.innerHTML = chips.map((c, i) => `<span class="filter-chip">${esc(c.label)}<button type="button" data-chip="${i}" aria-label="Remover filtro ${esc(c.label)}"><i class="ti ti-x"></i></button></span>`).join('');
  ANL.chips.onclick = (e) => {
    const alvo = e.target.closest('[data-chip]');
    if (!alvo) return;
    chips[Number(alvo.dataset.chip)].limpar();
    renderAnalises();
  };
}

function preencherOpcoesFiltros(lancamentos) {
  const vendedores = semRepetidos(lancamentos.map(m => m.responsavel_email).filter(Boolean));
  const atual = ANL.fVendedor.value;
  ANL.fVendedor.innerHTML = '<option value="">Todos</option>' + vendedores
    .map(e => `<option value="${esc(e)}">${esc(nomeDoVendedor(e))}</option>`).join('');
  ANL.fVendedor.value = vendedores.includes(atual) ? atual : '';

  const nomes = semRepetidos(lancamentos.map(m => nomeProduto(m.produto_snapshot || {})));
  ANL.fProdutos.innerHTML = nomes.slice(0, 300).map(n => `<option value="${esc(n)}"></option>`).join('');
}

// ---- Cálculos ----------------------------------------------------------------------------

function nomeComVariacao(snap) {
  return [nomeProduto(snap), snap.variacao].filter(Boolean).join(' · ');
}

function novoAcumulador(extra = {}) {
  return { unidades: 0, fatC: 0, cmvC: 0, lucroC: 0, receitaComCustoC: 0, semCusto: 0, descontosC: 0, vendas: new Set(), ...extra };
}

function acumular(acc, m) {
  const total = centavos(m.total);
  acc.unidades += unidadesDo(m);
  acc.fatC += total;
  if ((m.tipo || 'venda') === 'venda') {
    acc.descontosC += centavos(m.desconto);
    if (m.venda_status !== 'cancelada') acc.vendas.add(chaveVenda(m));
  }
  const cmv = cmvCentavos(m);
  if (cmv === null) { if ((m.tipo || 'venda') === 'venda') acc.semCusto += 1; }
  else { acc.cmvC += cmv; acc.lucroC += total - cmv; acc.receitaComCustoC += total; }
}

function fecharAcumulador(acc) {
  return {
    ...acc,
    nVendas: acc.vendas.size,
    margem: acc.receitaComCustoC ? (acc.lucroC / acc.receitaComCustoC) * 100 : null,
    ticketC: acc.vendas.size ? Math.round(acc.fatC / acc.vendas.size) : 0,
  };
}

function agrupar(lancamentos, chaveDe, extraDe) {
  const mapa = new Map();
  lancamentos.forEach(m => {
    const chave = chaveDe(m);
    if (!mapa.has(chave)) mapa.set(chave, novoAcumulador(extraDe(m)));
    acumular(mapa.get(chave), m);
  });
  return [...mapa.values()].map(fecharAcumulador);
}

function calcularRelatorio(lancamentos) {
  const resumo = resumirLancamentos(lancamentos);
  const produtos = agrupar(lancamentos, m => m.produto_id, m => ({
    id: m.produto_id, nome: nomeComVariacao(m.produto_snapshot || {}), tipo: m.produto_snapshot?.type,
  }));
  const categorias = agrupar(lancamentos, m => m.produto_snapshot?.type || 'outros', m => ({
    tipo: m.produto_snapshot?.type || 'outros', nome: TIPO_LABELS[m.produto_snapshot?.type] || 'Outros',
  }));
  const modelos = agrupar(lancamentos, m => chaveNome(nomeProduto(m.produto_snapshot || {})), m => ({
    nome: nomeProduto(m.produto_snapshot || {}),
  }));
  const formas = agrupar(lancamentos, m => m.forma_pagamento || 'nao_informado', m => ({
    forma: m.forma_pagamento || 'nao_informado',
    nome: m.forma_pagamento ? rotuloPagamento(m.forma_pagamento) : 'Não informado',
  }));
  // Por funcionário: só o que cada um vendeu (devoluções são registradas por quem corrige).
  const vendedores = agrupar(lancamentos.filter(m => (m.tipo || 'venda') === 'venda' && m.venda_status !== 'cancelada'),
    m => m.responsavel_email || '-', m => ({ email: m.responsavel_email, nome: nomeDoVendedor(m.responsavel_email) }));

  return { resumo, produtos, categorias, modelos, formas, vendedores };
}

// Estoque de agora (não depende do período).
function relatorioEstoqueAtual() {
  const v = calcularValoresEstoque(products);
  return {
    produtos: products.length,
    unidades: products.reduce((s, p) => s + Math.max(Number(p.quantity) || 0, 0), 0),
    compraC: centavos(v.compra),
    vendaC: centavos(v.venda),
    pendentes: v.pendentes,
    baixos: products.filter(p => situacaoEstoque(p) === 'baixo').sort((a, b) => a.quantity - b.quantity),
    zerados: products.filter(p => situacaoEstoque(p) === 'zerado'),
  };
}

function produtosSemVenda(lancamentos, intervalo) {
  const vendidos = new Set(lancamentos.filter(m => (m.tipo || 'venda') === 'venda').map(m => m.produto_id));
  return products
    .filter(p => p.quantity > 0 && !vendidos.has(p.id) && (!p.created_at || new Date(p.created_at) < intervalo.fim))
    .map(p => ({ p, valorC: centavos(p.price) * p.quantity }))
    .sort((a, b) => b.valorC - a.valorC);
}

function ordenarProdutos(lista, criterio = ordemProdutos) {
  const campo = { unidades: 'unidades', faturamento: 'fatC', lucro: 'lucroC', cmv: 'cmvC' }[criterio] || 'fatC';
  return [...lista].sort((a, b) => b[campo] - a[campo] || b.unidades - a.unidades || a.nome.localeCompare(b.nome, 'pt-BR'));
}

// Tudo que as telas e os PDFs precisam, já filtrado.
function montarDadosRelatorio() {
  if (!dadosAnalises) return null;
  const atual = aplicarFiltrosAnalises(dadosAnalises.brutoAtual);
  const anterior = aplicarFiltrosAnalises(dadosAnalises.brutoAnterior);
  return {
    intervalo: dadosAnalises.intervalo,
    anteriorIntervalo: dadosAnalises.anterior,
    lancamentos: atual,
    rel: calcularRelatorio(atual),
    relAnterior: calcularRelatorio(anterior),
    estoque: relatorioEstoqueAtual(),
    semVenda: produtosSemVenda(atual, dadosAnalises.intervalo),
    filtros: descricaoFiltrosAnalises(),
  };
}

// ---- Peças de tela ----------------------------------------------------------------------

function htmlVariacao(atual, anterior, { pontos = false, inverso = false } = {}) {
  if (atual === null || anterior === null || anterior === undefined) return '<span class="variacao-pct variacao-pct--neutra">sem comparação</span>';
  if (pontos) {
    const diff = atual - anterior;
    const classe = Math.abs(diff) < 0.05 ? 'neutra' : (diff > 0) !== inverso ? 'alta' : 'queda';
    return `<span class="variacao-pct variacao-pct--${classe}"><i class="ti ti-${diff >= 0 ? 'arrow-up-right' : 'arrow-down-right'}"></i>${Math.abs(diff).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p.</span>`;
  }
  if (!anterior) return atual ? '<span class="variacao-pct variacao-pct--neutra">sem base anterior</span>' : '<span class="variacao-pct variacao-pct--neutra">—</span>';
  const pct = ((atual - anterior) / Math.abs(anterior)) * 100;
  const classe = Math.abs(pct) < 0.5 ? 'neutra' : (pct > 0) !== inverso ? 'alta' : 'queda';
  return `<span class="variacao-pct variacao-pct--${classe}"><i class="ti ti-${pct >= 0 ? 'arrow-up-right' : 'arrow-down-right'}"></i>${Math.abs(Math.round(pct))}%</span>`;
}

function htmlKpi(rotulo, valor, variacao = '', dica = '', icone = '', cor = 'blue') {
  return `
    <div class="card kpi kpi--anl">
      <div class="kpi-head">${icone ? `<span class="icon-box icon-box--${cor}"><i class="ti ${icone}"></i></span>` : ''}<span class="kpi-title">${rotulo}</span>
        ${dica ? `<span class="info-tip" tabindex="0" data-tip="${esc(dica)}"><i class="ti ti-info-circle"></i></span>` : ''}</div>
      <strong class="kpi-value">${valor}</strong>
      <span class="kpi-sub">${variacao}</span>
    </div>`;
}

function htmlBarras(linhas, { classe = '', formatar = brlC, total = null } = {}) {
  if (!linhas.length) return '<p class="empty-inline">Sem dados no período.</p>';
  const maior = Math.max(...linhas.map(l => Math.abs(l.valor)), 0);
  return `<div class="barras">${linhas.map(l => `
    <div class="barra-linha">
      <span class="barra-nome" title="${esc(l.nome)}">${esc(l.nome)}</span>
      <span class="barra-valor">${formatar(l.valor)}${total ? `<small>${formatarPercentual(Math.round((l.valor / total) * 1000) / 10)}</small>` : ''}${l.extra ? `<small>${esc(l.extra)}</small>` : ''}</span>
      <span class="barra-trilho"><span class="barra-preench ${classe}" data-largura="${maior ? Math.max((Math.abs(l.valor) / maior) * 100, 2) : 0}"></span></span>
    </div>`).join('')}</div>`;
}

function notaCustoParcial(resumo) {
  if (!resumo.semCusto) return '';
  return `<p class="aviso-parcial"><i class="ti ti-info-circle"></i>${resumo.semCusto} ${pluralize(resumo.semCusto, 'item vendido', 'itens vendidos')} sem custo gravado: custo e lucro são parciais (esses itens ficam fora, nunca contam como custo zero).</p>`;
}

function htmlVazio(texto = 'Nenhuma venda no período e filtros escolhidos.') {
  return `<div class="card empty"><i class="ti ti-chart-bar-off"></i><p>${texto}</p></div>`;
}

// ---- Gráficos ------------------------------------------------------------------------------

function destruirGraficosAnalises() {
  graficosAnalises.forEach(g => g.destroy());
  graficosAnalises = [];
}

function opcoesGraficoBase(pontos) {
  const muted = corVar('--muted', '#8591A7');
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefereMenosMovimento() ? false : { duration: 600 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101A32', padding: 12, cornerRadius: 10, boxPadding: 4,
        callbacks: {
          title: (i) => pontos[i[0].dataIndex].completo,
          label: (i) => (i.raw === null ? `${i.dataset.label}: sem custo` : `${i.dataset.label}: ${i.dataset.formato === 'num' ? i.raw : formatCurrency(i.raw)}`),
        },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { color: '#E6EAF2' }, ticks: { maxRotation: 0, autoSkipPadding: 12, color: muted } },
      y: { beginAtZero: true, border: { display: false }, grid: { color: '#EEF1F6' }, ticks: { maxTicksLimit: 5, color: muted, callback: valorCompacto } },
    },
  };
}

// Barras de faturamento e, se pedido, linha de lucro bruto (mesmo eixo, os dois em R$).
function configGraficoFaturamento(pontos, { comLucro = true } = {}) {
  const verde = corVar('--green', '#15803D');
  const datasets = [{
    type: 'bar', label: 'Faturamento', data: pontos.map(p => p.vendas), order: 2,
    backgroundColor: corVar('--teal', '#2CC5B5'), hoverBackgroundColor: '#22B0A1',
    borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'bottom', maxBarThickness: 28,
  }];
  if (comLucro) {
    datasets.push({
      type: 'line', label: 'Lucro bruto', data: pontos.map(p => (p.temLucro ? p.lucro : null)), order: 1,
      borderColor: verde, backgroundColor: verde, borderWidth: 2, cubicInterpolationMode: 'monotone',
      pointRadius: pontos.length > 31 ? 0 : 4, pointHoverRadius: 6, pointBackgroundColor: verde,
      pointBorderColor: '#fff', pointBorderWidth: 2, spanGaps: false,
    });
  }
  return { data: { labels: pontos.map(p => p.rotulo), datasets }, options: opcoesGraficoBase(pontos) };
}

function desenharGraficoAnalises(id, config) {
  const canvas = ANL.conteudo.querySelector(`#${id}`);
  if (!canvas || typeof Chart === 'undefined') return;
  graficosAnalises.push(new Chart(canvas, config));
}

function animarBarrasAnalises() {
  requestAnimationFrame(() => {
    ANL.conteudo.querySelectorAll('.barra-preench').forEach(el => { el.style.width = `${el.dataset.largura}%`; });
  });
}

// ---- Abas ------------------------------------------------------------------------------------

function abaGeral(d) {
  const r = d.rel.resumo, a = d.relAnterior.resumo;
  if (!d.lancamentos.length) return htmlVazio();
  return `
    <div class="anl-kpis">
      ${htmlKpi('Faturamento', brlC(r.faturamento), htmlVariacao(r.faturamento, a.faturamento), 'Total efetivamente vendido: já tira descontos, devoluções e cancelamentos.', 'ti-receipt', 'teal')}
      ${htmlKpi('Custo das mercadorias vendidas', brlC(r.cmv), htmlVariacao(r.cmv, a.cmv, { inverso: true }), 'Soma do custo gravado no momento de cada venda.', 'ti-package', 'blue')}
      ${htmlKpi('Lucro bruto', brlC(r.lucro), htmlVariacao(r.lucro, a.lucro), 'Faturamento menos o custo das mercadorias vendidas. Não desconta despesas nem taxas.', 'ti-trending-up', 'green')}
      ${htmlKpi('Margem bruta', r.margem === null ? '—' : formatarPercentual(Math.round(r.margem * 10) / 10), htmlVariacao(r.margem, a.margem, { pontos: true }), 'Lucro bruto dividido pelo faturamento dos itens com custo.', 'ti-percentage', 'green')}
      ${htmlKpi('Vendas', formatarNumero(r.nVendas), htmlVariacao(r.nVendas, a.nVendas), 'Vendas confirmadas (canceladas não contam).', 'ti-shopping-cart', 'teal')}
      ${htmlKpi('Ticket médio', brlC(r.ticket), htmlVariacao(r.ticket, a.ticket), 'Faturamento dividido pelo número de vendas.', 'ti-tag', 'purple')}
    </div>
    ${notaCustoParcial(r)}
    <div class="card analise-card">
      <div class="analise-card-head">
        <div>
          <h3 class="card-title">Faturamento × lucro bruto</h3>
          <div class="chart-totais">
            <span class="legenda"><span class="legenda-barra legenda-barra--vendas"></span>Faturamento <strong>${brlC(r.faturamento)}</strong></span>
            <span class="legenda"><span class="legenda-linha legenda-linha--lucro"></span>Lucro bruto <strong>${brlC(r.lucro)}</strong></span>
          </div>
        </div>
      </div>
      <div class="analise-chart"><canvas id="anl-g-geral" role="img" aria-label="Faturamento e lucro bruto por período"></canvas></div>
    </div>`;
}

function abaVendas(d) {
  const r = d.rel.resumo, a = d.relAnterior.resumo;
  if (!d.lancamentos.length) return htmlVazio();
  const pontos = montarSeries(d.lancamentos, d.intervalo.inicio, d.intervalo.fim, granularidade);
  const totalFormas = d.rel.formas.reduce((s, f) => s + f.fatC, 0);
  const formas = [...d.rel.formas].sort((x, y) => y.fatC - x.fatC);
  const vendedores = [...d.rel.vendedores].sort((x, y) => y.fatC - x.fatC);

  return `
    <div class="card analise-kpis">
      ${htmlStat('Faturamento', brlC(r.faturamento), htmlVariacao(r.faturamento, a.faturamento))}
      ${htmlStat('Vendas', formatarNumero(r.nVendas), htmlVariacao(r.nVendas, a.nVendas))}
      ${htmlStat('Ticket médio', brlC(r.ticket), htmlVariacao(r.ticket, a.ticket))}
      ${htmlStat('Descontos concedidos', brlC(r.descontos), htmlVariacao(r.descontos, a.descontos, { inverso: true }))}
    </div>
    <div class="card analise-card">
      <div class="analise-card-head">
        <div>
          <h3 class="card-title">Faturamento por período</h3>
          <p class="card-desc">Comparado com ${esc(d.anteriorIntervalo?.rotulo || 'o período anterior')}: ${brlC(a.faturamento)} em ${a.nVendas} ${pluralize(a.nVendas, 'venda')}.</p>
        </div>
        <div class="segmented" id="anl-granularidade" role="group" aria-label="Agrupar por">
          ${['dia', 'semana', 'mes'].map(g => `<button type="button" data-gran="${g}" class="${g === granularidade ? 'active' : ''}">${{ dia: 'Diário', semana: 'Semanal', mes: 'Mensal' }[g]}</button>`).join('')}
        </div>
      </div>
      <div class="analise-chart"><canvas id="anl-g-vendas" role="img" aria-label="Faturamento por período"></canvas></div>
      <div class="table-wrap" style="margin-top:16px;max-height:300px">
        <table class="table">
          <thead><tr><th>Período</th><th class="num">Vendas</th><th class="num">Faturamento</th><th class="num">Ticket médio</th><th class="num">Descontos</th></tr></thead>
          <tbody>${pontos.filter(p => p.vendasC || p.nVendas).map(p => `
            <tr><td>${esc(p.completo)}</td><td class="num">${p.nVendas}</td><td class="num">${brlC(p.vendasC)}</td><td class="num">${p.nVendas ? brlC(Math.round(p.vendasC / p.nVendas)) : '—'}</td><td class="num">${p.descontosC ? brlC(p.descontosC) : '—'}</td></tr>`).join('') || '<tr><td colspan="5" class="texto-muted">Sem vendas.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
    <div class="analise-grid">
      <div class="card analise-card">
        <h3 class="card-title">Formas de pagamento</h3>
        <p class="card-desc">Quanto entrou por cada forma (já com devoluções).</p>
        ${htmlBarras(formas.map(f => ({ nome: f.nome, valor: f.fatC, extra: `${f.nVendas} ${pluralize(f.nVendas, 'venda')}` })), { total: totalFormas || null, classe: 'barra-preench--azul' })}
      </div>
      <div class="card analise-card">
        <h3 class="card-title">Vendas por funcionário</h3>
        <p class="card-desc">O que cada pessoa vendeu no período (antes de devoluções).</p>
        ${vendedores.length ? `<div class="table-wrap"><table class="table">
          <thead><tr><th>Vendedor</th><th class="num">Vendas</th><th class="num">Faturamento</th><th class="num">Ticket</th><th class="num">Descontos</th></tr></thead>
          <tbody>${vendedores.map(v => `<tr><td>${renderPessoaChip(v.email)}</td><td class="num">${v.nVendas}</td><td class="num">${brlC(v.fatC)}</td><td class="num">${brlC(v.ticketC)}</td><td class="num">${v.descontosC ? brlC(v.descontosC) : '—'}</td></tr>`).join('')}</tbody>
        </table></div>` : '<p class="empty-inline">Sem vendas.</p>'}
      </div>
    </div>`;
}

function htmlStat(rotulo, valor, variacao) {
  return `<div class="stat"><span class="stat-label">${rotulo}</span><strong class="stat-value">${valor}</strong>${variacao}</div>`;
}

function htmlListaProdutos(lista, vazio, valor) {
  if (!lista.length) return `<p class="empty-inline">${vazio}</p>`;
  return `<ul class="lista-simples">${lista.slice(0, 8).map(item => `<li>${renderProdutoCell(item.p || item, { comCategoria: true })}<span class="barra-valor">${valor(item)}</span></li>`).join('')}</ul>${lista.length > 8 ? `<p class="card-desc lista-mais">E mais ${lista.length - 8}.</p>` : ''}`;
}

function abaProdutos(d) {
  const produtos = ordenarProdutos(d.rel.produtos);
  const mostrados = todosProdutos ? produtos : produtos.slice(0, 15);
  const categorias = [...d.rel.categorias].sort((a, b) => b.fatC - a.fatC);
  const modelos = [...d.rel.modelos].sort((a, b) => b.unidades - a.unidades);
  const dono = souDono();
  const colunasOrdem = [['unidades', 'Unidades'], ['faturamento', 'Faturamento'], ...(dono ? [['cmv', 'Custo'], ['lucro', 'Lucro bruto']] : [])];

  return `
    <div class="card analise-card" style="padding:0">
      <div class="analise-card-head" style="padding:20px 20px 12px">
        <div>
          <h3 class="card-title">Ranking de produtos <span class="badge badge-neutral">${produtos.length}</span></h3>
          <p class="card-desc">Valores reais das vendas do período, com descontos e devoluções.</p>
        </div>
        <label class="ordenar">Ordenar por
          <select id="anl-ordem">${colunasOrdem.map(([v, t]) => `<option value="${v}" ${v === ordemProdutos ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </label>
      </div>
      ${produtos.length ? `<div class="table-wrap"><table class="table table--cards">
        <thead><tr><th>Produto</th><th class="num">Unidades</th><th class="num">Faturamento</th>${dono ? '<th class="num">Custo das mercadorias</th><th class="num">Lucro bruto</th><th class="num">Margem</th>' : ''}</tr></thead>
        <tbody>${mostrados.map(p => `
          <tr>
            <td data-label="" class="td-titulo"><span class="produto-nome">${esc(p.nome)}</span><div class="produto-meta">${esc(TIPO_LABEL_SINGULAR[p.tipo] || '')}</div></td>
            <td data-label="Unidades" class="num">${formatarNumero(p.unidades)}</td>
            <td data-label="Faturamento" class="num"><strong>${brlC(p.fatC)}</strong></td>
            ${dono ? `<td data-label="Custo" class="num">${p.semCusto && !p.cmvC ? '<span class="texto-pendente">sem custo</span>' : brlC(p.cmvC)}</td>
            <td data-label="Lucro bruto" class="num">${p.semCusto && !p.cmvC ? '—' : brlC(p.lucroC)}</td>
            <td data-label="Margem" class="num">${p.margem === null ? '—' : formatarPercentual(Math.round(p.margem * 10) / 10)}</td>` : ''}
          </tr>`).join('')}</tbody>
      </table></div>
      ${produtos.length > 15 ? `<div class="table-foot"><span>Mostrando ${mostrados.length} de ${produtos.length}</span><button type="button" class="btn-link" id="anl-todos">${todosProdutos ? 'Mostrar só os 15 primeiros' : 'Mostrar todos'}</button></div>` : ''}` : '<div class="empty empty--compact"><i class="ti ti-package-off"></i><p>Nenhum produto vendido no período.</p></div>'}
    </div>

    <div class="analise-grid">
      <div class="card analise-card">
        <h3 class="card-title">Vendas por categoria</h3>
        <p class="card-desc">Faturamento de cada categoria${dono ? ' e margem bruta' : ''}.</p>
        ${htmlBarras(categorias.map(c => ({ nome: c.nome, valor: c.fatC, extra: `${formatarNumero(c.unidades)} un.${dono && c.margem !== null ? ` · margem ${formatarPercentual(Math.round(c.margem * 10) / 10)}` : ''}` })), { total: categorias.reduce((s, c) => s + c.fatC, 0) || null })}
      </div>
      <div class="card analise-card">
        <h3 class="card-title">Quantidade vendida por modelo</h3>
        <p class="card-desc">Soma todas as linhas e tipos do mesmo modelo.</p>
        ${htmlBarras(modelos.slice(0, 10).map(m => ({ nome: m.nome, valor: m.unidades, extra: brlC(m.fatC) })), { formatar: (v) => `${formatarNumero(v)} un.`, classe: 'barra-preench--azul' })}
      </div>
    </div>

    <div class="analise-grid analise-grid--3">
      <div class="card analise-card">
        <h3 class="card-title">Sem vendas no período <span class="badge badge-neutral">${d.semVenda.length}</span></h3>
        <p class="card-desc">Têm estoque e não venderam.</p>
        ${htmlListaProdutos(d.semVenda, 'Todo produto com estoque vendeu.', ({ p, valorC }) => `${p.quantity} un.<small>${brlC(valorC)}</small>`)}
      </div>
      <div class="card analise-card">
        <h3 class="card-title">Estoque baixo <span class="badge badge-baixo">${d.estoque.baixos.length}</span></h3>
        <p class="card-desc">No mínimo ou abaixo dele.</p>
        ${htmlListaProdutos(d.estoque.baixos, 'Nenhum produto com estoque baixo.', (p) => `${p.quantity} un.<small>mín. ${estoqueMinimo(p)}</small>`)}
      </div>
      <div class="card analise-card">
        <h3 class="card-title">Sem estoque <span class="badge badge-zerado">${d.estoque.zerados.length}</span></h3>
        <p class="card-desc">Zerados agora.</p>
        ${htmlListaProdutos(d.estoque.zerados, 'Nenhum produto zerado.', () => '0 un.')}
      </div>
    </div>`;
}

function abaFinanceiro(d) {
  const r = d.rel.resumo, a = d.relAnterior.resumo, e = d.estoque;
  return `
    <div class="anl-kpis">
      ${htmlKpi('Faturamento', brlC(r.faturamento), htmlVariacao(r.faturamento, a.faturamento), 'Vendas menos descontos, devoluções e cancelamentos.', 'ti-receipt', 'teal')}
      ${htmlKpi('Custo das mercadorias vendidas', brlC(r.cmv), htmlVariacao(r.cmv, a.cmv, { inverso: true }), 'Custo histórico dos itens vendidos.', 'ti-package', 'blue')}
      ${htmlKpi('Lucro bruto', brlC(r.lucro), htmlVariacao(r.lucro, a.lucro), 'Faturamento − custo das mercadorias vendidas.', 'ti-trending-up', 'green')}
      ${htmlKpi('Margem bruta', r.margem === null ? '—' : formatarPercentual(Math.round(r.margem * 10) / 10), htmlVariacao(r.margem, a.margem, { pontos: true }), '', 'ti-percentage', 'green')}
      ${htmlKpi('Descontos concedidos', brlC(r.descontos), htmlVariacao(r.descontos, a.descontos, { inverso: true }), 'Soma dos descontos dados nas vendas do período.', 'ti-discount', 'orange')}
      ${htmlKpi('Devoluções e cancelamentos', brlC(r.devolucoes), r.canceladas ? `<span class="variacao-pct variacao-pct--neutra">${r.canceladas} ${pluralize(r.canceladas, 'venda cancelada', 'vendas canceladas')}</span>` : '', 'Valor que voltou para o cliente no período.', 'ti-arrow-back-up', 'red')}
    </div>
    ${notaCustoParcial(r)}
    <div class="analise-grid">
      <div class="card analise-card">
        <h3 class="card-title">Resultado do período</h3>
        <p class="card-desc">${esc(d.intervalo.rotulo)}</p>
        <table class="table dre">
          <tbody>
            <tr><td>Vendas brutas (preço de tabela)</td><td class="num">${brlC(r.bruto)}</td></tr>
            <tr><td>(−) Descontos concedidos</td><td class="num texto-desconto">${r.descontos ? `− ${brlC(r.descontos)}` : brlC(0)}</td></tr>
            <tr><td>(−) Devoluções e cancelamentos</td><td class="num texto-desconto">${r.devolucoes ? `− ${brlC(r.devolucoes)}` : brlC(0)}</td></tr>
            <tr class="dre-total"><td>= Faturamento</td><td class="num">${brlC(r.faturamento)}</td></tr>
            <tr><td>(−) Custo das mercadorias vendidas</td><td class="num texto-desconto">− ${brlC(r.cmv)}</td></tr>
            <tr class="dre-total"><td>= Lucro bruto${r.semCusto ? ' (parcial)' : ''}</td><td class="num">${brlC(r.lucro)}</td></tr>
          </tbody>
        </table>
      </div>
      <div class="card analise-card">
        <h3 class="card-title">Estoque atual</h3>
        <p class="card-desc">Situação de hoje, independente do período escolhido.</p>
        <dl class="detalhe-lista">
          <div><dt>Valor investido (custo)</dt><dd>${e.pendentes && !e.compraC ? 'Custo pendente' : brlC(e.compraC)}</dd></div>
          <div><dt>Potencial de venda</dt><dd>${brlC(e.vendaC)}</dd></div>
          <div><dt>Unidades em estoque</dt><dd>${formatarNumero(e.unidades)}</dd></div>
        </dl>
        ${e.pendentes ? `<p class="aviso-parcial"><i class="ti ti-info-circle"></i>${e.pendentes} ${pluralize(e.pendentes, 'produto', 'produtos')} sem custo: o valor investido é parcial.</p>` : ''}
      </div>
    </div>
    <div class="card analise-card">
      <h3 class="card-title">Despesas, taxas e lucro líquido</h3>
      <p class="card-desc">O sistema ainda não registra despesas da loja nem taxas de cartão. Por isso o lucro líquido não é calculado: o número acima é lucro bruto.</p>
    </div>`;
}

const RENDER_ABAS = { geral: abaGeral, vendas: abaVendas, produtos: abaProdutos, financeiro: abaFinanceiro };

function renderAnalises() {
  renderChipsAnalises();
  ANL.pdfAbaRotulo.textContent = `Aba ${ABAS_ANALISES[abaAnalises]}`;
  ANL.abas.querySelectorAll('[data-aba]').forEach(b => {
    const ativo = b.dataset.aba === abaAnalises;
    b.classList.toggle('active', ativo);
    b.setAttribute('aria-selected', String(ativo));
  });

  const d = montarDadosRelatorio();
  if (!d) return;
  destruirGraficosAnalises();

  const filtros = d.filtros.length ? ` · ${d.filtros.join(' · ')}` : '';
  ANL.escopo.textContent = `${d.intervalo.rotulo}${filtros}`;
  ANL.conteudo.innerHTML = RENDER_ABAS[abaAnalises](d);

  if (abaAnalises === 'geral' && d.lancamentos.length) {
    desenharGraficoAnalises('anl-g-geral', configGraficoFaturamento(montarSeries(d.lancamentos, d.intervalo.inicio, d.intervalo.fim)));
  }
  if (abaAnalises === 'vendas' && d.lancamentos.length) {
    desenharGraficoAnalises('anl-g-vendas', configGraficoFaturamento(montarSeries(d.lancamentos, d.intervalo.inicio, d.intervalo.fim, granularidade), { comLucro: false }));
  }
  animarBarrasAnalises();
}

function renderAnalisesCarregando() {
  destruirGraficosAnalises();
  const bloco = '<div class="card analise-card"><span class="skeleton" style="height:14px;width:40%;margin-bottom:16px"></span><span class="skeleton" style="height:160px;width:100%"></span></div>';
  ANL.conteudo.innerHTML = `<div class="anl-kpis">${'<div class="card kpi"><span class="skeleton" style="height:12px;width:60%"></span><span class="skeleton" style="height:22px;width:80%;margin-top:14px"></span></div>'.repeat(4)}</div>${bloco}`;
}

async function carregarAnalises() {
  if (!lojaAtual) return;
  const intervalo = intervaloAnalises();
  if (!intervalo) {
    ANL.escopo.textContent = '';
    ANL.conteudo.innerHTML = htmlVazio('Escolha as datas de início e fim.');
    return;
  }
  const anterior = periodoAnterior(intervalo);
  const minha = ++requisicaoAnalises;
  renderAnalisesCarregando();

  const { erro, vendas } = await buscarVendasEntre(anterior ? anterior.inicio : intervalo.inicio, intervalo.fim);
  if (minha !== requisicaoAnalises) return;
  if (erro) {
    dadosAnalises = null;
    ANL.conteudo.innerHTML = '<div class="card empty"><i class="ti ti-wifi-off"></i><p>Não foi possível carregar as vendas. Confira a internet e tente de novo.</p></div>';
    return;
  }

  const brutoAtual = vendas.filter(m => new Date(m.created_at) >= intervalo.inicio);
  const brutoAnterior = anterior ? vendas.filter(m => { const t = new Date(m.created_at); return t >= anterior.inicio && t < anterior.fim; }) : [];
  dadosAnalises = { intervalo, anterior, brutoAtual, brutoAnterior };
  preencherOpcoesFiltros(brutoAtual);
  renderAnalises();
}

// ---- Eventos -------------------------------------------------------------------------------

function fecharMenuPdf() {
  ANL.pdfMenu.classList.add('hidden');
  ANL.pdfBtn.setAttribute('aria-expanded', 'false');
}

function initAnalises() {
  intervaloAnalises = ligarSeletorPeriodo({
    select: ANL.periodo, caixaCustom: ANL.custom, de: ANL.de, ate: ANL.ate, aoMudar: carregarAnalises,
  });

  ANL.abas.addEventListener('click', (e) => {
    const b = e.target.closest('[data-aba]');
    if (!b || b.dataset.aba === abaAnalises) return;
    abaAnalises = b.dataset.aba;
    renderAnalises();
  });

  ANL.filtrosBtn.addEventListener('click', () => {
    const abrir = ANL.filtros.classList.contains('hidden');
    ANL.filtros.classList.toggle('hidden', !abrir);
    ANL.filtrosBtn.classList.toggle('active', abrir);
    ANL.filtrosBtn.setAttribute('aria-expanded', String(abrir));
  });
  [ANL.fCategoria, ANL.fVendedor, ANL.fForma].forEach(el => el.addEventListener('change', renderAnalises));
  let espera;
  ANL.fProduto.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(renderAnalises, 250); });
  ANL.filtrosLimpar.addEventListener('click', () => {
    ANL.fCategoria.value = ''; ANL.fProduto.value = ''; ANL.fVendedor.value = ''; ANL.fForma.value = '';
    renderAnalises();
  });

  ANL.conteudo.addEventListener('click', (e) => {
    const gran = e.target.closest('[data-gran]');
    if (gran) { granularidade = gran.dataset.gran; renderAnalises(); return; }
    if (e.target.closest('#anl-todos')) { todosProdutos = !todosProdutos; renderAnalises(); }
  });
  ANL.conteudo.addEventListener('change', (e) => {
    if (e.target.id === 'anl-ordem') { ordemProdutos = e.target.value; renderAnalises(); }
  });

  ANL.pdfBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const abrir = ANL.pdfMenu.classList.contains('hidden');
    ANL.pdfMenu.classList.toggle('hidden', !abrir);
    ANL.pdfBtn.setAttribute('aria-expanded', String(abrir));
    if (abrir) ANL.pdfMenu.querySelector('button')?.focus();
  });
  ANL.pdfMenu.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pdf]');
    if (!b) return;
    fecharMenuPdf();
    baixarPdfAnalises(b.dataset.pdf === 'completo' ? 'completo' : abaAnalises);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.menu-wrap')) fecharMenuPdf(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharMenuPdf(); });
}
