import jsPDF from 'jspdf';

export const exportarProntuarioPDF = async (paciente, avaliacoes = [], usuario = {}, canvasElement = null, modoDetalhado = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margem = 14;
  const larguraUtil = pageWidth - (margem * 2);

  // ==========================================
  // 1. CABEÇALHO INSTITUCIONAL
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('NeuroRisco - Prontuário de Evolução Neurológica (SAE)', margem, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, margem, 24);
  doc.text(`Profissional: ${usuario?.nome || 'Profissional'} | COREN: ${usuario?.coren || 'N/A'}`, margem, 29);

  // Linha divisória
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margem, 33, pageWidth - margem, 33);

  // ==========================================
  // 2. DADOS DO PACIENTE
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Identificação do Paciente', margem, 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Iniciais: ${paciente.iniciais}   |   Leito: ${paciente.leito}   |   Status: ${paciente.status}`, margem, 48);
  doc.text(`Diagnóstico: ${paciente.diagnostico}`, margem, 55);

  let cursorY = 65;

  // ==========================================
  // 3. HISTÓRICO DE AVALIAÇÕES
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(modoDetalhado ? 'Evolução Clínica Detalhada (Prontuários SAE)' : 'Histórico Resumido de Avaliações', margem, cursorY);
  cursorY += 6;

  if (!avaliacoes || avaliacoes.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Nenhuma avaliação registrada para este paciente.', margem, cursorY + 5);
    cursorY += 15;
  } else if (modoDetalhado) {
    // ------------------------------------------
    // MODO DETALHADO (Blocos limpos)
    // ------------------------------------------
    avaliacoes.forEach((av) => {
      let pontuacaoStr = av.pontuacao;
      if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
        pontuacaoStr = `Total: ${av.pontuacao.total} (AO: ${av.pontuacao.ao}, RV: ${av.pontuacao.rv}, RM: ${av.pontuacao.rm})`;
      }

      const dataFormatada = new Date(av.createdAt).toLocaleString('pt-BR');
      const linhasTexto = doc.splitTextToSize(av.textoProntuario ? `SAE: ${av.textoProntuario}` : 'SAE: N/A', larguraUtil - 10);

      const alturaBloco = 28 + (linhasTexto.length * 4.5);

      if (cursorY + alturaBloco > 275) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margem, cursorY, larguraUtil, alturaBloco, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(37, 99, 235);
      doc.text(`[${av.escala}] - ${dataFormatada}`, margem + 5, cursorY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Pontuação: ${pontuacaoStr}`, margem + 5, cursorY + 14);
      doc.text(`Classificação: ${av.classificacao || 'N/A'}`, margem + 5, cursorY + 20);
      doc.text(`Avaliador: ${av.avaliadorNome || 'N/A'} (COREN: ${av.avaliadorCoren || 'N/A'})`, margem + 5, cursorY + 26);

      let ySae = cursorY + 32;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      linhasTexto.forEach((linha) => {
        doc.text(linha, margem + 5, ySae);
        ySae += 4.5;
      });

      cursorY += alturaBloco + 6;
    });
  } else {
    // ------------------------------------------
    // MODO RESUMIDO (Tabela com quebra de colunas rígida)
    // ------------------------------------------
    const colX = { data: 16, escala: 50, pontuacao: 77, classificacao: 124 };
    const colWidth = { data: 32, escala: 25, pontuacao: 45, classificacao: 68 };

    doc.setFillColor(37, 99, 235);
    doc.rect(margem, cursorY, larguraUtil, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Data / Hora', colX.data, cursorY + 5);
    doc.text('Escala', colX.escala, cursorY + 5);
    doc.text('Pontuação', colX.pontuacao, cursorY + 5);
    doc.text('Classificação', colX.classificacao, cursorY + 5);
    cursorY += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    avaliacoes.forEach((av, index) => {
      let pontuacaoStr = av.pontuacao;
      if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
        pontuacaoStr = `Total:${av.pontuacao.total} (AO:${av.pontuacao.ao} RV:${av.pontuacao.rv} RM:${av.pontuacao.rm})`;
      }

      // Quebra de texto rigorosa por coluna para evitar vazamento lateral
      const colData = doc.splitTextToSize(new Date(av.createdAt).toLocaleString('pt-BR'), colWidth.data);
      const colEscala = doc.splitTextToSize(String(av.escala || ''), colWidth.escala);
      const colPontuacao = doc.splitTextToSize(String(pontuacaoStr), colWidth.pontuacao);
      const colClassificacao = doc.splitTextToSize(String(av.classificacao || 'N/A'), colWidth.classificacao);

      const maxLinhas = Math.max(colData.length, colEscala.length, colPontuacao.length, colClassificacao.length);
      const alturaLinha = Math.max(7, maxLinhas * 4 + 3);

      if (cursorY + alturaLinha > 275) {
        doc.addPage();
        cursorY = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margem, cursorY, larguraUtil, alturaLinha, 'F');
      }

      const textStartY = cursorY + 4.5;

      let yData = textStartY;
      colData.forEach(l => { doc.text(l, colX.data, yData); yData += 4; });

      let yEscala = textStartY;
      colEscala.forEach(l => { doc.text(l, colX.escala, yEscala); yEscala += 4; });

      let yPont = textStartY;
      colPontuacao.forEach(l => { doc.text(l, colX.pontuacao, yPont); yPont += 4; });

      let yClass = textStartY;
      colClassificacao.forEach(l => { doc.text(l, colX.classificacao, yClass); yClass += 4; });

      cursorY += alturaLinha;
    });

    cursorY += 10;
  }

  // ==========================================
  // 4. GRÁFICO (Se houver)
  // ==========================================
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
      doc.text('Evolução Gráfica', margem, cursorY);
      cursorY += 6;

      doc.addImage(imgData, 'PNG', margem, cursorY, larguraUtil, 85);
    } catch (err) {
      console.error('Erro ao anexar gráfico no PDF:', err);
    }
  }

  // ==========================================
  // 5. RODAPÉ
  // ==========================================
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