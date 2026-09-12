import { defineCollection } from 'astro:content'
import { file } from 'astro/loaders'
import { z } from 'zod'

/**
 * CONTENT COLLECTIONS — o conteudo editorial do site.
 *
 * Por que isto existe: no site anterior as 11 perguntas do FAQ estavam
 * escritas em 33 lugares do HTML e repetidas de novo dentro do JSON-LD de
 * cada pagina — cerca de 66 copias dos mesmos 11 textos. Corrigir uma
 * resposta exigia acertar todas; esquecer uma fazia o Google ler uma coisa
 * e o visitante ler outra.
 *
 * Agora a resposta e escrita uma vez. A pagina e o JSON-LD saem da MESMA
 * fonte: por construcao, nao podem divergir.
 *
 * O schema Zod confere o conteudo durante o build. Se alguem escrever uma
 * pergunta sem resposta, ou apontar para uma pagina que nao existe, o build
 * falha — em vez de o site ir ao ar com um bloco vazio.
 */

/** Paginas que podem exibir um FAQ. */
export const paginasComFaq = [
  'home',
  'solucoes',
  'regularizacoes',
  'seguranca-contra-incendio',
  'documentacao-veicular',
  'empresas',
  'avcb',
  'treinamentos',
  'carregadores-eletricos',
] as const

export type PaginaComFaq = (typeof paginasComFaq)[number]

const faq = defineCollection({
  loader: file('src/content/faq.json'),
  schema: z.object({
    pergunta: z.string().min(10),
    /**
     * Limite de 60 a 900 caracteres: abaixo disso a resposta nao informa,
     * acima disso o Google costuma cortar no resultado destacado.
     */
    resposta: z.string().min(60).max(900),
    /** Em quais paginas esta pergunta aparece. */
    paginas: z.array(z.enum(paginasComFaq)).min(1),
    /**
     * Ordem de exibicao. Opcional: sem ela a pergunta cai no fim, e ali as
     * empatadas mantem a ordem que o Astro devolve, que e alfabetica por id.
     * Existe porque a ordem do FAQ e argumento: a pergunta que derruba a
     * objecao principal precisa vir antes da curiosidade.
     */
    ordem: z.number().int().positive().default(99),
  }),
})

/** As tres divisoes comerciais. Aparecem em /solucoes e no rodape das paginas. */
export const idsDivisao = ['fire', 'documentos', 'auto'] as const
export type IdDivisao = (typeof idsDivisao)[number]

/**
 * Cores por divisao. Sao chaves, nao classes: o componente traduz para uma
 * classe literal, porque o Tailwind nao enxerga nome de classe montado em
 * tempo de execucao.
 */
const coresDivisao = ['fire', 'doc', 'auto'] as const

const divisoes = defineCollection({
  loader: file('src/content/divisoes.json'),
  schema: z.object({
    /** Nome comercial, ex.: "Bradotec Fire". */
    marca: z.string().min(3),
    titulo: z.string().min(10),
    resumo: z.string().min(30).max(240),
    href: z.string().startsWith('/'),
    cor: z.enum(coresDivisao),
    /** Chave de mensagem em src/config/whatsapp.ts. */
    origemWhatsapp: z.string().min(3),
    ordem: z.number().int().positive(),
  }),
})

/**
 * Servicos de cada divisao, escritos UMA vez. A pagina da divisao mostra
 * titulo e descricao; /solucoes mostra so os titulos. Sem copia entre paginas.
 */
const servicos = defineCollection({
  loader: file('src/content/servicos.json'),
  schema: z.object({
    divisao: z.enum(idsDivisao),
    titulo: z.string().min(5),
    descricao: z.string().min(40).max(400),
    ordem: z.number().int().positive(),
  }),
})

/** Publicos atendidos, exibidos em /empresas. */
const segmentos = defineCollection({
  loader: file('src/content/segmentos.json'),
  schema: z.object({
    titulo: z.string().min(5),
    descricao: z.string().min(40).max(400),
    ordem: z.number().int().positive(),
  }),
})

/**
 * Os oito caminhos da home: "o que voce precisa resolver?".
 *
 * Aparecem so na home, mas moram aqui pelo mesmo motivo do resto — o schema
 * quebra o build se alguem apontar um caminho para uma rota que nao existe,
 * e um link morto na secao de maior conversao passaria despercebido.
 */
const caminhos = defineCollection({
  loader: file('src/content/caminhos.json'),
  schema: z.object({
    titulo: z.string().min(10),
    descricao: z.string().min(30).max(200),
    href: z.string().startsWith('/'),
    ordem: z.number().int().positive(),
  }),
})

/**
 * Conteudo da pagina de AVCB, em tres grupos dentro do mesmo arquivo:
 *
 *   risco   -> o que esta em jogo quando o documento vence
 *   item    -> o que costuma ser exigido para obter o AVCB
 *   cotacao -> o que perguntar a um fornecedor antes de contratar
 *
 * Fica em colecao, e nao escrito na pagina, pelo mesmo motivo do resto: e
 * conteudo editorial que o cliente vai querer revisar, e o schema impede
 * que um item entre sem descricao ou com um grupo que a pagina nao exibe.
 */
const gruposAvcb = ['risco', 'item', 'cotacao'] as const

const avcb = defineCollection({
  loader: file('src/content/avcb.json'),
  schema: z.object({
    grupo: z.enum(gruposAvcb),
    titulo: z.string().min(5),
    descricao: z.string().min(30).max(500),
    ordem: z.number().int().positive(),
  }),
})

/**
 * Cursos oferecidos pela divisao Fire.
 *
 * `conteudo` e o programa do curso. Fica em colecao, e nao escrito na
 * pagina, porque e a parte que o cliente vai querer revisar e ajustar — e o
 * schema garante que nenhum curso entre sem programa, que e justamente o que
 * a pessoa quer ler antes de contratar.
 *
 * Nao ha campo de carga horaria, preco nem certificado: sao dados
 * operacionais que so o cliente pode informar, e a regra do projeto proibe
 * inventar. Entram quando ele mandar.
 */
const treinamentos = defineCollection({
  loader: file('src/content/treinamentos.json'),
  schema: z.object({
    titulo: z.string().min(5),
    chamada: z.string().min(20).max(120),
    resumo: z.string().min(80).max(600),
    /** Norma tecnica que orienta o conteudo, exibida como referencia. */
    normas: z.string().min(4),
    conteudo: z.array(z.string().min(10)).min(4),
    ordem: z.number().int().positive(),
  }),
})

/**
 * Quem esta a frente da empresa.
 *
 * E a unica prova de autoridade que o site pode exibir hoje: numero de
 * clientes, depoimento e nota do Google sao placeholder, e a regra do projeto
 * proibe inventar. Formacao e carreira de uma pessoa real, informadas pelo
 * cliente, sao verificaveis e nao dependem de nenhum numero.
 *
 * `limite` e obrigatorio de proposito. Curriculo de quem veio da seguranca
 * publica, num site que vende regularizacao junto ao Corpo de Bombeiros, e
 * exatamente o lugar onde uma pagina escorrega para insinuar acesso
 * privilegiado ou prazo garantido. O schema nao deixa a secao existir sem a
 * frase que diz o que a experiencia NAO faz.
 */
const lideranca = defineCollection({
  loader: file('src/content/lideranca.json'),
  schema: z.object({
    nome: z.string().min(3),
    /** Como a pessoa se relaciona com a empresa, nas palavras do cliente. */
    papel: z.string().min(5),
    /** Versao de uma frase, para a home, onde nao cabe a secao inteira. */
    resumoCurto: z.string().min(60).max(320),
    apresentacao: z.array(z.string().min(80)).min(1),
    credenciais: z
      .array(
        z.object({
          titulo: z.string().min(5),
          detalhe: z.string().min(30).max(300),
        })
      )
      .min(3),
    /** O que a experiencia nao abrevia. Sem isto a secao vira promessa. */
    limite: z.string().min(80),
    ordem: z.number().int().positive(),
  }),
})

/**
 * Conteudo da pagina de carregadores de veiculo eletrico (SAVE), em dois
 * grupos dentro do mesmo arquivo:
 *
 *   exigencia -> o que a NT 040/2025 do CBMPB passou a exigir
 *   etapa     -> o que a Bradotec faz, na ordem em que faz
 *
 * Fica em colecao pelo mesmo motivo do AVCB: e conteudo tecnico que muda
 * quando a norma muda, e o schema impede que um item entre sem descricao.
 */
const gruposSave = ['exigencia', 'etapa'] as const

const save = defineCollection({
  loader: file('src/content/save.json'),
  schema: z.object({
    grupo: z.enum(gruposSave),
    titulo: z.string().min(5),
    descricao: z.string().min(30).max(500),
    ordem: z.number().int().positive(),
  }),
})

/**
 * Artigos tecnicos.
 *
 * Aqui mora so o METADADO do artigo. O texto fica na propria pagina, dentro
 * de src/pages/artigos/, porque artigo com ilustracao usa componente e SVG
 * inline, e markdown puro nao renderiza componente sem MDX, que e dependencia
 * nova.
 *
 * A colecao existe para o indice: ele lista daqui, ordenado por data, e o
 * schema garante que nenhum artigo entre sem resumo ou com slug fora do
 * padrao. O teste em src/content/artigos.test.ts confere que cada entrada tem
 * uma pagina de verdade, que e o que markdown daria de graca e aqui nao da.
 */
const artigos = defineCollection({
  loader: file('src/content/artigos.json'),
  schema: z.object({
    titulo: z.string().min(20).max(120),
    /** Aparece no indice e como meta description. */
    resumo: z.string().min(80).max(320),
    /** Vira /artigos/<slug>. So minusculas, numeros e hifen. */
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug deve ser minusculo e separado por hifen'),
    /** ISO, AAAA-MM-DD. */
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data deve ser AAAA-MM-DD'),
    /** Tempo de leitura, em minutos. */
    minutos: z.number().int().positive().max(60),
    /** Assunto, para agrupar depois. */
    tema: z.string().min(4),
  }),
})

export const collections = {
  faq,
  divisoes,
  servicos,
  segmentos,
  caminhos,
  avcb,
  treinamentos,
  lideranca,
  save,
  artigos,
}
