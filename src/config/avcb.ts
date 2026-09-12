/**
 * Base legal da segurança contra incêndio na Paraíba.
 *
 * Existe porque o assunto tem duas armadilhas.
 *
 * A primeira: quase todo texto sobre AVCB que circula na internet e de Sao
 * Paulo. Ele fala em validade de 3 a 5 anos e em multa que "pode ultrapassar
 * R$ 200 mil". Nenhum dos dois numeros vale na Paraiba. Repetir isso aqui
 * seria informar errado com aparencia de autoridade.
 *
 * A segunda: a multa da Paraiba e escrita em UFR-PB, e a UFR-PB e corrigida
 * TODO MES pelo IPCA. Um valor em reais gravado na pagina fica errado em
 * poucas semanas. Por isso a pagina mostra o valor em UFR-PB, que a lei fixa
 * e nao muda, e o equivalente em reais sempre acompanhado do mes de
 * referencia — quem le sabe de quando e o numero.
 *
 * Para atualizar: troque `ufrPb` por uma portaria mais recente da SEFAZ-PB.
 * Nada mais precisa mudar; a pagina recalcula.
 */

/** Unidade Fiscal de Referência do Estado da Paraíba, corrigida mensalmente pelo IPCA. */
export const ufrPb = {
  valor: 74.08,
  mes: 'agosto de 2026',
  fonte: 'https://www.sefaz.pb.gov.br',
} as const

export const leis = {
  base: {
    rotulo: 'Lei Estadual nº 9.625/2011',
    url: 'https://bombeiros.pb.gov.br/wp-content/uploads/2022/04/Lei-Estadual-9.625_2011_compilada.pdf',
  },
  alteracao: {
    rotulo: 'Lei Estadual nº 12.678/2023',
    url: 'https://bravo.bombeiros.pb.gov.br/portal/wp-content/uploads/2023/07/Lei-Estadual-No-12.678-de-12-de-junho-de-2023.pdf',
  },
} as const

export type NivelDeRisco = 'baixo' | 'medio' | 'alto'

/**
 * Multa por infração, em UFR-PB — Lei nº 9.625/2011, art. 25, § 6º.
 * A Lei nº 12.678/2023 alterou o inciso IV e os §§ 4º e 5º do art. 25;
 * os §§ 6º e 7º, que trazem estes valores, seguem em vigor.
 */
export const multaEmUfr: Record<NivelDeRisco, number> = {
  baixo: 4,
  medio: 8,
  alto: 16,
}

/**
 * Art. 25, § 7º: os valores acima valem para edificações de até 200 m². Acima
 * disso acrescenta-se 0,05 UFR-PB por metro quadrado excedente — é o que faz
 * a multa de um prédio grande ser muito maior que a de uma sala comercial.
 */
export const areaBaseM2 = 200
export const acrescimoPorM2EmUfr = 0.05

/**
 * Validade do AVCB — art. 3º-A, § 1º. É anual, e não de 3 a 5 anos como diz
 * o material de outros estados.
 */
export const validadeDoAvcbEmAnos = 1

/**
 * Validade da inspeção por nível de risco — art. 15-A, I, alíneas "a" a "c".
 * Dentro desse período o AVCB é renovado a cada ano pela RAS (Renovação Anual
 * Simplificada) nas edificações de baixo e médio risco. Ou seja: a vistoria
 * completa se repete nesse intervalo, o documento continua sendo anual.
 */
export const validadeDaInspecaoEmAnos: Record<NivelDeRisco, number> = {
  baixo: 5,
  medio: 2,
  alto: 1,
}

/** Multa em UFR-PB para um nível de risco e uma área construída. */
export function multaEmUfrPara(risco: NivelDeRisco, areaM2: number): number {
  if (!Number.isFinite(areaM2) || areaM2 <= 0) {
    throw new Error(`Área inválida: ${areaM2}`)
  }

  const excedente = Math.max(0, areaM2 - areaBaseM2)
  return multaEmUfr[risco] + excedente * acrescimoPorM2EmUfr
}

/** O mesmo valor convertido em reais pela UFR-PB vigente. */
export function multaEmReaisPara(risco: NivelDeRisco, areaM2: number): number {
  return multaEmUfrPara(risco, areaM2) * ufrPb.valor
}

const formatador = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const emReais = (valor: number): string => formatador.format(valor)
