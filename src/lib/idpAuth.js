const { createIdpAuth } = require("@copperline/idp-client");

function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Variavel de ambiente ${name} e obrigatoria (login via IdP, OS 12-B)`);
    }

    return value;
}

// OS 17: menu central do IdP, usado no botao "Voltar aos sistemas" nas
// telas de erro de login e como destino pos-logout (ver abaixo).
const homeUrl = process.env.IDP_HOME_URL || "http://localhost:3000/home";

const idpAuth = createIdpAuth({
    idpUrl: requireEnv("IDP_URL"),
    authorizeUrl: process.env.IDP_AUTHORIZE_URL,
    homeUrl,
    clientId: requireEnv("IDP_CLIENT_ID"),
    clientSecret: requireEnv("IDP_CLIENT_SECRET"),
    redirectUri: requireEnv("IDP_REDIRECT_URI"),
    // OS 12-C: o callback roda no BACKEND (porta do IDP_REDIRECT_URI), mas a
    // UI agora e uma SPA servida pelo Vite/nginx em outra origem/porta - um
    // redirect relativo ("/") cairia no backend, nao no front. Manda pro
    // FRONTEND_URL explicitamente (mesmo padrao do Contracheque Bot).
    postLoginRedirect: process.env.FRONTEND_URL || "/",
    // Pos-logout manda pro menu central do IdP, nao de volta pro TV Signage -
    // senao o proximo requireAuth reabre exatamente o sistema de onde o
    // usuario acabou de sair, sem nunca mostrar o menu (OS 17). Precisa
    // estar cadastrado em postLogoutRedirectUris do TV Signage no painel do
    // IdP (OS 12-A).
    postLogoutRedirect: homeUrl,
});

module.exports = { idpAuth, homeUrl };
