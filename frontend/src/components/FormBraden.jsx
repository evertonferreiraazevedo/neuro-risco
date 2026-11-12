import React, { useState, useEffect } from 'react';

function FormBraden({ token, pacienteSelecionado, onAvaliacaoSalva }) {
  const [iniciais, setIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [sensorial, setSensorial] = useState(4);
  const [umidade, setUmidade] = useState(4);
  const [atividade, setAtividade] = useState(4);
  const [mobilidade, setMobilidade] = useState(4);
  const [nutricao, setNutricao] = useState(4);
  const [friccao, setFriccao] = useState(3);
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

  const pontuacaoTotal = Number(sensorial) + Number(umidade) + Number(atividade) + Number(mobilidade) + Number(nutricao) + Number(friccao);

  const obterClassificacao = (pontos) => {
    if (pontos <= 9) return 'Risco Muito Elevado';
    if (pontos >= 10 && pontos <= 12) return 'Risco Elevado';
    if (pontos >= 13 && pontos <= 14) return 'Risco Moderado';
    if (pontos >= 15 && pontos <= 18) return 'Risco Baixo';
    return 'Sem Risco Significativo';
  };

  const gerarTextoProntuario = (pontos, classif) => {
    return `AVALIAÇÃO DE ESCALA DE BRADEN (RISCO DE ÚLCERA DE PRESSÃO)
Paciente: ${iniciais} | Leito: ${leito}
Pontuação Total: ${pontos}/23
Classificação: ${classif}
Conduta SAE: Mudança de decúbito rigorosa a cada 2 horas, uso de superfícies de suporte redutoras de pressão, hidratação cutânea e inspeção diária da integridade tissular.`;
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
      escala: 'BRADEN',
      pontuacao: {
        total: pontuacaoTotal,
        sensorial: Number(sensorial),
        umidade: Number(umidade),
        atividade: Number(atividade),
        mobilidade: Number(mobilidade),
        nutricao: Number(nutricao),
        friccao: Number(friccao)
      },
      classificacao,
      condutasSae: [
        'Mudança de decúbito rigorosa a cada 2h',
        'Uso de colchão caixa-de-ovo ou pneumático',
        'Hidratação da pele e proteção de proeminências ósseas'
      ],
      textoProntuario
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/avaliacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setMensagem('Avaliação de Braden salva com sucesso.');
        if (onAvaliacaoSalva) onAvaliacaoSalva(data);
      } else {
        setErro(data.erro || 'Erro ao salvar avaliação.');
      }
    } catch (err) {
      setErro('Erro de conexão ao salvar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-escala-container">
      <h2>Escala de Braden (Risco de Lesão por Pressão)</h2>
      
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
          <label>Percepção Sensorial</label>
          <select value={sensorial} onChange={(e) => setSensorial(Number(e.target.value))}>
            <option value={4}>4 - Totalmente Limitada</option>
            <option value={3}>3 - Muito Limitada</option>
            <option value={2}>2 - Levemente Limitada</option>
            <option value={1}>1 - Nenhuma Impairment / Total</option>
          </select>
        </div>

        <div className="form-group">
          <label>Umidade</label>
          <select value={umidade} onChange={(e) => setUmidade(Number(e.target.value))}>
            <option value={4}>4 - Constantemente Úmida</option>
            <option value={3}>3 - Frequentemente Úmida</option>
            <option value={2}>2 - Ocasionalmente Úmida</option>
            <option value={1}>1 - Raramente Úmida</option>
          </select>
        </div>

        <div className="form-group">
          <label>Atividade</label>
          <select value={atividade} onChange={(e) => setAtividade(Number(e.target.value))}>
            <option value={4}>4 - Acamado</option>
            <option value={3}>3 - Confinado à cadeira</option>
            <option value={2}>2 - Ocasionalmente deambula</option>
            <option value={1}>1 - Deambula frequentemente</option>
          </select>
        </div>

        <div className="form-group">
          <label>Mobilidade</label>
          <select value={mobilidade} onChange={(e) => setMobilidade(Number(e.target.value))}>
            <option value={4}>4 - Totalmente Imóvel</option>
            <option value={3}>3 - Muito Limitada</option>
            <option value={2}>2 - Levemente Limitada</option>
            <option value={1}>1 - Sem Limitações</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nutrição</label>
          <select value={nutricao} onChange={(e) => setNutricao(Number(e.target.value))}>
            <option value={4}>4 - Muito Pobre / Nenhuma</option>
            <option value={3}>3 - Provavelmente Inadequada</option>
            <option value={2}>2 - Adequada</option>
            <option value={1}>1 - Excelente</option>
          </select>
        </div>

        <div className="form-group">
          <label>Fricção e Cisalhamento</label>
          <select value={friccao} onChange={(e) => setFriccao(Number(e.target.value))}>
            <option value={3}>3 - Problema Presente</option>
            <option value={2}>2 - Problema Potencial</option>
            <option value={1}>1 - Nenhum Problema Aparente</option>
          </select>
        </div>

        <div className="resultado-box">
          <h3>Resultado: {pontuacaoTotal} / 23</h3>
          <p><strong>Classificação:</strong> {obterClassificacao(pontuacaoTotal)}</p>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Avaliação'}
        </button>
      </form>
    </div>
  );
}

export default FormBraden;