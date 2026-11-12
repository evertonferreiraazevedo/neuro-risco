import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { exportarProntuarioPDF } from '../utils/pdfExport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Paciente({ token, apiFetch, onSelecionarPaciente, usuario }) {
  const [pacientes, setPacientes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('ATIVO');
  const [termoBusca, setTermoBusca] = useState('');
  const [iniciais, setIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [historicoModal, setHistoricoModal] = useState(null);
  const [escalaGrafico, setEscalaGrafico] = useState('GLASGOW');

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  const buscarPacientes = async () => {
    try {
      setCarregando(true);
      const response = await apiFetch(`${API_URL}/api/pacientes?status=${filtroStatus}`);
      const data = await response.json();
      if (response.ok) {
        setPacientes(data);
      } else {
        setErro(data.erro || 'Erro ao carregar pacientes.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro de conexão ao buscar pacientes.');
      }
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
      const response = await apiFetch(`${API_URL}/api/pacientes`, {
        method: 'POST',
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
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro de conexão ao cadastrar paciente.');
      }
    }
  };

  const handleAlterarStatus = async (id, novoStatus) => {
    try {
      const response = await apiFetch(`${API_URL}/api/pacientes/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: novoStatus })
      });

      if (response.ok) {
        buscarPacientes();
      } else {
        const data = await response.json();
        setErro(data.erro || 'Erro ao alterar status.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro de conexão ao alterar status.');
      }
    }
  };

  const abrirHistorico = async (paciente) => {
    try {
      const response = await apiFetch(`${API_URL}/api/pacientes/${paciente._id}/historico`);
      const data = await response.json();
      if (response.ok) {
        setHistoricoModal(data);
        setEscalaGrafico('GLASGOW');
      } else {
        setErro(data.erro || 'Erro ao carregar histórico.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro de conexão ao carregar histórico.');
      }
    }
  };

  const copiarProntuario = (texto) => {
    navigator.clipboard.writeText(texto);
    alert('Texto copiado para a área de transferência.');
  };

  const pacientesFiltrados = pacientes.filter((pac) => {
    const termo = termoBusca.toLowerCase();
    const matchIniciais = pac.iniciais.toLowerCase().includes(termo);
    const matchLeito = pac.leito.toLowerCase().includes(termo);
    return matchIniciais || matchLeito;
  });

  const renderizarGraficoEvolucao = (avaliacoes) => {
    const avaliacoesFiltradas = avaliacoes
      .filter((av) => av.escala === escalaGrafico)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    if (avaliacoesFiltradas.length === 0) {
      return <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>Nenhuma avaliação de {escalaGrafico} registrada para gerar o gráfico.</p>;
    }

    const labels = avaliacoesFiltradas.map((av) =>
      new Date(av.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const dadosPontos = avaliacoesFiltradas.map((av) => {
      if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
        return av.pontuacao.total !== undefined ? av.pontuacao.total : 0;
      }
      return Number(av.pontuacao) || 0;
    });

    const data = {
      labels,
      datasets: [
        {
          label: `Evolução - ${escalaGrafico}`,
          data: dadosPontos,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.2,
          fill: true
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `Evolução Temporal da Escala ${escalaGrafico}`
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return (
      <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <Line data={data} options={options} />
      </div>
    );
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

      <div className="pacientes-filtro" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
          <label>Filtrar por Status:</label>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="ATIVO">Ativos</option>
            <option value="ALTA">Com Alta</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: 0, flex: 2, minWidth: '250px' }}>
          <label>Busca Rápida (Iniciais ou Leito):</label>
          <input
            type="text"
            placeholder="Digite as iniciais ou o leito..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="pacientes-lista">
        <h3>Lista de Pacientes ({filtroStatus})</h3>
        {carregando ? (
          <p>Carregando pacientes...</p>
        ) : pacientesFiltrados.length === 0 ? (
          <p>Nenhum paciente encontrado com os critérios informados.</p>
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
                {pacientesFiltrados.map((pac) => (
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
                        Histórico / Gráfico
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
            <h3>Prontuário e Evolução - {historicoModal.paciente.iniciais} (Leito {historicoModal.paciente.leito})</h3>
            <p><strong>Diagnóstico:</strong> {historicoModal.paciente.diagnostico}</p>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '220px' }}>
                <label>Visualizar Gráfico da Escala:</label>
                <select value={escalaGrafico} onChange={(e) => setEscalaGrafico(e.target.value)}>
                  <option value="GLASGOW">Glasgow</option>
                  <option value="BRADEN">Braden</option>
                  <option value="MORSE">Morse</option>
                  <option value="RASS">RASS</option>
                </select>
              </div>

              <button 
                className="btn-primary" 
                style={{ backgroundColor: '#059669', width: 'auto', padding: '0.75rem 1.25rem', marginTop: 'auto' }}
                onClick={() => exportarProntuarioPDF(historicoModal.paciente, historicoModal.avaliacoes, usuario)}
              >
                Baixar Prontuário em PDF
              </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              {renderizarGraficoEvolucao(historicoModal.avaliacoes)}
            </div>

            <h4>Histórico Cronológico de Avaliações</h4>
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