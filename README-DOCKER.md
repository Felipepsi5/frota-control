# Docker Setup - Frotacontrol

Este documento explica como configurar e executar a aplicação Frotacontrol usando Docker.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose v3.8+

## 🚀 Comandos Rápidos

### Desenvolvimento Local
```bash
# Iniciar aplicação com API (tudo via Nginx na porta 8080)
docker-compose up --build

# Apenas a aplicação Angular (sem API)
docker-compose -f docker-compose.app-only.yml up --build
```

### Produção
```bash
# Deploy para produção (tudo via Nginx na porta 80)
docker-compose -f docker-compose.prod.yml up -d --build
```

### Scripts Auxiliares
```bash
# Tornar script executável (Linux/Mac)
chmod +x docker-scripts.sh

# Usar scripts
./docker-scripts.sh dev     # Desenvolvimento
./docker-scripts.sh prod    # Produção
./docker-scripts.sh stop    # Parar containers
./docker-scripts.sh clean   # Limpar tudo
./docker-scripts.sh logs    # Ver logs
```

## 🌐 Acesso

- **Desenvolvimento**: http://localhost:8080
- **API JSON Server**: http://localhost:8080/api/ (via proxy Nginx)
- **Produção**: http://localhost (porta 80)
- **API Produção**: http://localhost/api/ (via proxy Nginx)

## 📁 Arquivos Docker

- `Dockerfile` - Configuração multi-stage para build e produção
- `docker-compose.yml` - Orquestração completa (Angular + API via Nginx)
- `docker-compose.prod.yml` - Orquestração para produção (Angular + API via Nginx)
- `docker-compose.app-only.yml` - Apenas aplicação Angular (sem API)
- `nginx.conf` - Configuração do servidor web com proxy reverso
- `.dockerignore` - Arquivos ignorados no build

## 🔧 Configuração Multi-Stage

O Dockerfile utiliza build multi-stage:

1. **Estágio Build**: Instala dependências e compila a aplicação Angular
2. **Estágio Production**: Serve a aplicação usando Nginx otimizado

## ⚡ Otimizações Nginx

- **Proxy Reverso**: API JSON Server acessível via `/api/`
- **Compressão gzip** habilitada
- **Cache para assets estáticos** (1 ano)
- **Headers de segurança** configurados
- **Configuração para SPA** (Single Page Application)
- **Suporte a roteamento client-side**
- **CORS headers** para desenvolvimento
- **Upstream load balancing** para API

## 🔗 Configuração da API

A API JSON Server está disponível através do proxy Nginx em `/api/`. Para usar na aplicação Angular:

### Environment Configuration
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: '/api'  // Usa proxy do Nginx
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api'  // Usa proxy do Nginx
};
```

### Exemplo de uso no Service
```typescript
// Exemplo de chamada para API
const apiUrl = environment.apiUrl;
this.http.get(`${apiUrl}/trucks`).subscribe(...);
```

### URLs da API disponíveis:
- `GET /api/trucks` - Lista caminhões
- `POST /api/trucks` - Criar caminhão
- `PUT /api/trucks/:id` - Atualizar caminhão
- `DELETE /api/trucks/:id` - Deletar caminhão

## 🏗️ Deploy na Hostinger

### Opção 1: Docker Compose
```bash
# No servidor da Hostinger
git clone <seu-repositorio>
cd frotacontrol
docker-compose -f docker-compose.prod.yml up -d
```

### Opção 2: Build Manual
```bash
# Build da imagem
docker build -t frotacontrol-app .

# Executar container
docker run -d -p 80:80 --name frotacontrol-app frotacontrol-app
```

## 🔍 Troubleshooting

### Docker não inicia
```bash
# Verificar se Docker Desktop está rodando
docker --version
docker-compose --version

# Reiniciar Docker Desktop se necessário
```

### Porta já em uso
```bash
# Verificar portas em uso
netstat -tulpn | grep :8080
netstat -tulpn | grep :80

# Parar containers conflitantes
docker stop $(docker ps -q)
```

### Rebuild completo
```bash
# Limpar tudo e reconstruir
docker-compose down --volumes --remove-orphans
docker system prune -f
docker-compose up --build
```

## 📊 Monitoramento

```bash
# Ver logs em tempo real
docker-compose logs -f

# Status dos containers
docker-compose ps

# Uso de recursos
docker stats
```

## 🔐 SSL/HTTPS (Opcional)

Para configurar HTTPS na Hostinger:

1. Copie certificados SSL para pasta `ssl/`
2. Modifique `nginx.conf` para incluir configuração SSL
3. Use `docker-compose.prod.yml` que mapeia porta 443

## 📝 Notas Importantes

- A aplicação é servida na porta 80 em produção
- Nginx está configurado para SPAs (roteamento client-side)
- Assets estáticos têm cache de 1 ano
- Headers de segurança estão configurados
- Compressão gzip está habilitada
