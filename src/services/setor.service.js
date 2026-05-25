const setorRepository = require("../repositories/setor.repository");
const playlistRepository = require("../repositories/playlist.repository");

async function getAllSetores() {
    return await setorRepository.findAll();
}

async function getSetorByName(nome) {
    return await setorRepository.findByName(nome);
}

async function createSetor(nome) {
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

