"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RecentPaymentsProps {
  data?: Array<{
    id: string
    client: string
    value: string
    date: string
    status: string
    method: string
  }>
  loading?: boolean
}

// Certifique-se de que a exportação está correta
export function RecentPayments({ data, loading }: RecentPaymentsProps) {
  const recentPayments = data || []

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-card-foreground">Pagamentos Recentes</CardTitle>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto">
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 animate-pulse">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="h-7 w-7 bg-muted rounded-full flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                    <div className="h-5 bg-muted rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum pagamento recente encontrado</p>
              <p className="text-xs mt-1">Os pagamentos aparecerão aqui quando forem realizados</p>
            </div>
          ) : (
            recentPayments.map((payment) => (
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
