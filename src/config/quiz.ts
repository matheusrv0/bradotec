import type { OrigemWhatsapp } from './whatsapp'

/**
 * Diagnostico de Regularizacao — as quatro perguntas de triagem.
 *
 * NAO entrega diagnostico tecnico nem juridico. Organiza a conversa e monta
 * a mensagem: o visitante chega ao atendimento ja dizendo o que precisa, e o
 * atendimento nao gasta as quatro primeiras perguntas descobrindo isso.
 *
 * A regra do projeto de nao prometer resultado vale aqui em dobro. O texto
 * de saida diz "por onde comeca", nunca "o que voce precisa fazer" — quem
 * define isso e a analise da documentacao e, quando o caso exige,
 * profissional legalmente habilitado.
 *
 * Dados e decisao ficam aqui, separados da interface, para poderem ser
 * testados sem montar componente.
 */

export type Opcao = { id: string; rotulo: string }

export type Pergunta = {
  id: 'objeto' | 'problema' | 'urgencia' | 'perfil'
  titulo: string
  opcoes: readonly Opcao[]
}

export const perguntas = [
  {
    id: 'objeto',
    titulo: 'O que você precisa regularizar?',
    opcoes: [
      { id: 'empresa', rotulo: 'Uma empresa ou comércio' },
      { id: 'condominio', rotulo: 'Um condomínio ou edifício' },
      { id: 'imovel', rotulo: 'Um imóvel ou edificação' },
      { id: 'instituicao', rotulo: 'Uma igreja, escola ou instituição' },
      { id: 'posto', rotulo: 'Um posto de combustível' },
      { id: 'veiculo', rotulo: 'Um veículo ou uma frota' },
    ],
  },
  {
    id: 'problema',
    titulo: 'Qual é o problema hoje?',
    opcoes: [
      { id: 'sem_licenca', rotulo: 'Falta licença, alvará ou documento' },
      { id: 'exigencia', rotulo: 'Recebi uma exigência ou notificação' },
      { id: 'vencido', rotulo: 'Tenho documento vencido ou vencendo' },
      { id: 'incendio', rotulo: 'Preciso regularizar segurança contra incêndio' },
      { id: 'nao_sei', rotulo: 'Ainda não sei exatamente o que falta' },
    ],
  },
  {
    id: 'urgencia',
    titulo: 'Qual é o nível de urgência?',
    opcoes: [
      { id: 'imediata', rotulo: 'Imediata: há prazo correndo ou risco de multa' },
      { id: 'semanas', rotulo: 'Nas próximas semanas' },
      { id: 'planejando', rotulo: 'Estou apenas planejando' },
    ],
  },
  {
    id: 'perfil',
    titulo: 'Você é pessoa física ou empresa?',
    opcoes: [
      { id: 'pj', rotulo: 'Empresa / condomínio / instituição' },
      { id: 'pf', rotulo: 'Pessoa física' },
    ],
  },
] as const satisfies readonly Pergunta[]

export type IdPergunta = (typeof perguntas)[number]['id']

/** Respostas dadas ate agora. Parcial porque o quiz e respondido aos poucos. */
export type Respostas = Partial<Record<IdPergunta, string>>

export type Rota = {
  id: 'fire' | 'documentos' | 'auto'
  titulo: string
  texto: string
  itens: readonly string[]
  href: string
  origemWhatsapp: OrigemWhatsapp
}

export const rotas = {
  fire: {
    id: 'fire',
    titulo: 'Sua situação começa pela Bradotec Fire',
    texto:
      'Pelo que você respondeu, o caminho passa por segurança contra incêndio e pânico: levantamento do que a edificação já possui, organização documental e acompanhamento do processo junto ao órgão competente.',
    itens: [
      'Levantamento da documentação existente',
      'Organização e protocolo do processo',
      'Acompanhamento de vistorias e exigências',
      'Projetos e laudos por profissionais legalmente habilitados, quando aplicável',
    ],
    href: '/seguranca-contra-incendio',
    origemWhatsapp: 'incendio',
  },
  documentos: {
    id: 'documentos',
    titulo: 'Sua situação começa pela Bradotec Documentos',
    texto:
      'Pelo que você respondeu, o caminho passa por licenças, certidões e regularização administrativa, com acompanhamento do processo do início ao fim.',
    itens: [
      'Verificação do que já existe e do que falta',
      'Licenças, certidões e protocolos',
      'Acompanhamento de exigências',
      'Controle de vencimentos depois da regularização',
    ],
    href: '/regularizacoes',
    origemWhatsapp: 'licenca',
  },
  auto: {
    id: 'auto',
    titulo: 'Sua situação começa pela Bradotec Auto',
    texto:
      'Pelo que você respondeu, o caminho passa por documentação e licenciamento veicular, com acompanhamento das pendências até a conclusão.',
    itens: [
      'Levantamento das pendências do veículo',
      'Transferência, emplacamento, segunda via ou alteração de dados',
      'Acompanhamento do processo',
      'Gestão de documentação para frotas, quando for o caso',
    ],
    href: '/documentacao-veicular',
    origemWhatsapp: 'veicular',
  },
} as const satisfies Record<string, Rota>

/**
 * Escolhe a divisao por onde a conversa comeca.
 *
 * A ordem importa e nao e arbitraria: veiculo ganha de tudo porque frota e
 * um mundo a parte, e incendio ganha de licenca porque e a frente que trava
 * as outras — sem o documento de incendio o alvara nao renova. O resto cai
 * em Documentos, inclusive "ainda nao sei": e a divisao que faz o
 * levantamento inicial.
 */
export function decidirRota(respostas: Respostas): Rota {
  if (respostas.objeto === 'veiculo') return rotas.auto
  if (respostas.problema === 'incendio') return rotas.fire
  return rotas.documentos
}

/** Rotulo escolhido em uma pergunta, ou null se ainda nao respondida. */
export function rotuloDaResposta(idPergunta: IdPergunta, respostas: Respostas): string | null {
  const pergunta = perguntas.find((p) => p.id === idPergunta)
  const escolhida = pergunta?.opcoes.find((o) => o.id === respostas[idPergunta])
  return escolhida?.rotulo ?? null
}

/** Monta a mensagem de WhatsApp com as respostas, uma por linha. */
export function montarMensagemDoQuiz(respostas: Respostas): string {
  const linhas = perguntas.map((pergunta) => {
    const rotulo = rotuloDaResposta(pergunta.id, respostas) ?? '...'
    return `• ${pergunta.titulo}\n  ${rotulo}`
  })

  return [
    'Olá! Respondi o questionário no site da Bradotec.',
    '',
    ...linhas,
    '',
    'Gostaria de falar com um especialista.',
  ].join('\n')
}

/** True quando todas as quatro perguntas foram respondidas. */
export function quizCompleto(respostas: Respostas): boolean {
  return perguntas.every((pergunta) => Boolean(respostas[pergunta.id]))
}
