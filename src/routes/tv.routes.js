const router = require("express").Router();

const tvController = require("../controllers/tv.controller");

/**
 * @swagger
 * /tv/{identificador}:
 *   get:
 *     summary: Pagina do player exibida na TV fisica (HTML, nao JSON)
 *     description: Consumida pela TV fisica - autenticada por accessToken (query string `token` ou header `x-tv-token`), nao por sessao de usuario humano. Renderiza player.ejs ou player-diretoria.ejs conforme o setor.
 *     tags: [TV Fisica]
 *     security:
 *       - tvToken: []
 *     parameters:
 *       - in: path
 *         name: identificador
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: token
 *         schema: { type: string }
 *         description: alternativa ao header x-tv-token
 *     responses:
 *       200:
 *         description: HTML do player com a playlist do setor
 *         content:
 *           text/html: { schema: { type: string } }
 *       401:
 *         description: "TV não reconhecida ou token inválido. (texto plano, nao JSON)"
 *         content:
 *           text/plain: { schema: { type: string } }
 *       404:
 *         description: "Nenhuma playlist encontrada para este setor. (texto plano, nao JSON)"
 *         content:
 *           text/plain: { schema: { type: string } }
 */
// Consumida pela TV fisica - autenticada por accessToken (query string ou
// header x-tv-token), nao por sessao de usuario humano (OS 12-B, secao 3.9).
router.get("/tv/:identificador", tvController.tvPage);

module.exports = router;
