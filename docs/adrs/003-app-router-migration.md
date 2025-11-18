# ADR-003: Migração para Next.js App Router

**Status:** Proposto
**Data:** Janeiro 2025
**Decisor:** Equipe de Desenvolvimento

---

## Contexto

Atualmente a aplicação usa uma **única página** (`/app/page.tsx`) com navegação baseada em estado (tabs), em vez de rotas reais do Next.js App Router.

### Problema Atual

```typescript
// app/page.tsx - 280+ linhas
export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />
      case "clients": return <ClientsHub onNavigate={setActiveTab} />
      case "clients-fixed": return <ClientsManagement onNavigate={setActiveTab} />
      case "clients-eventual": return <EventualClientsManagement onNavigate={setActiveTab} />
      case "receivables": return <ReceivablesManagement />
      case "payables": return <PayablesManagement />
      case "reports": return <ContractsManagement />
      default: return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main>{renderContent()}</main>
    </div>
  )
}
```

**Problemas:**
- ❌ Não há histórico de navegação (botão voltar do navegador não funciona)
- ❌ Impossível fazer deep linking (`/clientes/fixos`)
- ❌ SEO prejudicado (tudo é uma única rota `/`)
- ❌ Não usa benefícios do App Router (streaming, suspense, parallel routes)
- ❌ Todos os componentes são carregados no bundle inicial
- ❌ Navegação hierárquica manual via props `onNavigate`

---

## Decisão

Migrar para estrutura de rotas reais do Next.js App Router com:

1. **Route Groups** para organização lógica
2. **Layouts Aninhados** para reutilização de UI
3. **Rotas Individuais** para cada "tab"
4. **Loading States** com `loading.tsx`
5. **Error Boundaries** com `error.tsx`

---

## Estrutura Proposta

### Antes (Atual)
```
/app
  layout.tsx          # Root layout
  page.tsx            # Tudo em uma página (switch/case)
  preview-contrato/
    page.tsx
```

### Depois (Proposto)
```
/app
  layout.tsx                      # Root layout (ThemeProvider, Toaster)
  page.tsx                        # Redirect para /dashboard

  (dashboard)/                    # Route group (área logada)
    layout.tsx                    # Layout com Sidebar
    loading.tsx                   # Loading state global

    dashboard/
      page.tsx                    # Dashboard principal
      loading.tsx

    clientes/
      layout.tsx                  # Breadcrumbs de clientes
      page.tsx                    # Hub de clientes
      loading.tsx

      fixos/
        page.tsx                  # Gestão de clientes fixos
        [id]/
          page.tsx                # Detalhes do cliente
          editar/
            page.tsx

      eventuais/
        page.tsx                  # Gestão de clientes eventuais
        [id]/
          page.tsx
          parcelas/
            page.tsx

    recebimentos/
      page.tsx
      loading.tsx

    contas-a-pagar/
      page.tsx
      loading.tsx
      [id]/
        page.tsx

    contratos/
      page.tsx
      preview/
        page.tsx                  # Mantido

  (public)/                       # Futuro: área pública
    login/
      page.tsx
```

---

## Mapeamento Tabs → Rotas

| Tab Atual | Rota Nova | Componente |
|-----------|-----------|------------|
| `dashboard` | `/dashboard` | Dashboard |
| `clients` | `/clientes` | ClientsHub |
| `clients-fixed` | `/clientes/fixos` | ClientsManagement |
| `clients-eventual` | `/clientes/eventuais` | EventualClientsManagement |
| `receivables` | `/recebimentos` | ReceivablesManagement |
| `payables` | `/contas-a-pagar` | PayablesManagement |
| `reports` | `/contratos` | ContractsManagement |

---

## Implementação

### 1. Layout Aninhado com Sidebar

```typescript
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

### 2. Sidebar com Links Reais

```typescript
// components/layout/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/recebimentos', label: 'Recebimentos', icon: TrendingUp },
    { href: '/contas-a-pagar', label: 'Contas a Pagar', icon: TrendingDown },
    { href: '/contratos', label: 'Contratos', icon: FileText },
  ]

  return (
    <aside className="w-64 border-r">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? 'active' : ''}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

### 3. Página Individual

```typescript
// app/(dashboard)/clientes/fixos/page.tsx
import { ClientsManagement } from '@/components/clientes/clients-management'

export const metadata = {
  title: 'Clientes Fixos | Fluxo de Caixa',
  description: 'Gestão de clientes fixos'
}

export default function ClientesFixosPage() {
  return <ClientsManagement />
}
```

### 4. Loading State

```typescript
// app/(dashboard)/clientes/fixos/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  )
}
```

---

## Benefícios

### 1. **SEO e Performance**
- ✅ URLs únicas para cada página
- ✅ Metadata específica por rota
- ✅ Code splitting automático
- ✅ Streaming e Suspense

### 2. **UX Melhorado**
- ✅ Histórico de navegação funciona
- ✅ Deep linking (`/clientes/fixos`)
- ✅ Compartilhar links específicos
- ✅ Loading states granulares

### 3. **Developer Experience**
- ✅ Organização clara de código
- ✅ Co-location de componentes e rotas
- ✅ TypeScript types automáticos
- ✅ Parallel routes para UIs complexas

---

## Plano de Migração

Ver [Plano 02: Migrar para App Router](/docs/planos-acao/02-migrar-app-router.md)

**Estimativa:** 3-5 dias

---

## Referências

- [Next.js App Router](https://nextjs.org/docs/app)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts)

---

**Última Atualização:** 18/11/2025
