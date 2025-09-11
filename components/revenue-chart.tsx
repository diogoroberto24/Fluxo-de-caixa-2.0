"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const chartData = [
  { month: "Jan", previsto: 95000, realizado: 87000 },
  { month: "Fev", previsto: 105000, realizado: 98000 },
  { month: "Mar", previsto: 115000, realizado: 108000 },
  { month: "Abr", previsto: 120000, realizado: 115000 },
  { month: "Mai", previsto: 125000, realizado: 118000 },
  { month: "Jun", previsto: 130000, realizado: 125000 },
]

const chartConfig = {
  previsto: {
    label: "Faturamento Previsto",
    color: "hsl(var(--chart-1))",
  },
  realizado: {
    label: "Faturamento Realizado",
    color: "hsl(var(--chart-2))",
  },
}

export function RevenueChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Faturamento Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
              />
              <Line type="monotone" dataKey="previsto" stroke="var(--color-chart-1)" strokeWidth={2} name="Previsto" />
              <Line
                type="monotone"
                dataKey="realizado"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                name="Realizado"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
