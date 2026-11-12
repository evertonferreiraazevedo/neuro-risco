import React, { useState } from 'react';

export default function AvaliacaoForm({ token, apiFetch, usuario, pacienteSelecionado }) {
  const [escala, setEscala] = useState('GLASGOW');
  const [pontos, setPontos] = useState(15);
  const [observacoes, setObservacoes] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!pacienteSelecionado) {
      setErro('Nenhum paciente selecionado. Vá na aba "Pacientes" e selecione um paciente.');
      return;
    }

    try {
      const response = await apiFetch(`${API_URL}/api/avaliacoes`, {
        method: 'POST',
        body: JSON.stringify({
          pacienteId: pacienteSelecionado._id,
          iniciais: pacienteSelecionado.iniciais,
          leito: pacienteSelecionado.leito,
          escala: escala,
          pontuacao: Number(pontos),
          classificacao: Number(pontos) <= 8 ? 'Grave / Alto Risco' : 'Estável',
          textoProntuario: `Paciente ${pacienteSelecionado.iniciais} avaliado na escala ${escala}. Pontuação: ${pontos}. Obs: ${observacoes || 'N/A'}`
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSucesso('Avaliação salva com sucesso!');
        setObservacoes('');
      } else {
        setErro(data.erro || 'Erro ao salvar avaliação.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro de conexão ao salvar avaliação.');
      }
    }
  };

  return (
    <div className="form-escala-container">
      <h2>Avaliação de Escalas Clínicas (SAE)</h2>

      {!pacienteSelecionado ? (
        <div className="error-message">
          Nenhum paciente selecionado no momento. Por favor, acesse a aba <strong>Pacientes</strong> e clique em "Selecionar" no leito desejado.
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p><strong>Paciente Ativo:</strong> {pacienteSelecionado.iniciais} | <strong>Leito:</strong> {pacienteSelecionado.leito}</p>
          <p><strong>Diagnóstico:</strong> {pacienteSelecionado.diagnostico}</p>
        </div>
      )}

      {erro && <div className="error-message">{erro}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Selecione a Escala:</label>
          <select value={escala} onChange={(e) => setEscala(e.target.value)}>
            <option value="GLASGOW">Escala de Coma de Glasgow</option>
            <option value="BRADEN">Escala de Braden (Risco de Úlcera por Pressão)</option>
            <option value="MORSE">Escala de Morse (Risco de Queda)</option>
            <option value="RASS">Escala RASS (Agitação e Sedação)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Pontuação Total:</label>
          <input 
            type="number" 
            value={pontos} 
            onChange={(e) => setPontos(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Observações Clínicas / Condutas SAE:</label>
          <textarea 
            rows="4"
            value={observacoes} 
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Digite detalhes complementares da avaliação neurológica..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)' }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={!pacienteSelecionado}>
          Salvar Avaliação e Gerar Prontuário
        </button>
      </form>
    </div>
  );
}