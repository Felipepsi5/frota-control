# 🚀 Resumo da Configuração do GitHub Actions para Hostinger

## ✅ O que foi configurado:

### 1. **Workflows do GitHub Actions**
- **`.github/workflows/deploy-hostinger.yml`**: Deploy automático para produção
- **`.github/workflows/ci.yml`**: Testes, linting e validação contínua
- **`.github/workflows/ssl-renewal.yml`**: Renovação automática de certificados SSL

### 2. **Scripts otimizados no package.json**
- `build:prod`: Build otimizado para produção
- `test:ci`: Testes para CI/CD
- `lint` e `lint:fix`: Linting do código
- `format` e `format:check`: Formatação de código
- `deploy:check`: Verificação completa antes do deploy

### 3. **Configurações de qualidade de código**
- **`.prettierrc`**: Configuração do Prettier
- **`.prettierignore`**: Arquivos ignorados pelo Prettier
- **`.dockerignore`**: Arquivos ignorados pelo Docker

### 4. **Script de setup automático**
- **`setup-github-actions.sh`**: Configuração automática do ambiente

### 5. **Documentação completa**
- **`GITHUB-ACTIONS-SETUP.md`**: Guia completo de configuração

## 🔧 Próximos passos para ativar o deploy:

### 1. **Configurar Secrets no GitHub**
Vá para: `Settings` → `Secrets and variables` → `Actions`

Adicione estes secrets:
```
HOSTINGER_SSH_KEY      # Chave privada SSH
HOSTINGER_HOST         # IP ou domínio do servidor
HOSTINGER_USER         # Usuário SSH
HOSTINGER_DEPLOY_PATH  # Caminho de deploy
HOSTINGER_DOMAIN       # Seu domínio
HOSTINGER_EMAIL        # Email para SSL
```

### 2. **Configurar servidor Hostinger**
```bash
# Conectar via SSH
ssh usuario@seu-servidor.com

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Certbot
sudo apt update && sudo apt install certbot

# Configurar firewall
sudo ufw allow 22,80,443
sudo ufw enable
```

### 3. **Configurar domínio**
- Apontar domínio para o IP do servidor
- Atualizar `server_name` no `nginx.conf`

### 4. **Fazer primeiro deploy**
```bash
# Fazer push para branch main/master
git add .
git commit -m "feat: configuração GitHub Actions para deploy"
git push origin main
```

## 🎯 Como funciona o deploy:

### **Trigger automático:**
- Push para `main` ou `master` → Deploy automático
- Pull Request → Apenas testes (sem deploy)
- Manual → Via GitHub Actions UI

### **Processo de deploy:**
1. ✅ **Testes**: Linting, testes unitários, build
2. 🏗️ **Build**: Imagem Docker otimizada
3. 💾 **Backup**: Backup da versão atual
4. 🚀 **Deploy**: Para containers, envia arquivos, inicia nova versão
5. 🔒 **SSL**: Configura certificados automaticamente
6. ✅ **Verificação**: Testa se aplicação está funcionando

### **Recursos incluídos:**
- 🔄 **Rollback automático** em caso de falha
- 🔒 **SSL automático** com Let's Encrypt
- 🔄 **Renovação automática** de certificados
- 📊 **Monitoramento** e logs detalhados
- 🧹 **Limpeza automática** de recursos antigos

## 📊 Monitoramento:

### **GitHub Actions:**
- Acesse a aba `Actions` no repositório
- Veja logs detalhados de cada deploy

### **Servidor:**
```bash
# Ver logs dos containers
docker-compose -f docker-compose.prod.yml logs -f

# Ver status
docker-compose -f docker-compose.prod.yml ps

# Ver uso de recursos
docker stats
```

## 🚨 Troubleshooting:

### **Problemas comuns:**
1. **Erro SSH**: Verificar chave SSH nos secrets
2. **Erro Docker**: Verificar se Docker está rodando
3. **Erro SSL**: Verificar se domínio está apontando corretamente
4. **Erro porta**: Verificar se porta 80/443 está livre

### **Comandos de debug:**
```bash
# Verificar conectividade
ssh -T usuario@servidor.com

# Verificar Docker
ssh usuario@servidor.com "docker ps"

# Verificar logs
ssh usuario@servidor.com "journalctl -u docker"
```

## 📚 Documentação:

- **`GITHUB-ACTIONS-SETUP.md`**: Guia completo
- **`README-DEPLOY-HOSTINGER.md`**: Deploy manual
- **`setup-github-actions.sh`**: Setup automático

## 🎉 Benefícios:

✅ **Deploy automático** a cada push  
✅ **Testes automáticos** antes do deploy  
✅ **SSL automático** com renovação  
✅ **Rollback automático** em caso de falha  
✅ **Monitoramento completo** com logs  
✅ **Qualidade de código** com linting e formatação  
✅ **Backup automático** das versões  
✅ **Limpeza automática** de recursos  

---

**🚀 Sua aplicação está pronta para deploy automático na Hostinger!**

Execute `./setup-github-actions.sh` para configuração adicional e siga o guia em `GITHUB-ACTIONS-SETUP.md` para ativar o deploy.
