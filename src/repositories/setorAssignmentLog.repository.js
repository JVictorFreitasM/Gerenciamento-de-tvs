const prisma = require("../prisma/client");

async function create({ userId, setorId, assignedById }) {
    return prisma.setorAssignmentLog.create({
        data: { userId, setorId, assignedById }
    });
}

module.exports = { create };
