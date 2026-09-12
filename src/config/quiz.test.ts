import { describe, expect, it } from 'vitest'
import {
  decidirRota,
  montarMensagemDoQuiz,
  perguntas,
  quizCompleto,
  type Respostas,
  rotuloDaResposta,
} from '@/config/quiz'

/**
 * Testes do caminho do lead — o que a revisao critica apontava como o buraco
 * mais grave da cobertura. Nao dependem do numero de WhatsApp estar
 * preenchido, entao valem desde hoje.
 */

const completas: Respostas = {
  objeto: 'empresa',
  problema: 'sem_licenca',
  urgencia: 'semanas',
  perfil: 'pj',
}

describe('estrutura das perguntas', () => {
  it('tem exatamente quatro perguntas', () => {
    expect(perguntas).toHaveLength(4)
  })

  it('nenhuma pergunta fica sem opcoes', () => {
    for (const pergunta of perguntas) {
      expect(pergunta.opcoes.length, `"${pergunta.titulo}" ficou sem opcoes`).toBeGreaterThan(1)
    }
  })

  it('os ids das opcoes sao unicos dentro de cada pergunta', () => {
    for (const pergunta of perguntas) {
      const ids = pergunta.opcoes.map((opcao) => opcao.id)
      expect(new Set(ids).size, `"${pergunta.titulo}" tem id repetido`).toBe(ids.length)
    }
  })
})

describe('decidirRota', () => {
  it('manda veiculo para a divisao Auto, mesmo com problema de incendio', () => {
    const rota = decidirRota({ objeto: 'veiculo', problema: 'incendio' })
    expect(rota.id).toBe('auto')
  })

  it('manda problema de incendio para a divisao Fire', () => {
    const rota = decidirRota({ objeto: 'condominio', problema: 'incendio' })
    expect(rota.id).toBe('fire')
  })

  it('manda falta de licenca para a divisao Documentos', () => {
    expect(decidirRota({ objeto: 'empresa', problema: 'sem_licenca' }).id).toBe('documentos')
  })

  it('manda "ainda nao sei" para Documentos, que faz o levantamento inicial', () => {
    expect(decidirRota({ objeto: 'imovel', problema: 'nao_sei' }).id).toBe('documentos')
  })

  it('devolve Documentos quando nada foi respondido, em vez de quebrar', () => {
    expect(decidirRota({}).id).toBe('documentos')
  })

  it('toda rota aponta para uma pagina que existe e tem itens', () => {
    const paginas = ['/seguranca-contra-incendio', '/regularizacoes', '/documentacao-veicular']
    for (const objeto of ['empresa', 'veiculo']) {
      for (const problema of ['incendio', 'sem_licenca']) {
        const rota = decidirRota({ objeto, problema })
        expect(paginas).toContain(rota.href)
        expect(rota.itens.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('quizCompleto', () => {
  it('reconhece as quatro respostas', () => {
    expect(quizCompleto(completas)).toBe(true)
  })

  it('recusa quando falta a ultima', () => {
    const { perfil: _perfil, ...faltando } = completas
    expect(quizCompleto(faltando)).toBe(false)
  })

  it('recusa o conjunto vazio', () => {
    expect(quizCompleto({})).toBe(false)
  })
})

describe('rotuloDaResposta', () => {
  it('devolve o rotulo legivel, nao o id', () => {
    expect(rotuloDaResposta('objeto', completas)).toBe('Uma empresa ou comércio')
  })

  it('devolve null para pergunta ainda nao respondida', () => {
    expect(rotuloDaResposta('urgencia', {})).toBeNull()
  })

  it('devolve null para um id de opcao que nao existe', () => {
    expect(rotuloDaResposta('objeto', { objeto: 'nave-espacial' })).toBeNull()
  })
})

describe('montarMensagemDoQuiz', () => {
  it('inclui as quatro perguntas com os rotulos escolhidos', () => {
    const mensagem = montarMensagemDoQuiz(completas)

    for (const pergunta of perguntas) {
      expect(mensagem).toContain(pergunta.titulo)
    }
    expect(mensagem).toContain('Uma empresa ou comércio')
    expect(mensagem).toContain('Falta licença, alvará ou documento')
  })

  it('marca o que ficou sem resposta, sem quebrar a mensagem', () => {
    const mensagem = montarMensagemDoQuiz({ objeto: 'empresa' })
    expect(mensagem).toContain('Uma empresa ou comércio')
    expect(mensagem).toContain('...')
  })

  it('nao usa travessao em lugar nenhum', () => {
    // O travessao foi removido de todo o texto do site a pedido do cliente:
    // e uma das marcas mais reconheciveis de texto gerado por IA.
    expect(montarMensagemDoQuiz(completas)).not.toContain('—')
    expect(montarMensagemDoQuiz({ objeto: 'empresa' })).not.toContain('—')
  })

  it('nao promete prazo, aprovacao nem resultado', () => {
    const mensagem = montarMensagemDoQuiz(completas).toLowerCase()
    for (const proibido of ['garantimos', 'aprovação em', 'em até', 'prazo de', 'resolvemos em']) {
      expect(mensagem, `a mensagem nao pode conter "${proibido}"`).not.toContain(proibido)
    }
  })
})
