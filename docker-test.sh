#!/bin/bash

# Script para testar a aplicação Angular no Docker localmente
# Execute: ./docker-test.sh

echo "🐳 Iniciando teste da aplicação Angular no Docker..."
echo ""

# Parar e remover contêineres existentes (se houver)
echo "🧹 Limpando contêineres existentes..."
docker stop frotacontrol-test 2>/dev/null || true
docker rm frotacontrol-test 2>/dev/null || true

# Construir a imagem Docker
echo "🔨 Construindo imagem Docker..."
docker build -t frotacontrol-angular .

if [ $? -eq 0 ]; then
    echo "✅ Imagem construída com sucesso!"
    echo ""
    
    # Executar o contêiner
    echo "🚀 Iniciando contêiner..."
    docker run -d -p 8080:80 --name frotacontrol-test frotacontrol-angular
    
    if [ $? -eq 0 ]; then
        echo "✅ Contêiner iniciado com sucesso!"
        echo ""
        echo "🌐 Aplicação disponível em: http://localhost:8080"
        echo ""
        echo "📋 Comandos úteis:"
        echo "   - Ver logs: docker logs frotacontrol-test"
        echo "   - Parar: docker stop frotacontrol-test"
        echo "   - Remover: docker rm frotacontrol-test"
        echo ""
        echo "🔄 Para parar e limpar tudo:"
        echo "   docker stop frotacontrol-test && docker rm frotacontrol-test"
    else
        echo "❌ Erro ao iniciar o contêiner!"
        exit 1
    fi
else
    echo "❌ Erro ao construir a imagem Docker!"
    exit 1
fi
