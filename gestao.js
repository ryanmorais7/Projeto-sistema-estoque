// ============================================
// GESTÃO · metas e configurações
// ============================================
// Equipe fica em app_refactored.js (renderEquipe).

const GST = {
  mesNome: $('meta-mes-nome'),
  valor: $('meta-valor'),
  alcancado: $('meta-alcancado'),
  percentual: $('meta-percentual'),
  restante: $('meta-restante'),
  barra: $('meta-barra'),
  ritmo: $('meta-ritmo'),
  form: $('meta-form'),
  input: $('meta-input'),
  remover: $('meta-remover'),
  config: $('config-conteudo'),
};

// ---- Metas ---------------------------------------------------------------------------

async function renderMetas() {
  const hoje = new Date();
  const nomeMes = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  GST.mesNome.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

  const meta = Number(lojaAtual?.meta_mensal) || 0;
  GST.input.value = meta ? formatPriceInput(meta) : '';
  GST.remover.classList.toggle('hidden', !meta);
  GST.alcancado.classList.add('is-loading');

  const { erro, vendas } = await buscarVendasEntre(inicioDoMes(), null);
  const alcancado = reais(resumirLancamentos(vendas).faturamento);
  animarContagem(GST.alcancado, alcancado, formatCurrency);

  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diasRestantes = ultimoDia - hoje.getDate() + 1; // conta hoje

  if (!meta) {
    GST.valor.textContent = '—';
    GST.percentual.textContent = '—';
    GST.restante.textContent = '—';
    GST.barra.style.width = '0%';
    GST.ritmo.textContent = erro ? 'Não foi possível carregar as vendas do mês.' : 'Defina uma meta para acompanhar o progresso aqui e no Início.';
    return;
  }

  const pct = (alcancado / meta) * 100;
  const falta = Math.max(meta - alcancado, 0);
  GST.valor.textContent = formatCurrency(meta);
  animarContagem(GST.percentual, pct, (v) => `${Math.round(v)}%`);
  GST.restante.textContent = falta ? formatCurrency(falta) : 'Meta batida';
  GST.barra.classList.toggle('progress-bar--ok', alcancado >= meta);
  GST.barra.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => { GST.barra.style.width = `${Math.min(pct, 100)}%`; }));

  GST.ritmo.textContent = falta
    ? `Para bater a meta, faltam ${formatCurrency(falta / diasRestantes)} por dia nos ${diasRestantes} ${pluralize(diasRestantes, 'dia', 'dias')} que restam (contando hoje).`
    : `Meta do mês alcançada. Passou ${formatCurrency(alcancado - meta)} do objetivo.`;
}

async function salvarMeta(valor) {
  const { error } = await supabaseClient
    .from('lojas')
    .update({ meta_mensal: valor })
    .eq('id', lojaAtual.id);

  if (error) {
    const semColuna = /meta_mensal|column|PGRST204/i.test(`${error.code} ${error.message}`);
    showToast(semColuna
      ? 'O banco ainda não tem a meta mensal. Rode o arquivo sql/013_vault_3.sql no Supabase.'
      : 'Não foi possível salvar a meta.', 'error', 6000);
    return false;
  }
  lojaAtual = { ...lojaAtual, meta_mensal: valor };
  return true;
}

async function handleSalvarMeta(e) {
  e.preventDefault();
  const valor = parsePriceValue(GST.input.value);
  if (!(valor > 0)) {
    showToast('Digite um valor maior que zero.', 'warning');
    GST.input.focus();
    return;
  }
  if (await salvarMeta(Math.round(valor * 100) / 100)) {
    showToast('Meta salva.', 'success');
    renderMetas();
    updateDashboard();
  }
}

// ---- Configurações -------------------------------------------------------------------

const LISTAS_CONFIG = [
  { grupo: 'linha_capinha', tipo: 'capinhas', titulo: 'Linhas de capinha', desc: 'Aparecem no cadastro de capinhas e nos filtros de produtos.', padrao: LINHAS_CAPINHA_PADRAO },
  { grupo: 'tipo_pelicula', tipo: 'peliculas', titulo: 'Tipos de película', desc: 'Cada tipo pode ter custo e preço diferentes: os valores são definidos no cadastro.', padrao: TIPOS_PELICULA_PADRAO },
];

// Rascunho da lista em edição: { grupo: [{ original, nome }] }
const rascunhoListas = {};

function iniciarRascunho(grupo, nomes) {
  rascunhoListas[grupo] = nomes.map(n => ({ original: n, nome: n }));
}

function htmlListaEditavel(cfg) {
  const itens = rascunhoListas[cfg.grupo];
  const emUso = (nome) => products.concat(produtosArquivados).filter(p => p.type === cfg.tipo && chaveNome(p.variacao) === chaveNome(nome)).length;
  return `
    <div class="card config-card" data-grupo="${cfg.grupo}">
      <div>
        <h3 class="card-title">${cfg.titulo}</h3>
        <p class="card-desc">${cfg.desc}</p>
      </div>
      <div class="lista-editavel">
        ${itens.map((item, i) => {
          const uso = item.original ? emUso(item.original) : 0;
          return `
          <div class="lista-editavel-item" data-indice="${i}">
            <input type="text" maxlength="60" value="${esc(item.nome)}" aria-label="Nome da opção ${i + 1}" />
            ${uso ? `<span class="badge badge-neutral" title="Produtos usando esta opção">${uso}</span>` : ''}
            <button type="button" class="icon-btn" data-lista="subir" aria-label="Subir" ${i === 0 ? 'disabled' : ''}><i class="ti ti-chevron-up"></i></button>
            <button type="button" class="icon-btn" data-lista="descer" aria-label="Descer" ${i === itens.length - 1 ? 'disabled' : ''}><i class="ti ti-chevron-down"></i></button>
            <button type="button" class="icon-btn icon-btn--danger" data-lista="remover" aria-label="Remover ${esc(item.nome)}"><i class="ti ti-trash"></i></button>
          </div>`;
        }).join('')}
      </div>
      <button type="button" class="btn btn-secondary btn-sm" data-lista="adicionar" style="align-self:flex-start"><i class="ti ti-plus"></i>Adicionar opção</button>
      <p class="card-desc">Renomear muda também os produtos que usam a opção. Remover não altera produtos já cadastrados.</p>
      <div class="config-acoes">
        <button type="button" class="btn-link" data-lista="padrao">Voltar ao padrão</button>
        <button type="button" class="btn btn-primary" data-lista="salvar">Salvar lista</button>
      </div>
    </div>`;
}

function htmlCatalogoGuardado() {
  const marcas = catalogoLoja.marcas;
  const modelos = catalogoLoja.modelos;
  return `
    <div class="card config-card config-card--full">
      <div>
        <h3 class="card-title">Marcas e modelos adicionados</h3>
        <p class="card-desc">O que foi digitado no cadastro e guardado para aparecer como opção. Remover daqui não altera produtos.</p>
      </div>
      <div>
        <span class="field-label" style="margin-bottom:8px">Marcas</span>
        ${marcas.length ? `<div class="tag-lista">${marcas.map(m => `<span class="tag">${esc(m)}<button type="button" data-remover-catalogo="marca" data-nome="${esc(m)}" aria-label="Remover marca ${esc(m)}"><i class="ti ti-x"></i></button></span>`).join('')}</div>` : '<p class="empty-inline">Nenhuma marca adicionada.</p>'}
      </div>
      <div>
        <span class="field-label" style="margin-bottom:8px">Modelos</span>
        ${modelos.length ? `<div class="tag-lista">${modelos.map(m => `<span class="tag">${esc(m.nome)}<small>${esc(m.marca)}${m.familia && m.familia !== FAMILIA_OUTROS ? ` · ${esc(m.familia)}` : ''}</small><button type="button" data-remover-catalogo="modelo" data-nome="${esc(m.nome)}" data-marca="${esc(m.marca)}" aria-label="Remover modelo ${esc(m.nome)}"><i class="ti ti-x"></i></button></span>`).join('')}</div>` : '<p class="empty-inline">Nenhum modelo adicionado. Modelos digitados no cadastro aparecem aqui.</p>'}
      </div>
    </div>`;
}

function renderConfig() {
  if (!catalogoLoja.disponivel) {
    GST.config.innerHTML = `
      <div class="card config-card config-card--full">
        <h3 class="card-title">Listas do cadastro</h3>
        <div class="aviso-box"><i class="ti ti-database-exclamation"></i><span>Para editar as linhas, tipos, marcas e modelos, o banco precisa ser atualizado: rode o arquivo <strong>sql/013_vault_3.sql</strong> no Supabase (depois de fazer backup). Até lá, o cadastro usa as listas padrão.</span></div>
      </div>`;
    return;
  }

  LISTAS_CONFIG.forEach(cfg => {
    if (!rascunhoListas[cfg.grupo]) iniciarRascunho(cfg.grupo, variacoesDoTipo(cfg.tipo));
  });
  GST.config.innerHTML = LISTAS_CONFIG.map(htmlListaEditavel).join('') + htmlCatalogoGuardado();
}

async function salvarListaConfig(cfg) {
  const itens = rascunhoListas[cfg.grupo].map(i => ({ ...i, nome: limparNome(i.nome) })).filter(i => i.nome);
  if (!itens.length) {
    showToast('A lista precisa ter pelo menos uma opção.', 'warning');
    return;
  }
  const chaves = itens.map(i => chaveNome(i.nome));
  if (new Set(chaves).size !== chaves.length) {
    showToast('Tem uma opção repetida na lista.', 'warning');
    return;
  }

  const renomear = itens
    .filter(i => i.original && chaveNome(i.original) !== chaveNome(i.nome))
    .map(i => ({ de: i.original, para: i.nome }));

  const r = await salvarListaVariacoes(cfg.grupo, itens.map(i => i.nome), renomear);
  if (r.erro) {
    showToast(r.erro, 'error', 5000);
    return;
  }

  iniciarRascunho(cfg.grupo, itens.map(i => i.nome));
  if (renomear.length) await recarregarProdutos();
  showToast(`${cfg.titulo} salvas.${renomear.length ? ` ${renomear.length} ${pluralize(renomear.length, 'nome atualizado', 'nomes atualizados')} nos produtos.` : ''}`, 'success', 4000);
  renderConfig();
  if (typeof cadastroAoEntrar === 'function') cadastroAoEntrar();
}

function handleCliqueConfig(e) {
  const remover = e.target.closest('[data-remover-catalogo]');
  if (remover) {
    const grupo = remover.dataset.removerCatalogo;
    removerDoCatalogo({ grupo, nome: remover.dataset.nome, marca: grupo === 'modelo' ? remover.dataset.marca : null }).then(ok => {
      showToast(ok ? 'Removido da lista.' : 'Não foi possível remover.', ok ? 'success' : 'error');
      renderConfig();
    });
    return;
  }

  const botao = e.target.closest('[data-lista]');
  const card = e.target.closest('[data-grupo]');
  if (!botao || !card) return;
  const cfg = LISTAS_CONFIG.find(c => c.grupo === card.dataset.grupo);
  const itens = rascunhoListas[cfg.grupo];
  const indice = Number(e.target.closest('[data-indice]')?.dataset.indice);

  switch (botao.dataset.lista) {
    case 'adicionar':
      itens.push({ original: null, nome: '' });
      renderConfig();
      GST.config.querySelector(`[data-grupo="${cfg.grupo}"] .lista-editavel-item:last-child input`)?.focus();
      return;
    case 'remover':
      itens.splice(indice, 1);
      break;
    case 'subir':
      if (indice > 0) [itens[indice - 1], itens[indice]] = [itens[indice], itens[indice - 1]];
      break;
    case 'descer':
      if (indice < itens.length - 1) [itens[indice + 1], itens[indice]] = [itens[indice], itens[indice + 1]];
      break;
    case 'padrao':
      rascunhoListas[cfg.grupo] = cfg.padrao.map(n => ({ original: null, nome: n }));
      break;
    case 'salvar':
      salvarListaConfig(cfg);
      return;
    default:
      return;
  }
  renderConfig();
}

function handleInputConfig(e) {
  const card = e.target.closest('[data-grupo]');
  const linha = e.target.closest('[data-indice]');
  if (!card || !linha) return;
  rascunhoListas[card.dataset.grupo][Number(linha.dataset.indice)].nome = e.target.value;
}

function initGestao() {
  GST.form.addEventListener('submit', handleSalvarMeta);
  GST.remover.addEventListener('click', () => abrirModalConfirmacao({
    titulo: 'Remover a meta?',
    mensagem: 'O Início deixa de mostrar o progresso da meta. Dá para definir de novo quando quiser.',
    textoConfirmar: 'Remover meta',
    aoConfirmar: async () => {
      if (await salvarMeta(null)) {
        showToast('Meta removida.', 'success');
        renderMetas();
        updateDashboard();
      }
    },
  }));
  GST.input.addEventListener('blur', () => {
    if (GST.input.value.trim()) GST.input.value = formatPriceInput(parsePriceValue(GST.input.value)) || '';
  });
  GST.input.addEventListener('focus', () => {
    if (GST.input.value.trim()) GST.input.value = String(parsePriceValue(GST.input.value)).replace('.', ',');
  });
  GST.config.addEventListener('click', handleCliqueConfig);
  GST.config.addEventListener('input', handleInputConfig);
}
