# Base image: use Node 20 Alpine (requisito do Polaris v13+ e melhor performance/longevidade)
FROM node:20-alpine

# Atualiza o sistema e instala dependências essenciais (openssl já incluso na maioria dos casos, mas mantive por segurança)
RUN apk add --no-cache openssl

# Exponha a porta padrão da aplicação (ajuste conforme necessário)
EXPOSE 3000

# Defina diretório de trabalho seguro
WORKDIR /app

# Defina variáveis de ambiente de produção
ENV NODE_ENV=production

# Copie somente os arquivos de dependências primeiro (para otimizar cache de build)
COPY package.json package-lock.json* ./

# Instale dependências sem as de desenvolvimento
RUN npm ci --omit=dev && npm cache clean --force

# (Opcional e seguro) remova CLIs desnecessárias para produção - recomendação enterprise
RUN npm remove @shopify/cli || true

# Copie o restante do código da aplicação para dentro do container
COPY . .

# Faça o build do projeto (certifique-se de que "build" existe no package.json)
RUN npm run build

# Comando padrão de inicialização da aplicação
CMD ["npm", "run", "docker-start"]