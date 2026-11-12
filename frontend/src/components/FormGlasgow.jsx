import React, { useState, useEffect } from 'react';

function FormGlasgow({ token, apiFetch, pacienteSelecionado, onAvaliacaoSalva }) {
  const [iniciais, setIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [pacienteId, setPacienteId] = useState('');
  const [ocular, setOcular] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motora, setMotora] = useState(6);
  const [isPediatrico, setIsPediatrico] = useState(false);
  const [respostaOcularPed, setRespostaOcularPed] = useState(4);
  const [respostaVerbalPed, setRespostaVerbalPed] = useState(5);
  const [respostaMotoraPed, setRespostaMotoraPed] = useState(6);
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

  const calcularPontuacao = () => {
    if (isPediatrico) {
      return Number(respostaOcularPed) + Number(respostaVerbalPed) + Number(respostaMotoraPed);
    }
    return Number(ocular) + Number(verbal) + Number(motora);
  };

  const pontuacaoTotal = calcularPontuacao();

  const obterClassificacao = (pontos) => {
    if (pontos >= 13 && pontos <= 15) return 'Traumatismo Cranioencefálico (TCE) Leve';
    if (pontos >= 9 && pontos <= 12) return 'Traumatismo Cranioencefálico (TCE) Moderado';
    return 'Traumatismo Cranioencefálico (TCE) Grave';
  };

  const gerarTextoProntuario = (pontos, classif) => {
    const tipo = isPediatrico ? 'Glasgow-Pediátrica' : 'Glasgow';
    return `AVALIAÇÃO DE ESCALA DE COMA DE GLASGOW (${tipo})
Paciente: ${iniciais} | Leito: ${leito}
Pontuação Total: ${pontos}/15
Classificação: ${classif}
Conduta SAE: Monitorização neurológica rigorosa de pupilas e nível de consciência, manutenção da perfusão cerebral e cabeceira elevada a 30° conforme protocolo de neurointensivismo.`;
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
      escala: 'GLASGOW',
      pontuacao: {
        total: pontuacaoTotal,
        ocular: isPediatrico ? respostaOcularPed : ocular,
        verbal: isPediatrico ? respostaVerbalPed : verbal,
        motora: isPediatrico ? respostaMotoraPed : motora,
        pediatrico: isPediatrico
      },
      classificacao,
      condutasSae: [
        'Monitorização neurológica rigorosa',
        'Avaliação pupilar horária',
        'Manutenção de cabeceira a 30°'
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
        setMensagem('Avaliação de Glasgow salva com sucesso.');
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
      <h2>Escala de Coma de Glasgow</h2>
      
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

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={isPediatrico}
              onChange={(e) => setIsPediatrico(e.target.checked)}
            />
            Utilizar Escala Glasgow Pediátrica (Glasgow-P)
          </label>
        </div>

        {!isPediatrico ? (
          <>
            <div className="form-group">
              <label>Abertura Ocular (AO)</label>
              <select value={ocular} onChange={(e) => setOcular(Number(e.target.value))}>
                <option value={4}>4 - Espontânea</option>
                <option value={3}>3 - Ao chamado verbal</option>
                <option value={2}>2 - À estimulação dolorosa</option>
                <option value={1}>1 - Ausente</option>
              </select>
            </div>

            <div className="form-group">
              <label>Resposta Verbal (RV)</label>
              <select value={verbal} onChange={(e) => setVerbal(Number(e.target.value))}>
                <option value={5}>5 - Orientado</option>
                <option value={4}>4 - Confuso</option>
                <option value={3}>3 - Palavras inapropriadas</option>
                <option value={2}>2 - Sons incompreensíveis</option>
                <option value={1}>1 - Ausente</option>
              </select>
            </div>

            <div className="form-group">
              <label>Resposta Motora (RM)</label>
              <select value={motora} onChange={(e) => setMotora(Number(e.target.value))}>
                <option value={6}>6 - Obedece a comandos</option>
                <option value={5}>5 - Localiza dor</option>
                <option value={4}>4 - Flexão normal (retirada)</option>
                <option value={3}>3 - Flexão anormal (decorticação)</option>
                <option value={2}>2 - Extensão anormal (cerebração)</option>
                <option value={1}>1 - Ausente</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Abertura Ocular Pediátrica</label>
              <select value={respostaOcularPed} onChange={(e) => setRespostaOcularPed(Number(e.target.value))}>
                <option value={4}>4 - Espontânea</option>
                <option value={3}>3 - À voz</option>
                <option value={2}>2 - À dor</option>
                <option value={1}>1 - Ausente</option>
              </select>
            </div>

            <div className="form-group">
              <label>Resposta Verbal Pediátrica</label>
              <select value={respostaVerbalPed} onChange={(e) => setRespostaVerbalPed(Number(e.target.value))}>
                <option value={5}>5 - Sorri, orientado a sons, interage</option>
                <option value={4}>4 - Choro consolável, irritável</option>
                <option value={3}>3 - Choro inapropriado / gemido</option>
                <option value={2}>2 - Agitação / resposta inepta à dor</option>
                <option value={1}>1 - Ausente</option>
              </select>
            </div>

            <div className="form-group">
              <label>Resposta Motora Pediátrica</label>
              <select value={respostaMotoraPed} onChange={(e) => setRespostaMotoraPed(Number(e.target.value))}>
                <option value={6}>6 - Movimentos espontâneos normais</option>
                <option value={5}>5 - Retirada ao toque / localiza dor</option>
                <option value={4}>4 - Retirada à dor (flexão normal)</option>
                <option value={3}>3 - Decorticação à dor</option>
                <option value={2}>2 - Descerebração à dor</option>
                <option value={1}>1 - Ausente</option>
              </select>
            </div>
          </>
        )}

        <div className="resultado-box">
          <h3>Resultado: {pontuacaoTotal} / 15</h3>
          <p><strong>Classificação:</strong> {obterClassificacao(pontuacaoTotal)}</p>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Avaliação'}
        </button>
      </form>
    </div>
  );
}

export default FormGlasgow;