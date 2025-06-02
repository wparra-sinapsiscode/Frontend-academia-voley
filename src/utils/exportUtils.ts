// Utility functions for exporting data to CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle different data types
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toLocaleDateString('es-ES');
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      return value;
    });
    csvContent += values.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format payment data for export
export const formatPaymentDataForExport = (payments: any[], studentName: string) => {
  return payments.map(payment => {
    let estado = '';
    if (payment.rejected) {
      estado = 'Rechazado';
    } else if (payment.status === 'paid') {
      if (payment.pendingApproval) {
        estado = 'Pendiente de aprobación';
      } else if (payment.approved) {
        estado = 'Pagado y aprobado';
      } else {
        estado = 'Pagado';
      }
    } else if (payment.status === 'pending') {
      estado = 'Pendiente';
    } else if (payment.status === 'overdue') {
      estado = 'Vencido';
    } else {
      estado = payment.status;
    }
    
    return {
      'ID': payment.id,
      'Fecha de Vencimiento': payment.dueDate,
      'Descripción': payment.description || 'Sin descripción',
      'Monto (S/)': payment.amount,
      'Estado': estado,
      'Fecha de Pago': payment.paidDate || '-',
      'Método de Pago': payment.method === 'card' ? 'Tarjeta' : payment.method === 'transfer' ? 'Transferencia' : payment.method === 'cash' ? 'Efectivo' : payment.method || '-',
      'Estudiante': studentName,
      'Aprobado': payment.approved ? 'Sí' : payment.pendingApproval ? 'Pendiente' : 'No',
      'Motivo de Rechazo': payment.rejectionReason || '-'
    };
  });
};