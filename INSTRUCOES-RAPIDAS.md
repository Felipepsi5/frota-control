# ⚡ Instruções Rápidas - Deploy na Hostinger

## 🎯 O que fazer AGORA:

### 1. **Configurar Secrets no GitHub** (5 minutos)

1. Vá para: `https://github.com/SEU-USUARIO/frotacontrol/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Adicione cada secret:

| Secret | Valor | Exemplo |
|--------|-------|---------|
| `HOSTINGER_SSH_KEY` | Sua chave privada SSH | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `HOSTINGER_HOST` | IP do servidor | `192.168.1.100` |
| `HOSTINGER_USER` | Usuário SSH | `root` ou `usuario` |
| `HOSTINGER_DEPLOY_PATH` | Caminho de deploy | `/var/www/frotacontrol` |
| `HOSTINGER_DOMAIN` | Seu domínio | `frotacontrol.com.br` |
| `HOSTINGER_EMAIL` | Email para SSL | `admin@frotacontrol.com.br` |

### 2. **Configurar Servidor** (10 minutos)

```bash
# Conectar ao servidor
ssh usuario@seu-servidor.com

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Certbot
sudo apt update && sudo apt install certbot

# Configurar firewall
sudo ufw allow 22,80,443 && sudo ufw enable
```

### 3. **Fazer Deploy** (2 minutos)

```bash
# No seu computador
git add .
git commit -m "feat: deploy automático configurado"
git push origin main
```

## ✅ **PRONTO!** 

O deploy será executado automaticamente. Acesse:
- **GitHub Actions**: `https://github.com/SEU-USUARIO/frotacontrol/actions`
- **Sua aplicação**: `https://seu-dominio.com`

## 📚 Documentação Completa:

- **Guia detalhado**: `GITHUB-ACTIONS-SETUP.md`
- **Status completo**: `DEPLOY-READY.md`
- **Resumo técnico**: `RESUMO-GITHUB-ACTIONS.md`

## 🆘 Precisa de ajuda?

1. Verifique os logs no GitHub Actions
2. Consulte a documentação completa
3. Verifique se todos os secrets estão configurados
4. Teste a conectividade SSH: `ssh -T usuario@servidor.com`

---

**🚀 Sua aplicação Angular está pronta para deploy automático na Hostinger!**
