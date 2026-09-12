import { expect, test } from '@playwright/test'
import { razaoDeContraste } from '../src/lib/contraste'
import { congelarAnimacoes } from './ajudantes'

/**
 * Contraste do texto sobre as faixas ilustradas.
 *
 * A trava unitaria de src/lib/contraste.test.ts confere pares de cor da
 * paleta. Ela nao alcanca isto: quando ha desenho atras do texto, o fundo
 * efetivo deixa de ser a cor do bloco e passa a ser o que o navegador
 * compoe. Um desenho claro no lugar errado derruba o contraste sem quebrar
 * teste nenhum.
 *
 * Foi o que aconteceu na primeira versao das cenas: o subtitulo do /avcb
 * media 3.10:1 sobre a placa de saida da cena "rota", abaixo do minimo de
 * 4.5:1. Este teste existe para isso nao passar batido de novo.
 *
 * Importa principalmente para o futuro. As cenas vao ser trocadas pelas
 * fotos reais do cliente, e foto e muito mais clara que desenho.
 *
 * Como mede: esconde SO o elemento de texto, fotografa a area que ele
 * ocupava e pega o pixel mais claro. Texto claro sobre fundo escuro tem o
 * pior caso no ponto mais claro do fundo.
 */

const emHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`

const alvos: { rota: string; nome: string; seletor: string; minimo: number }[] = [
  { rota: '/', nome: 'titulo do hero', seletor: 'main h1', minimo: 4.5 },
  { rota: '/', nome: 'texto do hero', seletor: 'main section p', minimo: 4.5 },
  { rota: '/avcb', nome: 'titulo da pagina', seletor: 'main h1', minimo: 4.5 },
  { rota: '/avcb', nome: 'subtitulo', seletor: 'main section p', minimo: 4.5 },
  { rota: '/treinamentos', nome: 'titulo da pagina', seletor: 'main h1', minimo: 4.5 },
  { rota: '/treinamentos', nome: 'subtitulo', seletor: 'main section p', minimo: 4.5 },
  {
    rota: '/seguranca-contra-incendio',
    nome: 'titulo da pagina',
    seletor: 'main h1',
    minimo: 4.5,
  },
  { rota: '/documentacao-veicular', nome: 'titulo da pagina', seletor: 'main h1', minimo: 4.5 },
  { rota: '/documentacao-veicular', nome: 'subtitulo', seletor: 'main section p', minimo: 4.5 },
  { rota: '/empresas', nome: 'titulo da pagina', seletor: 'main h1', minimo: 4.5 },
  { rota: '/empresas', nome: 'subtitulo', seletor: 'main section p', minimo: 4.5 },
  { rota: '/regularizacoes', nome: 'titulo da pagina', seletor: 'main h1', minimo: 4.5 },
  { rota: '/regularizacoes', nome: 'subtitulo', seletor: 'main section p', minimo: 4.5 },
  { rota: '/sobre', nome: 'titulo da pagina', seletor: 'main h1', minimo: 4.5 },
  { rota: '/sobre', nome: 'subtitulo', seletor: 'main section p', minimo: 4.5 },
  { rota: '/contato', nome: 'titulo da pagina', seletor: 'main h1', minimo: 4.5 },
  { rota: '/contato', nome: 'subtitulo', seletor: 'main section p', minimo: 4.5 },
  { rota: '/artigos', nome: 'titulo da pagina', seletor: 'main h1', minimo: 4.5 },
  {
    rota: '/artigos/carregador-carro-eletrico-condominio',
    nome: 'titulo do artigo',
    seletor: 'main h1',
    minimo: 4.5,
  },
  {
    rota: '/carregadores-eletricos',
    nome: 'titulo da pagina',
    seletor: 'main h1',
    minimo: 4.5,
  },
]

test.describe('Contraste do texto sobre as faixas ilustradas', () => {
  for (const { rota, nome, seletor, minimo } of alvos) {
    test(`${rota} · ${nome}`, async ({ page }) => {
      await page.goto(rota)
      await congelarAnimacoes(page)

      const elemento = page.locator(seletor).first()
      const caixa = await elemento.boundingBox()
      /*
       * A cor sai pelo canvas, e nao por regex sobre `color`.
       *
       * `text-white/80` do Tailwind 4 compila para color-mix, e o navegador
       * devolve `oklab(0.999994 0.0000455677 0.0000200868 / 0.8)`. Um
       * `match(/\d+/g)` ali le "0", "999994", "0": lixo. O canvas aceita
       * qualquer formato de cor do CSS, devolve sRGB e entrega o alfa, que a
       * versao anterior ignorava.
       */
      const cor = await elemento.evaluate((e): [number, number, number, number] => {
        const tela = document.createElement('canvas').getContext('2d')
        if (!tela) return [255, 255, 255, 1]
        tela.fillStyle = getComputedStyle(e).color
        tela.fillRect(0, 0, 1, 1)
        const p = tela.getImageData(0, 0, 1, 1).data
        return [p[0] ?? 255, p[1] ?? 255, p[2] ?? 255, (p[3] ?? 255) / 255]
      })
      expect(caixa, `nao achei "${seletor}" em ${rota}`).not.toBeNull()
      if (!caixa) return

      await elemento.evaluate((e) => {
        ;(e as HTMLElement).style.visibility = 'hidden'
      })

      const captura = await page.screenshot({
        clip: {
          x: Math.max(0, caixa.x),
          y: Math.max(0, caixa.y),
          width: Math.max(2, caixa.width),
          height: Math.max(2, caixa.height),
        },
      })

      const fundoMaisClaro = await page.evaluate(async (dados) => {
        const imagem = new Image()
        imagem.src = `data:image/png;base64,${dados}`
        await imagem.decode()

        const tela = document.createElement('canvas')
        tela.width = imagem.width
        tela.height = imagem.height
        const contexto = tela.getContext('2d')
        if (!contexto) return [0, 0, 0] as [number, number, number]

        contexto.drawImage(imagem, 0, 0)
        const pixels = contexto.getImageData(0, 0, imagem.width, imagem.height).data

        let claro: [number, number, number] = [0, 0, 0]
        let maiorLuminancia = -1
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i] ?? 0
          const g = pixels[i + 1] ?? 0
          const b = pixels[i + 2] ?? 0
          const luminancia = 0.2126 * r + 0.7152 * g + 0.0722 * b
          if (luminancia > maiorLuminancia) {
            maiorLuminancia = luminancia
            claro = [r, g, b]
          }
        }
        return claro
      }, captura.toString('base64'))

      const fundo = emHex(fundoMaisClaro[0], fundoMaisClaro[1], fundoMaisClaro[2])

      // Texto com alfa nao e a cor declarada: e a mistura dela com o fundo.
      const [fr, fg, fb, alfa] = cor
      const frente = emHex(
        Math.round(alfa * fr + (1 - alfa) * fundoMaisClaro[0]),
        Math.round(alfa * fg + (1 - alfa) * fundoMaisClaro[1]),
        Math.round(alfa * fb + (1 - alfa) * fundoMaisClaro[2])
      )
      const razao = razaoDeContraste(frente, fundo)

      expect(
        razao,
        `${rota} · ${nome}: ${razao.toFixed(2)}:1 do texto ${frente} sobre o ponto mais claro do fundo (${fundo}), abaixo do minimo de ${minimo}:1`
      ).toBeGreaterThanOrEqual(minimo)
    })
  }
})
