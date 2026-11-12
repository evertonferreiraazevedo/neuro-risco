import jsPDF from 'jspdf';

export const exportarProntuarioPDF = async (paciente, avaliacoes = [], usuario = {}, canvasElement = null, modoDetalhado = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const larguraUtil = pageWidth - 28; // Margem de 14 de cada lado

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
    // MODO DETALHADO (Com quebra rigorosa e anti-sobreposição)
    // ==========================================
    const larguraCaixa = larguraUtil; // 182mm
    const margemInternaX = 18;
    const larguraTextoCaixa = larguraCaixa - 8; // 174mm para o texto interno

    avaliacoes.forEach((av) => {
      let pontuacaoStr = av.pontuacao;
      if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
        pontuacaoStr = `Total: ${av.pontuacao.total} (AO: ${av.pontuacao.ao}, RV: ${av.pontuacao.rv}, RM: ${av.pontuacao.rm})`;
      }

      // Configura fontes para medição exata de linhas
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const linhaInfo1 = doc.splitTextToSize(`Pontuação: ${pontuacaoStr}  |  Classificação: ${av.classificacao || 'N/A'}`, larguraTextoCaixa);
      const linhaInfo2 = doc.splitTextToSize(`Avaliador: ${av.avaliadorNome || 'N/A'} (COREN: ${av.avaliadorCoren || 'N/A'})`, larguraTextoCaixa);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      const textoSae = av.textoProntuario ? `SAE: ${av.textoProntuario}` : 'SAE: N/A';
      const linhasProntuario = doc.splitTextToSize(textoSae, larguraTextoCaixa);

      // Soma dinâmica segura da altura de cada linha de texto
      const alturaCabecalho = 8;
      const alturaInfo1 = linhaInfo1.length * 4.2;
      const alturaInfo2 = linhaInfo2.length * 4.2;
      const alturaSae = linhasProntuario.length * 4.0;

      const alturaBloco = alturaCabecalho + alturaInfo1 + alturaInfo2 + alturaSae + 12;

      if (cursorY + alturaBloco > 275) {
        doc.addPage();
        cursorY = 20;
      }

      // Desenha a caixa arredondada
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, cursorY, larguraCaixa, alturaBloco, 3, 3, 'FD');

      // Título do item (Data e Escala)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(37, 99, 235);
      doc.text(`[${av.escala}] - ${new Date(av.createdAt).toLocaleString('pt-BR')}`, margemInternaX, cursorY + 7);

      let currentY = cursorY + 13;

      // Renderiza as informações com quebra lateral rigorosa
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      doc.text(linhaInfo1, margemInternaX, currentY);
      currentY += alturaInfo1 + 2;

      doc.text(linhaInfo2, margemInternaX, currentY);
      currentY += alturaInfo2 + 2;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(linhasProntuario, margemInternaX, currentY);

      cursorY += alturaBloco + 6; // Espaçamento perfeito para o próximo bloco
    });
  } else {
    // ==========================================
    // MODO TABELA RESUMIDA
    // ==========================================
    const colX = { data: 16, escala: 52, pontuacao: 82, classificacao: 135 };
    const colWidth = { data: 34, escala: 28, pontuacao: 50, classificacao: 45 };

    doc.setFillColor(37, 99, 235);
    doc.rect(14, cursorY, larguraUtil, 8, 'F');
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

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, cursorY, larguraUtil, alturaLinha, 'F');
      }

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