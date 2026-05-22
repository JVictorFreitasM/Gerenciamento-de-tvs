const prisma = require("../prisma/client");


async function homePage(req, res) {

    try {

        const setores =
            await prisma.setor.findMany({

                orderBy: {
                    nome: "asc"
                }

            });

        res.render("home", {
            setores
        });

    } catch (err) {

        res.status(500).send(err.message);

    }

}

function uploadPage(req, res) {

    const setor = req.params.setor || "geral";

    res.render("upload", { setor });

}


async function tvPage(req, res) {

    const setorNome = req.params.setor || "geral";

    const setor = await prisma.setor.findFirst({
        where: {
            nome: setorNome
        }
    });

    console.log("SETOR:");
    console.log(setor);

    if (!setor) {

        return res
            .status(404)
            .send("Setor não encontrado.");

    }

    const media = await prisma.media.findFirst({

        where: {
            setorId: setor.id
        },

        orderBy: {
            createdAt: "desc"
        }

    });

    console.log("MEDIA:");
    console.log(media);

    if (!media) {

        return res
            .send("Nenhuma mídia cadastrada.");

    }

    if ( setor.nome === "diretoria" ) {
        return res.render("player-diretoria", {
            media, 
            setor
        });
    }
    
    res.render("player", {
        media,
        setor
    });

}

async function upload(req, res) {

    try {

        const setorNome =
            req.params.setor;

        console.log("SETOR URL:");
        console.log(setorNome);

        if (!req.file) {

            return res
                .status(400)
                .send("Nenhum arquivo enviado.");

        }

        const file = req.file;

        const permitido =

            file.mimetype.startsWith("video") ||

            file.mimetype.startsWith("image");

        if (!permitido) {

            return res
                .status(400)
                .send("Tipo de arquivo não permitido.");

        }

        const tipo =
            file.mimetype.startsWith("video")
                ? "VIDEO"
                : "IMAGEM";

        const setor =
            await prisma.setor.findFirst({

                where: {
                    nome: setorNome
                }

            });

        console.log("SETOR ENCONTRADO:");
        console.log(setor);

        if (!setor) {

            return res
                .status(404)
                .send("Setor não encontrado.");

        }
        
        function bytesToMB(bytes) {
            return parseFloat(bytes / (1024 * 1024).toFixed(2));
            
        }

        await prisma.media.create({

            data: {

                nome: file.originalname,

                filename: file.filename,

                tipo,

                tamanho: bytesToMB(file.size), 

                setorId: setor.id,

                uploadedById:
                    req.user.id

            }

        });

        res.redirect("/");

    } catch (err) {

        console.error(err);

        res.status(500).send(err.message);

    }

}

async function dashboardPage(req, res) {

    const setores = await prisma.setor.findMany();
    return res.render("dashboard", {
        setores
    })
}

module.exports = {
    uploadPage,
    upload,
    tvPage,
    dashboardPage,
    homePage
};
