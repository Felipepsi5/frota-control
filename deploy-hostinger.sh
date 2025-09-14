#!/bin/bash

# Script de Deploy para Hostinger - Frotacontrol
# Deploy automatizado e otimizado para produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configurações
PROJECT_NAME="frotacontrol"
BACKUP_DIR="./backups"
LOG_DIR="./logs"

# Verificar pré-requisitos
check_prerequisites() {
    log "Verificando pré-requisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado"
        exit 1
    fi
    
    # Verificar se Docker está rodando
    if ! docker ps &> /dev/null; then
        error "Docker não está rodando"
        exit 1
    fi
    
    success "Pré-requisitos verificados"
}

# Preparar ambiente de produção
prepare_production() {
    log "Preparando ambiente de produção..."
    
    # Criar arquivo .env para produção
    if [ ! -f ".env" ]; then
        log "Criando arquivo .env para produção..."
        cat > .env << EOF
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
EOF
        success "Arquivo .env criado"
    fi
    
    # Criar diretórios necessários
    mkdir -p ssl logs backups
    
    success "Ambiente de produção preparado"
}

# Configurar SSL
setup_ssl() {
    log "Configurando SSL..."
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        warning "Certificados SSL não encontrados"
        echo ""
        echo "Opções para obter certificados SSL:"
        echo "1. Let's Encrypt (recomendado):"
        echo "   sudo apt install certbot"
        echo "   sudo certbot certonly --standalone -d seu-dominio.com"
        echo "   sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ssl/cert.pem"
        echo "   sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ssl/key.pem"
        echo ""
        echo "2. Certificados da Hostinger:"
        echo "   - Baixe os certificados do painel da Hostinger"
        echo "   - Coloque em ssl/cert.pem e ssl/key.pem"
        echo ""
        echo "3. Certificado auto-assinado (apenas para teste):"
        echo "   ./setup-ssl.sh"
        echo ""
        
        read -p "Deseja continuar sem SSL? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Configure os certificados SSL primeiro"
            exit 1
        fi
    else
        success "Certificados SSL encontrados"
    fi
}

# Fazer backup dos dados
backup_data() {
    log "Fazendo backup dos dados..."
    
    local backup_file="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Criar backup
    tar -czf "$backup_file" data/ config/ ssl/ 2>/dev/null || true
    
    # Manter apenas os 5 backups mais recentes
    ls -t $BACKUP_DIR/backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    
    success "Backup criado: $backup_file"
}

# Parar containers existentes
stop_existing() {
    log "Parando containers existentes..."
    
    # Parar todos os profiles
    docker-compose --profile dev down 2>/dev/null || true
    docker-compose --profile prod down 2>/dev/null || true
    docker-compose down 2>/dev/null || true
    
    success "Containers parados"
}

# Fazer build das imagens
build_images() {
    log "Fazendo build das imagens para produção..."
    
    # Build com cache otimizado
    docker-compose build --no-cache --pull
    
    success "Build concluído"
}

# Iniciar aplicação em produção
start_production() {
    log "Iniciando aplicação em produção..."
    
    # Iniciar apenas o profile de produção
    docker-compose --profile prod up -d
    
    success "Aplicação iniciada"
}

# Verificar saúde da aplicação
health_check() {
    log "Verificando saúde da aplicação..."
    
    # Aguardar aplicação inicializar
    sleep 10
    
    # Verificar containers
    if ! docker-compose ps | grep -q "Up"; then
        error "Alguns containers não estão rodando"
        docker-compose logs
        exit 1
    fi
    
    # Verificar se aplicação responde
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost > /dev/null 2>&1; then
            success "Aplicação está respondendo"
            return 0
        fi
        
        log "Tentativa $attempt/$max_attempts - Aguardando aplicação..."
        sleep 2
        ((attempt++))
    done
    
    error "Aplicação não está respondendo"
    docker-compose logs
    exit 1
}

# Configurar firewall
setup_firewall() {
    log "Configurando firewall..."
    
    # Verificar se UFW está disponível
    if command -v ufw &> /dev/null; then
        # Permitir portas necessárias
        sudo ufw allow 22    # SSH
        sudo ufw allow 80    # HTTP
        sudo ufw allow 443   # HTTPS
        
        # Habilitar firewall se não estiver
        if ! sudo ufw status | grep -q "Status: active"; then
            sudo ufw --force enable
        fi
        
        success "Firewall configurado"
    else
        warning "UFW não está disponível. Configure o firewall manualmente."
    fi
}

# Configurar logrotate
setup_logrotate() {
    log "Configurando rotação de logs..."
    
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
    
    success "Logrotate configurado"
}

# Mostrar informações finais
show_final_info() {
    log "Deploy concluído com sucesso!"
    echo ""
    echo "=== INFORMAÇÕES DA APLICAÇÃO ==="
    echo "Status dos containers:"
    docker-compose ps
    echo ""
    echo "URLs disponíveis:"
    echo "  Aplicação: http://localhost (ou seu domínio)"
    echo "  API: http://localhost:3000"
    echo ""
    echo "=== COMANDOS ÚTEIS ==="
    echo "Ver logs: docker-compose logs -f"
    echo "Status: docker-compose ps"
    echo "Reiniciar: docker-compose restart"
    echo "Parar: docker-compose down"
    echo "Backup: ./docker-manage.sh backup"
    echo ""
    echo "=== MONITORAMENTO ==="
    echo "Logs da aplicação: tail -f logs/nginx/access.log"
    echo "Logs de erro: tail -f logs/nginx/error.log"
    echo "Uso de recursos: docker stats"
}

# Função principal
main() {
    log "Iniciando deploy do Frotacontrol na Hostinger..."
    
    check_prerequisites
    prepare_production
    setup_ssl
    backup_data
    stop_existing
    build_images
    start_production
    health_check
    setup_firewall
    setup_logrotate
    show_final_info
    
    success "Deploy concluído com sucesso!"
}

# Verificar se script está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi