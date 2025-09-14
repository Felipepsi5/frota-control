# Configuração do GitHub Actions para Deploy na Hostinger

Este documento explica como configurar o GitHub Actions para fazer deploy automático da aplicação Frotacontrol na Hostinger.

## 📋 Pré-requisitos

### 1. Conta na Hostinger
- VPS ou Cloud Hosting com acesso SSH
- Docker e Docker Compose instalados no servidor
- Domínio configurado e apontando para o servidor

### 2. Repositório GitHub
- Repositório público ou privado no GitHub
- Acesso de administrador ao repositório

## 🔐 Configuração dos Secrets

### Acessar as configurações de secrets:
1. Vá para o seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**

### Secrets obrigatórios:

#### `HOSTINGER_SSH_KEY`
- **Descrição**: Chave privada SSH para acesso ao servidor
- **Como obter**:
  ```bash
  # No seu computador local, gerar chave SSH (se não tiver)
  ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"
  
  # Copiar a chave privada
  cat ~/.ssh/id_rsa
  
  # Copiar a chave pública para o servidor
  ssh-copy-id usuario@seu-servidor-hostinger.com
  ```

#### `HOSTINGER_HOST`
- **Descrição**: Endereço IP ou domínio do servidor
- **Exemplo**: `192.168.1.100` ou `meuservidor.hostinger.com`

#### `HOSTINGER_USER`
- **Descrição**: Usuário SSH do servidor
- **Exemplo**: `root` ou `usuario`

#### `HOSTINGER_DEPLOY_PATH`
- **Descrição**: Caminho no servidor onde a aplicação será deployada
- **Exemplo**: `/var/www/frotacontrol` ou `/home/usuario/frotacontrol`

#### `HOSTINGER_DOMAIN`
- **Descrição**: Domínio da aplicação
- **Exemplo**: `frotacontrol.com.br` ou `app.frotacontrol.com`

#### `HOSTINGER_EMAIL`
- **Descrição**: Email para certificados SSL (Let's Encrypt)
- **Exemplo**: `admin@frotacontrol.com.br`

### Secrets opcionais:

#### `DOCKER_USERNAME` e `DOCKER_PASSWORD`
- **Descrição**: Credenciais do Docker Hub (se quiser fazer push das imagens)
- **Como obter**: Criar conta no [Docker Hub](https://hub.docker.com)

#### `SONAR_TOKEN` e `SONAR_ORGANIZATION`
- **Descrição**: Credenciais do SonarCloud para análise de código
- **Como obter**: Criar conta no [SonarCloud](https://sonarcloud.io)

## 🚀 Configuração do Servidor

### 1. Instalar Docker e Docker Compose

```bash
# Conectar ao servidor via SSH
ssh usuario@seu-servidor-hostinger.com

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 2. Configurar Firewall

```bash
# Ubuntu/Debian com UFW
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Verificar status
sudo ufw status
```

### 3. Instalar Certbot (para SSL automático)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot

# Verificar instalação
certbot --version
```

### 4. Criar diretório de deploy

```bash
# Criar diretório
sudo mkdir -p /var/www/frotacontrol
sudo chown $USER:$USER /var/www/frotacontrol

# Ou usar diretório home
mkdir -p ~/frotacontrol
```

## 🔧 Configuração do Projeto

### 1. Adicionar scripts ao package.json

```json
{
  "scripts": {
    "lint": "ng lint",
    "test": "ng test",
    "test:coverage": "ng test --code-coverage",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss}\"",
    "format": "prettier --write \"src/**/*.{ts,html,scss}\""
  }
}
```

### 2. Configurar environment de produção

Edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://seu-dominio.com/api',
  firebase: {
    // Suas configurações do Firebase
  }
};
```

### 3. Configurar nginx.conf

Edite o `server_name` no `nginx.conf`:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # ... resto da configuração
}
```

## 🎯 Como Funciona o Deploy

### 1. Trigger do Deploy
- **Push para main/master**: Deploy automático
- **Pull Request**: Apenas testes (sem deploy)
- **Manual**: Via GitHub Actions UI

### 2. Processo de Deploy
1. **Testes**: Executa linting, testes e build
2. **Build**: Cria imagem Docker otimizada
3. **Backup**: Faz backup da versão atual
4. **Deploy**: Para containers, envia arquivos, inicia nova versão
5. **SSL**: Configura certificados automaticamente
6. **Verificação**: Testa se aplicação está funcionando

### 3. Rollback Automático
Se o deploy falhar, a versão anterior é restaurada automaticamente.

## 📊 Monitoramento

### 1. Logs do GitHub Actions
- Acesse a aba **Actions** no seu repositório
- Clique no workflow executado
- Veja os logs detalhados de cada step

### 2. Logs da Aplicação
```bash
# Conectar ao servidor
ssh usuario@seu-servidor-hostinger.com

# Ver logs dos containers
cd /var/www/frotacontrol
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs específicos
docker-compose -f docker-compose.prod.yml logs frotacontrol-app
docker-compose -f docker-compose.prod.yml logs json-server
```

### 3. Status da Aplicação
```bash
# Verificar containers
docker-compose -f docker-compose.prod.yml ps

# Verificar uso de recursos
docker stats

# Testar aplicação
curl -I https://seu-dominio.com
```

## 🔄 Atualizações e Manutenção

### 1. Deploy Manual
```bash
# No servidor, fazer pull e restart
cd /var/www/frotacontrol
git pull origin main
docker-compose -f docker-compose.prod.yml up --build -d
```

### 2. Backup Manual
```bash
# Fazer backup dos dados
cd /var/www/frotacontrol
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz data/ ssl/ logs/
```

### 3. Limpeza de Recursos
```bash
# Limpar imagens antigas
docker image prune -f
docker system prune -f

# Limpar backups antigos (manter últimos 7 dias)
find backups/ -name "backup_*.tar.gz" -mtime +7 -delete
```

## 🚨 Troubleshooting

### Problemas Comuns:

#### 1. Erro de SSH
```
Error: Permission denied (publickey)
```
**Solução**: Verificar se a chave SSH está correta nos secrets

#### 2. Erro de Docker
```
Error: Cannot connect to the Docker daemon
```
**Solução**: Verificar se Docker está rodando no servidor

#### 3. Erro de SSL
```
Error: SSL certificate problem
```
**Solução**: Verificar se o domínio está apontando para o servidor

#### 4. Erro de Porta
```
Error: Port 80 is already in use
```
**Solução**: Parar serviços que estão usando a porta 80

### Comandos de Debug:

```bash
# Verificar conectividade SSH
ssh -T usuario@seu-servidor-hostinger.com

# Verificar se Docker está rodando
ssh usuario@seu-servidor-hostinger.com "docker ps"

# Verificar logs do sistema
ssh usuario@seu-servidor-hostinger.com "journalctl -u docker"

# Verificar uso de portas
ssh usuario@seu-servidor-hostinger.com "netstat -tulpn | grep :80"
```

## 📝 Checklist de Deploy

### Antes do Primeiro Deploy:
- [ ] Secrets configurados no GitHub
- [ ] Docker instalado no servidor
- [ ] Firewall configurado
- [ ] Domínio apontando para o servidor
- [ ] Certbot instalado (para SSL)

### Após o Deploy:
- [ ] Aplicação acessível via HTTPS
- [ ] API respondendo corretamente
- [ ] Logs sem erros
- [ ] Backup funcionando
- [ ] Monitoramento configurado

## 🔗 Links Úteis

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Hostinger VPS](https://www.hostinger.com.br/vps)
- [Angular Deployment Guide](https://angular.io/guide/deployment)

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do GitHub Actions
2. Consulte este documento
3. Verifique os logs da aplicação no servidor
4. Entre em contato com o suporte da Hostinger se necessário
