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

// GET /api/me - so authenticate (sem requireSetorAssociado): e a propria
// fonte que o front usa pra decidir se mostra a tela "sem setor associado".
router.get("/me", authenticate, meController.getMe);

router.get("/setores", authenticate, setorController.list);

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

router.get(
    "/playlist/:setor",
    authenticate,
    requireSetorAssociado,
    checkPermission(req => req.params.setor),
    playlistController.page
);

router.post(
    "/playlist/move-up/:playlistMediaId",
    authenticate,
    requireSetorAssociado,
    playlistController.moveUp
);

router.post(
    "/playlist/move-down/:playlistMediaId",
    authenticate,
    requireSetorAssociado,
    playlistController.moveDown
);

router.post(
    "/playlist/reorder",
    authenticate,
    requireSetorAssociado,
    playlistController.reorder
);

router.get(
    "/media/file/:setor/:filename",
    authenticate,
    requireSetorAssociado,
    checkPermission(req => req.params.setor),
    mediaController.serveFile
);

router.post(
    "/media/upload/:setor",
    authenticate,
    requireSetorAssociado,
    checkPermission(req => req.params.setor),
    upload.array("media"),
    mediaController.upload
);

router.put(
    "/media/:id/duration",
    authenticate,
    requireSetorAssociado,
    mediaController.updateDuration
);

router.delete(
    "/media/bulk",
    authenticate,
    requireSetorAssociado,
    mediaController.removeMany
);

router.delete(
    "/media/:id",
    authenticate,
    requireSetorAssociado,
    mediaController.remove
);

// OS 12-B, secao 3.4/3.5/3.6: telas administrativas exclusivas de ti -
// criacao de setor, associacao usuario<->setor e cadastro de TVs.
router.get("/admin/setores", authenticate, requireRole("ti"), adminController.setoresOverview);
router.post("/admin/setores", authenticate, requireRole("ti"), setorController.create);

router.get("/admin/usuarios", authenticate, requireRole("ti"), adminController.usuariosOverview);
router.post("/admin/usuarios/:id/setor", authenticate, requireRole("ti"), adminController.assignSetor);

router.post("/admin/tvs", authenticate, requireRole("ti"), tvController.create);
router.get("/admin/tvs/:id/token", authenticate, requireRole("ti"), tvController.getToken);

module.exports = router;
