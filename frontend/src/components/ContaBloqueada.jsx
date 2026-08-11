// src/components/ContaBloqueada.jsx
// Autenticado no IdP, mas bloqueado por um motivo especifico do TV Signage
// (ex.: usuario_nao_vinculado - sem User local ainda). Nunca redireciona
// de volta pro /auth/login sozinho - isso reautenticaria na hora (sessao
// do IdP ja existe) e criaria loop (ver services/auth.js).
import { logoutUrl } from '../services/auth';

export default function ContaBloqueada({ message, voltarUrl }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div className="card-body">
          <i
            className="fas fa-user-lock"
            style={{ fontSize: '2.5rem', color: 'var(--warning)', marginBottom: '1rem', display: 'block' }}
          ></i>
          <h3 style={{ marginBottom: '0.75rem' }}>Não foi possível continuar</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {message || 'Sua conta está autenticada, mas não tem acesso a este sistema. Contate o TI.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {voltarUrl && (
              <a className="btn btn-primary" href={voltarUrl}>
                <i className="fas fa-arrow-left"></i> Voltar aos sistemas
              </a>
            )}
            <a className="btn btn-secondary" href={logoutUrl()}>
              <i className="fas fa-right-from-bracket"></i> Sair
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
