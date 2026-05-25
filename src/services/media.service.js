const mediaRepository =
    require("../repositories/media.repository");

const setorRepository =
    require("../repositories/setor.repository");

const playlistRepository =
    require("../repositories/playlist.repository");

const playlistMediaRepository =
    require("../repositories/playlistMedia.repository");

const {
    validateMedia
} = require("../validators/media.validator");

const {
    bytesToMB
} = require("../utils/file.utils");

async function upload(req) {

    const setorNome =
        req.params.setor;

    validateMedia(req.file);

    const file = req.file;

    const tipo =
        file.mimetype.startsWith("video")
            ? "VIDEO"
            : "IMAGEM";

    const setor =
        await setorRepository.findByName(setorNome);

    if (!setor) {

        throw new Error(
            "Setor não encontrado"
        );

    }

    const media =
        await mediaRepository.create({

            nome: file.originalname,

            filename: file.filename,

            tipo,

            tamanho: bytesToMB(file.size),

            setorId: setor.id,

            uploadedById: req.user.id

        });

    const playlist =
        await playlistRepository
            .findBySetorId(setor.id);

    if (!playlist) {

        throw new Error(
            "Playlist não encontrada"
        );

    }

    await playlistMediaRepository.create({

        playlistId: playlist.id,

        mediaId: media.id,

        ordem: 1

    });

    return media;

}

module.exports = {
    upload
};