# 📋 Deploy Manual - Frotacontrol

## 🎯 Guia Completo para Deploy Manual

Este documento contém instruções detalhadas para fazer deploy manual da aplicação Frotacontrol, tanto localmente quanto na Hostinger.

---

## 🏠 Deploy Local (Desenvolvimento)

### 1. Pré-requisitos
```bash
# Verificar se Docker está instalado
docker --version
docker-compose --version

# Verificar se está rodando
docker ps
```

### 2. Preparar Ambiente
```bash
# Clonar/navegar para o projeto
cd frotacontrol

# Criar arquivo de ambiente
cp env.example .env

# Editar configurações (opcional)
nano .env
```

### 3. Configurar Dados da API
```bash
# Verificar se os dados estão no lugar certo
ls -la data/
ls -la config/

# Se necessário, mover arquivos:
# mv db.json data/
# mv routes.json config/
# mv middleware.js config/
# mv json-server.json config/
```

### 4. Iniciar Desenvolvimento
```bash
# Opção 1: Usar script automatizado
./docker-manage.sh dev

# Opção 2: Comando manual
docker-compose --profile dev up -d --build
```

### 5. Verificar Funcionamento
```bash
# Verificar containers
docker-compose ps

# Verificar logs
docker-compose logs -f

# Testar URLs
curl -I http://localhost:4200
curl -I http://localhost:3000
```

---

## 🌐 Deploy na Hostinger (Produção)

### 1. Preparar Servidor

#### Conectar via SSH
```bash
ssh usuario@seu-servidor-hostinger.com
```

#### Instalar Docker (se necessário)
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 2. Upload dos Arquivos

#### Opção A: Git Clone
```bash
# No servidor
git clone https://github.com/seu-usuario/frotacontrol.git
cd frotacontrol
```

#### Opção B: Upload via SCP
```bash
# No seu computador local
scp -r . usuario@seu-servidor:/caminho/para/frotacontrol/
```

#### Opção C: Upload via FTP/SFTP
- Use FileZilla, WinSCP ou similar
- Faça upload de todos os arquivos para o servidor

### 3. Configurar Ambiente de Produção

#### Criar arquivo .env
```bash
# No servidor
cd frotacontrol
cp env.example .env
nano .env
```

#### Configurar .env para produção:
```bash
NODE_ENV=production
API_PORT=3000
APP_PORT=80
HTTPS_PORT=443
API_HOST=localhost
API_PROTOCOL=https
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
LOG_LEVEL=info
LOG_FORMAT=combined
```

### 4. Configurar SSL

#### Opção A: Let's Encrypt (Recomendado)
```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot

# Gerar certificado
sudo certbot certonly --standalone -d seu-dominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

#### Opção B: Certificados da Hostinger
```bash
# Baixar certificados do painel da Hostinger
# Colocar em:
# ssl/cert.pem
# ssl/key.pem
```

#### Opção C: Certificado Auto-assinado (Apenas teste)
```bash
# Gerar certificado auto-assinado
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=BR/ST=SP/L=SaoPaulo/O=Frotacontrol/CN=localhost"
```

### 5. Configurar Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Verificar status
sudo ufw status
```

### 6. Fazer Deploy

#### Opção A: Deploy Automatizado
```bash
# Tornar script executável
chmod +x deploy-hostinger.sh

# Executar deploy
./deploy-hostinger.sh
```

#### Opção B: Deploy Manual Passo a Passo

##### 1. Parar containers existentes
```bash
docker-compose down
```

##### 2. Fazer backup dos dados
```bash
mkdir -p backups
tar -czf backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz data/ config/ ssl/
```

##### 3. Build das imagens
```bash
docker-compose build --no-cache
```

##### 4. Iniciar aplicação
```bash
docker-compose --profile prod up -d
```

##### 5. Verificar funcionamento
```bash
# Verificar containers
docker-compose ps

# Verificar logs
docker-compose logs -f

# Testar aplicação
curl -I http://localhost
curl -I https://localhost
```

### 7. Configurar Logrotate

```bash
# Criar configuração de logrotate
sudo tee /etc/logrotate.d/frotacontrol > /dev/null << EOF
$(pwd)/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose --profile prod restart app
    endscript
}
EOF
```

### 8. Configurar Auto-start (Opcional)

```bash
# Criar serviço systemd
sudo tee /etc/systemd/system/frotacontrol.service > /dev/null << EOF
[Unit]
Description=Frotacontrol Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose --profile prod up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Habilitar serviço
sudo systemctl enable frotacontrol.service
sudo systemctl start frotacontrol.service
```

---

## 🔧 Comandos de Manutenção

### Verificar Status
```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Logs em tempo real
docker-compose logs -f

# Logs específicos
docker-compose logs app
docker-compose logs api
```

### Backup e Restore
```bash
# Fazer backup
./docker-manage.sh backup

# Restaurar backup
./docker-manage.sh restore backup_file.tar.gz

# Backup manual
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz data/ config/ ssl/
```

### Atualizações
```bash
# Parar aplicação
docker-compose down

# Fazer backup
./docker-manage.sh backup

# Pull das mudanças (se usando Git)
git pull origin main

# Rebuild e restart
docker-compose --profile prod up -d --build

# Verificar logs
docker-compose logs -f
```

### Limpeza
```bash
# Limpar containers parados
docker-compose down

# Limpar imagens não utilizadas
docker image prune -f

# Limpeza completa
docker system prune -a
```

---

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Container não inicia
```bash
# Verificar logs
docker-compose logs

# Verificar se portas estão em uso
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

#### 2. Erro de SSL
```bash
# Verificar certificados
ls -la ssl/
openssl x509 -in ssl/cert.pem -text -noout
openssl rsa -in ssl/key.pem -check -noout

# Verificar permissões
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
```

#### 3. API não responde
```bash
# Verificar se API está rodando
docker-compose logs api

# Testar conectividade
curl http://localhost:3000

# Verificar rede Docker
docker network ls
docker network inspect frotacontrol-network
```

#### 4. Problemas de memória
```bash
# Verificar uso de memória
docker stats

# Verificar logs do sistema
dmesg | grep -i memory
free -h
```

### Comandos de Diagnóstico
```bash
# Informações do sistema
docker system info
docker system df

# Logs do Docker
sudo journalctl -u docker.service

# Verificar espaço em disco
df -h
du -sh *
```

---

## 📊 Monitoramento

### Logs Importantes
```bash
# Logs da aplicação
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log

# Logs dos containers
docker-compose logs -f app
docker-compose logs -f api

# Logs do sistema
sudo journalctl -f
```

### Métricas
```bash
# Uso de recursos
docker stats --no-stream

# Status dos containers
docker-compose ps

# Informações da rede
docker network inspect frotacontrol-network
```

---

## 🎯 Checklist de Deploy

### Antes do Deploy
- [ ] Docker e Docker Compose instalados
- [ ] Arquivos do projeto no servidor
- [ ] Arquivo .env configurado
- [ ] Certificados SSL configurados
- [ ] Firewall configurado

### Durante o Deploy
- [ ] Backup dos dados existentes
- [ ] Build das imagens
- [ ] Iniciar containers
- [ ] Verificar health checks
- [ ] Testar URLs

### Após o Deploy
- [ ] Aplicação respondendo
- [ ] SSL funcionando
- [ ] Logs sendo gerados
- [ ] Logrotate configurado
- [ ] Auto-start configurado (opcional)

---

## 📞 Suporte

### Comandos de Emergência
```bash
# Parar tudo
docker-compose down

# Limpar tudo
docker system prune -a

# Restaurar backup
./docker-manage.sh restore backup_file.tar.gz

# Entrar no container
docker-compose exec app sh
docker-compose exec api sh
```

### Contatos
- **Logs**: `docker-compose logs -f`
- **Status**: `docker-compose ps`
- **Recursos**: `docker stats`

---

## 🎉 Conclusão

Com este guia, você pode fazer deploy manual completo da aplicação Frotacontrol em qualquer ambiente, desde desenvolvimento local até produção na Hostinger.

**Lembre-se**: Sempre faça backup antes de qualquer alteração e teste em ambiente de desenvolvimento primeiro!
