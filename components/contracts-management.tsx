"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, RefreshCw, User, AlertCircle, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ClientePendente {
  id: string
  nome: string
  documento: string
  email: string
  telefone: string
  tributacao: string
  honorarios: number
  motivoPendencia: 'sem_contrato' | 'dados_atualizados'
  data_de_atualizacao: string
  produtos?: any[]
}

export function ContractsManagement() {
  const [clientesPendentes, setClientesPendentes] = useState<ClientePendente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<ClientePendente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [generatingContracts, setGeneratingContracts] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const { toast } = useToast()

  useEffect(() => {
    fetchClientesPendentes()
  }, [])

  useEffect(() => {
    filterClientes()
  }, [clientesPendentes, searchTerm, statusFilter])

  const fetchClientesPendentes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/contratos?tipo=pendentes')
      if (!response.ok) throw new Error('Falha ao buscar clientes pendentes')
      
      const data = await response.json()
      setClientesPendentes(data)
    } catch (error) {
      console.error('Erro ao buscar clientes pendentes:', error)
      toast({
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterClientes = () => {
    let filtered = clientesPendentes

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== "todos") {
      filtered = filtered.filter(cliente => cliente.motivoPendencia === statusFilter)
    }

    setFilteredClientes(filtered)
  }

  const handleGenerateContract = async (clienteId: string, clienteNome: string) => {
    setGeneratingContracts(prev => new Set(prev).add(clienteId))
    
    try {
      const response = await fetch('/api/v1/contratos/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao gerar contrato')
      }

      const data = await response.json()
      
      toast({
        title: "Contrato gerado com sucesso!",
        description: `Contrato para ${clienteNome} foi criado e está disponível para download.`,
        variant: "default"
      })

      // Abrir arquivo em nova aba
      if (data.contrato.pdfUrl) {
        window.open(data.contrato.pdfUrl, '_blank')
      }

      // Atualizar lista
      fetchClientesPendentes()

    } catch (error) {
      console.error('Erro ao gerar contrato:', error)
      toast({
        title: "Erro ao gerar contrato",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      })
    } finally {
      setGeneratingContracts(prev => {
        const newSet = new Set(prev)
        newSet.delete(clienteId)
        return newSet
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }

  const getMotivoBadge = (motivo: string) => {
    if (motivo === 'sem_contrato') {
      return <Badge variant="destructive">Sem Contrato</Badge>
    }
    return <Badge variant="secondary">Dados Atualizados</Badge>
  }

  const getServicos = (produtos: any[]) => {
    if (!produtos || produtos.length === 0) return 'Não especificado'
    return produtos.map(p => p.produto?.nome || 'Serviço').join(', ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Contratos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie contratos de clientes fixos e gere novos contratos
          </p>
        </div>
        <Button onClick={fetchClientesPendentes} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesPendentes.length}</div>
            <p className="text-xs text-muted-foreground">
              Precisam de contrato ou atualização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Contrato</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientesPendentes.filter(c => c.motivoPendencia === 'sem_contrato').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nunca tiveram contrato gerado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados Atualizados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientesPendentes.filter(c => c.motivoPendencia === 'dados_atualizados').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Contrato precisa ser atualizado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, documento ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="sem_contrato">Sem Contrato</SelectItem>
                  <SelectItem value="dados_atualizados">Dados Atualizados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Clientes Pendentes de Contrato ({filteredClientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando...</span>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {clientesPendentes.length === 0 ? (
                <>
                  <p>Nenhum cliente pendente de contrato</p>
                  <p className="text-sm">Todos os clientes estão com contratos atualizados!</p>
                </>
              ) : (
                <>
                  <p>Nenhum cliente encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Serviços</TableHead>
                    <TableHead>Honorários</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cliente.nome}</p>
                          <p className="text-sm text-muted-foreground">{cliente.email}</p>
                          {cliente.telefone && (
                            <p className="text-xs text-muted-foreground">{cliente.telefone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{cliente.documento}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate">{getServicos(cliente.produtos || [])}</p>
                          <p className="text-xs text-muted-foreground">{cliente.tributacao}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(cliente.honorarios)}</TableCell>
                      <TableCell>{getMotivoBadge(cliente.motivoPendencia)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(cliente.data_de_atualizacao)}</span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleGenerateContract(cliente.id, cliente.nome)}
                          disabled={generatingContracts.has(cliente.id)}
                          className="gap-2"
                        >
                          {generatingContracts.has(cliente.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3" />
                              Gerar Contrato
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}