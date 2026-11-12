import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function EvolucaoGrafico({ avaliacoes, escalaAlvo }) {
  // Filtra as avaliações pela escala desejada (ex: GLASGOW, BRADEN, MORSE) e ordena cronologicamente
  const avaliacoesFiltradas = avaliacoes
    .filter((av) => av.escala === escalaAlvo)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (avaliacoesFiltradas.length === 0) {
    return <p className="text-muted">Nenhuma avaliação de {escalaAlvo} registrada para gerar o gráfico.</p>;
  }

  const labels = avaliacoesFiltradas.map((av) =>
    new Date(av.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  const dadosPontos = avaliacoesFiltradas.map((av) => {
    if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
      return av.pontuacao.total !== undefined ? av.pontuacao.total : 0;
    }
    return Number(av.pontuacao) || 0;
  });

  const data = {
    labels,
    datasets: [
      {
        label: `Evolução - ${escalaAlvo}`,
        data: dadosPontos,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.2,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Evolução Temporal da Escala ${escalaAlvo}`
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="grafico-container" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default EvolucaoGrafico;