// Camada automática de consulta de situação do IMEI junto à Anatel.
//
// Hoje esta função retorna um valor mock: a consulta oficial (consultaserialaparelho.com.br,
// da ABR Telecom/Anatel) bloqueia acesso automatizado via robots.txt e usa captcha, então o
// fluxo real de consulta é manual (ver abrirConsultaAnatel/atualizarStatusAnatel em app_refactored.js).
//
// Uma futura versão de produção pode integrar um provedor pago de automação dessa consulta
// (ex: Infosimples). Essa troca deve ser feita apenas dentro desta função, sem alterar o
// restante do código.
async function consultarSituacaoImei(imei) {
  return { status: 'nao_consultado' };
}
