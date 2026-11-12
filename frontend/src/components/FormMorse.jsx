import { useState } from 'react';

export default function FormMorse({ onSalvar }) {
  const [pacienteIniciais, setPacienteIniciais] = useState('');
  const [leito, setLeito] = useState('');
  const [historicoQueda, setHistoricoQueda] = useState(0);
  const [diagnosticoSec, setDiagnosticoSec] = useState(0);
  const [auxilio, setAuxilio] = useState(0);
  const [terapiaEv, setTerapiaEv] = useState(0);
  const [marcha, setMarcha] = useState(0);
  const [estadoMental, setEstadoMental] = useState(0);
  const [observacoes, setObservacoes] = useState('');

  const total = Number(historicoQueda) + Number(diagnosticoSec) + Number(auxilio) + Number(terapiaEv) + Number(marcha) + Number(estadoMental);

  const obterClassificacao = (nota) => {
    if (nota >= 45) return { texto: 'Alto Risco de Quedas (>= 45 pts)', classe: 'alto-risco', condutas: ['Identificar leito e pulseira com sinalizacao de Alto Risco', 'Manter grades do leito elevadas e cama na altura minima', 'Deambulacao apenas com auxilio continuo da equipe', 'Avaliar efeito de farmacos neuroativos/sedativos'] };
    if (nota >= 25) return { texto: 'Risco Moderado de Quedas (25-44 pts)', classe: 'moderado-risco', condutas: ['Orientar paciente e acompanhante a solicitar ajuda antes de levantar', 'Manter campainha ao alcance e ambiente iluminado'] };
    return { texto: 'Baixo Risco de Quedas (0-24 pts)', classe: 'baixo-risco', condutas: ['Manter orientacoes gerais de seguranca do ambiente'] };
  };

  const analise = obterClassificacao(total);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar({
      pacienteIniciais, leito, tipoEscala: 'MORSE',
      respostas: { historicoQueda, diagnosticoSec, auxilio, terapiaEv, marcha, estadoMental },
      pontuacaoTotal: total, classificacaoRisco: analise.texto, condutasSugeridas: analise.condutas, observacoes
    });
    setPacienteIniciais(''); setLeito(''); setObservacoes('');
  };

  return (
    <div className="card">
      <h2>Escala de Quedas de Morse (Morse Fall Scale)</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div><label>Iniciais do Paciente:</label><input type="text" value={pacienteIniciais} onChange={(e) => setPacienteIniciais(e.target.value)} required /></div>
          <div><label>Leito:</label><input type="text" value={leito} onChange={(e) => setLeito(e.target.value)} required /></div>
        </div>
        <div className="grid-2">
          <div><label>Historico de Quedas:</label><select value={historicoQueda} onChange={(e) => setHistoricoQueda(e.target.value)}><option value={0}>0 - Nao</option><option value={25}>25 - Sim</option></select></div>
          <div><label>Diagnostico Secundario:</label><select value={diagnosticoSec} onChange={(e) => setDiagnosticoSec(e.target.value)}><option value={0}>0 - Nao</option><option value={15}>15 - Sim</option></select></div>
          <div><label>Auxilio na Deambulacao:</label><select value={auxilio} onChange={(e) => setAuxilio(e.target.value)}><option value={0}>0 - Nenhum / Acamado / Auxiliado por profissional</option><option value={15}>15 - Muletas / Bengala / Andador</option><option value={30}>30 - Apoia-se no mobiliario / parede</option></select></div>
          <div><label>Terapia Endovenosa / Dispositivo:</label><select value={terapiaEv} onChange={(e) => setTerapiaEv(e.target.value)}><option value={0}>0 - Nao</option><option value={20}>20 - Sim</option></select></div>
          <div><label>Marcha:</label><select value={marcha} onChange={(e) => setMarcha(e.target.value)}><option value={0}>0 - Normal / Sem deambulacao / Imobilizado</option><option value={10}>10 - Fraca (passos curtos, arrastados)</option><option value={20}>20 - Comprometida / Cambaleante (hemiparesia/ataxia)</option></select></div>
          <div><label>Estado Mental:</label><select value={estadoMental} onChange={(e) => setEstadoMental(e.target.value)}><option value={0}>0 - Orientado quanto a propria capacidade</option><option value={15}>15 - Superestima capacidade / Esquece limitacoes</option></select></div>
        </div>

        <div className={`resultado-box ${analise.classe}`}>
          <h3>Escore Morse: {total} pontos</h3>
          <p><strong>Classificacao:</strong> {analise.texto}</p>
          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>{analise.condutas.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>

        <div className="form-group"><label>Observacoes:</label><textarea rows="2" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} /></div>
        <button type="submit" className="btn-salvar">Salvar Avaliacao Morse</button>
      </form>
    </div>
  );
}
