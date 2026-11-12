import { jsPDF } from 'jspdf';

export const exportarProntuarioPDF = (paciente, avaliacoes, usuario) => {
  const doc = new jsPDF();
  let y = 20;

  // Cabeçalho Institucional
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('NeuroRisco - Prontuário de Evolução Neurológica (SAE)', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, 14, y);
  if (usuario) {
    doc.text(`Profissional Responsável: ${usuario.nome} | COREN: ${usuario.coren}`, 14, y + 5);
    y += 5;
  }
  y += 8;

  // Linha divisória (Corrigido de setLineColor para setDrawColor)
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 8;

  // Dados do Paciente (LGPD)
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Identificação do Paciente', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Iniciais: ${paciente.iniciais}   |   Leito: ${paciente.leito}   |   Status: ${paciente.status}`, 14, y);
  y += 6;
  doc.text(`Diagnóstico / Hipótese: ${paciente.diagnostico}`, 14, y);
  y += 10;

  doc.line(14, y, 196, y);
  y += 8;

  // Histórico Cronológico de Avaliações
  doc.setFontSize(12);
  doc.text('Histórico de Avaliações Clínicas', 14, y);
  y += 8;

  if (!avaliacoes || avaliacoes.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Nenhuma avaliação registrada para este paciente.', 14, y);
  } else {
    avaliacoes.forEach((av, index) => {
      // Quebra de página automática se chegar perto do fim
      if (y > 265) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.text(`${index + 1}. Escala: ${av.escala} - ${new Date(av.createdAt).toLocaleString('pt-BR')}`, 14, y);
      y += 6;

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const pontuacaoStr = typeof av.pontuacao === 'object' ? JSON.stringify(av.pontuacao) : av.pontuacao;
      doc.text(`Pontuação: ${pontuacaoStr}   |   Classificação: ${av.classificacao}`, 14, y);
      y += 5;

      doc.setTextColor(71, 85, 105);
      doc.text(`Avaliador: ${av.avaliadorNome || 'N/A'} (COREN: ${av.avaliadorCoren || 'N/A'})`, 14, y);
      y += 6;

      if (av.textoProntuario) {
        const linhasTexto = doc.splitTextToSize(av.textoProntuario, 180);
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text(linhasTexto, 14, y);
        y += linhasTexto.length * 4.5 + 4;
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(14, y, 196, y);
      y += 7;
    });
  }

  const nomeArquivo = `Prontuario_${paciente.iniciais.replace(/\./g, '')}_${paciente.leito}.pdf`;
  doc.save(nomeArquivo);
};