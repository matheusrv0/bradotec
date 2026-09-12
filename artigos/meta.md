# Metadados do artigo `save-condominios.html`

## Title

```
NT 040/2025: carregador elétrico em condomínio na Paraíba
```

57 caracteres. Cabe inteiro no resultado do Google, sem corte.

O termo de busca vem primeiro de propósito. Quem procura `NT 040/2025` está
procurando exatamente isto e nada mais; quem procura `carregador elétrico
condomínio` reconhece o assunto no meio do título.

**Alternativa, se o cliente preferir a dor à norma:**

```
Carregador de carro elétrico no condomínio: a norma mudou
```

56 caracteres. Converte melhor para quem não sabe que a norma existe, que é a
maioria do público. Perde a busca por sigla.

## Meta description

```
A NT 040/2025 do Corpo de Bombeiros da Paraíba mudou as regras do carregador de carro elétrico em condomínio. O que é proibido, o que é exigido e por que a parte elétrica já está valendo.
```

184 caracteres. O Google costuma exibir entre 155 e 160, então o corte cai
perto de "por que a parte elétrica". A frase foi montada para que as duas
primeiras orações já entreguem o assunto inteiro, e o que sobrar seja bônus.

**Versão curta, se preferir garantir que nada seja cortado (153 caracteres):**

```
A NT 040/2025 do Corpo de Bombeiros da Paraíba mudou as regras do carregador elétrico em condomínio. O que é proibido, o que é exigido e o prazo que engana.
```

## Slug sugerido

```
/carregador-carro-eletrico-condominio-nt-040-2025
```

Curto o suficiente para caber na barra, com os dois termos que as pessoas
digitam. Evita `save`, que sozinho não significa nada para o público e ainda
colide com a palavra inglesa nas buscas.

**Alternativas aceitáveis:**

- `/nt-040-2025-carregador-eletrico-condominio`
- `/carregador-eletrico-condominio-paraiba`

## Palavras-chave usadas

Todas aparecem no texto de forma natural, em H1, H2 ou no corpo. Nenhuma foi
repetida além do que a frase pedia.

| Termo | Onde aparece |
|---|---|
| carregador carro elétrico condomínio | H1, abertura, H2 de exigências, checklist, FAQ |
| NT 040/2025 | title, description, H2 "O que mudou", figuras, FAQ, JSON-LD |
| SAVE condomínio | H2 "O que mudou" (com a sigla explicada), seção do prazo, etapas |
| carregador elétrico garagem norma | H2 "O que a norma exige do carregador elétrico na garagem" |
| AVCB João Pessoa | seção de responsabilidade, FAQ, rodapé |
| regularização condomínio João Pessoa | H2 "Como a Bradotec conduz a regularização", CTA, rodapé |

**Termos de cauda longa que o texto também alcança**, sem terem sido forçados:

- "modo de recarga 3 e 4"
- "tomada comum carregar carro elétrico condomínio"
- "quem responde incêndio carregador condomínio"
- "prazo NT 040/2025 edificações existentes"
- "dispositivo DR carregador veículo elétrico"
- "chuveiros automáticos ordinário I garagem"

## Dados estruturados incluídos

- `Article`, com autor, publisher, CNPJ em `taxID` e área de atuação.
- `FAQPage`, com as seis perguntas do artigo, texto idêntico ao visível.

Os dois JSON-LD estão no fim do HTML. O texto das respostas foi copiado do
corpo da página, não reescrito: se o Google mostrar a resposta no resultado,
ela será a mesma que a pessoa lê ao clicar.

## Um ponto que ficou aberto de propósito

O prazo final das adequações gerais das edificações existentes **não foi
publicado**. As fontes divergem entre 2028 e 2032, e uma data errada num texto
que diz ao síndico o que ele precisa fazer é pior do que data nenhuma.

Há um comentário HTML no ponto exato onde ela entra, dentro da seção
"O prazo que engana", com a frase pronta para completar. Procure por
`PRAZO FINAL DAS ADEQUAÇÕES GERAIS` no arquivo.

O artigo continua funcionando sem a data, porque o argumento dele não depende
dela: o que está valendo agora é a instalação elétrica.

## Observações de publicação

**Duplicidade com o site: resolvida.** O artigo agora vive no site, em
`/artigos/carregador-carro-eletrico-condominio`, com a identidade do site em
vez desta paleta. A página `/carregadores-eletricos` continua existindo, mas
perdeu o FAQ e o texto longo: ela virou a página do serviço, e o artigo virou
a explicação da norma. As duas se linkam.

O FAQ ficou só no artigo de propósito. Com ele nos dois lugares, o JSON-LD de
FAQPage sairia duplicado no mesmo domínio, que é a forma mais direta de o
Google escolher uma página e ignorar a outra.

Este arquivo continua sendo a versão avulsa, na paleta pedida para material de
entrega. Serve para enviar por e-mail, imprimir ou publicar fora do site. Se o
texto mudar num lado, precisa mudar no outro: são duas cópias de propósito, e
só as ilustrações são copiadas por script.

**Contraste do cinza.** `#7A7A7A` sobre branco mede 4,30:1. O mínimo da WCAG
AA para texto pequeno é 4,5:1. A paleta foi usada exatamente como especificada,
mas `#767676` resolveria sem diferença visível perceptível. Fica a decisão.

**E-mail pessoal.** `arcanjoln@gmail.com` publicado em página aberta atrai
spam. Um endereço no domínio da empresa seria melhor quando existir.
