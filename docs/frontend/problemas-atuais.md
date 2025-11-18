# Problemas Atuais do Frontend

**Data:** 18/11/2025

---

## Resumo Executivo

O frontend possui 5 problemas principais que afetam manutenibilidade, performance e UX:

1. ⛔ **CRÍTICO:** Navegação baseada em tabs (sem rotas reais)
2. 🟠 **ALTO:** Componentes desorganizados (24 no root)
3. 🟠 **ALTO:** Mix de APIs legacy e v1
4. 🟡 **MÉDIO:** Falta de hooks padronizados
5. 🟡 **MÉDIO:** Navegação hierárquica manual

---

## Problema 1: Tabs em Vez de Rotas 🔴

### Descrição

Toda a aplicação roda em `/app/page.tsx` com navegação baseada em estado:

```typescript
// app/page.tsx
const [activeTab, setActiveTab] = useState("dashboard")

const renderContent = () => {
  switch (activeTab) {
    case "dashboard": return <Dashboard />
    case "clients": return <ClientsHub />
    // ... 7 cases
  }
}
```

### Impactos

- ❌ Sem histórico de navegação (botão voltar não funciona)
- ❌ Sem deep linking (não dá para compartilhar `/clientes/fixos`)
- ❌ SEO prejudicado (tudo é `/`)
- ❌ Bundle inicial enorme (todos componentes carregados)
- ❌ Sem streaming/suspense do App Router

### Solução

Migrar para rotas reais do Next.js App Router

Ver: [ADR-003](/docs/adrs/003-app-router-migration.md) | [Plano 02](/docs/planos-acao/02-migrar-app-router.md)

---

## Problema 2: Componentes Desorganizados 🟠

### Descrição

24 componentes de feature no root de `/components`:

```
/components
├── ui/                   # 18 componentes shadcn/ui
├── dashboard.tsx         # ❌ Misturado
├── clients-management.tsx
├── client-modal.tsx
└── ... (21 componentes mais)
```

### Impactos

- 🔍 Difícil encontrar componentes relacionados
- 🔗 Dependências não claras
- 👥 Onboarding lento
- 📦 Impossível importar por feature

### Solução

Organizar por feature: `/components/{feature}/{component}.tsx`

Ver: [ADR-004](/docs/adrs/004-component-organization.md) | [Plano 01](/docs/planos-acao/01-reorganizar-componentes.md)

---

## Problema 3: Mix de APIs Legacy e v1 🟠

### Descrição

Componentes usam tanto `/api/*` quanto `/api/v1/*`:

| Componente | API Usada | Status |
|------------|-----------|--------|
| `dashboard.tsx` | `/api/dashboard` | ❌ Legacy |
| `clients-management.tsx` | `/api/clients` | ❌ Legacy |
| `payables-management.tsx` | `/api/v1/contas-a-pagar` | ✅ v1 |
| `contracts-management.tsx` | `/api/v1/contratos` | ✅ v1 |

### Impactos

- 🔀 Inconsistência no código
- 🐛 Comportamentos diferentes
- 📚 Dificulta documentação

### Solução

Atualizar todos para `/api/v1/*`

Ver: [Plano 03](/docs/planos-acao/03-migrar-apis-v1.md)

---

## Problema 4: Falta de Hooks Padronizados 🟡

### Descrição

Apenas 1 hook customizado implementado (`useContasPagar`). Outros componentes duplicam lógica de fetch:

```typescript
// ❌ Duplicado em vários componentes
const [data, setData] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  async function fetchData() {
    setLoading(true)
    const res = await fetch('/api/...')
    setData(await res.json())
    setLoading(false)
  }
  fetchData()
}, [])
```

### Solução

Criar hooks padronizados para todas entidades

Ver: [ADR-006](/docs/adrs/006-custom-hooks-pattern.md) | [Plano 04](/docs/planos-acao/04-padronizar-hooks.md)

---

## Problema 5: Navegação Hierárquica Manual 🟡

### Descrição

Componentes navegam via props `onNavigate`:

```typescript
<ClientsHub onNavigate={setActiveTab} />

// Dentro do componente:
<Button onClick={() => onNavigate('clients-fixed')}>
  Clientes Fixos
</Button>
```

### Solução

Usar `<Link>` do Next.js e `useRouter()`

---

## Métricas

```
Total de Componentes: 42 (18 UI + 24 Feature)
Linhas de Código: ~6.594 linhas
Rotas Reais: 2 (/, /preview-contrato)
Tabs Simuladas: 7
Custom Hooks: 1 (useContasPagar)
TODOs Pendentes: 6
```

---

Ver também:
- [Estrutura de Componentes](/docs/frontend/estrutura-componentes.md)
- [Plano de Refatoração de Rotas](/docs/frontend/plano-refatoracao-rotas.md)

---

**Última Atualização:** 18/11/2025
