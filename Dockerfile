# Multi-stage Dockerfile para Frotacontrol
# Suporta desenvolvimento e produção

# ===========================================
# Estágio Base - Dependências comuns
# ===========================================
FROM node:20-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    tzdata

# Configurar timezone
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# ===========================================
# Estágio Dependencies - Instalar dependências
# ===========================================
FROM base AS dependencies

# Instalar dependências
RUN npm ci --silent && npm cache clean --force

# ===========================================
# Estágio Build - Build da aplicação
# ===========================================
FROM dependencies AS build

# Copiar código fonte (excluindo arquivos desnecessários)
COPY src/ ./src/
COPY angular.json ./
COPY tsconfig.app.json ./
COPY tsconfig.json ./
COPY tsconfig.spec.json ./
COPY package*.json ./
COPY proxy.conf.json ./

# Build da aplicação Angular
ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "production" ]; then \
        npm run build -- --configuration=production --aot --build-optimizer --optimization --source-map=false; \
    else \
        npm run build -- --configuration=development; \
    fi

# ===========================================
# Estágio Development - Frontend em desenvolvimento
# ===========================================
FROM dependencies AS development

# Copiar código fonte (excluindo arquivos desnecessários)
COPY src/ ./src/
COPY angular.json ./
COPY tsconfig.app.json ./
COPY tsconfig.json ./
COPY tsconfig.spec.json ./
COPY package*.json ./
COPY proxy.conf.json ./

# Expor porta
EXPOSE 4200

# Comando para desenvolvimento
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]

# ===========================================
# Estágio Production - Nginx para produção
# ===========================================
FROM nginx:1.25-alpine AS production

# Instalar dependências necessárias
RUN apk add --no-cache \
    wget \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Configurar timezone
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Criar diretórios necessários
RUN mkdir -p /var/cache/nginx /var/log/nginx /etc/nginx/ssl && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar arquivos buildados do Angular
COPY --from=build /app/dist/frotacontrol /usr/share/nginx/html

# Configurar permissões
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Expor portas
EXPOSE 80 443

# Configurar usuário não-root
USER nginx

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]