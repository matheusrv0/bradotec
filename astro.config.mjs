// @ts-check
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'

// URL publica do site. Usada para gerar canonical, Open Graph e sitemap.xml.
//
// O dominio da Bradotec esta escrito aqui, e nao so na variavel de ambiente do
// deploy, por um motivo pratico: variavel esquecida no painel nao quebra o
// build, ela publica o site inteiro apontando para um dominio de exemplo e
// fechado para robo. Falha silenciosa em site institucional pode passar semanas
// sem ninguem perceber, e o prejuizo e nao existir na busca.
//
// SITE_URL continua valendo por cima, para previa em outro endereco.
//
// A trava de indexacao (BaseLayout, LayoutStudiova e robots.txt) dispara
// quando o endereco e dominio-do-cliente.example. Ela nao some: existe para o
// proximo cliente que comecar deste projeto, e continua valendo para ele.
const SITE_URL = process.env.SITE_URL ?? 'https://bradotec.com.br'

export default defineConfig({
  site: SITE_URL,

  // 'static' = paginas viram HTML pronto no build. Sem servidor rodando,
  // sem custo por acesso e a pagina abre instantaneamente.
  output: 'static',

  integrations: [
    react(),
    // Gera sitemap.xml automaticamente a partir das paginas existentes.
    //
    // /links fica de fora: ela e o link da bio do Instagram, sai com
    // `noindex` no HTML, e pagina pedida para nao ser indexada nao deve estar
    // no mapa que pede indexacao. Os dois juntos sao instrucoes contrarias.
    sitemap({ filter: (pagina) => !pagina.endsWith('/links/') }),
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
