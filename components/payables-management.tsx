"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Check, Calendar, TrendingDown, TrendingUp, DollarSign, BarChart3 } from "lucide-react"
import { ExpenseModal } from "@/components/expense-modal"
import { PayablesChart } from "@/components/payables-chart"
import { useContasPagar } from "@/hooks/use-contas-a-pagar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ContaPagar } from "@/shared/types"

export function PayablesManagement() {
  const {
    contas,
    relatorio,
    loading,
    carregarContas,
    carregarRelatorio,
    marcarComoPaga,
    deletarConta,
  } = useContasPagar()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoriaFilter, setCategoriaFilter] = useState<string>("")
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingConta, setEditingConta] = useState<ContaPagar | null>(null)
  const [mesAno, setMesAno] = useState(() => {
    const hoje = new Date()
    return {
      mes: hoje.getMonth() + 1,
      ano: hoje.getFullYear()
    }
  })

  // Carregar dados
  const recarregarDados = useCallback(async () => {
    await Promise.all([
      carregarContas({ 
        status: statusFilter || undefined,
        categoria: categoriaFilter || undefined,
        orderBy: 'data_vencimento',
        order: 'asc'
      }),
      carregarRelatorio(mesAno.mes, mesAno.ano)
    ])
  }, [statusFilter, categoriaFilter, mesAno, carregarContas, carregarRelatorio])

  // Handlers
  const handleMarcarComoPaga = async (id: string) => {
    try {
      await marcarComoPaga({ id })
      await recarregarDados()
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleDeletarConta = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return

    try {
      await deletarConta(id)
      await recarregarDados()
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleModalSuccess = async () => {
    setIsExpenseModalOpen(false)
    setEditingConta(null)
    await recarregarDados()
  }

  // Filtrar contas
  const contasFiltradas = contas.filter(conta => {
    const matchSearch = conta.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       conta.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  // Formatar valor
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor / 100)
  }

  // Formatar data
  const formatarData = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
  }

  // Badge de status
  const getBadgeStatus = (status: string) => {
    switch (status) {
      case 'PAGO':
        return { variant: 'default' as const, text: 'Pago' }
      case 'PENDENTE':
        return { variant: 'secondary' as const, text: 'Pendente' }
      case 'VENCIDO':
        return { variant: 'destructive' as const, text: 'Vencido' }
      default:
        return { variant: 'outline' as const, text: status }
    }
  }

  // Traduzir recorrência
  const traduzirRecorrencia = (recorrencia: string) => {
    const traducoes: Record<string, string> = {
      'ESPORADICA': 'Esporádica',
      'MENSAL': 'Mensal',
      'TRIMESTRAL': 'Trimestral',
      'SEMESTRAL': 'Semestral',
      'ANUAL': 'Anual'
    }
    return traducoes[recorrencia] || recorrencia
  }

  useEffect(() => {
    recarregarDados()
  }, [recarregarDados])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contas a Pagar</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as despesas e contas da empresa</p>
        </div>
        <Button onClick={() => setIsExpenseModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Cards de Resumo */}
      {relatorio && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total a Pagar</p>
                  <p className="text-2xl font-bold">{formatarValor(relatorio.totalPagar)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pago</p>
                  <p className="text-2xl font-bold text-green-600">{formatarValor(relatorio.totalPago)}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendente</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatarValor(relatorio.totalPendente)}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vencido</p>
                  <p className="text-2xl font-bold text-red-600">{formatarValor(relatorio.totalVencido)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="PAGO">Pago</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filtrar por categoria"
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
            />

            <div className="flex gap-2">
              <Select 
                value={mesAno.mes.toString()} 
                onValueChange={(value) => setMesAno(prev => ({ ...prev, mes: Number(value) }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={mesAno.ano.toString()} 
                onValueChange={(value) => setMesAno(prev => ({ ...prev, ano: Number(value) }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para Tabela e Gráficos */}
      <Tabs defaultValue="tabela" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tabela">Lista de Contas</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos e Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="tabela">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Contas a Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Recorrência</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasFiltradas.map((conta) => {
                      const badgeStatus = getBadgeStatus(conta.status)
                      return (
                        <TableRow key={conta.id}>
                          <TableCell className="font-medium">{conta.descricao}</TableCell>
                          <TableCell>{formatarValor(conta.valor)}</TableCell>
                          <TableCell>{formatarData(conta.data_vencimento.toISOString())}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{conta.categoria}</Badge>
                          </TableCell>
                          <TableCell>{traduzirRecorrencia(conta.recorrencia)}</TableCell>
                          <TableCell>
                            <Badge variant={badgeStatus.variant}>
                              {badgeStatus.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {conta.status !== 'PAGO' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleMarcarComoPaga(conta.id)}
                                  title="Marcar como paga"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingConta(conta)
                                  setIsExpenseModalOpen(true)
                                }}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeletarConta(conta.id)}
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graficos">
          {relatorio ? (
            <PayablesChart relatorio={relatorio} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Carregando dados do relatório...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => {
          setIsExpenseModalOpen(false)
          setEditingConta(null)
        }}
        editingExpense={editingConta}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
