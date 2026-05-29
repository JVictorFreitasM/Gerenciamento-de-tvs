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
            id: Number(id)
        }
    })
}

async function updateDuration(id, duracao) {

    return prisma.media.update({
        where: {
            id: Number(id)
        },
        data: {
            duracao: Number(duracao)
        }
    });

}

async function remove(id) {
    return prisma.media.delete({
        where: {
            id: Number(id)
        }
    })
}

module.exports = {
    findLatestBySetorId,
    create,
    findById,
    remove,
    updateDuration
}
