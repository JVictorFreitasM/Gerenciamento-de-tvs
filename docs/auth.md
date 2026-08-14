# Autenticação

Este backend tem **dois mecanismos de autenticação completamente separados**, um pra humano e um pra
dispositivo:

1. **Sessão de usuário humano** (`/api/*`, telas administrativas) - via IdP centralizado, cookie `connect.sid`.
2. **`accessToken` de TV física** (`/tv/:identificador`, `/videos`, `/uploads`) - token opaco gerado no
   cadastro da TV, sem relação nenhuma com sessão/usuário.

## 1. Sessão de usuário humano (IdP centralizado)

Nenhum login próprio - toda autenticação humana é delegada ao IdP centralizado
(`Centralizador-de-login`), via `@copperline/idp-client`.

### Fluxo completo

1. **Frontend redireciona pro backend** - direto pra origem do backend, não é proxied pelo Vite
   (`frontend/vite.config.ts` só tem proxy pra `/api`, não pra `/auth`):
   ```
   GET http://localhost:5001/auth/login
   ```
2. Usuário loga no IdP (se ainda não tiver sessão lá) e é redirecionado de volta:
   ```
   GET http://localhost:5001/auth/callback?code=...&state=...
   ```
3. `/auth/callback` valida o `state`, troca o `code` por tokens e guarda tudo na **sessão local
   deste backend** (Redis) - nunca no navegador. Redireciona pro `FRONTEND_URL`
   (`http://localhost:5002` em dev).
4. Toda chamada subsequente a `/api/*` usa o **cookie de sessão** (`connect.sid`), não um header
   `Authorization: Bearer`.

### `requireAuth` não retorna 401 JSON

Igual ao Contracheque Bot: o middleware `requireAuth` do `idp-client` **redireciona** (`302` pro
`/auth/login`) quando não há sessão válida - não responde `401 { error }`. Quem consome a API via
`fetch`/`curl` precisa mandar o cookie (`credentials: 'include'` no fetch) e tratar o `302` como
"não autenticado".

### Vínculo do usuário local (`resolveLocalUser`)

Depois que `requireAuth` passa, `resolveLocalUser` (`src/middleware/auth.js`) resolve o `User` local
correspondente ao `sub` do token do IdP - por `idpUserId` primeiro, com fallback pra vínculo
automático por `email` no primeiro login. Se não encontrar nenhum `User` local com aquele e-mail,
responde `403 { error: "usuario_nao_vinculado" }` - autenticado no IdP, mas não cadastrado neste
sistema (precisa ser cadastrado pelo `ti` antes).

### Papéis (`papel`)

Vem **exclusivamente** da claim `role` do token do IdP, nunca do campo legado `User.role`:
**`usuario`** e **`ti`**. `ti` enxerga todos os setores e acessa as rotas `/api/admin/*`;
`usuario` só o próprio setor (depois de associado por um `ti` - ver `requireSetorAssociado`).

### Logout

```
GET http://localhost:5001/auth/logout
```

Revoga o `refresh_token` no IdP (best-effort), destrói a sessão local e redireciona pro **menu
central do IdP** (`homeUrl`), não de volta pro TV Signage - evita reabrir o mesmo sistema de onde o
usuário acabou de sair (mesmo cuidado do Farol e do Contracheque Bot).

## 2. `accessToken` de TV física

As rotas consumidas pelo **dispositivo físico** (não por um navegador de usuário) usam um mecanismo
totalmente diferente:

- `GET /tv/:identificador?token=...` (ou header `x-tv-token`)
- `GET /videos/...` (estático, mesma checagem)
- `GET /uploads/...` (estático, mesma checagem)

O `accessToken` é gerado aleatoriamente no cadastro da TV (`POST /api/admin/tvs`, exclusivo de
`ti`) e nunca expira - fica em texto puro no banco, recuperável via
`GET /api/admin/tvs/:id/token`, porque o dispositivo físico precisa dele a cada carga de página.
Token ausente ou inválido responde `401`/`404` em **texto plano**, não JSON (a rota renderiza HTML
pro dispositivo, não é uma API JSON).
