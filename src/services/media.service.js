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
        
        nome: file.filename,
        
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

    const lastItem =
    await playlistMediaRepository.findLastOrder(
        playlist.id
    );

    const nextOrder =
        lastItem ? lastItem.ordem + 1 : 1;

    await playlistMediaRepository.create({

        playlistId: playlist.id,

        mediaId: media.id,

        ordem: nextOrder

    });

    return media;

}

async function remove(id) {
    const media = await mediaRepository.findById(id);

    if (!media) {
        throw new Error("Midia nao encontrada.");
    }

    await playlistMediaRepository.deleteMediaById(id);

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

module.exports = {
    upload,
    remove
};