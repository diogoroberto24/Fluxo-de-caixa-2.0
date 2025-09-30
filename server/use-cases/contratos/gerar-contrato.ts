import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export class GerarContratoUseCase {
  async execute(clienteId: string): Promise<{ contratoId: string; pdfUrl: string }> {
    console.log('🚀 INICIO - Geração de contrato para cliente:', clienteId)
    
    try {
      // Validação básica
      if (!clienteId || typeof clienteId !== 'string') {
        throw new Error(`ClienteId inválido: ${clienteId}`)
      }

      // Buscar cliente
      console.log('🔍 Buscando cliente...')
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        include: {
          produtos: {
            include: {
              produto: true
            }
          }
        }
      })

      if (!cliente) {
        throw new Error(`Cliente não encontrado: ${clienteId}`)
      }
      console.log('✅ Cliente encontrado:', cliente.nome)

      // Preparar diretório
      const uploadsDir = path.join(process.cwd(), 'public', 'contratos')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      // Gerar conteúdo do contrato
      const contratoConteudo = this.gerarConteudoContrato(cliente)
      
      // Salvar arquivo
      const fileName = `contrato_${clienteId}_${Date.now()}.txt`
      const filePath = path.join(uploadsDir, fileName)
      fs.writeFileSync(filePath, contratoConteudo, 'utf8')
      
      const fileUrl = `/contratos/${fileName}`
      console.log('✅ Arquivo salvo:', fileName)

      // Salvar no banco
      console.log('💾 Salvando contrato no banco...')
      const contrato = await prisma.contrato.create({
        data: {
          cliente_id: clienteId,
          pdf_url: fileUrl,
          metadata: {
            data_geracao: new Date().toISOString(),
            cliente_nome: cliente.nome,
            tipo: 'contrato_texto'
          }
        }
      })

      console.log('🎉 Contrato gerado com sucesso:', contrato.id)
      return {
        contratoId: contrato.id,
        pdfUrl: contrato.pdf_url || ''
      }

    } catch (error) {
      console.error('💥 ERRO na geração do contrato:', error)
      throw error
    }
  }

  private gerarConteudoContrato(cliente: any): string {
    // Construir endereço completo
    const enderecoCompleto = [
      cliente.cliente_rua,
      cliente.cliente_numero,
      cliente.cliente_bairro,
      cliente.cliente_cidade,
      cliente.cliente_estado,
      cliente.cliente_pais || 'Brasil'
    ].filter(Boolean).join(', ')

    // Serviços contratados
    const servicos = cliente.produtos?.length > 0 
      ? cliente.produtos.map((p: any) => p.produto?.nome || 'Serviço contábil').join(', ')
      : 'Serviços contábeis gerais'

    // Valor dos honorários
    const honorarios = cliente.honorarios || 0
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(honorarios / 100)

    const dataAtual = new Date().toLocaleDateString('pt-BR')

    return `
================================================================================
                    CONTRATO DE PRESTAÇÃO DE SERVIÇOS CONTÁBEIS
================================================================================

CONTRATANTE: ${cliente.nome || 'Nome não informado'}
CPF/CNPJ: ${cliente.documento || 'Documento não informado'}
E-mail: ${cliente.email || 'Email não informado'}
Telefone: ${cliente.telefone || 'Telefone não informado'}
Endereço: ${enderecoCompleto || 'Endereço não informado'}
REGIME TRIBUTÁRIO: ${cliente.tributacao?.toUpperCase() || 'NÃO INFORMADO'}
SERVIÇOS CONTRATADOS: ${servicos}
VALOR DOS HONORÁRIOS: ${valorFormatado}

Data de início: ${dataAtual}

================================================================================

1. DO OBJETO
O presente contrato tem por objeto a prestação de serviços contábeis 
especificados acima.

2. DOS HONORÁRIOS
O valor dos honorários mensais será de ${valorFormatado}, a ser pago até o 
dia 10 de cada mês.

3. DAS OBRIGAÇÕES
3.1 - O CONTRATADO se obriga a prestar os serviços com qualidade e 
      pontualidade.
3.2 - O CONTRATANTE se obriga a fornecer todas as informações necessárias 
      para a execução dos serviços.

4. DA VIGÊNCIA
Este contrato entra em vigor na data de ${dataAtual} e permanece válido 
por prazo indeterminado.

5. DO FORO
Fica eleito o foro da comarca local para dirimir quaisquer questões 
oriundas deste contrato.

================================================================================

Data: ${dataAtual}

_____________________                    _____________________
    CONTRATANTE                             CONTRATADO

================================================================================
Contrato gerado automaticamente pelo Sistema de Gestão
Data de geração: ${new Date().toLocaleString('pt-BR')}
Cliente ID: ${cliente.id}
================================================================================
`
  }
}