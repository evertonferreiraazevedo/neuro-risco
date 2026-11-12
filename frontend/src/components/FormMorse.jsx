import React, { useState, useEffect } from 'react';

function FormMorse({ token, apiFetch, pacienteSelecionado, onAvaliacaoSalva }) {
  const [iniciais, setIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [historicoQuedas, setHistoricoQuedas] = useState(0);
  const [diagnosticoSecundario, setDiagnosticoSecundario] = useState(0);
  const [auxilioDeambulacao, setAuxilioDeambulacao] = useState(0);
  const [terapiaIntravenosa, setTerapiaIntravenosa] = useState(0);
  const [marcha, setMarcha] = useState(0);
  const [estadoMental, setEstadoMental] = useState(0);
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

  const pontuacaoTotal = Number(historicoQuedas) + Number(diagnosticoSecundario) + Number(auxilioDeambulacao) + Number(terapiaIntravenosa) + Number(marcha) + Number(estadoMental);

  const obterClassificacao = (pontos) => {
    if (pontos >= 51) return 'Risco Elevado de Queda';
    if (pontos >= 25 && pontos <= 50) return 'Risco Moderado de Queda';
    return 'Risco Baixo de Queda';
  };

  const gerarTextoProntuario = (pontos, classif) => {
    return `AVALIAÇÃO DE ESCALA DE MORSE (RISCO DE QUEDA)
Paciente: ${iniciais} | Leito: ${leito}
Pontuação Total: ${pontos}
Classificação: ${classif}
Conduta SAE: Sinalização de leito com placa de risco de queda, grades elevadas permanentemente, orientação ao paciente e acompanhantes quanto à restrição de deambulação sem auxílio.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!iniciais || !leito) {
      setErro('Iniciais e leito são obrigatórios.');
      return;
    }

    const classificacao = obterClassificacao(pontuacaoTotal);
    const textoProntuario = gerarTextoProntuario(pontuacaoTotal, classificacao);

    const payload = {
      pacienteId: pacienteId || null,
      iniciais,
      leito,
      escala: 'MORSE',
      pontuacao: {
        total: pontuacaoTotal,
        historicoQuedas: Number(historicoQuedas),
        diagnosticoSecundario: Number(diagnosticoSecundario),
        auxilioDeambulacao: Number(auxilioDeambulacao),
        terapiaIntravenosa: Number(terapiaIntravenosa),
        marcha: Number(marcha),
        estadoMental: Number(estadoMental)
      },
      classificacao,
      condutasSae: [
        'Sinalização de risco de queda no leito',
        'Manutenção das grades elevadas',
        'Orientação rigorosa ao paciente e acompanhante'
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
        setMensagem('Avaliação de Morse salva com sucesso.');
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
      <h2>Escala de Morse (Risco de Quedas)</h2>
      
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
          <label>Histórico de Quedas (Recente ou prévia)</label>
          <select value={historicoQuedas} onChange={(e) => setHistoricoQuedas(Number(e.target.value))}>
            <option value={25}>Sim (25 pontos)</option>
            <option value={0}>Não (0 pontos)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Diagnóstico Secundário (Mais de um diagnóstico médico)</label>
          <select value={diagnosticoSecundario} onChange={(e) => setDiagnosticoSecundario(Number(e.target.value))}>
            <option value={15}>Sim (15 pontos)</option>
            <option value={0}>Não (0 pontos)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Auxílio na Deambulação</label>
          <select value={auxilioDeambulacao} onChange={(e) => setAuxilioDeambulacao(Number(e.target.value))}>
            <option value={30}>Nenhum / Acamado / Cadeira de rodas (0 pontos)</option>
            <option value={15}>Muletas / Bengala / Andador (15 pontos)</option>
            <option value={30}>Mobiliário / Paredes (30 pontos)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Terapia Endovenosa / Heparinizado (Dispositivo endovenoso em uso)</label>
          <select value={terapiaIntravenosa} onChange={(e) => setTerapiaIntravenosa(Number(e.target.value))}>
            <option value={20}>Sim (20 pontos)</option>
            <option value={0}>Não (0 pontos)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Marcha</label>
          <select value={marcha} onChange={(e) => setMarcha(Number(e.target.value))}>
            <option value={0}>Normal / Acamado / Imóvel (0 pontos)</option>
            <option value={10}>Fraca / Degenerativa (10 pontos)</option>
            <option value={20}>Comprometida / Acidentada (20 pontos)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Estado Mental (Consciência da própria capacidade)</label>
          <select value={estadoMental} onChange={(e) => setEstadoMental(Number(e.target.value))}>
            <option value={0}>Orientado quanto às próprias capacidades (0 pontos)</option>
            <option value={15}>Superestima capacidade / Esquece limitações (15 pontos)</option>
          </select>
        </div>

        <div className="resultado-box">
          <h3>Resultado: {pontuacaoTotal} pontos</h3>
          <p><strong>Classificação:</strong> {obterClassificacao(pontuacaoTotal)}</p>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Avaliação'}
        </button>
      </form>
    </div>
  );
}

export default FormMorse;