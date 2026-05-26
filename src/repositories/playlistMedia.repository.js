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
module.exports = {
    create,
    findByPlayListId,
    findLastOrder 
};