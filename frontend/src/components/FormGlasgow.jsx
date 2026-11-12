import React, { useState } from 'react';

export default function FormGlasgow({ token, apiFetch, usuario, pacienteSelecionado }) {
  const [ao, setAo] = useState('');
  const [rv, setRv] = useState('');
  const [rm, setRm] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  const validar = () => ao !== '' && rv !== '' && rm !== '';

  const calcular = () => {
    const total = Number(ao) + Number(rv) + Number(rm);
    let classificacao = 'Normal / Leve (13-15)';
    if (total <= 8) classificacao = 'Coma / Grave (≤ 8) - UTI / Intubação';
    else if (total <= 12) classificacao = 'Moderado (9-12)';
    return { pontuacao: { total, ao: Number(ao), rv: Number(rv), rm: Number(rm) }, classificacao };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!pacienteSelecionado) {
      setErro('Nenhum paciente selecionado. Selecione um paciente na aba Pacientes.');
      return;
    }
    if (!validar()) {
      setErro('Por favor, selecione todos os parâmetros de Abertura Ocular, Verbal e Motora.');
      return;
    }

    const { pontuacao, classificacao } = calcular();
    const textoProntuario = `[SAE - GLASGOW]\nPaciente: ${pacienteSelecionado.iniciais} | Leito: ${pacienteSelecionado.leito}\nPontuação: Total ${pontuacao.total} (AO:${pontuacao.ao}, RV:${pontuacao.rv}, RM:${pontuacao.rm})\nClassificação: ${classificacao}\nObs: ${observacoes || 'N/A'}\nAvaliador: ${usuario?.nome} (COREN: ${usuario?.coren})`;

    try {
      const response = await apiFetch(`${API_URL}/api/avaliacoes`, {
        method: 'POST',
        body: JSON.stringify({
          pacienteId: pacienteSelecionado._id,
          iniciais: pacienteSelecionado.iniciais,
          leito: pacienteSelecionado.leito,
          escala: 'GLASGOW',
          pontuacao,
          classificacao,
          textoProntuario
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSucesso('Avaliação de Glasgow salva com sucesso!');
        setAo(''); setRv(''); setRm(''); setObservacoes('');
      } else {
        setErro(data.erro || 'Erro ao salvar avaliação.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) setErro('Erro de conexão.');
    }
  };

  return (
    <div className="form-escala-container">
      <h2>Escala de Coma de Glasgow</h2>
      {!pacienteSelecionado ? (
        <div className="error-message">Nenhum paciente selecionado. Vá na aba Pacientes.</div>
      ) : (
        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p><strong>Paciente:</strong> {pacienteSelecionado.iniciais} | <strong>Leito:</strong> {pacienteSelecionado.leito}</p>
        </div>
      )}

      {erro && <div className="error-message">{erro}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Abertura Ocular (AO):</label>
          <select value={ao} onChange={(e) => setAo(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="4">4 - Espontânea</option>
            <option value="3">3 - À voz</option>
            <option value="2">2 - À dor</option>
            <option value="1">1 - Ausente</option>
          </select>
        </div>

        <div className="form-group">
          <label>Resposta Verbal (RV):</label>
          <select value={rv} onChange={(e) => setRv(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="5">5 - Orientado</option>
            <option value="4">4 - Confuso</option>
            <option value="3">3 - Palavras inapropriadas</option>
            <option value="2">2 - Sons incompreensíveis</option>
            <option value="1">1 - Ausente</option>
          </select>
        </div>

        <div className="form-group">
          <label>Resposta Motora (RM):</label>
          <select value={rm} onChange={(e) => setRm(e.target.value)} required>
            <option value="" disabled>-- Selecione --</option>
            <option value="6">6 - Obedece comandos</option>
            <option value="5">5 - Localiza dor</option>
            <option value="4">4 - Retirada à dor</option>
            <option value="3">3 - Flexão anormal (decorticação)</option>
            <option value="2">2 - Extensão anormal (descerebração)</option>
            <option value="1">1 - Ausente</option>
          </select>
        </div>

        {validar() && (
          <div className="resultado-box">
            <h3>Resultado</h3>
            <p><strong>Total:</strong> {calcular().pontuacao.total} | <strong>Classificação:</strong> {calcular().classificacao}</p>
          </div>
        )}

        <div className="form-group">
          <label>Observações Clínicas:</label>
          <textarea rows="3" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Detalhes adicionais..." />
        </div>

        <button type="submit" className="btn-primary" disabled={!pacienteSelecionado}>Salvar Avaliação</button>
      </form>
    </div>
  );
}