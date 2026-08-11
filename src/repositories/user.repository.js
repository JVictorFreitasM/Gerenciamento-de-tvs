const prisma = require("../prisma/client");

async function findByUsername(username) {
    return prisma.user.findUnique({
        where: {
            username
        }
    });
}

async function findById(id) {
    return prisma.user.findUnique({
        where: { id },
        include: { setor: true }
    });
}

// OS 12-B, secao 3.6: usuarios ja vinculados ao IdP (logaram ao menos uma
// vez e foram auto-vinculados por e-mail), candidatos a receber um setor.
async function findLinked() {
    return prisma.user.findMany({
        where: { idpUserId: { not: null } },
        include: { setor: true },
        orderBy: { username: "asc" }
    });
}

async function updateSetor(id, setorId) {
    return prisma.user.update({
        where: { id },
        data: { setorId },
        include: { setor: true }
    });
}

module.exports = {
    findByUsername,
    findById,
    findLinked,
    updateSetor
};
