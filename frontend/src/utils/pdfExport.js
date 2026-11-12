import jsPDF from 'jspdf';

export const exportarProntuarioPDF = async (paciente, avaliacoes = [], usuario = {}, canvasElement = null, modoDetalhado = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho institucional
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('NeuroRisco - Prontuário de Evolução Neurológica (SAE)', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, 14, 24);
  doc.text(`Profissional Responsável: ${usuario?.nome || 'Profissional'} | COREN: ${usuario?.coren || 'N/A'}`, 14, 29);

  // Linha divisória
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 33, pageWidth - 14, 33);

  // Identificação do Paciente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Identificação do Paciente', 14, 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Iniciais: ${paciente.iniciais}   |   Leito: ${paciente.leito}   |   Status: ${paciente.status}`, 14, 48);
  doc.text(`Diagnóstico / Hipótese Neurológica: ${paciente.diagnostico}`, 14, 55);

  let cursorY = 65;

  // Seção de Histórico de Avaliações
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(modoDetalhado ? 'Evolução Clínica Detalhada e Prontuários (SAE)' : 'Histórico de Avaliações Clínicas e Escalas', 14, cursorY);
  cursorY += 8;

  if (!avaliacoes || avaliacoes.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Nenhuma avaliação registrada para este paciente.', 14, cursorY + 4);
    cursorY += 15;
  } else if (modoDetalhado) {
    // MODO DETALHADO (Para o botão interno de Prontuários)
    avaliacoes.forEach((av, index) => {
      if (cursorY > 250) {
        doc.addPage();
        cursorY = 20;
      }

      // Caixa de fundo para cada avaliação
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, cursorY, pageWidth - 28, 38, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(37, 99, 235);
      doc.text(`[${av.escala}] - ${new Date(av.createdAt).toLocaleString('pt-BR')}`, 18, cursorY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      let pontuacaoStr = av.pontuacao;
      if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
        pontuacaoStr = `Total: ${av.pontuacao.total} (AO: ${av.pontuacao.ao}, RV: ${av.pontuacao.rv}, RM: ${av.pontuacao.rm})`;
      }

      doc.text(`Pontuação: ${pontuacaoStr}  |  Classificação: ${av.classificacao || 'N/A'}`, 18, cursorY + 14);
      doc.text(`Avaliador: ${av.avaliadorNome || 'N/A'} (COREN: ${av.avaliadorCoren || 'N/A'})`, 18, cursorY + 21);

      // Texto do Prontuário / SAE
      if (av.textoProntuario) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const linhasProntuario = doc.splitTextToSize(`SAE: ${av.textoProntuario}`, pageWidth - 40);
        doc.text(linhasProntuario, 18, cursorY + 28);
      }

      cursorY += 44;
    });
  } else {
    // MODO TABELA RESUMIDA (Para o botão externo da lista de pacientes)
    doc.setFillColor(37, 99, 235);
    doc.rect(14, cursorY, pageWidth - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Data / Hora', 17, cursorY + 5.5);
    doc.text('Escala', 55, cursorY + 5.5);
    doc.text('Pontuação', 82, cursorY + 5.5);
    doc.text('Classificação', 130, cursorY + 5.5);
    cursorY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    avaliacoes.forEach((av, index) => {
      if (cursorY > 270) {
        doc.addPage();
        cursorY = 20;
      }

      let pontuacaoStr = av.pontuacao;
      if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
        pontuacaoStr = `Total: ${av.pontuacao.total} (AO:${av.pontuacao.ao} RV:${av.pontuacao.rv} RM:${av.pontuacao.rm})`;
      }

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, cursorY, pageWidth - 28, 7, 'F');
      }

      doc.text(new Date(av.createdAt).toLocaleString('pt-BR'), 17, cursorY + 5);
      doc.text(String(av.escala || ''), 55, cursorY + 5);
      doc.text(String(pontuacaoStr), 82, cursorY + 5);
      doc.text(String(av.classificacao || 'N/A'), 130, cursorY + 5);

      cursorY += 7;
    });

    cursorY += 10;
  }

  // Se houver gráfico na tela (Canvas), insere no PDF
  if (canvasElement) {
    try {
      const imgData = canvasElement.toDataURL('image/png');
      
      if (cursorY > 170) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Evolução Gráfica', 14, cursorY);
      cursorY += 6;

      doc.addImage(imgData, 'PNG', 14, cursorY, 180, 85);
    } catch (err) {
      console.error('Erro ao anexar gráfico no PDF:', err);
    }
  }

  // Rodapé em todas as páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`NeuroRisco - Sistema de Apoio à Decisão Clínica | Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  doc.save(`Prontuario_${paciente.iniciais.replace(/\s+/g, '_')}_${paciente.leito}.pdf`);
};