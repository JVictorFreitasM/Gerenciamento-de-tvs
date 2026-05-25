const prisma = require("../prisma/client");

async function create(data) {

    return prisma.playlistMedia.create({
        data
    });

}

module.exports = {
    create
};