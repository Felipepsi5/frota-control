# Documentação para Desenvolvimento da WebAPI .NET Core - FrotaControl

## Visão Geral da Aplicação

A aplicação **FrotaControl** é um sistema de gestão de frota de caminhões que permite:

- **Gestão de Caminhões**: Cadastro, edição e controle de status dos veículos
- **Controle Financeiro**: Lançamento de receitas e despesas por caminhão
- **Relatórios e Dashboards**: Análise de performance e resumos mensais
- **Autenticação**: Sistema de login com roles (admin/user)
- **Categorização**: Sistema de categorias para receitas e despesas

## Arquitetura da API

### Estrutura de Dados

#### 1. Entidade: Truck (Caminhão)
```csharp
public class Truck
{
    public string Id { get; set; } // Placa do caminhão (ex: "ABC1234")
    public string LicensePlate { get; set; }
    public string Model { get; set; }
    public int Year { get; set; }
    public string Status { get; set; } // "ativo" | "inativo"
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateTruckRequest
{
    public string LicensePlate { get; set; }
    public string Model { get; set; }
    public int Year { get; set; }
    public string Status { get; set; }
}

public class UpdateTruckRequest
{
    public string? Model { get; set; }
    public int? Year { get; set; }
    public string? Status { get; set; }
}
```

#### 2. Entidade: FinancialEntry (Lançamento Financeiro)
```csharp
public class FinancialEntry
{
    public string Id { get; set; }
    public string TruckId { get; set; } // FK para Truck
    public DateTime Date { get; set; }
    public string EntryType { get; set; } // "expense" | "revenue"
    public string Category { get; set; }
    public decimal Amount { get; set; }
    public decimal? LitersFilled { get; set; }
    public int? OdometerReading { get; set; }
    public string CreatedUserId { get; set; } // FK para User
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateFinancialEntryRequest
{
    public string TruckId { get; set; }
    public DateTime Date { get; set; }
    public string EntryType { get; set; }
    public string Category { get; set; }
    public decimal Amount { get; set; }
    public decimal? LitersFilled { get; set; }
    public int? OdometerReading { get; set; }
}

public class UpdateFinancialEntryRequest
{
    public DateTime? Date { get; set; }
    public string? EntryType { get; set; }
    public string? Category { get; set; }
    public decimal? Amount { get; set; }
    public decimal? LitersFilled { get; set; }
    public int? OdometerReading { get; set; }
}

public class FinancialEntryFilters
{
    public string? TruckId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? EntryType { get; set; }
    public string? Category { get; set; }
}
```

#### 3. Entidade: MonthlySummary (Resumo Mensal)
```csharp
public class MonthlySummary
{
    public string Id { get; set; } // truckId_year_month (ex: "ABC1234_2024_01")
    public string TruckId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetIncome { get; set; }
    public decimal KmPerLiterAverage { get; set; }
    public Dictionary<string, decimal> ExpenseBreakdown { get; set; }
    public int TotalKm { get; set; }
    public decimal TotalLiters { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class DashboardSummary
{
    public int TotalTrucks { get; set; }
    public int ActiveTrucks { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetIncome { get; set; }
    public decimal AverageKmPerLiter { get; set; }
    public List<MonthlySummary> MonthlySummaries { get; set; }
}

public class TruckPerformance
{
    public string TruckId { get; set; }
    public string LicensePlate { get; set; }
    public string Model { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetIncome { get; set; }
    public decimal KmPerLiterAverage { get; set; }
    public int TotalKm { get; set; }
    public decimal TotalLiters { get; set; }
}
```

#### 4. Entidade: User (Usuário)
```csharp
public class User
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string? DisplayName { get; set; }
    public string Role { get; set; } // "admin" | "user"
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
```

#### 5. Entidade: Category (Categoria)
```csharp
public class Category
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; } // "expense" | "revenue"
    public string? Description { get; set; }
    public string? Icon { get; set; }
}
```

## Endpoints da API

### Base URL
```
/api
```

### 1. Autenticação
```
POST /api/auth/login
Body: { "email": "string", "password": "string" }
Response: { "token": "string", "user": User }

POST /api/auth/logout
Headers: Authorization: Bearer {token}

GET /api/auth/me
Headers: Authorization: Bearer {token}
Response: User
```

### 2. Caminhões (Trucks)
```
GET /api/trucks
Query params: 
  - status?: string (ativo|inativo)
  - year?: int
  - model?: string
  - _page?: int
  - _limit?: int
Response: Truck[] ou TruckPaginationResponse

GET /api/trucks/{id}
Response: Truck

POST /api/trucks
Body: CreateTruckRequest
Response: Truck

PUT /api/trucks/{id}
Body: UpdateTruckRequest
Response: Truck

DELETE /api/trucks/{id}
Response: 204 No Content

GET /api/trucks/active
Response: Truck[]
```

### 3. Lançamentos Financeiros (Financial Entries)
```
GET /api/financial-entries
Query params:
  - truckId?: string
  - startDate?: DateTime
  - endDate?: DateTime
  - entryType?: string (expense|revenue)
  - category?: string
  - _page?: int
  - _limit?: int
Response: FinancialEntry[] ou FinancialEntryPaginationResponse

GET /api/financial-entries/{id}
Response: FinancialEntry

POST /api/financial-entries
Body: CreateFinancialEntryRequest
Response: FinancialEntry

PUT /api/financial-entries/{id}
Body: UpdateFinancialEntryRequest
Response: FinancialEntry

DELETE /api/financial-entries/{id}
Response: 204 No Content

GET /api/financial-entries/truck/{truckId}
Response: FinancialEntry[]

GET /api/financial-entries/user/{userId}
Response: FinancialEntry[]
```

### 4. Resumos e Dashboard
```
GET /api/summary/dashboard
Response: DashboardSummary

GET /api/summary/trucks/performance
Response: TruckPerformance[]

GET /api/summary/trucks/{truckId}/performance
Response: TruckPerformance

GET /api/summary/trucks/{truckId}/monthly
Response: MonthlySummary[]

GET /api/summary/trucks/{truckId}/monthly/{year}/{month}
Response: MonthlySummary
```

### 5. Categorias
```
GET /api/categories
Response: Category[]

GET /api/categories/{type}
Query param: type = "expense" | "revenue"
Response: Category[]

GET /api/categories/{id}
Response: Category
```

### 6. Usuários (Admin apenas)
```
GET /api/users
Response: User[]

GET /api/users/{id}
Response: User

PUT /api/users/{id}
Body: { "role": "admin" | "user" }
Response: User
```

## Estrutura de Resposta Padrão

### Sucesso
```json
{
  "data": {}, // Dados da resposta
  "message": "string", // Mensagem opcional
  "success": true
}
```

### Erro
```json
{
  "error": "string", // Mensagem de erro
  "details": {}, // Detalhes adicionais opcionais
  "success": false
}
```

### Paginação
```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

## Categorias Pré-definidas

### Despesas (Expense)
- Abastecimento
- Manutenção
- Pneus
- Seguro
- IPVA
- Licenciamento
- Pedágio
- Estacionamento
- Multas
- Outros

### Receitas (Revenue)
- Pagamento Viagem
- Frete
- Adiantamento
- Outros

## Configurações de Banco de Dados

### SQL Server / SQLite
```sql
-- Tabela Trucks
CREATE TABLE Trucks (
    Id NVARCHAR(10) PRIMARY KEY,
    LicensePlate NVARCHAR(10) NOT NULL UNIQUE,
    Model NVARCHAR(100) NOT NULL,
    Year INT NOT NULL,
    Status NVARCHAR(10) NOT NULL CHECK (Status IN ('ativo', 'inativo')),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Tabela FinancialEntries
CREATE TABLE FinancialEntries (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TruckId NVARCHAR(10) NOT NULL,
    Date DATETIME2 NOT NULL,
    EntryType NVARCHAR(10) NOT NULL CHECK (EntryType IN ('expense', 'revenue')),
    Category NVARCHAR(50) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    LitersFilled DECIMAL(8,2) NULL,
    OdometerReading INT NULL,
    CreatedUserId NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (TruckId) REFERENCES Trucks(Id),
    FOREIGN KEY (CreatedUserId) REFERENCES Users(Id)
);

-- Tabela Users
CREATE TABLE Users (
    Id NVARCHAR(50) PRIMARY KEY,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    DisplayName NVARCHAR(100),
    Role NVARCHAR(10) NOT NULL CHECK (Role IN ('admin', 'user')),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    LastLoginAt DATETIME2 NULL
);

-- Tabela Categories
CREATE TABLE Categories (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Type NVARCHAR(10) NOT NULL CHECK (Type IN ('expense', 'revenue')),
    Description NVARCHAR(200),
    Icon NVARCHAR(50)
);
```

## Middleware e Configurações

### CORS
```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### Autenticação JWT
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "FrotaControl",
            ValidAudience = "FrotaControlUsers",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-secret-key"))
        };
    });
```

### Swagger
```csharp
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { 
        Title = "FrotaControl API", 
        Version = "v1" 
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
});
```

## Validações e Regras de Negócio

### Trucks
- Placa deve ser única
- Ano deve ser entre 1900 e ano atual
- Status deve ser "ativo" ou "inativo"

### FinancialEntries
- Amount deve ser maior que 0
- TruckId deve existir
- EntryType deve ser "expense" ou "revenue"
- Category deve ser válida para o EntryType
- LitersFilled e OdometerReading são opcionais mas devem ser positivos quando informados

### Permissões
- Usuários comuns podem apenas visualizar e criar lançamentos
- Apenas admins podem editar/excluir lançamentos de outros usuários
- Apenas admins podem gerenciar caminhões e usuários

## Logs e Monitoramento

### Logging
```csharp
services.AddLogging(builder =>
{
    builder.AddConsole();
    builder.AddDebug();
    builder.AddFile("logs/frotacontrol-{Date}.txt");
});
```

### Health Checks
```csharp
services.AddHealthChecks()
    .AddDbContextCheck<FrotaControlContext>()
    .AddCheck("api", () => HealthCheckResult.Healthy());
```

## Testes

### Estrutura de Testes
- Testes unitários para Services
- Testes de integração para Controllers
- Testes de repositório para Data Access
- Testes de validação para Models

### Exemplo de Teste de Controller
```csharp
[Test]
public async Task GetTrucks_ShouldReturnOkResult()
{
    // Arrange
    var mockService = new Mock<ITruckService>();
    mockService.Setup(x => x.GetAllAsync()).ReturnsAsync(new List<Truck>());
    
    var controller = new TrucksController(mockService.Object);
    
    // Act
    var result = await controller.GetTrucks();
    
    // Assert
    Assert.IsType<OkObjectResult>(result);
}
```

## Deploy e Configuração

### Environment Variables
```
DATABASE_CONNECTION_STRING=Server=localhost;Database=FrotaControl;Trusted_Connection=true;
JWT_SECRET_KEY=your-secret-key-here
JWT_ISSUER=FrotaControl
JWT_AUDIENCE=FrotaControlUsers
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:4200,https://yourdomain.com
```

### Docker
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FrotaControl.Api/FrotaControl.Api.csproj", "FrotaControl.Api/"]
RUN dotnet restore "FrotaControl.Api/FrotaControl.Api.csproj"
COPY . .
WORKDIR "/src/FrotaControl.Api"
RUN dotnet build "FrotaControl.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FrotaControl.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FrotaControl.Api.dll"]
```

## Considerações de Performance

### Cache
- Cache de categorias (sempre as mesmas)
- Cache de resumos mensais (atualizar quando houver novos lançamentos)
- Cache de lista de caminhões ativos

### Paginação
- Implementar paginação em todas as listagens
- Limite padrão de 20 itens por página
- Máximo de 100 itens por página

### Índices de Banco
```sql
CREATE INDEX IX_FinancialEntries_TruckId ON FinancialEntries(TruckId);
CREATE INDEX IX_FinancialEntries_Date ON FinancialEntries(Date);
CREATE INDEX IX_FinancialEntries_EntryType ON FinancialEntries(EntryType);
CREATE INDEX IX_FinancialEntries_CreatedUserId ON FinancialEntries(CreatedUserId);
```

## Segurança

### Validação de Entrada
- Usar Data Annotations nos DTOs
- Validar todos os inputs no controller
- Sanitizar strings para prevenir SQL Injection

### Rate Limiting
```csharp
services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("Api", policy =>
    {
        policy.PermitLimit = 100;
        policy.Window = TimeSpan.FromMinutes(1);
    });
});
```

### HTTPS
- Forçar HTTPS em produção
- Usar certificados SSL válidos
- Configurar HSTS headers

---

## Prompt para Criação da API

Com base nesta documentação, você pode usar o seguinte prompt para criar a aplicação .NET Core WebAPI:

---

**PROMPT PARA CRIAÇÃO DA API:**

```
Crie uma aplicação .NET Core 8 WebAPI completa para o sistema FrotaControl seguindo exatamente esta especificação:

REQUISITOS:
1. Estrutura Clean Architecture com camadas: Domain, Application, Infrastructure, Presentation
2. Entity Framework Core com SQL Server
3. Autenticação JWT
4. Swagger/OpenAPI
5. Logging estruturado
6. Health Checks
7. CORS configurado para Angular
8. Validações com Data Annotations
9. Paginação em todas as listagens
10. Cache para categorias e resumos

ENTIDADES PRINCIPAIS:
- Truck (caminhões)
- FinancialEntry (lançamentos financeiros)
- User (usuários)
- Category (categorias)
- MonthlySummary (resumos mensais)

ENDPOINTS NECESSÁRIOS:
- /api/auth/* (login, logout, me)
- /api/trucks/* (CRUD + filtros)
- /api/financial-entries/* (CRUD + filtros + paginação)
- /api/summary/* (dashboard, performance, resumos)
- /api/categories/* (listar categorias)

REGRAS DE NEGÓCIO:
- Usuários comuns só podem criar/ver seus lançamentos
- Admins podem gerenciar tudo
- Validações de placa única, valores positivos, etc.
- Categorias pré-definidas (despesas e receitas)

TECNOLOGIAS:
- .NET 8
- Entity Framework Core
- JWT Bearer Authentication
- AutoMapper
- FluentValidation
- Serilog
- Swashbuckle

Estrutura o projeto seguindo Clean Architecture com injeção de dependência, repositories pattern, e DTOs para todas as operações. Inclua testes unitários básicos e documentação Swagger completa.
```

---

Esta documentação fornece todas as informações necessárias para criar uma WebAPI .NET Core completamente compatível com sua aplicação Angular FrotaControl.


