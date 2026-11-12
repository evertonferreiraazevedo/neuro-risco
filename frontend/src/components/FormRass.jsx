import React, { useState } from 'react';

export default function FormRass({ token, apiFetch, usuario, pacienteSelecionado }) {
  const [rassValor, setRassValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  const validar = () => rassValor !== '';

  const calcular = () => {
    const val = Number(rassValor);
    let classificacao = 'Alerta e Calmo';
    if (val >= 3) classificacao = 'Muito Agitado / Combativo';
    else if (val === 2) classificacao = 'Agitado';
    else if (val === 1) classificacao = 'Inquieto';
    else if (val === -1) classificacao = 'Sonolento';
    else if (val <= -2) classificacao = 'Sedado / Resposta Leve a Voz';
    return { pontuacao: val, classificacao };
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
      setErro('Selecione o nível RASS.');
      return;
    }

    const { pontuacao, classificacao } = calcular();
    const textoProntuario = `[SAE - RASS]\nPaciente: ${pacienteSelecionado.iniciais} | Leito: ${pacienteSelecionado.leito}\nPontuação RASS: ${pontuacao}\nClassificação: ${classificacao}\nObs: ${observacoes || 'N/A'}\nAvaliador: ${usuario?.nome} (COREN: ${usuario?.coren})`;

    try {
      const response = await apiFetch(`${API_URL}/api/avaliacoes`, {
        method: 'POST',
        body: JSON.stringify({
          pacienteId: pacienteSelecionado._id,
          iniciais: pacienteSelecionado.iniciais,
          leito: pacienteSelecionado.leito,
          escala: 'RASS',
          pontuacao,
          classificacao,
          textoProntuario
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSucesso('Avaliação RASS salva!');
        setRassValor(''); setObservacoes('');
      } else {
        setErro(data.erro || 'Erro ao salvar.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) setErro('Erro de conexão.');
    }
  };

  return (
    <div className="form-escala-container">
      <h2>Escala RASS (Agitação e Sedação)</h2>
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
          <label>Nível RASS:</label>
          <select value={rassValor} onChange={(e) => setRassValor(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="4">+4 Combativo (Violento, perigo imediato)</option>
            <option value="3">+3 Muito Agitado (Puxa tubos/cateteres)</option>
            <option value="2">+2 Agitado (Movimentos frequentes não coordenados)</option>
            <option value="1">+1 Inquieto (Ansioso, sem agressividade)</option>
            <option value="0">0 Alerta e Calmo</option>
            <option value="-1">-1 Sonolento (Desperta à voz &gt; 10s)</option>
            <option value="-2">-2 Sedação Leve (Desperta à voz brevemente &lt; 10s)</option>
            <option value="-3">-3 Sedação Moderada (Movimento ou abertura ocular à voz)</option>
            <option value="-4">-4 Sedação Profunda (Sem resposta à voz, movimento à dor)</option>
            <option value="-5">-5 Sem Resposta (Sem resposta à voz ou dor)</option>
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