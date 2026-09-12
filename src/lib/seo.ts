import { ehPlaceholder, site } from '@/config/site'

/**
 * Geradores de JSON-LD (schema.org) — o bloco de dados que o Google le para
 * entender que a Bradotec e um negocio local, quais servicos oferece e qual
 * o caminho de navegacao da pagina.
 *
 * No site anterior esse bloco era escrito a mao em cada arquivo, e as
 * respostas do FAQ ficavam duplicadas entre o HTML visivel e o JSON-LD.
 * Aqui os dois saem da mesma fonte: nunca podem divergir.
 */

/** Campos placeholder nao vao para o schema: melhor ausente que falso. */
const soSePreenchido = (valor: string): string | undefined =>
  ehPlaceholder(valor) ? undefined : valor

/** Remove chaves cujo valor e undefined, para o JSON sair limpo. */
const semVazios = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>

export function jsonLdNegocioLocal(siteUrl: string) {
  return semVazios({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${site.nome}: ${site.descritivo}`,
    description: site.descricao,
    url: siteUrl,
    image: new URL('/og-bradotec.jpg', siteUrl).href,
    telephone: soSePreenchido(site.telefone),
    email: soSePreenchido(site.email),
    priceRange: '$$',
    address: semVazios({
      '@type': 'PostalAddress',
      streetAddress: soSePreenchido(site.endereco),
      /*
       * A cidade do ENDERECO, e nao a do mercado. A sede fica em Cabedelo, na
       * regiao metropolitana; o site fala de Joao Pessoa porque e por ali que
       * as pessoas procuram. Enquanto os dois eram um campo so, este endereco
       * ia para o Google com a cidade errada.
       *
       * `areaServed`, logo abaixo, continua sendo Joao Pessoa: e onde a
       * empresa atende, nao onde ela fica.
       */
      addressLocality: site.cidadeDoEndereco,
      addressRegion: site.estado,
      postalCode: soSePreenchido(site.cep),
      addressCountry: 'BR',
    }),
    areaServed: [
      { '@type': 'City', name: site.cidade },
      { '@type': 'State', name: 'Paraíba' },
    ],
    // Vazio ate o cliente informar a hora exata: 'Horario comercial' nao e
    // formato que o schema.org entenda, e dado estruturado invalido e pior
    // que dado ausente.
    openingHours: site.horarioEstruturado || undefined,
    sameAs: ehPlaceholder(site.instagram) ? undefined : [site.instagram],
  })
}

/**
 * A pessoa a frente da empresa, com a formacao declarada.
 *
 * Serve ao mesmo proposito que a secao visivel: e a unica prova de
 * autoridade que este site pode declarar hoje sem inventar nada. Nao entra
 * nota, avaliacao nem numero de clientes, que continuam placeholder.
 */
export function jsonLdPessoa(
  pessoa: {
    nome: string
    resumoCurto: string
    credenciais: readonly { titulo: string }[]
  },
  siteUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: pessoa.nome,
    description: pessoa.resumoCurto,
    worksFor: {
      '@type': 'Organization',
      name: `${site.nome}: ${site.descritivo}`,
      url: siteUrl,
    },
    hasCredential: pessoa.credenciais.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.titulo,
    })),
  }
}

/**
 * Artigo tecnico.
 *
 * `author` e a pessoa, e nao a empresa, de proposito: o Google trata artigo
 * assinado por quem tem credencial diferente de artigo institucional, e a
 * credencial ja esta declarada em /sobre pelo jsonLdPessoa.
 */
export function jsonLdArtigo(
  artigo: {
    titulo: string
    resumo: string
    data: string
    url: string
    autor: string
  },
  siteUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: artigo.titulo,
    description: artigo.resumo,
    inLanguage: 'pt-BR',
    datePublished: artigo.data,
    dateModified: artigo.data,
    mainEntityOfPage: { '@type': 'WebPage', '@id': new URL(artigo.url, siteUrl).href },
    author: { '@type': 'Person', name: artigo.autor },
    publisher: semVazios({
      '@type': 'Organization',
      name: `${site.nome}: ${site.descritivo}`,
      url: siteUrl,
      taxID: soSePreenchido(site.cnpj),
    }),
  }
}

export function jsonLdBreadcrumb(
  trilha: readonly { nome: string; href: string }[],
  siteUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trilha.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nome,
      item: new URL(item.href, siteUrl).href,
    })),
  }
}

export function jsonLdFaq(perguntas: readonly { pergunta: string; resposta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: perguntas.map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: p.resposta },
    })),
  }
}
