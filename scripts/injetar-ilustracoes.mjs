import { readFileSync, writeFileSync } from 'node:fs'

/**
 * Leva as quatro ilustracoes do arquivo avulso para a pagina do site.
 *
 * O desenho e o mesmo; o que muda e a paleta. O avulso usa as cores que o
 * cliente pediu para material de entrega (#7A0000), e o site usa as suas
 * (--color-wine #8e1c21). Manter duas copias escritas a mao divergiria na
 * primeira correcao, entao a copia e feita por script.
 */
const origem = 'artigos/save-condominios.html'
const destino = 'src/pages/artigos/carregador-carro-eletrico-condominio.astro'

const html = readFileSync(origem, 'utf8')

// Tira tambem a fonte: no avulso as ilustracoes usam system-ui, porque
// aquele arquivo nao tem dependencia; aqui elas herdam a fonte do site.
const paleta = [
  [/#7A0000/gi, '#8e1c21'], // vinho da marca no site
  [/#7A7A7A/gi, '#6e6668'], // --color-ash-500
  [/#2B2B2B/gi, '#1f1b1d'], // --color-ink
  [/ font-family="system-ui, sans-serif"/g, ''],
]

/** Recorta o <svg> que contem o id de titulo informado. */
function recortar(idTitulo) {
  const marca = html.indexOf(`id="${idTitulo}"`)
  if (marca < 0) throw new Error(`não achei ${idTitulo}`)
  const abre = html.lastIndexOf('<svg', marca)
  const fecha = html.indexOf('</svg>', marca) + '</svg>'.length
  let svg = html.slice(abre, fecha)
  for (const [de, para] of paleta) svg = svg.replace(de, para)
  return svg
}

const molduraLarga =
  'mx-auto block h-auto w-full max-w-[520px] rounded-xl border border-line bg-white'
const molduraPar =
  'block h-auto min-w-0 flex-1 basis-[260px] rounded-xl border border-line bg-white'

/** Troca o atributo class do <svg> por um do sistema do site. */
const vestir = (svg, classes) =>
  svg.replace(/\n?\s*class="diagrama"/, '').replace(/^<svg/, `<svg class="${classes}"`)

const figuras = {
  'FIG:MODOS': vestir(recortar('modos-t'), molduraLarga),
  'FIG:ERRADO': vestir(recortar('errado-t'), molduraPar),
  'FIG:CORRETO': vestir(recortar('correto-t'), molduraPar),
  'FIG:CIRCUITO': vestir(recortar('circuito-t'), molduraLarga),
  'FIG:PLANTA': vestir(recortar('planta-t'), molduraLarga),
}

let pagina = readFileSync(destino, 'utf8')
for (const [marcador, svg] of Object.entries(figuras)) {
  const alvo = `<!--${marcador}-->`
  if (!pagina.includes(alvo)) throw new Error(`marcador ${alvo} não está na página`)
  pagina = pagina.replace(alvo, svg)
}
writeFileSync(destino, pagina)

console.log(
  Object.entries(figuras)
    .map(([k, v]) => `${k}: ${v.length} bytes`)
    .join('\n')
)
