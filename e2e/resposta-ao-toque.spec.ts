import { expect, test } from '@playwright/test'
import { congelarAnimacoes } from './ajudantes'

/**
 * Resposta ao toque dos botoes.
 *
 * O template so da retorno de hover, e no celular nao existe hover: o dedo
 * toca o botao e a tela fica igual ate a proxima pagina abrir, o que em
 * conexao lenta e a diferenca entre "nao funcionou" e "ja vai". Agora cada
 * botao afunda enquanto esta pressionado.
 *
 * Este teste nao e uma varredura cega como o de contraste, e nao e por
 * descuido: "ser um botao" nao da para deduzir do HTML sem inventar
 * heuristica, e heuristica errada aqui reprovaria o link de pular conteudo e
 * a pergunta do FAQ, que nao sao botoes. As superficies estao listadas, e
 * componente de botao novo entra aqui junto.
 *
 * Mede deslocamento real em pixel, e nao a classe no HTML: classe presente
 * com transicao errada, ou com outra regra disputando a mesma propriedade,
 * continua sendo um botao que nao responde.
 */

/**
 * Retangulo no sistema do VIEWPORT, que e o mesmo que `page.mouse` usa.
 *
 * O `boundingBox()` do Playwright devolve coordenada de PAGINA e ainda passa
 * pela verificacao de acionabilidade, que rola o elemento para a area
 * visivel. Nos dois casos a conta quebra aqui: num elemento `position: fixed`
 * as duas coordenadas divergem assim que a pagina rola, o clique cai fora do
 * botao e o `:active` nunca acontece. Foi assim que este teste reprovou dois
 * botoes que, na tela, respondiam.
 */
const retangulo = (alvo: import('@playwright/test').Locator) =>
  alvo.evaluate((e) => {
    const r = e.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  })

/**
 * Mede so depois que o tamanho parar de mudar.
 *
 * Duas coisas chegam atrasadas e mexem na largura do botao: a fonte do site,
 * que so entra depois do primeiro quadro, e o `<iconify-icon>`, que busca o
 * desenho na rede e so entao ocupa espaco. Medir antes disso joga o
 * crescimento delas na mesma conta do toque.
 *
 * Espera o valor se repetir em vez de dormir um tempo fixo: tempo fixo vira
 * teste instavel na primeira maquina mais lenta.
 */
async function medidaEstavel(alvo: import('@playwright/test').Locator) {
  let anterior = await retangulo(alvo)
  for (let tentativa = 0; tentativa < 30; tentativa++) {
    await alvo.page().waitForTimeout(100)
    const atual = await retangulo(alvo)
    if (atual.width === anterior.width && atual.y === anterior.y) return atual
    anterior = atual
  }
  return anterior
}

/**
 * Posiciona o ponteiro sobre o botao e devolve a medida ja com ele parado ali.
 *
 * O repouso que interessa comparar e o de um botao sob o ponteiro, porque e
 * dele que o toque parte. Medir antes do hover mistura duas coisas: o
 * flutuante ganha 20px de largura so por receber o ponteiro, e esse
 * crescimento aparecia no resultado como se o botao tivesse AUMENTADO ao ser
 * pressionado.
 *
 * Centraliza duas vezes de proposito: depois de crescer, o centro e outro, e
 * um `mouse.down` no centro antigo pode cair fora do botao.
 */
async function repousoSobPonteiro(
  page: import('@playwright/test').Page,
  alvo: import('@playwright/test').Locator
) {
  const semPonteiro = await medidaEstavel(alvo)
  await page.mouse.move(
    semPonteiro.x + semPonteiro.width / 2,
    semPonteiro.y + semPonteiro.height / 2
  )

  const comPonteiro = await medidaEstavel(alvo)
  await page.mouse.move(
    comPonteiro.x + comPonteiro.width / 2,
    comPonteiro.y + comPonteiro.height / 2
  )

  return medidaEstavel(alvo)
}

const superficies = [
  { rota: '/sobre', seletor: 'main a.btn[href="/solucoes"]', nome: 'BotaoSeta' },
  { rota: '/', seletor: 'main a.btn[href^="https://wa.me"]', nome: 'botão de WhatsApp' },
  { rota: '/contato', seletor: 'form button[type="submit"]', nome: 'enviar do formulário' },
] as const

test.describe('Resposta ao toque', () => {
  for (const { rota, seletor, nome } of superficies) {
    test(`${nome} afunda enquanto está pressionado`, async ({ page }) => {
      await page.goto(rota)
      await congelarAnimacoes(page)

      const botao = page.locator(seletor).first()
      await botao.scrollIntoViewIfNeeded()

      const parado = await repousoSobPonteiro(page, botao)
      expect(parado.width, `nao achei o botao "${nome}" em ${rota}`).toBeGreaterThan(0)

      await page.mouse.down()
      await page.waitForTimeout(200)
      const pressionado = await retangulo(botao)
      await page.mouse.up()

      expect(pressionado.y, `"${nome}" nao se moveu ao ser pressionado`).toBeGreaterThan(parado.y)
    })
  }

  /*
   * O flutuante afunda por escala, e nao por deslocamento: o translate dele ja
   * e usado pela propria entrada e saida. Por isso mede largura, e nao topo.
   */
  test('o botão flutuante encolhe enquanto está pressionado', async ({ page }) => {
    await page.goto('/')

    const flutuante = page.locator('.wa-flutuante').first()
    await expect(flutuante).toBeVisible()

    const parado = await repousoSobPonteiro(page, flutuante)
    expect(parado.width, 'nao achei o botao flutuante').toBeGreaterThan(0)

    await page.mouse.down()
    await page.waitForTimeout(200)
    const pressionado = await retangulo(flutuante)
    await page.mouse.up()

    expect(pressionado.width, 'o flutuante não encolheu ao ser pressionado').toBeLessThan(
      parado.width
    )
  })
})
