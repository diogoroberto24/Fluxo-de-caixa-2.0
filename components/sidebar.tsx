"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, TrendingUp, CreditCard, FileText, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "receivables", label: "Recebimentos", icon: TrendingUp },
  { id: "payables", label: "Contas a Pagar", icon: CreditCard },
  { id: "reports", label: "Relatórios e Contratos", icon: FileText },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground text-balance">Sistema de Fluxo de Caixa</h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Anderson Cardozo Assessoria</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                activeTab === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        </Button>
      </div>
    </div>
  )
}
