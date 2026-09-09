# Site BRADOTEC

Site institucional em **Astro 7**, feito para gerar leads qualificados via
WhatsApp e formulário, com foco em busca local em João Pessoa (PB).

Esta base foi montada para ser reaproveitada em outros clientes: os dados da
empresa ficam em um arquivo só, e as cores em outro.

---

## 1. Como rodar na sua máquina

Você precisa do **Node 22 ou superior** e do **pnpm**.

Se o pnpm ainda não estiver instalado:

```sh
npm install -g pnpm
```

Depois, dentro da pasta do projeto:

```sh
pnpm install     # baixa as dependências (só na primeira vez)
pnpm dev         # abre o site em http://localhost:4321
```

O `pnpm dev` fica rodando e atualiza a página sozinho a cada arquivo salvo.
Para parar, aperte `Ctrl + C`.

### Todos os comandos

| Comando | O que faz | Quando usar |
|---|---|---|
| `pnpm dev` | Sobe o site localmente com recarga automática | No dia a dia, enquanto edita |
| `pnpm build` | Gera o site pronto na pasta `dist/` | Antes de publicar |
| `pnpm preview` | Serve a pasta `dist/` como ficará no ar | Para conferir o resultado final |
| `pnpm typecheck` | Confere os tipos e os arquivos `.astro` | Antes de commitar |
| `pnpm lint` | Aponta problemas de código e formatação | Antes de commitar |
| `pnpm format` | Corrige formatação automaticamente | Quando o lint reclamar |
| `pnpm test` | Roda os testes unitários (Vitest) | Ao mexer em lógica |
| `pnpm e2e` | Abre um navegador real e testa o site (Playwright) | Antes de publicar |

> `pnpm preview` sobe o servidor em segundo plano e devolve o terminal.
> Para parar: `pnpm exec astro preview stop`.

**Você não precisa lembrar de rodar lint e typecheck:** o `lefthook` roda os
dois automaticamente a cada `git commit` e bloqueia o commit se algo falhar.

---

## 2. O que editar para trocar de cliente

São **dois arquivos**. Nada de caçar texto no meio do código.

### `src/config/site.ts` — dados da empresa

Nome, telefone, e-mail, endereço, CNPJ, horário, Instagram, WhatsApp e IDs de
campanha. Tudo entre `[COLCHETES]` ainda é placeholder.

O mais importante é o WhatsApp:

```ts
whatsapp: '5583999998888',   // 55 + DDD + número, só dígitos
```

Esse arquivo é **validado durante o build**. Se você digitar um WhatsApp com
letra no meio ou um e-mail sem `@`, o build falha e avisa — em vez de o site
ir ao ar com um botão quebrado.

**Enquanto o WhatsApp for placeholder**, todos os botões de WhatsApp levam para
a página de contato em vez de abrir uma conversa com número inexistente.

### `src/styles/global.css` — identidade visual

O bloco `@theme` no topo tem todas as cores, fontes, raios de borda e sombras.
Trocar a paleta de um cliente é editar só esse bloco: nenhum componente tem cor
escrita no meio do código.

---

## 3. Como publicar (Cloudflare Pages)

1. No painel da Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**
   (ou **Upload assets**, se preferir subir manualmente).
2. Configure a build:
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Variável de ambiente:** `SITE_URL` = o endereço final, ex.:
     `https://bradotec.com.br`
3. Publique. Em segundos o site fica no ar.

> **Endereço e cidade são campos diferentes de propósito.** A sede fica em
> Cabedelo; o mercado é João Pessoa. `cidade` sai nos títulos e no texto,
> `cidadeDoEndereco` sai só no endereço postal e no `addressLocality` do
> schema.org. Enquanto os dois eram um campo só, o Google recebia um endereço
> em João Pessoa que não existe.
>
> **`horario` e `horarioEstruturado` também.** O primeiro é o que a pessoa lê
> ("Horário comercial"); o segundo é o mesmo horário no formato que o
> schema.org entende. Enquanto o cliente não informar a hora exata, o segundo
> fica vazio e o `openingHours` simplesmente não é publicado: dado estruturado
> inválido é pior que dado ausente.

A variável `SITE_URL` é importante: dela saem o `canonical`, o Open Graph e o
`sitemap.xml`. Sem ela, o site usa um endereço de exemplo.

Os arquivos `public/_headers` e `public/_redirects` já vão configurados com
cache longo, cabeçalhos de segurança e os redirecionamentos `301` dos endereços
antigos terminados em `.html` — para não perder o que já estiver no Google.

---

## 4. Prova social: nada é inventado

Número de clientes, nota do Google e depoimentos **não foram criados**.
Enquanto os campos tiverem `[Nº]` e a lista `depoimentos` estiver vazia, essas
seções simplesmente não aparecem no site. Assim que dados reais forem
preenchidos em `src/config/site.ts`, aparecem sozinhas.

Dados de contato ainda pendentes aparecem **destacados em amarelo** na tela,
para ninguém publicar sem perceber que faltou preencher.

A autoridade do site vem de outro lugar: a formação e a carreira de quem está
à frente da empresa, em `src/content/lideranca.json`. É dado verificável, veio
do cliente e não depende de nenhum número. O schema dessa coleção exige o campo
`limite`, a frase que diz o que a experiência **não** abrevia — sem ela o build
falha, porque currículo de segurança pública num site que vende regularização
junto ao Corpo de Bombeiros é exatamente onde uma página escorrega para
insinuar acesso privilegiado.

---

## 5. Como o projeto está organizado

```
src/
  config/
    site.ts          DADOS DA EMPRESA — edite aqui para trocar de cliente
    navegacao.ts     Menu do topo, do celular e do rodapé (fonte única)
    whatsapp.ts      Mensagens prontas por origem do clique
  content/
    faq.json         As perguntas do FAQ, escritas UMA vez
  content.config.ts  Schema Zod que valida o conteúdo no build
  components/        Peças reutilizáveis da interface
  layouts/
    BaseLayout.astro Cabeçalho, rodapé, SEO e dados estruturados
  lib/               Funções de apoio (SEO, utilitários)
  pages/             Uma rota por arquivo
  styles/
    global.css       IDENTIDADE VISUAL — cores, fontes, espaçamentos
  assets/
    marca/           Logo do cliente e tudo derivado dela
    fotos/           Fotos reais da empresa
    fotos-licenciadas/  Pexels: licenca comercial, podem ir ao ar
e2e/                 Testes que rodam em navegador de verdade
scripts/
  extrair-logo.mjs   Gera logo, favicon e imagem de compartilhamento da marca
artigos/             Versao avulsa dos artigos, HTML autocontido, fora do build
                     (a versao publicada mora em src/pages/artigos/)
legacy/              Site estático anterior, guardado para consulta
public/              Arquivos servidos como estão (favicon, _headers)
```

### Duas decisões que valem explicar

**O FAQ mora em um lugar só.** No site anterior, cada resposta era escrita duas
vezes por página — uma no texto visível e outra no bloco que o Google lê — e
repetida em até quatro páginas. Eram cerca de 66 cópias de 11 textos. Agora a
resposta é escrita uma vez em `src/content/faq.json`, e os dois lugares saem
dela. Um teste automático confere isso a cada execução.

**O site não carrega React.** O Astro entrega HTML pronto. React só entra em
pedaços que precisam mesmo de interação (o formulário e o quiz, quando forem
construídos). O menu do celular é JavaScript puro, com cerca de 20 linhas.
Resultado: a home hoje não baixa **nenhum** arquivo de framework.

---

## 6. O que ainda falta

| Item | Onde entra | Quem resolve |
|---|---|---|
| Horário exato de atendimento (`Mo-Fr 08:00-18:00`) | `horarioEstruturado`, em `src/config/site.ts` | Cliente |
| Depoimentos e nota do Google reais | `src/config/site.ts` | Cliente |
| Domínio definitivo | variável `SITE_URL` no deploy | Cliente |
| Histórico e fundação da empresa | página `sobre` | Cliente |
| Arquivo vetorial da logo (`.svg`/`.ai`) | `src/assets/marca/logo-fonte.jpg` | Cliente |
| Fotos do proprio trabalho, para substituir as licenciadas | `src/assets/fotos-licenciadas/` | Cliente |
| Quiz de 4 perguntas | ilha React | Desenvolvimento |
| Envio do formulário para quem não usa WhatsApp | back-end (ver `specs/backend/`) | Desenvolvimento |

A análise do que um back-end resolveria está em
[`specs/backend/00-ANALISE-CAMADAS.md`](specs/backend/00-ANALISE-CAMADAS.md).

---

## 7. Stack

| Camada | Escolha | Versão |
|---|---|---|
| Framework | Astro (saída estática) | 7 |
| Linguagem | TypeScript strict | 5.9 |
| Estilo | Tailwind CSS (config em CSS) | 4 |
| Interatividade | React (só em ilhas) | 19 |
| Componentes | shadcn/ui (MCP configurado, tema da marca) | — |
| Ícones | lucide-react | — |
| Validação | Zod | 4 |
| Formulários | React Hook Form | 7 |
| Lint e formatação | Biome | 2.5 |
| Testes unitários | Vitest | 4 |
| Testes de navegador | Playwright | 1.62 |
| Hooks de commit | lefthook | 2 |
| Hospedagem | Cloudflare Pages | — |

**TypeScript está fixado na 5.9 de propósito.** A versão 7 já saiu (é o
compilador reescrito em Go, bem mais rápido), mas o `astro check` ainda não a
aceita. Quando aceitar, é só atualizar.
