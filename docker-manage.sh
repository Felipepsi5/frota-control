#!/bin/bash

# Script de Gerenciamento Docker - Frotacontrol
# Gerencia todos os ambientes (desenvolvimento, produção, API)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
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

# Verificar se Docker está rodando
check_docker() {
    if ! docker ps &> /dev/null; then
        error "Docker não está rodando. Inicie o Docker Desktop primeiro."
        exit 1
    fi
}

# Verificar se arquivo .env existe
check_env() {
    if [ ! -f ".env" ]; then
        warning "Arquivo .env não encontrado. Criando a partir do env.example..."
        cp env.example .env
        success "Arquivo .env criado. Ajuste as configurações conforme necessário."
    fi
}

# Carregar variáveis de ambiente
load_env() {
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
}

# Mostrar ajuda
show_help() {
    echo "Frotacontrol Docker Manager"
    echo ""
    echo "Uso: $0 [COMANDO] [OPÇÕES]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  dev          - Iniciar ambiente de desenvolvimento (Frontend + API)"
    echo "  prod         - Iniciar ambiente de produção (App + API)"
    echo "  api          - Iniciar apenas a API"
    echo "  stop         - Parar todos os containers"
    echo "  restart      - Reiniciar containers"
    echo "  logs         - Mostrar logs"
    echo "  status       - Mostrar status dos containers"
    echo "  clean        - Limpar containers e imagens"
    echo "  build        - Fazer build das imagens"
    echo "  shell        - Entrar no container"
    echo "  backup       - Fazer backup dos dados"
    echo "  restore      - Restaurar backup dos dados"
    echo ""
    echo "Opções:"
    echo "  --build      - Forçar rebuild das imagens"
    echo "  --no-cache   - Build sem cache"
    echo "  --follow     - Seguir logs em tempo real"
    echo ""
    echo "Exemplos:"
    echo "  $0 dev --build"
    echo "  $0 prod"
    echo "  $0 logs --follow"
    echo "  $0 shell frontend"
}

# Iniciar ambiente de desenvolvimento
start_dev() {
    log "Iniciando ambiente de desenvolvimento..."
    docker-compose --profile dev up -d $BUILD_FLAG
    success "Ambiente de desenvolvimento iniciado!"
    echo ""
    echo "URLs disponíveis:"
    echo "  Frontend: http://localhost:${FRONTEND_PORT:-4200}"
    echo "  API: http://localhost:${API_PORT:-3000}"
    echo "  API via Frontend: http://localhost:${FRONTEND_PORT:-4200}/api/"
}

# Iniciar ambiente de produção
start_prod() {
    log "Iniciando ambiente de produção..."
    docker-compose --profile prod up -d $BUILD_FLAG
    success "Ambiente de produção iniciado!"
    echo ""
    echo "URLs disponíveis:"
    echo "  Aplicação: http://localhost:${APP_PORT:-80}"
    echo "  API: http://localhost:${API_PORT:-3000}"
}

# Iniciar apenas API
start_api() {
    log "Iniciando apenas a API..."
    docker-compose up api -d $BUILD_FLAG
    success "API iniciada!"
    echo ""
    echo "URLs disponíveis:"
    echo "  API: http://localhost:${API_PORT:-3000}"
}

# Parar containers
stop_containers() {
    log "Parando containers..."
    docker-compose down
    success "Containers parados!"
}

# Reiniciar containers
restart_containers() {
    log "Reiniciando containers..."
    docker-compose restart
    success "Containers reiniciados!"
}

# Mostrar logs
show_logs() {
    if [ "$FOLLOW" = "true" ]; then
        docker-compose logs -f
    else
        docker-compose logs --tail=50
    fi
}

# Mostrar status
show_status() {
    log "Status dos containers:"
    docker-compose ps
    echo ""
    log "Uso de recursos:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Limpar containers e imagens
clean_docker() {
    log "Limpando containers e imagens..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    docker image prune -f
    success "Limpeza concluída!"
}

# Fazer build das imagens
build_images() {
    log "Fazendo build das imagens..."
    docker-compose build $BUILD_FLAG
    success "Build concluído!"
}

# Entrar no container
enter_shell() {
    local service=${1:-frontend}
    log "Entrando no container $service..."
    docker-compose exec $service sh
}

# Fazer backup dos dados
backup_data() {
    log "Fazendo backup dos dados..."
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$backup_file" data/ config/
    success "Backup criado: $backup_file"
}

# Restaurar backup
restore_data() {
    local backup_file=$1
    if [ -z "$backup_file" ]; then
        error "Especifique o arquivo de backup"
        exit 1
    fi
    log "Restaurando backup: $backup_file"
    tar -xzf "$backup_file"
    success "Backup restaurado!"
}

# Função principal
main() {
    # Verificar argumentos
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    # Verificar Docker
    check_docker
    
    # Verificar e carregar .env
    check_env
    load_env

    # Processar argumentos
    BUILD_FLAG=""
    FOLLOW="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build)
                BUILD_FLAG="--build"
                shift
                ;;
            --no-cache)
                BUILD_FLAG="--build --no-cache"
                shift
                ;;
            --follow)
                FOLLOW="true"
                shift
                ;;
            dev)
                start_dev
                exit 0
                ;;
            prod)
                start_prod
                exit 0
                ;;
            api)
                start_api
                exit 0
                ;;
            stop)
                stop_containers
                exit 0
                ;;
            restart)
                restart_containers
                exit 0
                ;;
            logs)
                show_logs
                exit 0
                ;;
            status)
                show_status
                exit 0
                ;;
            clean)
                clean_docker
                exit 0
                ;;
            build)
                build_images
                exit 0
                ;;
            shell)
                enter_shell $2
                exit 0
                ;;
            backup)
                backup_data
                exit 0
                ;;
            restore)
                restore_data $2
                exit 0
                ;;
            help|--help|-h)
                show_help
                exit 0
                ;;
            *)
                error "Comando desconhecido: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Executar função principal
main "$@"

