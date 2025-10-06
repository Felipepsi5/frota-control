# 🧪 Teste Local - Frotacontrol

Este documento contém instruções rápidas para testar a aplicação localmente.

## ⚡ Teste Rápido

### 1. Iniciar Docker Desktop
- Abra o Docker Desktop no Windows
- Aguarde até que o status seja "Running"

### 2. Executar Teste Automatizado
```bash
./test-local.sh
```

Este script irá:
- ✅ Verificar se Docker está instalado e rodando
- ✅ Verificar se todos os arquivos necessários existem
- ✅ Testar build da aplicação Angular
- ✅ Testar build do Docker
- ✅ Iniciar containers e testar aplicação
- ✅ Mostrar URLs e comandos úteis

## 🚀 Comandos Manuais

### Desenvolvimento (com API)
```bash
# Iniciar tudo
docker-compose up --build

# Apenas aplicação
docker-compose up frotacontrol-app

# Em background
docker-compose up -d --build
```

### Apenas Aplicação (sem API)
```bash
docker-compose -f docker-compose.app-only.yml up -d --build
```

### Produção Local
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📍 URLs de Teste

- **Aplicação**: http://localhost:8080
- **API**: http://localhost:8080/api/
- **Logs**: `docker-compose logs -f`

## 🔧 Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Limpar tudo
docker system prune -a

# Rebuild
docker-compose up --build -d
```

## 🐛 Troubleshooting

### Docker não está rodando
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/...
```
**Solução**: Inicie o Docker Desktop

### Porta 8080 já está em uso
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :8080

# Parar containers
docker-compose down
```

### Build falha
```bash
# Limpar cache do Docker
docker system prune -a

# Rebuild sem cache
docker-compose build --no-cache
```

### Aplicação não responde
```bash
# Verificar logs
docker-compose logs frotacontrol-app

# Verificar se containers estão rodando
docker-compose ps
```

## 📋 Checklist de Verificação

- [ ] Docker Desktop está rodando
- [ ] Todos os arquivos estão presentes
- [ ] Build da aplicação funciona
- [ ] Containers iniciam sem erro
- [ ] Aplicação responde em http://localhost:8080
- [ ] API responde em http://localhost:8080/api/

## 🎯 Próximos Passos

Após o teste local bem-sucedido:

1. **Para Produção**: Use `./deploy-hostinger.sh`
2. **Para SSL**: Use `./setup-ssl.sh`
3. **Para Deploy**: Siga o `README-DEPLOY-HOSTINGER.md`

## 📞 Suporte

Se encontrar problemas:
1. Execute `./test-local.sh` para diagnóstico automático
2. Verifique os logs: `docker-compose logs -f`
3. Consulte este documento
4. Verifique se Docker Desktop está rodando
