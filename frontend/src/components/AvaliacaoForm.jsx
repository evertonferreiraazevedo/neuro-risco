//Logica antiga descontinuada

// import React, { useState } from 'react';

// export default function AvaliacaoForm({ token, apiFetch, usuario, pacienteSelecionado }) {
//   const [escala, setEscala] = useState('GLASGOW');
//   const [observacoes, setObservacoes] = useState('');
//   const [sucesso, setSucesso] = useState('');
//   const [erro, setErro] = useState('');

//   // Sub-estados iniciados com string vazia ("") para obrigar a seleção
//   // Glasgow
//   const [glasgowAO, setGlasgowAO] = useState('');
//   const [glasgowRV, setGlasgowRV] = useState('');
//   const [glasgowRM, setGlasgowRM] = useState('');

//   // Braden
//   const [bradenSensorial, setBradenSensorial] = useState('');
//   const [bradenUmidade, setBradenUmidade] = useState('');
//   const [bradenAtividade, setBradenAtividade] = useState('');
//   const [bradenMobilidade, setBradenMobilidade] = useState('');
//   const [bradenNutricao, setBradenNutricao] = useState('');
//   const [bradenFriccao, setBradenFriccao] = useState('');

//   // Morse
//   const [morseQuedas, setMorseQuedas] = useState('');
//   const [morseDiagnostico, setMorseDiagnostico] = useState('');
//   const [morseAuxilio, setMorseAuxilio] = useState('');
//   const [morseEv, setMorseEv] = useState('');
//   const [morseMarcha, setMorseMarcha] = useState('');
//   const [morseConsciencia, setMorseConsciencia] = useState('');

//   // RASS
//   const [rassValor, setRassValor] = useState('');

//   const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

//   // Validação para verificar se há algum campo pendente ("Selecione...")
//   const validarPreenchimento = () => {
//     if (escala === 'GLASGOW') {
//       return glasgowAO !== '' && glasgowRV !== '' && glasgowRM !== '';
//     }
//     if (escala === 'BRADEN') {
//       return (
//         bradenSensorial !== '' &&
//         bradenUmidade !== '' &&
//         bradenAtividade !== '' &&
//         bradenMobilidade !== '' &&
//         bradenNutricao !== '' &&
//         bradenFriccao !== ''
//       );
//     }
//     if (escala === 'MORSE') {
//       return (
//         morseQuedas !== '' &&
//         morseDiagnostico !== '' &&
//         morseAuxilio !== '' &&
//         morseEv !== '' &&
//         morseMarcha !== '' &&
//         morseConsciencia !== ''
//       );
//     }
//     if (escala === 'RASS') {
//       return rassValor !== '';
//     }
//     return false;
//   };

//   const calcularResultado = () => {
//     if (escala === 'GLASGOW') {
//       const total = Number(glasgowAO) + Number(glasgowRV) + Number(glasgowRM);
//       let classificacao = 'Normal / Leve (13-15)';
//       if (total <= 8) classificacao = 'Coma / Grave (≤ 8) - Intubação / UTI';
//       else if (total <= 12) classificacao = 'Moderado (9-12)';
//       return { pontuacao: { total, ao: Number(glasgowAO), rv: Number(glasgowRV), rm: Number(glasgowRM) }, classificacao };
//     }

//     if (escala === 'BRADEN') {
//       const total = Number(bradenSensorial) + Number(bradenUmidade) + Number(bradenAtividade) + 
//                     Number(bradenMobilidade) + Number(bradenNutricao) + Number(bradenFriccao);
//       let classificacao = 'Baixo Risco (15-23)';
//       if (total <= 9) classificacao = 'Risco Muito Alto (≤ 9)';
//       else if (total <= 12) classificacao = 'Risco Alto (10-12)';
//       else if (total <= 14) classificacao = 'Risco Moderado (13-14)';
//       return { pontuacao: total, classificacao };
//     }

//     if (escala === 'MORSE') {
//       const total = Number(morseQuedas) + Number(morseDiagnostico) + Number(morseAuxilio) + 
//                     Number(morseEv) + Number(morseMarcha) + Number(morseConsciencia);
//       let classificacao = 'Baixo Risco (0-24)';
//       if (total >= 45) classificacao = 'Alto Risco de Queda (≥ 45)';
//       else if (total >= 25) classificacao = 'Risco Moderado (25-44)';
//       return { pontuacao: total, classificacao };
//     }

//     if (escala === 'RASS') {
//       const val = Number(rassValor);
//       let classificacao = 'Alerta e Calmo';
//       if (val >= 3) classificacao = 'Muito Agitado / Combativo';
//       else if (val === 2) classificacao = 'Agitado';
//       else if (val === 1) classificacao = 'Inquieto';
//       else if (val === -1) classificacao = 'Sonolento';
//       else if (val <= -2) classificacao = 'Sedado / Resposta Leve a Voz';
//       return { pontuacao: val, classificacao };
//     }

//     return { pontuacao: 0, classificacao: 'Indefinido' };
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErro('');
//     setSucesso('');

//     if (!pacienteSelecionado) {
//       setErro('Nenhum paciente selecionado. Vá na aba "Pacientes" e selecione um paciente.');
//       return;
//     }

//     // Validação de segurança para impedir envio com campos em "Selecione..."
//     if (!validarPreenchimento()) {
//       setErro('Por favor, preencha todos os parâmetros da escala antes de salvar a avaliação.');
//       return;
//     }

//     const { pontuacao, classificacao } = calcularResultado();
//     const textoProntuario = `[SAE - AVALIAÇÃO NEUROLÓGICA]\nPaciente: ${pacienteSelecionado.iniciais} | Leito: ${pacienteSelecionado.leito}\nEscala: ${escala}\nPontuação: ${typeof pontuacao === 'object' ? JSON.stringify(pontuacao) : pontuacao}\nClassificação: ${classificacao}\nObs: ${observacoes || 'N/A'}\nAvaliador: ${usuario?.nome} (COREN: ${usuario?.coren})`;

//     try {
//       const response = await apiFetch(`${API_URL}/api/avaliacoes`, {
//         method: 'POST',
//         body: JSON.stringify({
//           pacienteId: pacienteSelecionado._id,
//           iniciais: pacienteSelecionado.iniciais,
//           leito: pacienteSelecionado.leito,
//           escala: escala,
//           pontuacao,
//           classificacao,
//           textoProntuario
//         })
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setSucesso('Avaliação salva com sucesso!');
//         setObservacoes('');
//         // Resetar campos para o estado "Selecione..."
//         setGlasgowAO(''); setGlasgowRV(''); setGlasgowRM('');
//         setBradenSensorial(''); setBradenUmidade(''); setBradenAtividade(''); setBradenMobilidade(''); setBradenNutricao(''); setBradenFriccao('');
//         setMorseQuedas(''); setMorseDiagnostico(''); setMorseAuxilio(''); setMorseEv(''); setMorseMarcha(''); setMorseConsciencia('');
//         setRassValor('');
//       } else {
//         setErro(data.erro || 'Erro ao salvar avaliação.');
//       }
//     } catch (err) {
//       if (!err.message.includes('Sessão expirada')) {
//         setErro('Erro de conexão ao salvar avaliação.');
//       }
//     }
//   };

//   return (
//     <div className="form-escala-container">
//       <h2>Avaliação de Escalas Clínicas e SAE</h2>

//       {!pacienteSelecionado ? (
//         <div className="error-message">
//           Nenhum paciente selecionado no momento. Acesse a aba <strong>Pacientes</strong> e clique em "Selecionar" no leito desejado.
//         </div>
//       ) : (
//         <div style={{ marginBottom: '1.5rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1.5px solid var(--border-color)' }}>
//           <p><strong>Paciente Ativo:</strong> {pacienteSelecionado.iniciais} | <strong>Leito:</strong> {pacienteSelecionado.leito}</p>
//           <p><strong>Diagnóstico:</strong> {pacienteSelecionado.diagnostico}</p>
//         </div>
//       )}

//       {erro && <div className="error-message">{erro}</div>}
//       {sucesso && <div className="success-message">{sucesso}</div>}

//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>Selecione a Escala Neurológica:</label>
//           <select 
//             value={escala} 
//             onChange={(e) => {
//               setEscala(e.target.value);
//               setErro('');
//             }}
//           >
//             <option value="GLASGOW">Escala de Coma de Glasgow (Nível de Consciência)</option>
//             <option value="BRADEN">Escala de Braden (Risco de Úlcera por Pressão)</option>
//             <option value="MORSE">Escala de Morse (Risco de Queda)</option>
//             <option value="RASS">Escala RASS (Agitação e Sedação)</option>
//           </select>
//         </div>

//         {/* --- GLASGOW --- */}
//         {escala === 'GLASGOW' && (
//           <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
//             <h3>Parâmetros de Glasgow</h3>
//             <div className="form-group">
//               <label>Abertura Ocular (AO):</label>
//               <select value={glasgowAO} onChange={(e) => setGlasgowAO(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="4">4 - Espontânea</option>
//                 <option value="3">3 - À voz / Comando verbal</option>
//                 <option value="2">2 - À dor</option>
//                 <option value="1">1 - Ausente</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Resposta Verbal (RV):</label>
//               <select value={glasgowRV} onChange={(e) => setGlasgowRV(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="5">5 - Orientado</option>
//                 <option value="4">4 - Confuso / Desorientado</option>
//                 <option value="3">3 - Palavras inapropriadas</option>
//                 <option value="2">2 - Sons incompreensíveis</option>
//                 <option value="1">1 - Ausente</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Resposta Motora (RM):</label>
//               <select value={glasgowRM} onChange={(e) => setGlasgowRM(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="6">6 - Obedece a comandos</option>
//                 <option value="5">5 - Localiza a dor</option>
//                 <option value="4">4 - Retirada à dor / Flexão normal</option>
//                 <option value="3">3 - Flexão anormal (decorticação)</option>
//                 <option value="2">2 - Extensão anormal (descerebração)</option>
//                 <option value="1">1 - Ausente</option>
//               </select>
//             </div>
//           </div>
//         )}

//         {/* --- BRADEN --- */}
//         {escala === 'BRADEN' && (
//           <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
//             <h3>Parâmetros de Braden</h3>
//             <div className="form-group">
//               <label>Percepção Sensorial:</label>
//               <select value={bradenSensorial} onChange={(e) => setBradenSensorial(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="4">4 - Totalmente Limitada</option>
//                 <option value="3">3 - Muito Limitada</option>
//                 <option value="2">2 - Levemente Limitada</option>
//                 <option value="1">1 - Nenhuma Impairment</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Umidade:</label>
//               <select value={bradenUmidade} onChange={(e) => setBradenUmidade(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="4">4 - Raramente Úmida</option>
//                 <option value="3">3 - Ocasionalmente Úmida</option>
//                 <option value="2">2 - Muito Úmida</option>
//                 <option value="1">1 - Constantemente Úmida</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Atividade:</label>
//               <select value={bradenAtividade} onChange={(e) => setBradenAtividade(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="4">4 - Acamado</option>
//                 <option value="3">3 - Confinado à cadeira</option>
//                 <option value="2">2 - Caminha Ocasionalmente</option>
//                 <option value="1">1 - Caminha Frequentemente</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Mobilidade:</label>
//               <select value={bradenMobilidade} onChange={(e) => setBradenMobilidade(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="4">4 - Totalmente Imóvel</option>
//                 <option value="3">3 - Muito Limitada</option>
//                 <option value="2">2 - Levemente Limitada</option>
//                 <option value="1">1 - Sem Limitações</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Nutrição:</label>
//               <select value={bradenNutricao} onChange={(e) => setBradenNutricao(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="4">4 - Muito Pobre / Nula</option>
//                 <option value="3">3 - Provavelmente Inadequada</option>
//                 <option value="2">2 - Adequada</option>
//                 <option value="1">1 - Excelente</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Fricção e Cisalhamento:</label>
//               <select value={bradenFriccao} onChange={(e) => setBradenFriccao(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="3">3 - Problema Presente</option>
//                 <option value="2">2 - Problema Potencial</option>
//                 <option value="1">1 - Nenhum Problema aparente</option>
//               </select>
//             </div>
//           </div>
//         )}

//         {/* --- MORSE --- */}
//         {escala === 'MORSE' && (
//           <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
//             <h3>Parâmetros de Morse (Quedas)</h3>
//             <div className="form-group">
//               <label>Histórico de Quedas Recentes:</label>
//               <select value={morseQuedas} onChange={(e) => setMorseQuedas(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="25">Sim (25 pts)</option>
//                 <option value="0">Não (0 pts)</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Diagnóstico Secundário:</label>
//               <select value={morseDiagnostico} onChange={(e) => setMorseDiagnostico(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="15">Sim (15 pts)</option>
//                 <option value="0">Não (0 pts)</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Auxílio na Marcha:</label>
//               <select value={morseAuxilio} onChange={(e) => setMorseAuxilio(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="30">Muletas / Bengala / Andador (30 pts)</option>
//                 <option value="15">Mobiliário / Apoio em paredes (15 pts)</option>
//                 <option value="0">Nenhum / Acamado / Cadeira de rodas (0 pts)</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Terapia Endovenosa (Heparina / Salina):</label>
//               <select value={morseEv} onChange={(e) => setMorseEv(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="20">Sim (20 pts)</option>
//                 <option value="0">Não (0 pts)</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Marcha:</label>
//               <select value={morseMarcha} onChange={(e) => setMorseMarcha(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="20">Impaired / Comprometida (20 pts)</option>
//                 <option value="10">Fraca / Instável (10 pts)</option>
//                 <option value="0">Normal / Acamado (0 pts)</option>
//               </select>
//             </div>
//             <div className="form-group">
//               <label>Estado Mental:</label>
//               <select value={morseConsciencia} onChange={(e) => setMorseConsciencia(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="15">Superestima capacidade / Esquece limitações (15 pts)</option>
//                 <option value="0">Orientado / Tem consciência das limitações (0 pts)</option>
//               </select>
//             </div>
//           </div>
//         )}

//         {/* --- RASS --- */}
//         {escala === 'RASS' && (
//           <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
//             <h3>Escala RASS (Agitação e Sedação)</h3>
//             <div className="form-group">
//               <label>Nível RASS:</label>
//               <select value={rassValor} onChange={(e) => setRassValor(e.target.value)} required>
//                 <option value="" disabled>-- Selecione --</option>
//                 <option value="4">+4 Combativo (Violento, perigo imediato)</option>
//                 <option value="3">+3 Muito Agitado (Puxa tubos/cateteres)</option>
//                 <option value="2">+2 Agitado (Movimentos frequentes não coordenados)</option>
//                 <option value="1">+1 Inquieto (Ansioso, mas sem movimentos agressivos)</option>
//                 <option value="0">0 Alerta e Calmo</option>
//                 <option value="-1">-1 Sonolento (Desperta à voz, mantém olhos abertos &gt; 10s)</option>
//                 <option value="-2">-2 Sedação Leve (Desperta à voz brevemente, olhos abertos &lt; 10s)</option>
//                 <option value="-3">-3 Sedação Moderada (Movimento ou abertura ocular à voz, sem contato visual)</option>
//                 <option value="-4">-4 Sedação Profunda (Sem resposta à voz, movimento à dor física)</option>
//                 <option value="-5">-5 Sem Resposta (Sem resposta à voz ou à dor)</option>
//               </select>
//             </div>
//           </div>
//         )}

//         {validarPreenchimento() && (
//           <div className="resultado-box">
//             <h3>Resultado Calculado</h3>
//             <p><strong>Pontuação:</strong> {JSON.stringify(calcularResultado().pontuacao)}</p>
//             <p><strong>Classificação:</strong> {calcularResultado().classificacao}</p>
//           </div>
//         )}

//         <div className="form-group">
//           <label>Observações Clínicas e Cuidados Especiais (SAE):</label>
//           <textarea 
//             rows="3"
//             value={observacoes} 
//             onChange={(e) => setObservacoes(e.target.value)}
//             placeholder="Ex: Elevar cabeceira a 30°, checar permissão de decúbito..."
//             style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-color)' }}
//           />
//         </div>

//         <button type="submit" className="btn-primary" disabled={!pacienteSelecionado}>
//           Salvar Avaliação e Gerar Prontuário
//         </button>
//       </form>
//     </div>
//   );
// }