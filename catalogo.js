// ============================================
// CATÁLOGO DO CADASTRO (marcas, famílias, modelos, linhas e tipos)
// ============================================
// As listas abaixo são o padrão do sistema. O dono pode, sem mexer no código:
//  · trocar a lista de linhas de capinha e de tipos de película (Gestão → Configurações);
//  · adicionar marcas e modelos que não estão aqui (direto no cadastro).
// Isso fica na tabela catalogo_opcoes (sql/013). Se a tabela ainda não existir, o
// cadastro funciona só com o padrão.
//
// Família serve para achar e marcar modelos rápido. Não quer dizer que uma capinha de
// um modelo serve em outro da mesma família: cada modelo marcado vira um produto.

const MARCAS_PRINCIPAIS = ['Apple', 'Samsung', 'Motorola', 'Xiaomi', 'Realme'];

// Texto curto que aparece embaixo da marca no seletor.
const MARCA_DICA = {
  Xiaomi: 'Redmi · Poco',
};

const LINHAS_CAPINHA_PADRAO = ['Básica', 'Premium', 'Anti-impacto', 'Transparente', 'Personalizada'];
const TIPOS_PELICULA_PADRAO = ['Vidro comum', '3D', 'Privacidade', 'Cerâmica', 'Fosca'];

const prefixar = (prefixo, nomes) => nomes.map(n => `${prefixo}${n}`);

const CATALOGO_PADRAO = {
  Apple: [
    { familia: 'iPhone 17', modelos: ['iPhone 17', 'iPhone Air', 'iPhone 17 Pro', 'iPhone 17 Pro Max'] },
    { familia: 'iPhone 16', modelos: ['iPhone 16e', 'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max'] },
    { familia: 'iPhone 15', modelos: ['iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max'] },
    { familia: 'iPhone 14', modelos: ['iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max'] },
    { familia: 'iPhone 13', modelos: ['iPhone 13 mini', 'iPhone 13', 'iPhone 13 Pro', 'iPhone 13 Pro Max'] },
    { familia: 'iPhone 12', modelos: ['iPhone 12 mini', 'iPhone 12', 'iPhone 12 Pro', 'iPhone 12 Pro Max'] },
    { familia: 'iPhone 11', modelos: ['iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max'] },
    { familia: 'iPhone X · XR · XS', modelos: ['iPhone X', 'iPhone XR', 'iPhone XS', 'iPhone XS Max'] },
    { familia: 'iPhone SE · 8 · 7', modelos: ['iPhone SE (2022)', 'iPhone SE (2020)', 'iPhone 8', 'iPhone 8 Plus', 'iPhone 7', 'iPhone 7 Plus'] },
  ],
  Samsung: [
    { familia: 'Linha A', modelos: prefixar('Galaxy ', [
      'A07', 'A17', 'A26', 'A36', 'A56',
      'A06', 'A16', 'A05s', 'A15', 'A25', 'A35', 'A55',
      'A05', 'A14', 'A24', 'A34', 'A54',
      'A04s', 'A04e', 'A13', 'A23', 'A33', 'A53', 'A73',
      'A03', 'A03s', 'A12', 'A22', 'A32', 'A52', 'A52s', 'A72',
      'A02s', 'A11', 'A21s', 'A31', 'A51', 'A71',
      'A10', 'A10s', 'A20', 'A20s', 'A30', 'A30s', 'A50',
    ]) },
    { familia: 'Linha S', modelos: prefixar('Galaxy ', [
      'S26', 'S26+', 'S26 Ultra',
      'S25', 'S25+', 'S25 Ultra', 'S25 Edge', 'S25 FE',
      'S24', 'S24+', 'S24 Ultra', 'S24 FE',
      'S23', 'S23+', 'S23 Ultra', 'S23 FE',
      'S22', 'S22+', 'S22 Ultra',
      'S21', 'S21+', 'S21 Ultra', 'S21 FE',
      'S20', 'S20+', 'S20 Ultra', 'S20 FE',
    ]) },
    { familia: 'Linha M', modelos: prefixar('Galaxy ', [
      'M15', 'M35', 'M55', 'M14', 'M34', 'M54', 'M13', 'M23', 'M33', 'M53', 'M12', 'M22', 'M32', 'M52', 'M62',
    ]) },
    { familia: 'Linha Z', modelos: prefixar('Galaxy ', [
      'Z Fold 7', 'Z Flip 7', 'Z Flip 7 FE', 'Z Fold 6', 'Z Flip 6', 'Z Fold 5', 'Z Flip 5', 'Z Fold 4', 'Z Flip 4', 'Z Flip 3',
    ]) },
  ],
  Motorola: [
    { familia: 'Moto G', modelos: prefixar('Moto ', [
      'G86', 'G56', 'G15', 'G05',
      'G85', 'G75', 'G55', 'G35', 'G34', 'G24', 'G04',
      'G84', 'G54', 'G73', 'G53', 'G23', 'G13',
      'G82', 'G62', 'G52', 'G42', 'G32', 'G22',
      'G200', 'G100', 'G71', 'G60', 'G60s', 'G50', 'G41', 'G31', 'G30', 'G20', 'G10',
      'G9 Plus', 'G9 Play', 'G8 Power', 'G8 Play',
    ]) },
    { familia: 'Moto E', modelos: prefixar('Moto ', ['E15', 'E14', 'E13', 'E32', 'E22', 'E40', 'E20', 'E7 Plus', 'E7']) },
    { familia: 'Edge', modelos: prefixar('Edge ', [
      '60 Pro', '60', '60 Fusion',
      '50 Ultra', '50 Pro', '50', '50 Fusion', '50 Neo',
      '40 Pro', '40', '40 Neo',
      '30 Ultra', '30 Pro', '30', '30 Fusion', '30 Neo',
      '20 Pro', '20',
    ]) },
    { familia: 'Razr', modelos: prefixar('Razr ', ['60 Ultra', '60', '50 Ultra', '50', '40 Ultra', '40']) },
  ],
  Xiaomi: [
    { familia: 'Redmi', modelos: prefixar('Redmi ', [
      '15C', '15', '14C', '13C', '13', '12C', '12', '10C', '10', '9C', '9A', '9', 'A5', 'A3', 'A2',
    ]) },
    { familia: 'Redmi Note', modelos: prefixar('Redmi Note ', [
      '15 Pro+', '15 Pro', '15',
      '14 Pro+', '14 Pro', '14',
      '13 Pro+', '13 Pro', '13',
      '12 Pro+', '12 Pro', '12S', '12',
      '11 Pro', '11S', '11',
      '10 Pro', '10S', '10',
      '9 Pro', '9S', '9',
      '8 Pro', '8',
    ]) },
    { familia: 'Poco', modelos: prefixar('Poco ', [
      'X7 Pro', 'X7', 'X6 Pro', 'X6', 'X5 Pro', 'X5', 'X4 Pro', 'X3 Pro',
      'F7 Pro', 'F7', 'F6 Pro', 'F6', 'F5',
      'M7 Pro', 'M6 Pro', 'M6', 'M5',
      'C75', 'C71', 'C65', 'C61', 'C40',
    ]) },
    // A marca já entra no nome do produto ("Xiaomi" + "14T Pro"), então aqui não repete.
    { familia: 'Xiaomi', modelos: [
      '15T Pro', '15T', '15 Ultra', '15', '14T Pro', '14T', '14 Ultra', '14', '13T Pro', '13T', '13', '12T', '12',
    ] },
  ],
  Realme: [
    { familia: 'Linha C', modelos: [
      'C75', 'C71', 'C67', 'C65', 'C63', 'C61', 'C55', 'C53', 'C51', 'C35', 'C33', 'C31', 'C30', 'C25Y', 'C21Y', 'C11',
    ] },
    { familia: 'Linha Note', modelos: ['Note 60', 'Note 50'] },
    { familia: 'Numéricas', modelos: [
      '15 Pro', '15', '14 Pro+', '14 Pro', '14', '13 Pro+', '13 Pro', '13', '12 Pro+', '12 Pro', '12', '11 Pro+', '11 Pro', '11', '10', '9', '8',
    ] },
    { familia: 'GT', modelos: ['GT 7 Pro', 'GT 7', 'GT 6', 'GT 6T'] },
  ],
};

// Família usada para modelo digitado sem família, ou para modelo que já está no estoque
// mas não aparece no padrão.
const FAMILIA_OUTROS = 'Outros modelos';

// ---- Estado (o que a loja salvou) ----------------------------------------------------

const catalogoLoja = {
  disponivel: false, // a tabela catalogo_opcoes existe e foi lida
  linha_capinha: null, // null = usa o padrão
  tipo_pelicula: null,
  marcas: [],
  modelos: [], // [{ nome, marca, familia }]
};

// ---- Comparação de nomes ---------------------------------------------------------------

// "  Galáxy  a15 " e "galaxy A15" são o mesmo nome: ignora acento, maiúscula e espaços.
function chaveNome(texto) {
  return String(texto ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .trim().replace(/\s+/g, ' ').toLowerCase();
}

function limparNome(texto) {
  return String(texto ?? '').trim().replace(/\s+/g, ' ');
}

function semRepetidos(nomes) {
  const vistos = new Set();
  return nomes.filter(n => {
    const chave = chaveNome(n);
    if (!chave || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

// ---- Leitura e escrita -------------------------------------------------------------------

async function carregarCatalogo() {
  catalogoLoja.disponivel = false;
  catalogoLoja.linha_capinha = null;
  catalogoLoja.tipo_pelicula = null;
  catalogoLoja.marcas = [];
  catalogoLoja.modelos = [];

  const { data, error } = await supabaseClient
    .from('catalogo_opcoes')
    .select('grupo, nome, marca, familia, ordem')
    .eq('loja_id', lojaAtual.id)
    .order('ordem', { ascending: true });

  if (error) return; // sql/013 ainda não rodou: segue com o padrão

  catalogoLoja.disponivel = true;
  const linhas = data.filter(o => o.grupo === 'linha_capinha').map(o => o.nome);
  const tipos = data.filter(o => o.grupo === 'tipo_pelicula').map(o => o.nome);
  catalogoLoja.linha_capinha = linhas.length ? linhas : null;
  catalogoLoja.tipo_pelicula = tipos.length ? tipos : null;
  catalogoLoja.marcas = data.filter(o => o.grupo === 'marca').map(o => o.nome);
  catalogoLoja.modelos = data
    .filter(o => o.grupo === 'modelo')
    .map(o => ({ nome: o.nome, marca: o.marca || '', familia: o.familia || FAMILIA_OUTROS }));
}

// Guarda uma marca ou modelo digitado. Se já existir (mesmo nome), não faz nada.
async function guardarNoCatalogo({ grupo, nome, marca = null, familia = null }) {
  if (!catalogoLoja.disponivel || !souDono()) return false;
  const limpo = limparNome(nome);
  if (!limpo) return false;

  const jaTem = grupo === 'marca'
    ? catalogoLoja.marcas.some(m => chaveNome(m) === chaveNome(limpo))
    : catalogoLoja.modelos.some(m => chaveNome(m.nome) === chaveNome(limpo) && chaveNome(m.marca) === chaveNome(marca));
  if (jaTem) return true;

  const { error } = await supabaseClient.from('catalogo_opcoes').insert({
    loja_id: lojaAtual.id, grupo, nome: limpo, marca, familia,
  });
  // Duplicado (outra aba gravou antes) também conta como guardado.
  if (error && error.code !== '23505') return false;

  if (grupo === 'marca') catalogoLoja.marcas.push(limpo);
  else catalogoLoja.modelos.push({ nome: limpo, marca: marca || '', familia: familia || FAMILIA_OUTROS });
  return true;
}

async function removerDoCatalogo({ grupo, nome, marca = null }) {
  let query = supabaseClient.from('catalogo_opcoes').delete()
    .eq('loja_id', lojaAtual.id).eq('grupo', grupo).eq('nome', nome);
  if (marca !== null) query = query.eq('marca', marca);
  const { error } = await query;
  if (error) return false;

  if (grupo === 'marca') catalogoLoja.marcas = catalogoLoja.marcas.filter(m => m !== nome);
  else catalogoLoja.modelos = catalogoLoja.modelos.filter(m => !(m.nome === nome && (marca === null || m.marca === marca)));
  return true;
}

// Troca a lista inteira de linhas (ou tipos), com renomeação nos produtos.
async function salvarListaVariacoes(grupo, nomes, renomear = []) {
  const { error } = await supabaseClient.rpc('salvar_lista_catalogo', {
    p_loja_id: lojaAtual.id,
    p_grupo: grupo,
    p_nomes: nomes,
    p_renomear: renomear,
  });
  if (error) return { erro: error.message };
  catalogoLoja[grupo] = [...nomes];
  return { ok: true };
}

// ---- Consultas usadas pelo cadastro -------------------------------------------------------

function variacoesDoTipo(tipo) {
  if (tipo === 'capinhas') return catalogoLoja.linha_capinha || LINHAS_CAPINHA_PADRAO;
  if (tipo === 'peliculas') return catalogoLoja.tipo_pelicula || TIPOS_PELICULA_PADRAO;
  return [];
}

function rotuloVariacao(tipo) {
  if (tipo === 'capinhas') return 'Linha';
  if (tipo === 'peliculas') return 'Tipo';
  return 'Variação';
}

// Marcas para o campo pesquisável: principais, as guardadas pela loja e as que já
// aparecem em produtos (sem repetir grafias diferentes da mesma marca).
function marcasConhecidas(produtos = []) {
  const doEstoque = produtos.filter(p => p.type !== 'acessorios').map(p => p.brand);
  return semRepetidos([...MARCAS_PRINCIPAIS, ...catalogoLoja.marcas, ...doEstoque].map(limparNome));
}

// "samsung " vira "Samsung" quando bate com uma marca conhecida.
function marcaCanonica(texto, produtos = []) {
  const limpo = limparNome(texto);
  if (!limpo) return '';
  return marcasConhecidas(produtos).find(m => chaveNome(m) === chaveNome(limpo)) || limpo;
}

function marcaPadrao(marca) {
  return Object.keys(CATALOGO_PADRAO).find(m => chaveNome(m) === chaveNome(marca)) || null;
}

// Famílias da marca: as do padrão (com os modelos que a loja adicionou nelas) e, no fim,
// "Outros modelos" com o que a loja digitou sem família ou já tem no estoque.
function familiasDaMarca(marca, produtos = [], tipo = null) {
  if (!limparNome(marca)) return [];
  const padrao = CATALOGO_PADRAO[marcaPadrao(marca)] || [];
  const familias = padrao.map(f => ({ familia: f.familia, modelos: [...f.modelos] }));

  const garantirFamilia = (nome) => {
    let f = familias.find(x => chaveNome(x.familia) === chaveNome(nome));
    if (!f) { f = { familia: nome, modelos: [] }; familias.push(f); }
    return f;
  };

  catalogoLoja.modelos
    .filter(m => chaveNome(m.marca) === chaveNome(marca))
    .forEach(m => garantirFamilia(m.familia || FAMILIA_OUTROS).modelos.push(m.nome));

  const todos = new Set(familias.flatMap(f => f.modelos).map(chaveNome));
  const doEstoque = produtos
    .filter(p => chaveNome(p.brand) === chaveNome(marca) && (!tipo || p.type === tipo))
    .map(p => limparNome(p.model))
    .filter(m => m && !todos.has(chaveNome(m)));
  if (doEstoque.length) garantirFamilia(FAMILIA_OUTROS).modelos.push(...doEstoque);

  // "Outros modelos" sempre no fim; dentro de cada família, sem repetidos.
  familias.forEach(f => { f.modelos = semRepetidos(f.modelos); });
  return familias
    .filter(f => f.modelos.length)
    .sort((a, b) => (a.familia === FAMILIA_OUTROS) - (b.familia === FAMILIA_OUTROS));
}

// Busca em todos os modelos da marca (todas as famílias). Todas as palavras precisam
// aparecer: "a 5" acha "Galaxy A55" e "Galaxy A56".
function buscarModelos(marca, termo, produtos = [], tipo = null) {
  const palavras = chaveNome(termo).split(' ').filter(Boolean);
  if (!palavras.length) return [];
  const todos = familiasDaMarca(marca, produtos, tipo).flatMap(f => f.modelos.map(m => ({ modelo: m, familia: f.familia })));
  return todos.filter(({ modelo }) => {
    const chave = chaveNome(modelo);
    return palavras.every(p => chave.includes(p));
  });
}

// Sugestões para acessórios (o lojista pode digitar qualquer outro nome).
const ACESSORIOS_SUGERIDOS = [
  'Cabo USB-C', 'Cabo Lightning', 'Cabo Micro USB', 'Carregador 20W', 'Carregador turbo',
  'Carregador veicular', 'Fone de ouvido', 'Fone Bluetooth', 'Caixa de som', 'Power bank',
  'Suporte veicular', 'Pop socket', 'Película de câmera', 'Cartão de memória',
];
