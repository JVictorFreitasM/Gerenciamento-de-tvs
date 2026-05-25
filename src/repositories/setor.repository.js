const prisma = require("../prisma/client");

async function findAll() {
    
    return prisma.setor.findMany({
        orderBy: {
            nome: "asc"
        }
    });
    
}

async function findByName (nome) {
    return prisma.setor.findFirst({
        where: {
            nome
        }
    });
}

module.exports = {
        findAll,
        findByName
    }