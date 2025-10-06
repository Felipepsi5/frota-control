# Configuração para Integração com API .NET Core

## Visão Geral

Este documento descreve como configurar e executar a aplicação Angular FrotaControl para trabalhar com uma API .NET Core rodando em `http://localhost:5139`.

## Configurações Realizadas

### 1. Environment Files Atualizados

#### `src/environments/environment.ts` (Desenvolvimento)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5139/api', // API .NET Core local
  firebase: {
    // ... configurações do Firebase
  }
};
```

#### `src/environments/environment.prod.ts` (Produção)
```typescript
export const environment = {
  production: true,
  apiUrl: '/api', // Em produção, usar proxy do Nginx para API .NET Core
  firebase: {
    // ... configurações do Firebase
  }
};
```

### 2. Proxy Configuration

#### `proxy-dotnet-api.conf.json` (Novo arquivo)
```json
{
  "/api/*": {
    "target": "http://localhost:5139",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api": "/api"
    },
    "headers": {
      "Connection": "keep-alive"
    }
  }
}
```

### 3. Scripts NPM Atualizados

Novos scripts adicionados ao `package.json`:

```json
{
  "scripts": {
    "start:dotnet": "ng serve --proxy-config proxy-dotnet-api.conf.json",
    "dev:dotnet": "npm run start:dotnet"
  }
}
```

### 4. Configuração Nginx para Produção

#### `nginx-dotnet.conf` (Novo arquivo)
- Configurado para fazer proxy para a API .NET Core
- Upstream configurado para `dotnet-api:80`
- CORS headers configurados
- Rate limiting mantido

### 5. Docker Compose para API .NET Core

#### `docker-compose-dotnet.yml` (Novo arquivo)
- Serviço `dotnet-api` na porta 5139
- Banco SQL Server configurado
- Rede compartilhada entre serviços
- Volumes persistentes para dados

### 6. Dockerfile para API .NET Core

#### `Dockerfile.api` (Novo arquivo)
- Baseado em .NET 8
- Multi-stage build
- Usuário não-root para segurança
- Otimizado para produção

## Como Executar

### Desenvolvimento Local

1. **Iniciar a API .NET Core:**
   ```bash
   # Na pasta da API .NET Core
   dotnet run --urls="http://localhost:5139"
   ```

2. **Iniciar o Angular com proxy:**
   ```bash
   # Na pasta do Angular
   npm run dev:dotnet
   # ou
   npm run start:dotnet
   ```

3. **Acessar a aplicação:**
   - Frontend: `http://localhost:4200`
   - API: `http://localhost:5139/api`
   - Swagger: `http://localhost:5139/swagger`

### Desenvolvimento com Docker

1. **Executar com Docker Compose:**
   ```bash
   docker-compose -f docker-compose-dotnet.yml up -d
   ```

2. **Acessar os serviços:**
   - Frontend: `http://localhost`
   - API: `http://localhost:5139/api`
   - Banco: `localhost:1433`

### Produção

1. **Build da aplicação:**
   ```bash
   npm run build:prod
   ```

2. **Deploy com Docker:**
   ```bash
   docker-compose -f docker-compose-dotnet.yml up -d
   ```

## Endpoints da API

A aplicação Angular está configurada para fazer requisições para os seguintes endpoints:

### Autenticação
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Caminhões
- `GET /api/trucks`
- `GET /api/trucks/{id}`
- `POST /api/trucks`
- `PUT /api/trucks/{id}`
- `DELETE /api/trucks/{id}`

### Lançamentos Financeiros
- `GET /api/financial-entries`
- `GET /api/financial-entries/{id}`
- `POST /api/financial-entries`
- `PUT /api/financial-entries/{id}`
- `DELETE /api/financial-entries/{id}`

### Resumos e Dashboard
- `GET /api/summary/dashboard`
- `GET /api/summary/trucks/performance`
- `GET /api/summary/trucks/{truckId}/performance`

### Categorias
- `GET /api/categories`
- `GET /api/categories/{type}`

## Configurações de CORS

A API .NET Core deve estar configurada com CORS para permitir requisições do Angular:

```csharp
// Program.cs ou Startup.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://yourdomain.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowAngularApp");
```

## Variáveis de Ambiente

### Desenvolvimento
```bash
# API .NET Core
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://localhost:5139
ConnectionStrings__DefaultConnection="Server=localhost;Database=FrotaControl;Trusted_Connection=true;"

# Angular
NG_APP_API_URL=http://localhost:5139/api
```

### Produção
```bash
# API .NET Core
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
ConnectionStrings__DefaultConnection="Server=db;Database=FrotaControl;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=true;"

# Angular
NG_APP_API_URL=/api
```

## Troubleshooting

### Problemas Comuns

1. **CORS Error:**
   - Verificar se a API .NET Core tem CORS configurado
   - Verificar se as origens estão corretas

2. **Proxy não funciona:**
   - Verificar se a API está rodando na porta 5139
   - Verificar se o arquivo `proxy-dotnet-api.conf.json` está correto

3. **404 Not Found:**
   - Verificar se os endpoints da API estão corretos
   - Verificar se a API está respondendo em `/api`

4. **Docker não inicia:**
   - Verificar se as portas não estão em uso
   - Verificar se o Dockerfile.api está na pasta correta

### Logs

```bash
# Logs da API .NET Core
docker logs frotacontrol-api

# Logs do Angular
docker logs frotacontrol-web

# Logs do banco
docker logs frotacontrol-db
```

## Migração do JSON Server

Para migrar completamente do JSON Server para a API .NET Core:

1. **Parar o JSON Server:**
   ```bash
   # Parar containers antigos
   docker-compose down
   ```

2. **Iniciar com API .NET Core:**
   ```bash
   # Iniciar novos containers
   docker-compose -f docker-compose-dotnet.yml up -d
   ```

3. **Migrar dados:**
   - Usar scripts de migração do Entity Framework
   - Ou importar dados do `db.json` para SQL Server

## Próximos Passos

1. **Implementar autenticação JWT** na API .NET Core
2. **Configurar HTTPS** em produção
3. **Implementar logs** estruturados
4. **Configurar monitoramento** e health checks
5. **Implementar cache** Redis se necessário
6. **Configurar backup** automático do banco

---

## Comandos Rápidos

```bash
# Desenvolvimento local
npm run dev:dotnet

# Build para produção
npm run build:prod

# Docker desenvolvimento
docker-compose -f docker-compose-dotnet.yml up -d

# Parar tudo
docker-compose -f docker-compose-dotnet.yml down

# Ver logs
docker-compose -f docker-compose-dotnet.yml logs -f
```
