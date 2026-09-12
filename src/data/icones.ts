import icones from './icones.json'

/**
 * Nome de icone que existe de fato em `icones.json`.
 *
 * O tipo e o ponto do arranjo: os desenhos sao baixados uma vez por
 * `scripts/icones-bradotec.mjs`, e quem escrever um nome que nao foi baixado
 * descobre no `pnpm typecheck`, nao num quadrado vazio em producao.
 */
export type NomeDeIcone = keyof typeof icones

export { icones }
