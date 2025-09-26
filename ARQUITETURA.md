# Arquitetura do Sistema de Fluxo de Caixa

## Visão Geral

Este projeto segue uma arquitetura limpa e bem estruturada, separando responsabilidades entre diferentes camadas:

- **Frontend**: Componentes React/Next.js
- **API**: Rotas Next.js que chamam use-cases
- **Use-cases**: Lógica de negócio
- **Repositórios**: Acesso a dados
- **Shared**: Código compartilhado (validações, tipos, utilitários)

## Estrutura de Pastas

### `/app/api/v1/`
Rotas da API. Cada rota é enxuta e apenas:
- Valida entrada
- Chama o use-case correspondente
- Retorna resposta

### `/shared/`
Código compartilhado entre backend e frontend:

- **`/validation`**: Esquemas de validação com Zod
- **`/utils`**: Classes utilitárias (ex: Money para valores monetários)
- **`/types`**: Tipos do Prisma + tipos auxiliares da API
- **`/errors`**: Centralização de erros (AppError, ConflictError, etc.)

### `/server/`
Responsável por infraestrutura e lógica de negócio:

- **`/config`**: Configurações da aplicação (env.ts)
- **`/infra/`**: Conexões externas
  - **`/repos`**: Repositórios para acesso a dados
    - **`/interfaces`**: Definição das interfaces
    - **`/implementations`**: Implementação concreta (Prisma)
- **`/use-cases/`**: Regras de negócio por domínio

## Regras da Arquitetura

### Models do Prisma
- Nomes no singular
- Usar `@map` para tabelas no plural
- Nomes no banco em `snake_case`
- Valores monetários em centavos (inteiros)
- Campo `metadata` Json em todas as tabelas

### Classe UseCase
Todos os use-cases herdam de `UseCase` e devem ter:
- Tipos obrigatórios: `Request`, `Result`, `Errors[]`
- Método `execute`: valida entrada e chama `handle`
- Método `handle`: contém a lógica de negócio

### Repositórios
- Interface define o contrato
- Implementação concreta com Prisma
- Factory centraliza instâncias

### Rotas da API
- Importam use-case correspondente
- Validam dados com Zod
- Executam use-case via `.execute()`
- Retornam resultado em JSON

## Domínios Implementados

### Clientes
- **Use-cases**: CriarCliente, ListarClientes, BuscarCliente, AtualizarCliente
- **Validações**: createClienteSchema, updateClienteSchema, listClientesSchema
- **Repository**: ClienteRepository (interface) + PrismaClienteRepository (implementação)

### Produtos
- **Use-cases**: CriarProduto, ListarProdutos
- **Validações**: createProdutoSchema, updateProdutoSchema, listProdutosSchema
- **Repository**: ProdutoRepository + PrismaProdutoRepository

### Cobranças
- **Use-cases**: CriarCobranca, MarcarComoPago
- **Validações**: createCobrancaSchema, marcarComoPagoSchema
- **Repository**: CobrancaRepository + PrismaCobrancaRepository

### Categorias
- **Repository**: CategoriaRepository + PrismaCategoriaRepository
- **Validações**: createCategoriaSchema, updateCategoriaSchema

## Utilitários

### Classe Money
Manipulação segura de valores monetários:
```typescript
const valor = Money.fromReais(100.50) // 10050 centavos
console.log(valor.formatted) // "R$ 100,50"
```

### Tratamento de Erros
- `AppError`: Erro base
- `ValidationError`: Dados inválidos
- `NotFoundError`: Recurso não encontrado
- `ConflictError`: Conflito de dados
- `UnauthorizedError`: Não autorizado

## Exemplo de Uso

### Criando um Cliente
```typescript
// 1. Rota recebe dados
const body = await request.json()

// 2. Use-case valida e processa
const useCase = new CriarClienteUseCase(RepositoryFactory.clienteRepository)
const result = await useCase.execute(body)

// 3. Retorna resultado
return NextResponse.json({ success: true, data: result })
```

### Use-case Implementação
```typescript
export class CriarClienteUseCase extends UseCase<Request, Result, Errors> {
  protected schema = createClienteSchema

  protected async handle(data: Request): Promise<Result> {
    // Validações de negócio
    const exists = await this.clienteRepository.exists(data.documento)
    if (exists) throw new ConflictError('Cliente já existe')

    // Criação
    const cliente = await this.clienteRepository.create(data)
    return { cliente }
  }
}
```

## Próximos Passos

1. Implementar use-cases restantes (atualizar, deletar)
2. Adicionar testes unitários
3. Implementar autenticação/autorização
4. Adicionar logs estruturados
5. Implementar cache com Redis
6. Adicionar filas de processamento