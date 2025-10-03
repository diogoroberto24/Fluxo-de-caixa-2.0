'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Download, Eye } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
  documento: string
  email: string
}

export default function PreviewContratoPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('')
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingClientes, setLoadingClientes] = useState(true)

  // Carregar lista de clientes
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          setClientes(data)
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      } finally {
        setLoadingClientes(false)
      }
    }

    carregarClientes()
  }, [])

  const gerarPreview = async () => {
    if (!clienteSelecionado) return

    setLoading(true)
    try {
      const response = await fetch('/api/v1/contratos/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clienteId: clienteSelecionado }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro ao gerar preview:', error)
      alert('Erro ao gerar preview do contrato')
    } finally {
      setLoading(false)
    }
  }

  const baixarPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = 'contrato-preview.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const atualizarPreview = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl('')
    }
    gerarPreview()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Preview de Contratos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Configurações do Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Selecionar Cliente
              </label>
              <Select 
                value={clienteSelecionado} 
                onValueChange={setClienteSelecionado}
                disabled={loadingClientes}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingClientes ? "Carregando..." : "Escolha um cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.documento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={gerarPreview} 
              disabled={!clienteSelecionado || loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Gerar Preview
                </>
              )}
            </Button>
          </div>

          {pdfUrl && (
            <div className="flex gap-2">
              <Button onClick={atualizarPreview} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Preview
              </Button>
              <Button onClick={baixarPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {pdfUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Preview do Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[800px] border rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="Preview do Contrato"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!pdfUrl && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um cliente e clique em "Gerar Preview" para visualizar o contrato</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}