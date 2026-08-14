# Rate Limiting

## Não há rate limit configurado neste backend

Não há `express-rate-limit` (ou equivalente) instalado neste projeto - nem `/auth/*`, nem
`/api/*`, nem as rotas de TV física (`/tv/:identificador`, `/videos`, `/uploads`).

## Se for adicionar no futuro

Os candidatos mais óbvios, por ordem de risco:

1. `POST /api/media/upload/:setor` - upload de arquivo (vídeo/imagem), sem limite de tamanho
   configurado no `multer` (só filtro de mimetype pra vídeo).
2. `GET /tv/:identificador` e `/videos/*` - consumidas por dispositivos físicos em loop
   (recarregam a página/playlist periodicamente); um `accessToken` vazado poderia gerar tráfego
   alto sem limite nenhum.
3. `POST /auth/login` / `/auth/callback` - fluxo delegado ao `idp-client`, que também não aplica
   rate limit próprio neste backend (diferente do IdP central, que limita `POST /login` do lado
   dele).
