import { expect, test } from '@playwright/test'

/**
 * O caminho do lead no navegador de verdade.
 *
 * A revisao critica registrava que nenhum teste cobria a conversao. Estes
 * cobrem o diagnostico de ponta a ponta: as quatro perguntas, o roteamento
 * para a divisao certa e as travas que impedem o site de prometer resultado.
 */

/** Responde uma pergunta pelo rotulo e avanca. */
async function responder(page: import('@playwright/test').Page, rotulo: string, ultima = false) {
  await page.getByRole('radio', { name: rotulo }).check()
  await page.getByRole('button', { name: ultima ? 'Ver o caminho indicado' : 'Continuar' }).click()
}

test.describe('Diagnóstico de Regularização', () => {
  test('leva a divisão Fire quando o problema é incêndio', async ({ page }) => {
    await page.goto('/diagnostico')

    await responder(page, 'Um condomínio ou edifício')
    await responder(page, 'Preciso regularizar segurança contra incêndio')
    await responder(page, 'Nas próximas semanas')
    await responder(page, 'Empresa / condomínio / instituição', true)

    await expect(page.getByText('Sua situação começa pela Bradotec Fire')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver essa divisão' })).toHaveAttribute(
      'href',
      '/seguranca-contra-incendio'
    )
  })

  test('veículo vence incêndio e leva à divisão Auto', async ({ page }) => {
    await page.goto('/diagnostico')

    await responder(page, 'Um veículo ou uma frota')
    await responder(page, 'Preciso regularizar segurança contra incêndio')
    await responder(page, 'Imediata: há prazo correndo ou risco de multa')
    await responder(page, 'Pessoa física', true)

    await expect(page.getByText('Sua situação começa pela Bradotec Auto')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver essa divisão' })).toHaveAttribute(
      'href',
      '/documentacao-veicular'
    )
  })

  test('"ainda não sei" cai em Documentos, que faz o levantamento', async ({ page }) => {
    await page.goto('/diagnostico')

    await responder(page, 'Um imóvel ou edificação')
    await responder(page, 'Ainda não sei exatamente o que falta')
    await responder(page, 'Estou apenas planejando')
    await responder(page, 'Pessoa física', true)

    await expect(page.getByText('Sua situação começa pela Bradotec Documentos')).toBeVisible()
  })

  test('não avança sem resposta e avisa o motivo', async ({ page }) => {
    await page.goto('/diagnostico')

    await page.getByRole('button', { name: 'Continuar' }).click()

    await expect(page.getByRole('alert')).toHaveText('Escolha uma opção para continuar.')
    // Continua na primeira pergunta.
    await expect(page.getByText('Pergunta 1 de 4')).toBeVisible()
  })

  test('o botão Voltar preserva a resposta já dada', async ({ page }) => {
    await page.goto('/diagnostico')

    await responder(page, 'Uma empresa ou comércio')
    await page.getByRole('button', { name: 'Voltar' }).click()

    await expect(page.getByRole('radio', { name: 'Uma empresa ou comércio' })).toBeChecked()
  })

  test('o resultado recebe o foco, para quem usa leitor de tela', async ({ page }) => {
    await page.goto('/diagnostico')

    await responder(page, 'Uma empresa ou comércio')
    await responder(page, 'Falta licença, alvará ou documento')
    await responder(page, 'Nas próximas semanas')
    await responder(page, 'Empresa / condomínio / instituição', true)

    const focado = page.locator(':focus')
    await expect(focado).toContainText('Sua situação começa pela')
  })

  test('o resultado nunca promete prazo, aprovação ou resultado', async ({ page }) => {
    await page.goto('/diagnostico')

    await responder(page, 'Uma igreja, escola ou instituição')
    await responder(page, 'Recebi uma exigência ou notificação')
    await responder(page, 'Imediata: há prazo correndo ou risco de multa')
    await responder(page, 'Empresa / condomínio / instituição', true)

    const texto = (await page.locator('main').innerText()).toLowerCase()
    for (const proibido of ['garantimos', 'aprovação garantida', 'em até', 'resolvemos em']) {
      expect(texto, `o resultado nao pode conter "${proibido}"`).not.toContain(proibido)
    }

    // E precisa dizer explicitamente que e orientacao inicial.
    await expect(page.getByText(/orientação inicial para direcionar o atendimento/)).toBeVisible()
    await expect(page.getByText(/profissional legalmente habilitado/)).toBeVisible()
  })

  test('a barra de progresso reflete a pergunta atual', async ({ page }) => {
    await page.goto('/diagnostico')

    const barra = page.getByRole('progressbar')
    await expect(barra).toHaveAttribute('aria-valuenow', '0')

    await responder(page, 'Uma empresa ou comércio')
    await expect(barra).toHaveAttribute('aria-valuenow', '25')
  })
})
