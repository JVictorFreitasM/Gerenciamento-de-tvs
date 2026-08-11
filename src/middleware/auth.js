const prisma = require("../prisma/client");
const { idpAuth, homeUrl } = require("../lib/idpAuth");

// OS 12-B, secao 3.4: resolve o User local a partir do sub do token do IdP.
// Vinculo e por e-mail (secao 2) - no PRIMEIRO login bem sucedido de um
// e-mail que ja existe como User local (cadastrado pelo TI, ver README),
// gravamos o idpUserId nesse User (auto-vinculo). Da em diante a busca e
// sempre por idpUserId. Sem User local nenhum pro e-mail -> bloqueia com
// mensagem clara, nunca deixa passar sem req.usuario definido.
async function resolveLocalUser(req, res, next) {
    const idpUser = req.user;

    if (!idpUser) {
        return res.status(401).json({
            error: "nao_autenticado",
            message: "Sua sessão expirou. Faça login novamente."
        });
    }

    let usuario = await prisma.user.findUnique({
        where: { idpUserId: idpUser.sub },
        include: { setor: true }
    });

    if (!usuario && idpUser.email) {
        const porEmail = await prisma.user.findUnique({
            where: { email: idpUser.email }
        });

        if (porEmail && !porEmail.idpUserId) {
            usuario = await prisma.user.update({
                where: { id: porEmail.id },
                data: { idpUserId: idpUser.sub },
                include: { setor: true }
            });
        }
    }

    if (!usuario) {
        return res.status(403).json({
            error: "usuario_nao_vinculado",
            message: "Sua conta está autenticada, mas ainda não foi cadastrada no TV Signage. Contate o TI.",
            voltarUrl: homeUrl
        });
    }

    req.usuario = {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        setorId: usuario.setorId,
        setorNome: usuario.setor ? usuario.setor.nome : null,
        // papel geral (ti/usuario) vem exclusivamente da claim do token do
        // IdP - nunca do campo legado User.role (OS 12-B, secao 2).
        papel: idpUser.role
    };

    next();
}

// Substitui o middleware antigo baseado em JWT proprio: idpAuth.requireAuth
// valida a sessao/token do IdP (renovando via refresh token quando preciso)
// e popula req.user; resolveLocalUser resolve o User local correspondente.
const authenticate = (req, res, next) => {
    idpAuth.requireAuth(req, res, () => resolveLocalUser(req, res, next));
};

// OS 12-B, secao 3.7: usuario logado com sucesso mas sem setor associado
// ainda (papel "usuario", ti ainda nao associou). ti nunca passa por essa
// checagem - so faz sentido pra quem depende de um setor pra enxergar algo.
function requireSetorAssociado(req, res, next) {
    if (req.usuario.papel === "ti") {
        return next();
    }

    if (!req.usuario.setorId) {
        return res.status(403).json({
            error: "setor_nao_associado",
            message: "Sua conta ainda não foi associada a um setor. Contate o TI."
        });
    }

    next();
}

// OS 12-B, secao 3.8 / OS 12-C: acesso negado a uma rota especifica (ex.:
// "usuario" tentando uma rota de "ti"). Backend agora e API pura - devolve
// 403 JSON; quem decide pra onde mandar o usuario (home do PROPRIO TV
// Signage, nunca o menu central do IdP) e o front, lendo esse erro.
function requireRole(papel) {
    return (req, res, next) => {
        if (req.usuario.papel !== papel) {
            return res.status(403).json({
                error: "acesso_negado",
                message: "Você não tem acesso a esta área."
            });
        }

        next();
    };
}

module.exports = {
    authenticate,
    requireSetorAssociado,
    requireRole
};
