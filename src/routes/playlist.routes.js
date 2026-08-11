const router =
    require("express").Router();

const auth =
    require("../middleware/auth");

const playlistController =
    require("../controllers/playlist.controller");

router.get(

    "/:setor",

    auth,

    playlistController.page
);

router.post(

    "/move-up/:playlistMediaId",

    auth,

    playlistController.moveUp
);

router.post(

    "/move-down/:playlistMediaId",

    auth,

    playlistController.moveDown
);

router.post(
    "/reorder",
    auth,
    playlistController.reorder
);

module.exports = router;