"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, AlertTriangle, RefreshCw, Play, Eye, UserCheck } from "lucide-react"
import { RevenueChart } from "@/components/revenue-chart"
import { RecentPayments } from "@/components/recent-payments"
import { LiquidGlassEffect } from "@/components/liquid-glass-effect"
import { ClientsModal } from "@/components/clients-modal"
import { ContractsManagement } from "@/components/contracts-management"

// Definir a interface do cliente
interface Client {
  id: string
  name: string
  cnpj: string
  modules: string[]
  fees: number
  status: "active" | "overdue" | "inactive"
  lastPayment: string
  phone: string
  email: string
}

// Interface para dados do dashboard
interface DashboardData {
  kpis: {
    faturamentoPrevisto: {
      valor: number
      variacao: string
      tendencia: 'up' | 'down'
    }
    faturamentoArrecadado: {
      valor: number
      variacao: string
      tendencia: 'up' | 'down'
    }
    clientesEmDia: {
      valor: number
      variacao: string
      tendencia: 'up' | 'down'
    }
    clientesInadimplentes: {
      valor: number
      variacao: string
      tendencia: 'up' | 'down'
    }
    totalClientes: {
      valor: number
      variacao: string
      tendencia: 'up' | 'down'
    }
  }
  faturamentoMensal: Array<{
    month: string
    year: number
    previsto: number
    realizado: number
    period: string
  }>
  pagamentosRecentes: Array<{
    id: string
    client: string
    value: string
    date: string
    status: string
    method: string
  }>
}

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedClientType, setSelectedClientType] = useState<"active" | "overdue" | "all">("active")
  const [clients, setClients] = useState<Client[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<"dashboard" | "reports">("dashboard")
  
  // Buscar dados reais do banco de dados
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Buscar dados do dashboard
        const dashboardResponse = await fetch('/api/dashboard')
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          setDashboardData(dashboardData)
        } else {
          console.error('Erro ao buscar dados do dashboard')
        }

        // Buscar clientes para o modal
        const clientsResponse = await fetch('/api/clients')
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          setClients(clientsData)
        } else {
          console.error('Erro ao buscar clientes')
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  // Função para atualizar dados
  const refreshData = async () => {
    setLoading(true)
    try {
      const dashboardResponse = await fetch('/api/dashboard')
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        setDashboardData(dashboardData)
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Gerar KPI data dinamicamente baseado nos dados do dashboard
  const kpiData = dashboardData ? [
    {
      title: "Faturamento Previsto",
      value: `R$ ${(dashboardData.kpis.faturamentoPrevisto.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: dashboardData.kpis.faturamentoPrevisto.variacao,
      trend: dashboardData.kpis.faturamentoPrevisto.tendencia,
      icon: TrendingUp,
      clickable: false,
    },
    {
      title: "Faturamento Arrecadado",
      value: `R$ ${(dashboardData.kpis.faturamentoArrecadado.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: dashboardData.kpis.faturamentoArrecadado.variacao,
      trend: dashboardData.kpis.faturamentoArrecadado.tendencia,
      icon: TrendingUp,
      clickable: false,
    },
    {
      title: "Clientes em Dia",
      value: dashboardData.kpis.clientesEmDia.valor.toString(),
      change: dashboardData.kpis.clientesEmDia.variacao,
      trend: dashboardData.kpis.clientesEmDia.tendencia,
      icon: Users,
      clickable: true,
      clientType: "active" as const,
    },
    {
      title: "Clientes Inadimplentes",
      value: dashboardData.kpis.clientesInadimplentes.valor.toString(),
      change: dashboardData.kpis.clientesInadimplentes.variacao,
      trend: dashboardData.kpis.clientesInadimplentes.tendencia,
      icon: AlertTriangle,
      clickable: true,
      clientType: "overdue" as const,
    },
    {
      title: "Total de Clientes",
      value: dashboardData.kpis.totalClientes.valor.toString(),
      change: dashboardData.kpis.totalClientes.variacao,
      trend: dashboardData.kpis.totalClientes.tendencia,
      icon: UserCheck,
      clickable: true,
      clientType: "all" as const,
    },
  ] : []
  
  // Modificar as funções de cálculo para excluir clientes inativos
  const totalClients = clients.filter(client => client.status !== "inactive").length;
  const activeClients = clients.filter(client => client.status === "active").length;
  const overdueClients = clients.filter(client => client.status === "overdue").length;

  // Calcular o faturamento previsto apenas com clientes ativos
  const expectedRevenue = clients
    .filter(client => client.status !== "inactive")
    .reduce((total, client) => total + client.fees, 0);

  const handleKpiClick = (kpi: (typeof kpiData)[0]) => {
    if (kpi.clickable && kpi.clientType) {
      setSelectedClientType(kpi.clientType)
      setModalOpen(true)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "reports":
        return <ContractsManagement />
      case "dashboard":
      default:
        return (
          <>
            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiquidGlassEffect>
                <RevenueChart data={dashboardData?.faturamentoMensal} />
              </LiquidGlassEffect>
              <LiquidGlassEffect>
                <div className="grid gap-4 md:col-span-2">
                  <RecentPayments data={dashboardData?.pagamentosRecentes} loading={loading} />
                </div>
              </LiquidGlassEffect>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <LiquidGlassEffect isButton>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Eye className="h-4 w-4" />
                  Exibir Contas a Pagar
                </Button>
              </LiquidGlassEffect>
              <LiquidGlassEffect isButton>
                <Button 
                  variant="outline" 
                  className="gap-2 bg-transparent"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Sincronizar Dados
                </Button>
              </LiquidGlassEffect>
            </div>
          </>
        )
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do fluxo de caixa e indicadores principais</p>
        </div>
        <div className="flex gap-3">
          <LiquidGlassEffect isButton>
            <Button 
              variant={activeSection === "dashboard" ? "default" : "outline"} 
              className="gap-2 bg-transparent"
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </Button>
          </LiquidGlassEffect>
          <LiquidGlassEffect isButton>
            <Button 
              variant={activeSection === "reports" ? "default" : "outline"} 
              className="gap-2 bg-transparent"
              onClick={() => setActiveSection("reports")}
            >
              Relatórios
            </Button>
          </LiquidGlassEffect>
          <LiquidGlassEffect isButton>
            <Button 
              variant="outline" 
              className="gap-2 bg-transparent"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Dashboard
            </Button>
          </LiquidGlassEffect>
          <LiquidGlassEffect isButton>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Executar Cobranças
            </Button>
          </LiquidGlassEffect>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <LiquidGlassEffect key={index}>
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                  <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded w-20 mb-2"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                </CardContent>
              </Card>
            </LiquidGlassEffect>
          ))
        ) : (
          kpiData.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <LiquidGlassEffect key={index}>
                <Card
                  className={`bg-transparent border-none shadow-none ${
                    kpi.clickable ? "cursor-pointer hover:scale-105 transition-transform" : ""
                  }`}
                  onClick={() => handleKpiClick(kpi)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">{kpi.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">{kpi.value}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant={kpi.trend === "up" ? "default" : "destructive"} className="text-xs">
                        {kpi.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {kpi.change}
                      </Badge>
                      <span className="text-xs text-muted-foreground">vs mês anterior</span>
                    </div>
                    {kpi.clickable && (
                      <div className="text-xs text-primary mt-2 opacity-70">Clique para ver detalhes</div>
                    )}
                  </CardContent>
                </Card>
              </LiquidGlassEffect>
            )
          })
        )}
      </div>

      {/* Render Content Based on Active Section */}
      {renderContent()}

      <ClientsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} clientType={selectedClientType} />
    </div>
  )
}
