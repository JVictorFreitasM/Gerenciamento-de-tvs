function validateMedia(files) {

    if (!files || files.length === 0) {

        throw new Error(
            "Nenhum arquivo enviado."
        );

    }

    for (const file of files) {

        const permitido =

            file.mimetype.startsWith("video") ||

            file.mimetype.startsWith("image");

        if (!permitido) {

            throw new Error(
                "Arquivo não permitido. Envie um vídeo ou imagem."
            );

        }

    }

}

module.exports = {
    validateMedia
};