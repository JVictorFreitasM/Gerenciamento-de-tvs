import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { apiFetch } from '../services/apiFetch';

export default function MidiaSetor() {
  const { setor } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [selected, setSelected] = useState(new Set());
  const dragId = useRef(null);

  const fetchPlaylist = useCallback(() => {
    setLoading(true);
    apiFetch(`/api/playlist/${setor}`).then((result) => {
      if (!result.ok) {
        setError(result.message || 'Erro ao carregar a playlist');
      } else {
        setError(null);
        setData(result);
      }
      setLoading(false);
    });
  }, [setor]);

  useEffect(() => {
    fetchPlaylist();
    setSelected(new Set());
  }, [fetchPlaylist]);

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append('media', file));

    try {
      await axios.post(`/api/media/upload/${setor}`, formData, {
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / (e.total || 1)));
        },
      });
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchPlaylist();
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao enviar os arquivos.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleMove = async (playlistMediaId, direction) => {
    await apiFetch(`/api/playlist/move-${direction}/${playlistMediaId}`, { method: 'POST' });
    fetchPlaylist();
  };

  const handleDurationChange = async (mediaId, duracao) => {
    if (duracao < 1) return;
    await apiFetch(`/api/media/${mediaId}/duration`, { method: 'PUT', body: { duracao } });
  };

  const handleRemove = async (mediaId) => {
    if (!confirm('Deseja excluir esta mídia?')) return;
    const result = await apiFetch(`/api/media/${mediaId}`, { method: 'DELETE' });
    if (result.ok) fetchPlaylist();
  };

  const handleRemoveSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Deseja excluir ${selected.size} mídia(s)?`)) return;
    const result = await apiFetch('/api/media/bulk', { method: 'DELETE', body: { ids: Array.from(selected) } });
    if (result.ok) {
      setSelected(new Set());
      fetchPlaylist();
    }
  };

  const toggleSelected = (mediaId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(mediaId)) next.delete(mediaId);
      else next.add(mediaId);
      return next;
    });
  };

  const handleDrop = async (targetId) => {
    const sourceId = dragId.current;
    dragId.current = null;
    if (!sourceId || sourceId === targetId || !data) return;

    const ids = data.medias.map((item) => item.id);
    const sourceIndex = ids.indexOf(sourceId);
    const targetIndex = ids.indexOf(targetId);
    ids.splice(sourceIndex, 1);
    ids.splice(targetIndex, 0, sourceId);

    await apiFetch('/api/playlist/reorder', { method: 'POST', body: { orderedIds: ids } });
    fetchPlaylist();
  };

  if (loading && !data) {
    return <div className="skeleton" style={{ height: 300, borderRadius: 12 }}></div>;
  }

  if (error && !data) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-circle"></i> {error}
      </div>
    );
  }

  const medias = data?.medias || [];

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/midia" className="btn btn-ghost btn-sm">
          <i className="fas fa-arrow-left"></i> Voltar
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3><i className="fas fa-cloud-arrow-up" style={{ marginRight: 8, color: 'var(--accent)' }}></i>Enviar mídia — {setor}</h3>
        </div>
        <div className="card-body">
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            disabled={uploading}
            className="form-input"
            style={{ marginBottom: '1rem' }}
          />

          {progress > 0 && progress < 100 && (
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || files.length === 0}>
              {uploading ? (
                <><i className="fas fa-spinner fa-spin"></i> Enviando...</>
              ) : (
                <><i className="fas fa-paper-plane"></i> Enviar {files.length > 0 ? `(${files.length})` : ''}</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Playlist — {setor}</h3>
          <button className="btn btn-danger btn-sm" onClick={handleRemoveSelected} disabled={selected.size === 0}>
            <i className="fas fa-trash"></i> Excluir selecionados ({selected.size})
          </button>
        </div>
        <div className="card-body">
          {medias.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-photo-film"></i>
              <h4>Nenhuma mídia na playlist</h4>
              <p>Envie um vídeo ou imagem acima.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Ordem</th>
                    <th>Preview</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Duração</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {medias.map((item) => (
                    <tr
                      key={item.id}
                      draggable
                      onDragStart={() => { dragId.current = item.id; }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(item.id)}
                      style={{ cursor: 'grab' }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(item.media.id)}
                          onChange={() => toggleSelected(item.media.id)}
                        />
                      </td>
                      <td><strong>{item.ordem}</strong></td>
                      <td>
                        <a
                          href={`/api/media/file/${setor}/${item.media.filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm"
                          title="Abrir mídia"
                        >
                          <i className="fas fa-eye"></i>
                        </a>
                      </td>
                      <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.media.nome}>
                        {item.media.nome}
                      </td>
                      <td>
                        <span className={`badge ${item.media.tipo === 'VIDEO' ? 'info' : 'success'}`}>
                          {item.media.tipo}
                        </span>
                      </td>
                      <td>
                        {item.media.tipo === 'IMAGEM' ? (
                          <input
                            type="number"
                            min="1"
                            defaultValue={item.media.duracao || 10}
                            className="form-input"
                            style={{ width: 90, minHeight: 36, padding: '0.4rem 0.6rem' }}
                            onBlur={(e) => handleDurationChange(item.media.id, Number(e.target.value))}
                          />
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Automático</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleMove(item.id, 'up')} title="Mover para cima">
                            <i className="fas fa-arrow-up"></i>
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleMove(item.id, 'down')} title="Mover para baixo">
                            <i className="fas fa-arrow-down"></i>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.media.id)} title="Remover">
                            <i className="fas fa-trash"></i>
                          </button>
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
    </>
  );
}
