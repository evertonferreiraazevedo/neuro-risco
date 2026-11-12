import { useState } from 'react';

export default function Historico({ lista, onExcluir }) {
  const [filtro, setFiltro] = useState('');

  const listaFiltrada = lista.filter((item) =>
    item.pacienteIniciais.toLowerCase().includes(filtro.toLowerCase()) ||
    item.leito.toLowerCase().includes(filtro.toLowerCase())
  );

  const copiarEvolucao = (item) => {
    const data = new Date(item.dataAvaliacao).toLocaleString('pt-BR');
    const texto = `AVALIACAO DE ENFERMAGEM (${data}) - Paciente: ${item.pacienteIniciais} | Leito: ${item.leito} | Escala: ${item.tipoEscala} | Escore: ${item.pontuacaoTotal} pts (${item.classificacaoRisco}). Obs: ${item.observacoes || 'Sem intercorrencias.'} (${item.avaliadorNome} - ${item.avaliadorCoren})`;
    navigator.clipboard.writeText(texto);
    alert('Evolucao copiada para a area de transferencia!');
  };

  return (
    <div className="card">
      <h2>Historico de Avaliacoes do Plantao</h2>
      <div className="form-group">
        <input 
          type="text" 
          placeholder="Buscar por iniciais do paciente ou leito..." 
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {listaFiltrada.length === 0 ? (
        <p>Nenhuma avaliacao encontrada.</p>
      ) : (
        listaFiltrada.map((item) => (
          <div key={item._id} className="item-historico">
            <div>
              <strong>{item.pacienteIniciais}</strong> (Leito: {item.leito}) - <span style={{ color: '#0f4c81', fontWeight: 'bold' }}>{item.tipoEscala}</span>
              <br />
              <span>Escore: <strong>{item.pontuacaoTotal}</strong> - {item.classificacaoRisco}</span>
              <br />
              <small style={{ color: '#64748b' }}>
                {new Date(item.dataAvaliacao).toLocaleString('pt-BR')} | Avaliador: {item.avaliadorNome}
              </small>
            </div>
            <div className="acoes-historico">
              <button type="button" className="btn-copiar" onClick={() => copiarEvolucao(item)}>Copiar Evolucao</button>
              <button type="button" className="btn-excluir" onClick={() => onExcluir(item._id)}>Excluir</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
