/**
 * Baixa, UMA vez, os icones que o site usa e grava em `src/data/icones.json`.
 *
 * O template carrega o componente `<iconify-icon>` do jsdelivr e depois busca
 * cada desenho na api.iconify.design, em tempo de execucao. Sao duas coisas
 * ruins de uma vez: todo icone do site depende de um servico de terceiros
 * estar no ar, e cada visita entrega o endereco de quem visita a dois dominios
 * que nao sao nossos. Este projeto ja decidiu contra isso quando passou a
 * servir a fonte do proprio dominio — o icone segue a mesma regra.
 *
 * Embutidos, os icones ocupam poucos kilobytes no HTML e dispensam os 20 KB do
 * componente mais uma ida a rede por icone.
 *
 * Rodar de novo so e necessario ao acrescentar icone novo:
 *
 *     node scripts/icones-bradotec.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const SAIDA = join(RAIZ, 'src/data/icones.json')

/**
 * Dois formatos, e os dois importam: o atributo escrito na tag
 * (`nome="lucide:mail"`) e o valor que vem de dado (`icone: 'lucide:mail'`
 * numa lista do frontmatter, passado depois como `nome={item.icone}`).
 *
 * A primeira versao deste script so olhava o atributo, e deixou 14 icones de
 * fora. Quem apontou foi o `pnpm typecheck`: o componente aceita apenas nome
 * que exista no JSON, entao icone faltando e erro de tipo, e nao um quadrado
 * vazio descoberto em producao.
 */
const PADROES = [
  /\b(?:icon|nome)="([a-z0-9-]+:[a-z0-9-]+)"/g,
  /\bicone:\s*['"]([a-z0-9-]+:[a-z0-9-]+)['"]/g,
]

async function nomesUsados(pasta) {
  const encontrados = new Set()

  for (const entrada of await readdir(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, entrada.name)

    if (entrada.isDirectory()) {
      for (const nome of await nomesUsados(caminho)) encontrados.add(nome)
      continue
    }
    if (!/\.(astro|ts|json)$/.test(entrada.name)) continue
    if (entrada.name === 'icones.json') continue

    const texto = await readFile(caminho, 'utf8')
    for (const padrao of PADROES) {
      for (const [, nome] of texto.matchAll(padrao)) encontrados.add(nome)
    }
  }

  return encontrados
}

const nomes = [...(await nomesUsados(join(RAIZ, 'src')))].sort()
if (nomes.length === 0) throw new Error('nenhum icone encontrado em src/')

/** Um pedido por colecao, e nao um por icone. */
const porColecao = new Map()
for (const nome of nomes) {
  const [colecao, icone] = nome.split(':')
  porColecao.set(colecao, [...(porColecao.get(colecao) ?? []), icone])
}

const icones = {}
for (const [colecao, lista] of porColecao) {
  const endereco = `https://api.iconify.design/${colecao}.json?icons=${lista.join(',')}`
  const resposta = await fetch(endereco)
  if (!resposta.ok) throw new Error(`${colecao}: HTTP ${resposta.status}`)
  const dados = await resposta.json()

  for (const icone of lista) {
    const achado = dados.icons?.[icone]
    if (!achado) throw new Error(`${colecao}:${icone} nao existe na colecao`)
    icones[`${colecao}:${icone}`] = {
      corpo: achado.body,
      // A colecao define a caixa; o icone pode sobrescrever.
      largura: achado.width ?? dados.width ?? 24,
      altura: achado.height ?? dados.height ?? 24,
    }
  }
  console.log(`${colecao}: ${lista.length} icone(s)`)
}

await writeFile(SAIDA, `${JSON.stringify(icones, null, 2)}\n`, 'utf8')
console.log(`gravado ${SAIDA} com ${Object.keys(icones).length} icones`)
