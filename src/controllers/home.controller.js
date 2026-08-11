const setorService = require("../services/setor.service");

async function homePage(req, res) {
    try {
        const setores = await setorService.getAllSetores();

        res.render("home", {
            setores
        });
    } catch(err) {
        res.status(500).send(err.message);
    }
}

module.exports = {
    homePage
}