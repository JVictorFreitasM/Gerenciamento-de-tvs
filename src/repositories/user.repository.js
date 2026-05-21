const prisma = require("../prisma/client");

async function findByUsername(username) {
    return prisma.user.findUnique({
        where: {
            username
        }
    });
}

module.exports = {
    findByUsername
};
