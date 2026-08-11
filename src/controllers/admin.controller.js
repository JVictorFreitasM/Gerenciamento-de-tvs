const setorService = require("../services/setor.service");
const usuarioService = require("../services/usuario.service");
const tvService = require("../services/tv.service");

// GET /api/admin/setores - ti-only: setores + TVs cadastradas (OS 12-B,
// secao 3.5 e 3.9 / OS 12-C).
async function setoresOverview(req, res) {
    try {
        const [setores, tvs] = await Promise.all([
            setorService.getAllSetores(),
            tvService.listTVs()
        ]);

        res.json({
            setores,
            tvs: tvs.map((tv) => ({
                id: tv.id,
                nome: tv.nome,
                identificador: tv.identificador,
                online: tv.online,
                setor: { id: tv.setor.id, nome: tv.setor.nome }
            }))
        });
    } catch (err) {
        res.status(500).json({ error: "erro_interno", message: err.message });
    }
}

// GET /api/admin/usuarios - ti-only: usuarios ja vinculados ao IdP (OS
// 12-B, secao 3.6).
async function usuariosOverview(req, res) {
    try {
        const [usuarios, setores] = await Promise.all([
            usuarioService.listLinkedUsers(),
            setorService.getAllSetores()
        ]);

        res.json({
            usuarios: usuarios.map((u) => ({
                id: u.id,
                username: u.username,
                email: u.email,
                setorId: u.setorId,
                setor: u.setor ? { id: u.setor.id, nome: u.setor.nome } : null
            })),
            setores
        });
    } catch (err) {
        res.status(500).json({ error: "erro_interno", message: err.message });
    }
}

async function assignSetor(req, res) {
    try {
        const userId = Number(req.params.id);
        const setorId = Number(req.body.setorId);

        const usuario = await usuarioService.assignSetor({
            userId,
            setorId,
            assignedById: req.usuario.id
        });

        res.json({
            usuario: {
                id: usuario.id,
                username: usuario.username,
                setorId: usuario.setorId,
                setor: usuario.setor ? { id: usuario.setor.id, nome: usuario.setor.nome } : null
            }
        });
    } catch (err) {
        res.status(400).json({ error: "erro_ao_associar", message: err.message });
    }
}

module.exports = {
    setoresOverview,
    usuariosOverview,
    assignSetor
};
