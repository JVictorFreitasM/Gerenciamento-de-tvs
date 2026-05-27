function validateMedia(file) {
    if (!file) {
        throw new Error("Nenhum arquivo enviado.");
    }

    const permitido = file.mimetype.startsWith("video") || file.mimetype.startsWith("image");

    if (!permitido) {
        throw new Error("Arquivo não permitido. Envie um vídeo ou imagem.");
    }
}

module.exports = {
    validateMedia
};
