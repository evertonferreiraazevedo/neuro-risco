import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportarProntuarioPDF = async (paciente, avaliacoes = [], usuario = {}, canvasElement = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho institucional
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
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
  doc.line(14, 34, pageWidth - 14, 34);

  // Seção de Identificação do Paciente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Identificação do Paciente', 14, 43);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Iniciais: ${paciente.iniciais}   |   Leito: ${paciente.leito}   |   Status: ${paciente.status}`, 14, 50);
  doc.text(`Diagnóstico / Hipótese Neurológica: ${paciente.diagnostico}`, 14, 57);

  let cursorY = 67;

  // Seção de Histórico de Avaliações
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Histórico de Avaliações Clínicas e Escalas', 14, cursorY);
  cursorY += 6;

  if (!avaliacoes || avaliacoes.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Nenhuma avaliação registrada para este paciente.', 14, cursorY + 5);
    cursorY += 15;
  } else {
    const tableRows = avaliacoes.map((av) => {
      let pontuacaoStr = av.pontuacao;
      
      // Tratamento robusto para formatar o objeto do Glasgow ou outras escalas
      if (typeof av.pontuacao === 'object' && av.pontuacao !== null) {
        const total = av.pontuacao.total ?? '-';
        const ao = av.pontuacao.ao ?? '-';
        const rv = av.pontuacao.rv ?? '-';
        const rm = av.pontuacao.rm ?? '-';
        pontuacaoStr = `Total: ${total} (AO: ${ao}, RV: ${rv}, RM: ${rm})`;
      }

      return [
        new Date(av.createdAt).toLocaleString('pt-BR'),
        av.escala,
        pontuacaoStr,
        av.classificacao || 'N/A',
        `${av.avaliadorNome || 'N/A'} (COREN: ${av.avaliadorCoren || 'N/A'})`
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      head: [['Data / Hora', 'Escala', 'Pontuação', 'Classificação', 'Avaliador']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [15, 23, 42] },
      margin: { left: 14, right: 14 }
    });

    cursorY = doc.lastAutoTable.finalY + 12;
  }

  // Se houver um gráfico visível na tela (Canvas), insere ele no PDF
  if (canvasElement) {
    try {
      const imgData = canvasElement.toDataURL('image/png');
      
      if (cursorY > 190) {
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

  // Salva o arquivo PDF
  doc.save(`Prontuario_${paciente.iniciais.replace(/\s+/g, '_')}_${paciente.leito}.pdf`);
};