import { motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Botao que se preenche a partir de onde o ponteiro entrou.
 *
 * Um circulo nasce no ponto exato do cursor e cresce ate cobrir o botao, com
 * o rotulo virando a cor oposta no caminho. Teclado entra pelo centro, que e
 * o unico ponto de origem que faz sentido sem ponteiro.
 *
 * Quatro adaptacoes em relacao ao componente de referencia, e por que cada uma:
 *
 * 1. Vira `<a>` quando recebe `href`. Cinquenta e sete dos setenta e cinco
 *    botoes deste site sao links. Um `<button>` no lugar de um link quebra
 *    abrir em nova aba, copiar endereco, o botao voltar e o rastreador de
 *    busca, que nao segue `<button>`.
 *
 * 2. O estilo sai do Tailwind e vai para `bradotec-ajustes.css`. O original
 *    carrega um tema proprio inteiro em classes utilitarias (`--ic-*`, marca
 *    azul, cartao branco). Nesta branch o Tailwind esta desligado de
 *    proposito — ele e o Bootstrap do template disputariam o mesmo reset —
 *    entao aquelas classes nao pintariam nada. Aqui o React cuida da
 *    geometria e do estado, e o CSS cuida da paleta, que e a da marca.
 *
 * 3. Tres tons, e nao um. O site tem hierarquia: acao principal, acao sobre
 *    fundo vermelho e acao secundaria sobre fundo escuro. Com um desenho so,
 *    principal e secundaria ficariam identicas. O mecanismo e o mesmo nos
 *    tres; muda de que cor o botao parte e para qual ele vai.
 *
 * 4. `useReducedMotion`. Quem pediu menos movimento no sistema recebe a troca
 *    de cor sem o circulo crescendo. A regra `prefers-reduced-motion` que o
 *    site ja tem no CSS nao alcanca este caso: o preenchimento e estilo
 *    inline escrito por JS, e media query nao chega em estilo inline.
 */

const DURACAO_DO_PREENCHIMENTO = 0.5
const CURVA_DO_PREENCHIMENTO = [0.16, 1, 0.3, 1] as const

/**
 * Diametro que cobre o botao inteiro a partir de um ponto qualquer dele.
 *
 * E duas vezes a distancia ate o canto mais longe. Sem isso o circulo pararia
 * antes de cobrir a esquina oposta quando o ponteiro entra por um canto.
 */
function diametroDeCobertura(largura: number, altura: number, x: number, y: number) {
  return Math.ceil(
    2 *
      Math.max(
        Math.hypot(x, y),
        Math.hypot(largura - x, y),
        Math.hypot(x, altura - y),
        Math.hypot(largura - x, altura - y)
      )
  )
}

function temTexto(no: React.ReactNode): boolean {
  if (typeof no === 'string' || typeof no === 'number') return String(no).trim().length > 0
  if (Array.isArray(no)) return no.some(temTexto)
  if (React.isValidElement<{ children?: React.ReactNode }>(no)) return temTexto(no.props.children)
  return false
}

/**
 * - `acento`: parte do vinho e e inundado de branco — a acao principal
 * - `suave`: papel com borda fina, inundado de vinho — a acao secundaria
 *   sobre fundo claro. E o desenho de origem do componente de referencia.
 * - `branco`: parte do branco e e inundado de grafite, para usar sobre vinho
 *   ou sobre foto
 * - `contorno`: parte translucido com borda e e inundado de branco, para a
 *   acao secundaria sobre fundo escuro
 */
export type TomDoBotao = 'acento' | 'suave' | 'branco' | 'contorno'

/*
 * O framer-motion tem os proprios `onDrag*` e `onAnimation*`, com assinatura
 * diferente da do DOM. Sem remover os do DOM os dois colidem no mesmo nome.
 */
type SemConflitoDeMotion =
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onAnimationStart'
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDragStart'
  | 'onDrop'

type PropsComuns = {
  children?: React.ReactNode
  className?: string
  tom?: TomDoBotao
  /** Ocupa o botao e bloqueia o clique enquanto algo esta em andamento. */
  loading?: boolean
}

type PropsDeBotao = PropsComuns &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, SemConflitoDeMotion> & {
    href?: undefined
  }

type PropsDeLink = PropsComuns &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, SemConflitoDeMotion> & {
    href: string
  }

export type OriginButtonProps = PropsDeBotao | PropsDeLink

export function OriginButton(props: OriginButtonProps) {
  const { children, className, tom = 'acento', loading = false, ...resto } = props

  const referencia = React.useRef<HTMLElement | null>(null)
  const [sobOPonteiro, setSobOPonteiro] = React.useState(false)
  const [pressionado, setPressionado] = React.useState(false)
  const [origem, setOrigem] = React.useState({ x: 0, y: 0 })
  const [tamanho, setTamanho] = React.useState(0)
  const semMovimento = useReducedMotion() ?? false

  const bloqueado = Boolean(
    loading || ('disabled' in props && props.disabled) || ('href' in props && !props.href)
  )
  const preenchendo = !bloqueado && (sobOPonteiro || pressionado)

  const rotulo = 'aria-label' in props ? props['aria-label'] : undefined
  const rotuladoPor = 'aria-labelledby' in props ? props['aria-labelledby'] : undefined

  /*
   * Botao sem nome acessivel e um botao que o leitor de tela anuncia como
   * "botao" e nada mais. O aviso fica so em desenvolvimento: em producao
   * seria peso morto no pacote.
   */
  React.useEffect(() => {
    if (import.meta.env.PROD) return
    if (temTexto(children) || rotulo?.trim() || rotuladoPor?.trim()) return
    console.warn(
      'OriginButton: passe texto visivel, aria-label ou aria-labelledby para o controle ter nome acessivel.'
    )
  }, [children, rotulo, rotuladoPor])

  const medir = React.useCallback((x: number, y: number) => {
    const no = referencia.current
    if (!no) return
    const caixa = no.getBoundingClientRect()
    setOrigem({ x, y })
    setTamanho(diametroDeCobertura(caixa.width, caixa.height, x, y))
  }, [])

  const medirDoPonteiro = React.useCallback(
    (evento: React.PointerEvent<HTMLElement>) => {
      const caixa = evento.currentTarget.getBoundingClientRect()
      medir(evento.clientX - caixa.left, evento.clientY - caixa.top)
    },
    [medir]
  )

  const medirDoCentro = React.useCallback(() => {
    const no = referencia.current
    if (!no) return
    const caixa = no.getBoundingClientRect()
    medir(caixa.width / 2, caixa.height / 2)
  }, [medir])

  /*
   * Remede enquanto o preenchimento esta aceso: se a fonte chegar ou a janela
   * mudar de largura no meio do hover, o circuito calculado para a caixa
   * antiga deixaria um canto descoberto.
   */
  React.useLayoutEffect(() => {
    const no = referencia.current
    if (!no || !preenchendo) return

    const remedir = () => {
      const caixa = no.getBoundingClientRect()
      setTamanho(diametroDeCobertura(caixa.width, caixa.height, origem.x, origem.y))
    }

    remedir()
    const observador = new ResizeObserver(remedir)
    observador.observe(no)
    document.fonts?.ready.then(remedir).catch(() => undefined)

    return () => observador.disconnect()
  }, [preenchendo, origem.x, origem.y])

  const guardarReferencia = React.useCallback((no: HTMLElement | null) => {
    referencia.current = no
  }, [])

  const comuns = {
    ref: guardarReferencia,
    'aria-busy': loading || undefined,
    'data-preenchendo': preenchendo ? 'true' : 'false',
    'data-pressionado': pressionado ? 'true' : 'false',
    className: cn('botao-origem', `botao-origem-${tom}`, className),
    whileTap: bloqueado || semMovimento ? undefined : { scale: 0.985 },
    onPointerEnter: (evento: React.PointerEvent<HTMLElement>) => {
      if (bloqueado) return
      medirDoPonteiro(evento)
      setSobOPonteiro(true)
    },
    onPointerDown: (evento: React.PointerEvent<HTMLElement>) => {
      if (bloqueado || evento.button !== 0) return
      medirDoPonteiro(evento)
      setPressionado(true)
      setSobOPonteiro(true)
    },
    onPointerUp: () => setPressionado(false),
    onPointerCancel: () => setPressionado(false),
    onPointerLeave: () => {
      setSobOPonteiro(false)
      setPressionado(false)
    },
    /*
     * `:focus-visible` e nao `:focus`: clicar com o mouse tambem da foco, e
     * acender o preenchimento por foco depois do clique deixaria o botao
     * aceso com o ponteiro longe dele.
     */
    onFocus: (evento: React.FocusEvent<HTMLElement>) => {
      if (bloqueado || !evento.currentTarget.matches(':focus-visible')) return
      medirDoCentro()
      setSobOPonteiro(true)
    },
    onBlur: () => {
      setSobOPonteiro(false)
      setPressionado(false)
    },
    onKeyDown: (evento: React.KeyboardEvent<HTMLElement>) => {
      if (bloqueado || evento.repeat || (evento.key !== ' ' && evento.key !== 'Enter')) return
      if (evento.key === ' ') evento.preventDefault()
      medirDoCentro()
      setPressionado(true)
      setSobOPonteiro(true)
    },
    onKeyUp: (evento: React.KeyboardEvent<HTMLElement>) => {
      if (evento.key !== ' ' && evento.key !== 'Enter') return
      setPressionado(false)
      if (!evento.currentTarget.matches(':focus-visible')) setSobOPonteiro(false)
    },
  }

  const miolo = (
    <>
      <motion.span
        aria-hidden
        className="botao-origem-tinta"
        initial={false}
        animate={{ scale: preenchendo && tamanho > 0 ? 1 : 0 }}
        transition={
          semMovimento
            ? { duration: 0 }
            : { duration: DURACAO_DO_PREENCHIMENTO, ease: CURVA_DO_PREENCHIMENTO }
        }
        style={{ width: tamanho, height: tamanho, left: origem.x, top: origem.y }}
      />
      <span className="botao-origem-rotulo">{children}</span>
    </>
  )

  if ('href' in props && props.href !== undefined) {
    const { href, ...restoDoLink } = resto as Omit<PropsDeLink, keyof PropsComuns>
    return (
      <motion.a {...restoDoLink} {...comuns} href={href}>
        {miolo}
      </motion.a>
    )
  }

  const { type = 'button', ...restoDoBotao } = resto as Omit<PropsDeBotao, keyof PropsComuns>
  return (
    <motion.button {...restoDoBotao} {...comuns} disabled={bloqueado} type={type}>
      {miolo}
    </motion.button>
  )
}
