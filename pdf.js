// ============================================
// RELATÓRIOS EM PDF
// ============================================
// · Produtos → "Baixar PDF": relatório de estoque com os filtros da tela.
// · Análises → "Baixar relatório PDF": a aba atual ou o relatório completo.
// Os números vêm das mesmas funções das telas (resumirLancamentos, montarDadosRelatorio).
// Custo, lucro e margem só entram para o dono.
// A biblioteca (jsPDF + AutoTable) só é baixada na primeira vez que alguém gera um PDF.

const PDF_LIBS = [
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js',
];

const PDF_COR = {
  navy: [16, 26, 50],
  texto: [15, 26, 51],
  texto2: [79, 94, 120],
  muted: [133, 145, 167],
  borda: [230, 234, 242],
  fundo: [246, 248, 252],
  cabecalho: [238, 241, 247],
  azul: [59, 108, 255],
  roxo: [124, 92, 255],
  verde: [21, 128, 61],
  turquesaTexto: [11, 132, 120],
  laranja: [178, 94, 9],
  vermelho: [197, 48, 58],
};

const MARCA_SLOGAN = 'Gestão inteligente para lojas de tecnologia';

// Símbolo da marca CASEON: capinha arredondada com um "C" e o ponto de "ligado".
const CASEON_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B6CFF"/><stop offset="1" stop-color="#7C5CFF"/></linearGradient></defs>
  <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#g)"/>
  <path d="M41.6 22.4A13.6 13.6 0 1 0 41.6 41.6" fill="none" stroke="#fff" stroke-width="6.4" stroke-linecap="round"/>
  <circle cx="44.2" cy="32" r="3.9" fill="#fff"/>
</svg>`;

let promessaLibsPdf = null;
let logoPdfPng = null;

function carregarScript(src) {
  return new Promise((resolver, rejeitar) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolver;
    s.onerror = () => rejeitar(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(s);
  });
}

function carregarLibsPdf() {
  if (window.jspdf?.jsPDF?.API?.autoTable) return Promise.resolve();
  if (!promessaLibsPdf) {
    promessaLibsPdf = (async () => {
      if (!window.jspdf) await carregarScript(PDF_LIBS[0]);
      if (!window.jspdf.jsPDF.API.autoTable) await carregarScript(PDF_LIBS[1]);
    })().catch(e => { promessaLibsPdf = null; throw e; });
  }
  return promessaLibsPdf;
}

// Logo em PNG, desenhado a partir do SVG da marca (sem depender de imagem externa).
async function logoPng() {
  if (logoPdfPng) return logoPdfPng;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(CASEON_LOGO_SVG)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  canvas.getContext('2d').drawImage(img, 0, 0, 256, 256);
  logoPdfPng = canvas.toDataURL('image/png');
  return logoPdfPng;
}

// As fontes padrão do PDF só têm o alfabeto latino: troca o que não cabe nelas.
function txt(valor) {
  return String(valor ?? '')
    .replace(/ | /g, ' ')
    .replace(/[−–—]/g, '-')
    .replace(/×/g, 'x')
    .replace(/→/g, '->')
    .replace(/[^\x00-\xFF]/g, '');
}

const dinheiroPdf = (c) => txt(brlC(c));
const pctPdf = (v) => (v === null || v === undefined ? '-' : txt(formatarPercentual(Math.round(v * 10) / 10)));

function agoraFormatado() {
  return new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ---- Montagem do documento ---------------------------------------------------------------

async function novoPdf({ titulo, subtitulo, linhasInfo, paisagem = false }) {
  await carregarLibsPdf();
  const logo = await logoPng().catch(() => null);
  const doc = new window.jspdf.jsPDF({ orientation: paisagem ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({ title: txt(`${titulo} · ${lojaAtual?.nome || ''}`), author: 'CASEON', creator: 'CASEON' });

  const ctx = {
    doc, titulo, logo,
    W: doc.internal.pageSize.getWidth(),
    H: doc.internal.pageSize.getHeight(),
    M: 14,
    topo: 30,
    y: 30,
    geradoEm: agoraFormatado(),
  };

  // Bloco de abertura (só na primeira página).
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...PDF_COR.texto);
  doc.text(txt(titulo), ctx.M, ctx.y + 4);
  ctx.y += 10;
  if (subtitulo) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...PDF_COR.texto2);
    doc.text(txt(subtitulo), ctx.M, ctx.y);
    ctx.y += 6;
  }

  const info = linhasInfo.filter(Boolean);
  const alturaInfo = 6 + info.length * 5;
  doc.setDrawColor(...PDF_COR.borda);
  doc.setFillColor(...PDF_COR.fundo);
  doc.roundedRect(ctx.M, ctx.y, ctx.W - ctx.M * 2, alturaInfo, 2, 2, 'FD');
  doc.setFontSize(8.5);
  info.forEach(([rotulo, valor], i) => {
    const yl = ctx.y + 6.2 + i * 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COR.texto2);
    doc.text(txt(rotulo), ctx.M + 4, yl);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COR.texto);
    doc.text(doc.splitTextToSize(txt(valor), ctx.W - ctx.M * 2 - 40)[0] || '', ctx.M + 34, yl);
  });
  ctx.y += alturaInfo + 8;
  return ctx;
}

// Cabeçalho e rodapé em todas as páginas (desenhados no fim, quando se sabe o total).
function finalizarPdf(ctx, nomeArquivo) {
  const { doc, W, H, M } = ctx;
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    if (ctx.logo) doc.addImage(ctx.logo, 'PNG', M, 9, 8, 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...PDF_COR.navy);
    doc.text('CASE', M + 10.5, 14.8);
    const largCase = doc.getTextWidth('CASE');
    doc.setTextColor(...PDF_COR.azul);
    doc.text('ON', M + 10.5 + largCase, 14.8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_COR.texto2);
    doc.text(txt(`${ctx.titulo} · ${lojaAtual?.nome || ''}`), W - M, 14.5, { align: 'right' });
    doc.setDrawColor(...PDF_COR.borda);
    doc.setLineWidth(0.3);
    doc.line(M, 20, W - M, 20);

    doc.line(M, H - 13, W - M, H - 13);
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COR.muted);
    doc.text(txt(`CASEON · ${MARCA_SLOGAN}`), M, H - 8.5);
    doc.text(txt(`Gerado em ${ctx.geradoEm}`), W / 2, H - 8.5, { align: 'center' });
    doc.text(`Página ${i} de ${total}`, W - M, H - 8.5, { align: 'right' });
  }
  doc.save(nomeArquivo);
}

function garantirEspaco(ctx, altura) {
  if (ctx.y + altura > ctx.H - 20) {
    ctx.doc.addPage();
    ctx.y = ctx.topo;
  }
}

// Título de seção. "resto" = espaço mínimo do que vem logo abaixo (tabela, gráfico),
// para o título nunca ficar sozinho no pé da página.
function secaoPdf(ctx, titulo, descricao = '', resto = 30) {
  garantirEspaco(ctx, (descricao ? 14 : 8) + resto);
  const { doc, M } = ctx;
  doc.setFillColor(...PDF_COR.azul);
  doc.roundedRect(M, ctx.y - 3.6, 1.2, 5, 0.6, 0.6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...PDF_COR.texto);
  doc.text(txt(titulo), M + 3.5, ctx.y);
  ctx.y += 5;
  if (descricao) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_COR.texto2);
    const linhas = doc.splitTextToSize(txt(descricao), ctx.W - M * 2);
    doc.text(linhas, M, ctx.y);
    ctx.y += linhas.length * 4;
  }
  ctx.y += 2;
}

function paragrafoPdf(ctx, texto, { cor = PDF_COR.texto2, tamanho = 8.5, negrito = false } = {}) {
  const { doc, M } = ctx;
  doc.setFont('helvetica', negrito ? 'bold' : 'normal');
  doc.setFontSize(tamanho);
  const linhas = doc.splitTextToSize(txt(texto), ctx.W - M * 2);
  garantirEspaco(ctx, linhas.length * (tamanho * 0.45) + 2);
  doc.setTextColor(...cor);
  doc.text(linhas, M, ctx.y);
  ctx.y += linhas.length * (tamanho * 0.45) + 3;
}

function avisoPdf(ctx, texto) {
  const { doc, M } = ctx;
  doc.setFontSize(8);
  const linhas = doc.splitTextToSize(txt(texto), ctx.W - M * 2 - 8);
  const h = linhas.length * 3.8 + 4;
  garantirEspaco(ctx, h + 2);
  doc.setFillColor(255, 245, 227);
  doc.setDrawColor(255, 232, 190);
  doc.roundedRect(M, ctx.y - 1, ctx.W - M * 2, h, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COR.laranja);
  doc.text(linhas, M + 4, ctx.y + 3);
  ctx.y += h + 4;
}

// Cartões de indicador, n por linha.
function kpisPdf(ctx, itens, porLinha = 3) {
  const { doc, M } = ctx;
  const gap = 4;
  const larg = (ctx.W - M * 2 - gap * (porLinha - 1)) / porLinha;
  const alt = 18;
  for (let i = 0; i < itens.length; i += porLinha) {
    garantirEspaco(ctx, alt + gap);
    itens.slice(i, i + porLinha).forEach((k, j) => {
      const x = M + j * (larg + gap);
      doc.setDrawColor(...PDF_COR.borda);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, ctx.y, larg, alt, 2, 2, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...PDF_COR.texto2);
      doc.text(txt(k.rotulo), x + 3.5, ctx.y + 5.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.setTextColor(...(k.cor || PDF_COR.texto));
      doc.text(txt(k.valor), x + 3.5, ctx.y + 12);
      if (k.nota) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(...PDF_COR.muted);
        doc.text(doc.splitTextToSize(txt(k.nota), larg - 7)[0], x + 3.5, ctx.y + 16);
      }
    });
    ctx.y += alt + gap;
  }
  ctx.y += 2;
}

function tabelaPdf(ctx, { cabecalho, linhas, numericas = [], rodape = null, larguras = {}, colorir = null, tamanho = 8 }) {
  garantirEspaco(ctx, 20);
  const estilosColunas = {};
  numericas.forEach(i => { estilosColunas[i] = { halign: 'right' }; });
  Object.entries(larguras).forEach(([i, w]) => { estilosColunas[i] = { ...(estilosColunas[i] || {}), cellWidth: w }; });

  ctx.doc.autoTable({
    startY: ctx.y,
    head: [cabecalho.map(txt)],
    body: linhas.map(l => l.map(txt)),
    foot: rodape ? [rodape.map(txt)] : undefined,
    margin: { top: ctx.topo, bottom: 20, left: ctx.M, right: ctx.M },
    theme: 'plain',
    showHead: 'everyPage',
    showFoot: 'lastPage',
    rowPageBreak: 'avoid',
    styles: { font: 'helvetica', fontSize: tamanho, cellPadding: { top: 2.2, bottom: 2.2, left: 2.5, right: 2.5 }, textColor: PDF_COR.texto, overflow: 'linebreak', lineColor: PDF_COR.borda, lineWidth: { bottom: 0.2 } },
    headStyles: { fillColor: PDF_COR.cabecalho, textColor: PDF_COR.texto2, fontStyle: 'bold', fontSize: tamanho - 0.5 },
    footStyles: { fillColor: PDF_COR.fundo, textColor: PDF_COR.texto, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [251, 252, 254] },
    columnStyles: estilosColunas,
    didParseCell: (dado) => {
      // Cabeçalho e rodapé das colunas de número também alinham à direita.
      if (dado.section !== 'body') {
        if (numericas.includes(dado.column.index)) dado.cell.styles.halign = 'right';
        return;
      }
      if (!colorir) return;
      const cor = colorir(dado.row.index, dado.column.index, dado.cell.raw);
      if (cor) { dado.cell.styles.textColor = cor; dado.cell.styles.fontStyle = 'bold'; }
    },
  });
  ctx.y = ctx.doc.lastAutoTable.finalY + 7;
}

// Gráfico do Chart.js desenhado fora da tela e colado como imagem.
async function graficoPdf(ctx, config, alturaMm = 62) {
  if (typeof Chart === 'undefined') return;
  const caixa = document.createElement('div');
  caixa.style.cssText = 'position:fixed;left:-10000px;top:0;width:1400px;height:520px';
  const canvas = document.createElement('canvas');
  canvas.width = 1400; canvas.height = 520;
  caixa.appendChild(canvas);
  document.body.appendChild(caixa);

  const fundoBranco = { id: 'fundoBranco', beforeDraw: (c) => { const g = c.ctx; g.save(); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.restore(); } };
  const opcoes = {
    ...config.options,
    responsive: false, animation: false, devicePixelRatio: 1,
    plugins: { ...config.options.plugins, legend: { display: config.data.datasets.length > 1, position: 'top', align: 'end', labels: { boxWidth: 14, font: { size: 18 } } }, tooltip: { enabled: false } },
    scales: {
      x: { ...config.options.scales.x, ticks: { ...config.options.scales.x.ticks, font: { size: 17 } } },
      y: { ...config.options.scales.y, ticks: { ...config.options.scales.y.ticks, font: { size: 17 } } },
    },
  };
  const grafico = new Chart(canvas, { data: config.data, options: opcoes, plugins: [fundoBranco] });
  const imagem = canvas.toDataURL('image/png');
  grafico.destroy();
  caixa.remove();

  garantirEspaco(ctx, alturaMm + 4);
  const largura = ctx.W - ctx.M * 2;
  ctx.doc.setDrawColor(...PDF_COR.borda);
  ctx.doc.roundedRect(ctx.M, ctx.y, largura, alturaMm, 2, 2, 'S');
  ctx.doc.addImage(imagem, 'PNG', ctx.M + 2, ctx.y + 2, largura - 4, alturaMm - 4);
  ctx.y += alturaMm + 7;
}

async function comBotaoOcupado(botao, tarefa) {
  const original = botao?.innerHTML;
  if (botao) { botao.disabled = true; botao.innerHTML = '<i class="ti ti-loader-2"></i>Gerando PDF...'; }
  try {
    await tarefa();
  } catch (e) {
    console.error(e);
    showToast('Não foi possível gerar o PDF. Confira a internet e tente de novo.', 'error', 5000);
  } finally {
    if (botao) { botao.disabled = false; botao.innerHTML = original; }
  }
}

// ---- PDF de estoque (Produtos) ------------------------------------------------------------

function descricaoFiltrosProdutos() {
  const f = getFilterValues();
  const partes = [];
  if (f.search.trim()) partes.push(`Busca: "${f.search.trim()}"`);
  if (f.type) partes.push(`Categoria: ${TIPO_LABELS[f.type] || f.type}`);
  if (f.brand) partes.push(`Marca: ${f.brand}`);
  if (f.variacao) partes.push(`Linha/tipo: ${f.variacao}`);
  if (f.stock) partes.push(`Situação: ${STOCK_FILTER_LABELS[f.stock] || f.stock}`);
  return partes;
}

async function baixarPdfEstoque() {
  const lista = filteredProducts;
  if (!lista.length) {
    showToast('Não há produtos para colocar no PDF com esses filtros.', 'warning');
    return;
  }

  await comBotaoOcupado(DOM.pdfEstoqueBtn, async () => {
    const dono = souDono();
    const filtros = descricaoFiltrosProdutos();
    const escopo = filtros.length ? `${lista.length} de ${products.length} produtos · ${filtros.join(' · ')}` : `Todos os produtos ativos (${lista.length})`;
    const ctx = await novoPdf({
      titulo: 'Relatório de estoque',
      subtitulo: 'Produtos, quantidades e valores do estoque',
      paisagem: true,
      linhasInfo: [['Loja', lojaAtual?.nome || ''], ['Escopo', escopo], ['Gerado em', agoraFormatado()]],
    });

    let compraC = 0, vendaC = 0, unidades = 0, semCusto = 0, baixos = 0, zerados = 0;
    const linhas = lista.map(p => {
      const qtd = Math.max(Number(p.quantity) || 0, 0);
      const custo = custoDoProduto(p.id);
      const vendaTotalC = centavos(p.price) * qtd;
      unidades += qtd;
      vendaC += vendaTotalC;
      const situacao = p.arquivado_em ? 'Arquivado' : SITUACAO_INFO[situacaoEstoque(p)].label;
      if (!p.arquivado_em && situacaoEstoque(p) === 'baixo') baixos += 1;
      if (!p.arquivado_em && situacaoEstoque(p) === 'zerado') zerados += 1;
      const linha = [nomeProduto(p), TIPO_LABEL_SINGULAR[p.type] || p.type, p.variacao || '-', String(qtd)];
      if (dono) {
        if (custo === null) { if (qtd > 0) semCusto += 1; }
        else compraC += centavos(custo) * qtd;
        linha.push(custo === null ? 'Não informado' : formatCurrency(custo));
      }
      linha.push(formatCurrency(p.price));
      if (dono) linha.push(custo === null ? '-' : brlC(centavos(custo) * qtd));
      linha.push(brlC(vendaTotalC), situacao);
      return linha;
    });

    const cabecalho = ['Produto', 'Categoria', 'Linha / tipo', 'Qtd'];
    if (dono) cabecalho.push('Custo un.');
    cabecalho.push('Venda un.');
    if (dono) cabecalho.push('Total compra');
    cabecalho.push('Total venda', 'Situação');
    const iSituacao = cabecalho.length - 1;
    const numericas = cabecalho.map((c, i) => (['Qtd', 'Custo un.', 'Venda un.', 'Total compra', 'Total venda'].includes(c) ? i : null)).filter(i => i !== null);

    tabelaPdf(ctx, {
      cabecalho, linhas, numericas,
      larguras: { 0: dono ? 70 : 90 },
      rodape: (() => {
        const r = ['Total', '', '', formatarNumero(unidades)];
        if (dono) r.push('');
        r.push('');
        if (dono) r.push(brlC(compraC) + (semCusto ? '*' : ''));
        r.push(brlC(vendaC), '');
        return r;
      })(),
      colorir: (_, col, valor) => {
        if (col !== iSituacao) return null;
        if (valor === 'Sem estoque') return PDF_COR.vermelho;
        if (valor === 'Estoque baixo') return PDF_COR.laranja;
        if (valor === 'Em estoque') return PDF_COR.turquesaTexto;
        return PDF_COR.muted;
      },
    });

    secaoPdf(ctx, 'Resumo geral');
    const kpis = [
      { rotulo: 'Produtos no relatório', valor: formatarNumero(lista.length) },
      { rotulo: 'Unidades em estoque', valor: formatarNumero(unidades) },
    ];
    if (dono) kpis.push({ rotulo: semCusto ? 'Valor total de compra (parcial)' : 'Valor total de compra', valor: brlC(compraC), cor: PDF_COR.azul });
    kpis.push(
      { rotulo: 'Valor total de venda', valor: brlC(vendaC), cor: PDF_COR.turquesaTexto },
      { rotulo: 'Com estoque baixo', valor: formatarNumero(baixos), cor: baixos ? PDF_COR.laranja : PDF_COR.texto },
      { rotulo: 'Sem estoque', valor: formatarNumero(zerados), cor: zerados ? PDF_COR.vermelho : PDF_COR.texto },
    );
    kpisPdf(ctx, kpis, 3);
    if (dono && semCusto) {
      avisoPdf(ctx, `* ${semCusto} ${pluralize(semCusto, 'produto com estoque está', 'produtos com estoque estão')} sem preço de custo. O valor total de compra é parcial: custo desconhecido não foi contado como zero.`);
    }

    finalizarPdf(ctx, `caseon-estoque-${chaveDia(new Date())}.pdf`);
    showToast('PDF do estoque baixado.', 'success');
  });
}

// ---- PDF de Análises -----------------------------------------------------------------------

function infoAnalises(d) {
  return [
    ['Loja', lojaAtual?.nome || ''],
    ['Período', d.intervalo.rotulo],
    d.anteriorIntervalo ? ['Comparação', `${formatarData(d.anteriorIntervalo.inicio)} a ${formatarData(somarDias(d.anteriorIntervalo.fim, -1))} (${d.anteriorIntervalo.rotulo})`] : null,
    ['Filtros', d.filtros.length ? d.filtros.join(' · ') : 'Nenhum (todas as vendas)'],
    ['Gerado em', agoraFormatado()],
  ];
}

function variacaoTexto(atual, anterior, pontos = false) {
  if (atual === null || anterior === null || anterior === undefined) return 'sem comparação';
  if (pontos) {
    const diff = atual - anterior;
    return `${diff >= 0 ? '+' : '-'}${Math.abs(diff).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p. vs. anterior`;
  }
  if (!anterior) return atual ? 'sem base anterior' : '-';
  const pct = Math.round(((atual - anterior) / Math.abs(anterior)) * 100);
  return `${pct >= 0 ? '+' : '-'}${Math.abs(pct)}% vs. anterior`;
}

function pdfIndicadores(ctx, d) {
  const r = d.rel.resumo, a = d.relAnterior.resumo, dono = souDono();
  const kpis = [
    { rotulo: 'Faturamento', valor: brlC(r.faturamento), nota: variacaoTexto(r.faturamento, a.faturamento), cor: PDF_COR.turquesaTexto },
  ];
  if (dono) {
    kpis.push(
      { rotulo: 'Custo das mercadorias vendidas', valor: brlC(r.cmv), nota: variacaoTexto(r.cmv, a.cmv) },
      { rotulo: r.semCusto ? 'Lucro bruto (parcial)' : 'Lucro bruto', valor: brlC(r.lucro), nota: variacaoTexto(r.lucro, a.lucro), cor: PDF_COR.verde },
      { rotulo: 'Margem bruta', valor: pctPdf(r.margem), nota: variacaoTexto(r.margem, a.margem, true), cor: PDF_COR.verde },
    );
  }
  kpis.push(
    { rotulo: 'Vendas', valor: formatarNumero(r.nVendas), nota: variacaoTexto(r.nVendas, a.nVendas) },
    { rotulo: 'Ticket médio', valor: brlC(r.ticket), nota: variacaoTexto(r.ticket, a.ticket) },
    { rotulo: 'Descontos concedidos', valor: brlC(r.descontos), nota: variacaoTexto(r.descontos, a.descontos) },
    { rotulo: 'Devoluções e cancelamentos', valor: brlC(r.devolucoes), nota: r.canceladas ? `${r.canceladas} ${pluralize(r.canceladas, 'venda cancelada', 'vendas canceladas')}` : '' },
    { rotulo: 'Itens vendidos', valor: formatarNumero(r.unidades) },
  );
  kpisPdf(ctx, kpis, 3);
  if (dono && r.semCusto) avisoPdf(ctx, `${r.semCusto} ${pluralize(r.semCusto, 'item vendido', 'itens vendidos')} sem custo gravado: custo e lucro são parciais. Esses itens ficam fora da conta (nunca contam como custo zero).`);
}

async function pdfGraficoFaturamento(ctx, d) {
  if (!d.lancamentos.length) return;
  secaoPdf(ctx, souDono() ? 'Faturamento x lucro bruto' : 'Faturamento', 'Por dia (ou por mês em períodos longos).', 70);
  await graficoPdf(ctx, configGraficoFaturamento(montarSeries(d.lancamentos, d.intervalo.inicio, d.intervalo.fim), { comLucro: souDono() }));
}

function pdfVendasPorPeriodo(ctx, d, gran = granularidade) {
  const pontos = montarSeries(d.lancamentos, d.intervalo.inicio, d.intervalo.fim, gran).filter(p => p.vendasC || p.nVendas);
  secaoPdf(ctx, `Faturamento ${{ dia: 'diário', semana: 'semanal', mes: 'mensal' }[gran] || ''}`.trim());
  if (!pontos.length) { paragrafoPdf(ctx, 'Sem vendas no período.'); return; }
  tabelaPdf(ctx, {
    cabecalho: ['Período', 'Vendas', 'Faturamento', 'Ticket médio', 'Descontos'],
    linhas: pontos.map(p => [p.completo, String(p.nVendas), brlC(p.vendasC), p.nVendas ? brlC(Math.round(p.vendasC / p.nVendas)) : '-', p.descontosC ? brlC(p.descontosC) : '-']),
    numericas: [1, 2, 3, 4],
    rodape: ['Total', String(d.rel.resumo.nVendas), brlC(d.rel.resumo.faturamento), brlC(d.rel.resumo.ticket), brlC(d.rel.resumo.descontos)],
  });
}

function pdfFormas(ctx, d) {
  secaoPdf(ctx, 'Vendas por forma de pagamento', 'Quanto entrou por cada forma, já com devoluções.');
  const formas = [...d.rel.formas].sort((a, b) => b.fatC - a.fatC);
  const total = formas.reduce((s, f) => s + f.fatC, 0);
  if (!formas.length) { paragrafoPdf(ctx, 'Sem vendas no período.'); return; }
  tabelaPdf(ctx, {
    cabecalho: ['Forma de pagamento', 'Vendas', 'Valor recebido', '% do total'],
    linhas: formas.map(f => [f.nome, String(f.nVendas), brlC(f.fatC), total ? pctPdf((f.fatC / total) * 100) : '-']),
    numericas: [1, 2, 3],
  });
}

function pdfVendedores(ctx, d) {
  secaoPdf(ctx, 'Vendas por funcionário', 'O que cada pessoa vendeu (antes de devoluções).');
  const vendedores = [...d.rel.vendedores].sort((a, b) => b.fatC - a.fatC);
  if (!vendedores.length) { paragrafoPdf(ctx, 'Sem vendas no período.'); return; }
  tabelaPdf(ctx, {
    cabecalho: ['Vendedor', 'Vendas', 'Faturamento', 'Ticket médio', 'Descontos'],
    linhas: vendedores.map(v => [v.nome, String(v.nVendas), brlC(v.fatC), brlC(v.ticketC), v.descontosC ? brlC(v.descontosC) : '-']),
    numericas: [1, 2, 3, 4],
  });
}

function linhasProdutosPdf(lista) {
  const dono = souDono();
  return lista.map(p => {
    const linha = [p.nome, TIPO_LABEL_SINGULAR[p.tipo] || '', formatarNumero(p.unidades), brlC(p.fatC)];
    if (dono) {
      const sem = p.semCusto && !p.cmvC;
      linha.push(sem ? 'sem custo' : brlC(p.cmvC), sem ? '-' : brlC(p.lucroC), pctPdf(p.margem));
    }
    return linha;
  });
}

function cabecalhoProdutosPdf() {
  return souDono()
    ? ['Produto', 'Categoria', 'Unidades', 'Faturamento', 'Custo merc.', 'Lucro bruto', 'Margem']
    : ['Produto', 'Categoria', 'Unidades', 'Faturamento'];
}

function pdfRankingProdutos(ctx, d, { titulo, criterio, limite }) {
  const lista = ordenarProdutos(d.rel.produtos, criterio).slice(0, limite);
  secaoPdf(ctx, titulo, `${lista.length} de ${d.rel.produtos.length} produtos vendidos no período.`);
  if (!lista.length) { paragrafoPdf(ctx, 'Nenhum produto vendido no período.'); return; }
  tabelaPdf(ctx, { cabecalho: cabecalhoProdutosPdf(), linhas: linhasProdutosPdf(lista), numericas: [2, 3, 4, 5, 6], larguras: { 0: 62 } });
}

function pdfCategorias(ctx, d) {
  const dono = souDono();
  secaoPdf(ctx, 'Desempenho por categoria');
  const cats = [...d.rel.categorias].sort((a, b) => b.fatC - a.fatC);
  if (!cats.length) { paragrafoPdf(ctx, 'Sem vendas no período.'); return; }
  tabelaPdf(ctx, {
    cabecalho: dono ? ['Categoria', 'Unidades', 'Faturamento', 'Custo merc.', 'Lucro bruto', 'Margem'] : ['Categoria', 'Unidades', 'Faturamento'],
    linhas: cats.map(c => (dono ? [c.nome, formatarNumero(c.unidades), brlC(c.fatC), brlC(c.cmvC), brlC(c.lucroC), pctPdf(c.margem)] : [c.nome, formatarNumero(c.unidades), brlC(c.fatC)])),
    numericas: [1, 2, 3, 4, 5],
  });
}

function pdfModelos(ctx, d) {
  secaoPdf(ctx, 'Quantidade vendida por modelo', 'Soma todas as linhas e tipos do mesmo modelo.');
  const modelos = [...d.rel.modelos].sort((a, b) => b.unidades - a.unidades).slice(0, 25);
  if (!modelos.length) { paragrafoPdf(ctx, 'Sem vendas no período.'); return; }
  tabelaPdf(ctx, { cabecalho: ['Modelo', 'Unidades', 'Faturamento'], linhas: modelos.map(m => [m.nome, formatarNumero(m.unidades), brlC(m.fatC)]), numericas: [1, 2] });
}

function pdfListaEstoque(ctx, titulo, descricao, lista, valor) {
  secaoPdf(ctx, `${titulo} (${lista.length})`, descricao);
  if (!lista.length) { paragrafoPdf(ctx, 'Nenhum.'); return; }
  tabelaPdf(ctx, {
    cabecalho: ['Produto', 'Categoria', 'Linha / tipo', 'Em estoque', valor.titulo],
    linhas: lista.slice(0, 40).map(item => { const p = item.p || item; return [nomeProduto(p), TIPO_LABEL_SINGULAR[p.type] || '', p.variacao || '-', String(p.quantity), valor.de(item)]; }),
    numericas: [3, 4],
  });
  if (lista.length > 40) paragrafoPdf(ctx, `E mais ${lista.length - 40}. A lista completa está em Produtos.`);
}

function pdfProdutosParados(ctx, d) {
  pdfListaEstoque(ctx, 'Produtos sem vendas no período', 'Têm estoque e não venderam nenhuma unidade.', d.semVenda, { titulo: 'Valor em estoque', de: ({ valorC }) => brlC(valorC) });
}

function pdfSituacaoEstoque(ctx, d) {
  const e = d.estoque, dono = souDono();
  secaoPdf(ctx, 'Situação atual do estoque', 'Hoje, independente do período do relatório.');
  const kpis = [
    { rotulo: 'Produtos ativos', valor: formatarNumero(e.produtos) },
    { rotulo: 'Unidades em estoque', valor: formatarNumero(e.unidades) },
  ];
  if (dono) kpis.push({ rotulo: e.pendentes ? 'Valor investido (parcial)' : 'Valor investido', valor: brlC(e.compraC), cor: PDF_COR.azul });
  kpis.push(
    { rotulo: 'Potencial de venda', valor: brlC(e.vendaC), cor: PDF_COR.turquesaTexto },
    { rotulo: 'Estoque baixo', valor: formatarNumero(e.baixos.length), cor: e.baixos.length ? PDF_COR.laranja : PDF_COR.texto },
    { rotulo: 'Sem estoque', valor: formatarNumero(e.zerados.length), cor: e.zerados.length ? PDF_COR.vermelho : PDF_COR.texto },
  );
  kpisPdf(ctx, kpis, 3);
  if (dono && e.pendentes) avisoPdf(ctx, `${e.pendentes} ${pluralize(e.pendentes, 'produto', 'produtos')} sem preço de custo: o valor investido é parcial.`);
  pdfListaEstoque(ctx, 'Estoque baixo', 'No estoque mínimo ou abaixo dele.', e.baixos, { titulo: 'Mínimo', de: (p) => String(estoqueMinimo(p)) });
  pdfListaEstoque(ctx, 'Sem estoque', 'Produtos zerados.', e.zerados, { titulo: 'Preço', de: (p) => formatCurrency(p.price) });
}

function pdfFinanceiro(ctx, d) {
  const r = d.rel.resumo;
  secaoPdf(ctx, 'Resultado do período', 'Do preço de tabela ao lucro bruto.');
  tabelaPdf(ctx, {
    cabecalho: ['', 'Valor'],
    linhas: [
      ['Vendas brutas (preço de tabela)', brlC(r.bruto)],
      ['(-) Descontos concedidos', `- ${brlC(r.descontos)}`],
      ['(-) Devoluções e cancelamentos', `- ${brlC(r.devolucoes)}`],
      ['= Faturamento', brlC(r.faturamento)],
      ['(-) Custo das mercadorias vendidas', `- ${brlC(r.cmv)}`],
      [`= Lucro bruto${r.semCusto ? ' (parcial)' : ''}`, brlC(r.lucro)],
      ['Margem bruta', pctPdf(r.margem)],
    ],
    numericas: [1],
    colorir: (linha) => ([3, 5].includes(linha) ? PDF_COR.texto : null),
  });
  paragrafoPdf(ctx, 'Lucro líquido não é calculado: o sistema ainda não registra despesas da loja nem taxas de cartão. O valor acima é lucro bruto.', { cor: PDF_COR.muted, tamanho: 8 });
}

function resumoExecutivoTexto(d) {
  const r = d.rel.resumo, a = d.relAnterior.resumo;
  if (!r.nVendas && !r.faturamento) return 'Não houve vendas no período e filtros escolhidos.';
  const frases = [`No período, a loja faturou ${brlC(r.faturamento)} em ${formatarNumero(r.nVendas)} ${pluralize(r.nVendas, 'venda')}, com ticket médio de ${brlC(r.ticket)}.`];
  if (souDono()) frases.push(`O custo das mercadorias vendidas foi ${brlC(r.cmv)} e o lucro bruto ficou em ${brlC(r.lucro)}${r.margem !== null ? ` (margem bruta de ${pctPdf(r.margem)})` : ''}${r.semCusto ? ', valor parcial por falta de custo em alguns itens' : ''}.`);
  if (a.faturamento) {
    const pct = Math.round(((r.faturamento - a.faturamento) / Math.abs(a.faturamento)) * 100);
    frases.push(`Comparado com o período anterior (${d.anteriorIntervalo.rotulo}), o faturamento ${pct >= 0 ? 'subiu' : 'caiu'} ${Math.abs(pct)}%.`);
  }
  if (r.descontos) frases.push(`Foram concedidos ${brlC(r.descontos)} em descontos.`);
  if (r.devolucoes) frases.push(`Devoluções e cancelamentos somaram ${brlC(r.devolucoes)}.`);
  const top = ordenarProdutos(d.rel.produtos, 'unidades')[0];
  if (top) frases.push(`Produto mais vendido: ${top.nome} (${formatarNumero(top.unidades)} un.).`);
  const forma = [...d.rel.formas].sort((x, y) => y.fatC - x.fatC)[0];
  if (forma && forma.forma !== 'nao_informado') frases.push(`Forma de pagamento com mais recebimentos: ${forma.nome}.`);
  return frases.join(' ');
}

async function baixarPdfAnalises(modo) {
  const d = montarDadosRelatorio();
  if (!d) {
    showToast('Espere os relatórios carregarem e tente de novo.', 'warning');
    return;
  }

  await comBotaoOcupado(ANL.pdfBtn, async () => {
    const titulos = {
      geral: 'Relatório geral',
      vendas: 'Relatório de vendas',
      produtos: 'Relatório de produtos',
      financeiro: 'Relatório financeiro',
      completo: 'Relatório completo',
    };
    const ctx = await novoPdf({
      titulo: titulos[modo],
      subtitulo: modo === 'completo' ? 'Vendas, lucro, produtos e estoque da loja' : `Análises · ${ABAS_ANALISES[modo]}`,
      linhasInfo: infoAnalises(d),
    });

    if (modo === 'geral') {
      secaoPdf(ctx, 'Indicadores do período');
      pdfIndicadores(ctx, d);
      await pdfGraficoFaturamento(ctx, d);
    } else if (modo === 'vendas') {
      secaoPdf(ctx, 'Indicadores de vendas');
      pdfIndicadores(ctx, d);
      pdfVendasPorPeriodo(ctx, d);
      pdfFormas(ctx, d);
      pdfVendedores(ctx, d);
    } else if (modo === 'produtos') {
      pdfRankingProdutos(ctx, d, { titulo: 'Ranking de produtos', criterio: ordemProdutos, limite: 200 });
      pdfCategorias(ctx, d);
      pdfModelos(ctx, d);
      pdfProdutosParados(ctx, d);
      pdfListaEstoque(ctx, 'Estoque baixo', 'No estoque mínimo ou abaixo dele.', d.estoque.baixos, { titulo: 'Mínimo', de: (p) => String(estoqueMinimo(p)) });
      pdfListaEstoque(ctx, 'Sem estoque', 'Produtos zerados.', d.estoque.zerados, { titulo: 'Preço', de: (p) => formatCurrency(p.price) });
    } else if (modo === 'financeiro') {
      secaoPdf(ctx, 'Indicadores financeiros');
      pdfIndicadores(ctx, d);
      pdfFinanceiro(ctx, d);
      pdfSituacaoEstoque(ctx, d);
    } else {
      secaoPdf(ctx, '1. Resumo executivo');
      paragrafoPdf(ctx, resumoExecutivoTexto(d), { cor: PDF_COR.texto, tamanho: 9.5 });
      secaoPdf(ctx, '2. Indicadores do período', 'Faturamento, custo das mercadorias, lucro bruto, margem, vendas, ticket médio e descontos.');
      pdfIndicadores(ctx, d);
      await pdfGraficoFaturamento(ctx, d);
      if (souDono()) pdfFinanceiro(ctx, d);
      pdfFormas(ctx, d);
      pdfVendasPorPeriodo(ctx, d, granularidade);
      pdfRankingProdutos(ctx, d, { titulo: 'Produtos mais vendidos', criterio: 'unidades', limite: 15 });
      if (souDono()) pdfRankingProdutos(ctx, d, { titulo: 'Produtos mais lucrativos', criterio: 'lucro', limite: 15 });
      pdfCategorias(ctx, d);
      pdfSituacaoEstoque(ctx, d);
    }

    const periodoArquivo = `${chaveDia(d.intervalo.inicio)}_${chaveDia(somarDias(d.intervalo.fim, -1))}`;
    finalizarPdf(ctx, `caseon-${modo === 'completo' ? 'relatorio-completo' : `relatorio-${modo}`}-${periodoArquivo}.pdf`);
    showToast('Relatório PDF baixado.', 'success');
  });
}
