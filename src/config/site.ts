import { z } from 'zod'

/**
 * CONFIGURACAO DO CLIENTE — unico arquivo a editar para trocar de cliente.
 *
 * Tudo entre [COLCHETES] ainda e placeholder. O site nao inventa dado:
 * enquanto o valor estiver assim, ele aparece marcado como pendente em vez
 * de exibir informacao falsa.
 *
 * O schema Zod abaixo confere os dados durante o build. Se voce digitar um
 * WhatsApp com letra no meio, o build falha na hora — em vez de o site ir ao
 * ar com um botao quebrado.
 */

/** Marca um valor ainda nao preenchido pelo cliente. */
export const ehPlaceholder = (valor: string): boolean =>
  valor.trim().startsWith('[') && valor.trim().endsWith(']')

/** Aceita o dado real OU um placeholder declarado — nunca lixo silencioso. */
const textoOuPlaceholder = (mensagemSeInvalido: string, regexReal: RegExp) =>
  z.string().refine((v) => ehPlaceholder(v) || regexReal.test(v), {
    message: mensagemSeInvalido,
  })

const siteSchema = z.object({
  /** Nome curto, usado em titulos e no schema.org. */
  nome: z.string().min(1),
  /** Descritivo que acompanha a marca no cabecalho. */
  descritivo: z.string().min(1),
  /** Frase de uma linha usada como meta description padrao. */
  descricao: z.string().min(50).max(300),

  /** So digitos: codigo do pais + DDD + numero. Ex.: 5583999998888 */
  whatsapp: textoOuPlaceholder(
    'WhatsApp deve conter apenas digitos: pais + DDD + numero (ex.: 5583999998888)',
    /^\d{12,13}$/
  ),
  telefone: z.string().min(1),
  email: textoOuPlaceholder('E-mail invalido', /^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  endereco: z.string().min(1),
  bairro: z.string().min(1),
  /**
   * Cidade do MERCADO, nao a do endereco. Sai nos titulos, no texto e no
   * geo.placename: e por 'Joao Pessoa' que as pessoas procuram.
   */
  cidade: z.string().min(1),
  /**
   * Cidade do ENDERECO POSTAL. A sede fica em Cabedelo, na regiao
   * metropolitana, e nao na capital. Os dois campos existiam como um so, e
   * isso mandava para o Google um endereco em Joao Pessoa que nao existe:
   * addressLocality errado e dado falso, nao licenca poetica.
   */
  cidadeDoEndereco: z.string().min(1),
  estado: z.string().length(2),
  cep: z.string().min(1),
  cnpj: z.string().min(1),
  horario: z.string().min(1),
  /**
   * O mesmo horario no formato que o schema.org entende ('Mo-Fr 08:00-18:00').
   * Vazio enquanto o cliente nao informar a hora exata: 'Horario comercial'
   * serve para pessoa ler, mas como openingHours e dado estruturado invalido,
   * e dado invalido e pior que dado ausente.
   */
  horarioEstruturado: z.string().default(''),
  instagram: z.string().min(1),

  /** Area geografica atendida — alimenta o SEO local. */
  regiaoAtendida: z.string().min(1),

  /**
   * Prova social. NUNCA preencher com numero estimado.
   * Enquanto for placeholder, a faixa de numeros nem aparece no site.
   */
  provaSocial: z.object({
    clientes: z.string(),
    processos: z.string(),
    condominios: z.string(),
    notaGoogle: z.string(),
  }),

  /** Depoimentos reais. Lista vazia = secao nao renderiza. */
  depoimentos: z
    .array(z.object({ texto: z.string().min(1), autor: z.string().min(1) }))
    .default([]),

  /** IDs de campanha. Vazio = nenhum script de terceiro e carregado. */
  googleAdsId: z.string().default(''),
  ga4Id: z.string().default(''),
  cloudflareAnalyticsToken: z.string().default(''),
})

export type Site = z.infer<typeof siteSchema>

export const site = siteSchema.parse({
  nome: 'Bradotec',
  descritivo: 'Despachadoria & Soluções Documentais',
  descricao:
    'Despachadoria e soluções documentais em João Pessoa/PB. Regularização de empresas, ' +
    'condomínios e imóveis, licenças, segurança contra incêndio e pânico e documentação ' +
    'veicular, com acompanhamento de processo do início ao fim.',

  /*
   * DDD 65 e Mato Grosso, e a empresa e da Paraiba. Nao e engano: foi
   * levantado duas vezes e confirmado pelo cliente em 22/09/2026. Fica
   * escrito aqui para ninguem "corrigir" de volta para 83.
   */
  whatsapp: '5565998094616',
  telefone: '(65) 99809-4616',
  email: 'obradotec@gmail.com',
  endereco: 'Rua Antônio Francisco de Araújo, 29',
  bairro: 'Parque Esperança',
  cidade: 'João Pessoa',
  cidadeDoEndereco: 'Cabedelo',
  estado: 'PB',
  cep: '58108-646',
  cnpj: '55.626.613/0001-20',
  horario: 'Horário comercial',
  horarioEstruturado: '',
  instagram: 'https://www.instagram.com/brado.tec',
  regiaoAtendida: 'João Pessoa e região metropolitana, na Paraíba',

  provaSocial: {
    clientes: '[Nº]',
    processos: '[Nº]',
    condominios: '[Nº]',
    notaGoogle: '[NOTA]',
  },

  depoimentos: [],

  googleAdsId: '',
  ga4Id: '',
  cloudflareAnalyticsToken: '',
} satisfies z.input<typeof siteSchema>)

/**
 * O @ do Instagram, derivado do link.
 *
 * Guardar o link e o arroba em dois campos seria guardar a mesma informacao
 * duas vezes, e um dos dois envelheceria. O link e a fonte, porque e dele que
 * o JSON-LD precisa.
 */
export const instagramUsuario = ehPlaceholder(site.instagram)
  ? site.instagram
  : `@${site.instagram.replace(/\/+$/, '').split('/').pop()}`

/** Endereco em uma linha, do jeito que se escreve num envelope. */
export const enderecoCompleto = ehPlaceholder(site.endereco)
  ? site.endereco
  : [
      site.endereco,
      site.bairro,
      `${site.cidadeDoEndereco} - ${site.estado}`,
      `CEP ${site.cep}`,
    ].join(', ')
