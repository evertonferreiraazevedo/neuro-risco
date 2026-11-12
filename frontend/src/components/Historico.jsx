import React, { useState, useEffect } from 'react';

export default function Historico({ token, apiFetch }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [filtroEscala, setFiltroEscala] = useState('');
  const [buscaLeito, setBuscaLeito] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    setLoading(true);
    setErro('');
    try {
      const response = await apiFetch(`${API_URL}/api/avaliacoes`);
      const data = await response.json();
      if (response.ok) {
        const validos = Array.isArray(data) ? data.filter(item => item && item.createdAt && !isNaN(new Date(item.createdAt).getTime())) : [];
        setAvaliacoes(validos);
      } else {
        setErro(data.erro || 'Erro ao carregar histórico geral.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro de conexão ao buscar histórico.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatarPontuacao = (pontuacao) => {
    if (typeof pontuacao === 'object' && pontuacao !== null) {
      return `Total: ${pontuacao.total} (AO: ${pontuacao.ao}, RV: ${pontuacao.rv}, RM: ${pontuacao.rm})`;
    }
    return pontuacao;
  };

  const avaliacoesFiltradas = avaliacoes.filter(av => {
    const matchEscala = filtroEscala ? av.escala === filtroEscala : true;
    const matchLeito = buscaLeito ? (av.leito && av.leito.toLowerCase().includes(buscaLeito.toLowerCase())) || (av.iniciais && av.iniciais.toLowerCase().includes(buscaLeito.toLowerCase())) : true;
    return matchEscala && matchLeito;
  });

  return (
    <div className="historico-container">
      <h2>Histórico Geral de Avaliações Clínicas</h2>

      {erro && <div className="error-message">{erro}</div>}

      <div className="pacientes-filtro" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
          <label>Filtrar por Escala:</label>
          <select value={filtroEscala} onChange={(e) => setFiltroEscala(e.target.value)}>
            <option value="">Todas as Escalas</option>
            <option value="GLASGOW">Glasgow</option>
            <option value="BRADEN">Braden</option>
            <option value="MORSE">Morse</option>
            <option value="RASS">RASS</option>
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
          <label>Buscar por Leito ou Paciente:</label>
          <input 
            type="text" 
            placeholder="Ex: UTI 1 ou A. B. C." 
            value={buscaLeito} 
            onChange={(e) => setBuscaLeito(e.target.value)} 
          />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Carregando histórico...</p>
      ) : avaliacoesFiltradas.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhuma avaliação encontrada com os filtros selecionados.</p>
      ) : (
        <div className="table-responsive">
          <table className="historico-table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Escala</th>
                <th>Paciente / Leito</th>
                <th>Pontuação</th>
                <th>Classificação</th>
                <th>Avaliador</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoesFiltradas.map((av) => {
                const pontuacaoFormatada = formatarPontuacao(av.pontuacao);
                return (
                  <tr key={av._id || Math.random()}>
                    <td>{new Date(av.createdAt).toLocaleString('pt-BR')}</td>
                    <td><strong>{av.escala}</strong></td>
                    <td>{av.iniciais || 'N/A'} ({av.leito || 'N/A'})</td>
                    <td>{pontuacaoFormatada}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
                        {av.classificacao || 'N/A'}
                      </span>
                    </td>
                    <td>{av.avaliadorNome || 'Profissional'} (COREN: {av.avaliadorCoren || 'N/A'})</td>
                    <td>
                      <button 
                        className="btn-select"
                        onClick={() => {
                          navigator.clipboard.writeText(av.textoProntuario || `Escala: ${av.escala} - Pontuação: ${JSON.stringify(av.pontuacao)}`);
                          alert('Prontuário copiado para a área de transferência!');
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        📋 Copiar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}