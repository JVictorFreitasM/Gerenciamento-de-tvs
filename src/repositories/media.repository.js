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

async function findById(id) {
    return prisma.media.findUnique({
        where: {
            id
        }
    })
}

async function remove(id) {
    return prisma.media.delete({
        where: {
            id
        }
    })
}

module.exports = {
    findLatestBySetorId,
    create,
    findById,
    remove
}
