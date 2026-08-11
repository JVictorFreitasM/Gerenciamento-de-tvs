const setorRepository = require("../repositories/setor.repository");
const playlistRepository = require("../repositories/playlist.repository");

async function getAllSetores() {
    return await setorRepository.findAll();
}

async function getSetorByName(nome) {
    return await setorRepository.findByName(nome);
}

// OS 12-B, secao 3.5: valida nome duplicado ANTES de bater na constraint
// @unique do banco - mensagem amigavel em vez do erro cru do Postgres.
async function createSetor(nome) {
    const existente = await setorRepository.findByName(nome);

    if (existente) {
        throw new Error(`Já existe um setor chamado "${existente.nome}".`);
    }

    const setor = await setorRepository.create({ nome });

    await playlistRepository.create({
        nome: `${setor.nome} - Playlist`,
        setorId: setor.id
    });
    return setor;
}

module.exports = {
    getAllSetores,
    getSetorByName,
    createSetor
}

