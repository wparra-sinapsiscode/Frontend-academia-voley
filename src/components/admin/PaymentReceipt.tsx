import React, { useRef } from 'react';
import { FiDownload, FiMail, FiPrinter } from 'react-icons/fi';
import { useAppContext } from '../../contexts/AppContext';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: string;
  typeName?: string;
  method: 'efectivo' | 'transferencia' | 'tarjeta' | 'cash' | 'card' | 'transfer';
  status: 'pagado' | 'pendiente' | 'vencido' | 'paid' | 'pending' | 'overdue';
  date: string;
  datetime?: string; // Fecha y hora exacta en formato ISO
  dueDate: string;
  description?: string;
}

interface PaymentReceiptProps {
  payment: Payment;
  onClose: () => void;
  onSend?: (email: string) => void;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ payment, onClose, onSend }) => {
  const { paymentTypes } = useAppContext();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = React.useState(false);
  const [sentSuccess, setSentSuccess] = React.useState(false);
  const [parentEmail, setParentEmail] = React.useState('');

  // Handler para imprimir el comprobante (simulado)
  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Comprobante de Pago</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
        printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
        printWindow.document.write('th, td { padding: 8px; text-align: left; }');
        printWindow.document.write('th { border-bottom: 2px solid #333; }');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(receiptRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Formatear la moneda a Soles Peruanos
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Obtener el nombre del tipo de pago
  const getPaymentTypeName = (typeId: string) => {
    const paymentType = paymentTypes.find(pt => pt.id === typeId);
    return paymentType ? paymentType.name : typeId;
  };

  // Obtener el nombre del método de pago
  const getPaymentMethodName = (method: string) => {
    const methodNames: Record<string, string> = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'tarjeta': 'Tarjeta',
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'card': 'Tarjeta'
    };
    return methodNames[method] || method;
  };

  // Formatear fecha a formato legible
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Formatear fecha y hora a formato legible
  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Simular envío de comprobante por correo
  const handleSendEmail = () => {
    setSending(true);
    
    // Simulación de envío (en una app real, aquí iría la lógica de API)
    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      if (onSend) onSend(parentEmail);
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSentSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl">
        {/* Header con acciones */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comprobante de Pago</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              title="Imprimir"
            >
              <FiPrinter size={20} />
            </button>
            <button
              onClick={() => {
                // Crear contenido para descargar como texto
                const content = `
COMPROBANTE DE PAGO - ACADEMIA DE VÓLEY
=======================================

Nº: ${payment.id}
Fecha: ${formatDate(payment.date)}

DATOS DEL ESTUDIANTE
-------------------
Nombre: ${payment.studentName}
ID: ${payment.studentId}

DETALLES DEL PAGO
-----------------
Concepto: ${payment.typeName || getPaymentTypeName(payment.type)}
Descripción: ${payment.description || '-'}
Monto: ${formatCurrency(payment.amount)}

Método de pago: ${getPaymentMethodName(payment.method)}
Estado: ${payment.status === 'paid' || payment.status === 'pagado' ? 'Pagado' : payment.status}

=======================================
Este comprobante es un documento válido de pago.
Gracias por confiar en nuestra academia.
`;
                const blob = new Blob([content], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Comprobante_${payment.id}_${payment.studentName.replace(/\s+/g, '_')}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              title="Descargar comprobante"
            >
              <FiDownload size={20} />
            </button>
          </div>
        </div>

        {/* Contenido del comprobante (printable) */}
        <div className="p-6" ref={receiptRef}>
          {/* Cabecera del comprobante */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academia de Vóley</h1>
              <p className="text-gray-600 dark:text-gray-400">Av. Ejemplo 1234, Lima, Perú</p>
              <p className="text-gray-600 dark:text-gray-400">academiavoley@example.com</p>
              <p className="text-gray-600 dark:text-gray-400">+51 123 456 789</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">RECIBO</h2>
              <p className="text-gray-600 dark:text-gray-400">Nº: {payment.id}</p>
              <p className="text-gray-600 dark:text-gray-400">Fecha: {formatDate(payment.date)}</p>
              <p className="text-gray-600 dark:text-gray-400">Registrado: {formatDateTime(payment.datetime)}</p>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Datos del Estudiante</h3>
            <p className="text-gray-900 dark:text-gray-100"><span className="font-medium">Nombre:</span> {payment.studentName}</p>
            <p className="text-gray-900 dark:text-gray-100"><span className="font-medium">ID:</span> {payment.studentId}</p>
          </div>

          {/* Detalles del pago */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Detalles del Pago</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-900 dark:text-gray-100">Concepto</th>
                  <th className="text-left py-2 text-gray-900 dark:text-gray-100">Descripción</th>
                  <th className="text-right py-2 text-gray-900 dark:text-gray-100">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 text-gray-900 dark:text-gray-100">{payment.typeName || getPaymentTypeName(payment.type)}</td>
                  <td className="py-2 text-gray-900 dark:text-gray-100">{payment.description || '-'}</td>
                  <td className="py-2 text-right text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td colSpan={2} className="py-2 text-right font-semibold text-gray-900 dark:text-gray-100">Total:</td>
                  <td className="py-2 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Información adicional */}
          <div className="mb-6">
            <p className="text-gray-900 dark:text-gray-100"><span className="font-medium">Método de pago:</span> {getPaymentMethodName(payment.method)}</p>
            <p className="text-gray-900 dark:text-gray-100"><span className="font-medium">Estado:</span> {payment.status === 'paid' || payment.status === 'pagado' ? 'Pagado' : payment.status === 'pending' || payment.status === 'pendiente' ? 'Pendiente' : payment.status === 'overdue' || payment.status === 'vencido' ? 'Vencido' : payment.status}</p>
            {payment.status !== 'pagado' && (
              <p className="text-gray-900 dark:text-gray-100"><span className="font-medium">Fecha de vencimiento:</span> {formatDate(payment.dueDate)}</p>
            )}
          </div>

          {/* Pie de página */}
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-10">
            <p>Este comprobante es un documento válido de pago.</p>
            <p>Gracias por confiar en nuestra academia.</p>
          </div>
        </div>

        {/* Sección para enviar por correo */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Enviar a padre/tutor</h3>
          <div className="flex space-x-2">
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendEmail}
              disabled={!parentEmail || sending}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                !parentEmail || sending 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <FiMail size={16} />
              <span>{sending ? 'Enviando...' : 'Enviar'}</span>
            </button>
          </div>
          {sentSuccess && (
            <p className="text-green-600 mt-2">¡Comprobante enviado con éxito!</p>
          )}
        </div>

        {/* Acciones del modal */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;