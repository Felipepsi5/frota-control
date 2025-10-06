# Script PowerShell para testar a aplicação Angular no Docker localmente
# Execute: .\docker-test.ps1

Write-Host "🐳 Iniciando teste da aplicação Angular no Docker..." -ForegroundColor Cyan
Write-Host ""

# Parar e remover contêineres existentes (se houver)
Write-Host "🧹 Limpando contêineres existentes..." -ForegroundColor Yellow
docker stop frotacontrol-test 2>$null
docker rm frotacontrol-test 2>$null

# Construir a imagem Docker
Write-Host "🔨 Construindo imagem Docker..." -ForegroundColor Yellow
docker build -t frotacontrol-angular .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Imagem construída com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Executar o contêiner
    Write-Host "🚀 Iniciando contêiner..." -ForegroundColor Yellow
    docker run -d -p 8080:80 --name frotacontrol-test frotacontrol-angular
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Contêiner iniciado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Aplicação disponível em: http://localhost:8080" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
        Write-Host "   - Ver logs: docker logs frotacontrol-test"
        Write-Host "   - Parar: docker stop frotacontrol-test"
        Write-Host "   - Remover: docker rm frotacontrol-test"
        Write-Host ""
        Write-Host "🔄 Para parar e limpar tudo:" -ForegroundColor Cyan
        Write-Host "   docker stop frotacontrol-test; docker rm frotacontrol-test"
    } else {
        Write-Host "❌ Erro ao iniciar o contêiner!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Erro ao construir a imagem Docker!" -ForegroundColor Red
    exit 1
}
