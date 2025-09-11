"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, AlertTriangle, RefreshCw, Play, Eye } from "lucide-react"
import { RevenueChart } from "@/components/revenue-chart"
import { RecentPayments } from "@/components/recent-payments"
import { LiquidGlassEffect } from "@/components/liquid-glass-effect"
import { ClientsModal } from "@/components/clients-modal"

const kpiData = [
  {
    title: "Faturamento Previsto",
    value: "R$ 125.400,00",
    change: "+12.5%",
    trend: "up" as const,
    icon: TrendingUp,
    clickable: false,
  },
  {
    title: "Faturamento Arrecadado",
    value: "R$ 98.750,00",
    change: "+8.2%",
    trend: "up" as const,
    icon: TrendingUp,
    clickable: false,
  },
  {
    title: "Clientes em Dia", // alterado de "Clientes Ativos" para "Clientes em Dia"
    value: "47",
    change: "+3",
    trend: "up" as const,
    icon: Users,
    clickable: true,
    clientType: "active" as const,
  },
  {
    title: "Clientes Inadimplentes",
    value: "5",
    change: "-2",
    trend: "down" as const,
    icon: AlertTriangle,
    clickable: true,
    clientType: "overdue" as const,
  },
]

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedClientType, setSelectedClientType] = useState<"active" | "overdue">("active")

  const handleKpiClick = (kpi: (typeof kpiData)[0]) => {
    if (kpi.clickable && kpi.clientType) {
      setSelectedClientType(kpi.clientType)
      setModalOpen(true)
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
            <Button variant="outline" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
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
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiquidGlassEffect>
          <RevenueChart />
        </LiquidGlassEffect>
        <LiquidGlassEffect>
          <RecentPayments />
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
          <Button variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Sincronizar Dados
          </Button>
        </LiquidGlassEffect>
      </div>

      <ClientsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} clientType={selectedClientType} />
    </div>
  )
}
