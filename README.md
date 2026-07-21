# Gerenciamento de TVs

Sistema web para gerenciar painéis de TV corporativos por setor, permitindo o upload de mídias (vídeos e imagens), organização em playlists e exibição automática nas TVs de cada setor.

## Funcionalidades

- Autenticação de usuários (login/logout) com JWT
- Controle de acesso por setor e por papel (`role`), incluindo perfil administrativo (`ti`) com acesso total
- Upload de mídias (vídeos e imagens) vinculadas a um setor
- Criação e organização de playlists por setor (reordenar itens, mover para cima/baixo)
- Definição da duração de exibição de cada mídia
- Página de player para exibição em TV (`/tv/:setor`)
- Dashboard para gerenciamento geral
- Remoção de mídias individual ou em lote

## Tecnologias

- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/)
- [EJS](https://ejs.co/) — views renderizadas no servidor
- [JWT](https://www.npmjs.com/package/jsonwebtoken) — autenticação
- [bcrypt](https://www.npmjs.com/package/bcrypt) — hash de senhas
- [Multer](https://www.npmjs.com/package/multer) — upload de arquivos
- Docker / Docker Compose

## Arquitetura

O projeto segue uma organização em camadas:

```
src/
├── controllers/    # Recebem as requisições e retornam as respostas
├── services/       # Regras de negócio
├── repositories/   # Acesso a dados via Prisma
├── routes/         # Definição das rotas
├── middleware/      # Autenticação e upload
├── validators/      # Validação de dados de entrada
├── views/           # Templates EJS (login, dashboard, player, playlist etc.)
└── utils/           # Funções utilitárias
```

## Modelo de dados

O banco é modelado com Prisma e possui as seguintes entidades principais: `User`, `Setor`, `TV`, `Media` e `Playlist`/`PlaylistMedia`. Veja o diagrama abaixo:

![Diagrama ER](diagrama%20ER.png)

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

5. Acesse:
   ```
   http://localhost:3000
   ```

## Como rodar localmente (sem Docker)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente criando um arquivo `.env` na raiz (baseado em `.env-exemple`):
   ```env
   PORT=3000
   JWT_SECRET=sua_chave_secreta
   DATABASE_URL=postgresql://usuario:senha@localhost:5432/painel
   ```

3. Garanta que você tenha um banco PostgreSQL rodando e execute as migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. (Opcional) Popule o banco com dados iniciais:
   ```bash
   npm run seed
   ```

5. Inicie o servidor:
   ```bash
   npm start
   ```

6. Acesse:
   ```
   http://localhost:3000
   ```

## Estrutura de rotas principais

| Método | Rota                          | Descrição                                  |
|--------|-------------------------------|---------------------------------------------|
| GET    | `/login`                      | Página de login                              |
| POST   | `/login`                      | Autentica o usuário                          |
| GET    | `/logout`                     | Encerra a sessão                             |
| GET    | `/`                            | Página inicial                               |
| GET    | `/upload/:setor`              | Página de upload de mídia por setor          |
| POST   | `/upload/:setor`              | Envia mídias para um setor                   |
| GET    | `/tv/:setor`                  | Player de exibição da TV do setor            |
| GET    | `/dashboard`                  | Painel de gerenciamento                      |
| GET    | `/playlist/:playlistId`       | Lista mídias de uma playlist                 |
| PUT    | `/media/:id/duration`         | Atualiza a duração de exibição de uma mídia  |
| DELETE | `/media/:id`                  | Remove uma mídia                             |
| DELETE | `/media/bulk`                 | Remove várias mídias de uma vez              |

## Variáveis de ambiente

| Variável       | Descrição                                  |
|----------------|---------------------------------------------|
| `PORT`         | Porta em que o servidor irá rodar            |
| `JWT_SECRET`   | Chave secreta usada para assinar os tokens   |
| `DATABASE_URL` | String de conexão com o banco PostgreSQL     |

## Licença

ISC
