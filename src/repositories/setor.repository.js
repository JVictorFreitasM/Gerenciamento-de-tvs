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

async function findById(id) {

    return prisma.setor.findUnique({
        where: {
            id
        }
    })
}

module.exports = {
        findAll,
        findByName,
        create,
        findById
    }
    