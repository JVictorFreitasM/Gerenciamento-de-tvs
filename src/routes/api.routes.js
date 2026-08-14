const router = require("express").Router();

const { authenticate, requireSetorAssociado, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

const meController = require("../controllers/me.controller");
const setorController = require("../controllers/setor.controller");
const dashboardController = require("../controllers/dashboard.controller");
const mediaController = require("../controllers/media.controller");
const playlistController = require("../controllers/playlist.controller");
const adminController = require("../controllers/admin.controller");
const tvController = require("../controllers/tv.controller");

// OS 12-C, secao 3.1: backend passa a servir so JSON pras rotas humanas -
// SPA (frontend/) consome tudo daqui embaixo de /api. Rotas de TV fisica
// (/tv/:identificador, /videos, /uploads) ficam fora deste router, sem
// mudanca (OS 12-C, secao 3.1/6).

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Usuario autenticado (dados locais vinculados ao IdP)
 *     description: So authenticate (sem requireSetorAssociado) - e a propria fonte que o front usa pra decidir se mostra a tela "sem setor associado".
 *     tags: [Autenticacao]
 *     security: [{ sessionCookie: [] }]
 *     responses:
 *       200:
 *         description: Usuario logado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     email: { type: string }
 *                     role: { type: string, enum: [ti, usuario] }
 *                     setor: { type: string, nullable: true }
 *                     setorId: { type: integer, nullable: true }
 *       302:
 *         description: Sem sessao valida - requireAuth do idp-client redireciona pro /auth/login (nao retorna JSON)
 *       403:
 *         description: usuario_nao_vinculado - autenticado no IdP mas sem User local correspondente
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
// GET /api/me - so authenticate (sem requireSetorAssociado): e a propria
// fonte que o front usa pra decidir se mostra a tela "sem setor associado".
router.get("/me", authenticate, meController.getMe);

/**
 * @swagger
 * /api/setores:
 *   get:
 *     summary: Lista setores visiveis ao usuario
 *     description: "papel=ti: todos os setores. papel=usuario: so o proprio (ou lista vazia se ainda sem setor associado)."
 *     tags: [Setores]
 *     security: [{ sessionCookie: [] }]
 *     responses:
 *       200:
 *         description: Lista de setores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 setores:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Setor' }
 */
router.get("/setores", authenticate, setorController.list);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Visao geral de setores e TVs online/offline
 *     description: "papel=ti: ve todos os setores. papel=usuario: so o proprio setor (garantido por requireSetorAssociado)."
 *     tags: [Dashboard]
 *     security: [{ sessionCookie: [] }]
 *     responses:
 *       200:
 *         description: Setores com as TVs de cada um
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 papel: { type: string, enum: [ti, usuario] }
 *                 setores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       nome: { type: string }
 *                       tvsTotal: { type: integer }
 *                       tvsOnline: { type: integer }
 *                       tvs:
 *                         type: array
 *                         items: { $ref: '#/components/schemas/TV' }
 *       403:
 *         description: setor_nao_associado
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
router.get("/dashboard", authenticate, requireSetorAssociado, dashboardController.summary);

// OS 12-B, secao 2: setor agora e req.usuario.setorNome (dado local), nao
// mais req.user.role (que virou o papel geral ti/usuario vindo do IdP).
const checkPermission = (getSetorFn) => (req, res, next) => {
    const setor = getSetorFn(req);
    if (req.usuario.papel !== 'ti' && req.usuario.setorNome !== setor) {
        return res.status(403).json({ error: "acesso_negado", message: "Você só pode acessar o seu próprio setor." });
    }
    next();
};

/**
 * @swagger
 * /api/playlist/{setor}:
 *   get:
 *     summary: Dados da tela de gestao de midia/playlist de um setor
 *     description: setor no path e o NOME do setor, nao o id. Exige que o usuario so acesse o proprio setor (ti acessa qualquer um).
 *     tags: [Playlist]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: setor
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Setor, playlist e midias ja ordenadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 setor: { $ref: '#/components/schemas/Setor' }
 *                 playlist: { $ref: '#/components/schemas/Playlist' }
 *                 medias:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Media' }
 *       403:
 *         description: acesso_negado - setor no path diferente do setor do usuario
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 *       404:
 *         description: playlist_nao_encontrada - setor ou playlist inexistente
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
router.get(
    "/playlist/:setor",
    authenticate,
    requireSetorAssociado,
    checkPermission(req => req.params.setor),
    playlistController.page
);

/**
 * @swagger
 * /api/playlist/move-up/{playlistMediaId}:
 *   post:
 *     summary: Move um item da playlist uma posicao pra cima
 *     description: No-op silencioso (200 sem alteracao) se o item ja estiver no topo.
 *     tags: [Playlist]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: playlistMediaId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Reordenado
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/Sucesso' } }
 *       400:
 *         description: Item nao encontrado
 *         content:
 *           application/json: { schema: { type: object, properties: { success: { type: boolean, example: false }, error: { type: string } } } }
 */
router.post(
    "/playlist/move-up/:playlistMediaId",
    authenticate,
    requireSetorAssociado,
    playlistController.moveUp
);

/**
 * @swagger
 * /api/playlist/move-down/{playlistMediaId}:
 *   post:
 *     summary: Move um item da playlist uma posicao pra baixo
 *     description: No-op silencioso (200 sem alteracao) se o item ja estiver no final.
 *     tags: [Playlist]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: playlistMediaId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Reordenado
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/Sucesso' } }
 *       400:
 *         description: Item nao encontrado
 *         content:
 *           application/json: { schema: { type: object, properties: { success: { type: boolean, example: false }, error: { type: string } } } }
 */
router.post(
    "/playlist/move-down/:playlistMediaId",
    authenticate,
    requireSetorAssociado,
    playlistController.moveDown
);

/**
 * @swagger
 * /api/playlist/reorder:
 *   post:
 *     summary: Reordena varios itens da playlist de uma vez
 *     tags: [Playlist]
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderedIds]
 *             properties:
 *               orderedIds:
 *                 type: array
 *                 items: { type: integer }
 *                 description: ids de PlaylistMedia na nova ordem desejada
 *     responses:
 *       200:
 *         description: Reordenado
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/Sucesso' } }
 *       500:
 *         description: Erro ao reordenar
 *         content:
 *           application/json: { schema: { type: object, properties: { success: { type: boolean, example: false }, error: { type: string } } } }
 */
router.post(
    "/playlist/reorder",
    authenticate,
    requireSetorAssociado,
    playlistController.reorder
);

/**
 * @swagger
 * /api/media/file/{setor}/{filename}:
 *   get:
 *     summary: Preview autenticado de um arquivo de midia (sessao humana)
 *     description: Distinto de /videos (que exige accessToken de TV fisica). filename nao pode conter "..", "/" ou "\\".
 *     tags: [Midia]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: setor
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: filename
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conteudo binario do arquivo (video ou imagem)
 *         content:
 *           application/octet-stream: { schema: { type: string, format: binary } }
 *       400:
 *         description: nome_invalido
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 *       404:
 *         description: arquivo_nao_encontrado
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
router.get(
    "/media/file/:setor/:filename",
    authenticate,
    requireSetorAssociado,
    checkPermission(req => req.params.setor),
    mediaController.serveFile
);

/**
 * @swagger
 * /api/media/upload/{setor}:
 *   post:
 *     summary: Upload de um ou mais arquivos de midia (video ou imagem) para um setor
 *     description: "Video: so aceita mimetype video/mp4 (rejeitado pelo multer com outros formatos de video). Imagem: sem restricao de mimetype no fileFilter."
 *     tags: [Midia]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: setor
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Midias cadastradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 medias:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Media' }
 *       400:
 *         description: "arquivo_obrigatorio | tipo_invalido"
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 *       404:
 *         description: setor_nao_encontrado
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
router.post(
    "/media/upload/:setor",
    authenticate,
    requireSetorAssociado,
    checkPermission(req => req.params.setor),
    upload.array("media"),
    mediaController.upload
);

/**
 * @swagger
 * /api/media/{id}/duration:
 *   put:
 *     summary: Atualiza a duracao de exibicao de uma midia (segundos)
 *     description: So relevante pra midias do tipo IMAGEM (video usa a propria duracao do arquivo).
 *     tags: [Midia]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [duracao]
 *             properties:
 *               duracao: { type: integer }
 *     responses:
 *       200:
 *         description: Atualizado
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/Sucesso' } }
 *       400:
 *         description: Erro ao atualizar
 *         content:
 *           application/json: { schema: { type: object, properties: { success: { type: boolean, example: false }, message: { type: string } } } }
 */
router.put(
    "/media/:id/duration",
    authenticate,
    requireSetorAssociado,
    mediaController.updateDuration
);

/**
 * @swagger
 * /api/media/bulk:
 *   delete:
 *     summary: Remove varias midias de uma vez
 *     tags: [Midia]
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: integer }
 *     responses:
 *       200:
 *         description: Removidas
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/Sucesso' } }
 *       500:
 *         description: Erro ao remover
 *         content:
 *           application/json: { schema: { type: object, properties: { success: { type: boolean, example: false }, message: { type: string } } } }
 */
router.delete(
    "/media/bulk",
    authenticate,
    requireSetorAssociado,
    mediaController.removeMany
);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     summary: Remove uma midia
 *     tags: [Midia]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Removida
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/Sucesso' } }
 *       500:
 *         description: Erro ao remover
 *         content:
 *           application/json: { schema: { type: object, properties: { success: { type: boolean, example: false }, message: { type: string } } } }
 */
router.delete(
    "/media/:id",
    authenticate,
    requireSetorAssociado,
    mediaController.remove
);

// OS 12-B, secao 3.4/3.5/3.6: telas administrativas exclusivas de ti -
// criacao de setor, associacao usuario<->setor e cadastro de TVs.
/**
 * @swagger
 * /api/admin/setores:
 *   get:
 *     summary: Setores + TVs cadastradas (visao administrativa)
 *     tags: [Admin]
 *     security: [{ sessionCookie: [] }]
 *     responses:
 *       200:
 *         description: Setores e TVs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 setores:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Setor' }
 *                 tvs:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/TV'
 *                       - type: object
 *                         properties:
 *                           setor: { $ref: '#/components/schemas/Setor' }
 *       403:
 *         description: acesso_negado - papel diferente de ti
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 *   post:
 *     summary: Cria um setor
 *     tags: [Admin]
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *     responses:
 *       201:
 *         description: Setor criado
 *         content:
 *           application/json: { schema: { type: object, properties: { setor: { $ref: '#/components/schemas/Setor' } } } }
 *       400:
 *         description: nome_invalido
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 *       403:
 *         description: acesso_negado - papel diferente de ti
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
router.get("/admin/setores", authenticate, requireRole("ti"), adminController.setoresOverview);
router.post("/admin/setores", authenticate, requireRole("ti"), setorController.create);

/**
 * @swagger
 * /api/admin/usuarios:
 *   get:
 *     summary: Usuarios ja vinculados ao IdP e seus setores
 *     tags: [Admin]
 *     security: [{ sessionCookie: [] }]
 *     responses:
 *       200:
 *         description: Usuarios e setores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       username: { type: string }
 *                       email: { type: string, nullable: true }
 *                       setorId: { type: integer, nullable: true }
 *                       setor: { $ref: '#/components/schemas/Setor' }
 *                 setores:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Setor' }
 *       403:
 *         description: acesso_negado - papel diferente de ti
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
router.get("/admin/usuarios", authenticate, requireRole("ti"), adminController.usuariosOverview);

/**
 * @swagger
 * /api/admin/usuarios/{id}/setor:
 *   post:
 *     summary: Associa um usuario a um setor
 *     tags: [Admin]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: id do User local
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [setorId]
 *             properties:
 *               setorId: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario associado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     username: { type: string }
 *                     setorId: { type: integer, nullable: true }
 *                     setor: { $ref: '#/components/schemas/Setor' }
 *       400:
 *         description: erro_ao_associar
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 *       403:
 *         description: acesso_negado - papel diferente de ti
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
router.post("/admin/usuarios/:id/setor", authenticate, requireRole("ti"), adminController.assignSetor);

/**
 * @swagger
 * /api/admin/tvs:
 *   post:
 *     summary: Cadastra uma TV fisica
 *     description: Gera um accessToken aleatorio, exigido depois pelas rotas /tv/:identificador, /videos e /uploads.
 *     tags: [Admin]
 *     security: [{ sessionCookie: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, identificador, setorId]
 *             properties:
 *               nome: { type: string }
 *               identificador: { type: string, description: "unico - usado na URL /tv/:identificador" }
 *               setorId: { type: integer }
 *     responses:
 *       201:
 *         description: TV criada
 *         content:
 *           application/json: { schema: { type: object, properties: { tv: { $ref: '#/components/schemas/TV' } } } }
 *       400:
 *         description: identificador_duplicado
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 *       403:
 *         description: acesso_negado - papel diferente de ti
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
router.post("/admin/tvs", authenticate, requireRole("ti"), tvController.create);

/**
 * @swagger
 * /api/admin/tvs/{id}/token:
 *   get:
 *     summary: Recupera o accessToken de uma TV ja cadastrada
 *     description: Diferente do client_secret do IdP, o accessToken fica em texto puro no banco (precisa ser reusado a cada carga de pagina do dispositivo) - por isso pode ser reconsultado.
 *     tags: [Admin]
 *     security: [{ sessionCookie: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: TV com token
 *         content:
 *           application/json: { schema: { type: object, properties: { tv: { $ref: '#/components/schemas/TV' } } } }
 *       403:
 *         description: acesso_negado - papel diferente de ti
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 *       404:
 *         description: tv_nao_encontrada
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/ErroPadrao' } }
 */
router.get("/admin/tvs/:id/token", authenticate, requireRole("ti"), tvController.getToken);

module.exports = router;
