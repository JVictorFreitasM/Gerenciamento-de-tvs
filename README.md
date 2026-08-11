# Gerenciamento de TVs (TV Signage)

Sistema web para gerenciar painéis de TV corporativos por setor, permitindo o upload de mídias (vídeos e imagens), organização em playlists e exibição automática nas TVs de cada setor.

![Dashboard do TV Signage](screenshots/TV%20signade%20home.jpg)

> As duas imagens que ficavam aqui (`Painel-de-Controle-TVs`,
> `Playlist-diretoria`) eram do front antigo em EJS, substituído pela SPA
> React na OS 12-C — removidas por não representarem mais o sistema atual.
> Ver [Screenshots](#screenshots) para o estado das capturas novas.

## Índice

1. [Funcionalidades](#funcionalidades)
2. [Tecnologias](#tecnologias)
3. [Arquitetura](#arquitetura)
4. [Autenticação via IdP](#autenticação-via-idp)
5. [Como rodar com Docker](#como-rodar-com-docker-recomendado)
6. [Como rodar localmente](#como-rodar-localmente-sem-docker)
7. [Estrutura de rotas principais](#estrutura-de-rotas-principais)
8. [Variáveis de ambiente](#variáveis-de-ambiente)
9. [Screenshots](#screenshots)

## Funcionalidades

- Autenticação via IdP centralizado (login/logout SSO, OS 12-B) — sem senha própria
- Controle de acesso por papel geral (`ti`/`usuario`, vindo do IdP) e por setor (dado local, associado por um `ti`)
- Upload de mídias (vídeos e imagens) vinculadas a um setor
- Criação e organização de playlists por setor (reordenar itens, mover para cima/baixo)
- Definição da duração de exibição de cada mídia
- Página de player para exibição em TV, autenticada por accessToken fixo por dispositivo (`/tv/:identificador?token=...`)
- Dashboard para gerenciamento geral
- Remoção de mídias individual ou em lote

## Tecnologias

- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) — API JSON (`/api/*`)
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — SPA em `frontend/` (OS 12-C), consome a API
- [EJS](https://ejs.co/) — só a página do player de TV física (`/tv/:identificador`), fora da SPA
- [Prisma ORM](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/)
- [@copperline/idp-client](./idp-client) — autenticação via IdP centralizado (OS 12-B)
- [Redis](https://redis.io/) — sessão do backend (access/refresh token do IdP)
- [bcrypt](https://www.npmjs.com/package/bcrypt) — legado, senha local não é mais verificada
- [Multer](https://www.npmjs.com/package/multer) — upload de arquivos
- Docker / Docker Compose

## Arquitetura

```mermaid
graph TB
    subgraph Frontend["frontend/ (SPA React+Vite, porta 5002)"]
        React["React SPA<br/>Dashboard, Midia, Admin"]
    end

    subgraph Backend["Backend Express (porta 5001)"]
        API["api.routes.js<br/>/api/* (JSON)"]
        TvRoutes["tv.routes.js<br/>/tv/:identificador (EJS)"]
        Static["/videos, /uploads<br/>(accessToken de TV)"]
        IdPClient["@copperline/idp-client<br/>/auth/*"]
        Session["express-session"]
    end

    subgraph Dispositivos
        TV["TV fisica<br/>(navegador embarcado)"]
    end

    subgraph Dados
        DB[("PostgreSQL")]
        Redis[("Redis<br/>sessao/tokens do IdP")]
    end

    IdPSys["IdP centralizado<br/>(sistema externo)"]

    React -->|"fetch /api/*<br/>(proxy nginx/Vite)"| API
    TV -->|"GET /tv/:id?token=..."| TvRoutes
    TV -->|"GET /videos/..&token=..."| Static
    API --> IdPClient
    IdPClient -->|"OAuth2 + JWT (JWKS)"| IdPSys
    IdPClient --> Session
    Session --> Redis
    API --> DB
    TvRoutes --> DB
    Static -.->|valida accessToken| DB
```

Backend (JSON API) em camadas:

```
src/
├── controllers/    # Recebem as requisições e retornam JSON
├── services/       # Regras de negócio
├── repositories/   # Acesso a dados via Prisma
├── routes/         # api.routes.js (SPA) e tv.routes.js (dispositivos)
├── middleware/      # Autenticação, upload e accessToken de TV
├── validators/      # Validação de dados de entrada
├── views/           # Só player.ejs/player-diretoria.ejs (TV física)
└── utils/           # Funções utilitárias
```

Frontend (SPA, OS 12-C) em `frontend/`:

```
frontend/src/
├── pages/          # Dashboard, Midia, MidiaSetor, AdminSetores, AdminUsuarios
├── components/      # AuthGate, SemSetorAssociado, AcessoNegado
├── services/        # auth.js (login/logout), apiFetch.js
└── config/           # URLs do backend/frontend/IdP (variáveis VITE_*)
```

## Autenticação via IdP

Sem login próprio — autenticação 100% delegada ao IdP centralizado
(repositório `Centralizador de login`) via `@copperline/idp-client`
(OAuth2 Authorization Code + JWT RS256, SSO com os demais sistemas do
parque).

```mermaid
sequenceDiagram
    participant User as Usuário
    participant SPA as Frontend (5002)
    participant BE as Backend (5001)
    participant IdP as IdP centralizado

    User->>SPA: abre a SPA
    SPA->>BE: GET /api/me (redirect: manual)
    BE-->>SPA: 302 (sem sessão) -> opaqueredirect
    SPA->>BE: navegação completa GET /auth/login
    BE-->>User: redirect GET /authorize?client_id=tv-signage&...
    User->>IdP: (login, se sem sessão)
    IdP-->>User: redirect /auth/callback?code=...
    User->>BE: GET /auth/callback
    BE->>IdP: POST /token (code + client_secret)
    IdP-->>BE: access_token + refresh_token
    BE->>BE: guarda em req.session.idpAuth (Redis)
    BE-->>User: redirect FRONTEND_URL (5002)
    SPA->>BE: GET /api/me (agora com cookie de sessão)
    BE->>BE: resolveLocalUser (idpUserId, auto-vinculo por e-mail)
    BE-->>SPA: { user: { name, email, role, setor, setorId } }
```

- **`resolveLocalUser`** ([src/middleware/auth.js](src/middleware/auth.js)):
  busca o `User` local pelo `idpUserId`; no primeiro login de um e-mail já
  cadastrado localmente, vincula automaticamente (`idpUserId = sub`). Sem
  `User` local pro e-mail, bloqueia com mensagem clara.
- **`requireSetorAssociado`**: bloqueia dados de setor pra um `usuario` sem
  `setorId` ainda — front decide mostrar a tela "sem setor associado" a
  partir do payload de `/api/me` (não de um 403).
- **`requireRole('ti')`**: 403 em rotas administrativas (`/api/admin/*`)
  fora do papel `ti`.
- **TVs físicas não usam este fluxo** — autenticam por `accessToken` fixo
  por dispositivo (`/tv/:identificador?token=`), nunca sessão de usuário
  humano.

## Como rodar com Docker (recomendado)

1. Clone o repositório:
   ```bash
   git clone https://github.com/JVictorFreitasM/Gerenciamento-de-tvs.git
   cd Gerenciamento-de-tvs
   ```

2. Suba os containers (aplicação + PostgreSQL):
   ```bash
   docker-compose up -d --build
   ```

3. Rode as migrations do Prisma dentro do container da aplicação:
   ```bash
   docker exec -it painel-app npx prisma migrate deploy
   ```

4. (Opcional) Popule o banco com dados iniciais:
   ```bash
   docker exec -it painel-app npm run seed
   ```

5. Acesse a SPA (não o backend diretamente):
   ```
   http://localhost:5002
   ```

## Como rodar localmente (sem Docker)

1. Instale as dependências do backend (compila o `idp-client` local antes) e do frontend:
   ```bash
   npm --prefix idp-client run build
   npm install
   npm --prefix frontend install
   ```

2. Configure `.env` na raiz (baseado em `.env-exemple`) — `IDP_*` precisam bater com o System
   "TV Signage" cadastrado no painel do IdP (OS 12-A), `FRONTEND_URL` aponta pra porta do Vite
   (não a do próprio backend - o callback roda aqui, mas quem o usuário deve ver é a SPA), e é
   preciso um Redis rodando:
   ```env
   PORT=5001
   IDP_URL=http://localhost:3000
   IDP_CLIENT_ID=...
   IDP_CLIENT_SECRET=...
   IDP_REDIRECT_URI=http://localhost:5001/auth/callback
   FRONTEND_URL=http://localhost:5002
   SESSION_SECRET=uma-chave-qualquer
   REDIS_URL=redis://localhost:6379
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/painel
   ```

   E `frontend/.env` (baseado em `frontend/.env.example`):
   ```env
   VITE_BACKEND_URL=http://localhost:5001
   VITE_FRONTEND_URL=http://localhost:5002
   VITE_IDP_HOME_URL=http://localhost:3000/home
   ```

3. Garanta que você tenha um banco PostgreSQL rodando e execute as migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. (Opcional) Popule o banco com dados iniciais:
   ```bash
   npm run seed
   ```

5. Inicie o backend e, em outro terminal, o frontend:
   ```bash
   npm start                     # backend na porta 5001
   npm --prefix frontend run dev # Vite na porta 5002, proxy de /api pro backend
   ```

6. Acesse a SPA:
   ```
   http://localhost:5002
   ```

## Estrutura de rotas principais

Rotas humanas (consumidas pela SPA em `frontend/`, todas sob `/api`):

| Método | Rota                            | Descrição                                    |
|--------|----------------------------------|-----------------------------------------------|
| GET    | `/auth/login`                    | Inicia login via IdP (idp-client)              |
| GET    | `/auth/callback`                 | Callback OAuth do IdP (idp-client)             |
| GET    | `/auth/logout`                   | Encerra sessão local e no IdP (idp-client)     |
| GET    | `/api/me`                        | Dados do usuário logado                        |
| GET    | `/api/setores`                   | Setores visíveis ao usuário logado             |
| GET    | `/api/dashboard`                 | Visão geral: setores e TVs online/offline      |
| GET    | `/api/playlist/:setor`           | Playlist (mídias ordenadas) de um setor        |
| POST   | `/api/media/upload/:setor`       | Envia mídias para um setor (multipart)         |
| GET    | `/api/media/file/:setor/:nome`   | Preview de uma mídia (sessão humana)           |
| PUT    | `/api/media/:id/duration`        | Atualiza a duração de exibição de uma mídia    |
| DELETE | `/api/media/:id` / `/media/bulk` | Remove uma ou várias mídias                    |
| POST   | `/api/playlist/move-up\|down/:id`| Reordena um item da playlist                   |
| POST   | `/api/playlist/reorder`          | Reordena a playlist inteira (drag and drop)    |
| GET/POST | `/api/admin/setores`           | Lista/cria setores e TVs (exclusivo `ti`)      |
| GET/POST | `/api/admin/usuarios`          | Associa usuário↔setor (exclusivo `ti`)         |
| POST   | `/api/admin/tvs`                 | Cadastra TV física, gera accessToken (`ti`)    |

Rotas de dispositivo (TVs físicas - fora da SPA, inalteradas pela OS 12-C):

| Método | Rota                          | Descrição                                  |
|--------|-------------------------------|---------------------------------------------|
| GET    | `/tv/:identificador?token=`   | Player de exibição da TV (accessToken fixo)  |
| GET    | `/videos/:setor/:arquivo`     | Arquivo de mídia estático (accessToken)      |
| GET    | `/uploads/:arquivo`           | Arquivo de mídia estático (accessToken)      |

## Variáveis de ambiente

Ver `.env-exemple` (backend) e `frontend/.env.example` (SPA) — inclui as variáveis do
idp-client (`IDP_URL`, `IDP_CLIENT_ID`, `IDP_CLIENT_SECRET`, `IDP_REDIRECT_URI`, etc.),
`FRONTEND_URL`/`CORS_ORIGINS`, `SESSION_SECRET`, `REDIS_URL` e `DATABASE_URL`.

## Screenshots

Ver [screenshots/](screenshots/) — índice completo, incluindo um arquivo
com conteúdo trocado que precisa de atenção.

## Licença

ISC
