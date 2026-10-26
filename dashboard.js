// ============================================
// INÍCIO (dashboard)
// ============================================
// Três blocos, nada além disso:
//  1. Resumo do estoque: valor de compra, valor de venda e o disco de saúde do estoque.
//  2. Quatro indicadores: vendas de hoje, lucro bruto de hoje, meta mensal, estoque baixo.
//  3. Gráfico de vendas × lucro bruto, com período escolhido.
// Rankings, listas e detalhes ficam em Análises.

const DASH = {
  valorCompra: $('dash-valor-compra'),
  valorVenda: $('dash-valor-venda'),
  custoPendente: $('dash-custo-pendente'),
  custoPendenteTexto: $('dash-custo-pendente-texto'),
  custoPendenteLink: $('dash-custo-pendente-link'),
  dial: $('vault-dial-container'),
  dialLegenda: $('vault-dial-legend'),

  vendasValor: $('kpi-vendas-valor'),
  vendasSub: $('kpi-vendas-sub'),
  lucroValor: $('kpi-lucro-valor'),
  lucroSub: $('kpi-lucro-sub'),
  meta: $('kpi-meta'),
  metaValor: $('kpi-meta-valor'),
  metaBarra: $('kpi-meta-barra'),
  metaSub: $('kpi-meta-sub'),
  baixo: $('kpi-baixo'),
  baixoValor: $('kpi-baixo-valor'),
  baixoSub: $('kpi-baixo-sub'),

  periodo: $('chart-periodo'),
  periodoCustom: $('chart-periodo-custom'),
  de: $('chart-de'),
  ate: $('chart-ate'),
  canvas: $('chart-desempenho'),
  estado: $('chart-estado'),
  totalVendas: $('chart-total-vendas'),
  totalLucro: $('chart-total-lucro'),
  nota: $('chart-nota'),
  verTabela: $('chart-ver-tabela'),
  tabela: $('chart-tabela'),
};

let periodoGrafico = '7';
let graficoDesempenho = null;
let dadosGrafico = [];
let requisicaoGrafico = 0;

function renderDashboardSkeleton() {
  [DASH.valorCompra, DASH.valorVenda, DASH.vendasValor, DASH.lucroValor, DASH.metaValor, DASH.baixoValor]
    .forEach(el => el.classList.add('is-loading'));
}

// ---- 1. Resumo do estoque ------------------------------------------------------------

// Custo desconhecido não vira zero: o total de compra fica marcado como incompleto e
// o aviso leva para a lista de produtos sem custo.
function renderValoresEstoque() {
  const { compra, venda, pendentes, comCusto } = calcularValoresEstoque(products);

  animarContagem(DASH.valorVenda, venda, formatCurrency);

  if (comCusto === 0 && pendentes > 0) {
    DASH.valorCompra.classList.remove('is-loading');
    cancelAnimationFrame(animacoesAtivas.get(DASH.valorCompra));
    DASH.valorCompra.textContent = 'Custo pendente';
    DASH.valorCompra.classList.add('resumo-amount--pendente');
  } else {
    DASH.valorCompra.classList.remove('resumo-amount--pendente');
    animarContagem(DASH.valorCompra, compra, formatCurrency);
  }

  DASH.custoPendente.classList.toggle('hidden', pendentes === 0);
  if (pendentes > 0) {
    DASH.custoPendenteTexto.textContent = comCusto === 0
      ? `Nenhum produto em estoque tem preço de custo ainda (${pendentes} ${pluralize(pendentes, 'produto')}).`
      : `${pendentes} ${pluralize(pendentes, 'produto')} sem preço de custo: o total de compra está incompleto.`;
  }
}

// Disco do cofre: anel em SVG com três arcos (saudável, baixo, sem estoque) que
// crescem juntos até o tamanho real. O número do meio mostra a situação que domina.
function renderVaultDial(container, { saudavel, baixo, zerado }) {
  const total = saudavel + baixo + zerado;
  const pct = (n) => (total ? (n / total) * 100 : 0);
  const pctSaudavel = pct(saudavel);
  const pctBaixo = pct(baixo);
  const pctZerado = pct(zerado);

  const size = 176;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const corSaudavel = corVar('--teal', '#2CC5B5');
  const corBaixo = corVar('--orange', '#F59E0B');
  const corZerado = corVar('--red', '#E5484D');

  const arc = (percent, offsetPercent, color) => {
    if (percent <= 0) return '';
    return `<circle class="vault-dial-arc" data-pct="${percent}" data-offset="${offsetPercent}" cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="0 ${circumference}" stroke-linecap="round" transform="rotate(-90 ${center} ${center})"></circle>`;
  };

  let cursor = 0;
  const arcoSaudavel = arc(pctSaudavel, cursor, corSaudavel);
  cursor += pctSaudavel;
  const arcoBaixo = arc(pctBaixo, cursor, corBaixo);
  cursor += pctBaixo;
  const arcoZerado = arc(pctZerado, cursor, corZerado);

  // Em empate, mostra o pior dos empatados: é melhor chamar atenção para um problema.
  const statusPorPrioridade = [
    { pct: pctZerado, label: 'sem estoque', cor: corZerado },
    { pct: pctBaixo, label: 'estoque baixo', cor: corBaixo },
    { pct: pctSaudavel, label: 'saudável', cor: corSaudavel },
  ];
  const maiorPct = Math.max(pctZerado, pctBaixo, pctSaudavel);
  const dominante = total ? statusPorPrioridade.find(s => s.pct === maiorPct) : { pct: 0, label: 'sem produtos', cor: corVar('--muted', '#8591A7') };
  const corTexto = corVar('--text', '#0F1A33');

  container.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${total ? `${Math.round(dominante.pct)}% do estoque está ${dominante.label}` : 'Nenhum produto cadastrado'}">
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#EEF1F6" stroke-width="${strokeWidth}"></circle>
      ${arcoSaudavel}${arcoBaixo}${arcoZerado}
      <text x="${center}" y="${center + 4}" text-anchor="middle" class="vault-dial-value" fill="${corTexto}">${total ? '0%' : '—'}</text>
      <text x="${center}" y="${center + 26}" text-anchor="middle" class="vault-dial-caption">${dominante.label}</text>
    </svg>
  `;

  const arcos = [...container.querySelectorAll('.vault-dial-arc')];
  const textoValor = container.querySelector('.vault-dial-value');
  const pctFinal = Math.round(dominante.pct);

  animar(container, (p) => {
    arcos.forEach(el => {
      const length = (Number(el.dataset.pct) / 100) * circumference * p;
      const rotation = (Number(el.dataset.offset) * p / 100) * 360 - 90;
      // Pequeno respiro entre os arcos, para as cores não se encostarem.
      const comRespiro = arcos.length > 1 ? Math.max(length - 3, 0) : length;
      el.setAttribute('stroke-dasharray', `${comRespiro} ${circumference - comRespiro}`);
      el.setAttribute('transform', `rotate(${rotation} ${center} ${center})`);
      el.style.opacity = comRespiro > 0.5 ? 1 : 0;
    });
    if (total) textoValor.textContent = `${Math.round(pctFinal * p)}%`;
  });
}

function renderVaultDialLegend(container, { saudavel, baixo, zerado }) {
  const total = saudavel + baixo + zerado;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const itens = [
    { cor: corVar('--teal', '#2CC5B5'), label: 'Estoque saudável', valor: pct(saudavel), qtd: saudavel },
    { cor: corVar('--orange', '#F59E0B'), label: 'Estoque baixo', valor: pct(baixo), qtd: baixo },
    { cor: corVar('--red', '#E5484D'), label: 'Sem estoque', valor: pct(zerado), qtd: zerado },
  ];

  container.innerHTML = itens.map(i => `
    <div class="vault-dial-legend-item" title="${i.qtd} ${pluralize(i.qtd, 'produto')}"><span class="vault-dial-dot" style="background:${i.cor}"></span>${i.label}<strong>0%</strong></div>
  `).join('');

  const numeros = [...container.querySelectorAll('strong')];
  animar(container, (p) => {
    numeros.forEach((el, idx) => { el.textContent = `${Math.round(itens[idx].valor * p)}%`; });
  });
}

function contagemSituacoes() {
  const baixo = products.filter(p => situacaoEstoque(p) === 'baixo').length;
  const zerado = products.filter(p => situacaoEstoque(p) === 'zerado').length;
  return { saudavel: Math.max(products.length - baixo - zerado, 0), baixo, zerado };
}

// ---- 2. Indicadores --------------------------------------------------------------------

async function renderIndicadores() {
  const [hoje, mes] = await Promise.all([
    buscarVendasEntre(inicioDoDia(), null),
    buscarVendasEntre(inicioDoMes(), null),
  ]);
  const rHoje = resumirLancamentos(hoje.vendas);

  // Vendas de hoje (já com descontos, devoluções e cancelamentos)
  animarContagem(DASH.vendasValor, reais(rHoje.faturamento), formatCurrency);
  DASH.vendasSub.textContent = hoje.erro
    ? 'Não foi possível carregar'
    : rHoje.nVendas ? `${rHoje.nVendas} ${pluralize(rHoje.nVendas, 'venda realizada', 'vendas realizadas')}` : 'Nenhuma venda ainda';

  // Lucro bruto de hoje (só itens com custo gravado no momento da venda)
  animarContagem(DASH.lucroValor, reais(rHoje.lucro), formatCurrency);
  if (!hoje.vendas.length) DASH.lucroSub.textContent = 'Sem vendas hoje';
  else if (rHoje.semCusto) DASH.lucroSub.textContent = `${rHoje.semCusto} ${pluralize(rHoje.semCusto, 'item', 'itens')} sem custo fora da conta`;
  else DASH.lucroSub.textContent = rHoje.margem === null ? '—' : `Margem de ${formatarPercentual(rHoje.margem)}`;

  // Meta mensal
  const meta = Number(lojaAtual?.meta_mensal) || 0;
  const alcancado = reais(resumirLancamentos(mes.vendas).faturamento);
  DASH.metaValor.classList.remove('is-loading');
  if (!meta) {
    DASH.metaValor.textContent = formatCurrency(alcancado);
    DASH.metaBarra.style.width = '0%';
    DASH.metaSub.textContent = souDono() ? 'vendido no mês · definir meta' : 'vendido no mês';
  } else {
    const pct = Math.min((alcancado / meta) * 100, 100);
    animarContagem(DASH.metaValor, (alcancado / meta) * 100, (v) => `${Math.round(v)}%`);
    requestAnimationFrame(() => { DASH.metaBarra.style.width = `${pct}%`; });
    DASH.metaBarra.classList.toggle('progress-bar--ok', alcancado >= meta);
    DASH.metaSub.textContent = `${formatCurrency(alcancado)} de ${formatCurrency(meta)}`;
  }
}

function renderIndicadorEstoque() {
  const { baixo, zerado } = contagemSituacoes();
  animarContagem(DASH.baixoValor, baixo);
  if (!products.length) DASH.baixoSub.textContent = 'Nenhum produto ainda';
  else if (zerado) DASH.baixoSub.textContent = `${zerado} ${pluralize(zerado, 'produto')} sem estoque`;
  else DASH.baixoSub.textContent = baixo ? 'Ver produtos para repor' : 'Tudo em ordem';
}

// ---- 3. Gráfico ------------------------------------------------------------------------

function intervaloDoPeriodo() {
  const hoje = inicioDoDia();
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);

  if (periodoGrafico === '7' || periodoGrafico === '30') {
    const inicio = new Date(hoje); inicio.setDate(inicio.getDate() - (Number(periodoGrafico) - 1));
    return { inicio, fim: amanha };
  }
  if (periodoGrafico === 'mes') return { inicio: inicioDoMes(), fim: amanha };

  const de = DASH.de.value ? new Date(`${DASH.de.value}T00:00:00`) : null;
  const ate = DASH.ate.value ? new Date(`${DASH.ate.value}T00:00:00`) : null;
  if (!de || !ate || de > ate) return null;
  const fim = new Date(ate); fim.setDate(fim.getDate() + 1);
  return { inicio: de, fim };
}

// Agrupa lançamentos por dia, semana ou mês. 'auto' = dia até ~3 meses, depois mês.
// Somas em centavos; os campos vendas/lucro saem em reais para o gráfico.
function montarSeries(lancamentos, inicio, fim, granularidade = 'auto') {
  const dias = Math.round((fim - inicio) / 86400000);
  const modo = granularidade === 'auto' ? (dias > 93 ? 'mes' : 'dia') : granularidade;
  const pontos = [];
  const indice = {};

  // Semana começa na segunda-feira.
  const inicioSemana = (d) => { const x = inicioDoDia(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const chaveDe = (d) => (modo === 'mes' ? `${d.getFullYear()}-${d.getMonth()}` : modo === 'semana' ? chaveDia(inicioSemana(d)) : chaveDia(d));

  const cursor = modo === 'semana' ? inicioSemana(inicio) : new Date(inicio);
  while (cursor < fim) {
    const chave = chaveDe(cursor);
    if (!indice[chave]) {
      let rotulo, completo;
      if (modo === 'mes') {
        rotulo = cursor.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        completo = cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      } else if (modo === 'semana') {
        const fimSemana = somarDias(cursor, 6);
        rotulo = cursor.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        completo = `Semana de ${formatarData(cursor)} a ${formatarData(fimSemana)}`;
      } else {
        rotulo = dias <= 7
          ? cursor.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
          : cursor.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        completo = cursor.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
      }
      indice[chave] = { rotulo, completo, vendasC: 0, lucroC: 0, descontosC: 0, temLucro: false, semCusto: 0, chavesVenda: new Set() };
      pontos.push(indice[chave]);
    }
    if (modo === 'mes') cursor.setMonth(cursor.getMonth() + 1, 1);
    else cursor.setDate(cursor.getDate() + (modo === 'semana' ? 7 : 1));
  }

  lancamentos.forEach(m => {
    const ponto = indice[chaveDe(new Date(m.created_at))];
    if (!ponto) return;
    ponto.vendasC += centavos(m.total);
    if ((m.tipo || 'venda') === 'venda') {
      ponto.descontosC += centavos(m.desconto);
      if (m.venda_status !== 'cancelada') ponto.chavesVenda.add(chaveVenda(m));
    }
    const cmv = cmvCentavos(m);
    if (cmv === null) { if ((m.tipo || 'venda') === 'venda') ponto.semCusto += 1; }
    else { ponto.lucroC += centavos(m.total) - cmv; ponto.temLucro = true; }
  });

  pontos.forEach(p => {
    p.vendas = reais(p.vendasC);
    p.lucro = reais(p.lucroC);
    p.nVendas = p.chavesVenda.size;
  });
  return pontos;
}

function mostrarEstadoGrafico(tipo) {
  const estados = {
    carregando: '<span class="skeleton" style="width:180px;height:12px"></span><span class="skeleton" style="width:120px;height:12px"></span>',
    vazio: '<i class="ti ti-chart-bar-off"></i><p>Nenhuma venda nesse período.</p>',
    erro: '<i class="ti ti-wifi-off"></i><p>Não foi possível carregar as vendas.</p>',
    periodo: '<i class="ti ti-calendar"></i><p>Escolha as datas de início e fim.</p>',
  };
  DASH.estado.innerHTML = estados[tipo] || '';
  DASH.estado.classList.toggle('hidden', !tipo);
}

function valorCompacto(v) {
  if (Math.abs(v) >= 1000) return `R$ ${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
  return `R$ ${Math.round(v)}`;
}

function desenharGrafico(pontos) {
  if (typeof Chart === 'undefined') return;
  const teal = corVar('--teal', '#2CC5B5');
  const verde = corVar('--green', '#15803D');
  const muted = corVar('--muted', '#8591A7');

  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.font.size = 12;
  Chart.defaults.color = muted;

  const dados = {
    labels: pontos.map(p => p.rotulo),
    datasets: [
      {
        type: 'bar', label: 'Vendas', data: pontos.map(p => p.vendas), order: 2,
        backgroundColor: teal, hoverBackgroundColor: '#22B0A1',
        borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'bottom',
        maxBarThickness: 28, categoryPercentage: 0.7, barPercentage: 0.9,
      },
      {
        type: 'line', label: 'Lucro bruto', data: pontos.map(p => (p.temLucro ? p.lucro : null)), order: 1,
        borderColor: verde, backgroundColor: verde, borderWidth: 2, cubicInterpolationMode: 'monotone',
        pointRadius: pontos.length > 31 ? 0 : 4, pointHoverRadius: 6,
        pointBackgroundColor: verde, pointBorderColor: '#fff', pointBorderWidth: 2, spanGaps: false,
      },
    ],
  };

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefereMenosMovimento() ? false : { duration: 600 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101A32', padding: 12, cornerRadius: 10, boxPadding: 4,
        titleColor: '#fff', bodyColor: '#E6EAF2', titleFont: { weight: '600' },
        callbacks: {
          title: (itens) => pontos[itens[0].dataIndex].completo,
          label: (item) => (item.raw === null ? `${item.dataset.label}: sem custo informado` : `${item.dataset.label}: ${formatCurrency(item.raw)}`),
          afterBody: (itens) => {
            const p = pontos[itens[0].dataIndex];
            return p.semCusto ? [`${p.semCusto} ${pluralize(p.semCusto, 'item', 'itens')} sem custo fora do lucro`] : [];
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { color: '#E6EAF2' }, ticks: { maxRotation: 0, autoSkipPadding: 12, color: muted } },
      y: {
        beginAtZero: true, border: { display: false },
        grid: { color: '#EEF1F6' }, ticks: { maxTicksLimit: 5, color: muted, callback: valorCompacto },
      },
    },
  };

  if (graficoDesempenho) {
    graficoDesempenho.data = dados;
    graficoDesempenho.options = opcoes;
    graficoDesempenho.update();
  } else {
    graficoDesempenho = new Chart(DASH.canvas, { data: dados, options: opcoes });
  }
}

function renderTabelaGrafico(pontos) {
  DASH.tabela.innerHTML = `
    <table class="table">
      <thead><tr><th>Período</th><th class="num">Vendas</th><th class="num">Lucro bruto</th></tr></thead>
      <tbody>${pontos.map(p => `
        <tr><td>${esc(p.completo)}</td><td class="num">${formatCurrency(p.vendas)}</td><td class="num">${p.temLucro ? formatCurrency(p.lucro) : '<span class="texto-muted">—</span>'}</td></tr>
      `).join('')}</tbody>
    </table>`;
}

async function carregarGrafico() {
  const intervalo = intervaloDoPeriodo();
  if (!intervalo) {
    mostrarEstadoGrafico('periodo');
    return;
  }

  const minhaRequisicao = ++requisicaoGrafico;
  mostrarEstadoGrafico('carregando');
  const { erro, vendas } = await buscarVendasEntre(intervalo.inicio, intervalo.fim);
  if (minhaRequisicao !== requisicaoGrafico) return; // o usuário trocou de período no meio

  if (erro) {
    mostrarEstadoGrafico('erro');
    return;
  }

  dadosGrafico = montarSeries(vendas, intervalo.inicio, intervalo.fim);
  const totalVendas = reais(dadosGrafico.reduce((s, p) => s + p.vendasC, 0));
  const totalLucro = reais(dadosGrafico.reduce((s, p) => s + p.lucroC, 0));
  const semCusto = dadosGrafico.reduce((s, p) => s + p.semCusto, 0);

  animarContagem(DASH.totalVendas, totalVendas, formatCurrency);
  animarContagem(DASH.totalLucro, totalLucro, formatCurrency);
  DASH.nota.textContent = semCusto
    ? `${semCusto} ${pluralize(semCusto, 'item vendido', 'itens vendidos')} sem preço de custo não ${pluralize(semCusto, 'entra', 'entram')} no lucro.`
    : 'Lucro bruto = vendas − custo dos produtos vendidos.';

  desenharGrafico(dadosGrafico);
  renderTabelaGrafico(dadosGrafico);
  mostrarEstadoGrafico(totalVendas === 0 ? 'vazio' : null);
}

function selecionarPeriodoGrafico(periodo) {
  periodoGrafico = periodo;
  DASH.periodo.querySelectorAll('[data-periodo]').forEach(b => {
    b.classList.toggle('active', b.dataset.periodo === periodo);
    b.setAttribute('aria-pressed', String(b.dataset.periodo === periodo));
  });
  DASH.periodoCustom.classList.toggle('hidden', periodo !== 'custom');

  if (periodo === 'custom' && !DASH.de.value) {
    const hoje = new Date();
    const inicio = new Date(); inicio.setDate(inicio.getDate() - 13);
    DASH.de.value = chaveDia(inicio);
    DASH.ate.value = chaveDia(hoje);
  }
  carregarGrafico();
}

// ---- Atualização geral ---------------------------------------------------------------

async function updateDashboard() {
  if (!lojaAtual || !souDono()) return;

  renderValoresEstoque();
  const situacoes = contagemSituacoes();
  renderVaultDial(DASH.dial, situacoes);
  renderVaultDialLegend(DASH.dialLegenda, situacoes);
  renderIndicadorEstoque();

  await Promise.all([renderIndicadores(), carregarGrafico()]);
}

function initDashboard() {
  DASH.custoPendenteLink.addEventListener('click', () => {
    DOM.filterStock.value = 'sem_custo';
    applyFilters();
    changeTab('estoque');
  });
  DASH.meta.addEventListener('click', () => changeTab('metas'));
  DASH.baixo.addEventListener('click', () => changeTab('estoque-baixo'));

  DASH.periodo.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-periodo]');
    if (btn) selecionarPeriodoGrafico(btn.dataset.periodo);
  });
  [DASH.de, DASH.ate].forEach(el => el.addEventListener('change', carregarGrafico));

  DASH.verTabela.addEventListener('click', () => {
    const abrir = DASH.tabela.classList.contains('hidden');
    DASH.tabela.classList.toggle('hidden', !abrir);
    DASH.verTabela.textContent = abrir ? 'Esconder tabela' : 'Ver tabela';
  });
}
