/**
 * Estrutura de navegacao do site — fonte unica.
 *
 * No site anterior o menu estava copiado em 9 arquivos HTML identicos:
 * mudar um item exigia editar os 9. Aqui muda so este arquivo.
 *
 * Cada item tem dois rotulos porque a auditoria do site antigo mostrou que
 * os nomes completos quebravam o menu em 3 linhas no desktop:
 *   - `curto`   -> menu do topo (espaco apertado)
 *   - `completo`-> menu do celular e rodape (tem espaco e vale para SEO)
 */
export type ItemNavegacao = {
  href: string
  curto: string
  completo: string
}

/**
 * Paginas que nao estao no menu mas pertencem a um item dele.
 *
 * Sem isto, quem abria /avcb ou /solucoes via o menu inteiro apagado e
 * perdia a nocao de onde estava dentro do site.
 */
export const paiNoMenu: Readonly<Record<string, string>> = {
  '/avcb': '/seguranca-contra-incendio',
  '/solucoes': '/empresas',
  '/diagnostico': '/contato',
  '/carregadores-eletricos': '/seguranca-contra-incendio',
}

export const navegacaoPrincipal: readonly ItemNavegacao[] = [
  {
    href: '/seguranca-contra-incendio',
    curto: 'Incêndio',
    completo: 'Segurança contra incêndio',
  },
  { href: '/regularizacoes', curto: 'Regularizações', completo: 'Regularizações e licenças' },
  { href: '/documentacao-veicular', curto: 'Veicular', completo: 'Documentação veicular' },
  { href: '/empresas', curto: 'Empresas', completo: 'Empresas e condomínios' },
  { href: '/treinamentos', curto: 'Treinamentos', completo: 'Brigada e primeiros socorros' },
  { href: '/artigos', curto: 'Artigos', completo: 'Artigos técnicos' },
  { href: '/sobre', curto: 'A Bradotec', completo: 'A Bradotec' },
  { href: '/contato', curto: 'Contato', completo: 'Contato' },
] as const

/** Colunas do rodape. */
export const navegacaoRodape = [
  {
    titulo: 'Soluções',
    itens: [
      { href: '/seguranca-contra-incendio', rotulo: 'Segurança contra incêndio' },
      { href: '/regularizacoes', rotulo: 'Regularizações e licenças' },
      { href: '/documentacao-veicular', rotulo: 'Documentação veicular' },
      { href: '/empresas', rotulo: 'Gestão documental recorrente' },
      { href: '/avcb', rotulo: 'AVCB: o que é e o que exige' },
      { href: '/treinamentos', rotulo: 'Brigada e primeiros socorros' },
      { href: '/carregadores-eletricos', rotulo: 'Carregadores de veículo elétrico' },
    ],
  },
  {
    titulo: 'Empresa',
    itens: [
      { href: '/artigos', rotulo: 'Artigos técnicos' },
      { href: '/sobre', rotulo: 'A Bradotec' },
      { href: '/solucoes', rotulo: 'Todas as soluções' },
      { href: '/diagnostico', rotulo: 'Diagnóstico de Regularização' },
      { href: '/contato', rotulo: 'Contato' },
      { href: '/#faq', rotulo: 'Perguntas frequentes' },
    ],
  },
] as const
