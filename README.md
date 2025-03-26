# Autenticação automática com Caddy e Node.js

<!--toc:start-->
- [Autenticação automática com Caddy e Node.js](#autenticação-automática-com-caddy-e-nodejs)
  - [Definição](#definição)
  - [Instruções](#instruções)
    - [Rotas públicas](#rotas-públicas)
    - [Rotas privadas](#rotas-privadas)
<!--toc:end-->

>Repositório com o código da live sobre autenticação automática com Caddy e Node.js

## Definição

Esse repositório _não_ é um repositório de produção, ele apenas contém uma
implementação de exemplo para um modelo de autenticação e _rate limiting_ com
Node.js usando Caddy como proxy.

A ideia básica é poder fazer a diferenciação de usuário sem precisar resolver
tudo na API. Neste exemplo vamos ter:

1. Uma api interna que simboliza o nosso serviço disponível para os usuários
2. Uma api de autenticação cuja única responsabilidade é resolver a qual
   usuário uma chave de API pertence

Esse processo torna transparente qualquer autenticação através de APIs ou tokens
diretamente implementado no proxy. Claro que, esse é um exemplo simples, você
pode expandir muito esse modelo usando somente o serviço de autenticação (sem
JWT) ou utilizando múltiplos modos de autenticação diretamente no proxy e
mandando um token único para o backend

## Instruções

1. Tenha o Docker instalado na sua máquina
2. Edite o arquivo `/etc/hosts` (no Linux ou Mac) e adicione a seguinte linha
   `127.0.0.1 api.exemplo.local`
    - No Windows o arquivo está em `C:\Windows\System32\Drivers\etc\hosts`
      você precisa abrir com permissões de administrador
3. **Na raiz desta pasta** (onde está o arquivo `docker-compose.yml`) execute
   `docker compose up` em um terminal
4. Você pode acessar as APIs por `localhost:8080/public` ou
   `localhost:8080/private`

### Rotas públicas

Rotas públicas vão responder diretamente, então você deve ter uma resposta
direta dizendo `This is a public route`

### Rotas privadas

Rotas privadas só podem ser acessadas se a chave da API estiver disponível no
mapa de usuários [no serviço de autenticação](./auth-service/src/index.ts), por
padrão, os usuários são:

- `Lucas`: com a chave `123456`
- `Bill`: com a chave `999999`

Para acessar a rota privada você precisa fazer uma requisição `GET` para
`api.exemplo.local:8080/private` passando o header `Authorization: key <chave>`.
