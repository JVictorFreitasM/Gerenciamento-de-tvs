const setorRepository = require("../repositories/setor.repository");

async function getAllSetores() {
    return await setorRepository.findAll();
}

async function getSetorByName(nome) {
    return await setorRepository.findByName(nome);
}







module.exports = {
    getAllSetores,
    getSetorByName
}

