import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/apiFetch';
import { BACKEND_URL } from '../config/backend';

function assistirUrl(tv) {
  return `${BACKEND_URL}/tv/${tv.identificador}?token=${tv.accessToken}`;
}

export default function Dashboard() {
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/dashboard').then((result) => {
      if (!result.ok) {
        setError(result.message || 'Erro ao carregar o painel');
      } else {
        setSetores(result.setores || []);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }}></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 8 }}></div>
              <div className="skeleton" style={{ width: '40%', height: 24 }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-circle"></i> {error}
      </div>
    );
  }

  const totalTvs = setores.reduce((acc, s) => acc + s.tvsTotal, 0);
  const totalOnline = setores.reduce((acc, s) => acc + s.tvsOnline, 0);

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-building"></i></div>
          <div className="stat-info">
            <div className="stat-label">Setores</div>
            <div className="stat-value">{setores.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-tv"></i></div>
          <div className="stat-info">
            <div className="stat-label">TVs online</div>
            <div className="stat-value">{totalOnline} / {totalTvs}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Setores</h3>
        </div>
        <div className="card-body">
          {setores.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-building"></i>
              <h4>Nenhum setor disponível</h4>
              <p>Fale com o TI para cadastrar um setor.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>TVs</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {setores.map((setor) => (
                    <tr key={setor.id}>
                      <td style={{ fontWeight: 500 }}>{setor.nome}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                          <span className={`badge ${setor.tvsOnline > 0 ? 'success' : 'neutral'}`} style={{ marginRight: '0.25rem' }}>
                            <i className="fas fa-circle"></i> {setor.tvsOnline} / {setor.tvsTotal}
                          </span>
                          {setor.tvs.map((tv) => (
                            <a
                              key={tv.id}
                              className="btn btn-ghost btn-sm"
                              href={assistirUrl(tv)}
                              target="_blank"
                              rel="noreferrer"
                              title={`Assistir "${tv.nome}"`}
                            >
                              <i className="fas fa-play"></i> {tv.nome}
                            </a>
                          ))}
                        </div>
                      </td>
                      <td>
                        <Link className="btn btn-secondary btn-sm" to={`/midia/${setor.nome}`}>
                          <i className="fas fa-photo-film"></i> Gerenciar mídia
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
