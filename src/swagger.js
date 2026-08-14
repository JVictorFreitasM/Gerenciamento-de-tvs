// src/swagger.js - documentacao de API (Swagger UI + ReDoc)
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TV Signage API',
      version: '1.0.0',
      description:
        'Gestao de midia e playlists exibidas em TVs fisicas por setor (upload de video/imagem, ' +
        'ordenacao de playlist, cadastro de TVs). Autenticacao via IdP centralizado (OAuth2 + JWT) ' +
        'para as rotas humanas; rotas de TV fisica (/tv/:identificador, /videos, /uploads) usam ' +
        'accessToken proprio, nao sessao de usuario.',
    },
    servers: [{ url: 'http://localhost:5001', description: 'Desenvolvimento local (docker-compose)' }],
    tags: [
      { name: 'Autenticacao' },
      { name: 'Setores' },
      { name: 'Dashboard' },
      { name: 'Playlist' },
      { name: 'Midia' },
      { name: 'Admin' },
      { name: 'TV Fisica' },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description:
            'Sessao local deste backend, criada em /auth/callback apos o fluxo OAuth2 com o IdP ' +
            '(idp-client). Guarda o access_token/refresh_token do IdP no servidor (Redis) - nunca no navegador.',
        },
        tvToken: {
          type: 'apiKey',
          in: 'query',
          name: 'token',
          description:
            'accessToken da TV fisica (tambem aceito via header x-tv-token). Gerado no cadastro ' +
            '(POST /api/admin/tvs), nao expira, nao e o mesmo mecanismo de sessao de usuario humano.',
        },
      },
      schemas: {
        ErroPadrao: {
          type: 'object',
          description: 'Formato de erro mais comum deste backend - cada controller monta a resposta a mao.',
          properties: {
            error: { type: 'string', example: 'erro_interno' },
            message: { type: 'string', example: 'Mensagem legivel para o usuario.' },
          },
        },
        Sucesso: {
          type: 'object',
          description: 'Formato usado por endpoints de acao (mover, remover, reordenar).',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', nullable: true },
          },
        },
        Setor: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
          },
        },
        TV: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            identificador: { type: 'string' },
            online: { type: 'boolean' },
            lastSeenAt: { type: 'string', format: 'date-time', nullable: true },
            accessToken: { type: 'string', description: 'so incluido quando o usuario ja tem acesso ao proprio setor' },
          },
        },
        Media: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            filename: { type: 'string' },
            tipo: { type: 'string', enum: ['VIDEO', 'IMAGEM'] },
            tamanho: { type: 'integer', description: 'bytes' },
            duracao: { type: 'integer', description: 'segundos, default 10 (so relevante pra IMAGEM)' },
            setorId: { type: 'integer' },
            uploadedById: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Playlist: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            setorId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ sessionCookie: [] }],
  },
  apis: ['./src/routes/**/*.js', './app.js'],
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      swaggerOptions: { persistAuthorization: true, filter: true, docExpansion: 'list' },
      customSiteTitle: 'TV Signage - API Docs',
    })
  );

  app.get('/api-docs.json', (_req, res) => {
    res.json(specs);
  });

  app.get('/redoc', (_req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
  <title>TV Signage - ReDoc</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>body { margin: 0; padding: 0; }</style>
</head>
<body>
  <redoc spec-url="/api-docs.json"></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
</body>
</html>`);
  });
}

module.exports = { setupSwagger, specs };
