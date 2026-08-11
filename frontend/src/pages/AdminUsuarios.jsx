import { useEffect, useState } from 'react';
import { apiFetch } from '../services/apiFetch';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salvandoId, setSalvandoId] = useState(null);

  const fetchOverview = () => {
    setLoading(true);
    apiFetch('/api/admin/usuarios').then((result) => {
      if (!result.ok) {
        setError(result.message || 'Erro ao carregar usuários');
      } else {
        setError(null);
        setUsuarios(result.usuarios || []);
        setSetores(result.setores || []);
      }
      setLoading(false);
    });
  };

  useEffect(fetchOverview, []);

  const handleAssign = async (userId, setorId) => {
    setSalvandoId(userId);
    const result = await apiFetch(`/api/admin/usuarios/${userId}/setor`, { method: 'POST', body: { setorId } });
    if (result.ok) fetchOverview();
    setSalvandoId(null);
  };

  if (loading) {
    return <div className="skeleton" style={{ height: 300, borderRadius: 12 }}></div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Associar usuários a setores</h3>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {usuarios.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <h4>Nenhum usuário fez login pelo IdP ainda</h4>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Usuário</th><th>E-mail</th><th>Setor atual</th><th>Associar a</th></tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.username}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`badge ${usuario.setor ? 'success' : 'neutral'}`}>
                        {usuario.setor ? usuario.setor.nome : 'sem setor'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                          className="form-input"
                          style={{ minHeight: 36, padding: '0.35rem 0.6rem' }}
                          defaultValue={usuario.setorId || ''}
                          disabled={salvandoId === usuario.id}
                          onChange={(e) => handleAssign(usuario.id, e.target.value)}
                        >
                          <option value="" disabled>Selecione...</option>
                          {setores.map((setor) => (
                            <option key={setor.id} value={setor.id}>{setor.nome}</option>
                          ))}
                        </select>
                        {salvandoId === usuario.id && <i className="fas fa-spinner fa-spin"></i>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
