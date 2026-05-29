const fs = require("fs");
const path = require("path");
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

    const setorNome = req.params.setor;

    validateMedia(req.files);

    const files = req.files;

    const setor =
        await setorRepository.findByName(setorNome);

    if (!setor) {

        throw new Error(
            "Setor não encontrado"
        );

    }

    const playlist =
        await playlistRepository
            .findBySetorId(setor.id);

    if (!playlist) {

        throw new Error(
            "Playlist não encontrada"
        );

    }

    let lastItem =
        await playlistMediaRepository.findLastOrder(
            playlist.id
        );

    let nextOrder =
        lastItem ? lastItem.ordem + 1 : 1;

    const uploadedMedias = [];

    for (const file of files) {

        const tipo =
            file.mimetype.startsWith("video")
                ? "VIDEO"
                : "IMAGEM";

        const media =
            await mediaRepository.create({

                nome: file.originalname,

                filename: file.filename,

                tipo,

                duracao: 10,

                tamanho: bytesToMB(file.size),

                setorId: setor.id,

                uploadedById: req.user.id

            });

        await playlistMediaRepository.create({

            playlistId: playlist.id,

            mediaId: media.id,

            ordem: nextOrder

        });

        uploadedMedias.push(media);

        nextOrder++;

    }

    return uploadedMedias;

}

async function updateDuration(id, duracao) {
    const media = await mediaRepository.findById(id);

    duracao = Number(duracao);

    if (isNaN(duracao) || duracao < 1) {
        throw new Error(
            "Duracao deve ser maior que 1 segundo."
        );
    }
    
    return mediaRepository.updateDuration(
        id,
        duracao
    );
}

async function remove(id) {
    const media = await mediaRepository.findById(id);

    if (!media) {
        throw new Error("Midia nao encontrada.");
    }

    //Remove vinculo midia-playlist
    await playlistMediaRepository.deleteMediaById(id);

    const references = await playlistMediaRepository.countByMediaId(id);
    //Verifica se ainda há vinculos com playlists. Se houver, não permite a exclusão.
    if (references > 0) {
        return;
    }

    const setor = await setorRepository.findById(media.setorId)

    const filePath = path.join(
        __dirname,
        "../../videos/",
        setor.nome,
        media.filename
    )
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    await mediaRepository.remove(id);
}

async function removeMany(ids) {
    try {
        for (const id of ids) {
            await remove(Number(id));
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {
    upload,
    remove,
    removeMany,
    updateDuration
};
