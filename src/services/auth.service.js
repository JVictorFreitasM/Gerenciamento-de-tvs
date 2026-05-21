const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRepository = require("../repositories/user.repository");

async function login({ username, password }) {
    const user = await userRepository.findByUsername(username);

    if (!user) {
        throw new Error("Usuário inválido");
    }

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!validPassword) {
        throw new Error("Senha inválida");
    }

    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            setorId: user.setorId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

module.exports = {
    login
};