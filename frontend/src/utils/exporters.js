import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportExcel = (rows, fileName) => {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Report');
  XLSX.writeFile(book, `${fileName}.xlsx`);
};

export const exportPdf = (rows, fileName, title) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const headers = Object.keys(rows[0] || {});
  doc.text(title, 14, 14);
  autoTable(doc, {
    head: [headers],
    body: rows.map((row) => headers.map((key) => row[key])),
    startY: 22,
    styles: { fontSize: 8 }
  });
  doc.save(`${fileName}.pdf`);
};
