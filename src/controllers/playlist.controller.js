const playlistService =
    require("../services/playlist.service");

// GET /api/playlist/:setor (OS 12-C) - dados da tela de gestao de
// midia/playlist: setor, playlist e itens ja ordenados.
async function page(req, res) {

    try {

        const setorNome =
            req.params.setor;

        const data =
            await playlistService.getPlaylistPage(
                setorNome
            );

        res.json(data);

    } catch (error) {

        res.status(404).json({
            error: "playlist_nao_encontrada",
            message: error.message
        });

    }
}

async function moveUp(req, res) {

    try {

        const playlistMediaId =
            Number(
                req.params.playlistMediaId
            );

        await playlistService.moveUp(
            playlistMediaId
        );

        res.json({ success: true });

    } catch (error) {

        res.status(400).json({
            success: false,
            error: error.message
        });

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

        res.json({ success: true });

    } catch (error) {

        res.status(400).json({
            success: false,
            error: error.message
        });

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
