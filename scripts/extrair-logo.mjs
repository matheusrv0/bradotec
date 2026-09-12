/**
 * Extrai a marca Bradotec do arquivo que o cliente mandou.
 *
 * O original e uma imagem de WhatsApp: 720x1280, marca branca sobre um fundo
 * vinho chapado. Nao da para usar assim em lugar nenhum, porque o retangulo
 * vinho apareceria em volta do logo dentro do cabecalho grafite.
 *
 * Como a marca e branca sobre uma cor solida, cada pixel e uma mistura
 * conhecida: p = a * branco + (1 - a) * fundo. Da para inverter e recuperar o
 * alfa que a imagem perdeu ao ser achatada, inclusive nas bordas
 * suavizadas. E isso que preserva a curva do escudo e o serifado do "tec".
 *
 * Saidas:
 *   marca/logo-bradotec.png   lockup inteiro, branco sobre transparente
 *   marca/simbolo.png         so o escudo, branco sobre transparente
 *   public/favicon-32.png     escudo branco sobre quadrado vinho
 *   public/apple-touch-icon.png
 *   public/og-bradotec.jpg    lockup centralizado sobre vinho, 1200x630
 *
 * Rodar de novo so se o cliente mandar outro arquivo de marca:
 *   node scripts/extrair-logo.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const FONTE = 'src/assets/marca/logo-fonte.jpg'

const { data, info } = await sharp(FONTE).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: L, height: A, channels: C } = info

/** Cor do fundo, lida de um canto onde nao ha marca. */
const em = (x, y) => {
  const i = (y * L + x) * C
  return [data[i], data[i + 1], data[i + 2]]
}
const fundo = em(4, 4)
console.log('fundo vinho:', fundo.map((v) => v.toString(16).padStart(2, '0')).join(''))

/**
 * Alfa recuperado. Usa os canais com maior amplitude entre o fundo e o
 * branco: no vinho o verde e o azul vao de ~15 a 255, enquanto o vermelho
 * ja parte de ~107 e teria um terco da resolucao.
 */
const alfa = new Float32Array(L * A)
for (let p = 0; p < L * A; p++) {
  const i = p * C
  let soma = 0
  for (const canal of [1, 2]) {
    const base = fundo[canal]
    soma += Math.min(1, Math.max(0, (data[i + canal] - base) / (255 - base)))
  }
  const a = soma / 2
  // Corta o ruido de JPEG do fundo, que fica em torno de 1 a 2 por cento.
  alfa[p] = a < 0.04 ? 0 : a
}

/** Menor retangulo que contem tudo que nao e fundo. */
function recorte(x0, x1) {
  let cima = A
  let baixo = -1
  let esq = x1
  let dir = -1
  for (let y = 0; y < A; y++) {
    for (let x = x0; x < x1; x++) {
      if (alfa[y * L + x] > 0.35) {
        if (y < cima) cima = y
        if (y > baixo) baixo = y
        if (x < esq) esq = x
        if (x > dir) dir = x
      }
    }
  }
  return { esq, dir, cima, baixo }
}

const todo = recorte(0, L)
console.log('lockup:', todo)

/**
 * Onde termina o escudo. Varre da esquerda para a direita procurando a
 * primeira coluna vazia depois de comecar a marca: e o respiro entre o
 * simbolo e a palavra BRADO.
 */
let fimDoSimbolo = todo.dir
let viuMarca = false
for (let x = todo.esq; x <= todo.dir; x++) {
  let temPixel = false
  for (let y = todo.cima; y <= todo.baixo && !temPixel; y++) {
    if (alfa[y * L + x] > 0.35) temPixel = true
  }
  if (temPixel) viuMarca = true
  else if (viuMarca) {
    fimDoSimbolo = x - 1
    break
  }
}
const simbolo = recorte(todo.esq, fimDoSimbolo + 1)
console.log('simbolo:', simbolo, '(corte em x =', fimDoSimbolo, ')')

/** Monta um PNG branco com o alfa recuperado, dentro do retangulo dado. */
function branco({ esq, dir, cima, baixo }, folgaPct = 0.02) {
  const folgaX = Math.round((dir - esq + 1) * folgaPct)
  const folgaY = Math.round((baixo - cima + 1) * folgaPct)
  const x0 = Math.max(0, esq - folgaX)
  const x1 = Math.min(L - 1, dir + folgaX)
  const y0 = Math.max(0, cima - folgaY)
  const y1 = Math.min(A - 1, baixo + folgaY)
  const l = x1 - x0 + 1
  const a = y1 - y0 + 1
  const saida = Buffer.alloc(l * a * 4)
  for (let y = 0; y < a; y++) {
    for (let x = 0; x < l; x++) {
      const j = (y * l + x) * 4
      saida[j] = 255
      saida[j + 1] = 255
      saida[j + 2] = 255
      saida[j + 3] = Math.round(alfa[(y + y0) * L + (x + x0)] * 255)
    }
  }
  return { buffer: saida, largura: l, altura: a }
}

async function gravarPng(destino, { buffer, largura, altura }, escala = 1) {
  const img = sharp(buffer, { raw: { width: largura, height: altura, channels: 4 } })
  if (escala !== 1) img.resize({ width: Math.round(largura * escala), fit: 'inside' })
  await img.png({ compressionLevel: 9 }).toFile(destino)
  console.log('gravado', destino)
}

await mkdir('src/assets/marca', { recursive: true })

const lockup = branco(todo)
const marca = branco(simbolo)

// O original tem 720px de largura. Dobrar mantem nitidez em telas 2x sem
// inventar detalhe: o upscale e feito pelo Lanczos do sharp, e a marca e
// vetorial de origem, entao nao ha textura para borrar.
await gravarPng('src/assets/marca/logo-bradotec.png', lockup, 2)
await gravarPng('src/assets/marca/simbolo.png', marca, 2)

/**
 * Icone: escudo branco centralizado num quadrado vinho.
 *
 * O vinho e o do site (--color-wine), nao o do arquivo enviado. Sao dois
 * vermelhos diferentes: o arquivo do cliente tem #610506 de fundo, e o site
 * usa #8e1c21, tirado das letras da logo anterior. Proximos o bastante para
 * parecerem erro se aparecessem lado a lado, e a aba do navegador aparece
 * lado a lado com a pagina. O cliente escolheu manter o do site.
 *
 * Se --color-wine mudar em global.css, mudar aqui e rodar o script de novo.
 */
const vinho = { r: 0x8e, g: 0x1c, b: 0x21 }
async function icone(destino, lado) {
  const interno = Math.round(lado * 0.68)
  const escudo = await sharp(marca.buffer, {
    raw: { width: marca.largura, height: marca.altura, channels: 4 },
  })
    .resize({ height: interno, fit: 'inside' })
    .png()
    .toBuffer()

  await sharp({
    create: { width: lado, height: lado, channels: 4, background: { ...vinho, alpha: 1 } },
  })
    .composite([{ input: escudo, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(destino)
  console.log('gravado', destino, `${lado}x${lado}`)
}

await icone('public/favicon-32.png', 32)
await icone('public/apple-touch-icon.png', 180)

/**
 * favicon.ico, com PNG dentro.
 *
 * O `.ico` e o primeiro `<link rel="icon">` do layout, e alguns navegadores
 * preferem ele ao PNG; alem disso muito rastreador pede `/favicon.ico` pelo
 * caminho, exista link ou nao. Sem regerar, a aba continuaria mostrando o
 * escudo vermelho da marca antiga ao lado do site novo.
 *
 * O sharp nao escreve ICO, mas o formato aceita um PNG inteiro como carga
 * desde o Windows Vista, e todo navegador atual le. O container e so um
 * cabecalho de 6 bytes mais uma entrada de 16 por tamanho.
 */
async function gravarIco(destino, lados) {
  const imagens = []
  for (const lado of lados) {
    const interno = Math.round(lado * 0.68)
    const escudo = await sharp(marca.buffer, {
      raw: { width: marca.largura, height: marca.altura, channels: 4 },
    })
      .resize({ height: interno, fit: 'inside' })
      .png()
      .toBuffer()
    const png = await sharp({
      create: { width: lado, height: lado, channels: 4, background: { ...vinho, alpha: 1 } },
    })
      .composite([{ input: escudo, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toBuffer()
    imagens.push({ lado, png })
  }

  const cabecalho = Buffer.alloc(6)
  cabecalho.writeUInt16LE(0, 0) // reservado
  cabecalho.writeUInt16LE(1, 2) // 1 = icone
  cabecalho.writeUInt16LE(imagens.length, 4)

  const entradas = []
  let deslocamento = 6 + imagens.length * 16
  for (const { lado, png } of imagens) {
    const e = Buffer.alloc(16)
    e.writeUInt8(lado >= 256 ? 0 : lado, 0)
    e.writeUInt8(lado >= 256 ? 0 : lado, 1)
    e.writeUInt8(0, 2) // paleta
    e.writeUInt8(0, 3) // reservado
    e.writeUInt16LE(1, 4) // planos
    e.writeUInt16LE(32, 6) // bits por pixel
    e.writeUInt32LE(png.length, 8)
    e.writeUInt32LE(deslocamento, 12)
    deslocamento += png.length
    entradas.push(e)
  }

  await writeFile(destino, Buffer.concat([cabecalho, ...entradas, ...imagens.map((i) => i.png)]))
  console.log('gravado', destino, lados.join('/'))
}

await gravarIco('public/favicon.ico', [16, 32, 48])

/** Imagem de compartilhamento: lockup centralizado sobre o vinho. */
const lockupOg = await sharp(lockup.buffer, {
  raw: { width: lockup.largura, height: lockup.altura, channels: 4 },
})
  .resize({ width: 760, fit: 'inside' })
  .png()
  .toBuffer()

await sharp({
  create: { width: 1200, height: 630, channels: 4, background: { ...vinho, alpha: 1 } },
})
  .composite([{ input: lockupOg, gravity: 'center' }])
  .jpeg({ quality: 90 })
  .toFile('public/og-bradotec.jpg')
console.log('gravado public/og-bradotec.jpg 1200x630')

await writeFile(
  'src/assets/marca/LEIA-ME.md',
  [
    '# Marca Bradotec',
    '',
    '`logo-fonte.jpg` e o arquivo original enviado pelo cliente: marca branca',
    'sobre fundo vinho, 720x1280, exportado do WhatsApp.',
    '',
    'Tudo mais nesta pasta e derivado dele por `scripts/extrair-logo.mjs`. Nao',
    'editar a mao: rodar o script de novo.',
    '',
    '| Arquivo | O que e |',
    '|---|---|',
    '| `logo-bradotec.png` | Lockup inteiro, branco sobre transparente. Cabecalho e rodape. |',
    '| `simbolo.png` | So o escudo, branco sobre transparente. |',
    '| `../../../public/favicon-32.png` | Escudo branco em quadrado vinho. |',
    '| `../../../public/apple-touch-icon.png` | O mesmo, 180x180. |',
    '| `../../../public/og-bradotec.jpg` | Lockup sobre vinho, 1200x630, compartilhamento. |',
    '',
    '## O que ainda falta',
    '',
    'O original e um JPEG de mensageiro, nao o arquivo de origem. Se o cliente',
    'tiver o vetor (`.ai`, `.svg`, `.eps`), ele deve substituir `logo-fonte.jpg`:',
    'a marca ficaria nitida em qualquer tamanho e o favicon pararia de depender',
    'de um upscale.',
    '',
  ].join('\n')
)
console.log('gravado src/assets/marca/LEIA-ME.md')
