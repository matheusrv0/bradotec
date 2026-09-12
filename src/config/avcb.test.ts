import { describe, expect, it } from 'vitest'
import {
  acrescimoPorM2EmUfr,
  areaBaseM2,
  emReais,
  multaEmReaisPara,
  multaEmUfr,
  multaEmUfrPara,
  ufrPb,
  validadeDaInspecaoEmAnos,
  validadeDoAvcbEmAnos,
} from '@/config/avcb'

/**
 * Trava da base legal publicada em /avcb.
 *
 * São números de lei estadual que vão para um site lido por síndico e por
 * dono de comércio. Errar aqui não é um bug de layout: é informar errado
 * sobre multa e prazo. Os valores estão travados contra a Lei nº 9.625/2011
 * (art. 25, §§ 6º e 7º; art. 3º-A, § 1º; art. 15-A, I), com as alterações da
 * Lei nº 12.678/2023.
 */

describe('valores de multa (Lei 9.625/2011, art. 25, § 6º)', () => {
  it('mantém 4, 8 e 16 UFR-PB por nível de risco', () => {
    expect(multaEmUfr).toEqual({ baixo: 4, medio: 8, alto: 16 })
  })

  it('até 200 m² cobra apenas o valor base', () => {
    expect(multaEmUfrPara('baixo', 200)).toBe(4)
    expect(multaEmUfrPara('medio', 120)).toBe(8)
    expect(multaEmUfrPara('alto', 1)).toBe(16)
  })

  it('acrescenta 0,05 UFR-PB por metro quadrado acima de 200 m²', () => {
    // 1.000 m² de médio risco: 8 + (800 x 0,05) = 48 UFR-PB.
    expect(multaEmUfrPara('medio', 1000)).toBeCloseTo(48, 10)
    // 3.000 m² de alto risco: 16 + (2.800 x 0,05) = 156 UFR-PB.
    expect(multaEmUfrPara('alto', 3000)).toBeCloseTo(156, 10)
  })

  it('a área excedente é o que domina a conta em prédio grande', () => {
    const base = multaEmUfr.medio
    const total = multaEmUfrPara('medio', 5000)
    expect(total / base).toBeGreaterThan(30)
  })

  it('recusa área inválida em vez de devolver número errado', () => {
    expect(() => multaEmUfrPara('baixo', 0)).toThrow(/Área inválida/)
    expect(() => multaEmUfrPara('baixo', -50)).toThrow(/Área inválida/)
    expect(() => multaEmUfrPara('baixo', Number.NaN)).toThrow(/Área inválida/)
  })

  it('converte para reais pela UFR-PB vigente', () => {
    expect(multaEmReaisPara('alto', 200)).toBeCloseTo(16 * ufrPb.valor, 10)
  })
})

describe('prazos (arts. 3º-A e 15-A)', () => {
  it('o AVCB da Paraíba vale um ano', () => {
    // O material de outros estados fala em 3 a 5 anos. Nao vale aqui — e e
    // justamente o erro que esta pagina existe para corrigir.
    expect(validadeDoAvcbEmAnos).toBe(1)
  })

  it('a inspeção vale 5, 2 ou 1 ano conforme o risco', () => {
    expect(validadeDaInspecaoEmAnos).toEqual({ baixo: 5, medio: 2, alto: 1 })
  })

  it('nenhuma inspeção vale menos que o próprio AVCB', () => {
    for (const anos of Object.values(validadeDaInspecaoEmAnos)) {
      expect(anos).toBeGreaterThanOrEqual(validadeDoAvcbEmAnos)
    }
  })
})

describe('UFR-PB', () => {
  it('declara o mês de referência junto com o valor', () => {
    // Sem o mes, o numero em reais vira uma afirmacao sem data — e a UFR-PB
    // e corrigida todo mes pelo IPCA.
    expect(ufrPb.mes).toMatch(/de \d{4}$/)
    expect(ufrPb.valor).toBeGreaterThan(0)
  })

  it('formata em real brasileiro', () => {
    expect(emReais(1185.28)).toContain('1.185,28')
    expect(emReais(1185.28)).toContain('R$')
  })
})

describe('constantes da lei', () => {
  it('mantém a faixa base de 200 m² e o acréscimo de 0,05 UFR-PB', () => {
    expect(areaBaseM2).toBe(200)
    expect(acrescimoPorM2EmUfr).toBe(0.05)
  })
})
