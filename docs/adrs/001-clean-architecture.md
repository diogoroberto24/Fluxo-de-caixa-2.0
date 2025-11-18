# ADR-001: Adoção de Clean Architecture

**Status:** Aceito
**Data:** Janeiro 2025
**Decisor:** Equipe de Desenvolvimento

---

## Contexto

O projeto Fluxo de Caixa 2.0 é um sistema de gestão financeira que precisa:

- Ser facilmente testável e manutenível
- Permitir evolução sem acoplamento forte com frameworks
- Separar regras de negócio de detalhes de infraestrutura
- Facilitar a troca de componentes (banco de dados, UI, etc.)
- Suportar múltiplos clientes/interfaces no futuro

Sem uma arquitetura bem definida, o código tende a:

- Misturar lógica de negócio com lógica de apresentação
- Criar dependências circulares
- Dificultar testes unitários
- Tornar mudanças arriscadas e custosas

---

## Decisão

Adotamos **Clean Architecture** (Arquitetura Limpa) como padrão arquitetural do projeto, implementando uma separação clara de responsabilidades em camadas concêntricas.

### Camadas Implementadas

> **Nota:** Este projeto usa uma **versão simplificada** de Clean Architecture, sem Domain Layer explícito. As regras de negócio e tipos estão distribuídos entre Use Cases e Shared Layer.

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (/app - Next.js API Routes)          │
│    (React Components)                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Application Layer                │
│    (/server/use-cases)                  │
│    (Casos de Uso + Regras de Negócio)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Infrastructure Layer               │
│    (/server/infra)                      │
│    (Repos, Prisma, HTTP, Queue, Mail)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Shared Layer                   │
│    (/shared)                            │
│    (Types, Validation, Utils, Constants)│
└─────────────────────────────────────────┘
```

---

## Estrutura de Pastas

**Estrutura Real do Projeto:**

```
/server
├── config/            # Configurações gerais
│
├── use-cases/         # Camada de Aplicação
│   ├── clientes/
│   │   ├── criar-cliente.ts
│   │   ├── listar-clientes.ts
│   │   ├── buscar-cliente.ts
│   │   └── atualizar-cliente.ts
│   ├── cobrancas/
│   ├── contas-a-pagar/
│   ├── contratos/
│   ├── balancos/
│   ├── produtos/
│   ├── recorrencias/
│   └── use-case.ts    # Classe base abstrata
│
└── infra/             # Camada de Infraestrutura
    ├── repos/        # Repositories (Prisma)
    │   ├── interfaces/      # Contratos de Repository
    │   ├── implementations/ # Implementações com Prisma
    │   └── factory.ts       # Factory de Repositories
    ├── http/         # Adaptadores HTTP
    ├── queue/        # Workers com BullMQ
    ├── payments/     # Integrações de pagamento
    └── mail/         # Serviços de email

/shared                # Código compartilhado (substitui Domain Layer)
├── validation/       # Schemas Zod (regras de validação)
├── types/           # TypeScript types (entidades)
├── utils/           # Funções utilitárias (Money, formatters)
├── constants/       # Constantes de negócio
└── errors/          # Classes de erro customizadas

/app                  # Camada de Apresentação
├── api/v1/          # API Routes versionadas (Clean Architecture)
├── api/             # API Routes legacy (a deprecar)
└── (dashboard)/     # React Components (futuro)
```

---

## Princípios Aplicados

### 1. Dependency Rule (Regra de Dependência)

> As dependências apontam sempre para dentro (camadas externas dependem de internas, nunca o contrário)

```typescript
// ❌ ERRADO - Use Case depende diretamente de Prisma
// /server/use-cases/clientes/criar-cliente.ts
import { prisma } from '@/lib/db'

export class CriarClienteUseCase {
  async execute(data) {
    return await prisma.cliente.create({ data }) // ❌ Acoplamento direto
  }
}

// ✅ CORRETO - Use Case depende de interface, infra implementa
// /server/infra/repos/interfaces/cliente-repository.ts
export interface ClienteRepository {
  create(data: CreateClienteInput): Promise<Cliente>
}

// /server/infra/repos/implementations/prisma-cliente-repository.ts
import { prisma } from '@/lib/db'
import type { ClienteRepository } from '../interfaces'

export class PrismaClienteRepository implements ClienteRepository {
  async create(data: CreateClienteInput): Promise<Cliente> {
    return await prisma.cliente.create({ data })
  }
}

// /server/use-cases/clientes/criar-cliente.ts
import type { ClienteRepository } from '@/server/infra/repos/interfaces'

export class CriarClienteUseCase {
  constructor(private clienteRepository: ClienteRepository) {}

  async execute(data) {
    return await this.clienteRepository.create(data) // ✅ Desacoplado
  }
}
```

### 2. Separation of Concerns (Separação de Responsabilidades)

Cada camada tem uma responsabilidade única e bem definida:

- **Domain**: Regras de negócio puras
- **Use Cases**: Orquestração de entidades e repositórios
- **Infrastructure**: Detalhes técnicos (banco, HTTP, etc.)
- **Presentation**: Interface com usuário

### 3. Inversion of Control (Inversão de Controle)

Use Cases dependem de interfaces, não de implementações concretas:

```typescript
// Interface no domínio
export interface ClienteRepository {
  create(data: CreateClienteInput): Promise<Cliente>
  findById(id: string): Promise<Cliente | null>
}

// Use Case depende da interface
export class CriarClienteUseCase {
  constructor(private clienteRepository: ClienteRepository) {}

  async execute(data: CreateClienteInput): Promise<Cliente> {
    // Implementação usa a interface
    return await this.clienteRepository.create(data)
  }
}
```

---

## Benefícios

### 1. **Testabilidade**

- Use Cases podem ser testados sem banco de dados (mocks)
- Regras de negócio isoladas são facilmente testáveis
- Testes unitários rápidos e confiáveis

```typescript
// Teste com mock
const mockRepo = {
  create: jest.fn().mockResolvedValue(clienteMock)
}
const useCase = new CriarClienteUseCase(mockRepo)
const result = await useCase.execute(validData)
expect(mockRepo.create).toHaveBeenCalledWith(validData)
```

### 2. **Manutenibilidade**

- Mudanças em uma camada não afetam outras
- Código organizado e fácil de navegar
- Regras de negócio centralizadas

### 3. **Flexibilidade**

- Trocar Prisma por outro ORM afeta apenas `/server/infra/repos`
- Adicionar GraphQL API não afeta use cases
- Migrar de Next.js para outro framework preserva lógica de negócio

### 4. **Reutilização**

- Use Cases podem ser chamados de API, CLI, Workers, etc.
- Validação Zod compartilhada entre frontend e backend
- Value Objects reutilizáveis

---

## Consequências

### Positivas ✅

1. **Código mais limpo e organizado**
2. **Testes mais fáceis de escrever**
3. **Menor acoplamento entre componentes**
4. **Regras de negócio protegidas e centralizadas**
5. **Facilita onboarding de novos desenvolvedores**

### Negativas ⚠️

1. **Mais arquivos e pastas** (overhead inicial)
2. **Curva de aprendizado** para quem não conhece o padrão
3. **Boilerplate** em casos muito simples
4. **Necessidade de disciplina** para manter padrão

### Mitigações 🛠️

- **Documentação clara** (este ADR!)
- **Exemplos de referência** (use cases existentes)
- **Code reviews** para garantir conformidade
- **Geração de código** para reduzir boilerplate

---

## Exemplos Práticos

### Exemplo 1: Criar Cliente

#### Shared Layer

```typescript
// /shared/types/cliente.ts
export interface Cliente {
  id: string
  nome: string
  documento: string
  email: string
  // ...
}

// /shared/validation/clientes.ts
export const criarClienteSchema = z.object({
  nome: z.string().min(1),
  documento: z.string(),
  email: z.string().email()
})
```

#### Infrastructure Layer

```typescript
// /server/infra/repos/interfaces/cliente-repository.ts
export interface ClienteRepository {
  create(data: CreateClienteInput): Promise<Cliente>
  exists(documento: string): Promise<boolean>
}

// /server/infra/repos/implementations/prisma-cliente-repository.ts
import { prisma } from '@/lib/db'
import type { ClienteRepository } from '../interfaces'

export class PrismaClienteRepository implements ClienteRepository {
  async create(data: CreateClienteInput): Promise<Cliente> {
    return await prisma.cliente.create({ data })
  }

  async exists(documento: string): Promise<boolean> {
    const count = await prisma.cliente.count({ where: { documento } })
    return count > 0
  }
}
```

#### Application Layer

```typescript
// /server/use-cases/clientes/criar-cliente.ts
import { UseCase } from '../use-case'
import { criarClienteSchema } from '@/shared/validation/clientes'
import type { ClienteRepository } from '@/server/infra/repos/interfaces'

export class CriarClienteUseCase extends UseCase {
  protected schema = criarClienteSchema

  constructor(private clienteRepository: ClienteRepository) {
    super()
  }

  protected async handle(data: CreateClienteInput): Promise<Cliente> {
    // Regra de negócio: documento único
    if (await this.clienteRepository.exists(data.documento)) {
      throw new ConflictError('Cliente já existe')
    }

    return await this.clienteRepository.create(data)
  }
}
```

#### Presentation Layer

```typescript
// /app/api/v1/clientes/route.ts
import { CriarClienteUseCase } from '@/server/use-cases/clientes/criar-cliente'
import { RepositoryFactory } from '@/server/infra/repos/factory'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const useCase = new CriarClienteUseCase(RepositoryFactory.clienteRepository)
  const result = await useCase.execute(body)
  return NextResponse.json({ success: true, data: result })
}
```

---

## Status de Implementação

| Camada | Status | Percentual |
|--------|--------|-----------|
| Shared | ✅ Implementado | 100% |
| Infrastructure | ✅ Implementado | 100% |
| Use Cases | 🟡 Parcial | ~45% |
| Presentation | 🟡 Parcial | ~60% |

### Use Cases Implementados

- ✅ Clientes: Criar, Listar, Buscar, Atualizar, Inativar
- ✅ Cobranças: Criar, Pagar
- ✅ Contas a Pagar: Criar, Listar, Atualizar, Deletar, Marcar como Paga
- ✅ Contratos: Gerar
- ✅ Balanços: Criar, Calcular Saldo
- ✅ Produtos: Criar, Listar

### Pendentes de Migração

- ❌ Dashboard (ainda usa queries diretas)
- ❌ Clientes Eventuais (lógica na rota)
- ❌ Categorias (CRUD direto no Prisma)
- ❌ Histórico de Honorários

---

## Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Ports and Adapters (Hexagonal Architecture)](https://alistair.cockburn.us/hexagonal-architecture/)

---

## Decisões Relacionadas

- [ADR-002: Padrão Use Cases](/docs/adrs/002-use-cases-pattern.md)
- [ADR-005: Versionamento de API](/docs/adrs/005-api-versioning.md)

---

**Última Atualização:** 18/11/2025
