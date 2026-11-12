import jsPDF from 'jspdf';

export const exportarProntuarioPDF = async (paciente, avaliacoes = [], usuario = {}, canvasElement = null, modoDetalhado = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const largurautil = pageWidth - 28; // Margem de 14 de cada lado

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
    // ==========================================
    // MODO DETALHADO (Dinâmico)
    // ==========================================
    avaliacoes.forEach((av) => {
      let pontuacaoStr = av.pontuacao;
      if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
        pontuacaoStr = `Total: ${av.pontuacao.total} (AO: ${av.pontuacao.ao}, RV: ${av.pontuacao.rv}, RM: ${av.pontuacao.rm})`;
      }

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      const textoSae = av.textoProntuario ? `SAE: ${av.textoProntuario}` : 'SAE: N/A';
      const linhasProntuario = doc.splitTextToSize(textoSae, pageWidth - 40);

      const alturaBloco = 26 + (linhasProntuario.length * 4.5);

      if (cursorY + alturaBloco > 275) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, cursorY, pageWidth - 28, alturaBloco, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(37, 99, 235);
      doc.text(`[${av.escala}] - ${new Date(av.createdAt).toLocaleString('pt-BR')}`, 18, cursorY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Pontuação: ${pontuacaoStr}  |  Classificação: ${av.classificacao || 'N/A'}`, 18, cursorY + 14);
      doc.text(`Avaliador: ${av.avaliadorNome || 'N/A'} (COREN: ${av.avaliadorCoren || 'N/A'})`, 18, cursorY + 21);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(linhasProntuario, 18, cursorY + 28);

      cursorY += alturaBloco + 6;
    });
  } else {
    // ==========================================
    // MODO TABELA RESUMIDA (Com quebra de linha rigorosa por coluna)
    // ==========================================
    // Definição das posições X e larguras máximas (Width) para cada coluna
    const colX = { data: 16, escala: 52, pontuacao: 82, classificacao: 135 };
    const colWidth = { data: 34, escala: 28, pontuacao: 50, classificacao: 45 };

    doc.setFillColor(37, 99, 235);
    doc.rect(14, cursorY, largurautil, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Data / Hora', colX.data, cursorY + 5.5);
    doc.text('Escala', colX.escala, cursorY + 5.5);
    doc.text('Pontuação', colX.pontuacao, cursorY + 5.5);
    doc.text('Classificação', colX.classificacao, cursorY + 5.5);
    cursorY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    avaliacoes.forEach((av, index) => {
      let pontuacaoStr = av.pontuacao;
      if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
        pontuacaoStr = `Total:${av.pontuacao.total} (AO:${av.pontuacao.ao} RV:${av.pontuacao.rv} RM:${av.pontuacao.rm})`;
      }

      // Quebra rigorosa de texto respeitando estritamente a largura de cada coluna
      const colData = doc.splitTextToSize(new Date(av.createdAt).toLocaleString('pt-BR'), colWidth.data);
      const colEscala = doc.splitTextToSize(String(av.escala || ''), colWidth.escala);
      const colPontuacao = doc.splitTextToSize(String(pontuacaoStr), colWidth.pontuacao);
      const colClassificacao = doc.splitTextToSize(String(av.classificacao || 'N/A'), colWidth.classificacao);

      const maxLinhas = Math.max(colData.length, colEscala.length, colPontuacao.length, colClassificacao.length);
      const alturaLinha = maxLinhas * 4.5 + 4;

      if (cursorY + alturaLinha > 275) {
        doc.addPage();
        cursorY = 20;
      }

      // Linha alternada de fundo com altura dinâmica
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, cursorY, largurautil, alturaLinha, 'F');
      }

      // Renderiza cada coluna respeitando seu X e largura máxima
      doc.text(colData, colX.data, cursorY + 5);
      doc.text(colEscala, colX.escala, cursorY + 5);
      doc.text(colPontuacao, colX.pontuacao, cursorY + 5);
      doc.text(colClassificacao, colX.classificacao, cursorY + 5);

      cursorY += alturaLinha;
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