import React, { useState } from 'react';

export default function FormMorse({ token, apiFetch, usuario, pacienteSelecionado }) {
  const [quedas, setQuedas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [auxilio, setAuxilio] = useState('');
  const [ev, setEv] = useState('');
  const [marcha, setMarcha] = useState('');
  const [consciencia, setConsciencia] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  const validar = () => quedas !== '' && diagnostico !== '' && auxilio !== '' && ev !== '' && marcha !== '' && consciencia !== '';

  const calcular = () => {
    const total = Number(quedas) + Number(diagnostico) + Number(auxilio) + Number(ev) + Number(marcha) + Number(consciencia);
    let classificacao = 'Baixo Risco (0-24)';
    if (total >= 45) classificacao = 'Alto Risco de Queda (≥ 45)';
    else if (total >= 25) classificacao = 'Risco Moderado (25-44)';
    return { pontuacao: total, classificacao };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!pacienteSelecionado) {
      setErro('Nenhum paciente selecionado.');
      return;
    }
    if (!validar()) {
      setErro('Preencha todos os parâmetros da Escala de Morse.');
      return;
    }

    const { pontuacao, classificacao } = calcular();
    const textoProntuario = `[SAE - MORSE]\nPaciente: ${pacienteSelecionado.iniciais} | Leito: ${pacienteSelecionado.leito}\nPontuação Total: ${pontuacao}\nClassificação: ${classificacao}\nObs: ${observacoes || 'N/A'}\nAvaliador: ${usuario?.nome} (COREN: ${usuario?.coren})`;

    try {
      const response = await apiFetch(`${API_URL}/api/avaliacoes`, {
        method: 'POST',
        body: JSON.stringify({
          pacienteId: pacienteSelecionado._id,
          iniciais: pacienteSelecionado.iniciais,
          leito: pacienteSelecionado.leito,
          escala: 'MORSE',
          pontuacao,
          classificacao,
          textoProntuario
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSucesso('Avaliação de Morse salva!');
        setQuedas(''); setDiagnostico(''); setAuxilio(''); setEv(''); setMarcha(''); setConsciencia(''); setObservacoes('');
      } else {
        setErro(data.erro || 'Erro ao salvar.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) setErro('Erro de conexão.');
    }
  };

  return (
    <div className="form-escala-container">
      <h2>Escala de Morse (Risco de Queda)</h2>
      {!pacienteSelecionado ? (
        <div className="error-message">Selecione um paciente na aba Pacientes.</div>
      ) : (
        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p><strong>Paciente:</strong> {pacienteSelecionado.iniciais} | <strong>Leito:</strong> {pacienteSelecionado.leito}</p>
        </div>
      )}

      {erro && <div className="error-message">{erro}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Histórico de Quedas Recentes:</label>
          <select value={quedas} onChange={(e) => setQuedas(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="25">Sim (25 pts)</option>
            <option value="0">Não (0 pts)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Diagnóstico Secundário:</label>
          <select value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="15">Sim (15 pts)</option>
            <option value="0">Não (0 pts)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Auxílio na Marcha:</label>
          <select value={auxilio} onChange={(e) => setAuxilio(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="30">Muletas / Bengala / Andador (30 pts)</option>
            <option value="15">Mobiliário / Apoio em paredes (15 pts)</option>
            <option value="0">Nenhum / Acamado / Cadeira de rodas (0 pts)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Terapia Endovenosa (EV):</label>
          <select value={ev} onChange={(e) => setEv(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="20">Sim (20 pts)</option>
            <option value="0">Não (0 pts)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Marcha:</label>
          <select value={marcha} onChange={(e) => setMarcha(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="20">Comprometida (20 pts)</option>
            <option value="10">Fraca / Instável (10 pts)</option>
            <option value="0">Normal / Acamado (0 pts)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Estado Mental:</label>
          <select value={consciencia} onChange={(e) => setConsciencia(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="15">Superestima capacidade / Esquece limitações (15 pts)</option>
            <option value="0">Orientado / Consciência das limitações (0 pts)</option>
          </select>
        </div>

        {validar() && (
          <div className="resultado-box">
            <h3>Resultado</h3>
            <p><strong>Pontuação:</strong> {calcular().pontuacao} | <strong>Classificação:</strong> {calcular().classificacao}</p>
          </div>
        )}

        <div className="form-group">
          <label>Observações:</label>
          <textarea rows="3" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </div>

        <button type="submit" className="btn-primary" disabled={!pacienteSelecionado}>Salvar Avaliação</button>
      </form>
    </div>
  );
}