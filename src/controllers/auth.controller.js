const authService = require("../services/auth.service");

async function login(req, res) {
    try {
        const token = await authService.login(req.body);

        res.cookie("token", token, {
            httpOnly: true
        });

        res.redirect("/dashboard");
    } catch (err) {
        res.send(err.message);
    }
}

function loginPage(req, res) {
    res.render("login");
}

function logout(req, res) {
    res.clearCookie("token");
    res.redirect("/login");
}

module.exports = {
    login,
    loginPage,
    logout
};