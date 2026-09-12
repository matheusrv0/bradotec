import { expect, test } from '@playwright/test'

/**
 * Trava a correcao do maior problema da versao anterior do site.
 *
 * Antes, cada resposta do FAQ era escrita duas vezes por pagina — uma no HTML
 * visivel, outra dentro do JSON-LD que o Google le — e repetida em ate 4
 * paginas. Se alguem editasse uma so, o Google passava a mostrar um texto
 * diferente do que o visitante lia.
 *
 * Agora as duas saem da mesma Content Collection. Este teste garante que
 * continuem saindo, mesmo depois de qualquer refatoracao futura.
 */

const paginasComFaq = [
  '/regularizacoes',
  '/seguranca-contra-incendio',
  '/documentacao-veicular',
  '/empresas',
  '/solucoes',
] as const

for (const caminho of paginasComFaq) {
  test(`${caminho}: o FAQ visivel e o JSON-LD dizem exatamente a mesma coisa`, async ({ page }) => {
    await page.goto(caminho)

    const perguntasVisiveis = await page
      .locator('#faq .accordion-button')
      .evaluateAll((nos) => nos.map((no) => no.textContent?.trim() ?? ''))

    expect(perguntasVisiveis.length).toBeGreaterThan(0)

    const blocos = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nos) => nos.map((no) => JSON.parse(no.textContent ?? '{}')))

    const faq = blocos.find((bloco) => bloco['@type'] === 'FAQPage')
    expect(faq, 'a página precisa declarar um FAQPage no JSON-LD').toBeDefined()

    const perguntasNoSchema = faq.mainEntity.map((item: { name: string }) => item.name)
    expect(perguntasNoSchema).toEqual(perguntasVisiveis)
  })
}

test('as respostas do FAQ abrem ao clicar na pergunta', async ({ page }) => {
  await page.goto('/regularizacoes')

  const primeira = page.locator('#faq .accordion-item').first()
  const resposta = primeira.locator('.accordion-collapse')

  await expect(resposta).toBeHidden()

  await primeira.locator('.accordion-button').click()
  await expect(resposta).toBeVisible()
})
