const router = require("express").Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const mediaController = require("../controllers/media.controller");
const dashboardController = require("../controllers/dashboard.controller");
const homeController = require("../controllers/home.controller");
const tvController = require("../controllers/tv.controller");

const checkPermission = (getSetorFn) => (req, res, next) => {
    const setor = getSetorFn(req);
    if (req.user && req.user.role !== 'ti' && req.user.role !== setor) {
        return res.status(403).send("Acesso negado. Você só pode acessar o seu próprio setor.");
    }
    next();
};

router.get(
    "/",
    homeController.homePage
)

router.get(
    "/upload/:setor",
    auth,
    checkPermission(req => req.params.setor),
    mediaController.uploadPage
);

router.post(
    "/upload/:setor",
    auth,
    upload.array("media"),
    mediaController.upload
);

router.get(
    "/tv/:setor",
    tvController.tvPage
);

router.get(
    "/dashboard",
    auth,
    dashboardController.dashboardPage
);

router.get(
    "playlist/:playlistId",
    auth,
    mediaController.listByPlaylist
);

router.delete(
    "/media/bulk",
    mediaController.removeMany
);

router.delete(
    "/media/:id",
    auth,
    mediaController.remove
);


module.exports = router;