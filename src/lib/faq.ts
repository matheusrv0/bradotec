import { getCollection } from 'astro:content'
import type { PaginaComFaq } from '@/content.config'
import { jsonLdFaq } from '@/lib/seo'

/**
 * Devolve o JSON-LD de FAQ da pagina, lendo a MESMA colecao que o componente
 * <Faq /> renderiza na tela.
 *
 * E essa unica fonte que garante que o Google e o visitante leiam sempre o
 * mesmo texto — o problema que existia na versao anterior do site.
 */
export async function schemaFaqDaPagina(pagina: PaginaComFaq) {
  const entradas = (await getCollection('faq', ({ data }) => data.paginas.includes(pagina))).sort(
    (x, y) => x.data.ordem - y.data.ordem
  )

  if (entradas.length === 0) return null

  return jsonLdFaq(
    entradas.map(({ data }) => ({ pergunta: data.pergunta, resposta: data.resposta }))
  )
}
