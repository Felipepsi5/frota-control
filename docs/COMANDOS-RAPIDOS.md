# ⚡ Comandos Rápidos - Frotacontrol

## 🚀 Deploy Rápido

### Desenvolvimento Local
```bash
# Iniciar desenvolvimento
./docker-manage.sh dev

# Com rebuild
./docker-manage.sh dev --build

# Ver logs
./docker-manage.sh logs --follow
```

### Produção (Hostinger)
```bash
# Deploy automatizado
./deploy-hostinger.sh

# Deploy manual
./docker-manage.sh prod
```

## 🔧 Comandos Essenciais

### Gerenciamento
```bash
# Status
./docker-manage.sh status

# Parar tudo
./docker-manage.sh stop

# Reiniciar
./docker-manage.sh restart

# Limpar
./docker-manage.sh clean
```

### Logs e Debug
```bash
# Logs em tempo real
./docker-manage.sh logs --follow

# Logs específicos
docker-compose logs app
docker-compose logs api

# Entrar no container
./docker-manage.sh shell frontend
./docker-manage.sh shell api
```

### Backup
```bash
# Backup automático
./docker-manage.sh backup

# Restaurar backup
./docker-manage.sh restore backup_file.tar.gz
```

## 🐳 Comandos Docker Diretos

### Containers
```bash
# Ver containers
docker ps

# Parar containers
docker-compose down

# Rebuild
docker-compose build --no-cache

# Logs
docker-compose logs -f
```

### Limpeza
```bash
# Limpar containers parados
docker container prune

# Limpar imagens não usadas
docker image prune

# Limpeza completa
docker system prune -a
```

## 🌐 URLs de Teste

### Desenvolvimento
- **Frontend**: http://localhost:4200
- **API**: http://localhost:3000
- **API via Frontend**: http://localhost:4200/api/

### Produção
- **Aplicação**: http://localhost (ou domínio)
- **API**: http://localhost:3000

## 🚨 Troubleshooting Rápido

### Problemas Comuns
```bash
# Container não inicia
docker-compose logs

# Porta ocupada
sudo netstat -tulpn | grep :80

# Problema de SSL
ls -la ssl/
openssl x509 -in ssl/cert.pem -text -noout

# Problema de memória
docker stats
free -h
```

### Reset Completo
```bash
# Parar tudo
docker-compose down

# Limpar tudo
docker system prune -a

# Rebuild completo
./docker-manage.sh dev --build
```

## 📊 Monitoramento

### Status
```bash
# Containers
docker-compose ps

# Recursos
docker stats

# Logs
tail -f logs/nginx/access.log
```

### Health Checks
```bash
# Testar aplicação
curl -I http://localhost:4200
curl -I http://localhost:3000

# Testar API
curl http://localhost:3000/trucks
```

## 🔐 SSL

### Let's Encrypt
```bash
# Instalar
sudo apt install certbot

# Gerar certificado
sudo certbot certonly --standalone -d seu-dominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ssl/key.pem
```

### Certificado Auto-assinado
```bash
# Gerar
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=BR/ST=SP/L=SaoPaulo/O=Frotacontrol/CN=localhost"
```

## 📁 Estrutura de Arquivos

```
frotacontrol/
├── 📁 data/          # Dados da API
├── 📁 config/        # Configurações
├── 📁 ssl/           # Certificados
├── 📁 logs/          # Logs
├── 📁 backups/       # Backups
├── docker-compose.yml
├── Dockerfile
├── docker-manage.sh
└── deploy-hostinger.sh
```

## 🎯 Checklist Rápido

### Antes do Deploy
- [ ] Docker rodando
- [ ] Arquivos no servidor
- [ ] .env configurado
- [ ] SSL configurado

### Deploy
- [ ] Backup feito
- [ ] Build executado
- [ ] Containers iniciados
- [ ] Health check OK

### Pós-Deploy
- [ ] URLs funcionando
- [ ] Logs sendo gerados
- [ ] Monitoramento ativo

---

## 💡 Dicas Rápidas

1. **Sempre faça backup** antes de mudanças
2. **Teste localmente** antes de produção
3. **Monitore os logs** regularmente
4. **Use health checks** para verificar status
5. **Mantenha certificados SSL** atualizados

---

**Para mais detalhes, consulte `DEPLOY-MANUAL.md`** 📚

