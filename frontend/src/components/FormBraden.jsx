import { useState } from 'react';

export default function FormBraden({ onSalvar }) {
  const [pacienteIniciais, setPacienteIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [percepcao, setPercepcao] = useState(4);
  const [umidade, setUmidade] = useState(4);
  const [atividade, setAtividade] = useState(4);
  const [mobilidade, setMobilidade] = useState(4);
  const [nutricao, setNutricao] = useState(4);
  const [friccao, setFriccao] = useState(3);
  const [observacoes, setObservacoes] = useState('');

  const total = Number(percepcao) + Number(umidade) + Number(atividade) + Number(mobilidade) + Number(nutricao) + Number(friccao);

  const obterClassificacao = (nota) => {
    if (nota <= 9) return { texto: 'Risco Muito Alto para Lesao por Pressao', classe: 'alto-risco', condutas: ['Mudanca de decubito rigorosa a cada 2h', 'Colchao pneumatico ou viscoelasticidade obrigatorio', 'Protecao de calcaneos e proeminencias osseas com hidrocoloide/espuma', 'Avaliacao nutricional e hidratacao da pele'] };
    if (nota <= 12) return { texto: 'Risco Alto para Lesao por Pressao', classe: 'alto-risco', condutas: ['Mudanca de decubito a cada 2h', 'Utilizar superficies de redistribuicao de pressao', 'Manter pele limpa, seca e hidratada'] };
    if (nota <= 14) return { texto: 'Risco Moderado', classe: 'moderado-risco', condutas: ['Mudanca de decubito programada', 'Inspecao diaria da pele nas proeminencias osseas'] };
    return { texto: 'Risco Leve / Sem Risco (15-23 pts)', classe: 'baixo-risco', condutas: ['Manter cuidados preventivos padrao e reavaliar em 48h ou se piora neurologica'] };
  };

  const analise = obterClassificacao(total);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar({
      pacienteIniciais, leito, tipoEscala: 'BRADEN',
      respostas: { percepcao, umidade, atividade, mobilidade, nutricao, friccao },
      pontuacaoTotal: total, classificacaoRisco: analise.texto, condutasSugeridas: analise.condutas, observacoes
    });
    setPacienteIniciais(''); setLeito(''); setObservacoes('');
  };

  return (
    <div className="card">
      <h2>Escala de Braden (Risco de Lesao por Pressao)</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div><label>Iniciais do Paciente:</label><input type="text" value={pacienteIniciais} onChange={(e) => setPacienteIniciais(e.target.value)} required /></div>
          <div><label>Leito:</label><input type="text" value={leito} onChange={(e) => setLeito(e.target.value)} required /></div>
        </div>
        <div className="grid-2">
          <div><label>Percepcao Sensorial:</label><select value={percepcao} onChange={(e) => setPercepcao(e.target.value)}><option value={1}>1 - Totalmente limitado</option><option value={2}>2 - Muito limitado</option><option value={3}>3 - Levemente limitado</option><option value={4}>4 - Nenhuma limitacao</option></select></div>
          <div><label>Umidade:</label><select value={umidade} onChange={(e) => setUmidade(e.target.value)}><option value={1}>1 - Completamente molhada</option><option value={2}>2 - Muito molhada</option><option value={3}>3 - Ocasionalmente molhada</option><option value={4}>4 - Raramente molhada</option></select></div>
          <div><label>Atividade:</label><select value={atividade} onChange={(e) => setAtividade(e.target.value)}><option value={1}>1 - Acamado</option><option value={2}>2 - Confinado a cadeira</option><option value={3}>3 - Anda ocasionalmente</option><option value={4}>4 - Anda frequentemente</option></select></div>
          <div><label>Mobilidade:</label><select value={mobilidade} onChange={(e) => setMobilidade(e.target.value)}><option value={1}>1 - Totalmente imovel</option><option value={2}>2 - Bastante limitado</option><option value={3}>3 - Levemente limitado</option><option value={4}>4 - Nao apresenta limitacoes</option></select></div>
          <div><label>Nutricao:</label><select value={nutricao} onChange={(e) => setNutricao(e.target.value)}><option value={1}>1 - Muito pobre</option><option value={2}>2 - Provavelmente inadequada</option><option value={3}>3 - Adequada</option><option value={4}>4 - Excelente</option></select></div>
          <div><label>Friccao e Cisalhamento:</label><select value={friccao} onChange={(e) => setFriccao(e.target.value)}><option value={1}>1 - Problema</option><option value={2}>2 - Problema em potencial</option><option value={3}>3 - Nenhum problema</option></select></div>
        </div>

        <div className={`resultado-box ${analise.classe}`}>
          <h3>Escore Braden: {total} pontos</h3>
          <p><strong>Classificacao:</strong> {analise.texto}</p>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>{analise.condutas.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>

        <div className="form-group"><label>Observacoes:</label><textarea rows="2" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></div>
        <button type="submit" className="btn-salvar">Salvar Avaliacao Braden</button>
      </form>
    </div>
  );
}
