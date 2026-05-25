const mediaRepository = require("../repositories/media.repository");
const setorRepository = require("../repositories/setor.repository");

const { validateMedia } = require("../validators/media.validator");
const { bytesToMB } = require("../utils/file.utils");

async function upload(req) {
    const setorNome = req.params.setor 
    validateMedia(req.file);
    const file = req.file;

    const tipo = file.mimetype.startsWith("video") ? "VIDEO" : "IMAGEM";

    const setor = await setorRepository.findByName(setorNome);

    if (!setor) {
        throw new Error("Setor não encontrado");
    }

    return mediaRepository.create({
        nome: file.originalname,
        filename: file.filename, 
        tipo,
        tamanho: bytesToMB(file.size),
        setorId: setor.id,
        uploadedById: req.user.id
    });
}

module.exports = {
    upload
}
