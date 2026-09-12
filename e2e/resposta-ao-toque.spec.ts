import { expect, test } from '@playwright/test'

/**
 * Resposta ao toque dos botoes.
 *
 * O site inteiro so dava retorno de hover, e no celular nao existe hover. O
 * dedo tocava o botao e a tela ficava igual ate a proxima pagina abrir, o que
 * em conexao lenta e a diferenca entre "nao funcionou" e "ja vai". Agora cada
 * botao afunda enquanto esta pressionado.
 *
 * Este teste nao e uma varredura cega como o de contraste, e nao e por
 * descuido: "ser um botao" nao da para deduzir do HTML sem inventar
 * heuristica, e heuristica errada aqui reprovaria o link de pular conteudo e
 * o resumo do FAQ, que nao sao botoes. Sao quatro superficies, e estao todas
 * listadas. Componente de botao novo entra aqui junto.
 *
 * Mede deslocamento real em pixel, e nao a classe no HTML: classe presente
 * com transicao errada, ou com outra regra disputando a mesma propriedade,
 * continua sendo um botao que nao responde.
 */

const superficies = [
  { rota: '/sobre', seletor: 'main a[href="/diagnostico"]', nome: 'BotaoLink' },
  { rota: '/', seletor: 'main a[href^="https://wa.me"]', nome: 'BotaoWhatsapp' },
  { rota: '/contato', seletor: 'form button[type="submit"]', nome: 'enviar do formulário' },
] as const

test.describe('Resposta ao toque', () => {
  for (const { rota, seletor, nome } of superficies) {
    test(`${nome} afunda enquanto está pressionado`, async ({ page }) => {
      await page.goto(rota)
      const botao = page.locator(seletor).first()
      await botao.scrollIntoViewIfNeeded()

      const parado = await botao.boundingBox()
      expect(parado, `nao achei o botao "${nome}" em ${rota}`).not.toBeNull()
      if (!parado) return

      await page.mouse.move(parado.x + parado.width / 2, parado.y + parado.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(200)
      const pressionado = await botao.boundingBox()
      await page.mouse.up()

      expect(pressionado?.y, `"${nome}" nao se moveu ao ser pressionado`).toBeGreaterThan(parado.y)
    })
  }

  /*
   * O flutuante afunda por escala, e nao por deslocamento: o translate dele ja
   * e usado pela propria entrada e saida. Por isso mede largura, e nao topo.
   */
  test('o botão flutuante encolhe enquanto está pressionado', async ({ page }) => {
    await page.goto('/')
    const flutuante = page.locator('a[class*="fixed"]').first()
    await expect(flutuante).toBeVisible()

    const parado = await flutuante.boundingBox()
    if (!parado) return

    await page.mouse.move(parado.x + parado.width / 2, parado.y + parado.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(200)
    const pressionado = await flutuante.boundingBox()
    await page.mouse.up()

    expect(pressionado?.width, 'o flutuante não encolheu ao ser pressionado').toBeLessThan(
      parado.width
    )
  })
})
