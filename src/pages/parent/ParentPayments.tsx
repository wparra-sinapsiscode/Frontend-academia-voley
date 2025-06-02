import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiCalendar, 
  FiCheck,
  FiAlertCircle,
  FiDownload,
  FiEye,
  FiClock,
  FiTrendingUp,
  FiFileText,
  FiImage,
  FiX,
  FiUpload,
  FiTrash2
} from 'react-icons/fi';
import PaymentReceipt from '../../components/admin/PaymentReceipt';
import { exportToCSV, formatPaymentDataForExport } from '../../utils/exportUtils';
import { 
  processImageFile, 
  generateThumbnail, 
  formatFileSize, 
  isValidBase64Image,
  downloadBase64Image,
  validateImageFile 
} from '../../utils/imageUtils';

// Helper function to safely format dates
const formatDateSafe = (date: any): string => {
  if (!date) return 'No especificada';
  
  try {
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error en fecha';
  }
};

const ParentPayments: React.FC = () => {
  const { user, students, payments, updatePayment, paymentTypes, addPayment, categories } = useAppContext();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucherUrl, setSelectedVoucherUrl] = useState<string>('');
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [selectedPaymentSpecs, setSelectedPaymentSpecs] = useState<any>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [paymentToPay, setPaymentToPay] = useState<any>(null);
  
  // Estados para manejo de imágenes
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Helper function to get voucher image URL
  const getVoucherImageUrl = (payment: any): string | null => {
    // Priorizar imagen base64 si existe
    if (payment?.voucherImage && isValidBase64Image(payment.voucherImage)) {
      return payment.voucherImage;
    }
    
    // Fallback a voucherUrl para compatibilidad
    const voucherUrl = payment?.voucherUrl;
    if (!voucherUrl) return null;
    
    // If it's already a valid URL, use it
    if (voucherUrl.startsWith('http://') || voucherUrl.startsWith('https://')) {
      return voucherUrl;
    }
    
    // If it's a filename, return a demo image based on file type
    if (voucherUrl.includes('.pdf')) {
      return 'https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Documento+PDF';
    }
    
    // For image files, return a demo voucher image
    if (voucherUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const demoImages = [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586980515824-c8c8e9e15e37?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1565735567350-3bead0a006e1?w=600&h=400&fit=crop'
      ];
      const hash = voucherUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return demoImages[hash % demoImages.length];
    }
    
    return 'https://via.placeholder.com/600x400/9333EA/FFFFFF?text=Comprobante+de+Pago';
  };

  // Function to handle image file selection
  const handleImageFileSelect = async (file: File) => {
    setImageError(null);
    setUploadingImage(true);
    
    try {
      // Validar archivo
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setImageError(validation.error || 'Archivo inválido');
        return;
      }

      // Procesar imagen
      const processedImage = await processImageFile(file);
      
      // Generar thumbnail para preview
      const thumbnail = await generateThumbnail(processedImage.base64, 200);
      
      setSelectedImageFile(file);
      setImagePreview(thumbnail);
      
      console.log('Imagen procesada:', {
        fileName: processedImage.fileName,
        originalSize: formatFileSize(processedImage.originalSize),
        finalSize: formatFileSize(processedImage.fileSize),
        compressed: processedImage.compressed
      });
      
    } catch (error) {
      console.error('Error procesando imagen:', error);
      setImageError(error instanceof Error ? error.message : 'Error procesando imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  // Function to clear selected image
  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setImageError(null);
    
    // Clear file input
    const fileInput = document.getElementById('voucher') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Find the student associated with this parent
  const myStudent = students.find(s => s.parentId === user?.id);
  
  if (!myStudent) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Gestión de Pagos</h1>
        <p className="text-gray-600 dark:text-gray-400">No se encontró información de la estudiante asociada.</p>
      </div>
    );
  }

  // Get payments for this student
  const studentPayments = payments.filter(p => p.studentId === myStudent.id);
  
  // Get available years dynamically
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    studentPayments.forEach(payment => {
      years.add(payment.dueDate.getFullYear());
      if (payment.paidDate) {
        years.add(payment.paidDate.getFullYear());
      }
    });
    // Add current year if not present
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [studentPayments]);
  
  const currentYearPayments = studentPayments.filter(p => p.dueDate.getFullYear() === selectedYear);
  
  // Calculate statistics - MEJORADA LÓGICA DE CÁLCULOS
  
  // Total Pagado: Solo pagos completamente aprobados (todos los años)
  const totalPaid = studentPayments
    .filter(p => 
      p.status === 'paid' && 
      p.approved === true && 
      p.rejected !== true
    )
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Pendiente: Pagos del año actual que necesitan atención
  // Incluye: pendientes, vencidos, y rechazados (independiente del año si fueron rechazados)
  const pendingPayments = currentYearPayments.filter(p => 
    (p.status === 'pending' || p.status === 'overdue') ||
    (p.rejected === true)
  );
  
  // Vencidos: Solo pagos overdue del año actual que no han sido pagados y aprobados
  const overduePayments = currentYearPayments.filter(p => 
    p.status === 'overdue' && 
    !(p.status === 'paid' && p.approved === true)
  );
  
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  
  // Obtener monto de mensualidad dinámicamente de la categoría del estudiante
  const studentCategory = categories.find(c => c.id === myStudent.categoryId);
  const monthlyAmount = studentCategory?.monthlyFee || 150;

  const handlePayment = (paymentId: string) => {
    // Si el pago fue rechazado, resetear el estado de rechazo
    const payment = studentPayments.find(p => p.id === paymentId);
    if (payment) {
      if (payment.rejected) {
        // Para pagos rechazados, establecer el pago y abrir el modal para reintentar
        setPaymentToPay(payment);
        setShowPaymentModal(true);
      } else {
        // Para pagos pendientes o vencidos
        setPaymentToPay(payment);
        setShowPaymentModal(true);
      }
    }
  };

  const getStatusBadge = (payment: any) => {
    const status = payment.status;
    
    if (status === 'paid') {
      if (payment.rejected) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            <FiAlertCircle className="w-3 h-3" />
            Rechazado
          </span>
        );
      } else if (payment.pendingApproval) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
            <FiClock className="w-3 h-3" />
            Pendiente de aprobación
          </span>
        );
      } else if (payment.approved) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <FiCheck className="w-3 h-3" />
            Pagado y aprobado
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <FiCheck className="w-3 h-3" />
            Pagado
          </span>
        );
      }
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
          <FiClock className="w-3 h-3" />
          Pendiente
        </span>
      );
    } else if (status === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
          <FiAlertCircle className="w-3 h-3" />
          Vencido
        </span>
      );
    } else {
      return null;
    }
  };

  const getPaymentStatusColor = (payment: any) => {
    if (payment.rejected) {
      return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
    }
    if (payment.pendingApproval) {
      return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
    }
    switch (payment.status) {
      case 'paid': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
      case 'pending': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'overdue': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      default: return 'border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Pagos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra los pagos de {myStudent.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setPaymentToPay(null);
              setShowPaymentModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <FiCreditCard className="w-5 h-5 mr-2" />
            Registrar Pago
          </button>
          <button 
            onClick={() => {
              const dataToExport = formatPaymentDataForExport(studentPayments, myStudent.name);
              exportToCSV(dataToExport, `pagos_${myStudent.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
            }}
            className="btn-secondary flex items-center"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Exportar Historial
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">¡Pago registrado con éxito!</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                El administrador recibirá una notificación para aprobar tu pago.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="ml-4 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">S/ {totalPaid.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Pagos aprobados</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendiente</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">S/ {totalPending.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{pendingPayments.length} pagos</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencidos</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overduePayments.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Requieren atención</p>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mensualidad</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">S/ {monthlyAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{studentCategory?.name || 'Categoría'}</p>
            </div>
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
              <FiDollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center gap-4">
          <FiCalendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Año:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input-field w-auto"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
        >
          <div className="flex items-start gap-4">
            <FiAlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                Tienes {pendingPayments.length} pago(s) {pendingPayments.some(p => p.rejected) ? 'pendientes/rechazados' : 'pendientes'}
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Total pendiente: S/ {totalPending.toLocaleString()}. 
                {pendingPayments.some(p => p.rejected) 
                  ? ' Algunos pagos han sido rechazados y requieren corrección.' 
                  : ' Es importante mantener los pagos al día para asegurar la continuidad de las clases.'
                }
              </p>
              <button 
                onClick={() => {
                  setPaymentToPay(null);
                  setShowPaymentModal(true);
                }}
                className="btn-accent mt-3"
              >
                {pendingPayments.some(p => p.rejected) ? 'Corregir Pagos' : 'Pagar Ahora'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historial de Pagos - {selectedYear}
          </h3>
          <div className="flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentYearPayments.length} registros</span>
          </div>
        </div>

        <div className="space-y-4">
          {currentYearPayments
            .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
            .map((payment) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-lg border-2 transition-all hover:shadow-md ${getPaymentStatusColor(payment)}`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{payment.description}</h4>
                      {getStatusBadge(payment)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Monto:</span>
                        <p className="font-medium text-gray-900 dark:text-white">S/ {payment.amount.toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Vencimiento:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDateSafe(payment.dueDate)}
                        </p>
                      </div>
                      
                      {payment.paidDate && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Fecha de Pago:</span>
                          <p className="font-medium text-green-600 dark:text-green-400">
                            {formatDateSafe(payment.paidDate)}
                          </p>
                        </div>
                      )}
                      
                      {payment.method && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Método:</span>
                          <p className="font-medium capitalize text-gray-900 dark:text-white">{payment.method}</p>
                        </div>
                      )}
                    </div>
                    
                    {payment.rejected && payment.rejectionReason && (
                      <div className="col-span-2 md:col-span-4 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <strong>Motivo del rechazo:</strong> {payment.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedPaymentSpecs(payment);
                          setShowSpecsModal(true);
                        }}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        title="Ver especificaciones"
                      >
                        <FiEye size={20} />
                      </button>
                      {payment.status === 'paid' && !payment.rejected && payment.approved ? (
                      <button 
                        className="btn-secondary text-sm"
                        onClick={() => {
                          // Preparar el pago para el formato que espera el componente de comprobante
                          const formattedPayment = {
                            id: payment.id,
                            studentId: payment.studentId,
                            studentName: myStudent.name,
                            amount: payment.amount,
                            type: payment.period,
                            typeName: payment.description,
                            method: payment.method || 'card',
                            status: payment.status,
                            date: payment.paidDate ? payment.paidDate.toISOString().split('T')[0] : '',
                            dueDate: payment.dueDate.toISOString().split('T')[0],
                            description: payment.description
                          };
                          setSelectedPayment(formattedPayment);
                          setShowReceiptModal(true);
                        }}
                      >
                        <FiFileText className="w-4 h-4 mr-2" />
                        Ver Comprobante
                      </button>
                    ) : payment.status === 'paid' && payment.pendingApproval ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        <FiClock className="w-4 h-4" />
                        Esperando aprobación
                      </span>
                    ) : payment.rejected ? (
                      <button 
                        onClick={() => handlePayment(payment.id)}
                        className="btn-primary text-sm"
                      >
                        <FiCreditCard className="w-4 h-4 mr-2" />
                        Reintentar pago
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePayment(payment.id)}
                        className="btn-primary text-sm"
                      >
                        <FiCreditCard className="w-4 h-4 mr-2" />
                        Pagar S/ {payment.amount}
                      </button>
                    )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {currentYearPayments.length === 0 && (
          <div className="text-center py-12">
            <FiCreditCard className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay pagos registrados</h3>
            <p className="text-gray-500 dark:text-gray-400">Los pagos aparecerán aquí una vez que sean generados.</p>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Métodos de Pago</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <FiCreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-900 dark:text-gray-100">Tarjeta de Crédito/Débito</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <FiDollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-900 dark:text-gray-100">Transferencia Bancaria</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <FiCreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-900 dark:text-gray-100">Efectivo (en academia)</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Información Importante</h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• Los pagos vencen el día 5 de cada mes</p>
            <p>• Mora de S/ 20 después de 15 días</p>
            <p>• Descuento 5% por pago anual adelantado</p>
            <p>• Recibos disponibles inmediatamente</p>
          </div>
        </div>

        <div className="card">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Contacto</h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600 dark:text-gray-400">¿Problemas con tu pago?</p>
            <p className="font-medium text-blue-600 dark:text-blue-400">admin@academiavorley.com</p>
            <p className="font-medium text-blue-600 dark:text-blue-400">+51 987 654 321</p>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm">
              Enviar mensaje
            </button>
          </div>
        </div>
      </motion.div>

      {/* Payment Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <PaymentReceipt
          payment={selectedPayment}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedPayment(null);
          }}
          onSend={(email) => {
            console.log(`Enviando comprobante a ${email}`);
            // Aquí iría la lógica para enviar el comprobante por correo (en una app real)
          }}
        />
      )}

      {/* Register Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {paymentToPay ? `Pagar: ${paymentToPay.description}` : 'Registrar Nuevo Pago'}
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              
              try {
                let voucherData: any = {};
                
                // Procesar imagen si se seleccionó una
                if (selectedImageFile) {
                  const processedImage = await processImageFile(selectedImageFile);
                  const thumbnail = await generateThumbnail(processedImage.base64, 150);
                  
                  voucherData = {
                    voucherImage: processedImage.base64,
                    voucherFileName: processedImage.fileName,
                    voucherFileSize: processedImage.fileSize,
                    voucherUploadDate: new Date(),
                    voucherThumbnail: thumbnail,
                    voucherUrl: processedImage.fileName // Mantener para compatibilidad
                  };
                }
                
                if (paymentToPay) {
                  // Actualizar pago existente
                  const paymentMethod = formData.get('method') as 'cash' | 'card' | 'transfer';
                  
                  updatePayment(paymentToPay.id, {
                    status: 'paid',
                    paidDate: new Date(),
                    method: paymentMethod,
                    pendingApproval: true,
                    rejected: false,
                    rejectionReason: undefined,
                    ...voucherData
                  });
                } else {
                  // Crear nuevo pago
                  const paymentType = formData.get('type') as string;
                  const paymentAmount = parseFloat(formData.get('amount') as string);
                  const paymentMethod = formData.get('method') as 'cash' | 'card' | 'transfer';
                  const description = formData.get('description') as string;
                  
                  // Buscar el nombre del tipo de pago seleccionado
                  const selectedType = paymentTypes.find(t => t.id === paymentType);
                  const typeName = selectedType ? selectedType.name : paymentType;
                  
                  // Crear el nuevo pago
                  const newPayment = {
                    studentId: myStudent.id,
                    amount: paymentAmount,
                    dueDate: new Date(), 
                    paidDate: new Date(),
                    status: 'paid' as const,
                    method: paymentMethod,
                    description: description || `${typeName} - ${formatDateSafe(new Date())}`,
                    period: paymentType,
                    pendingApproval: true,
                    ...voucherData
                  };
                  
                  // Agregar el pago usando la función del contexto
                  console.log('🔄 Creando nuevo pago desde padre:', newPayment);
                  addPayment(newPayment);
                  console.log('✅ Pago creado y enviado al contexto');
                }
                
                // Limpiar estado de imagen
                clearSelectedImage();
                
                // Cerramos el modal
                setShowPaymentModal(false);
                setPaymentToPay(null);
                
                // Mostrar alerta de éxito
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 5000);
                
              } catch (error) {
                console.error('Error procesando pago:', error);
                alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
              }
            }}>
              <div className="space-y-4">
                {paymentToPay && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Concepto:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{paymentToPay.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Monto a pagar:</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">S/ {paymentToPay.amount}</p>
                  </div>
                )}
                
                {!paymentToPay && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Pago
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {paymentTypes.length > 0 ? (
                      paymentTypes
                        .filter(type => type.active)
                        .map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))
                    ) : (
                      <>
                        <option value="mensualidad">Mensualidad</option>
                        <option value="inscripcion">Inscripción</option>
                        <option value="torneo">Torneo</option>
                        <option value="uniforme">Uniforme</option>
                      </>
                    )}
                  </select>
                </div>
                )}
                
                {!paymentToPay && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monto (S/)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="1"
                    defaultValue="300"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Método de Pago
                  </label>
                  <select
                    name="method"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="card">Tarjeta de Crédito/Débito</option>
                    <option value="transfer">Transferencia Bancaria</option>
                    <option value="cash">Efectivo</option>
                  </select>
                </div>
                
                {!paymentToPay && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Ej. Mensualidad Marzo 2024"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adjuntar Comprobante de Pago
                  </label>
                  
                  {/* Error message */}
                  {imageError && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{imageError}</p>
                    </div>
                  )}
                  
                  {/* Image preview */}
                  {imagePreview ? (
                    <div className="mb-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-start gap-3">
                        <img 
                          src={imagePreview} 
                          alt="Preview del voucher" 
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedImageFile?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedImageFile ? formatFileSize(selectedImageFile.size) : ''}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Imagen lista para subir
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={clearSelectedImage}
                          className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Eliminar imagen"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <input
                        type="file"
                        name="voucher"
                        id="voucher"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleImageFileSelect(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="voucher"
                        className={`
                          relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
                          ${uploadingImage 
                            ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <div className="text-center">
                          {uploadingImage ? (
                            <>
                              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Procesando imagen...</p>
                            </>
                          ) : (
                            <>
                              <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Haz clic para seleccionar un archivo
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                o arrastra y suelta aquí
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Formatos aceptados: JPG, PNG, PDF • Máximo 5MB • Se comprimirá automáticamente si es necesario
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentToPay(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Voucher Modal */}
      {showVoucherModal && selectedVoucherUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowVoucherModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVoucherModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-lg font-medium"
            >
              ✕ Cerrar
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              {(() => {
                // Check if selectedVoucherUrl is a base64 image or regular URL
                if (isValidBase64Image(selectedVoucherUrl)) {
                  return (
                    <div className="relative">
                      <img 
                        src={selectedVoucherUrl} 
                        alt="Voucher completo"
                        className="max-w-full max-h-[80vh] object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/600x400?text=Error+cargando+imagen';
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadBase64Image(selectedVoucherUrl, 'voucher.jpg');
                          }}
                          className="px-3 py-2 bg-blue-600/80 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/80 flex items-center gap-2"
                          title="Descargar imagen"
                        >
                          <FiDownload className="w-4 h-4" />
                          Descargar
                        </button>
                      </div>
                    </div>
                  );
                } else if (selectedVoucherUrl.startsWith('http')) {
                  // External URL (demo images)
                  return (
                    <img 
                      src={selectedVoucherUrl} 
                      alt="Voucher completo"
                      className="max-w-full max-h-[80vh] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/600x400?text=Error+cargando+imagen';
                      }}
                    />
                  );
                } else {
                  // File name or other format
                  return (
                    <div className="p-8 text-center">
                      <FiFileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                        Archivo: {selectedVoucherUrl}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Este archivo no se puede mostrar como imagen. Puede ser un documento PDF o un formato no compatible.
                      </p>
                      <button
                        onClick={() => {
                          // For filename-only vouchers, show a message
                          alert('Este comprobante es un archivo local que no se puede mostrar. En una implementación completa, se abriría o descargaría el archivo.');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Ver archivo
                      </button>
                    </div>
                  );
                }
              })()}
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Payment Specifications Modal */}
      {showSpecsModal && selectedPaymentSpecs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Especificaciones del Pago</h3>
              <button
                onClick={() => {
                  setShowSpecsModal(false);
                  setSelectedPaymentSpecs(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Specifications */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Detalles del Pago</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID del Pago</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 font-mono">{selectedPaymentSpecs.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estudiante</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{myStudent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Pago</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {paymentTypes.find(t => t.id === selectedPaymentSpecs.period)?.name || selectedPaymentSpecs.period}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Monto</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-lg">S/ {selectedPaymentSpecs.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Método de Pago</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{selectedPaymentSpecs.method || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                      <div className="mt-1">{getStatusBadge(selectedPaymentSpecs)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Pago</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedPaymentSpecs.paidDate ? formatDateSafe(selectedPaymentSpecs.paidDate) : 'No pagado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Vencimiento</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDateSafe(selectedPaymentSpecs.dueDate)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedPaymentSpecs.description && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Descripción</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPaymentSpecs.description}</p>
                    </div>
                  )}
                  
                  {selectedPaymentSpecs.approved && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FiCheck className="text-green-600 dark:text-green-400" />
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Pago Aprobado</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Por: {selectedPaymentSpecs.approvedBy || 'Administrador'} • 
                        Fecha: {formatDateSafe(selectedPaymentSpecs.approvedDate)}
                      </p>
                    </div>
                  )}
                  
                  {selectedPaymentSpecs.rejected && selectedPaymentSpecs.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FiAlertCircle className="text-red-600 dark:text-red-400" />
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Pago Rechazado</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Motivo: {selectedPaymentSpecs.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Right Column - Voucher */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Comprobante de Pago</h4>
                  
                  {(selectedPaymentSpecs.voucherImage || selectedPaymentSpecs.voucherUrl) ? (
                    <div>
                      <div className="relative group cursor-pointer rounded-lg overflow-hidden" 
                           onClick={() => {
                             // Priorizar imagen base64, luego voucherUrl
                             const imageToShow = selectedPaymentSpecs.voucherImage || selectedPaymentSpecs.voucherUrl;
                             setSelectedVoucherUrl(imageToShow);
                             setShowVoucherModal(true);
                           }}>
                        {(() => {
                          const imageUrl = getVoucherImageUrl(selectedPaymentSpecs);
                          if (imageUrl && (isValidBase64Image(imageUrl) || imageUrl.startsWith('http'))) {
                            return (
                              <img 
                                src={imageUrl} 
                                alt="Comprobante de pago"
                                className="w-full h-64 object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                                }}
                              />
                            );
                          } else {
                            return (
                              <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <FiFileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                              </div>
                            );
                          }
                        })()}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiEye className="w-10 h-10 mx-auto mb-2" />
                            <p className="text-sm">Click para ver completo</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* File info */}
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Archivo: {selectedPaymentSpecs.voucherFileName || selectedPaymentSpecs.voucherUrl?.split('/').pop() || 'voucher'}
                        </p>
                        {selectedPaymentSpecs.voucherFileSize && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Tamaño: {formatFileSize(selectedPaymentSpecs.voucherFileSize)}
                          </p>
                        )}
                        {selectedPaymentSpecs.voucherUploadDate && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Subido: {formatDateSafe(selectedPaymentSpecs.voucherUploadDate)}
                          </p>
                        )}
                      </div>
                      
                      {/* Download button */}
                      {selectedPaymentSpecs.voucherImage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadBase64Image(
                              selectedPaymentSpecs.voucherImage, 
                              selectedPaymentSpecs.voucherFileName || 'voucher.jpg'
                            );
                          }}
                          className="mt-2 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/40 flex items-center gap-1"
                        >
                          <FiDownload className="w-3 h-3" />
                          Descargar original
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                      <FiImage className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No se adjuntó comprobante</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        El comprobante se mostrará aquí una vez que se adjunte
                      </p>
                    </div>
                  )}
                  
                  {/* Additional Information */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Información adicional</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">ID de estudiante:</span>
                        <span className="font-mono text-gray-900 dark:text-white">{selectedPaymentSpecs.studentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Período:</span>
                        <span className="text-gray-900 dark:text-white">{selectedPaymentSpecs.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Pendiente de aprobación:</span>
                        <span className="text-gray-900 dark:text-white">{selectedPaymentSpecs.pendingApproval ? 'Sí' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-3">
              {selectedPaymentSpecs.status === 'paid' && selectedPaymentSpecs.approved && !selectedPaymentSpecs.rejected && (
                <button
                  onClick={() => {
                    const formattedPayment = {
                      id: selectedPaymentSpecs.id,
                      studentId: selectedPaymentSpecs.studentId,
                      studentName: myStudent.name,
                      amount: selectedPaymentSpecs.amount,
                      type: selectedPaymentSpecs.period,
                      typeName: selectedPaymentSpecs.description,
                      method: selectedPaymentSpecs.method || 'card',
                      status: selectedPaymentSpecs.status,
                      date: selectedPaymentSpecs.paidDate ? selectedPaymentSpecs.paidDate.toISOString().split('T')[0] : '',
                      dueDate: selectedPaymentSpecs.dueDate.toISOString().split('T')[0],
                      description: selectedPaymentSpecs.description
                    };
                    setSelectedPayment(formattedPayment);
                    setShowReceiptModal(true);
                    setShowSpecsModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <FiFileText className="mr-2" />
                  Ver Comprobante
                </button>
              )}
              <button
                onClick={() => {
                  setShowSpecsModal(false);
                  setSelectedPaymentSpecs(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ParentPayments;