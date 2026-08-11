// src/components/AcessoNegado.jsx
// OS 12-B, secao 3.8 / OS 12-C, secao 3.4: usuario sem permissao pra uma
// rota especifica (ex.: "usuario" tentando uma tela de "ti"). Mesmo padrao
// de mensagem clara + botao de volta - pra HOME do proprio TV Signage,
// nunca pro menu central do IdP.
import { Link } from 'react-router-dom';

export default function AcessoNegado() {
  return (
    <div className="card" style={{ maxWidth: 480, margin: '3rem auto', textAlign: 'center' }}>
      <div className="card-body">
        <i
          className="fas fa-lock"
          style={{ fontSize: '2.5rem', color: 'var(--danger)', marginBottom: '1rem', display: 'block' }}
        ></i>
        <h3 style={{ marginBottom: '0.75rem' }}>Acesso negado</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Você não tem acesso a esta área.
        </p>
        <Link className="btn btn-primary" to="/">
          <i className="fas fa-house"></i> Voltar ao início
        </Link>
      </div>
    </div>
  );
}
