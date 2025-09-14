# FrotaControl - JSON Server Setup

Este documento explica como configurar e usar o JSON Server como backend mock para o FrotaControl.

## 📋 Pré-requisitos

- Node.js instalado
- npm ou yarn
- Angular CLI

## 🚀 Configuração

### 1. Instalação

O JSON Server já está instalado como dependência de desenvolvimento:

```bash
npm install --save-dev json-server concurrently
```

### 2. Estrutura de Arquivos

```
frotacontrol/
├── db.json                 # Banco de dados mock
├── json-server.json        # Configuração do JSON Server
├── middleware.js           # Middleware customizado
├── routes.json            # Rotas customizadas
└── package.json           # Scripts configurados
```

## 🗄️ Banco de Dados Mock (db.json)

O arquivo `db.json` contém dados de exemplo para:

- **trucks**: Caminhões cadastrados
- **financialEntries**: Lançamentos financeiros
- **monthlySummaries**: Resumos mensais
- **users**: Usuários do sistema

### Estrutura dos Dados

#### Trucks
```json
{
  "id": "1",
  "licensePlate": "ABC1234",
  "model": "Volvo FH 540",
  "year": 2022,
  "status": "ativo",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

#### Financial Entries
```json
{
  "id": "1",
  "truckId": "1",
  "date": "2024-01-15T00:00:00.000Z",
  "entryType": "expense",
  "category": "Combustível",
  "amount": 500.00,
  "litersFilled": 100,
  "odometerReading": 50000,
  "description": "Abastecimento no posto Shell",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "createdUserId": "user1"
}
```

## 🛠️ Scripts Disponíveis

### Executar apenas o JSON Server
```bash
npm run json-server
```
- **Porta**: 3000
- **URL**: http://localhost:3000
- **API Base**: http://localhost:3000/api

### Executar JSON Server com rotas customizadas
```bash
npm run json-server:routes
```

### Executar JSON Server + Angular simultaneamente
```bash
npm run dev
```

### Executar JSON Server + Angular com rotas customizadas
```bash
npm run dev:routes
```

## 🌐 Endpoints da API

### Caminhões
- `GET /api/trucks` - Listar todos os caminhões
- `GET /api/trucks/:id` - Buscar caminhão por ID
- `POST /api/trucks` - Criar novo caminhão
- `PUT /api/trucks/:id` - Atualizar caminhão
- `DELETE /api/trucks/:id` - Excluir caminhão

### Lançamentos Financeiros
- `GET /api/financial-entries` - Listar lançamentos
- `GET /api/financial-entries/:id` - Buscar lançamento por ID
- `POST /api/financial-entries` - Criar novo lançamento
- `PUT /api/financial-entries/:id` - Atualizar lançamento
- `DELETE /api/financial-entries/:id` - Excluir lançamento

### Resumos Mensais
- `GET /api/monthly-summaries` - Listar resumos
- `GET /api/monthly-summaries/:id` - Buscar resumo por ID

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário por ID

## 🔧 Configurações

### json-server.json
```json
{
  "port": 3000,
  "host": "localhost",
  "routes": "routes.json",
  "middlewares": ["middleware.js"],
  "watch": true,
  "readOnly": false,
  "noCors": false,
  "noGzip": false
}
```

### middleware.js
- Adiciona CORS headers
- Adiciona timestamps automáticos
- Handle de preflight requests

### routes.json
- Mapeia rotas customizadas
- Adiciona prefixo `/api` para todas as rotas

## 🎯 Como Usar

### 1. Iniciar o Backend
```bash
npm run json-server
```

### 2. Iniciar o Frontend (em outro terminal)
```bash
npm start
```

### 3. Ou executar ambos simultaneamente
```bash
npm run dev
```

### 4. Acessar a aplicação
- **Frontend**: http://localhost:4200
- **API**: http://localhost:3000/api
- **JSON Server UI**: http://localhost:3000

## 📊 Funcionalidades

### ✅ Implementadas
- CRUD completo para caminhões
- CRUD completo para lançamentos financeiros
- Filtros e consultas
- Timestamps automáticos
- CORS habilitado
- Rotas customizadas

### 🔄 Recursos do JSON Server
- **Watch Mode**: Atualiza automaticamente quando db.json muda
- **REST API**: Endpoints REST completos
- **Query Parameters**: Suporte a filtros
- **Pagination**: Suporte a paginação
- **Full-text Search**: Busca em texto completo

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Verificar processos na porta 3000
netstat -ano | findstr :3000

# Matar processo (Windows)
taskkill /PID <PID> /F
```

### CORS Issues
O middleware já está configurado para permitir CORS. Se houver problemas, verifique se o middleware.js está sendo carregado.

### Dados não persistem
O JSON Server salva automaticamente no db.json. Verifique se o arquivo não está sendo usado por outro processo.

## 📝 Exemplos de Uso

### Buscar caminhões ativos
```bash
curl "http://localhost:3000/api/trucks?status=ativo"
```

### Buscar lançamentos de um caminhão
```bash
curl "http://localhost:3000/api/financial-entries?truckId=1"
```

### Criar novo caminhão
```bash
curl -X POST "http://localhost:3000/api/trucks" \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "XYZ9999",
    "model": "Scania R 500",
    "year": 2023,
    "status": "ativo"
  }'
```

## 🔗 Links Úteis

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [Angular HTTP Client](https://angular.io/guide/http)
- [RxJS Operators](https://rxjs.dev/guide/operators)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se o JSON Server está rodando na porta 3000
2. Confirme se o db.json está no formato correto
3. Verifique os logs do console para erros
4. Teste os endpoints diretamente no navegador
