"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { ClientsHub } from "@/components/clients-hub"
import { ClientsManagement } from "@/components/clients-management"
import { EventualClientsManagement } from "@/components/eventual-clients-management"
import { ReceivablesManagement } from "@/components/receivables-management"
import { PayablesManagement } from "@/components/payables-management"
import { ContractsManagement } from "@/components/contracts-management"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "clients":
        return <ClientsHub onNavigate={setActiveTab} />
      case "clients-fixed":
        return <ClientsManagement onNavigate={setActiveTab} />
      case "clients-eventual":
        return <EventualClientsManagement onNavigate={setActiveTab} />
      case "receivables":
        return <ReceivablesManagement />
      case "payables":
        return <PayablesManagement />
      case "reports":
        return <ContractsManagement />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}
