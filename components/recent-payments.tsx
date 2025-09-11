"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const recentPayments = [
  {
    id: 1,
    client: "Empresa ABC Ltda",
    value: "R$ 2.500,00",
    date: "15/12/2024",
    status: "Pago",
    method: "PIX",
  },
  {
    id: 2,
    client: "João Silva ME",
    value: "R$ 1.200,00",
    date: "14/12/2024",
    status: "Pago",
    method: "Transferência",
  },
  {
    id: 3,
    client: "Comércio XYZ",
    value: "R$ 3.800,00",
    date: "13/12/2024",
    status: "Pendente",
    method: "Boleto",
  },
  {
    id: 4,
    client: "Maria Santos",
    value: "R$ 950,00",
    date: "12/12/2024",
    status: "Pago",
    method: "Cartão",
  },
  {
    id: 5,
    client: "Tech Solutions",
    value: "R$ 4.200,00",
    date: "11/12/2024",
    status: "Atrasado",
    method: "Boleto",
  },
]

export function RecentPayments() {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-card-foreground">Pagamentos Recentes</CardTitle>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto">
        <div className="space-y-3">
          {recentPayments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {payment.client
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-card-foreground truncate">{payment.client}</p>
                  <p className="text-xs text-muted-foreground">
                    {payment.date} • {payment.method}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-medium text-card-foreground">{payment.value}</p>
                <Badge
                  variant={
                    payment.status === "Pago" ? "default" : payment.status === "Pendente" ? "secondary" : "destructive"
                  }
                  className="text-xs mt-1"
                >
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
