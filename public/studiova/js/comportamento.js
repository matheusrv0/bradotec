/*
 * Comportamentos do tema, sem jQuery.
 *
 * Substitui o `custom.js` do template, que pedia jQuery (87 KB) e Owl
 * Carousel (47 KB) em toda pagina para fazer tres coisas: marcar o cabecalho
 * ao rolar, mostrar o botao de voltar ao topo e ligar o AOS. O carrossel nao
 * e usado em pagina nenhuma deste site, e o contador animado do template
 * tambem nao — ele animava numeros de resultado, que aqui nao existem.
 */
;(() => {
  const cabecalho = document.querySelector('header')
  const voltarAoTopo = document.getElementById('scrollToTopBtn')
  const conversa = document.querySelector('.wa-flutuante')

  /*
   * Um unico `scroll` para as duas leituras, e passivo: o `window.onscroll`
   * do template substituia qualquer outro ouvinte da pagina, e o `scroll` do
   * jQuery rodava uma segunda passada sobre o mesmo evento.
   */
  const aoRolar = () => {
    const rolagem = window.scrollY
    cabecalho?.classList.toggle('fixed-header', rolagem >= 60)
    voltarAoTopo?.classList.toggle('visivel', rolagem > 100)
  }

  window.addEventListener('scroll', aoRolar, { passive: true })
  aoRolar()

  /*
   * O CTA flutuante se recolhe quando o rodape entra na tela.
   *
   * Ate aqui o rodape ganhava folga embaixo para o botao nao cobrir os links,
   * mas essa folga tem de ser recalibrada a cada mudanca no tamanho do botao —
   * quatro pixels de altura a mais e o ultimo link volta a ficar coberto.
   * Recolher resolve na origem, e nao perde nada: o proprio rodape tem o link
   * do WhatsApp, no lugar onde a pessoa esta olhando.
   *
   * `inert` no lugar de so apagar: alvo invisivel que ainda recebe foco e uma
   * armadilha para quem navega por teclado — o foco sai da tela sem explicacao.
   * O botao de voltar ao topo fica: no fim da pagina ele e justamente o que
   * serve.
   */
  const rodape = document.querySelector('footer')
  if (rodape && conversa && 'IntersectionObserver' in window) {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) conversa.toggleAttribute('inert', entrada.isIntersecting)
      },
      { threshold: 0 }
    )
    observador.observe(rodape)
  }

  voltarAoTopo?.addEventListener('click', () => {
    // `smooth` respeita "reduzir movimento" do sistema no Chrome e no Safari.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  /*
   * Preenchimento a partir do cursor, para os botoes que nao sao ilha React.
   *
   * Sao os cinco do quiz: o script de lá liga e desliga `hidden` neles e
   * reescreve um `href`, e o React desfaria esse estado no render seguinte.
   * A conta e a mesma do componente — o circulo precisa de duas vezes a
   * distancia ate o canto mais longe, senao deixa a esquina oposta
   * descoberta quando o ponteiro entra por um canto.
   */
  const diametroDeCobertura = (largura, altura, x, y) =>
    Math.ceil(
      2 *
        Math.max(
          Math.hypot(x, y),
          Math.hypot(largura - x, y),
          Math.hypot(x, altura - y),
          Math.hypot(largura - x, altura - y)
        )
    )

  const acenderTinta = (botao, clienteX, clienteY) => {
    const caixa = botao.getBoundingClientRect()
    const x = clienteX - caixa.left
    const y = clienteY - caixa.top

    botao.style.setProperty('--tinta-x', `${x}px`)
    botao.style.setProperty('--tinta-y', `${y}px`)
    botao.style.setProperty(
      '--tinta-d',
      `${diametroDeCobertura(caixa.width, caixa.height, x, y)}px`
    )
    botao.dataset.preenchendo = 'true'
  }

  /**
   * Acha o botao a partir do alvo do evento, se houver um.
   *
   * Delegado no documento, e nao um ouvinte por botao: o quiz troca de passo
   * escondendo e mostrando botoes, e ouvintes ligados no carregamento
   * perderiam os que so aparecem depois.
   */
  const botaoDe = (evento) =>
    evento.target instanceof Element ? evento.target.closest('[data-tinta]') : null

  /*
   * `pointerover` e `pointerout`, e nao `pointerenter`/`pointerleave`: so os
   * dois primeiros sobem no DOM, e delegado depende disso.
   */
  document.addEventListener('pointerover', (evento) => {
    const botao = botaoDe(evento)
    // Ja aceso significa que o ponteiro so passou para o <span> de dentro.
    // Recalcular ali faria o circulo saltar no meio do preenchimento.
    if (!botao || botao.dataset.preenchendo === 'true') return
    acenderTinta(botao, evento.clientX, evento.clientY)
  })

  document.addEventListener('pointerdown', (evento) => {
    const botao = botaoDe(evento)
    if (botao) acenderTinta(botao, evento.clientX, evento.clientY)
  })

  const apagarTinta = (evento) => {
    const botao = botaoDe(evento)
    // Sair para um filho nao e sair do botao.
    if (!botao || botao.contains(evento.relatedTarget)) return
    botao.dataset.preenchendo = 'false'
  }

  document.addEventListener('pointerout', apagarTinta)
  document.addEventListener('pointercancel', apagarTinta)

  /* Teclado acende pelo centro: e a unica origem que existe sem ponteiro. */
  document.addEventListener('focusin', (evento) => {
    const botao = botaoDe(evento)
    if (!botao || !botao.matches(':focus-visible')) return
    const caixa = botao.getBoundingClientRect()
    acenderTinta(botao, caixa.left + caixa.width / 2, caixa.top + caixa.height / 2)
  })

  document.addEventListener('focusout', apagarTinta)

  /*
   * Guarda o `typeof`: sem ela, um `aos.js` que nao chegou derruba o resto
   * deste arquivo por ReferenceError — cabecalho, voltar-ao-topo, recolhimento
   * do CTA e o preenchimento dos botoes do quiz iriam junto. O motivo de estar
   * aqui nao e hipotetico: `aos.js` mora numa pasta `dist/`, e uma regra do
   * `.gitignore` sem barra inicial o manteve fora do repositorio.
   */
  if (typeof AOS !== 'undefined') AOS.init({ once: true })
})()
