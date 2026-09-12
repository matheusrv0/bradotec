import type { APIRoute } from 'astro'

/**
 * Gera o robots.txt no build, usando a URL definida em astro.config.mjs.
 *
 * Antes esse arquivo era escrito a mao com o dominio fixo dentro — e o
 * dominio aparecia como placeholder em varios arquivos, exigindo troca
 * manual em cada um no dia da publicacao. Aqui ele acompanha o config.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href

  /**
   * Enquanto SITE_URL for o placeholder, o site esta em previa: fecha para
   * robo. Vale o mesmo motivo da trava no BaseLayout — um link de teste
   * indexado com os dados do cliente em [COLCHETES] da trabalho para tirar.
   */
  const emPrevia = (site?.href ?? '').includes('dominio-do-cliente.example')

  const corpo = emPrevia
    ? `User-agent: *
Disallow: /
`
    : `User-agent: *
Allow: /

Sitemap: ${sitemap}
`

  return new Response(corpo, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
