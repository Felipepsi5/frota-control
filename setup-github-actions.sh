#!/bin/bash

# Script de Setup para GitHub Actions - Frotacontrol
# Configuração automática do ambiente para deploy na Hostinger

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

# Verificar se está no diretório correto
check_project() {
    log "Verificando projeto..."
    
    if [ ! -f "package.json" ] || [ ! -f "angular.json" ]; then
        error "Este script deve ser executado no diretório raiz do projeto Angular"
        exit 1
    fi
    
    success "Projeto Angular detectado"
}

# Instalar dependências de desenvolvimento
install_dependencies() {
    log "Instalando dependências de desenvolvimento..."
    
    # Instalar Prettier se não estiver instalado
    if ! npm list prettier >/dev/null 2>&1; then
        npm install --save-dev prettier
    fi
    
    # Instalar dependências
    npm install
    
    success "Dependências instaladas"
}

# Configurar Prettier
setup_prettier() {
    log "Configurando Prettier..."
    
    # Criar arquivo de configuração do Prettier
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
EOF

    # Criar arquivo .prettierignore
    cat > .prettierignore << 'EOF'
node_modules/
dist/
coverage/
*.min.js
*.min.css
package-lock.json
yarn.lock
EOF

    success "Prettier configurado"
}

# Configurar ESLint
setup_eslint() {
    log "Configurando ESLint..."
    
    # Verificar se ESLint está configurado
    if [ ! -f ".eslintrc.json" ]; then
        warning "ESLint não está configurado. Execute 'ng add @angular-eslint/schematics' para configurar"
    else
        success "ESLint já configurado"
    fi
}

# Criar arquivo de configuração do ambiente
setup_environment() {
    log "Configurando ambiente de produção..."
    
    # Verificar se environment.prod.ts existe
    if [ ! -f "src/environments/environment.prod.ts" ]; then
        error "Arquivo environment.prod.ts não encontrado"
        exit 1
    fi
    
    # Criar arquivo .env.example para produção
    cat > .env.production.example << 'EOF'
# Configurações de Produção - Frotacontrol
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

# Configurações do Firebase (ajuste conforme necessário)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
EOF

    success "Arquivo de ambiente de produção criado"
}

# Configurar Git hooks
setup_git_hooks() {
    log "Configurando Git hooks..."
    
    # Criar diretório de hooks se não existir
    mkdir -p .git/hooks
    
    # Criar pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook para Frotacontrol

echo "Executando verificações pré-commit..."

# Executar linting
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting falhou. Corrija os erros antes de fazer commit."
    exit 1
fi

# Verificar formatação
npm run format:check
if [ $? -ne 0 ]; then
    echo "❌ Formatação incorreta. Execute 'npm run format' para corrigir."
    exit 1
fi

# Executar testes
npm run test:ci
if [ $? -ne 0 ]; then
    echo "❌ Testes falharam. Corrija os testes antes de fazer commit."
    exit 1
fi

echo "✅ Todas as verificações passaram!"
EOF

    # Tornar hook executável
    chmod +x .git/hooks/pre-commit
    
    success "Git hooks configurados"
}

# Criar arquivo de configuração do Docker
setup_docker() {
    log "Configurando Docker..."
    
    # Verificar se Dockerfile existe
    if [ ! -f "Dockerfile" ]; then
        error "Dockerfile não encontrado"
        exit 1
    fi
    
    # Verificar se docker-compose.prod.yml existe
    if [ ! -f "docker-compose.prod.yml" ]; then
        error "docker-compose.prod.yml não encontrado"
        exit 1
    fi
    
    success "Docker configurado"
}

# Criar arquivo .dockerignore
setup_dockerignore() {
    log "Configurando .dockerignore..."
    
    cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.coverage/
dist
.vscode
.idea
*.swp
*.swo
*~
.DS_Store
Thumbs.db
EOF

    success ".dockerignore criado"
}

# Configurar nginx para produção
setup_nginx() {
    log "Configurando Nginx..."
    
    if [ ! -f "nginx.conf" ]; then
        error "nginx.conf não encontrado"
        exit 1
    fi
    
    # Verificar se server_name está configurado
    if grep -q "server_name _;" nginx.conf; then
        warning "Lembre-se de alterar 'server_name _;' para seu domínio no nginx.conf"
    fi
    
    success "Nginx configurado"
}

# Mostrar próximos passos
show_next_steps() {
    log "Setup concluído! Próximos passos:"
    echo ""
    echo "1. 🔐 Configurar Secrets no GitHub:"
    echo "   - Vá para Settings → Secrets and variables → Actions"
    echo "   - Adicione os secrets listados em GITHUB-ACTIONS-SETUP.md"
    echo ""
    echo "2. 🖥️  Configurar servidor Hostinger:"
    echo "   - Instalar Docker e Docker Compose"
    echo "   - Configurar firewall (portas 22, 80, 443)"
    echo "   - Instalar Certbot para SSL"
    echo ""
    echo "3. 🌐 Configurar domínio:"
    echo "   - Apontar domínio para o IP do servidor"
    echo "   - Atualizar server_name no nginx.conf"
    echo ""
    echo "4. 🚀 Fazer primeiro deploy:"
    echo "   - Fazer push para branch main/master"
    echo "   - Verificar logs no GitHub Actions"
    echo ""
    echo "📚 Documentação completa: GITHUB-ACTIONS-SETUP.md"
}

# Função principal
main() {
    log "Iniciando setup do GitHub Actions para Frotacontrol..."
    
    check_project
    install_dependencies
    setup_prettier
    setup_eslint
    setup_environment
    setup_git_hooks
    setup_docker
    setup_dockerignore
    setup_nginx
    show_next_steps
    
    success "Setup concluído com sucesso!"
}

# Verificar se script está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
