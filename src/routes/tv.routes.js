const router = require("express").Router();

const tvController = require("../controllers/tv.controller");

// Consumida pela TV fisica - autenticada por accessToken (query string ou
// header x-tv-token), nao por sessao de usuario humano (OS 12-B, secao 3.9).
router.get("/tv/:identificador", tvController.tvPage);

module.exports = router;
