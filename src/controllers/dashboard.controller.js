const setorService = require("../services/setor.service");

async function dashboardPage(req, res) {

    try {
        const setores = await setorService.getAllSetores();

        res.render("dashboard", {
            setores
        });
    } catch(err) {
        return res.status(500).send(err.message);
    }
}
module.exports = {
    dashboardPage
}