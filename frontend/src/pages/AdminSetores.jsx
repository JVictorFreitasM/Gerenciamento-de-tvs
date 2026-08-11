import { useEffect, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import { BACKEND_URL } from '../config/backend';

export default function AdminSetores() {
  const [setores, setSetores] = useState([]);
  const [tvs, setTvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [novoSetor, setNovoSetor] = useState('');
  const [criandoSetor, setCriandoSetor] = useState(false);
  const [erroSetor, setErroSetor] = useState(null);

  const [tvForm, setTvForm] = useState({ nome: '', identificador: '', setorId: '' });
  const [criandoTv, setCriandoTv] = useState(false);
  const [erroTv, setErroTv] = useState(null);
  const [tokenRevelado, setTokenRevelado] = useState(null);
  const [carregandoTokenId, setCarregandoTokenId] = useState(null);

  const fetchOverview = () => {
    setLoading(true);
    apiFetch('/api/admin/setores').then((result) => {
      if (!result.ok) {
        setError(result.message || 'Erro ao carregar setores');
      } else {
        setError(null);
        setSetores(result.setores || []);
        setTvs(result.tvs || []);
      }
      setLoading(false);
    });
  };

  useEffect(fetchOverview, []);

  const handleCreateSetor = async (e) => {
    e.preventDefault();
    setCriandoSetor(true);
    setErroSetor(null);
    const result = await apiFetch('/api/admin/setores', { method: 'POST', body: { nome: novoSetor } });
    if (!result.ok) {
      setErroSetor(result.message || 'Erro ao criar setor');
    } else {
      setNovoSetor('');
      fetchOverview();
    }
    setCriandoSetor(false);
  };

  const handleCreateTv = async (e) => {
    e.preventDefault();
    setCriandoTv(true);
    setErroTv(null);
    const result = await apiFetch('/api/admin/tvs', { method: 'POST', body: tvForm });
    if (!result.ok) {
      setErroTv(result.message || 'Erro ao cadastrar TV');
    } else {
      setTokenRevelado(result.tv);
      setTvForm({ nome: '', identificador: '', setorId: '' });
      fetchOverview();
    }
    setCriandoTv(false);
  };

  const handleVerLink = async (tv) => {
    setCarregandoTokenId(tv.id);
    const result = await apiFetch(`/api/admin/tvs/${tv.id}/token`);
    if (result.ok) {
      setTokenRevelado(result.tv);
    } else {
      setErroTv(result.message || 'Erro ao buscar o link da TV');
    }
    setCarregandoTokenId(null);
  };

  // Abre o player da TV direto numa aba nova - mesma chamada do "Ver link",
  // mas sem precisar copiar/colar a URL manualmente.
  const handleAssistir = async (tv) => {
    setCarregandoTokenId(tv.id);
    const result = await apiFetch(`/api/admin/tvs/${tv.id}/token`);
    setCarregandoTokenId(null);
    if (!result.ok) {
      setErroTv(result.message || 'Erro ao abrir a TV');
      return;
    }
    window.open(`${BACKEND_URL}/tv/${result.tv.identificador}?token=${result.tv.accessToken}`, '_blank', 'noopener');
  };

  if (loading) {
    return <div className="skeleton" style={{ height: 300, borderRadius: 12 }}></div>;
  }

  return (
    <>
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3>Setores</h3>
        </div>
        <div className="card-body">
          {erroSetor && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle"></i> {erroSetor}
            </div>
          )}
          <div className="table-container" style={{ marginBottom: '1rem' }}>
            <table className="data-table">
              <thead><tr><th>Nome</th></tr></thead>
              <tbody>
                {setores.map((setor) => (
                  <tr key={setor.id}><td>{setor.nome}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <form onSubmit={handleCreateSetor} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              className="form-input"
              style={{ flex: '1 1 240px' }}
              placeholder="Nome do novo setor"
              value={novoSetor}
              onChange={(e) => setNovoSetor(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit" disabled={criandoSetor}>
              {criandoSetor ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-plus"></i> Criar setor</>}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>TVs cadastradas</h3>
        </div>
        <div className="card-body">
          {erroTv && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle"></i> {erroTv}
            </div>
          )}

          {tokenRevelado && (
            <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <strong>Link da TV "{tokenRevelado.nome}" — configure isto no dispositivo:</strong>
              <code style={{ display: 'block', marginTop: '0.5rem', wordBreak: 'break-all' }}>
                {BACKEND_URL}/tv/{tokenRevelado.identificador}?token={tokenRevelado.accessToken}
              </code>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <a
                  className="btn btn-primary btn-sm"
                  href={`${BACKEND_URL}/tv/${tokenRevelado.identificador}?token=${tokenRevelado.accessToken}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fas fa-play"></i> Abrir player
                </a>
                <button className="btn btn-ghost btn-sm" onClick={() => setTokenRevelado(null)}>
                  Fechar
                </button>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginBottom: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr><th>Nome</th><th>Identificador</th><th>Setor</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {tvs.length === 0 ? (
                  <tr><td colSpan={5} style={{ color: 'var(--text-secondary)' }}>Nenhuma TV cadastrada.</td></tr>
                ) : (
                  tvs.map((tv) => (
                    <tr key={tv.id}>
                      <td>{tv.nome}</td>
                      <td><code>{tv.identificador}</code></td>
                      <td>{tv.setor.nome}</td>
                      <td>
                        <span className={`badge ${tv.online ? 'success' : 'neutral'}`}>
                          {tv.online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAssistir(tv)}
                            disabled={carregandoTokenId === tv.id}
                            title="Abrir o player desta TV numa aba nova"
                          >
                            {carregandoTokenId === tv.id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <><i className="fas fa-play"></i> Assistir</>
                            )}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleVerLink(tv)}
                            disabled={carregandoTokenId === tv.id}
                            title="Ver a URL completa (pra configurar no dispositivo)"
                          >
                            <i className="fas fa-link"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <form onSubmit={handleCreateTv} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
              <label className="form-label">Nome da TV</label>
              <input
                className="form-input"
                value={tvForm.nome}
                onChange={(e) => setTvForm((f) => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
              <label className="form-label">Identificador único</label>
              <input
                className="form-input"
                value={tvForm.identificador}
                onChange={(e) => setTvForm((f) => ({ ...f, identificador: e.target.value }))}
                required
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
              <label className="form-label">Setor</label>
              <select
                className="form-input"
                value={tvForm.setorId}
                onChange={(e) => setTvForm((f) => ({ ...f, setorId: e.target.value }))}
                required
              >
                <option value="">Selecione...</option>
                {setores.map((setor) => (
                  <option key={setor.id} value={setor.id}>{setor.nome}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={criandoTv}>
              {criandoTv ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-plus"></i> Cadastrar TV</>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
