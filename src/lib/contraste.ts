/**
 * Contraste de cor segundo a WCAG 2.1.
 *
 * Existe porque a revisao critica registrava que o contraste do site tinha
 * sido afirmado, nunca medido — e a suspeita anotada la estava errada. Medir
 * e barato; confiar na impressao visual custou tres reprovacoes que ninguem
 * tinha visto, uma delas no botao flutuante do WhatsApp.
 */

/** Luminancia relativa de uma cor #rrggbb. */
export function luminancia(hex: string): number {
  const limpo = hex.replace('#', '')

  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) {
    throw new Error(`Cor invalida: "${hex}". Use o formato #rrggbb.`)
  }

  const canais = [0, 2, 4].map((inicio) => {
    const valor = Number.parseInt(limpo.slice(inicio, inicio + 2), 16) / 255
    return valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]

  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2]
}

/** Razao de contraste entre duas cores, de 1 (igual) a 21 (preto e branco). */
export function razaoDeContraste(corA: string, corB: string): number {
  const [maior, menor] = [luminancia(corA), luminancia(corB)].sort((x, y) => y - x) as [
    number,
    number,
  ]

  return (maior + 0.05) / (menor + 0.05)
}

/**
 * Minimos da WCAG 2.1 nivel AA.
 *
 * `grande` vale a partir de 24px, ou 18.66px em negrito. Abaixo disso o texto
 * e `pequeno`, mesmo em negrito — engano comum ao avaliar botao.
 */
export const MINIMO_AA = {
  pequeno: 4.5,
  grande: 3,
  interface: 3,
} as const

export type TamanhoDeTexto = keyof typeof MINIMO_AA

export function passaEmAA(
  frente: string,
  fundo: string,
  tamanho: TamanhoDeTexto = 'pequeno'
): boolean {
  return razaoDeContraste(frente, fundo) >= MINIMO_AA[tamanho]
}
