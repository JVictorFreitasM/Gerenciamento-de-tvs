const setorRepository = require("../repositories/setor.repository");
const playlistRepository = require("../repositories/playlist.repository");
const playlistMediaRepository = require("../repositories/playlistMedia.repository");

async function getPlaylistPage(setorNome) {
    const setor = await setorRepository.findByName(setorNome);

    if (!setor) {
        throw new Error("Setor não encontrado.");
    }

    const playlist = await playlistRepository.findBySetorId(setor.id);

    if (!playlist) {
        throw new Error("Playlist não encontrada para este setor.");
    }

    const medias = await playlistMediaRepository.findByPlayListId(playlist.id);

    return {
        setor,
        playlist,
        medias
    };
}

async function moveUp(
    playlistMediaId
) {

    // =========================
    // ITEM ATUAL
    // =========================

    const currentItem =
        await playlistMediaRepository
            .findById(
                playlistMediaId
            );

    if (!currentItem) {

        throw new Error(
            "Item não encontrado"
        );

    }

    // =========================
    // SE JA ESTA NO TOPO
    // =========================

    if (currentItem.ordem === 1) {

        return;
    }

    // =========================
    // ITEM ACIMA
    // =========================

    const upperItem =
        await playlistMediaRepository
            .findByPlaylistIdAndOrdem(

                currentItem.playlistId,

                currentItem.ordem - 1
            );

    if (!upperItem) {

        return;
    }

    // =========================
    // TROCA ORDENS
    // =========================

    const tempOrder =
        999999;

    // =========================
    // ITEM ATUAL -> TEMP
    // =========================

    await playlistMediaRepository
        .updateOrdem(

            currentItem.id,

            tempOrder
        );

    // =========================
    // ITEM ACIMA -> ORDEM ATUAL
    // =========================

    await playlistMediaRepository
        .updateOrdem(

            upperItem.id,

            currentItem.ordem
        );

    // =========================
    // ITEM ATUAL -> ORDEM ACIMA
    // =========================

    await playlistMediaRepository
        .updateOrdem(

            currentItem.id,

            upperItem.ordem
        );
}

async function moveDown(
    playlistMediaId
) {

    // =========================
    // ITEM ATUAL
    // =========================

    const currentItem =
        await playlistMediaRepository
            .findById(
                playlistMediaId
            );

    if (!currentItem) {

        throw new Error(
            "Item não encontrado"
        );

    }

    // =========================
    // ITEM ABAIXO
    // =========================

    const lowerItem =
        await playlistMediaRepository
            .findByPlaylistIdAndOrdem(

                currentItem.playlistId,

                currentItem.ordem + 1
            );

    // =========================
    // SE JA ESTA NO FINAL
    // =========================

    if (!lowerItem) {

        return;
    }

    // =========================
    // TROCA COM TEMP
    // =========================

    const tempOrder =
        999999;

    // atual -> temp
    await playlistMediaRepository
        .updateOrdem(

            currentItem.id,

            tempOrder
        );

    // abaixo -> ordem atual
    await playlistMediaRepository
        .updateOrdem(

            lowerItem.id,

            currentItem.ordem
        );

    // atual -> ordem abaixo
    await playlistMediaRepository
        .updateOrdem(

            currentItem.id,

            lowerItem.ordem
        );
}

async function reorder(orderedIds) {

    // =========================
    // ORDENS TEMPORÁRIAS
    // =========================

    for (let i = 0; i < orderedIds.length; i++) {

        await playlistMediaRepository
            .updateOrdem(

                Number(orderedIds[i]),

                1000 + i
            );

    }

    // =========================
    // ORDENS FINAIS
    // =========================

    for (let i = 0; i < orderedIds.length; i++) {

        await playlistMediaRepository
            .updateOrdem(

                Number(orderedIds[i]),

                i + 1
            );

    }

}

module.exports = {
    getPlaylistPage,
    moveUp,
    moveDown,
    reorder
}
