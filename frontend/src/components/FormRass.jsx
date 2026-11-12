import React, { useState, useEffect } from 'react';

function FormRass({ token, apiFetch, pacienteSelecionado, onAvaliacaoSalva }) {
  const [iniciais, setIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [pontos, setPontos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  useEffect(() => {
    if (pacienteSelecionado) {
      setIniciais(pacienteSelecionado.iniciais || '');
      setLeito(pacienteSelecionado.leito || '');
      setPacienteId(pacienteSelecionado._id || '');
    }
  }, [pacienteSelecionado]);

  const obterDescricaoRass = (val) => {
    const v = Number(val);
    switch (v) {
      case 4: return 'Combativo (Violento, perigo imediato para a equipe)';
      case 3: return 'Muito Agitado (Puxa tubos ou cateteres, agressivo)';
      case 2: return 'Agitado (Movimentos frequentes sem propósito, luta contra ventilador)';
      case 1: return 'Inquieto (Ansioso, mas movimentos não agressivos ou vigorosos)';
      case 0: return 'Alerta e Calmo';
      case -1: return 'Sonolento (Não totalmente alerta, mas mantém despertar ao chamado verbal > 10s)';
      case -2: return 'Sedação Leve (Desperta brevemente à voz com contato visual < 10s)';
      case -3: return 'Sedação Moderada (Movimenta-se ou abre os olhos à voz, sem contato visual)';
      case -4: return 'Sedação Profunda (Sem resposta à voz, mas movimenta-se ao estímulo físico)';
      case -5: return 'Não Responde (Sem resposta à voz ou estímulo físico)';
      default: return 'Alerta e Calmo';
    }
  };

  const obterClassificacao = (val) => {
    const v = Number(val);
    if (v > 0) return 'Agitação Psicomotora';
    if (v < 0) return 'Nível de Sedação / Depressão do Consciência';
    return 'Neurologicamente Estável / Alerta';
  };

  const gerarTextoProntuario = (val, desc, classif) => {
    return `AVALIAÇÃO DE ESCALA RASS (RICHMOND AGITATION-SEDATION SCALE)
Paciente: ${iniciais} | Leito: ${leito}
Pontuação: ${val > 0 ? `+${val}` : val} (${desc})
Classificação: ${classif}
Conduta SAE: Monitorização rigorosa de infusão de sedoanalgesia (se aplicável), vigilância de sinais de delirium ou agitação e manutenção de parâmetros ventilatórios seguros.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!iniciais || !leito) {
      setErro('Iniciais e leito são obrigatórios.');
      return;
    }

    const desc = obterDescricaoRass(pontos);
    const classificacao = obterClassificacao(pontos);
    const textoProntuario = gerarTextoProntuario(pontos, desc, classificacao);

    const payload = {
      pacienteId: pacienteId || null,
      iniciais,
      leito,
      escala: 'RASS',
      pontuacao: {
        total: Number(pontos),
        descricao: desc
      },
      classificacao,
      condutasSae: [
        'Monitorização de sedoanalgesia',
        'Avaliação horária de agitação/sedação',
        'Prevenção de extubação acidental'
      ],
      textoProntuario
    };

    try {
      setLoading(true);
      const response = await apiFetch(`${API_URL}/api/avaliacoes`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setMensagem('Avaliação RASS salva com sucesso.');
        if (onAvaliacaoSalva) onAvaliacaoSalva(data);
      } else {
        setErro(data.erro || 'Erro ao salvar avaliação.');
      }
    } catch (err) {
      if (!err.message.includes('Sessão expirada')) {
        setErro('Erro de conexão ao salvar avaliação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-escala-container">
      <h2>Escala RASS (Richmond Agitation-Sedation Scale)</h2>
      
      {erro && <div className="error-message">{erro}</div>}
      {mensagem && <div className="success-message">{mensagem}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Iniciais do Paciente</label>
            <input
              type="text"
              value={iniciais}
              onChange={(e) => setIniciais(e.target.value)}
              placeholder="Ex: J.M.S."
              required
            />
          </div>
          <div className="form-group">
            <label>Leito</label>
            <input
              type="text"
              value={leito}
              onChange={(e) => setLeito(e.target.value)}
              placeholder="Ex: UTI-01"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Pontuação RASS</label>
          <select value={pontos} onChange={(e) => setPontos(Number(e.target.value))}>
            <option value={4}>+4 Combativo</option>
            <option value={3}>+3 Muito Agitado</option>
            <option value={2}>+2 Agitado</option>
            <option value={1}>+1 Inquieto</option>
            <option value={0}> 0 Alerta e Calmo</option>
            <option value={-1}>-1 Sonolento</option>
            <option value={-2}>-2 Sedação Leve</option>
            <option value={-3}>-3 Sedação Moderada</option>
            <option value={-4}>-4 Sedação Profunda</option>
            <option value={-5}>-5 Não Responde</option>
          </select>
        </div>

        <div className="resultado-box">
          <h3>Resultado: {pontos > 0 ? `+${pontos}` : pontos}</h3>
          <p><strong>Descrição:</strong> {obterDescricaoRass(pontos)}</p>
          <p><strong>Classificação:</strong> {obterClassificacao(pontos)}</p>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Avaliação'}
        </button>
      </form>
    </div>
  );
}

export default FormRass;