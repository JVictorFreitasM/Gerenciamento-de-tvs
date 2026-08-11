// src/components/SemSetorAssociado.jsx
// OS 12-B, secao 3.7 / OS 12-C, secao 3.4: usuario logado com sucesso, mas
// User.setorId ainda e null (papel "usuario", ti ainda nao associou). ti
// nunca ve esta tela - checado antes de renderizar (ver App.jsx).
import { logoutUrl } from '../services/auth';

export default function SemSetorAssociado() {
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
            className="fas fa-building-circle-exclamation"
            style={{ fontSize: '2.5rem', color: 'var(--warning)', marginBottom: '1rem', display: 'block' }}
          ></i>
          <h3 style={{ marginBottom: '0.75rem' }}>Setor não associado</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Sua conta ainda não foi associada a um setor. Contate o TI.
          </p>
          <a className="btn btn-secondary" href={logoutUrl()}>
            <i className="fas fa-right-from-bracket"></i> Sair
          </a>
        </div>
      </div>
    </div>
  );
}
