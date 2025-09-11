"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { ClientsManagement } from "@/components/clients-management"
import { ReceivablesManagement } from "@/components/receivables-management"
import { PayablesManagement } from "@/components/payables-management"
import { ReportsContracts } from "@/components/reports-contracts"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "clients":
        return <ClientsManagement />
      case "receivables":
        return <ReceivablesManagement />
      case "payables":
        return <PayablesManagement />
      case "reports":
        return <ReportsContracts />
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
