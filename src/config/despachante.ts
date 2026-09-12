/**
 * BASE LEGAL DA PROFISSAO DE DESPACHANTE DOCUMENTALISTA.
 *
 * Existe porque o site afirma, em mais de um lugar, que conduzir processo
 * perante orgao publico e atribuicao de uma profissao regulamentada. Isso e
 * argumento de venda, e argumento de venda sobre lei precisa da lei junto.
 *
 * A redacao dos itens abaixo segue a da propria lei de perto de proposito.
 * Quem for reescrever para "ficar mais comercial" tem de conferir o texto
 * antes: o valor da secao esta em ser verificavel, nao em ser bonita.
 *
 * Conferido em 6 de setembro de 2026 no texto publicado no Planalto.
 */

export const leiDaProfissao = {
  rotulo: 'Lei Federal nº 14.282/2021',
  descricao: 'Regulamenta o exercício da profissão de despachante documentalista.',
  url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14282.htm',
} as const

/**
 * O que a lei chama de atribuicao do despachante documentalista.
 *
 * Resumido do art. 3o: o conjunto de atos e procedimentos legais necessarios
 * a mediacao e a representacao, em nome do comitente, nas relacoes com os
 * orgaos da administracao publica federal, estadual, municipal e distrital.
 */
export const atribuicoes = [
  'Representar o cliente perante os órgãos da administração pública',
  'Acompanhar a tramitação de processos e procedimentos',
  'Cumprir diligências e anexar documentos',
  'Prestar esclarecimentos e responder às exigências',
  'Solicitar informações e relatórios',
] as const

/**
 * Condicoes que a lei fixa para exercer a profissao.
 *
 * Escritas em minuscula de proposito: sao pedacos de frase, montados como
 * "a lei exige X e Y". A versao anterior comecava com maiuscula e a pagina
 * corrigia com `.toLowerCase()`, o que transformava "CRDD" em "crdd".
 */
export const condicoesParaExercer = [
  'formação em nível tecnológico de despachante documentalista, em curso reconhecido',
  'inscrição no conselho regional da categoria, o CRDD',
] as const

/**
 * O contraste que a secao usa.
 *
 * Sao descricoes de escopo, nao acusacoes a outras profissoes. Engenheiro e
 * empresa de manutencao fazem o que lhes cabe, e a Bradotec depende dos dois:
 * o ponto e que acompanhar tramitacao normalmente nao esta no contrato de
 * nenhum deles.
 */
export const semDespachante = [
  {
    quem: 'O síndico conduzindo sozinho',
    oQueAcontece:
      'Exigência respondida pela metade reinicia a análise. Quem nunca viu o rito descobre a ordem errando, e cada erro custa uma volta inteira.',
  },
  {
    quem: 'A empresa que fornece o equipamento',
    oQueAcontece:
      'Ela resolve bem o que fornece. O escopo costuma terminar ali, e o que sobra do processo volta para o condomínio sem aviso.',
  },
  {
    quem: 'O engenheiro que assina o projeto',
    oQueAcontece:
      'Ele faz o que só ele pode fazer, e sem ele não há processo. Acompanhar a tramitação, responder exigência e cumprir diligência é outro trabalho, e em geral não está no contrato dele.',
  },
] as const
