import { ehPlaceholder, site } from './site'

/**
 * Mensagens pre-preenchidas do WhatsApp, uma por origem de clique.
 * Isso economiza a primeira pergunta do atendimento: a conversa ja comeca
 * sabendo de onde a pessoa veio e o que ela quer.
 */
export const mensagensWhatsapp = {
  padrao: 'Olá! Vim pelo site da Bradotec e gostaria de falar com um especialista.',
  orcamento:
    'Olá! Gostaria de solicitar um orçamento para documentação/regularização da minha empresa.',
  incendio: 'Olá! Gostaria de saber como funciona a regularização contra incêndio.',
  condominio: 'Olá! Sou de um condomínio e preciso resolver pendências de regularização.',
  edificacao: 'Olá! Preciso regularizar uma edificação.',
  licenca: 'Olá! Preciso de uma licença e não sei quais documentos são necessários.',
  exigencia: 'Olá! Recebi uma exigência e preciso de ajuda para atender.',
  veicular: 'Olá! Preciso resolver uma pendência de documentação veicular.',
  frota: 'Olá! Tenho uma frota e gostaria de conhecer a gestão de documentação veicular.',
  vencimento: 'Olá! Tenho documentos vencendo e gostaria de organizar os prazos.',
  diagnostico: 'Olá! Gostaria de solicitar o Diagnóstico de Regularização.',
  recorrente: 'Olá! Gostaria de conhecer a gestão documental recorrente da Bradotec.',
  comecar: 'Olá! Não sei por onde começar. Pode me orientar sobre o que preciso regularizar?',
  empresas: 'Olá! Gostaria de conhecer as soluções da Bradotec para empresas.',
  avcb: 'Olá! Preciso resolver o AVCB da minha edificação. Pode me orientar sobre o processo?',
  posto: 'Olá! Tenho um posto de combustível e preciso regularizar a documentação.',
  treinamento:
    'Olá! Gostaria de uma proposta de treinamento de brigada de incêndio e/ou primeiros socorros.',
  save: 'Olá! Temos carregador de veículo elétrico no condomínio e gostaria de agendar o diagnóstico da instalação.',
} as const

/** Chaves validas para o atributo data-wa / prop `origem`. */
export type OrigemWhatsapp = keyof typeof mensagensWhatsapp

/**
 * Monta o link do WhatsApp com a mensagem ja escrita.
 *
 * Se o numero ainda for placeholder, devolve null em vez de gerar um link
 * quebrado — assim o componente decide o que fazer (desabilitar, avisar)
 * em vez de mandar o visitante para uma conversa inexistente.
 */
export function linkWhatsapp(
  origem: OrigemWhatsapp = 'padrao',
  textoCustomizado?: string
): string | null {
  if (ehPlaceholder(site.whatsapp)) return null

  const numero = site.whatsapp.replace(/\D/g, '')
  const texto = textoCustomizado ?? mensagensWhatsapp[origem]

  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}
