const tvService = require('../services/tv.service');

// GET /tv/:identificador?token=... - consumida pela TV fisica, autenticada
// por accessToken (nao por sessao de usuario humano). OS 12-B, secao 3.9.
async function tvPage(req, res) {
    try {
        const { identificador } = req.params;
        const token = req.query.token || req.get("x-tv-token");

        const tv = await tvService.authenticateTV(identificador, token);

        if (!tv) {
            return res.status(401).send("TV não reconhecida ou token inválido.");
        }

        const data = await tvService.getTVDataBySetor(tv.setor);

        res.render(data.view, {
            setor: data.setor,
            medias: data.medias,
            token: tv.accessToken
        });
    } catch (error) {
        if (error.message === "Nenhuma playlist encontrada para este setor") {
            return res.status(404).send(error.message);
        }
        res.status(500).send(error.message);
    }
}

// POST /api/admin/tvs - cadastro de TV, exclusivo de ti.
async function create(req, res) {
    try {
        const { nome, identificador, setorId } = req.body;

        const tv = await tvService.createTV({
            nome,
            identificador,
            setorId: Number(setorId)
        });

        res.status(201).json({ tv });
    } catch (err) {
        if (err.code === "P2002") {
            return res.status(400).json({ error: "identificador_duplicado", message: "Já existe uma TV com esse identificador." });
        }
        res.status(500).json({ error: "erro_interno", message: err.message });
    }
}

// GET /api/admin/tvs/:id/token - exclusivo de ti. Diferente do
// client_secret do IdP, o accessToken da TV fica em texto puro no banco
// (precisa ser reusado a cada carga de pagina do dispositivo), entao pode
// ser reconsultado - resolve o problema de "perdi o link/token da TV depois
// de fechar o modal de criacao".
async function getToken(req, res) {
    try {
        const tv = await tvService.getTVWithToken(Number(req.params.id));

        if (!tv) {
            return res.status(404).json({ error: "tv_nao_encontrada", message: "TV não encontrada." });
        }

        res.json({ tv });
    } catch (err) {
        res.status(500).json({ error: "erro_interno", message: err.message });
    }
}

module.exports = {
    tvPage,
    create,
    getToken
}
