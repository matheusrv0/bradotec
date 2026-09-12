import { Dock, DockDica, DockItem, DockTexto } from '@/components/ui/dock'

/**
 * O menu do topo, em texto.
 *
 * Precisa ser UM componente React, e nao a arvore montada no `.astro`: o
 * contexto do React nao atravessa a fronteira entre Astro e ilha. Se o
 * `.astro` montasse `<Dock>` com `<DockItem>` dentro, cada um viraria uma
 * ilha separada, o contexto chegaria vazio e o componente lancaria erro. Por
 * isso os dados entram por prop e a arvore inteira e montada aqui.
 *
 * A prop e serializavel de proposito (string e objeto simples): e assim que o
 * Astro entrega dados para uma ilha.
 */
export type ItemDoMenu = {
  href: string
  /** Rotulo que aparece no topo. Curto porque o espaco e disputado. */
  curto: string
  /** Nome completo, revelado no hover. Igual ao curto quando nao ha o que acrescentar. */
  completo: string
}

type Props = {
  itens: readonly ItemDoMenu[]
  /** Rota da pagina aberta, ja resolvida para o item pai quando e subpagina. */
  rotaDestacada: string
}

export function MenuDock({ itens, rotaDestacada }: Props) {
  return (
    <Dock>
      {itens.map((item) => (
        <DockItem key={item.href}>
          <DockTexto href={item.href} atual={rotaDestacada === item.href}>
            {item.curto}
          </DockTexto>
          {/* Dica so quando ela acrescenta algo ao rotulo curto. */}
          {item.completo !== item.curto && <DockDica>{item.completo}</DockDica>}
        </DockItem>
      ))}
    </Dock>
  )
}
