# =================================================================
# ESTÁGIO 1: Compilação (Build)
# Usamos uma imagem Node.js para compilar o projeto Angular.
# =================================================================
FROM node:18-alpine as build

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos 'package.json' e 'package-lock.json' primeiro
# Isso aproveita o cache do Docker. As dependências só serão reinstaladas se esses arquivos mudarem.
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o restante do código-fonte do Angular para o contêiner
COPY . .

# Executa o comando de build de produção do Angular.
# Usando o nome correto do projeto: 'frotacontrol'
RUN npm run build -- --configuration production

# =================================================================
# ESTÁGIO 2: Produção (Servidor Web)
# Agora usamos uma imagem Nginx, que é um servidor web leve e rápido,
# para servir os arquivos estáticos que acabamos de gerar.
# =================================================================
FROM nginx:1.25-alpine

# Remove o conteúdo padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos compilados do estágio de 'build' para a pasta do Nginx.
# Usando o nome correto do projeto: 'frotacontrol'
COPY --from=build /app/dist/frotacontrol /usr/share/nginx/html

# Copia o arquivo de configuração do Nginx para as rotas do Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Informa que o contêiner irá expor a porta 80
EXPOSE 80

# Comando padrão para iniciar o Nginx quando o contêiner for executado
CMD ["nginx", "-g", "daemon off;"]
