// src/services/auth.js
// OS 12-C: checagem de sessao com o IdP. requireAuth (na lib do backend)
// nunca devolve 401 - em caso de sessao ausente/expirada ele redireciona
// (302) pro /auth/login. Um fetch normal seguiria esse redirect ate o IdP
// (outra origem) e quebraria por CORS. `redirect: 'manual'` faz o fetch
// parar no primeiro redirect (response.type === 'opaqueredirect'), o que
// usamos aqui como sinal de "nao logado".
//
// IMPORTANTE: um 403 aqui (usuario_nao_vinculado) NAO e a mesma coisa que
// "nao logado" - a sessao no IdP existe e e valida, so nao ha User local
// vinculado ainda. Tratar os dois casos igual (mandar de volta pro
// /auth/login) cria loop infinito: o IdP autentica na hora (sessao ja
// existe), volta pra SPA, /api/me devolve 403 de novo, redireciona nao
// devolve nunca uma tela pro usuario. Por isso os dois casos sao
// distinguidos abaixo (bug real, visto em producao - "fica dando refresh").
import { BACKEND_URL } from '../config/backend';

export async function getMe() {
  try {
    const response = await fetch('/api/me', {
      redirect: 'manual',
      headers: { Accept: 'application/json' },
    });

    if (response.type === 'opaqueredirect' || response.status === 0) {
      return { authenticated: false };
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      // 403 com corpo conhecido = autenticado no IdP, mas bloqueado por um
      // motivo especifico do TV Signage (sem User local, etc.) - nunca
      // redirecionar de volta pro login nesse caso.
      if (response.status === 403 && data?.error) {
        return { authenticated: true, blocked: true, error: data.error, message: data.message, voltarUrl: data.voltarUrl };
      }
      return { authenticated: false };
    }

    const data = await response.json();
    return { authenticated: true, user: data.user };
  } catch (error) {
    console.error('[auth] Erro ao consultar /api/me:', error);
    return { authenticated: false };
  }
}

export function loginUrl() {
  const returnTo = window.location.href;
  return `${BACKEND_URL}/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function logoutUrl() {
  return `${BACKEND_URL}/auth/logout`;
}
