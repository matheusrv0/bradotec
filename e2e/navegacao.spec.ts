import { expect, test } from '@playwright/test'

/**
 * Teste de ponta a ponta do esqueleto do site: garante que o layout base
 * funciona de verdade no navegador antes de qualquer conteudo entrar.
 */

test.describe('Home', () => {
  test('carrega com o titulo, a headline e a cidade visiveis', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Bradotec/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Regularização, licenças e documentação'
    )
    // SEO local: a cidade precisa aparecer no texto que a pessoa realmente le.
    await expect(page.locator('main')).toContainText('João Pessoa')
  })

  test('tem exatamente um h1 — hierarquia correta para leitor de tela e Google', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  })

  test('nao rola na horizontal no celular', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const estouro = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    expect(estouro).toBe(false)
  })
})

test.describe('Navegação', () => {
  test('o link "Ir para o conteúdo" aparece ao usar Tab e leva ao conteúdo', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')

    const atalho = page.getByRole('link', { name: 'Ir para o conteúdo' })
    await expect(atalho).toBeFocused()

    await atalho.press('Enter')
    await expect(page).toHaveURL(/#conteudo$/)
  })

  test('leva da home ate uma pagina interna pelo menu', async ({ page, isMobile }) => {
    await page.goto('/')

    if (isMobile) {
      await page.getByRole('button', { name: 'Abrir menu' }).click()
    }

    await page
      .getByRole('link', { name: /Regulariza/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/regularizacoes/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('Menu do celular', () => {
  test.skip(({ isMobile }) => !isMobile, 'Só faz sentido em tela pequena')

  test('abre, fecha pelo Esc e devolve o foco ao botao', async ({ page }) => {
    await page.goto('/')
    const botao = page.getByRole('button', { name: 'Abrir menu' })

    await botao.click()
    await expect(page.getByRole('navigation', { name: 'Menu' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('navigation', { name: 'Menu' })).toBeHidden()
    await expect(botao).toBeFocused()
  })

  test('fecha ao tocar fora dele', async ({ page }) => {
    await page.goto('/')
    const menu = page.getByRole('navigation', { name: 'Menu' })

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(menu).toBeVisible()

    // Antes so o proprio botao fechava. Quem tocava na pagina atras ficava
    // com a navegacao por cima do conteudo sem entender como sair.
    await page.locator('main h1').click({ position: { x: 5, y: 5 } })
    await expect(menu).toBeHidden()
  })

  test('um toque dentro do menu nao fecha o menu', async ({ page }) => {
    await page.goto('/')
    const menu = page.getByRole('navigation', { name: 'Menu' })

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await menu.click({ position: { x: 5, y: 2 } })
    await expect(menu).toBeVisible()
  })

  test('o botao continua alternando depois de aberto', async ({ page }) => {
    await page.goto('/')
    const menu = page.getByRole('navigation', { name: 'Menu' })

    // O stopPropagation do proprio botao poderia quebrar isto: sem ele, o
    // clique que abre chega ao document e fecha na sequencia.
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(menu).toBeVisible()
    await page.getByRole('button', { name: 'Fechar menu' }).click()
    await expect(menu).toBeHidden()
  })

  test('os tres tracos viram um X quando abre', async ({ page }) => {
    await page.goto('/')
    const tracos = page.locator('[data-burger] span')

    await expect(tracos.first()).toHaveCSS('rotate', 'none')

    await page.getByRole('button', { name: 'Abrir menu' }).click()

    // As classes de transicao existiam desde a primeira versao, mas nada
    // mudava de estado: a animacao estava escrita pela metade.
    await expect(tracos.first()).toHaveCSS('rotate', '45deg')
    await expect(tracos.nth(1)).toHaveCSS('opacity', '0')
    await expect(tracos.last()).toHaveCSS('rotate', '-45deg')
  })
})

test.describe('Cabeçalho no desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'Só faz sentido em tela larga')

  test('a logo e o botão encostam nas bordas, e o menu cabe em uma linha', async ({ page }) => {
    await page.goto('/')

    const cabecalho = page.locator('header')
    const logo = page.locator('header a[href="/"]').first()

    const caixaCabecalho = await cabecalho.boundingBox()
    const caixaLogo = await logo.boundingBox()
    expect(caixaCabecalho).not.toBeNull()
    expect(caixaLogo).not.toBeNull()
    if (!caixaCabecalho || !caixaLogo) return

    // Presa no mesmo max-w-wrap do conteudo, a logo ficava a 150px da borda
    // num monitor de 1440 e parecia solta no meio da tela.
    expect(
      caixaLogo.x - caixaCabecalho.x,
      'a logo se afastou da borda esquerda'
    ).toBeLessThanOrEqual(40)

    const linhas = new Set(
      await page
        .locator('header nav[aria-label="Principal"] li')
        .evaluateAll((itens) => itens.map((li) => Math.round(li.getBoundingClientRect().top)))
    )
    expect(linhas.size, 'o menu do topo quebrou em mais de uma linha').toBe(1)
  })
})

test.describe('Página 404', () => {
  test('responde com noindex para nao entrar no Google', async ({ page }) => {
    await page.goto('/404')

    // Interessa o noindex. O segundo termo muda de propósito: em produção a
    // 404 usa "follow", para o robô continuar seguindo os links de saída;
    // enquanto o site está em prévia, a trava global impõe "nofollow".
    const conteudo = await page.locator('meta[name="robots"]').getAttribute('content')
    expect(conteudo, 'a 404 precisa ser noindex').toContain('noindex')
  })
})

test.describe('Trava de indexação', () => {
  /**
   * O robots.txt e a meta robots precisam contar a mesma história.
   *
   * Enquanto SITE_URL for o placeholder, o site está em prévia e tudo é
   * fechado — senão um link de teste entra no Google com os dados do cliente
   * ainda em colchetes. Quando o domínio real for configurado, os dois lados
   * abrem juntos.
   *
   * O teste não fixa qual dos dois estados é o certo: cobra que os dois
   * concordem. Assim continua valendo depois da publicação.
   */
  test('robots.txt e meta robots dizem a mesma coisa', async ({ page, request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    const emPrevia = robots.includes('Disallow: /')

    await page.goto('/')
    const meta = (await page.locator('meta[name="robots"]').getAttribute('content')) ?? ''

    if (emPrevia) {
      expect(meta, 'robots.txt fecha o site, mas a home se diz indexável').toContain('noindex')
    } else {
      expect(meta, 'robots.txt abre o site, mas a home se diz noindex').not.toContain('noindex')
      expect(robots, 'site aberto precisa apontar o sitemap').toContain('Sitemap:')
    }
  })
})

test.describe('Botão flutuante do WhatsApp', () => {
  const seletor = '.fixed[aria-label="Falar no WhatsApp"]'

  /**
   * Opacidade real, e nao toBeVisible(): para o Playwright um elemento com
   * opacity 0 continua "visivel", porque ele olha display, visibility e
   * caixa — nao opacidade.
   */
  const estaAparecendo = (page: import('@playwright/test').Page) =>
    page.locator(seletor).evaluate((elemento) => {
      const estilo = getComputedStyle(elemento)
      return Number.parseFloat(estilo.opacity) > 0.05 && estilo.pointerEvents !== 'none'
    })

  test('aparece durante a leitura da página', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(seletor)).toBeAttached()
    expect(await estaAparecendo(page), 'o atalho precisa existir antes do rodapé').toBe(true)
  })

  test('não cobre o conteúdo do rodapé', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer').scrollIntoViewIfNeeded()

    const botao = await page.locator(seletor).boundingBox()
    const ultimoItem = await page.locator('footer li').last().boundingBox()

    expect(botao, 'o botão flutuante precisa existir').not.toBeNull()
    expect(ultimoItem, 'o rodapé precisa ter itens').not.toBeNull()
    if (!botao || !ultimoItem) return

    const sobrepoe =
      ultimoItem.y + ultimoItem.height > botao.y && ultimoItem.x + ultimoItem.width > botao.x

    // O que importa e nao cobrir, e ha dois jeitos legitimos de cumprir isso:
    // ou o botao nao passa por cima do rodape, ou ele se recolhe quando o
    // rodape entra na tela. A versao antiga deste teste so media geometria e
    // exigia a primeira solucao — na pratica, exigia calibrar o padding do
    // rodape de novo a cada link acrescentado.
    if (sobrepoe) {
      expect(
        await estaAparecendo(page),
        'o botão passa por cima do rodapé e continua aparecendo'
      ).toBe(false)
    }
  })

  test('sai da ordem de tabulação quando se recolhe', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer').scrollIntoViewIfNeeded()

    // Alvo invisivel que ainda recebe foco e uma armadilha para quem navega
    // por teclado: o foco some da tela sem explicacao.
    const recolhido = !(await estaAparecendo(page))
    if (recolhido) {
      await expect(page.locator(seletor)).toHaveAttribute('inert', '')
    }
  })
})
