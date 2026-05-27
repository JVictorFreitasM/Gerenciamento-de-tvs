const playlistService =
    require("../services/playlist.service");

async function page(req, res) {

    try {

        const setorNome =
            req.params.setor;

        const data =
            await playlistService.getPlaylistPage(
                setorNome
            );

        res.render(
            "playlist",
            data
        );

    } catch (error) {

        res.status(500).send(
            error.message
        );

    }
}
// Responsável por mover um item da playlist para cima
async function moveUp(req, res) {

    try {

        const playlistMediaId =
            Number(
                req.params.playlistMediaId
            );

        await playlistService.moveUp(
            playlistMediaId
        );

        const referer =
            req.get("Referer");

        res.redirect(
            referer || "/"
        );

    } catch (error) {

        res.status(500).send(
            error.message
        );

    }
}

async function moveDown(req, res) {

    try {

        const playlistMediaId =
            Number(
                req.params.playlistMediaId
            );

        await playlistService.moveDown(
            playlistMediaId
        );

        const referer =
            req.get("Referer");

        res.redirect(
            referer || "/"
        );

    } catch (error) {

        res.status(500).send(
            error.message
        );

    }
}

async function reorder(req, res) {

    try {

        await playlistService.reorder(
            req.body.orderedIds
        );

        res.json({
            success: true
        });

    } catch (error) {

        res.status(500).json({

            success: false,

            error: error.message
        });

    }

}

module.exports = {
    page,
    moveUp,
    moveDown,
    reorder
};
