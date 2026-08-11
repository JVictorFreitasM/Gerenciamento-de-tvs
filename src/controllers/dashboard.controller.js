const setorService = require("../services/setor.service");
const tvService = require("../services/tv.service");

// GET /api/dashboard (OS 12-C, secao 3.4) - visao geral: setores e TVs
// online/offline. ti ve todos os setores, usuario so o proprio (ja
// garantido por requireSetorAssociado na rota - setorId sempre presente).
async function summary(req, res) {
    try {
        const usuario = req.usuario;
        const [setores, tvs] = await Promise.all([
            usuario.papel === "ti"
                ? setorService.getAllSetores()
                : Promise.resolve([{ id: usuario.setorId, nome: usuario.setorNome }]),
            tvService.listTVs()
        ]);

        const setoresComTvs = setores.map((setor) => {
            const tvsDoSetor = tvs.filter((tv) => tv.setorId === setor.id);
            return {
                id: setor.id,
                nome: setor.nome,
                tvsTotal: tvsDoSetor.length,
                tvsOnline: tvsDoSetor.filter((tv) => tv.online).length,
                // accessToken incluido aqui e seguro: setores ja vem
                // filtrado pro proprio usuario acima (usuario nunca ve TV de
                // outro setor) - e o mesmo dado que ele ja pode alcancar via
                // gestao de midia do proprio setor, so que embutido na URL
                // de assistir (botao "Assistir" no Dashboard).
                tvs: tvsDoSetor.map((tv) => ({
                    id: tv.id,
                    nome: tv.nome,
                    identificador: tv.identificador,
                    online: tv.online,
                    lastSeenAt: tv.lastSeenAt,
                    accessToken: tv.accessToken
                }))
            };
        });

        res.json({ setores: setoresComTvs, papel: usuario.papel });
    } catch (err) {
        res.status(500).json({ error: "erro_interno", message: err.message });
    }
}

module.exports = { summary };
