import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import artigos from './artigos.json' with { type: 'json' }

/**
 * Trava entre a colecao de artigos e as paginas.
 *
 * Numa colecao de markdown o Astro geraria a rota a partir do arquivo, e um
 * artigo sem pagina seria impossivel. Aqui o texto mora numa pagina `.astro`
 * separada, porque artigo com ilustracao precisa de componente e SVG inline.
 * O preco disso e que os dois lados podem sair de sincronia em silencio:
 * uma entrada no indice apontando para 404, ou uma pagina que o indice nunca
 * lista.
 *
 * Este teste paga esse preco. Roda em milissegundos e falha antes do build.
 */
describe('artigos', () => {
  const pasta = resolve(import.meta.dirname, '../pages/artigos')

  it.each(artigos)('$slug tem uma página em src/pages/artigos', ({ slug }) => {
    expect(
      existsSync(resolve(pasta, `${slug}.astro`)),
      `a coleção lista "${slug}", mas src/pages/artigos/${slug}.astro não existe`
    ).toBe(true)
  })

  it('o id e o slug de cada artigo são iguais', () => {
    // O indice ordena pela colecao e linka pelo slug. Se os dois divergirem,
    // fica dificil achar o arquivo a partir do que aparece na URL.
    for (const artigo of artigos) {
      expect(artigo.id, `id e slug diferentes em "${artigo.titulo}"`).toBe(artigo.slug)
    }
  })

  it('não há dois artigos com o mesmo slug', () => {
    const slugs = artigos.map((a) => a.slug)
    expect(new Set(slugs).size, `slug repetido em ${slugs.join(', ')}`).toBe(slugs.length)
  })
})
