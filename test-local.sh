#!/bin/bash

# Script de Teste Local - Frotacontrol
# Este script verifica e testa a aplicação localmente

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

# Verificar se Docker está instalado
check_docker_installation() {
    log "Verificando instalação do Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Instale o Docker Desktop primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado."
        exit 1
    fi
    
    success "Docker e Docker Compose estão instalados"
}

# Verificar se Docker Desktop está rodando
check_docker_running() {
    log "Verificando se Docker Desktop está rodando..."
    
    if ! docker ps &> /dev/null; then
        error "Docker Desktop não está rodando!"
        echo
        echo "Para iniciar o Docker Desktop:"
        echo "1. Abra o Docker Desktop no Windows"
        echo "2. Aguarde até que o status seja 'Running'"
        echo "3. Execute este script novamente"
        echo
        echo "Ou execute: start 'C:\Program Files\Docker\Docker\Docker Desktop.exe'"
        exit 1
    fi
    
    success "Docker Desktop está rodando"
}

# Verificar arquivos necessários
check_required_files() {
    log "Verificando arquivos necessários..."
    
    required_files=(
        "docker-compose.yml"
        "docker-compose.prod.yml"
        "docker-compose.app-only.yml"
        "Dockerfile"
        "nginx.conf"
        "package.json"
        "db.json"
        "routes.json"
        "json-server.json"
        "middleware.js"
    )
    
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        success "Todos os arquivos necessários estão presentes"
    else
        error "Arquivos ausentes:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
}

# Verificar configurações de ambiente
check_environment_config() {
    log "Verificando configurações de ambiente..."
    
    # Verificar se environment.prod.ts existe e tem configurações válidas
    if [ -f "src/environments/environment.prod.ts" ]; then
        if grep -q "apiUrl.*'/api'" src/environments/environment.prod.ts; then
            success "Configuração de API encontrada em environment.prod.ts"
        else
            warning "Configuração de API pode estar incorreta em environment.prod.ts"
        fi
    else
        error "Arquivo environment.prod.ts não encontrado"
        exit 1
    fi
    
    # Verificar package.json
    if grep -q '"build"' package.json; then
        success "Script de build encontrado no package.json"
    else
        error "Script de build não encontrado no package.json"
        exit 1
    fi
}

# Testar build da aplicação
test_build() {
    log "Testando build da aplicação Angular..."
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        log "Instalando dependências..."
        npm install
    fi
    
    # Testar build
    log "Executando build de produção..."
    npm run build
    
    if [ -d "dist/frotacontrol" ]; then
        success "Build da aplicação concluído com sucesso"
    else
        error "Build falhou - diretório dist/frotacontrol não encontrado"
        exit 1
    fi
}

# Testar build do Docker
test_docker_build() {
    log "Testando build do Docker..."
    
    # Build da imagem
    docker build -t frotacontrol-test .
    
    if docker images | grep -q frotacontrol-test; then
        success "Build do Docker concluído com sucesso"
    else
        error "Build do Docker falhou"
        exit 1
    fi
}

# Testar containers
test_containers() {
    log "Testando containers..."
    
    # Parar containers existentes
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Testar docker-compose básico
    log "Testando docker-compose básico..."
    docker-compose up -d --build
    
    # Aguardar containers iniciarem
    sleep 10
    
    # Verificar se containers estão rodando
    if docker-compose ps | grep -q "Up"; then
        success "Containers estão rodando"
        
        # Testar se aplicação responde
        log "Testando se aplicação responde..."
        max_attempts=30
        attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -f -s http://localhost:8080 > /dev/null 2>&1; then
                success "Aplicação está respondendo em http://localhost:8080"
                break
            fi
            
            log "Tentativa $attempt/$max_attempts - Aguardando aplicação..."
            sleep 2
            ((attempt++))
        done
        
        if [ $attempt -gt $max_attempts ]; then
            warning "Aplicação não respondeu após $max_attempts tentativas"
            log "Verificando logs..."
            docker-compose logs --tail=20
        fi
        
    else
        error "Containers não estão rodando"
        docker-compose logs
        exit 1
    fi
}

# Mostrar informações úteis
show_info() {
    log "Informações úteis para teste:"
    
    echo
    echo "=== COMANDOS ÚTEIS ==="
    echo "Ver logs: docker-compose logs -f"
    echo "Parar containers: docker-compose down"
    echo "Reiniciar: docker-compose restart"
    echo "Status: docker-compose ps"
    echo
    echo "=== URLS DE TESTE ==="
    echo "Aplicação: http://localhost:8080"
    echo "API: http://localhost:8080/api/"
    echo
    echo "=== SCRIPTS DISPONÍVEIS ==="
    echo "Desenvolvimento: ./docker-scripts.sh dev"
    echo "Produção: ./docker-scripts.sh prod"
    echo "Apenas app: docker-compose -f docker-compose.app-only.yml up -d"
    echo
    echo "=== PARA PRODUÇÃO ==="
    echo "Deploy Hostinger: ./deploy-hostinger.sh"
    echo "Configurar SSL: ./setup-ssl.sh"
}

# Limpeza
cleanup() {
    log "Fazendo limpeza..."
    docker-compose down
    docker rmi frotacontrol-test 2>/dev/null || true
    success "Limpeza concluída"
}

# Função principal
main() {
    log "Iniciando teste local da aplicação Frotacontrol..."
    
    check_docker_installation
    check_docker_running
    check_required_files
    check_environment_config
    test_build
    test_docker_build
    test_containers
    show_info
    
    success "Teste local concluído com sucesso!"
    
    echo
    read -p "Deseja manter os containers rodando? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        cleanup
    fi
}

# Verificar se script está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
