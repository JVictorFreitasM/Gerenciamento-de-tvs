/**
 * Wrapper de fetch central usado pelo frontend inteiro. Define headers JSON,
 * trata erros HTTP e devolve o corpo ja parseado. Em erro, devolve
 * { error, message } (nunca lanca) pra telas tratarem de forma uniforme -
 * ver AcessoNegado/SemSetorAssociado, que reagem a error === 'acesso_negado'
 * / 'setor_nao_associado' vindos do backend (OS 12-B, secao 3.7/3.8).
 */
export async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return { ok: false, status: response.status, ...(data || {}) };
    }

    return { ok: true, status: response.status, ...(data || {}) };
  } catch (error) {
    console.error('[apiFetch] Erro na requisição:', error);
    return { ok: false, status: 0, error: 'erro_de_rede', message: 'Não foi possível falar com o servidor.' };
  }
}
