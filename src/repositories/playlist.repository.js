const prisma = require("../prisma/client");

async function findBySetorId(setorId) {

    return prisma.playlist.findFirst({
        where: {
            setorId
        }
    });

}

async function create(data) {

    return prisma.playlist.create({
        data
    });

}

module.exports = {
    findBySetorId,
    create
};
