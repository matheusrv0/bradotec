import type { Page } from '@playwright/test'

/**
 * Congela as animacoes de entrada antes de medir.
 *
 * O template anima quase toda secao com AOS, e um elemento ainda nao animado
 * tem `opacity: 0` e um `translate` no meio do caminho. Isso quebra dois tipos
 * de medida: numa captura de tela o elemento aparece transparente e a cor lida
 * e a do fundo atras dele; numa medida de posicao o elemento continua se
 * mexendo entre uma leitura e a seguinte, e o deslocamento da animacao encobre
 * o que se queria medir.
 *
 * Isto nao afrouxa teste nenhum: o que interessa medir e o estado final, que e
 * o que a pessoa ve. O que se remove e o meio da animacao.
 */
export async function congelarAnimacoes(page: Page) {
  await page.addStyleTag({
    content: `
      [data-aos] { opacity: 1 !important; transform: none !important; transition: none !important; }
      *, *::before, *::after { animation: none !important; transition: none !important; }
    `,
  })
  await page.waitForTimeout(120)
}
