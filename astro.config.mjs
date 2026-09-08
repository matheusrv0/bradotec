// @ts-check
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'

// URL publica do site. Usada para gerar canonical, Open Graph e sitemap.xml.
// TROCAR pelo dominio real do cliente (ou definir SITE_URL no ambiente do deploy).
const SITE_URL = process.env.SITE_URL ?? 'https://dominio-do-cliente.example'

export default defineConfig({
  site: SITE_URL,

  // 'static' = paginas viram HTML pronto no build. Sem servidor rodando,
  // sem custo por acesso e a pagina abre instantaneamente.
  output: 'static',

  integrations: [
    react(),
    // Gera sitemap.xml automaticamente a partir das paginas existentes.
    sitemap(),
  ],

  // Baixa a fonte no build e serve do nosso proprio dominio.
  // Sem isso, o navegador do visitante faria um pedido ao Google a cada acesso:
  // mais lento e com dado do visitante saindo para terceiro.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-plus-jakarta',
      // 500 nunca foi usado e 600 aparecia cinco vezes no site inteiro.
      // Cada peso e um arquivo que o visitante baixa.
      weights: [400, 700, 800],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      // Fonte dos titulos.
      //
      // O site inteiro usava uma familia so, e isso e o que faz uma pagina
      // bem feita parecer template: nada distingue o que a pagina DIZ do que
      // ela E.
      //
      // A primeira escolha foi Chivo, pela semelhanca com o wordmark da
      // marca. O cliente leu e reprovou: densa demais, cansa. Ele tem razao,
      // e o erro foi meu — escolhi pelo parentesco com a logo e julguei no
      // tamanho de manchete, onde peso vira presenca. Num h2 que se repete
      // seis vezes por pagina, peso vira ruido.
      //
      // Instrument Sans entrou no lugar por medida, nao por gosto: aberturas
      // largas, contraste baixo, e mais estreita que Archivo, o que importa
      // porque manchete em portugues e longa. Testadas junto e descartadas:
      // Archivo (neutra, e uma linha a mais), Manrope e Onest (macias demais
      // para norma tecnica), Bricolage (character demais).
      provider: fontProviders.google(),
      name: 'Instrument Sans',
      cssVariable: '--font-instrument',
      weights: [600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],

    // O Vite recusa requisicao vinda de um dominio que ele nao conhece — e
    // uma protecao real contra DNS rebinding, nao um capricho. Liberamos so
    // os tuneis de previa da Cloudflare, usados para mostrar o site a quem
    // esta longe antes de existir dominio proprio.
    //
    // Vale exclusivamente para os servidores locais (`astro dev` e
    // `astro preview`). O site publicado e HTML estatico servido pela
    // Cloudflare Pages: nao passa por aqui.
    server: { allowedHosts: ['.trycloudflare.com'] },
    preview: { allowedHosts: ['.trycloudflare.com'] },
  },
})
