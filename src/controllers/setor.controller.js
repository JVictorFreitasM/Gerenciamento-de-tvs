const setorService =
    require("../services/setor.service");

async function create(req, res) {

    try {

        await setorService.createSetor(
            req.body.nome
        );

        return res.redirect("/");

    } catch(err) {

        return res
            .status(500)
            .send(err.message);

    }

}

module.exports = {
    create
};