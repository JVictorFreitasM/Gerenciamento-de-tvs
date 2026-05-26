const setorRepository = require("../repositories/setor.repository");
const mediaRepository = require("../repositories/media.repository");
const playlistRepository = require("../repositories/playlist.repository");
const playlistMediaRepository = require("../repositories/playlistMedia.repository");
async function getTVData(setorNome) {
    const setor = await setorRepository.findByName(setorNome);

    if (!setor) {
        throw new Error("Setor não encontrado");
    }

    //const media = await mediaRepository.findLatestBySetorId(setor.id);
    const playlist = await playlistRepository.findBySetorId(setor.id);

    if (!playlist) {
        throw new Error("Nenhuma playlist encontrada para este setor");
    }
    
    const playlistMedias = await playlistMediaRepository.findByPlayListId(playlist.id);

    const medias =playlistMedias.map(item => item.media);

    const view = setor.nome === "diretoria" ? "player-diretoria" : "player";

    return {
        view,
        medias,
        setor
    }; 
}

module.exports = {
    getTVData
}