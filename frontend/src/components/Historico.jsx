import React, { useState, useEffect } from 'react';

function Historico({ token, apiFetch }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [pacienteFiltro, setPacienteFiltro] = useState('');
  const [escalaFiltro, setEscalaFiltro] = useState('');
  const [buscaLeito, setBuscaLeito] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  const buscarDados = async () => {
    try {
      setCarregando(true);
      let url = `${API_URL}/api/avaliacoes`;
      if (pacienteFiltro) {
        url += `?pacienteId=${pacienteFiltro}`;
      }

      const [resAvaliacoes, resPacientes] = await Promise.all([
        apiFetch(url),
        apiFetch(`${API_URL}/api/pacientes`)
      ]);

      const dataAvaliacoes = await resAvaliacoes.json();
      const dataPacientes = await resPacientes.json();

      if (resAvaliacoes.ok) {
        setAvaliacoes(dataAvaliacoes);
      } else {
        setErro(dataAvaliacoes.erro || 'Erro ao carregar histórico.');
      }

      if (resPacientes.ok) {
        setPacientes(dataPacientes);
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro de conexão ao carregar histórico.');
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, [pacienteFiltro]);

  const copiarProntuario = (texto) => {
    navigator.clipboard.writeText(texto);
    alert('Texto copiado para a área de transferência.');
  };

  const avaliacoesFiltradas = avaliacoes.filter((av) => {
    const matchEscala = escalaFiltro ? av.escala === escalaFiltro : true;
    const matchLeito = buscaLeito ? av.leito.toLowerCase().includes(buscaLeito.toLowerCase()) : true;
    return matchEscala && matchLeito;
  });

  return (
    <div className="historico-container">
      <h2>Histórico Geral de Avaliações Clínicas</h2>

      {erro && <div className="error-message">{erro}</div>}

      <div className="pacientes-filtro" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
          <label>Filtrar por Paciente:</label>
          <select value={pacienteFiltro} onChange={(e) => setPacienteFiltro(e.target.value)}>
            <option value="">Todos os Pacientes</option>
            {pacientes.map((pac) => (
              <option key={pac._id} value={pac._id}>
                {pac.iniciais} (Leito: {pac.leito})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
          <label>Filtrar por Escala:</label>
          <select value={escalaFiltro} onChange={(e) => setEscalaFiltro(e.target.value)}>
            <option value="">Todas as Escalas</option>
            <option value="GLASGOW">Glasgow</option>
            <option value="BRADEN">Braden</option>
            <option value="MORSE">Morse</option>
            <option value="RASS">RASS</option>
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
          <label>Buscar por Leito:</label>
          <input
            type="text"
            placeholder="Ex: UTI-01"
            value={buscaLeito}
            onChange={(e) => setBuscaLeito(e.target.value)}
          />
        </div>
      </div>

      {carregando ? (
        <p>Carregando histórico...</p>
      ) : avaliacoesFiltradas.length === 0 ? (
        <p>Nenhuma avaliação encontrada com os filtros selecionados.</p>
      ) : (
        <div className="historico-list">
          {avaliacoesFiltradas.map((av) => (
            <div key={av._id} className="historico-item">
              <div className="historico-header">
                <span>
                  <strong>{av.escala}</strong> | Leito: <strong>{av.leito}</strong> | Paciente: <strong>{av.iniciais}</strong>
                </span>
                <span>{new Date(av.createdAt).toLocaleString()}</span>
              </div>
              <p><strong>Classificação:</strong> {av.classificacao}</p>
              <p><strong>Avaliador:</strong> {av.avaliadorNome} (COREN: {av.avaliadorCoren})</p>
              <pre className="prontuario-texto">{av.textoProntuario}</pre>
              <button className="btn-copy" onClick={() => copiarProntuario(av.textoProntuario)}>
                Copiar para Prontuário
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Historico;