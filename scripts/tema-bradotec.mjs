/**
 * Gera `public/studiova/css/styles-bradotec.css` a partir do CSS original do
 * template Studiova, trocando a paleta dele pela identidade da BRADOTEC.
 *
 * A COR VEM DO @theme DA MAIN
 * O vinho `#8E1C21` e o grafite `#201C1E` sao os mesmos tokens que
 * `src/styles/global.css` ja define. Assim o template e o site compartilham
 * uma unica fonte de cor: mudar la muda aqui, rodando o script de novo.
 *
 * POR QUE UM SCRIPT, E NAO EDITAR O CSS NA MAO
 * O `styles.css` do template tem 354 KB e ja vem compilado (o Bootstrap
 * inteiro dentro dele). Editar a mao seria irrepetivel e impossivel de
 * revisar. Aqui o arquivo do template fica intacto como veio, e o tema sai
 * de uma tabela de equivalencias que da para ler e discutir.
 *
 * Rode com:  node scripts/tema-bradotec.mjs
 *
 * A TABELA DE EQUIVALENCIAS
 * As cores da esquerda sao do Studiova; as da direita saem do `@theme` em
 * `src/styles/global.css` e do guia de identidade em
 * `legacy/documentacao/01-estrategia-arquitetura-identidade.md`.
 *
 * Os tons intermediarios (`#daffaa`, `#353f43`...) nao foram escolhidos a
 * dedo: o Bootstrap os gera misturando a cor base com branco ou preto em
 * porcentagens fixas. Aqui eles foram recalculados na mesma porcentagem,
 * partindo do vermelho e do azul-marinho da Bradotec — por isso a escala
 * continua coerente.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const origem = join(raiz, 'public/studiova/css/styles.css')
const destino = join(raiz, 'public/studiova/css/styles-bradotec.css')
const pastaImagens = join(raiz, 'public/studiova/images')

/** Cores base: Studiova -> Bradotec. */
const BASE = {
  // Acento: o vinho da marca, ja definido em src/styles/global.css.
  '#c1ff72': '#8E1C21',
  // Secoes escuras e titulos: o grafite quente da main.
  '#1f2a2e': '#201C1E',
  // Fundo claro de secao.
  '#f4f8fa': '#F7F5F5',
  // Cinza claro de bordas e botoes secundarios.
  '#e4e5e6': '#E4E0E1',
  // Texto apagado.
  '#797f82': '#6E6668',
  // Texto corrido.
  '#626a6d': '#554E51',
}

/**
 * Tons que o Bootstrap derivou das cores base. A porcentagem no comentario
 * e quanto de branco (tint) ou preto (shade) entrou na mistura.
 */
const DERIVADOS = {
  // --- derivados do acento ---
  '#c7ff80': '#972E33', //  8% branco
  '#daffaa': '#BB777A', // 40% branco
  '#e0ffb9': '#C38789', // 47% branco
  '#e1ffbb': '#C38789', // 47% branco
  '#ecffd5': '#D7B0B1', // 65% branco
  '#f3ffe3': '#E8D2D3', // 80% branco
  '#a4d961': '#741418', // 15% preto (= --color-wine-dark)
  // --- derivados do fundo escuro ---
  '#353f43': '#363334', // 10% branco
  '#4c5558': '#484546', // 18% branco
  '#4e5557': '#484546', // 18% branco
  '#616668': '#585556', // 25% branco
  '#192225': '#171415', // 20% preto (= --color-graphite-950)
  '#b6b7b8': '#C1BFC0', // 72% branco
  '#d2d4d5': '#D7D6D6', // 82% branco
  // --- derivados do fundo claro ---
  '#f6f9fb': '#FBFAFA',
  '#f5f9fb': '#FBFAFA',
}

/** Triplas RGB que o Bootstrap usa para montar cores com transparencia. */
const RGB = {
  '193, 255, 114': '142, 28, 33', // acento
  '31, 42, 46': '32, 28, 30', // fundo escuro
  '244, 248, 250': '247, 245, 245', // fundo claro
  '228, 229, 230': '228, 224, 225', // cinza claro
  '121, 127, 130': '110, 102, 104', // texto apagado
  '98, 106, 109': '85, 78, 81', // texto corrido
  '164, 217, 97': '116, 20, 24', // acento escurecido
  '218, 255, 170': '187, 119, 122', // acento clareado
  '225, 255, 187': '195, 135, 137', // acento clareado
}

let css = readFileSync(origem, 'utf8')

/**
 * A fonte sai do @import do Google e passa a ser a variavel que o Astro
 * serve do nosso proprio dominio. Sem isso o navegador do visitante faria um
 * pedido ao Google a cada acesso — o projeto ja evita isso de proposito.
 */
css = css.replace(/@import url\("https:\/\/fonts\.googleapis\.com[^"]*"\);\n?/g, '')
css = css.replace(
  /"Manrope",\s*sans-serif/g,
  'var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif'
)

/** Aplica as trocas, das mais especificas para as mais genericas. */
const trocas = [...Object.entries(RGB), ...Object.entries(DERIVADOS), ...Object.entries(BASE)]

for (const [de, para] of trocas) {
  // Hex casa sem diferenciar maiuscula de minuscula; RGB casa literal.
  const ehHex = de.startsWith('#')
  const padrao = new RegExp(de.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), ehHex ? 'gi' : 'g')
  css = css.replace(padrao, para)
}

const cabecalho = `/*
 * GERADO POR scripts/tema-bradotec.mjs — NAO EDITAR A MAO.
 *
 * Template Studiova (Bootstrap 5.3) com a paleta e a tipografia da BRADOTEC.
 * Para mudar uma cor, edite a tabela no script e rode-o de novo.
 *
 * As regras que este arquivo nao consegue expressar (texto branco sobre o
 * vermelho, superficies grandes que nao podem ser vermelhas) estao em
 * public/studiova/css/bradotec-ajustes.css, carregado logo depois deste.
 */
`

writeFileSync(destino, cabecalho + css)
console.log(`tema gerado: ${destino}`)
console.log(`${trocas.length} equivalencias aplicadas`)

/**
 * Os SVGs do template (a folha que gira, o + e o x do acordeao, o desenho da
 * 404) trazem a cor gravada dentro do arquivo — nenhum CSS alcanca isso.
 *
 * Aqui eles sao reescritos no lugar. A operacao pode ser repetida sem risco:
 * as cores da Bradotec nao aparecem do lado esquerdo da tabela, entao rodar
 * de novo nao muda mais nada.
 */
function listarSvgs(pasta) {
  const achados = []
  for (const entrada of readdirSync(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, entrada.name)
    if (entrada.isDirectory()) achados.push(...listarSvgs(caminho))
    else if (entrada.name.endsWith('.svg')) achados.push(caminho)
  }
  return achados
}

let svgsAlterados = 0
for (const arquivo of listarSvgs(pastaImagens)) {
  const antes = readFileSync(arquivo, 'utf8')
  let depois = antes
  for (const [de, para] of [...Object.entries(DERIVADOS), ...Object.entries(BASE)]) {
    depois = depois.replace(new RegExp(de, 'gi'), para)
  }
  if (depois !== antes) {
    writeFileSync(arquivo, depois)
    svgsAlterados++
  }
}
console.log(`${svgsAlterados} SVG(s) recoloridos`)
