#!/bin/bash

# Script para configurar certificados SSL na Hostinger
# Este script ajuda a configurar os certificados SSL para produção

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

# Criar diretório SSL
create_ssl_directory() {
    log "Criando diretório SSL..."
    mkdir -p ssl
    success "Diretório SSL criado"
}

# Instruções para obter certificados da Hostinger
show_hostinger_instructions() {
    log "Instruções para obter certificados SSL da Hostinger:"
    
    echo
    echo "1. Acesse o painel de controle da Hostinger"
    echo "2. Vá para 'SSL' ou 'Certificados SSL'"
    echo "3. Ative o SSL para seu domínio"
    echo "4. Baixe os certificados ou copie o conteúdo"
    echo
    echo "Arquivos necessários:"
    echo "  - ssl/cert.pem (certificado público)"
    echo "  - ssl/key.pem (chave privada)"
    echo
    echo "Se você tiver um certificado .crt, renomeie para .pem"
    echo "Se você tiver um certificado .key, renomeie para .pem"
}

# Verificar se certificados existem
check_certificates() {
    log "Verificando certificados SSL..."
    
    if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
        success "Certificados SSL encontrados"
        
        # Verificar validade dos certificados
        if command -v openssl &> /dev/null; then
            log "Verificando validade dos certificados..."
            
            # Verificar certificado
            if openssl x509 -in ssl/cert.pem -text -noout > /dev/null 2>&1; then
                success "Certificado válido"
                
                # Mostrar informações do certificado
                echo
                echo "=== INFORMAÇÕES DO CERTIFICADO ==="
                openssl x509 -in ssl/cert.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"
                echo
            else
                error "Certificado inválido"
                return 1
            fi
            
            # Verificar chave privada
            if openssl rsa -in ssl/key.pem -check -noout > /dev/null 2>&1; then
                success "Chave privada válida"
            else
                error "Chave privada inválida"
                return 1
            fi
        fi
        
        return 0
    else
        warning "Certificados SSL não encontrados"
        return 1
    fi
}

# Gerar certificado auto-assinado para desenvolvimento
generate_self_signed() {
    log "Gerando certificado auto-assinado para desenvolvimento..."
    
    if ! command -v openssl &> /dev/null; then
        error "OpenSSL não está instalado. Instale o OpenSSL primeiro."
        exit 1
    fi
    
    # Gerar chave privada
    openssl genrsa -out ssl/key.pem 2048
    
    # Gerar certificado auto-assinado
    openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=BR/ST=SP/L=SaoPaulo/O=Frotacontrol/CN=localhost"
    
    success "Certificado auto-assinado gerado"
    warning "Este certificado é apenas para desenvolvimento. Use certificados válidos para produção."
}

# Configurar permissões
set_permissions() {
    log "Configurando permissões dos certificados..."
    
    chmod 600 ssl/key.pem
    chmod 644 ssl/cert.pem
    
    success "Permissões configuradas"
}

# Função principal
main() {
    log "Configurando certificados SSL para Frotacontrol..."
    
    create_ssl_directory
    
    if check_certificates; then
        set_permissions
        success "Certificados SSL já estão configurados!"
    else
        echo
        echo "Escolha uma opção:"
        echo "1) Usar certificados da Hostinger (produção)"
        echo "2) Gerar certificado auto-assinado (desenvolvimento)"
        echo "3) Sair"
        echo
        
        read -p "Digite sua escolha (1-3): " choice
        
        case $choice in
            1)
                show_hostinger_instructions
                echo
                echo "Após obter os certificados da Hostinger, coloque-os em:"
                echo "  - ssl/cert.pem"
                echo "  - ssl/key.pem"
                echo
                echo "Depois execute este script novamente para verificar."
                ;;
            2)
                generate_self_signed
                set_permissions
                success "Certificado auto-assinado configurado!"
                ;;
            3)
                log "Saindo..."
                exit 0
                ;;
            *)
                error "Opção inválida"
                exit 1
                ;;
        esac
    fi
}

# Verificar se script está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
