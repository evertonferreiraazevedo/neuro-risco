import { useState } from 'react';

export default function FormRass({ onSalvar }) {
  const [pacienteIniciais, setPacienteIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [escore, setEscore] = useState(0);
  const [observacoes, setObservacoes] = useState('');

  const nota = Number(escore);

  const obterClassificacao = (val) => {
    if (val >= 2) return { texto: `Agitacao Importante / Combatividade (RASS +${val})`, classe: 'alto-risco', condutas: ['Risco critico de autoextubacao e perda de DVE/cateteres', 'Avaliar causas reversiveis (dor, bexigoma, hipoxia, abstinencia)', 'Comunicar equipe medica para ajuste de analgesia/sedacao'] };
    if (val === 1) return { texto: 'Inquieto / Ansioso (RASS +1)', classe: 'moderado-risco', condutas: ['Reorientacao verbal e controle ambiental', 'Vigilancia de dispositivos invasivos'] };
    if (val >= -2 && val <= 0) return { texto: `Alerta e Calmo a Sedacao Leve (RASS ${val})`, classe: 'baixo-risco', condutas: ['Meta ideal para maioria dos pacientes criticos', 'Aplicar escala CAM-ICU para rastreio de delirium'] };
    return { texto: `Sedacao Moderada a Profunda / Nao Despertavel (RASS ${val})`, classe: 'moderado-risco', condutas: ['Avaliar necessidade de despertar diario (se sem HIC)', 'Protecao ocular rigorosa (risco de lesao de cornea)', 'Vigilancia pupilar continua'] };
  };

  const analise = obterClassificacao(nota);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar({
      pacienteIniciais, leito, tipoEscala: 'RASS',
      respostas: { escoreRass: nota },
      pontuacaoTotal: nota, classificacaoRisco: analise.texto, condutasSugeridas: analise.condutas, observacoes
    });
    setPacienteIniciais(''); setLeito(''); setObservacoes('');
  };

  return (
    <div className="card">
      <h2>Escala de Agitacao e Sedacao de Richmond (RASS)</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div><label>Iniciais do Paciente:</label><input type="text" value={pacienteIniciais} onChange={(e) => setPacienteIniciais(e.target.value)} required /></div>
          <div><label>Leito:</label><input type="text" value={leito} onChange={(e) => setLeito(e.target.value)} required /></div>
        </div>
        <div className="form-group">
          <label>Nivel Observado:</label>
          <select value={escore} onChange={(e) => setEscore(e.target.value)}>
            <option value={4}>+4 - Combativo (violento, perigo imediato para equipe)</option>
            <option value={3}>+3 - Muito agitado (puxa ou remove tubos/cateteres, agressivo)</option>
            <option value={2}>+2 - Agitado (movimentos despropositados frequentes, briga com ventilador)</option>
            <option value={1}>+1 - Inquieto (ansioso, mas sem movimentos agressivos)</option>
            <option value={0}>0 - Alerta e calmo</option>
            <option value={-1}>-1 - Sonolento (desperta ao chamado verbal por &gt; 10s)</option>
            <option value={-2}>-2 - Sedacao leve (desperta breve ao chamado verbal &lt; 10s)</option>
            <option value={-3}>-3 - Sedacao moderada (movimento ou abertura ocular ao chamado, sem contato visual)</option>
            <option value={-4}>-4 - Sedacao profunda (sem resposta a voz, apenas estimulo fisico)</option>
            <option value={-5}>-5 - Nao despertavel (sem resposta a voz ou estimulo fisico)</option>
          </select>
        </div>

        <div className={`resultado-box ${analise.classe}`}>
          <h3>Escore RASS: {nota > 0 ? `+${nota}` : nota}</h3>
          <p><strong>Classificacao:</strong> {analise.texto}</p>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>{analise.condutas.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>

        <div className="form-group"><label>Observacoes:</label><textarea rows="2" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></div>
        <button type="submit" className="btn-salvar">Salvar Avaliacao RASS</button>
      </form>
    </div>
  );
}
