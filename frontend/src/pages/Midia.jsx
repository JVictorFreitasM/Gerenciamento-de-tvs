import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { apiFetch } from '../services/apiFetch';

// usuario so tem um setor - pula direto pra tela de gestao dele.
// ti escolhe qual setor gerenciar.
export default function Midia({ user }) {
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/setores').then((result) => {
      if (result.ok) setSetores(result.setores || []);
      setLoading(false);
    });
  }, []);

  if (user.role !== 'ti') {
    return user.setor ? <Navigate to={`/midia/${user.setor}`} replace /> : null;
  }

  if (loading) {
    return <div className="skeleton" style={{ height: 200, borderRadius: 12 }}></div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Selecione um setor</h3>
      </div>
      <div className="card-body">
        {setores.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-building"></i>
            <h4>Nenhum setor cadastrado</h4>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {setores.map((setor) => (
              <Link
                key={setor.id}
                to={`/midia/${setor.nome}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <i className="fas fa-photo-film"></i> {setor.nome}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
