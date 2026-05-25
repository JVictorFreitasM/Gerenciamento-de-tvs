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

async function create(data) {

    return prisma.setor.create({
        data
    });

}

module.exports = {
        findAll,
        findByName,
        create
    }