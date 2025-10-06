# 🐳 Docker Setup - FrotaControl Angular

Este documento explica como containerizar e executar a aplicação Angular FrotaControl usando Docker.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Git (para clonar o repositório)

## 🚀 Como Testar Localmente

### Opção 1: Script Automático (Recomendado)

#### Windows (PowerShell):
```powershell
.\docker-test.ps1
```

#### Linux/Mac (Bash):
```bash
./docker-test.sh
```

### Opção 2: Comandos Manuais

1. **Construir a imagem Docker:**
```bash
docker build -t frotacontrol-angular .
```

2. **Executar o contêiner:**
```bash
docker run -d -p 8080:80 --name frotacontrol-test frotacontrol-angular
```

3. **Acessar a aplicação:**
   - Abra seu navegador
   - Acesse: http://localhost:8080

4. **Verificar logs:**
```bash
docker logs frotacontrol-test
```

5. **Parar e limpar:**
```bash
docker stop frotacontrol-test
docker rm frotacontrol-test
```

## 📁 Arquivos Docker Criados

### `Dockerfile`
- **Multi-stage build** para otimização
- **Estágio 1**: Compilação com Node.js 18 Alpine
- **Estágio 2**: Servidor Nginx para produção
- **Nome do projeto**: `frotacontrol` (conforme angular.json)

### `nginx.conf`
- **Configuração otimizada** para aplicações Angular
- **Suporte a rotas SPA** (Single Page Application)
- **Cache otimizado** para arquivos estáticos
- **Configurações de segurança** incluídas
- **Compressão gzip** habilitada

### `.dockerignore`
- **Exclui arquivos desnecessários** da imagem
- **Reduz tamanho** da imagem final
- **Melhora performance** do build

## 🔧 Configurações Específicas

### Porta
- **Aplicação**: Porta 80 (dentro do contêiner)
- **Mapeamento**: 8080:80 (host:container)
- **Acesso**: http://localhost:8080

### Build
- **Comando**: `npm run build -- --configuration production`
- **Saída**: `/app/dist/frotacontrol`
- **Otimizações**: Minificação, tree-shaking, AOT compilation

### Nginx
- **Configuração**: `/etc/nginx/conf.d/default.conf`
- **Arquivos**: `/usr/share/nginx/html`
- **Rotas**: Suporte completo a Angular Router

## 🐛 Troubleshooting

### Erro: "Port already in use"
```bash
# Verificar processos usando a porta 8080
netstat -ano | findstr :8080

# Parar contêiner existente
docker stop frotacontrol-test
docker rm frotacontrol-test
```

### Erro: "Build failed"
```bash
# Limpar cache do Docker
docker system prune -a

# Reconstruir imagem
docker build --no-cache -t frotacontrol-angular .
```

### Erro: "Cannot find module"
```bash
# Verificar se package.json está correto
cat package.json

# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📊 Otimizações Implementadas

### Dockerfile
- ✅ **Multi-stage build** para imagem menor
- ✅ **Cache de dependências** otimizado
- ✅ **Imagem Alpine** (menor footprint)
- ✅ **Nginx otimizado** para produção

### Nginx
- ✅ **Cache de arquivos estáticos** (1 ano)
- ✅ **Compressão gzip** habilitada
- ✅ **Headers de segurança** configurados
- ✅ **Suporte a SPA** (try_files)

### Build
- ✅ **Production configuration** do Angular
- ✅ **Tree shaking** ativado
- ✅ **Minificação** de CSS/JS
- ✅ **AOT compilation** habilitada

## 🚀 Para Produção

### Variáveis de Ambiente
Para configurações específicas de produção, adicione:

```dockerfile
# No Dockerfile, antes do COPY
ARG API_URL
ENV API_URL=$API_URL
```

### Docker Compose (Opcional)
```yaml
version: '3.8'
services:
  frotacontrol-frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - API_URL=http://backend:5000
```

### Health Check
```dockerfile
# Adicionar no Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

## 📝 Logs e Monitoramento

### Ver logs em tempo real:
```bash
docker logs -f frotacontrol-test
```

### Verificar status:
```bash
docker ps
```

### Inspecionar imagem:
```bash
docker inspect frotacontrol-angular
```

---

**🎉 Sua aplicação Angular está pronta para produção com Docker!**
