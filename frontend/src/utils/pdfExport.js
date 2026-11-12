import { jsPDF } from 'jspdf';

export const exportarProntuarioPDF = (paciente, avaliacoes, profissional) => {
    const doc = new jsPDF();
    let posY = 20;

    // Cabeçalho institucional
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Cor primária (--primary-color)
    doc.text('NeuroRisco - Relatório de Enfermagem e SAE', 14, posY);

    posY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')} | Profissional: ${profissional?.nome || 'N/A'} (COREN: ${profissional?.coren || 'N/A'})`, 14, posY);

    posY += 10;
    doc.setLineWidth(0.5);
    doc.setLineColor(226, 232, 240);
    doc.line(14, posY, 196, posY);

    // Dados do Paciente (LGPD)
    posY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Dados do Paciente', 14, posY);

    posY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Iniciais: ${paciente.iniciais}`, 14, posY);
    doc.text(`Leito: ${paciente.leito}`, 80, posY);
    doc.text(`Status: ${paciente.status}`, 140, posY);

    posY += 6;
    doc.text(`Diagnóstico: ${paciente.diagnostico}`, 14, posY);

    posY += 10;
    doc.line(14, posY, 196, posY);

    // Histórico de Avaliações
    posY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Histórico de Avaliações Clínicas e Escalas', 14, posY);

    if (!avaliacoes || avaliacoes.length === 0) {
        posY += 8;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text('Nenhuma avaliação registrada para este paciente.', 14, posY);
    } else {
        avaliacoes.forEach((av, index) => {
            // Verifica quebra de página se o conteúdo extrapolar a folha (A4 ~ 280mm)
            if (posY > 250) {
                doc.addPage();
                posY = 20;
            }

            posY += 8;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(59, 130, 246);
            doc.text(`${index + 1}. Escala: ${av.escala} - ${new Date(av.createdAt).toLocaleString('pt-BR')}`, 14, posY);

            posY += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            doc.text(`Classificação: ${av.classificacao}`, 14, posY);

            posY += 5;
            doc.text(`Avaliador: ${av.avaliadorNome} (COREN: ${av.avaliadorCoren})`, 14, posY);

            // Bloco de texto do prontuário formatado
            posY += 6;
            doc.setFont('courier', 'normal');
            doc.setFontSize(9);
            const linhasTexto = doc.splitTextToSize(av.textoProntuario, 180);
            doc.setFillColor(248, 250, 252);
            doc.rect(14, posY - 4, 182, (linhasTexto.length * 4) + 6, 'F');
            doc.text(linhasTexto, 16, posY + 1);

            posY += (linhasTexto.length * 4) + 10;
            doc.setFont('helvetica', 'normal');
        });
    }

    // Rodapé do PDF
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`NeuroRisco - Página ${i} de ${totalPages}`, 14, 290);
    }

    // Disparar download automático do PDF
    doc.save(`Prontuario_${paciente.iniciais}_Leito_${paciente.leito}.pdf`);
};