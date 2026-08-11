const path = require("path");
const mediaService = require("../services/media.service");

// GET /api/media/file/:setor/:filename (OS 12-C) - preview autenticado por
// sessao humana pra tela de Gestao de Midia, distinto de /videos (que exige
// accessToken de TV fisica e continua intocado - OS 12-C, secao 3.1/6).
function serveFile(req, res) {
    const { setor, filename } = req.params;

    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "nome_invalido", message: "Nome de arquivo inválido." });
    }

    const filePath = path.join(__dirname, "..", "..", "videos", setor, filename);
    res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) {
            res.status(404).json({ error: "arquivo_nao_encontrado", message: "Arquivo não encontrado." });
        }
    });
}

// POST /api/media/upload/:setor (OS 12-C) - multipart/form-data (FormData
// no front, mesmo middleware multer de sempre).
async function upload(req, res) {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "arquivo_obrigatorio", message: "Nenhum arquivo enviado." });
        }

        const medias = await mediaService.upload(req);
        res.status(201).json({ medias });

    } catch (err) {
        if (err.message === "FILE_REQUIRED") {
            return res.status(400).json({ error: "arquivo_obrigatorio", message: "Nenhum arquivo enviado." });
        }

        if (err.message === "INVALID_FILE_TYPE") {
            return res.status(400).json({ error: "tipo_invalido", message: "Tipo de arquivo não permitido." });
        }

        if (err.message === "SETOR_NOT_FOUND") {
            return res.status(404).json({ error: "setor_nao_encontrado", message: "Setor não encontrado." });
        }

        console.error(err);
        res.status(500).json({ error: "erro_interno", message: err.message });
    }
}

async function updateDuration(req, res) {
    try {
        const { duracao } = req.body;
        const { id } = req.params;

        await mediaService.updateDuration(id, duracao);

        return res.json({
            success: true
        })
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            success: false,
            message: err.message
        })
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

async function removeMany(req, res) {
    try {
        const { ids } = req.body;
        await mediaService.removeMany(ids);
        return res.json({
            success: true,
            message: "Mídias removidas com sucesso."
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports = {
    upload,
    remove,
    removeMany,
    updateDuration,
    serveFile
}
