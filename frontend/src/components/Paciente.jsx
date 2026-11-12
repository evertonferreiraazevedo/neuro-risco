import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
  Legend,
  Filler
);

export default function Paciente({ token, apiFetch, usuario, onSelecionarPaciente }) {
  const [pacientes, setPacientes] = useState([]);
  const [iniciais, setIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('ATIVO');
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Estados para modais
  const [modalGrafico, setModalGrafico] = useState(false);
  const [pacienteGraficoAtivo, setPacienteGraficoAtivo] = useState(null);
  const [dadosEvolucao, setDadosEvolucao] = useState([]);
  const [escalaGrafico, setEscalaGrafico] = useState('GLASGOW');

  const [modalHistoricoPaciente, setModalHistoricoPaciente] = useState(false);
  const [pacienteHistoricoAtivo, setPacienteHistoricoAtivo] = useState(null);
  const [historicoPacienteList, setHistoricoPacienteList] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      const response = await apiFetch(`${API_URL}/api/pacientes`);
      const data = await response.json();
      if (response.ok) {
        setPacientes(data);
      } else {
        setErro(data.erro || 'Erro ao carregar pacientes.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro de conexão ao carregar pacientes.');
      }
    }
  };

  const handleCadastrar = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    try {
      const response = await apiFetch(`${API_URL}/api/pacientes`, {
        method: 'POST',
        body: JSON.stringify({ iniciais, leito, diagnostico })
      });
      const data = await response.json();
      if (response.ok) {
        setSucesso('Paciente cadastrado com sucesso!');
        setIniciais('');
        setLeito('');
        setDiagnostico('');
        carregarPacientes();
      } else {
        setErro(data.erro || 'Erro ao cadastrar paciente.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro ao cadastrar paciente.');
      }
    }
  };

  const alterarStatus = async (id, novoStatus) => {
    try {
      const response = await apiFetch(`${API_URL}/api/pacientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: novoStatus })
      });
      if (response.ok) {
        carregarPacientes();
      } else {
        const data = await response.json();
        alert(data.erro || 'Erro ao alterar status.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        alert('Erro de conexão.');
      }
    }
  };

  const abrirHistorico = async (pac) => {
    setPacienteHistoricoAtivo(pac);
    try {
      const response = await apiFetch(`${API_URL}/api/avaliacoes/paciente/${pac._id}`);
      const data = await response.json();
      if (response.ok) {
        setHistoricoPacienteList(Array.isArray(data) ? data : []);
        setModalHistoricoPaciente(true);
      } else {
        alert('Erro ao carregar histórico do paciente.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) alert('Erro de conexão.');
    }
  };

  const abrirGrafico = async (pac) => {
    setPacienteGraficoAtivo(pac);
    try {
      const response = await apiFetch(`${API_URL}/api/avaliacoes/paciente/${pac._id}`);
      const data = await response.json();
      if (response.ok) {
        setDadosEvolucao(Array.isArray(data) ? data : []);
        setModalGrafico(true);
      } else {
        alert('Erro ao carregar dados para o gráfico.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) alert('Erro de conexão.');
    }
  };

  const formatarPontuacao = (pontuacao) => {
    if (typeof pontuacao === 'object' && pontuacao !== null) {
      return `Total: ${pontuacao.total} (AO: ${pontuacao.ao}, RV: ${pontuacao.rv}, RM: ${pontuacao.rm})`;
    }
    return pontuacao;
  };

  const pacientesFiltrados = pacientes.filter(p => {
    const matchStatus = filtroStatus === 'TODOS' || p.status === filtroStatus;
    const matchBusca = (p.iniciais && p.iniciais.toLowerCase().includes(busca.toLowerCase())) ||
                       (p.leito && p.leito.toLowerCase().includes(busca.toLowerCase())) ||
                       (p.diagnostico && p.diagnostico.toLowerCase().includes(busca.toLowerCase()));
    return matchStatus && matchBusca;
  });

  // Dados filtrados para o gráfico dinâmico
  const dadosFiltradosGrafico = dadosEvolucao.filter(av => av.escala === escalaGrafico);
  const chartDataDinamico = {
    labels: dadosFiltradosGrafico.map(av => new Date(av.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: `Evolução - ${escalaGrafico}`,
        data: dadosFiltradosGrafico.map(av => {
          if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
            return av.pontuacao.total ?? 0;
          }
          return Number(av.pontuacao) || 0;
        }),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  return (
    <div className="paciente-container">
      <h2>Gestão de Pacientes (Conformidade LGPD)</h2>

      {erro && <div className="error-message">{erro}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}

      <form onSubmit={handleCadastrar} className="paciente-form">
        <h3>Cadastrar Novo Paciente</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Iniciais do Paciente (Ex: A. B. C.):</label>
            <input 
              type="text" 
              value={iniciais} 
              onChange={(e) => setIniciais(e.target.value)} 
              placeholder="Ex: J. M. S." 
              required 
            />
          </div>
          <div className="form-group">
            <label>Leito / Unidade:</label>
            <input 
              type="text" 
              value={leito} 
              onChange={(e) => setLeito(e.target.value)} 
              placeholder="Ex: UTI 02" 
              required 
            />
          </div>
        </div>
        <div className="form-group">
          <label>Diagnóstico / Hipótese Neurológica:</label>
          <input 
            type="text" 
            value={diagnostico} 
            onChange={(e) => setDiagnostico(e.target.value)} 
            placeholder="Ex: AVE Isquêmico Agudo" 
            required 
          />
        </div>
        <button type="submit" className="btn-primary">Cadastrar Paciente</button>
      </form>

      <div className="pacientes-filtro">
        <div className="form-group" style={{ flex: 1, margin: 0 }}>
          <label>Status:</label>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="ATIVO">Ativos em Atendimento</option>
            <option value="ALTA">Com Alta / Inativos</option>
            <option value="TODOS">Todos</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 2, margin: 0 }}>
          <label>Pesquisar:</label>
          <input 
            type="text" 
            placeholder="Filtrar por iniciais, leito ou diagnóstico..." 
            value={busca} 
            onChange={(e) => setBusca(e.target.value)} 
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="pacientes-table">
          <thead>
            <tr>
              <th>Iniciais</th>
              <th>Leito</th>
              <th>Diagnóstico</th>
              <th>Status</th>
              <th>Ações de Atendimento & SAE</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Nenhum paciente encontrado.
                </td>
              </tr>
            ) : (
              pacientesFiltrados.map((pac) => (
                <tr key={pac._id}>
                  <td><strong>{pac.iniciais}</strong></td>
                  <td>{pac.leito}</td>
                  <td>{pac.diagnostico}</td>
                  <td>
                    <span className={`badge ${pac.status === 'ATIVO' ? 'ativo' : 'alta'}`}>
                      {pac.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {pac.status === 'ATIVO' && (
                      <button className="btn-select" onClick={() => onSelecionarPaciente(pac)}>
                        ⚡ Atender / Escalas
                      </button>
                    )}
                    <button className="btn-historico" onClick={() => abrirHistorico(pac)}>
                      📁 Prontuários
                    </button>
                    <button className="btn-historico" onClick={() => abrirGrafico(pac)} style={{ background: '#0284c7' }}>
                      📈 Gráfico
                    </button>
                    <button 
                      className="btn-historico" 
                      onClick={async () => {
                        try {
                          const response = await apiFetch(`${API_URL}/api/avaliacoes/paciente/${pac._id}`);
                          const dadosAvaliacoes = await response.json();
                          if (response.ok) {
                            const canvasEl = document.querySelector('canvas');
                            exportarProntuarioPDF(pac, Array.isArray(dadosAvaliacoes) ? dadosAvaliacoes : [], usuario, canvasEl, false);
                          } else {
                            alert('Erro ao carregar avaliações para o PDF.');
                          }
                        } catch (err) {
                          alert('Erro de conexão ao gerar PDF.');
                        }
                      }}
                      style={{ background: '#7c3aed' }}
                    >
                      📄 PDF
                    </button>
                    {pac.status === 'ATIVO' ? (
                      <button className="btn-alta" onClick={() => alterarStatus(pac._id, 'ALTA')}>
                        Dar Alta
                      </button>
                    ) : (
                      <button className="btn-reativar" onClick={() => alterarStatus(pac._id, 'ATIVO')}>
                        Reativar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE HISTÓRICO DE PRONTUÁRIOS --- */}
      {modalHistoricoPaciente && pacienteHistoricoAtivo && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2>Evolução Clínica e Prontuários</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Paciente: <strong>{pacienteHistoricoAtivo.iniciais}</strong> | Leito: <strong>{pacienteHistoricoAtivo.leito}</strong>
                </p>
              </div>
              <button 
                onClick={() => setModalHistoricoPaciente(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-color)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {historicoPacienteList.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Nenhuma avaliação registrada para este paciente.</p>
              ) : (
                historicoPacienteList.map((av) => {
                  const isGrave = av.classificacao?.toLowerCase().includes('alto') || av.classificacao?.toLowerCase().includes('grave') || av.classificacao?.toLowerCase().includes('muito alto');
                  return (
                    <div 
                      key={av._id || Math.random()} 
                      style={{ 
                        background: 'var(--bg-color)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-md)', 
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ background: 'var(--accent-color)', color: '#fff', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: '700', fontSize: '0.8rem' }}>
                            {av.escala}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {new Date(av.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <span className={`badge`} style={{ backgroundColor: isGrave ? '#fee2e2' : '#f1f5f9', color: isGrave ? '#b91c1c' : '#334155', border: '1px solid var(--border-color)' }}>
                          {av.classificacao || 'Registrado'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <div><strong>Pontuação:</strong> {formatarPontuacao(av.pontuacao)}</div>
                        <div><strong>Avaliador:</strong> {av.avaliadorNome || 'Profissional'} (COREN: {av.avaliadorCoren || 'N/A'})</div>
                      </div>

                      {av.textoProntuario && (
                        <div style={{ background: 'var(--card-bg)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem', whiteSpace: 'pre-wrap', color: 'var(--text-color)' }}>
                          {av.textoProntuario}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                        <button 
                          className="btn-copiar-pill"
                          onClick={() => {
                            navigator.clipboard.writeText(av.textoProntuario || `Escala: ${av.escala} - Pontuação: ${JSON.stringify(av.pontuacao)}`);
                            alert('Prontuário copiado para a área de transferência!');
                          }}
                        >
                          📋 Copiar Prontuário
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button 
                onClick={() => {
                  const canvasEl = document.querySelector('canvas');
                  exportarProntuarioPDF(pacienteHistoricoAtivo, historicoPacienteList, usuario, canvasEl, true);
                }}
                className="btn-primary"
                style={{ marginRight: '1rem', width: 'auto', display: 'inline-block' }}
              >
                📥 Exportar Prontuário Detalhado em PDF
              </button>
              <button className="btn-logout" onClick={() => setModalHistoricoPaciente(false)} style={{ background: 'var(--text-muted)' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE GRÁFICO --- */}
      {modalGrafico && pacienteGraficoAtivo && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2>Evolução Gráfica</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Paciente: <strong>{pacienteGraficoAtivo.iniciais}</strong> | Leito: <strong>{pacienteGraficoAtivo.leito}</strong>
                </p>
              </div>
              <button onClick={() => setModalGrafico(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-color)' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Selecione a Escala:</label>
              <select 
                value={escalaGrafico} 
                onChange={(e) => setEscalaGrafico(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)' }}
              >
                <option value="GLASGOW">Glasgow</option>
                <option value="BRADEN">Braden</option>
                <option value="MORSE">Morse</option>
                <option value="RASS">RASS</option>
              </select>
            </div>

            <div style={{ padding: '1rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {dadosFiltradosGrafico.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>Nenhum registro encontrado para a escala <strong>{escalaGrafico}</strong> neste paciente.</p>
              ) : (
                <Line data={chartDataDinamico} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
              )}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn-logout" onClick={() => setModalGrafico(false)} style={{ background: 'var(--text-muted)' }}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}