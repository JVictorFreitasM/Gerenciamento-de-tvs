// GET /api/me (OS 12-C) - unica fonte de verdade pro front sobre quem esta
// logado. NAO aplica requireSetorAssociado (so authenticate) - o front
// decide se mostra a tela "sem setor associado" a partir do payload aqui,
// nao de um 403 (OS 12-C, secao 3.4).
function getMe(req, res) {
    res.json({
        user: {
            name: req.usuario.username,
            email: req.usuario.email,
            role: req.usuario.papel,
            setor: req.usuario.setorNome,
            setorId: req.usuario.setorId
        }
    });
}

module.exports = { getMe };
