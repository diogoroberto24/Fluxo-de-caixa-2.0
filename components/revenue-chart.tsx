"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, BarChart3, LineChartIcon } from "lucide-react"

const fullChartData = [
  // 2023
  { month: "Jan", year: 2023, previsto: 85000, realizado: 78000, period: "Jan/2023" },
  { month: "Fev", year: 2023, previsto: 90000, realizado: 85000, period: "Fev/2023" },
  { month: "Mar", year: 2023, previsto: 95000, realizado: 88000, period: "Mar/2023" },
  { month: "Abr", year: 2023, previsto: 100000, realizado: 95000, period: "Abr/2023" },
  { month: "Mai", year: 2023, previsto: 105000, realizado: 98000, period: "Mai/2023" },
  { month: "Jun", year: 2023, previsto: 110000, realizado: 105000, period: "Jun/2023" },
  { month: "Jul", year: 2023, previsto: 115000, realizado: 108000, period: "Jul/2023" },
  { month: "Ago", year: 2023, previsto: 120000, realizado: 115000, period: "Ago/2023" },
  { month: "Set", year: 2023, previsto: 125000, realizado: 118000, period: "Set/2023" },
  { month: "Out", year: 2023, previsto: 130000, realizado: 125000, period: "Out/2023" },
  { month: "Nov", year: 2023, previsto: 135000, realizado: 128000, period: "Nov/2023" },
  { month: "Dez", year: 2023, previsto: 140000, realizado: 135000, period: "Dez/2023" },
  // 2024
  { month: "Jan", year: 2024, previsto: 95000, realizado: 87000, period: "Jan/2024" },
  { month: "Fev", year: 2024, previsto: 105000, realizado: 98000, period: "Fev/2024" },
  { month: "Mar", year: 2024, previsto: 115000, realizado: 108000, period: "Mar/2024" },
  { month: "Abr", year: 2024, previsto: 120000, realizado: 115000, period: "Abr/2024" },
  { month: "Mai", year: 2024, previsto: 125000, realizado: 118000, period: "Mai/2024" },
  { month: "Jun", year: 2024, previsto: 130000, realizado: 125000, period: "Jun/2024" },
  { month: "Jul", year: 2024, previsto: 135000, realizado: 128000, period: "Jul/2024" },
  { month: "Ago", year: 2024, previsto: 140000, realizado: 132000, period: "Ago/2024" },
  { month: "Set", year: 2024, previsto: 145000, realizado: 138000, period: "Set/2024" },
  { month: "Out", year: 2024, previsto: 150000, realizado: 142000, period: "Out/2024" },
  { month: "Nov", year: 2024, previsto: 155000, realizado: 148000, period: "Nov/2024" },
  { month: "Dez", year: 2024, previsto: 160000, realizado: 152000, period: "Dez/2024" },
]

const chartConfig = {
  previsto: {
    label: "Faturamento Previsto",
    color: "#22c55e", // Verde
  },
  realizado: {
    label: "Faturamento Realizado",
    color: "#3b82f6", // Azul
  },
  comparison: {
    label: "Comparação",
    color: "#eab308", // Amarelo
  },
}

export function RevenueChart() {
  const [viewType, setViewType] = useState<"line" | "bar">("line")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [comparisonMode, setComparisonMode] = useState(false)
  const [comparisonPeriod, setComparisonPeriod] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [selectedYear, comparisonMode, comparisonPeriod, viewType])

  const getDataByYear = (year: string) => {
    return fullChartData.filter((item) => item.year.toString() === year)
  }

  const getComparisonData = () => {
    if (!comparisonMode || !comparisonPeriod) {
      return getDataByYear(selectedYear)
    }

    const currentData = getDataByYear(selectedYear)
    const comparisonData = getDataByYear(comparisonPeriod)

    return currentData.map((current, index) => ({
      ...current,
      comparison: comparisonData[index]?.realizado || 0,
    }))
  }

  const currentData = getComparisonData()
  const totalRealizado = currentData.reduce((sum, item) => sum + item.realizado, 0)
  const totalPrevisto = currentData.reduce((sum, item) => sum + item.previsto, 0)
  const performance = ((totalRealizado / totalPrevisto) * 100).toFixed(1)
  const isPositive = totalRealizado >= totalPrevisto

  return (
    <Card className="bg-card border-border">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-card-foreground">Faturamento Mensal</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {performance}% do previsto
              </Badge>
              <span className="text-sm text-muted-foreground">
                R$ {totalRealizado.toLocaleString("pt-BR")} / R$ {totalPrevisto.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>

            <Button variant={viewType === "line" ? "default" : "outline"} size="sm" onClick={() => setViewType("line")}>
              <LineChartIcon className="h-4 w-4" />
            </Button>

            <Button variant={viewType === "bar" ? "default" : "outline"} size="sm" onClick={() => setViewType("bar")}>
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={comparisonMode ? "default" : "outline"}
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            Comparar Períodos
          </Button>

          {comparisonMode && (
            <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Comparar com..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500 border-dashed border-2 border-green-500"></div>
            <span className="text-sm font-medium text-muted-foreground">Faturamento Previsto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded-sm"></div>
            <span className="text-sm font-medium text-muted-foreground">Faturamento Realizado</span>
          </div>
          {comparisonMode && comparisonPeriod && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-yellow-500 border-dashed border-2 border-yellow-500"></div>
              <span className="text-sm font-medium text-muted-foreground">Comparação ({comparisonPeriod})</span>
            </div>
          )}
        </div>

        <div className={`transition-opacity duration-1000 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {viewType === "line" ? (
                <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number, name: string) => [
                      `R$ ${value.toLocaleString("pt-BR")}`,
                      name === "previsto" ? "Previsto" : name === "realizado" ? "Realizado" : "Comparação",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="previsto"
                    stroke={chartConfig.previsto.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Previsto"
                    style={{
                      animation: isVisible ? "drawLine 2s ease-in-out" : "none",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="realizado"
                    stroke={chartConfig.realizado.color}
                    strokeWidth={3}
                    name="Realizado"
                    style={{
                      animation: isVisible ? "drawLine 2.5s ease-in-out" : "none",
                    }}
                  />
                  {comparisonMode && comparisonPeriod && (
                    <Line
                      type="monotone"
                      dataKey="comparison"
                      stroke={chartConfig.comparison.color}
                      strokeWidth={2}
                      strokeDasharray="2 2"
                      name={`Realizado ${comparisonPeriod}`}
                      style={{
                        animation: isVisible ? "drawLine 3s ease-in-out" : "none",
                      }}
                    />
                  )}
                </LineChart>
              ) : (
                <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number, name: string) => [
                      `R$ ${value.toLocaleString("pt-BR")}`,
                      name === "previsto" ? "Previsto" : name === "realizado" ? "Realizado" : "Comparação",
                    ]}
                  />
                  <Bar dataKey="previsto" fill={chartConfig.previsto.color} opacity={0.6} name="Previsto" />
                  <Bar dataKey="realizado" fill={chartConfig.realizado.color} name="Realizado" />
                  {comparisonMode && comparisonPeriod && (
                    <Bar
                      dataKey="comparison"
                      fill={chartConfig.comparison.color}
                      opacity={0.7}
                      name={`Realizado ${comparisonPeriod}`}
                    />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes drawLine {
          0% {
            stroke-dashoffset: 1000;
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
      `}</style>
    </Card>
  )
}
