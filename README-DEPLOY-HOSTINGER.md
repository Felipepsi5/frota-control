# Deploy na Hostinger - Frotacontrol

Este documento descreve como fazer o deploy da aplicação Frotacontrol na Hostinger usando Docker e Nginx.

## 📋 Pré-requisitos

### Na Hostinger:
- Conta VPS ou Cloud Hosting com acesso SSH
- Docker e Docker Compose instalados
- Domínio configurado
- Certificados SSL (gratuitos via Let's Encrypt ou comprados)

### Localmente:
- Docker e Docker Compose instalados
- Git configurado
- Acesso SSH ao servidor da Hostinger

## 🚀 Processo de Deploy

### 1. Preparação do Servidor

#### Conectar via SSH:
```bash
ssh usuario@seu-servidor-hostinger.com
```

#### Instalar Docker (se não estiver instalado):
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Upload dos Arquivos

#### Clonar o repositório no servidor:
```bash
git clone https://github.com/seu-usuario/frotacontrol.git
cd frotacontrol
```

#### Ou fazer upload via SCP:
```bash
scp -r . usuario@seu-servidor-hostinger.com:/caminho/para/frotacontrol/
```

### 3. Configuração dos Certificados SSL

#### Opção A: Usar certificados da Hostinger
1. Acesse o painel da Hostinger
2. Vá para "SSL" ou "Certificados SSL"
3. Ative o SSL para seu domínio
4. Baixe os certificados
5. Coloque em:
   - `ssl/cert.pem` (certificado público)
   - `ssl/key.pem` (chave privada)

#### Opção B: Usar Let's Encrypt (recomendado)
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

#### Opção C: Gerar certificado auto-assinado (apenas desenvolvimento)
```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

### 4. Configuração do Ambiente

#### Ajustar configurações de produção:
```bash
# Editar environment.prod.ts se necessário
nano src/environments/environment.prod.ts
```

#### Configurar domínio no nginx.conf:
```bash
# Editar server_name no nginx.conf
nano nginx.conf
# Alterar: server_name _;
# Para: server_name seu-dominio.com www.seu-dominio.com;
```

### 5. Deploy Automatizado

#### Tornar scripts executáveis:
```bash
chmod +x deploy-hostinger.sh
chmod +x setup-ssl.sh
```

#### Executar deploy:
```bash
./deploy-hostinger.sh
```

### 6. Deploy Manual (alternativo)

#### Parar containers existentes:
```bash
docker-compose -f docker-compose.prod.yml down
```

#### Fazer build:
```bash
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### Iniciar aplicação:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Verificar status:
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Configurações Avançadas

### Configuração de Firewall

#### UFW (Ubuntu):
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Configuração de Proxy Reverso (se necessário)

Se você estiver usando um proxy reverso externo, ajuste o `nginx.conf`:

```nginx
# Adicionar headers de proxy
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

### Configuração de Logs

#### Rotacionar logs do Nginx:
```bash
# Criar script de rotação
sudo nano /etc/logrotate.d/frotacontrol

# Conteúdo:
/path/to/frotacontrol/logs/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /path/to/frotacontrol/docker-compose.prod.yml restart frotacontrol-app
    endscript
}
```

## 📊 Monitoramento

### Verificar status da aplicação:
```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs frotacontrol-app
docker-compose -f docker-compose.prod.yml logs json-server

# Uso de recursos
docker stats
```

### Health Check:
```bash
# Verificar se aplicação responde
curl -I https://seu-dominio.com

# Verificar API
curl -I https://seu-dominio.com/api/
```

## 🔄 Atualizações

### Deploy de atualizações:
```bash
# 1. Fazer pull das mudanças
git pull origin main

# 2. Rebuild e restart
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Backup dos dados:
```bash
# Backup do banco de dados
cp db.json db.json.backup.$(date +%Y%m%d_%H%M%S)

# Backup dos logs
tar -czf logs_backup_$(date +%Y%m%d_%H%M%S).tar.gz logs/
```

## 🚨 Troubleshooting

### Problemas Comuns:

#### 1. Container não inicia:
```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs

# Verificar se portas estão em uso
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

#### 2. Erro de SSL:
```bash
# Verificar certificados
openssl x509 -in ssl/cert.pem -text -noout
openssl rsa -in ssl/key.pem -check -noout

# Verificar permissões
ls -la ssl/
```

#### 3. API não responde:
```bash
# Verificar se JSON Server está rodando
docker-compose -f docker-compose.prod.yml logs json-server

# Testar conectividade interna
docker-compose -f docker-compose.prod.yml exec frotacontrol-app wget -qO- http://json-server:3000
```

#### 4. Problemas de memória:
```bash
# Verificar uso de memória
docker stats

# Ajustar limites no docker-compose.prod.yml
```

### Comandos Úteis:

```bash
# Reiniciar apenas um serviço
docker-compose -f docker-compose.prod.yml restart frotacontrol-app

# Ver logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f frotacontrol-app

# Entrar no container
docker-compose -f docker-compose.prod.yml exec frotacontrol-app sh

# Limpar containers e imagens antigas
docker system prune -a

# Verificar espaço em disco
df -h
docker system df
```

## 📝 Notas Importantes

1. **Segurança**: Sempre use HTTPS em produção
2. **Backup**: Faça backup regular dos dados
3. **Monitoramento**: Configure alertas para falhas
4. **Atualizações**: Mantenha o Docker e dependências atualizados
5. **Logs**: Monitore logs regularmente para detectar problemas

## 🔗 Links Úteis

- [Documentação Docker](https://docs.docker.com/)
- [Documentação Docker Compose](https://docs.docker.com/compose/)
- [Documentação Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Hostinger VPS](https://www.hostinger.com.br/vps)

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Consulte este documento
3. Verifique a documentação oficial do Docker e Nginx
4. Entre em contato com o suporte da Hostinger se necessário
