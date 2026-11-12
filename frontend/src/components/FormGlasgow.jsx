import { useState } from 'react';

export default function FormGlasgow({ onSalvar }) {
  const [pacienteIniciais, setPacienteIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [ocular, setOcular] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motora, setMotora] = useState(6);
  const [pupila, setPupila] = useState(0);
  const [observacoes, setObservacoes] = useState('');

  const pontuacaoFinal = (Number(ocular) + Number(verbal) + Number(motora)) - Number(pupila);

  const obterClassificacao = (nota) => {
    if (nota <= 8) return { texto: 'Grave / Coma (Risco Critico)', classe: 'alto-risco', condutas: ['Avaliar via aerea definitiva (IOT)', 'Monitorizacao neurologica horaria', 'Cabeceira a 30 graus e alinhamento cervical', 'Comunicar equipe medica imediatamente'] };
    if (nota <= 12) return { texto: 'Moderado (Risco Elevado)', classe: 'moderado-risco', condutas: ['Reavaliar nivel de consciencia e pupilas a cada 2h', 'Checar protocolo de disfagia antes de dieta oral', 'Grades elevadas e prevencao de quedas'] };
    return { texto: 'Leve (Baixo Risco)', classe: 'baixo-risco', condutas: ['Manter vigilancia neurologica de rotina', 'Orientar sobre risco de quedas'] };
  };

  const analise = obterClassificacao(pontuacaoFinal);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar({
      pacienteIniciais,
      leito,
      tipoEscala: 'GLASGOW_P',
      respostas: { ocular: Number(ocular), verbal: Number(verbal), motora: Number(motora), pupila: Number(pupila) },
      pontuacaoTotal: pontuacaoFinal,
      classificacaoRisco: analise.texto,
      condutasSugeridas: analise.condutas,
      observacoes
    });
    setPacienteIniciais(''); setLeito(''); setObservacoes('');
  };

  return (
    <div className="card">
      <h2>Escala de Coma de Glasgow com Resposta Pupilar (ECG-P)</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div><label>Iniciais do Paciente:</label><input type="text" placeholder="Ex: M.S.A." value={pacienteIniciais} onChange={(e) => setPacienteIniciais(e.target.value)} required /></div>
          <div><label>Leito:</label><input type="text" placeholder="Ex: Neuro-UTI 02" value={leito} onChange={(e) => setLeito(e.target.value)} required /></div>
        </div>
        <div className="form-group">
          <label>Abertura Ocular (AO):</label>
          <select value={ocular} onChange={(e) => setOcular(e.target.value)}>
            <option value={4}>4 - Espontanea</option><option value={3}>3 - Ao estimulo verbal</option><option value={2}>2 - Ao estimulo doloroso</option><option value={1}>1 - Nenhuma</option>
          </select>
        </div>
        <div className="form-group">
          <label>Resposta Verbal (RV):</label>
          <select value={verbal} onChange={(e) => setVerbal(e.target.value)}>
            <option value={5}>5 - Orientado</option><option value={4}>4 - Confuso</option><option value={3}>3 - Palavras inapropriadas</option><option value={2}>2 - Sons incompreensiveis</option><option value={1}>1 - Nenhuma / Intubado</option>
          </select>
        </div>
        <div className="form-group">
          <label>Resposta Motora (RM):</label>
          <select value={motora} onChange={(e) => setMotora(e.target.value)}>
            <option value={6}>6 - Obedece a comandos</option><option value={5}>5 - Localiza estimulo doloroso</option><option value={4}>4 - Retirada inespecifica</option><option value={3}>3 - Flexao anormal (decorticacao)</option><option value={2}>2 - Extensao anormal (descerebracao)</option><option value={1}>1 - Nenhuma</option>
          </select>
        </div>
        <div className="form-group">
          <label>Reatividade Pupilar:</label>
          <select value={pupila} onChange={(e) => setPupila(e.target.value)}>
            <option value={0}>0 - Ambas reagem a luz</option><option value={1}>-1 - Apenas uma reage</option><option value={2}>-2 - Nenhuma reage</option>
          </select>
        </div>

        <div className={`resultado-box ${analise.classe}`}>
          <h3>Escore ECG-P: {pontuacaoFinal} pontos</h3>
          <p><strong>Classificacao:</strong> {analise.texto}</p>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>{analise.condutas.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>

        <div className="form-group"><label>Observacoes:</label><textarea rows="2" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></div>
        <button type="submit" className="btn-salvar">Salvar Avaliacao ECG-P</button>
      </form>
    </div>
  );
}
