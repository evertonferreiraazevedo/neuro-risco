import React, { useState, useEffect } from 'react';

function Paciente({ token, onSelecionarPaciente }) {
  const [pacientes, setPacientes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('ATIVO');
  const [iniciais, setIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState(null);
  const [historicoModal, setHistoricoModal] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  const buscarPacientes = async () => {
    try {
      setCarregando(true);
      const response = await fetch(`${API_URL}/api/pacientes?status=${filtroStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPacientes(data);
      } else {
        setErro(data.erro || 'Erro ao carregar pacientes.');
      }
    } catch (err) {
      setErro('Erro de conexão ao buscar pacientes.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarPacientes();
  }, [filtroStatus]);

  const handleCadastrar = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!iniciais || !leito || !diagnostico) {
      setErro('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/pacientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ iniciais, leito, diagnostico })
      });

      const data = await response.json();
      if (response.ok) {
        setSucesso('Paciente cadastrado com sucesso.');
        setIniciais('');
        setLeito('');
        setDiagnostico('');
        buscarPacientes();
      } else {
        setErro(data.erro || 'Erro ao cadastrar paciente.');
      }
    } catch (err) {
      setErro('Erro de conexão ao cadastrar paciente.');
    }
  };

  const handleAlterarStatus = async (id, novoStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/pacientes/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        buscarPacientes();
      } else {
        const data = await response.json();
        setErro(data.erro || 'Erro ao alterar status.');
      }
    } catch (err) {
      setErro('Erro de conexão ao alterar status.');
    }
  };

  const abrirHistorico = async (paciente) => {
    try {
      const response = await fetch(`${API_URL}/api/pacientes/${paciente._id}/historico`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setHistoricoModal(data);
      } else {
        setErro(data.erro || 'Erro ao carregar histórico.');
      }
    } catch (err) {
      setErro('Erro de conexão ao carregar histórico.');
    }
  };

  const copiarProntuario = (texto) => {
    navigator.clipboard.writeText(texto);
    alert('Texto copiado para a área de transferência.');
  };

  return (
    <div className="paciente-container">
      <h2>Gestão de Pacientes (LGPD)</h2>
      
      {erro && <div className="error-message">{erro}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}

      <form onSubmit={handleCadastrar} className="paciente-form">
        <h3>Novo Cadastro</h3>
        <div className="form-row">
          <input
            type="text"
            placeholder="Iniciais (ex: J.M.S.)"
            value={iniciais}
            onChange={(e) => setIniciais(e.target.value)}
            maxLength={15}
            required
          />
          <input
            type="text"
            placeholder="Leito (ex: UTI-02)"
            value={leito}
            onChange={(e) => setLeito(e.target.value)}
            maxLength={20}
            required
          />
        </div>
        <input
          type="text"
          placeholder="Diagnóstico / Hipótese Diagnóstica"
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
          maxLength={200}
          required
        />
        <button type="submit" className="btn-primary">Cadastrar Paciente</button>
      </form>

      <div className="pacientes-filtro">
        <label>Filtrar por Status:</label>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="ATIVO">Ativos</option>
          <option value="ALTA">Com Alta</option>
        </select>
      </div>

      <div className="pacientes-lista">
        <h3>Lista de Pacientes ({filtroStatus})</h3>
        {carregando ? (
          <p>Carregando pacientes...</p>
        ) : pacientes.length === 0 ? (
          <p>Nenhum paciente encontrado.</p>
        ) : (
          <div className="table-responsive">
            <table className="pacientes-table">
              <thead>
                <tr>
                  <th>Leito</th>
                  <th>Iniciais</th>
                  <th>Diagnóstico</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((pac) => (
                  <tr key={pac._id}>
                    <td>{pac.leito}</td>
                    <td>{pac.iniciais}</td>
                    <td>{pac.diagnostico}</td>
                    <td><span className={`badge ${pac.status.toLowerCase()}`}>{pac.status}</span></td>
                    <td className="actions-cell">
                      {pac.status === 'ATIVO' && (
                        <>
                          <button
                            className="btn-select"
                            onClick={() => {
                              onSelecionarPaciente(pac);
                              alert(`Paciente ${pac.iniciais} (Leito ${pac.leito}) selecionado para as avaliações.`);
                            }}
                          >
                            Selecionar
                          </button>
                          <button
                            className="btn-alta"
                            onClick={() => handleAlterarStatus(pac._id, 'ALTA')}
                          >
                            Dar Alta
                          </button>
                        </>
                      )}
                      {pac.status === 'ALTA' && (
                        <button
                          className="btn-reativar"
                          onClick={() => handleAlterarStatus(pac._id, 'ATIVO')}
                        >
                        Reativar
                        </button>
                      )}
                      <button
                        className="btn-historico"
                        onClick={() => abrirHistorico(pac)}
                      >
                        Histórico
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {historicoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Histórico de Avaliações - {historicoModal.paciente.iniciais} (Leito {historicoModal.paciente.leito})</h3>
            <p><strong>Diagnóstico:</strong> {historicoModal.paciente.diagnostico}</p>
            <div className="historico-list">
              {historicoModal.avaliacoes.length === 0 ? (
                <p>Nenhuma avaliação registrada para este paciente.</p>
              ) : (
                historicoModal.avaliacoes.map((av) => (
                  <div key={av._id} className="historico-item">
                    <div className="historico-header">
                      <span><strong>{av.escala}</strong> - {new Date(av.createdAt).toLocaleString()}</span>
                      <span>Pontuação: {JSON.stringify(av.pontuacao)}</span>
                    </div>
                    <p><strong>Classificação:</strong> {av.classificacao}</p>
                    <p><strong>Avaliador:</strong> {av.avaliadorNome} (COREN: {av.avaliadorCoren})</p>
                    <pre className="prontuario-texto">{av.textoProntuario}</pre>
                    <button className="btn-copy" onClick={() => copiarProntuario(av.textoProntuario)}>Copiar para Prontuário</button>
                  </div>
                ))
              )}
            </div>
            <button className="btn-close" onClick={() => setHistoricoModal(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Paciente;