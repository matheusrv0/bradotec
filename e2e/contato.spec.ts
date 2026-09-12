import { expect, test } from '@playwright/test'
import { instagramUsuario, site } from '../src/config/site'

/**
 * O formulario de contato no navegador.
 *
 * A segunda porta do site — a que existe para quem nao quer WhatsApp.
 * Ate aqui nenhum teste tocava nela: dava para quebrar a validacao inteira
 * sem nenhum alarme.
 *
 * Os testes verificam comportamento e acessibilidade, nao implementacao, para
 * sobreviverem a uma eventual troca de React por outra coisa.
 */

test.describe('Formulário de contato', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contato')
  })

  test('todo campo tem rótulo associado — sem isso o leitor de tela não anuncia', async ({
    page,
  }) => {
    const formulario = page.locator('form')

    for (const campo of await formulario.locator('input, select, textarea').all()) {
      const nome = (await campo.getAttribute('name')) ?? (await campo.getAttribute('aria-label'))
      // Vale <label for> ou aria-label: os dois dao nome acessivel ao campo.
      const acessivel = await campo.evaluate((elemento) => {
        const rotuloDireto = elemento.getAttribute('aria-label')?.trim()
        if (rotuloDireto) return rotuloDireto

        const id = elemento.getAttribute('id')
        if (!id) return ''
        return document.querySelector(`label[for="${id}"]`)?.textContent?.trim() ?? ''
      })
      expect(acessivel, `o campo "${nome}" ficou sem nome acessível`).not.toBe('')
    }
  })

  test('recusa o envio vazio e explica cada campo obrigatório', async ({ page }) => {
    await page.getByRole('button', { name: /Enviar pelo WhatsApp|Montar mensagem/ }).click()

    // Um alerta por campo obrigatorio: nome, telefone, perfil, urgencia, assunto.
    await expect(page.getByRole('alert')).toHaveCount(5)
    await expect(page.getByText('Informe o seu nome.')).toBeVisible()
    await expect(page.getByText('Informe um telefone para contato.')).toBeVisible()
  })

  test('liga o erro ao campo por aria-describedby e marca aria-invalid', async ({ page }) => {
    await page.getByRole('button', { name: /Enviar pelo WhatsApp|Montar mensagem/ }).click()

    const nome = page.locator('#nome')
    await expect(nome).toHaveAttribute('aria-invalid', 'true')

    const idDoErro = await nome.getAttribute('aria-describedby')
    expect(idDoErro).toBeTruthy()
    await expect(page.locator(`#${idDoErro}`)).toHaveText('Informe o seu nome.')
  })

  test('recusa telefone com letras', async ({ page }) => {
    await page.locator('#telefone').fill('não tenho')
    await page.locator('#nome').click()

    await expect(page.getByText(/Use apenas números/)).toBeVisible()
  })

  test('aceita telefone com parênteses, espaço e traço', async ({ page }) => {
    await page.locator('#telefone').fill('(83) 99999-8888')
    await page.locator('#nome').click()

    await expect(page.getByText(/Use apenas números/)).toHaveCount(0)
  })

  test('o erro some quando o campo é corrigido', async ({ page }) => {
    await page.getByRole('button', { name: /Enviar pelo WhatsApp|Montar mensagem/ }).click()
    await expect(page.getByText('Informe o seu nome.')).toBeVisible()

    await page.locator('#nome').fill('Maria Souza')
    await page.locator('#telefone').click()

    await expect(page.getByText('Informe o seu nome.')).toHaveCount(0)
  })

  /*
   * Este teste ja verificou o contrario: enquanto o WhatsApp era placeholder,
   * o formulario entregava a mensagem numa caixa para copiar, e era isso que
   * se checava. Com o numero real preenchido em src/config/site.ts esse ramo
   * deixou de rodar, e o teste passou a falhar por estar certo demais.
   *
   * O que importa continua sendo o mesmo: a mensagem tem de sair montada com
   * tudo que a pessoa digitou. So mudou o destino. Aqui a mensagem e lida do
   * link do WhatsApp, e o numero vem da configuracao, nao escrito a mao, para
   * o teste seguir o cliente se o numero mudar.
   */
  test('monta a mensagem com o que foi preenchido e abre o WhatsApp com ela', async ({ page }) => {
    // Captura o destino em vez de abrir uma aba.
    await page.addInitScript(() => {
      window.open = ((url?: string | URL) => {
        ;(window as unknown as { destinoDoTeste?: string }).destinoDoTeste = String(url)
        return null
      }) as typeof window.open
    })
    await page.goto('/contato')

    await page.locator('#nome').fill('Maria Souza')
    await page.locator('#telefone').fill('83999998888')
    await page.locator('#cidade').fill('João Pessoa')
    await page.locator('#organizacao').fill('Condomínio Aurora')
    await page.locator('#perfil').selectOption('Condomínio ou administradora')
    await page.locator('#urgencia').selectOption('Nas próximas semanas')
    await page.locator('#assunto').selectOption('Segurança contra incêndio e pânico')
    await page.locator('#descricao').fill('Exigência aberta desde o mês passado.')

    await page.getByRole('button', { name: /Enviar pelo WhatsApp|Montar mensagem/ }).click()

    const destino = await page.evaluate(
      () => (window as unknown as { destinoDoTeste?: string }).destinoDoTeste
    )
    expect(destino, 'o formulário não abriu o WhatsApp').toBeTruthy()
    if (!destino) return

    const url = new URL(destino)
    expect(url.origin + url.pathname).toBe(`https://wa.me/${site.whatsapp}`)

    const texto = url.searchParams.get('text') ?? ''
    expect(texto).toContain('Maria Souza')
    expect(texto).toContain('83999998888')
    expect(texto).toContain('Condomínio Aurora')
    expect(texto).toContain('Segurança contra incêndio e pânico')
    expect(texto).toContain('Exigência aberta desde o mês passado.')
  })

  /*
   * Este teste ja verificou o contrario: enquanto telefone, e-mail, endereco e
   * Instagram eram placeholder, o que se checava era a marca amarela de
   * pendente. O cliente enviou os dados, a marca sumiu, e o teste passou a
   * falhar por continuar certo sobre um site que nao existe mais.
   *
   * A regra do projeto e a mesma nos dois sentidos: nada de dado inventado, e
   * nada de dado real escondido. Como /contato e a pagina onde a pessoa vai
   * atras do telefone, aqui se confere o lado preenchido — cada canal mostra o
   * valor que esta em src/config/site.ts, e nenhum aparece marcado como
   * pendente. Se alguem apagar um campo da configuracao, este teste avisa.
   */
  test('os canais de contato mostram o dado real, sem marca de pendente', async ({ page }) => {
    const painel = page
      .getByRole('heading', { name: 'Onde encontrar a Bradotec' })
      .locator('xpath=ancestor::section[1]')

    await expect(painel.locator('[title="Dado ainda não informado pelo cliente"]')).toHaveCount(0)

    for (const valor of [site.telefone, site.email, instagramUsuario, site.horario, site.cep]) {
      await expect(painel.getByText(valor, { exact: false }).first()).toBeVisible()
    }
  })

  test('a página não promete prazo, aprovação nem resultado', async ({ page }) => {
    const texto = (await page.locator('main').innerText()).toLowerCase()
    for (const proibido of [
      'garantimos',
      'aprovação garantida',
      'resolvemos em',
      'prazo garantido',
    ]) {
      expect(texto, `a pagina nao pode conter "${proibido}"`).not.toContain(proibido)
    }
  })
})
