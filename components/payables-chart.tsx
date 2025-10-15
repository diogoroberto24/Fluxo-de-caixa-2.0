"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PieChart as PieChartIcon, BarChart3 } from "lucide-react"

interface PayablesChartProps {
  relatorio: {
    totalPagar: number
    totalPago: number
    totalPendente: number
    totalVencido: number
    totalRecebimentos: number
    saldoMensal: number
    contasPorCategoria?: Array<{
      categoria: string
      total: number
      quantidade: number
    }>
    contasPorStatus?: Array<{
      status: string
      total: number
      quantidade: number
    }>
  }
}

export function PayablesChart({ relatorio }: PayablesChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')

  // Dados para o gráfico comparativo (Despesas vs Receitas)
  const dadosComparativos = [
    {
      name: 'Receitas',
      valor: relatorio.totalRecebimentos / 100,
      fill: '#10b981'
    },
    {
      name: 'Despesas',
      valor: relatorio.totalPagar / 100,
      fill: '#ef4444'
    }
  ]

  // Dados por status
  const dadosPorStatus = [
    {
      name: 'Pago',
      valor: relatorio.totalPago / 100,
      fill: '#10b981'
    },
    {
      name: 'Pendente',
      valor: relatorio.totalPendente / 100,
      fill: '#f59e0b'
    },
    {
      name: 'Vencido',
      valor: relatorio.totalVencido / 100,
      fill: '#ef4444'
    }
  ].filter(item => item.valor > 0)

  // Dados por categoria (se disponível)
  const dadosPorCategoria = relatorio.contasPorCategoria?.map(item => ({
    name: item.categoria,
    valor: item.total / 100,
    quantidade: item.quantidade,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  })) || []

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label || payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Valor: {formatarValor(payload[0].value)}
          </p>
          {payload[0].payload.quantidade && (
            <p className="text-sm text-muted-foreground">
              Quantidade: {payload[0].payload.quantidade}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Gráfico Comparativo Principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Receitas vs Despesas</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={dadosComparativos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatarValor(typeof value === 'number' ? value : 0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {dadosComparativos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <BarChart data={dadosComparativos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatarValor(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="valor" fill="#8884d8">
                    {dadosComparativos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Resumo do Saldo */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Saldo do Mês:</span>
              <span className={`font-bold text-lg ${
                relatorio.saldoMensal >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatarValor(relatorio.saldoMensal / 100)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Contas por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPorStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatarValor(typeof value === 'number' ? value : 0)}`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {dadosPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico por Categoria */}
      {dadosPorCategoria.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosPorCategoria} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatarValor(value)} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="valor" fill="#8884d8">
                    {dadosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}