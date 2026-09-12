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

  AOS.init({ once: true })
})()
