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

  voltarAoTopo?.addEventListener('click', () => {
    // `smooth` respeita "reduzir movimento" do sistema no Chrome e no Safari.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  AOS.init({ once: true })
})()
