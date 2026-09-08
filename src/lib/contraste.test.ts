import { describe, expect, it } from 'vitest'
import { MINIMO_AA, razaoDeContraste, type TamanhoDeTexto } from '@/lib/contraste'

/**
 * Trava de acessibilidade da paleta.
 *
 * Cada par abaixo e uma combinacao que existe hoje na tela. Trocar uma cor no
 * bloco @theme de global.css sem atualizar esta lista quebra o teste — que e
 * exatamente a intencao: a paleta so muda com o contraste conferido.
 */

const GRAFITE_950 = '#171415'
const GRAFITE_900 = '#201c1e'
const GRAFITE_800 = '#2c2729'
const BRANCO = '#ffffff'
const CANVAS = '#f7f5f5'
const AMARELO_PENDENTE = '#fdf6ec'

const pares: { frente: string; fundo: string; tamanho: TamanhoDeTexto; onde: string }[] = [
  // --- Texto claro sobre fundo escuro ---
  { frente: '#a8a0a2', fundo: GRAFITE_900, tamanho: 'pequeno', onde: 'trilha do CabecalhoPagina' },
  { frente: '#a8a0a2', fundo: GRAFITE_800, tamanho: 'pequeno', onde: 'trilha, fim do gradiente' },
  { frente: '#8f8789', fundo: GRAFITE_950, tamanho: 'pequeno', onde: 'rodape, texto menor' },
  { frente: '#948c8f', fundo: GRAFITE_950, tamanho: 'pequeno', onde: 'rodape, texto' },
  { frente: '#a19a9c', fundo: GRAFITE_950, tamanho: 'pequeno', onde: 'rodape, links' },
  { frente: '#b8b1b3', fundo: GRAFITE_950, tamanho: 'pequeno', onde: 'rodape, links destacados' },
  { frente: '#c9c2c4', fundo: GRAFITE_900, tamanho: 'grande', onde: 'subtitulo sobre navy' },
  { frente: '#b3acae', fundo: GRAFITE_900, tamanho: 'pequeno', onde: 'lista de provas da home' },
  { frente: '#e6e1e2', fundo: GRAFITE_900, tamanho: 'pequeno', onde: 'selo da home' },
  {
    frente: '#e8b0ac',
    fundo: GRAFITE_900,
    tamanho: 'pequeno',
    onde: 'kicker "O que esta em jogo"',
  },
  { frente: '#9fd0c8', fundo: GRAFITE_900, tamanho: 'pequeno', onde: 'kicker "Para empresas"' },
  { frente: '#8fd0ac', fundo: GRAFITE_900, tamanho: 'interface', onde: 'check da home' },

  // --- Chips do painel de vencimentos ---
  { frente: '#f1a3a0', fundo: GRAFITE_900, tamanho: 'pequeno', onde: 'chip "Exigencia aberta"' },
  { frente: '#e8bb7c', fundo: GRAFITE_900, tamanho: 'pequeno', onde: 'chip "Vence em 30 dias"' },
  { frente: '#8fd0ac', fundo: GRAFITE_900, tamanho: 'pequeno', onde: 'chip "Regular"' },

  {
    frente: '#d5cfd0',
    fundo: GRAFITE_900,
    tamanho: 'pequeno',
    onde: '--color-sobre-escuro',
  },
  {
    frente: '#a9a2a4',
    fundo: GRAFITE_900,
    tamanho: 'pequeno',
    onde: '--color-sobre-escuro-fraco',
  },

  // --- Texto escuro sobre fundo claro ---
  { frente: '#1f1b1d', fundo: BRANCO, tamanho: 'pequeno', onde: '--color-ink' },
  { frente: '#554e51', fundo: BRANCO, tamanho: 'pequeno', onde: '--color-ink-soft sobre branco' },
  { frente: '#554e51', fundo: CANVAS, tamanho: 'pequeno', onde: '--color-ink-soft sobre canvas' },
  { frente: '#6e6668', fundo: BRANCO, tamanho: 'pequeno', onde: '--color-ash-500 sobre branco' },
  { frente: '#6e6668', fundo: CANVAS, tamanho: 'pequeno', onde: '--color-ash-500 sobre canvas' },
  { frente: '#6b6365', fundo: BRANCO, tamanho: 'pequeno', onde: '--color-ash-400 sobre branco' },
  { frente: '#6b6365', fundo: CANVAS, tamanho: 'pequeno', onde: '--color-ash-400 sobre canvas' },
  { frente: '#8e1c21', fundo: BRANCO, tamanho: 'pequeno', onde: '--color-wine como texto' },
  { frente: '#3f5468', fundo: BRANCO, tamanho: 'pequeno', onde: '--color-div-doc como texto' },
  { frente: '#2f6259', fundo: BRANCO, tamanho: 'pequeno', onde: '--color-div-auto como texto' },
  { frente: '#8a5a0a', fundo: AMARELO_PENDENTE, tamanho: 'pequeno', onde: '--color-warn' },

  // --- Texto branco sobre fundo colorido ---
  { frente: BRANCO, fundo: '#118848', tamanho: 'pequeno', onde: 'botao flutuante do WhatsApp' },
  { frente: BRANCO, fundo: '#0e7539', tamanho: 'pequeno', onde: 'botao flutuante, hover' },
  { frente: BRANCO, fundo: '#8e1c21', tamanho: 'pequeno', onde: 'botao primario --color-wine' },
  {
    frente: BRANCO,
    fundo: '#201c1e',
    tamanho: 'pequeno',
    onde: 'botao escuro --color-graphite-900',
  },
]

describe('contraste da paleta (WCAG 2.1 AA)', () => {
  for (const { frente, fundo, tamanho, onde } of pares) {
    it(`${onde}: ${frente} sobre ${fundo}`, () => {
      const razao = razaoDeContraste(frente, fundo)
      expect(
        razao,
        `${onde} — ${razao.toFixed(2)}:1, abaixo do minimo de ${MINIMO_AA[tamanho]}:1`
      ).toBeGreaterThanOrEqual(MINIMO_AA[tamanho])
    })
  }
})

/**
 * O tom fraco sobre o vinho.
 *
 * Este teste espera que ele FALHE o minimo, e nao que passe. Existe porque
 * global.css afirma, em comentario, que --color-sobre-escuro-fraco nao serve
 * sobre o vinho, e comentario nao e verificado por nada. Se alguem clarear o
 * token, o aviso vira mentira em silencio e este teste avisa.
 *
 * Se ele quebrar: o tom mudou. Confira o numero, atualize o comentario do
 * global.css e decida se a ressalva ainda faz sentido.
 */
describe('ressalva do tom fraco sobre o vinho', () => {
  it('continua abaixo de 4.5:1, como o comentario do global.css afirma', () => {
    const razao = razaoDeContraste('#a9a2a4', '#8e1c21')
    expect(razao).toBeLessThan(4.5)
    expect(razao).toBeCloseTo(3.59, 1)
  })
})

describe('anel de foco', () => {
  /**
   * O anel tem dois tons porque o foco cai sobre branco, sobre o canvas,
   * sobre o navy e sobre o vinho do botao — e nenhuma cor unica alcanca
   * 3:1 contra todos. Enquanto os dois tons estiverem longe um do outro,
   * pelo menos um deles contrasta com o que houver atras.
   */
  const CLARO = BRANCO
  const ESCURO = GRAFITE_900

  it('os dois tons ficam a pelo menos 3:1 um do outro', () => {
    expect(razaoDeContraste(CLARO, ESCURO)).toBeGreaterThanOrEqual(3)
  })

  it.each([
    ['branco', BRANCO],
    ['canvas', CANVAS],
    ['grafite 900', GRAFITE_900],
    ['grafite 950', GRAFITE_950],
    ['vinho do botao', '#8e1c21'],
    ['verde do WhatsApp', '#118848'],
    ['amarelo de pendente', AMARELO_PENDENTE],
  ])('pelo menos um tom aparece sobre %s', (_nome, fundo) => {
    const melhor = Math.max(razaoDeContraste(CLARO, fundo), razaoDeContraste(ESCURO, fundo))
    expect(melhor).toBeGreaterThanOrEqual(3)
  })

  it('o azul de sistema antigo teria falhado sobre o botao da marca', () => {
    // Registra por que o anel de uma cor so foi trocado: 1.32:1, invisivel
    // exatamente no controle mais clicado do site.
    expect(razaoDeContraste('#2f80ed', '#8e1c21')).toBeLessThan(3)
  })
})

describe('razaoDeContraste', () => {
  it('devolve 21 para preto sobre branco', () => {
    expect(razaoDeContraste('#000000', '#ffffff')).toBeCloseTo(21, 2)
  })

  it('devolve 1 para a mesma cor', () => {
    expect(razaoDeContraste('#8e1c21', '#8e1c21')).toBeCloseTo(1, 5)
  })

  it('nao depende da ordem dos argumentos', () => {
    expect(razaoDeContraste('#1f1b1d', '#ffffff')).toBeCloseTo(
      razaoDeContraste('#ffffff', '#1f1b1d'),
      10
    )
  })

  it('rejeita cor fora do formato #rrggbb', () => {
    expect(() => razaoDeContraste('#fff', '#ffffff')).toThrow(/Cor invalida/)
  })
})
