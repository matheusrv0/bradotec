/**
 * Cenas ilustradas das faixas escuras.
 *
 * O tipo mora aqui, e nao no componente, porque Astro nao permite importar
 * um tipo declarado no frontmatter de um `.astro`.
 */
export const cenas = ['fachada', 'rota', 'treinamento'] as const

export type Cena = (typeof cenas)[number]
