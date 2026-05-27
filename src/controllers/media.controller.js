const prisma = require("../prisma/client");
const { bytesToMB } = require("../utils/file.utils");
const mediaService = require("../services/media.service");
const playlistService = require("../services/playlist.service");


function uploadPage(req, res) {

    const setor = req.params.setor || "geral";

    res.render("upload", { setor });

}


async function upload(req, res) {
    try {
        await mediaService.upload(req);
        res.redirect(`/playlist/${req.params.setor}`);
    } catch (err) {
        if (err.message === "FILE_REQUIRED") {

            return res
                .status(400)
                .send("Nenhum arquivo enviado.");

        }

        if (err.message === "INVALID_FILE_TYPE") {

            return res
                .status(400)
                .send("Tipo de arquivo não permitido.");

        }

        if (err.message === "SETOR_NOT_FOUND") {

            return res
                .status(404)
                .send("Setor não encontrado.");

        }

        console.error(err);

        return res
            .status(500)
            .send(err.message);

    }

}

async function listByPlaylist(req, res) {
    try {
        const playlistId = req.params.playlistId;

        if (!playlistId) {
            return res.status(404).send("Playlist não encontrada.");
        }

        const medias = await mediaService.listByPlaylist(playlistId);

        return res.render("playlist-detalhe", {
            playlist, 
            medias,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
}

async function remove(req, res) {
    try {
        await mediaService.remove(Number
            (req.params.id));
        return res.json({
            success: true,
            message: "Mídia removida com sucesso."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports = {
    uploadPage,
    upload,
    listByPlaylist,
    remove
}

