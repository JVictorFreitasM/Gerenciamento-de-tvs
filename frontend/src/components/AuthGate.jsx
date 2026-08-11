// src/components/AuthGate.jsx
import { useEffect, useState } from 'react';
import { getMe, loginUrl } from '../services/auth';
import ContaBloqueada from './ContaBloqueada';

// OS 12-C: gate de autenticacao da SPA. Consulta GET /api/me uma vez ao
// montar; se nao autenticado, manda o navegador (navegacao completa, nao
// fetch) pro /auth/login do backend. Nenhuma logica nova de token aqui - o
// front so consome /api/me e exibe o resultado (OS 12-C, secao 3.3).
//
// "blocked" (autenticado no IdP, mas 403 do backend por outro motivo -
// ex.: usuario_nao_vinculado) e um estado DIFERENTE de "nao autenticado" -
// nunca redireciona pro login sozinho nesse caso, ou vira loop infinito
// (sessao do IdP ja existe, reautentica na hora e cai no mesmo 403).
export default function AuthGate({ children }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [blocked, setBlocked] = useState(null);

  useEffect(() => {
    let ativo = true;

    getMe().then((result) => {
      if (!ativo) return;

      if (result.blocked) {
        setBlocked(result);
        setStatus('blocked');
        return;
      }

      if (!result.authenticated) {
        window.location.href = loginUrl();
        return;
      }

      setUser(result.user);
      setStatus('authenticated');
    });

    return () => {
      ativo = false;
    };
  }, []);

  if (status === 'blocked') {
    return <ContaBloqueada message={blocked.message} voltarUrl={blocked.voltarUrl} />;
  }

  if (status !== 'authenticated') {
    return null;
  }

  return children(user);
}
