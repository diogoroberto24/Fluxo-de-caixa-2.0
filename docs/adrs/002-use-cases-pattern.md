# ADR-002: Padrão Use Cases

**Status:** Aceito
**Data:** Janeiro 2025
**Decisor:** Equipe de Desenvolvimento
**Relacionado a:** [ADR-001: Clean Architecture](/docs/adrs/001-clean-architecture.md)

---

## Contexto

Com a adoção de Clean Architecture (ADR-001), precisamos de um padrão consistente para implementar a **camada de aplicação**. Esta camada orquestra as entidades e repositórios para executar casos de uso específicos do negócio.

### Problemas Identificados

**Antes da padronização:**
```typescript
// ❌ Lógica de negócio espalhada nas rotas API
// /app/api/clients/route.ts (280+ linhas)
export async function POST(request: Request) {
  const body = await request.json()

  // Validação manual
  if (!body.nome || !body.documento) {
    return NextResponse.json({ error: 'Campos obrigatórios' }, { status: 400 })
  }

  // Regra de negócio na rota
  const existingClient = await prisma.cliente.findUnique({
    where: { documento: body.documento }
  })

  if (existingClient) {
    return NextResponse.json({ error: 'Cliente já existe' }, { status: 400 })
  }

  // Lógica complexa de criação
  const newClient = await prisma.cliente.create({ data: body })

  // Mais lógica de negócio (criar cobrança, balanço, etc.)
  if (newClient.honorarios > 0) {
    await prisma.cobranca.create({...})
    await prisma.balanco.create({...})
  }

  return NextResponse.json(newClient)
}
```

**Problemas:**
- Lógica de negócio misturada com detalhes de HTTP
- Difícil de testar (precisa mockar HTTP, Prisma, etc.)
- Código duplicado entre rotas
- Validação inconsistente
- Impossível reutilizar em Workers, CLI, etc.

---

## Decisão

Adotamos o **padrão Use Case** para centralizar toda lógica de aplicação, seguindo os princípios:

1. **Um Use Case = Uma Ação de Negócio**
2. **Validação Automática com Zod**
3. **Classe Base Abstrata** para consistência
4. **Tratamento de Erros Padronizado**
5. **Independência de Framework**

---

## Implementação

### 1. Classe Base UseCase

```typescript
// /server/use-cases/use-case.ts
import { z } from 'zod'
import { ValidationError } from '@/shared/errors'

export abstract class UseCase<Request, Response, Errors = never> {
  protected abstract schema?: z.ZodSchema<Request>

  protected abstract handle(data: Request): Promise<Response | Errors>

  async execute(rawData: unknown): Promise<Response | Errors> {
    // Validação automática
    const validationResult = this.schema?.safeParse(rawData)

    if (validationResult && !validationResult.success) {
      throw new ValidationError(
        'Dados inválidos',
        validationResult.error.errors
      )
    }

    const data = validationResult ? validationResult.data : rawData as Request

    // Execução da lógica de negócio
    return await this.handle(data)
  }
}
```

### 2. Exemplo de Use Case

```typescript
// /server/use-cases/clientes/criar-cliente.ts
import { UseCase } from '../use-case'
import { criarClienteSchema, type CreateClienteInput } from '@/shared/validation/clientes'
import type { Cliente } from '@/shared/types'
import { ConflictError } from '@/shared/errors'
import type { ClienteRepository } from '@/server/infra/repos/interfaces'

interface CriarClienteRequest extends CreateClienteInput {}

interface CriarClienteResponse {
  cliente: Cliente
}

type CriarClienteErrors = ConflictError

export class CriarClienteUseCase extends UseCase<
  CriarClienteRequest,
  CriarClienteResponse,
  CriarClienteErrors
> {
  protected schema = criarClienteSchema

  constructor(private clienteRepository: ClienteRepository) {
    super()
  }

  protected async handle(data: CriarClienteRequest): Promise<CriarClienteResponse> {
    // Regra de negócio: documento único
    const clienteExistente = await this.clienteRepository.exists(data.documento)

    if (clienteExistente) {
      throw new ConflictError('Já existe um cliente com este documento')
    }

    // Criar cliente
    const cliente = await this.clienteRepository.create(data)

    return { cliente }
  }
}
```

### 3. Uso em API Route

```typescript
// /app/api/v1/clientes/route.ts
import { CriarClienteUseCase } from '@/server/use-cases/clientes/criar-cliente'
import { RepositoryFactory } from '@/server/infra/repos/factory'
import { AppError, ValidationError } from '@/shared/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const useCase = new CriarClienteUseCase(RepositoryFactory.clienteRepository)
    const result = await useCase.execute(body)

    if (result instanceof AppError) {
      return NextResponse.json(
        { success: false, error: result.message, code: result.code },
        { status: result.statusCode }
      )
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar cliente:', error)

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
```

---

## Padrões de Nomenclatura

### Estrutura de Arquivos

```
/server/use-cases
├── use-case.ts                    # Classe base abstrata
├── clientes/
│   ├── criar-cliente.ts           # POST
│   ├── listar-clientes.ts         # GET (lista)
│   ├── buscar-cliente.ts          # GET (único)
│   ├── atualizar-cliente.ts       # PUT/PATCH
│   └── inativar-cliente.ts        # DELETE (soft)
├── cobrancas/
│   ├── criar-cobranca.ts
│   ├── pagar-cobranca.ts
│   └── marcar-como-pago.ts
└── contas-a-pagar/
    ├── criar-conta-pagar.ts
    ├── listar-contas-pagar.ts
    ├── atualizar-conta-pagar.ts
    ├── deletar-conta-pagar.ts
    ├── marcar-como-paga.ts
    └── relatorio-mensal.ts
```

### Nomenclatura de Classes

| Ação | Padrão | Exemplo |
|------|--------|---------|
| Criar | `Criar{Entidade}UseCase` | `CriarClienteUseCase` |
| Listar | `Listar{Entidades}UseCase` | `ListarClientesUseCase` |
| Buscar | `Buscar{Entidade}UseCase` | `BuscarClienteUseCase` |
| Atualizar | `Atualizar{Entidade}UseCase` | `AtualizarClienteUseCase` |
| Deletar | `Deletar{Entidade}UseCase` | `DeletarClienteUseCase` |
| Inativar | `Inativar{Entidade}UseCase` | `InativarClienteUseCase` |
| Ação Específica | `{Ação}{Entidade}UseCase` | `PagarCobrancaUseCase` |

---

## Benefícios

### 1. **Centralização de Lógica de Negócio**

✅ **Antes:** Lógica espalhada em 280+ linhas na rota
✅ **Depois:** Lógica concentrada em ~40 linhas no use case

### 2. **Reutilização**

```typescript
// Use case pode ser chamado de qualquer lugar
import { CriarClienteUseCase } from '@/server/use-cases/clientes/criar-cliente'

// API Route
export async function POST(request: NextRequest) {
  const useCase = new CriarClienteUseCase(repo)
  return await useCase.execute(body)
}

// Background Worker
async function processarClientesPendentes() {
  const useCase = new CriarClienteUseCase(repo)
  for (const cliente of pendentes) {
    await useCase.execute(cliente)
  }
}

// CLI
async function importarClientes(arquivo: string) {
  const useCase = new CriarClienteUseCase(repo)
  const clientes = lerArquivo(arquivo)
  for (const cliente of clientes) {
    await useCase.execute(cliente)
  }
}
```

### 3. **Testabilidade**

```typescript
// Teste unitário sem banco de dados
import { CriarClienteUseCase } from './criar-cliente'

describe('CriarClienteUseCase', () => {
  it('deve criar cliente válido', async () => {
    const mockRepo = {
      exists: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue(clienteMock)
    }

    const useCase = new CriarClienteUseCase(mockRepo)
    const result = await useCase.execute(validData)

    expect(result.cliente).toEqual(clienteMock)
    expect(mockRepo.exists).toHaveBeenCalledWith(validData.documento)
    expect(mockRepo.create).toHaveBeenCalledWith(validData)
  })

  it('deve lançar erro se cliente já existe', async () => {
    const mockRepo = {
      exists: jest.fn().mockResolvedValue(true)
    }

    const useCase = new CriarClienteUseCase(mockRepo)

    await expect(useCase.execute(validData)).rejects.toThrow(ConflictError)
  })

  it('deve validar dados de entrada', async () => {
    const mockRepo = {}
    const useCase = new CriarClienteUseCase(mockRepo)

    await expect(useCase.execute({})).rejects.toThrow(ValidationError)
  })
})
```

### 4. **Validação Automática**

```typescript
// Schema compartilhado entre frontend e backend
// /shared/validation/clientes.ts
export const criarClienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  documento: z.string().regex(/^\d{11}$|^\d{14}$/, 'CPF ou CNPJ inválido'),
  email: z.string().email('Email inválido').optional(),
  tributacao: z.enum(['MEI', 'SIMPLES', 'PRESUMIDO', 'REAL'])
})

// Validação automática no use case
const useCase = new CriarClienteUseCase(repo)
await useCase.execute({ nome: '' }) // ❌ Lança ValidationError automaticamente
```

### 5. **Tratamento de Erros Consistente**

```typescript
// /shared/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: any[]) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super(`${entity} não encontrado`, 404, 'NOT_FOUND')
  }
}
```

---

## Status de Implementação

### Use Cases Implementados (45%)

| Domínio | Use Cases | Status |
|---------|-----------|--------|
| **Clientes** | Criar, Listar, Buscar, Atualizar, Inativar | ✅ 100% |
| **Cobranças** | Criar, Pagar | ✅ 100% |
| **Contas a Pagar** | Criar, Listar, Atualizar, Deletar, Marcar Paga, Relatórios | ✅ 100% |
| **Contratos** | Gerar | ✅ 100% |
| **Balanços** | Criar, Calcular Saldo | ✅ 100% |
| **Produtos** | Criar, Listar | ✅ 100% |
| **Clientes Eventuais** | - | ❌ 0% |
| **Categorias** | - | ❌ 0% |
| **Dashboard** | - | ❌ 0% |
| **Histórico Honorário** | - | ❌ 0% |

### Rotas Pendentes de Migração

Ver [Plano de Migração de APIs](/docs/api/plano-migracao-api.md)

---

## Checklist de Criação de Use Case

Ao criar um novo use case, seguir:

- [ ] Criar arquivo em `/server/use-cases/{dominio}/{acao}-{entidade}.ts`
- [ ] Estender classe `UseCase<Request, Response, Errors>`
- [ ] Definir schema de validação Zod (ou reutilizar de `/shared/validation`)
- [ ] Implementar método `handle()` com lógica de negócio
- [ ] Injetar repositories necessários via constructor
- [ ] Adicionar tratamento de erros com classes personalizadas
- [ ] Escrever testes unitários
- [ ] Usar em API Route em `/app/api/v1/`
- [ ] Documentar no README.md do domínio (se existir)

---

## Exemplos Práticos

### Use Case Simples (Listar)

```typescript
export class ListarClientesUseCase extends UseCase<
  ListarClientesRequest,
  ListarClientesResponse
> {
  protected schema = listarClientesSchema

  constructor(private clienteRepository: ClienteRepository) {
    super()
  }

  protected async handle(filters: ListarClientesRequest) {
    const { data, total, page, totalPages } =
      await this.clienteRepository.findMany(filters)

    return { data, total, page, totalPages }
  }
}
```

### Use Case Complexo (Com Múltiplos Repositories)

```typescript
export class CriarCobrancaUseCase extends UseCase<
  CriarCobrancaRequest,
  CriarCobrancaResponse,
  CriarCobrancaErrors
> {
  protected schema = createCobrancaSchema

  constructor(
    private cobrancaRepository: CobrancaRepository,
    private clienteRepository: ClienteRepository,
    private produtoRepository: ProdutoRepository
  ) {
    super()
  }

  protected async handle(data: CriarCobrancaRequest) {
    // Validar cliente
    if (data.cliente_id) {
      const cliente = await this.clienteRepository.findById(data.cliente_id)
      if (!cliente) {
        throw new NotFoundError('Cliente')
      }
    }

    // Validar produtos
    for (const item of data.itens) {
      const produto = await this.produtoRepository.findById(item.produto_id)
      if (!produto) {
        throw new NotFoundError(`Produto ${item.produto_id}`)
      }
    }

    // Calcular totais
    const subtotal = data.itens.reduce(
      (acc, item) => acc + item.valor_unitario * item.quantidade,
      0
    )
    const total = subtotal - data.desconto

    // Criar cobrança
    const cobranca = await this.cobrancaRepository.create({
      ...data,
      subtotal,
      total
    })

    return { cobranca }
  }
}
```

---

## Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Command Pattern](https://refactoring.guru/design-patterns/command)

---

## Decisões Relacionadas

- [ADR-001: Clean Architecture](/docs/adrs/001-clean-architecture.md)
- [ADR-005: Versionamento de API](/docs/adrs/005-api-versioning.md)
- [Plano de Migração de APIs](/docs/api/plano-migracao-api.md)

---

**Última Atualização:** 18/11/2025
