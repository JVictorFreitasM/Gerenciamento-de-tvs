const tvRepository = require("../repositories/tv.repository");

// OS 12-B, secao 3.9: /videos e /uploads sao consumidas por dispositivos
// (TVs fisicas), nao por usuarios humanos - por isso NAO usam idpAuth
// (requireAuth), e sim o accessToken fixo da propria TV.
//
// enforceSetorPath: quando true, o primeiro segmento do path (a pasta de
// setor dentro de /videos/<setor>/arquivo) precisa bater com o setor da TV
// dona do token - impede que o token de uma TV sirva midia de outro setor.
function createTvAccessMiddleware({ enforceSetorPath } = {}) {
    return async function tvAccess(req, res, next) {
        const token = req.query.token || req.get("x-tv-token");

        if (!token) {
            return res.status(401).send("Token de acesso da TV é obrigatório.");
        }

        const tv = await tvRepository.findByAccessToken(token);

        if (!tv) {
            return res.status(401).send("Token de acesso da TV inválido.");
        }

        if (enforceSetorPath) {
            const primeiroSegmento = req.path.split("/").filter(Boolean)[0] || "";

            if (primeiroSegmento.toLowerCase() !== tv.setor.nome.toLowerCase()) {
                return res.status(403).send("Este token não dá acesso a este setor.");
            }
        }

        req.tv = tv;
        next();
    };
}

module.exports = { createTvAccessMiddleware };
