const setorRepository = require("../repositories/setor.repository");
const mediaRepository = require("../repositories/media.repository");

async function getTVData(setorNome) {
    const setor = await setorRepository.findByName(setorNome);

    if (!setor) {
        throw new Error("Setor não encontrado");
    }

    const media = await mediaRepository.findLatestBySetorId(setor.id);

    if (!media) {
        throw new Error("Nenhuma mídia cadastrada para este setor");
    }

    const view = setor.nome === "diretoria" ? "player-diretoria" : "player";

    return {
        view,
        media,
        setor
    }; 
}

module.exports = {
    getTVData
}