import {
  AnimatePresence,
  type MotionValue,
  motion,
  type SpringOptions,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Dock de TEXTO.
 *
 * O dock da Apple amplia icone: item quadrado que cresce de largura, com o
 * nome num balao por cima. Aqui o item e a propria palavra, e isso muda o que
 * pode crescer — esticar a largura de uma palavra afasta as letras e atrapalha
 * a leitura, que e justamente o que um menu precisa entregar. Entao o item
 * cresce de escala e sobe alguns pixels. A onda continua igual: quem esta sob
 * o ponteiro cresce mais, o vizinho cresce menos, e o efeito morre depois de
 * `alcance` pixels.
 *
 * Tres decisoes que se afastam do componente original, e por que:
 *
 * 1. `<ul>` e `<li>` no lugar de `role="toolbar"`. Isto e a navegacao do site:
 *    uma lista de links. Assim o leitor de tela anuncia "lista de 9 itens" e
 *    permite pular o bloco. `toolbar` prometeria navegacao por setas, que um
 *    menu de links nao tem.
 *
 * 2. Contexto no lugar de `cloneElement`. O original injeta `width` e
 *    `isHovered` clonando o filho, e do outro lado le de volta com
 *    `rest['isHovered'] as MotionValue`. Isso passa por cima do tipo: filho
 *    errado so aparece quebrado no navegador. Com contexto o TypeScript cobra,
 *    e nao sobra nenhum `as`.
 *
 * 3. `clientX` no lugar de `pageX`. A distancia e medida contra
 *    `getBoundingClientRect()`, que devolve coordenada de VIEWPORT. `pageX` e
 *    coordenada de PAGINA: as duas divergem assim que existe rolagem
 *    horizontal, e o dock ampliaria o item errado. No demo original o dock
 *    fica num container que nao rola, e por isso a conta nunca aparecia
 *    errada.
 */

/**
 * Escala do item que esta exatamente sob o ponteiro.
 *
 * 1.18, e nao os 2x do dock de icone: escala cresce o desenho, mas nao a
 * caixa que ele ocupa no layout — o vizinho nao sai da frente. Com 1.28 a
 * palavra ampliada encostava nas duas vizinhas, medido na tela. O limite e a
 * folga que existe: recuo do proprio item, mais o intervalo, mais o recuo do
 * vizinho. Crescer mais do que isso nao aumenta o efeito, so junta as
 * palavras.
 */
const AMPLIACAO = 1.18
/** Distancia, em px, em que a ampliacao ainda alcanca os vizinhos. */
const ALCANCE = 130
/** Quanto o item sobe, em px, no ponto maximo. */
const SUBIDA = 5
const MOLA: SpringOptions = { mass: 0.1, stiffness: 150, damping: 12 }

type ContextoDoDock = {
  ponteiroX: MotionValue<number>
  mola: SpringOptions
  ampliacao: number
  alcance: number
  subida: number
  semMovimento: boolean
}

type ContextoDoItem = {
  escala: MotionValue<number>
  deslocamento: MotionValue<number>
  sobOPonteiro: MotionValue<number>
  semMovimento: boolean
}

const ContextoDock = createContext<ContextoDoDock | undefined>(undefined)
const ContextoItem = createContext<ContextoDoItem | undefined>(undefined)

/*
 * `useDock` e `useItemDock` sao os dois unicos nomes em ingles deste arquivo.
 * Nao e descuido: o prefixo `use` e contrato do React, nao estilo. As regras
 * de hook — do Biome, do ESLint e do compilador — reconhecem hook pelo
 * prefixo, e `usarDock` passava sem ser verificado.
 */
function useDock() {
  const contexto = useContext(ContextoDock)
  if (!contexto) throw new Error('DockItem precisa estar dentro de <Dock>')
  return contexto
}

function useItemDock() {
  const contexto = useContext(ContextoItem)
  if (!contexto) throw new Error('DockTexto e DockDica precisam estar dentro de <DockItem>')
  return contexto
}

type PropsDock = {
  children: ReactNode
  className?: string
  ampliacao?: number
  alcance?: number
  subida?: number
  mola?: SpringOptions
}

function Dock({
  children,
  className,
  ampliacao = AMPLIACAO,
  alcance = ALCANCE,
  subida = SUBIDA,
  mola = MOLA,
}: PropsDock) {
  const ponteiroX = useMotionValue(Number.POSITIVE_INFINITY)

  /*
   * Quem pediu menos movimento no sistema nao ganha a onda.
   *
   * A regra `prefers-reduced-motion` do CSS nao resolve aqui: o framer-motion
   * escreve `transform` direto no elemento, em JS, e estilo inline nao e
   * alcancado por media query. Tem de ser decidido deste lado.
   */
  const semMovimento = useReducedMotion() ?? false

  return (
    <ul
      className={cn('dock', className)}
      onMouseMove={({ clientX }) => ponteiroX.set(clientX)}
      onMouseLeave={() => ponteiroX.set(Number.POSITIVE_INFINITY)}
    >
      <ContextoDock.Provider value={{ ponteiroX, mola, ampliacao, alcance, subida, semMovimento }}>
        {children}
      </ContextoDock.Provider>
    </ul>
  )
}

function DockItem({ children, className }: { children: ReactNode; className?: string }) {
  const referencia = useRef<HTMLLIElement>(null)
  const { ponteiroX, mola, ampliacao, alcance, subida, semMovimento } = useDock()
  const sobOPonteiro = useMotionValue(0)

  /*
   * Le a caixa a cada movimento em vez de medir uma vez: a largura do item
   * muda quando a fonte do site chega, e um valor guardado no primeiro quadro
   * deixaria a conta errada justamente no comeco. Sao nove itens e uma leitura
   * por quadro — o navegador junta os eventos de mouse, e a medida sai de um
   * layout que ja esta calculado.
   */
  const distancia = useTransform(ponteiroX, (x) => {
    const caixa = referencia.current?.getBoundingClientRect()
    if (!caixa) return Number.POSITIVE_INFINITY
    return x - caixa.x - caixa.width / 2
  })

  const escalaAlvo = useTransform(distancia, [-alcance, 0, alcance], [1, ampliacao, 1])
  const subidaAlvo = useTransform(distancia, [-alcance, 0, alcance], [0, -subida, 0])

  const escala = useSpring(escalaAlvo, mola)
  const deslocamento = useSpring(subidaAlvo, mola)

  return (
    <motion.li
      ref={referencia}
      className={cn('dock-item', className)}
      onHoverStart={() => sobOPonteiro.set(1)}
      onHoverEnd={() => sobOPonteiro.set(0)}
    >
      <ContextoItem.Provider value={{ escala, deslocamento, sobOPonteiro, semMovimento }}>
        {children}
      </ContextoItem.Provider>
    </motion.li>
  )
}

type PropsTexto = {
  children: ReactNode
  href: string
  /** Marca o item da pagina aberta. */
  atual?: boolean
  className?: string
}

function DockTexto({ children, href, atual = false, className }: PropsTexto) {
  const { escala, deslocamento, sobOPonteiro, semMovimento } = useItemDock()

  return (
    <motion.a
      href={href}
      aria-current={atual ? 'page' : undefined}
      className={cn('dock-link', atual && 'dock-link-atual', className)}
      style={semMovimento ? undefined : { scale: escala, y: deslocamento }}
      onFocus={() => sobOPonteiro.set(1)}
      onBlur={() => sobOPonteiro.set(0)}
    >
      {children}
    </motion.a>
  )
}

/**
 * Nome completo do item, revelado no hover e no foco do teclado.
 *
 * Existe porque `navegacao.ts` guarda dois rotulos para cada item: o `curto`,
 * que cabe no topo, e o `completo`, que diz o que a pagina e de verdade
 * ("Incendio" contra "Seguranca contra incendio"). O menu escondido usava o
 * completo; o dock mostra o curto e devolve o completo aqui.
 *
 * `aria-hidden` de proposito. O nome acessivel do link continua sendo a
 * palavra que esta na tela — trocar por `aria-label` com o texto completo
 * quebraria a WCAG 2.5.3 em "Treinamentos", cujo nome completo e "Brigada e
 * primeiros socorros" e nao contem a palavra visivel.
 */
function DockDica({ children, className }: { children: ReactNode; className?: string }) {
  const { sobOPonteiro } = useItemDock()
  const [aparecendo, setAparecendo] = useState(false)

  useEffect(() => sobOPonteiro.on('change', (valor) => setAparecendo(valor === 1)), [sobOPonteiro])

  return (
    <AnimatePresence>
      {aparecendo && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16 }}
          className={cn('dock-dica', className)}
          aria-hidden="true"
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export { Dock, DockDica, DockItem, DockTexto }
