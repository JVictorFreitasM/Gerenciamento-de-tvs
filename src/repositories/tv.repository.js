const prisma = require("../prisma/client");

async function findAll() {
    return prisma.tV.findMany({
        include: { setor: true },
        orderBy: { nome: "asc" }
    });
}

async function findByIdentificador(identificador) {
    return prisma.tV.findUnique({
        where: { identificador },
        include: { setor: true }
    });
}

async function findByAccessToken(accessToken) {
    return prisma.tV.findUnique({
        where: { accessToken },
        include: { setor: true }
    });
}

async function findById(id) {
    return prisma.tV.findUnique({
        where: { id },
        include: { setor: true }
    });
}

async function create(data) {
    return prisma.tV.create({ data });
}

async function markSeen(id) {
    return prisma.tV.update({
        where: { id },
        data: { online: true, lastSeenAt: new Date() }
    });
}

module.exports = {
    findAll,
    findByIdentificador,
    findByAccessToken,
    findById,
    create,
    markSeen
};
