// OS 12-C: origens absolutas do backend e do proprio frontend, usadas apenas
// para montar as URLs de /auth/login e /auth/logout (que rodam no backend,
// fora do proxy do Vite/nginx) e o returnTo de volta pro painel.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5002';
// OS 17: menu central do IdP (OS 13) - destino do botao "Voltar aos sistemas".
export const IDP_HOME_URL = import.meta.env.VITE_IDP_HOME_URL || 'http://localhost:3000/home';
