# Códigos de Erro

## Formato - inconsistente entre controllers (documentado como está, não como deveria ser)

Não existe error handler global neste backend - cada controller faz seu próprio `try/catch` e monta
a resposta à mão. Pelo menos três formatos convivem hoje:

**Rotas de leitura/cadastro** (`meController`, `setorController`, `dashboardController`,
`adminController`, `tvController.create/getToken`) - `{ error, message }`:
```json
{ "error": "erro_interno", "message": "mensagem detalhada" }
```

**Rotas de ação sobre playlist/mídia** (`moveUp`, `moveDown`, `reorder`, `updateDuration`,
`remove`, `removeMany`) - `{ success: false, ... }`, mas o campo com o texto varia:
```json
{ "success": false, "error": "Item não encontrado" }
```
```json
{ "success": false, "message": "mensagem do erro" }
```

**Rotas de TV física** (`GET /tv/:identificador`) - **texto plano**, não JSON:
```
TV não reconhecida ou token inválido.
```

Se for consumir a API programaticamente, não dá pra assumir um único campo/formato - depende do
endpoint. Isso está documentado endpoint a endpoint na spec OpenAPI (`openapi.json`).

## Sem error handler global

Uma exceção não capturada por um `try/catch` de controller vira a página de erro HTML padrão do
Express, não um JSON de erro.

## Status codes em uso

| Código | Quando |
|---|---|
| 200 | Sucesso |
| 201 | Criação (mídia, setor, TV) |
| 302 | `requireAuth` sem sessão válida - redireciona pro `/auth/login` (não é JSON) |
| 400 | Parâmetro/body inválido (`nome_invalido`, `arquivo_obrigatorio`, `tipo_invalido`, `identificador_duplicado`, `erro_ao_associar`) ou falha de regra de negócio numa ação de playlist |
| 401 | `GET /tv/:identificador` com `accessToken` ausente/inválido (texto plano) |
| 403 | `usuario_nao_vinculado` (sem `User` local), `setor_nao_associado` (sem setor ainda), `acesso_negado` (rota de `ti` acessada por `usuario`, ou setor do path diferente do próprio) |
| 404 | Recurso não encontrado (`arquivo_nao_encontrado`, `setor_nao_encontrado`, `tv_nao_encontrada`, `playlist_nao_encontrada`) |
| 500 | Erro não previsto, capturado no `try/catch` do controller (`erro_interno`) |

## Exemplos

### 403 - Rota de admin sem papel `ti`

```bash
curl -b cookies.txt http://localhost:5001/api/admin/setores

HTTP/1.1 403 Forbidden
{ "error": "acesso_negado", "message": "Você não tem acesso a esta área." }
```

### 403 - Setor do path diferente do próprio setor do usuário

```bash
curl -b cookies.txt http://localhost:5001/api/playlist/OutroSetor

HTTP/1.1 403 Forbidden
{ "error": "acesso_negado", "message": "Você só pode acessar o seu próprio setor." }
```

### 302 - Sem sessão

```bash
curl -i http://localhost:5001/api/me

HTTP/1.1 302 Found
Location: /auth/login
```

### 401 - TV com token inválido (texto plano)

```bash
curl -i "http://localhost:5001/tv/recepcao?token=errado"

HTTP/1.1 401 Unauthorized
Content-Type: text/html; charset=utf-8

TV não reconhecida ou token inválido.
```
