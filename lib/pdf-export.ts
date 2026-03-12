import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from './types';

export const exportTransactionsToPDF = (
    transactions: Transaction[],
    title: string,
    subtitle?: string
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // var(--income) / green
    doc.text('Agente Daddy 🐾', 14, 22);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 32);

    if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, 14, 38);
    }

    // Line
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 42, pageWidth - 14, 42);

    // Table
    const tableData = transactions.map(t => [
        new Date(t.date).toLocaleDateString('es-ES'),
        t.description,
        t.type === 'income' ? 'Ingreso' : 'Gasto',
        `${t.amount.toFixed(2)} €`,
        t.is_confirmed ? 'Confirmado' : 'Pendiente'
    ]);

    autoTable(doc, {
        startY: 48,
        head: [['Fecha', 'Descripción', 'Tipo', 'Importe', 'Estado']],
        body: tableData,
        headStyles: { fillColor: [22, 163, 74] }, // Green
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 9 },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Ingresos: ${totalIncome.toFixed(2)} €`, 14, finalY);
    doc.text(`Total Gastos: ${totalExpense.toFixed(2)} €`, 14, finalY + 6);

    doc.setFont('helvetica', 'bold');
    doc.text(`Balance: ${(totalIncome - totalExpense).toFixed(2)} €`, 14, finalY + 12);

    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
};
