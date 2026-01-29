import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CompanyData {
  name: string;
  cnpj?: string;
  address?: string;
  phone?: string;
}

export interface ReceiptPDFOptions {
  company: CompanyData;
  sale: any;
}



export async function generateReceiptPDF({ company, sale }: ReceiptPDFOptions) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Cabeçalho empresa centralizado
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name || 'Nome da Empresa', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (company.cnpj) { doc.text(`CNPJ: ${company.cnpj}`, pageWidth / 2, y, { align: 'center' }); y += 5; }
  if (company.address) { doc.text(company.address, pageWidth / 2, y, { align: 'center' }); y += 5; }
  if (company.phone) { doc.text(`Fone: ${company.phone}`, pageWidth / 2, y, { align: 'center' }); y += 5; }
  y += 2;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROVANTE DE VENDA / ORDEM DE SERVIÇO', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Dados da venda
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${new Date(sale?.createdAt || Date.now()).toLocaleString()}`, 20, y);
  if (sale?.id) doc.text(`Venda Nº: ${sale.id}`, pageWidth - 20, y, { align: 'right' });
  y += 5;
  if (sale?.clientName) {
    doc.text(`Cliente: ${sale.clientName}`, 20, y);
    if (sale.clientCpf) doc.text(`CPF: ${sale.clientCpf}`, pageWidth - 20, y, { align: 'right' });
    y += 5;
  }
  y += 2;

  // Itens vendidos (tabela ocupa toda a largura útil)
  autoTable(doc, {
    startY: y,
    head: [["Item", "Qtd", "Unitário", "Subtotal"]],
    body: sale?.items?.map((item: any) => [
      item.productName,
      String(item.quantity),
      `R$ ${(item.unitPrice / 100).toFixed(2)}`,
      `R$ ${((item.unitPrice * item.quantity) / 100).toFixed(2)}`
    ]) || [],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [220, 220, 220], halign: 'center', fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80 }, // Item
      1: { cellWidth: 20, halign: 'center' }, // Qtd
      2: { cellWidth: 30, halign: 'right' }, // Unitário
      3: { cellWidth: 30, halign: 'right' }, // Subtotal
    },
    margin: { left: 20, right: 20 },
    theme: 'grid',
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Totais
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  if (sale?.discountCents > 0) {
    doc.text(`Desconto:`, 120, y);
    doc.text(`- R$ ${(sale.discountCents / 100).toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
    y += 6;
  }
  doc.text(`Total:`, 120, y);
  doc.text(`R$ ${(sale?.total ? sale.total / 100 : 0).toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
  y += 8;

  // Pagamentos
  if (sale?.payments?.length) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Pagamentos:', 20, y);
    y += 5;
    sale.payments.forEach((p: any) => {
      doc.text(`- ${p.method}:`, 30, y);
      doc.text(`R$ ${(p.amount / 100).toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
      y += 5;
    });
    y += 2;
  }

  // Observações/rodapé
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Documento gerado eletronicamente. Não possui valor fiscal.', pageWidth / 2, 287, { align: 'center' });

  // Geração do PDF como Blob
  const pdfBlob = doc.output('blob');
  const fileName = `comprovante_${sale?.id || Date.now()}.pdf`;

  // Web Share API (mobile)
  // @ts-ignore
  if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
    try {
      // @ts-ignore
      await navigator.share({
        files: [new File([pdfBlob], fileName, { type: 'application/pdf' })],
        title: 'Comprovante de Venda',
        text: 'Segue o comprovante da sua venda/serviço.'
      });
      return;
    } catch (e) {
      // Se o usuário cancelar ou der erro, faz o download normalmente
    }
  }

  // Fallback: download normal
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
