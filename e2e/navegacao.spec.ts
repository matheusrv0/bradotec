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

    /*
     * Dois menus, um comportamento.
     *
     * A partir de 1200px a navegacao esta escrita no cabecalho; abaixo disso
     * continua atras do hamburguer, porque nove palavras nao caberiam. O
     * teste cobra o resultado — chegar na pagina — e nao qual dos dois apareceu.
     */
    const hamburguer = page.getByRole('button', { name: 'Abrir menu' })
    if (await hamburguer.isVisible()) await hamburguer.click()

    await page
      .getByRole('link', { name: /Regulariza/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/regularizacoes/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('Menu atras do hamburguer', () => {
  /*
   * O template usa o dropdown do Bootstrap, e nao o menu proprio de antes.
   * O que se cobra continua sendo o comportamento, nao a implementacao: abre,
   * fecha pelo Esc devolvendo o foco, fecha ao tocar fora e o botao alterna.
   *
   * Vale so abaixo de 1200px. Acima disso a navegacao esta escrita no
   * cabecalho e o hamburguer nao existe — ver "Menu escrito no cabecalho".
   */
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) >= 1200,
    'A partir de 1200px o menu fica escrito no cabecalho'
  )

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

test.describe('Menu escrito no cabecalho', () => {
  /*
   * A partir de 1200px a navegacao esta escrita no topo, e nao atras do
   * hamburguer. O ganho nao e estetico: a pessoa ve o tamanho do site sem
   * clicar, e chega em qualquer pagina com um clique em vez de dois.
   */
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 1200,
    'Abaixo de 1200px o menu fica atras do hamburguer'
  )

  const dock = (page: import('@playwright/test').Page) =>
    page.getByRole('navigation', { name: 'Navegação principal' })

  test('aparece no lugar do hamburguer', async ({ page }) => {
    await page.goto('/')

    await expect(dock(page)).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Abrir menu' }),
      'com o menu escrito, o hamburguer viraria um segundo caminho para a mesma coisa'
    ).toBeHidden()
  })

  test('lista as nove paginas principais', async ({ page }) => {
    await page.goto('/')

    // Inicio + os oito itens de navegacaoPrincipal.
    await expect(dock(page).getByRole('link')).toHaveCount(9)
  })

  test('marca a pagina aberta', async ({ page }) => {
    await page.goto('/regularizacoes')

    await expect(dock(page).getByRole('link', { name: 'Regularizações' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  test('marca o item pai quando a pagina e uma subpagina', async ({ page }) => {
    // /avcb nao esta no menu: pertence a Seguranca contra incendio. Sem isto,
    // quem abria /avcb via o menu inteiro apagado e perdia a nocao de onde
    // estava.
    await page.goto('/avcb')

    await expect(dock(page).getByRole('link', { name: 'Incêndio' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  test('mostra o nome completo ao passar o ponteiro', async ({ page }) => {
    await page.goto('/')

    const atalho = dock(page).getByRole('link', { name: 'Incêndio' })

    /*
     * A busca fica dentro do menu de proposito. "Seguranca contra incendio" e
     * o rotulo completo, e ele aparece tambem no rodape e no menu do
     * hamburguer, que existe no HTML mesmo escondido — procurar na pagina
     * inteira acharia esses e nao mediria nada.
     */
    const dica = dock(page).getByText('Segurança contra incêndio', { exact: true })
    await expect(dica, 'a dica so existe enquanto o ponteiro esta no item').toHaveCount(0)

    await atalho.hover()
    await expect(
      dica,
      'o rotulo curto cabe no topo, mas so o completo diz o que a pagina e'
    ).toBeVisible()
  })
})

test.describe('Menu escrito sem JavaScript', () => {
  /*
   * O menu do topo e uma ilha React, e ilha que so existe depois do JS seria
   * uma navegacao que desaparece em conexao ruim, em navegador com script
   * bloqueado e para o rastreador de busca. O Astro renderiza a ilha no
   * servidor: os links chegam prontos no HTML, e o JS depois acrescenta
   * apenas a ampliacao no hover.
   *
   * Este teste existe para nao perder isso sem perceber — trocar `client:idle`
   * por um componente so-cliente passaria em todos os outros testes.
   */
  test.use({ javaScriptEnabled: false })
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 1200,
    'Abaixo de 1200px o menu fica atras do hamburguer'
  )

  test('os links do menu funcionam com o JavaScript desligado', async ({ page }) => {
    await page.goto('/')

    const menu = page.getByRole('navigation', { name: 'Navegação principal' })
    await expect(menu.getByRole('link')).toHaveCount(9)

    await menu.getByRole('link', { name: 'Contato' }).click()
    await expect(page).toHaveURL(/\/contato/)
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
