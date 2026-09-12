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

  test('leva da home ate uma pagina interna pelo menu', async ({ page }) => {
    await page.goto('/')

    // O template guarda a navegacao inteira no dropdown, em qualquer largura.
    await page.getByRole('button', { name: 'Abrir menu' }).click()

    await page
      .getByRole('navigation', { name: 'Menu' })
      .getByRole('link', { name: /Regulariza/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/regularizacoes/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('Menu', () => {
  /*
   * O template usa o dropdown do Bootstrap, e nao o menu proprio de antes.
   * O que se cobra continua sendo o comportamento, nao a implementacao: abre,
   * fecha pelo Esc devolvendo o foco, fecha ao tocar fora e o botao alterna.
   *
   * A diferenca para a versao anterior e que aqui o menu e o mesmo no celular
   * e no desktop — o template nao tem barra de navegacao horizontal.
   */
  const abrir = (page: import('@playwright/test').Page) =>
    page.getByRole('button', { name: 'Abrir menu' }).click()

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

    await abrir(page)
    await expect(menu).toBeVisible()

    // Antes so o proprio botao fechava. Quem tocava na pagina atras ficava
    // com a navegacao por cima do conteudo sem entender como sair.
    //
    // O clique vai por coordenada, e nao por seletor: o menu cobre boa parte
    // da tela, e clicar "no h1" com `force` entregaria o evento ao proprio
    // menu — que e justamente o caso oposto ao que se quer medir.
    await page.mouse.click(8, 400)
    await expect(menu).toBeHidden()
  })

  test('um toque dentro do menu nao fecha o menu', async ({ page }) => {
    await page.goto('/')
    const menu = page.getByRole('navigation', { name: 'Menu' })

    await abrir(page)
    await menu.getByText('Menu', { exact: true }).click()
    await expect(menu, 'clicar dentro do menu nao pode fecha-lo').toBeVisible()
  })

  test('o botao fecha o menu que ele mesmo abriu', async ({ page }) => {
    await page.goto('/')
    const menu = page.getByRole('navigation', { name: 'Menu' })
    const botao = page.getByRole('button', { name: 'Abrir menu' })

    await botao.click()
    await expect(menu).toBeVisible()
    await botao.click()
    await expect(menu).toBeHidden()
  })

  test('o botao de fechar dentro do menu funciona', async ({ page }) => {
    await page.goto('/')
    const menu = page.getByRole('navigation', { name: 'Menu' })

    await abrir(page)
    await menu.getByRole('button', { name: 'Fechar' }).click()
    await expect(menu).toBeHidden()
  })

  test('o menu lista todas as paginas principais', async ({ page }) => {
    await page.goto('/')
    await abrir(page)

    const menu = page.getByRole('navigation', { name: 'Menu' })
    // Inicio + os oito itens de navegacaoPrincipal.
    await expect(menu.getByRole('link')).toHaveCount(11)
  })
})

test.describe('Cabeçalho no desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'Só faz sentido em tela larga')

  test('a marca e o botão encostam nas bordas do cabeçalho', async ({ page }) => {
    await page.goto('/')

    const cabecalho = page.locator('header')
    const marca = page.locator('header a[href="/"]').first()

    const caixaCabecalho = await cabecalho.boundingBox()
    const caixaMarca = await marca.boundingBox()
    expect(caixaCabecalho).not.toBeNull()
    expect(caixaMarca).not.toBeNull()
    if (!caixaCabecalho || !caixaMarca) return

    // Presa no mesmo container do conteudo, a marca ficava solta no meio da
    // tela num monitor largo.
    expect(
      caixaMarca.x - caixaCabecalho.x,
      'a marca se afastou da borda esquerda'
    ).toBeLessThanOrEqual(200)
  })

  test('o CTA de orçamento aparece no cabeçalho', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header .btn-cabecalho')).toBeVisible()
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
  const seletor = '.wa-flutuante'

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
