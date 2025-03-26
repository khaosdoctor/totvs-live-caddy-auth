FROM caddy:2.9-builder AS builder

# Adiciona o plugin
RUN xcaddy build \
    --with github.com/mholt/caddy-ratelimit

FROM caddy:2.9-alpine

# Expõe as portas para o Caddy
EXPOSE 80
EXPOSE 443
EXPOSE 443/udp

# Várias variávies que podemos modificar
ARG API_PUBLIC_URL=api.exemplo.local # Você precisa adicionar esse DNS no seu /etc/hosts apontando para 127.0.0.1
ARG API_SERVICE_NAME=api # Como estamos na mesma rede do docker, podemos chamar o serviço com o mesmo nome
ARG API_SERVICE_PORT=3000
ARG AUTH_SERVICE_NAME=auth # Mesma coisa aqui, tudo depende do nome do serviço no docker-compose.yml
ARG AUTH_SERVICE_PORT=4052
# Setamos as variáveis no container
ENV API_PUBLIC_URL=${API_PUBLIC_URL}
ENV API_SERVICE_NAME=${API_SERVICE_NAME}
ENV API_SERVICE_PORT=${API_SERVICE_PORT}
ENV AUTH_SERVICE_NAME=${AUTH_SERVICE_NAME}
ENV AUTH_SERVICE_PORT=${AUTH_SERVICE_PORT}

# Copiamos o binário do caddy que criamos no outro container
COPY --from=builder /usr/bin/caddy /usr/bin/caddy

# Obrigatório se não vamos ter erros para fazer
# binding em portas baixas (80, 443)
RUN setcap -r /usr/bin/caddy

# Adicionamos o nosso Caddyfile
COPY ./Caddyfile /etc/caddy/Caddyfile

# Validação do Caddyfile para não começar com arquivos inválidos
RUN caddy validate --config /etc/caddy/Caddyfile

# Não temos entrypoint ou CMD porque vamos usar o mesmo do Caddy
