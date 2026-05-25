const prisma = require("../prisma/client");

async function findLatestBySetorId(setorId) {

    return prisma.media.findFirst({
        where: {
            setorId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

}

async function create(data) {
    return prisma.media.create({
        data
    });
}

module.exports = {
    findLatestBySetorId,
    create
}
