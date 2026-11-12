import React, { useState } from 'react';

export default function FormBraden({ token, apiFetch, usuario, pacienteSelecionado }) {
  const [sensorial, setSensorial] = useState('');
  const [umidade, setUmidade] = useState('');
  const [atividade, setAtividade] = useState('');
  const [mobilidade, setMobilidade] = useState('');
  const [nutricao, setNutricao] = useState('');
  const [friccao, setFriccao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  const validar = () => sensorial !== '' && umidade !== '' && atividade !== '' && mobilidade !== '' && nutricao !== '' && friccao !== '';

  const calcular = () => {
    const total = Number(sensorial) + Number(umidade) + Number(atividade) + Number(mobilidade) + Number(nutricao) + Number(friccao);
    let classificacao = 'Baixo Risco (15-23)';
    if (total <= 9) classificacao = 'Risco Muito Alto (≤ 9)';
    else if (total <= 12) classificacao = 'Risco Alto (10-12)';
    else if (total <= 14) classificacao = 'Risco Moderado (13-14)';
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
      setErro('Preencha todos os parâmetros de Braden.');
      return;
    }

    const { pontuacao, classificacao } = calcular();
    const textoProntuario = `[SAE - BRADEN]\nPaciente: ${pacienteSelecionado.iniciais} | Leito: ${pacienteSelecionado.leito}\nPontuação Total: ${pontuacao}\nClassificação: ${classificacao}\nObs: ${observacoes || 'N/A'}\nAvaliador: ${usuario?.nome} (COREN: ${usuario?.coren})`;

    try {
      const response = await apiFetch(`${API_URL}/api/avaliacoes`, {
        method: 'POST',
        body: JSON.stringify({
          pacienteId: pacienteSelecionado._id,
          iniciais: pacienteSelecionado.iniciais,
          leito: pacienteSelecionado.leito,
          escala: 'BRADEN',
          pontuacao,
          classificacao,
          textoProntuario
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSucesso('Avaliação de Braden salva!');
        setSensorial(''); setUmidade(''); setAtividade(''); setMobilidade(''); setNutricao(''); setFriccao(''); setObservacoes('');
      } else {
        setErro(data.erro || 'Erro ao salvar.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) setErro('Erro de conexão.');
    }
  };

  return (
    <div className="form-escala-container">
      <h2>Escala de Braden (Risco de Úlcera por Pressão)</h2>
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
          <label>Percepção Sensorial:</label>
          <select value={sensorial} onChange={(e) => setSensorial(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="4">4 - Totalmente Limitada</option>
            <option value="3">3 - Muito Limitada</option>
            <option value="2">2 - Levemente Limitada</option>
            <option value="1">1 - Nenhuma</option>
          </select>
        </div>

        <div className="form-group">
          <label>Umidade:</label>
          <select value={umidade} onChange={(e) => setUmidade(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="4">4 - Raramente Úmida</option>
            <option value="3">3 - Ocasionalmente Úmida</option>
            <option value="2">2 - Muito Úmida</option>
            <option value="1">1 - Constantemente Úmida</option>
          </select>
        </div>

        <div className="form-group">
          <label>Atividade:</label>
          <select value={atividade} onChange={(e) => setAtividade(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="4">4 - Acamado</option>
            <option value="3">3 - Confinado à cadeira</option>
            <option value="2">2 - Caminha ocasionalmente</option>
            <option value="1">1 - Caminha frequentemente</option>
          </select>
        </div>

        <div className="form-group">
          <label>Mobilidade:</label>
          <select value={mobilidade} onChange={(e) => setMobilidade(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="4">4 - Totalmente Imóvel</option>
            <option value="3">3 - Muito Limitada</option>
            <option value="2">2 - Levemente Limitada</option>
            <option value="1">1 - Sem Limitações</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nutrição:</label>
          <select value={nutricao} onChange={(e) => setNutricao(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="4">4 - Muito Pobre / Nula</option>
            <option value="3">3 - Provavelmente Inadequada</option>
            <option value="2">2 - Adequada</option>
            <option value="1">1 - Excelente</option>
          </select>
        </div>

        <div className="form-group">
          <label>Fricção e Cisalhamento:</label>
          <select value={friccao} onChange={(e) => setFriccao(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="3">3 - Problema Presente</option>
            <option value="2">2 - Problema Potencial</option>
            <option value="1">1 - Nenhum Problema</option>
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