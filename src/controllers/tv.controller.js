const tvService = require('../services/tv.service');

async function tvPage(req, res) {
    try {
        const setorNome = req.params.setor || "geral";

        const data = await tvService.getTVData(setorNome);

        res.render(data.view, {
            setor: data.setor,
            media: data.media
        });
    } catch (error) {
        if (error.message === "Setor não encontrado.") {
            return res.status(404).send(error.message);
        }
        if (error.message === "Nenhuma mídia cadastrada para este setor") {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
}

module.exports = {
    tvPage
}