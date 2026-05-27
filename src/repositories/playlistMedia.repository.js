const prisma = require("../prisma/client");

async function create(data) {

    return prisma.playlistMedia.create({
        data
    });

}


async function findLastOrder(playlistId) {

    return prisma.playlistMedia.findFirst({
        where: {
            playlistId
        },
        orderBy: {
            ordem: "desc"
        }
    });

}

async function findByPlayListId(playlistId) {

    return prisma.playlistMedia.findMany({
        where: {
            playlistId
        },
        include: {
            media: true
        },
        orderBy: {
            ordem: "asc"
        }
    });
}

async function findById(id) {

    return prisma.playlistMedia.findUnique({

        where: {
            id
        }

    });
}

async function findByPlaylistIdAndOrdem(
    playlistId,
    ordem
) {

    return prisma.playlistMedia.findFirst({

        where: {

            playlistId,

            ordem

        }

    });
}

async function updateOrdem(
    id,
    ordem
) {

    return prisma.playlistMedia.update({

        where: {
            id
        },

        data: {
            ordem
        }

    });
}

async function deleteMediaById(
    mediaId
) {

    return prisma.playlistMedia.deleteMany({
        where: {
            mediaId
        }
    });
}

module.exports = {
    create,
    findByPlayListId,
    findLastOrder,
    findById,
    findByPlaylistIdAndOrdem,
    updateOrdem,
    deleteMediaById
};