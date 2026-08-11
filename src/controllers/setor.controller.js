const setorService = require("../services/setor.service");

// GET /api/setores (OS 12-C) - ti enxerga todos, usuario so o proprio (ou
// lista vazia se ainda sem setor associado).
async function list(req, res) {
    try {
        const setores = req.usuario.papel === "ti"
            ? await setorService.getAllSetores()
            : (req.usuario.setorNome
                ? [{ id: req.usuario.setorId, nome: req.usuario.setorNome }]
                : []);

        res.json({ setores });
    } catch (err) {
        res.status(500).json({ error: "erro_interno", message: err.message });
    }
}

// POST /api/admin/setores - exclusivo de ti (requireRole na rota).
async function create(req, res) {
    try {
        const setor = await setorService.createSetor(req.body.nome);
        res.status(201).json({ setor });
    } catch (err) {
        res.status(400).json({ error: "nome_invalido", message: err.message });
    }
}

module.exports = {
    list,
    create
};
