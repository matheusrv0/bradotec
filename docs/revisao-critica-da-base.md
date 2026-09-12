# Revisão crítica da base — o que está frágil

Autocrítica do que foi construído nesta sessão. Sem elogios: o objetivo é
listar o que quebra, o que é dívida e o que precisa sair da frente antes do
primeiro cliente real usar esta base.

Data: 2026-09-02.

---

## 1. O que está frágil

### 1.1 Sete das nove páginas estão vazias

Só a home e a 404 têm conteúdo real. As outras sete têm cabeçalho, SEO,
breadcrumb, FAQ e rodapé funcionando — e um parágrafo dizendo "conteúdo em
migração" no meio.

Isso foi proposital (o pedido era o esqueleto), mas é o maior item aberto.
Enquanto não for preenchido, **o site não pode ir ao ar**: uma página indexada
com corpo vazio é pior para SEO que não existir.

### 1.2 O quiz e o formulário não existem

Segundo o próprio briefing, são o coração da geração de leads: o quiz é o
compromisso de entrada (baixo atrito) e o formulário é a segunda via para quem
não quer WhatsApp — justamente o síndico e o gestor, que são os leads de maior
valor.

Hoje **todo caminho do site termina no WhatsApp**. É exatamente o problema nº 4
apontado na auditoria do site anterior, e ele voltou.

### 1.3 Contraste de cor não foi medido

Implementei foco visível, skip link, `prefers-reduced-motion`, HTML semântico,
`aria-*` no menu e testei parte disso com Playwright. Mas **não rodei checagem
de contraste**. As cores vieram do design anterior, que se declarava conferido
— eu não verifiquei por conta própria.

Trechos que merecem atenção: `#8fa3b8` e `#71889f` sobre o azul escuro do
rodapé são os candidatos mais prováveis a ficar abaixo do mínimo de 4.5:1.

Rodar Lighthouse ou axe antes de publicar.

### 1.4 shadcn/ui está configurado, mas nunca foi usado

`components.json`, os aliases e as variáveis semânticas estão prontos e
apontando para a paleta da Bradotec. Mas **nenhum componente foi instalado**,
então o caminho `pnpm dlx shadcn@latest add button` não foi testado nem uma
vez. Pode haver atrito na primeira tentativa (Astro + Tailwind v4 é combinação
recente).

### 1.5 Nenhum teste cobre o caminho do lead

Os 27 testes E2E verificam estrutura: um `h1` por página, menu que abre e
fecha, FAQ igual ao JSON-LD, ausência de rolagem horizontal, `noindex` na 404,
botão flutuante que não cobre o rodapé.

**Nenhum verifica que o botão do WhatsApp leva ao número certo com a mensagem
certa** — porque o número ainda é placeholder. É o teste mais importante do
site inteiro e ele não existe.

---

## 2. Dívida técnica

### 2.1 188 KB de JavaScript órfão no build

A integração React gera um bundle que **nenhuma página referencia** — 188 KB
dos 630 KB do `dist`, quase 30% do deploy.

Não chega ao visitante (nada o baixa), então não afeta velocidade. Mas polui o
deploy. Some sozinho quando as ilhas React (quiz e formulário) existirem. Se a
decisão for não usar React, remover a integração e economizar isso.

### 2.2 Não existe CI

Os testes existem, mas nada os roda sozinho. O `lefthook` roda lint e typecheck
no commit local, e **pode ser pulado com `git commit --no-verify`**. Além
disso, ele não roda os testes nem o build.

Na prática: dá para subir código quebrado para o repositório sem nenhum alarme.
Uma GitHub Action com `lint + typecheck + test + build + e2e` resolve.

### 2.3 Monitoramento e analytics preparados, mas desligados

- **Sentry não foi instalado.** Estava na sua lista. Ficou de fora porque exige
  um DSN de conta real, e eu não invento credencial. Falta ligar.
- **Cloudflare Web Analytics** tem o campo pronto em `site.ts`, mas sem token
  nada é carregado. Idem para `googleAdsId` e `ga4Id`.

Consequência: se o site quebrar em produção, você descobre pelo cliente.

### 2.4 O projeto está dentro do OneDrive

`C:\Users\rondo\OneDrive\Documentos\bradotec`. O OneDrive tenta sincronizar
`node_modules` — dezenas de milhares de arquivos pequenos. Isso deixa a
instalação e o build mais lentos e pode travar arquivo em uso no meio de um
`pnpm install`.

Recomendo mover para fora, algo como `C:\dev\bradotec`, ou excluir a pasta da
sincronização.

### 2.5 TypeScript preso na 5.9

A 7 já saiu (compilador reescrito em Go, bem mais rápido), mas o `astro check`
ainda a rejeita explicitamente. Está fixado e documentado. Revisar em alguns
meses.

### 2.6 Não há tema escuro

Decisão consciente: não estava no briefing, e o site já usa seções escuras como
recurso de design. Mas se um cliente futuro pedir, os tokens vão precisar de uma
segunda camada — hoje as cores estão definidas uma vez só, sem variante.

### 2.7 O conteúdo migrado é parcial

Só o FAQ saiu do HTML antigo para Content Collections. Serviços, divisões,
cards de problema, timeline e segmentos continuam apenas no `legacy/`, ainda
não modelados. O padrão está estabelecido, mas o trabalho não foi feito.

---

## 3. O que resolver antes do primeiro cliente real

Em ordem:

| # | Item | Por quê |
|---|---|---|
| 1 | Preencher o WhatsApp real em `src/config/site.ts` | Sem ele, nenhum botão funciona e o site não gera um lead sequer |
| 2 | Definir `SITE_URL` no deploy | Canonical, Open Graph e sitemap estão apontando para um domínio de exemplo |
| 3 | Construir formulário e quiz | Sem eles o site tem uma porta só, e é a que os leads B2B menos usam |
| 4 | Migrar o conteúdo das 7 páginas | Página vazia indexada prejudica o SEO |
| 5 | Rodar Lighthouse e axe | Contraste e acessibilidade foram afirmados, não medidos |
| 6 | Criar a GitHub Action | Sem CI, o `--no-verify` derruba toda a proteção |
| 7 | Ligar Sentry | Descobrir a quebra antes do cliente ligar |
| 8 | Testar o fluxo real do WhatsApp | O teste mais importante do site ainda não existe |

---

## 4. O que ficou realmente bom

Duas coisas que vale preservar em qualquer refatoração futura:

1. **O FAQ tem uma fonte única.** O maior defeito do site anterior — 11 textos
   copiados em cerca de 66 lugares, com o Google podendo ler algo diferente do
   visitante — virou impossível por construção, e há teste garantindo.

2. **A home não carrega framework nenhum.** Zero KB de React. O menu do celular
   é JavaScript puro. Isso não acontece por acaso e se perde fácil: basta
   alguém transformar um componente estático em ilha React sem pensar.

---

## 5. Atualizacao — 2026-09-02

O que desta revisao foi resolvido, e o que continua aberto.

### Resolvido

**1.1 Sete paginas vazias.** As sete foram preenchidas com o conteudo de
`legacy/`. Nenhuma pagina do site diz "conteudo em migracao". Divisoes,
servicos e segmentos viraram Content Collections com schema Zod, seguindo o
padrao do FAQ — o titulo do servico em `/solucoes` e a descricao na pagina
da divisao saem da mesma entrada.

**1.3 Contraste nunca medido.** Medidos 27 pares. **A suspeita registrada
aqui estava errada:** `#8fa3b8` e `#71889f` sobre o rodape escuro passam com
folga (6.69:1 e 5.10:1). As tres falhas reais eram outras, e a mais grave
era o botao flutuante do WhatsApp — 4.31:1 com texto branco, no elemento de
maior conversao do site. Corrigidas e travadas por teste.

**2.1 188 KB de React orfao.** O bundle agora tem dono: o formulario de
contato. Confirmado por build que so `/contato` o baixa; a home continua com
zero KB de framework.

### Parcial

**1.2 Quiz e formulario nao existem.** O formulario existe, com validacao
Zod e erros associados por `aria-describedby`. Mas **o problema de fundo
continua**: o envio abre o WhatsApp, entao o site ainda tem uma porta so, e
o sindico que nao usa WhatsApp continua sem saida. Isso exige o back-end de
`specs/backend/`. O quiz nao foi construido.

**1.5 Nenhum teste cobre o caminho do lead.** Continua verdade. Os testes
novos cobrem contraste, nao conversao. O teste do link do WhatsApp com a
mensagem certa segue impossivel enquanto o numero for placeholder — e segue
sendo o teste mais importante do site.

### Aberto, sem mudanca

2.2 (sem CI), 2.3 (Sentry e analytics desligados), 2.5 (TypeScript na 5.9),
2.6 (sem tema escuro), 1.4 (shadcn/ui configurado e nunca usado).

O item 2.4 mudou de forma: a copia auditada nesta sessao esta em
`Desktop\BRADOTEC`, fora do OneDrive.
