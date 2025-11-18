# Plano 02: Migrar para App Router

**Duração:** 3-5 dias | **Prioridade:** Crítica

---

## Objetivo

Migrar de navegação baseada em tabs para rotas reais do Next.js App Router.

---

## Checklist

### Dia 1: Estrutura de Rotas

- [ ] Criar route group `(dashboard)`

```bash
mkdir -p app/\(dashboard\)/{dashboard,clientes/{fixos,eventuais},recebimentos,contas-a-pagar,contratos}
```

- [ ] Criar layouts

```typescript
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] Criar páginas vazias para teste

```typescript
// app/(dashboard)/dashboard/page.tsx
export default function DashboardPage() {
  return <div>Dashboard</div>
}
```

### Dia 2: Migrar Componentes

- [ ] Migrar Dashboard → `app/(dashboard)/dashboard/page.tsx`
- [ ] Migrar ClientsHub → `app/(dashboard)/clientes/page.tsx`
- [ ] Migrar ClientsManagement → `app/(dashboard)/clientes/fixos/page.tsx`
- [ ] Migrar EventualClientsManagement → `app/(dashboard)/clientes/eventuais/page.tsx`

### Dia 3: Completar Páginas

- [ ] Migrar ReceivablesManagement → `app/(dashboard)/recebimentos/page.tsx`
- [ ] Migrar PayablesManagement → `app/(dashboard)/contas-a-pagar/page.tsx`
- [ ] Migrar ContractsManagement → `app/(dashboard)/contratos/page.tsx`

### Dia 4: Atualizar Sidebar

- [ ] Converter para `<Link>` do Next.js

```typescript
// components/layout/sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/recebimentos', label: 'Recebimentos', icon: TrendingUp },
  { href: '/contas-a-pagar', label: 'Contas a Pagar', icon: TrendingDown },
  { href: '/contratos', label: 'Contratos', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname === item.href ? 'active' : ''}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
```

- [ ] Remover props `onNavigate` dos componentes

### Dia 5: Loading States e Finalização

- [ ] Adicionar `loading.tsx` files

```typescript
// app/(dashboard)/dashboard/loading.tsx
export default function Loading() {
  return <div>Carregando...</div>
}
```

- [ ] Atualizar `/app/page.tsx` para redirect

```typescript
// app/page.tsx
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/dashboard')
}
```

- [ ] Testar todas as rotas
- [ ] Validar navegação (voltar, avançar)
- [ ] Testar deep linking
- [ ] Build e deploy

---

## Validação

- [ ] Todas as rotas funcionam
- [ ] Sidebar mostra rota ativa corretamente
- [ ] Histórico de navegação funciona
- [ ] Deep linking funciona (`/clientes/fixos`)
- [ ] Build sem erros

---

**Última Atualização:** 18/11/2025
