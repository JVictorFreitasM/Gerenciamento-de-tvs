const crypto = require("crypto");

const setorRepository = require("../repositories/setor.repository");
const tvRepository = require("../repositories/tv.repository");
const mediaRepository = require("../repositories/media.repository");
const playlistRepository = require("../repositories/playlist.repository");
const playlistMediaRepository = require("../repositories/playlistMedia.repository");

async function getTVDataBySetor(setor) {
    //const media = await mediaRepository.findLatestBySetorId(setor.id);
    const playlist = await playlistRepository.findBySetorId(setor.id);

    if (!playlist) {
        throw new Error("Nenhuma playlist encontrada para este setor");
    }

    const playlistMedias = await playlistMediaRepository.findByPlayListId(playlist.id);

    const medias = playlistMedias.map(item => item.media);

    const view = setor.nome.toLowerCase() === "diretoria"
        ? "player-diretoria"
        : "player";

    return {
        view,
        medias,
        setor
    };
}

async function getTVData(setorNome) {
    const setor = await setorRepository.findByName(setorNome);

    if (!setor) {
        throw new Error("Setor não encontrado");
    }

    return getTVDataBySetor(setor);
}

// OS 12-B, secao 3.9: cada TV cadastrada recebe um accessToken unico,
// gerado aleatoriamente (nao sequencial/previsivel), exigido por
// /tv/:identificador, /videos e /uploads.
async function createTV({ nome, identificador, setorId }) {
    const accessToken = crypto.randomBytes(24).toString("hex");

    return tvRepository.create({
        nome,
        identificador,
        setorId,
        accessToken
    });
}

async function listTVs() {
    return tvRepository.findAll();
}

// Diferente do client_secret do IdP (que so existe hasheado), o
// accessToken da TV fica salvo em texto puro - precisa ser reconstruido a
// cada vez que a mesma TV carrega a pagina (embutido nas URLs de
// /videos). Por isso pode ser consultado de novo por um ti (ex.: link se
// perdeu, TV precisa ser reconfigurada), diferente do padrao "mostrado uma
// unica vez" usado pra secrets de verdade.
async function getTVWithToken(id) {
    return tvRepository.findById(id);
}

// Resolve a TV pelo identificador na URL e confere o accessToken (query
// string ou header) contra o valor gravado - so entao marca "vista agora"
// e libera os dados da playlist do seu setor.
async function authenticateTV(identificador, token) {
    const tv = await tvRepository.findByIdentificador(identificador);

    if (!tv || !token || tv.accessToken !== token) {
        return null;
    }

    await tvRepository.markSeen(tv.id);

    return tv;
}

module.exports = {
    getTVData,
    getTVDataBySetor,
    createTV,
    listTVs,
    getTVWithToken,
    authenticateTV
};
