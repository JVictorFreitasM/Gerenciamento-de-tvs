const userRepository = require("../repositories/user.repository");
const setorRepository = require("../repositories/setor.repository");
const setorAssignmentLogRepository = require("../repositories/setorAssignmentLog.repository");

async function listLinkedUsers() {
    return userRepository.findLinked();
}

// OS 12-B, secao 3.6: associa/troca o setor de um usuario ja vinculado ao
// IdP, exclusivo de ti - grava um log simples de auditoria local (quem,
// quando, qual setor).
async function assignSetor({ userId, setorId, assignedById }) {
    const setor = await setorRepository.findById(setorId);

    if (!setor) {
        throw new Error("Setor não encontrado");
    }

    const usuario = await userRepository.updateSetor(userId, setorId);

    await setorAssignmentLogRepository.create({
        userId,
        setorId,
        assignedById
    });

    return usuario;
}

module.exports = {
    listLinkedUsers,
    assignSetor
};
