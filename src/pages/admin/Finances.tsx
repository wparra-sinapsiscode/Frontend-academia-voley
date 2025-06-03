import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiEye, FiEdit, FiTrash2, FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiSettings, FiSliders, FiFileText, FiCheck, FiClock, FiX, FiCheckCircle, FiAlertCircle, FiCreditCard, FiImage } from 'react-icons/fi';
import { useAppContext } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';
import PaymentReceipt from '../../components/admin/PaymentReceipt';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { mockExpenses } from '../../data/mockData';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: string; // Using ID of the payment type
  typeName?: string; // Display name of the payment type
  method: 'efectivo' | 'transferencia' | 'tarjeta' | 'cash' | 'card' | 'transfer';
  status: 'pagado' | 'pendiente' | 'vencido' | 'paid' | 'pending' | 'overdue';
  date: string; // Fecha en formato YYYY-MM-DD
  datetime?: string; // Fecha y hora exacta en formato ISO
  dueDate: string;
  description?: string;
  approved?: boolean;
  approvedBy?: string;
  approvedDate?: string;
  pendingApproval?: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  voucherFile?: string; // Nombre o URL del archivo de voucher adjunto
  voucherUrl?: string;
  voucherImage?: string; // Base64 de la imagen del voucher
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string; // ID de la categoría de gasto
  categoryName?: string; // Nombre para mostrar de la categoría
  date: string;
  receipt?: string;
}

const Finances: React.FC = () => {
  const { students, payments: contextPayments, paymentTypes, expenseCategories, updatePayment, addPayment, darkMode, user } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'expenses' | 'approvals'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pagado' | 'pendiente' | 'vencido'>('all');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [filterExpenseCategory, setFilterExpenseCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<Payment | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Convert context payments to the format used in this component
  const payments = contextPayments.map(p => {
    const student = students.find(s => s.id === p.studentId);
    const methodMap: Record<string, 'efectivo' | 'transferencia' | 'tarjeta'> = {
      'cash': 'efectivo',
      'card': 'tarjeta',
      'transfer': 'transferencia'
    };
    const statusMap: Record<string, 'pagado' | 'pendiente' | 'vencido'> = {
      'paid': 'pagado',
      'pending': 'pendiente',
      'overdue': 'vencido'
    };
    
    return {
      id: p.id,
      studentId: p.studentId,
      studentName: student?.name || 'Estudiante desconocido',
      amount: p.amount,
      type: p.period,
      method: methodMap[p.method || 'cash'] || 'efectivo',
      status: statusMap[p.status] || 'pendiente',
      date: p.paidDate ? (p.paidDate instanceof Date ? p.paidDate : new Date(p.paidDate)).toISOString().split('T')[0] : '',
      datetime: p.paidDate ? (p.paidDate instanceof Date ? p.paidDate : new Date(p.paidDate)).toISOString() : undefined,
      dueDate: (p.dueDate instanceof Date ? p.dueDate : new Date(p.dueDate)).toISOString().split('T')[0],
      description: p.description,
      approved: p.approved,
      approvedBy: p.approvedBy,
      approvedDate: p.approvedDate ? (p.approvedDate instanceof Date ? p.approvedDate : new Date(p.approvedDate)).toISOString().split('T')[0] : undefined,
      pendingApproval: p.pendingApproval,
      rejected: p.rejected,
      rejectionReason: p.rejectionReason,
      voucherFile: p.voucherUrl,
      voucherUrl: p.voucherUrl,
      voucherImage: p.voucherImage
    } as Payment;
  });

  // Use real expenses data from mockData
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses.map(expense => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    categoryName: expense.categoryName,
    date: expense.date,
    receipt: expense.receiptNumber
  })));

  // Financial calculations
  const totalIncome = payments
    .filter(p => p.status === 'pagado' && p.approved !== false && !p.rejected)
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  
  const pendingPayments = payments
    .filter(p => p.status === 'pendiente')
    .reduce((sum, p) => sum + p.amount, 0);

  // Real expenses by category from mockExpenses - Mejorado con porcentajes
  const expensesByCategory = React.useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    let totalAmount = 0;
    
    // Agrupar gastos por categoría
    expenses.forEach(expense => {
      const categoryName = expense.categoryName || expense.category;
      categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + expense.amount;
      totalAmount += expense.amount;
    });
    
    // Colores específicos para cada categoría
    const colors: { [key: string]: string } = {
      'Alquiler': '#FF6B6B',
      'Servicios': '#4ECDC4',
      'Equipamiento': '#45B7D1',
      'Mantenimiento': '#96CEB4',
      'Personal': '#FFEAA7',
      'Otros': '#DDA0DD'
    };
    
    // Convertir a array con porcentajes
    const result = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      percentage: totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : '0',
      color: colors[name] || '#999999'
    }));
    
    // Ordenar por valor descendente
    result.sort((a, b) => b.value - a.value);
    
    console.log('📊 Gastos por Categoría:', result);
    return result;
  }, [expenses]);

  // Chart data - Usando datos reales de pagos y gastos
  const monthlyData = React.useMemo(() => {
    const monthlyIncome: { [key: string]: number } = {};
    const monthlyExpenses: { [key: string]: number } = {};
    
    // Agrupar ingresos por mes (solo pagos aprobados y completados)
    payments.filter(p => p.status === 'pagado' && p.approved !== false && !p.rejected).forEach(payment => {
      const date = new Date(payment.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyIncome[monthYear] = (monthlyIncome[monthYear] || 0) + payment.amount;
    });
    
    // Agrupar gastos por mes
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpenses[monthYear] = (monthlyExpenses[monthYear] || 0) + expense.amount;
    });
    
    // Generar datos para los últimos 6 meses
    const months = [];
    const today = new Date(2025, 5, 2); // June 2, 2025
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-PE', { month: 'short' });
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      const ingresos = monthlyIncome[monthYear] || 0;
      const gastos = monthlyExpenses[monthYear] || 0;
      
      months.push({
        month: capitalizedMonth,
        monthYear,
        ingresos: ingresos,
        gastos: gastos,
        utilidad: ingresos - gastos,
        margen: ingresos > 0 ? ((ingresos - gastos) / ingresos * 100).toFixed(1) : '0'
      });
    }
    
    console.log('📊 Monthly Financial Data:', { 
      monthlyIncome, 
      monthlyExpenses, 
      chartData: months,
      totals: {
        totalIncome: Object.values(monthlyIncome).reduce((sum, val) => sum + val, 0),
        totalExpenses: Object.values(monthlyExpenses).reduce((sum, val) => sum + val, 0)
      }
    });
    return months;
  }, [payments, expenses]);

  // CONSOLA: Mostrar datos financieros completos
  console.log('💰 FINANZAS - RESUMEN JUNIO 2025:', {
    fechaActual: '2025-06-02',
    ingresos: {
      totalIngresos: totalIncome,
      totalPagos: payments.length,
      pagosCompletados: payments.filter(p => p.status === 'pagado' && p.approved).length,
      pagosPendientes: payments.filter(p => p.status === 'pendiente').length,
      pagosVencidos: payments.filter(p => p.status === 'vencido').length,
      desglosePorTipo: {
        mensualidades: payments.filter(p => p.type === 'payment_monthly').reduce((sum, p) => sum + p.amount, 0),
        matriculas: payments.filter(p => p.type === 'payment_registration').reduce((sum, p) => sum + p.amount, 0),
        uniformes: payments.filter(p => p.type === 'payment_uniform').reduce((sum, p) => sum + p.amount, 0),
        torneos: payments.filter(p => p.type === 'payment_tournament').reduce((sum, p) => sum + p.amount, 0)
      }
    },
    gastos: {
      totalGastos: totalExpenses,
      cantidadGastos: expenses.length,
      gastosPorCategoria: expensesByCategory.map(cat => ({
        categoria: cat.name,
        monto: cat.value,
        porcentaje: ((cat.value / totalExpenses) * 100).toFixed(1) + '%'
      }))
    },
    resumenFinanciero: {
      ingresosMes: totalIncome,
      gastosMes: totalExpenses,
      utilidadNeta: netProfit,
      margenUtilidad: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) + '%' : '0%',
      pagosPendientesCobrar: pendingPayments
    },
    estadisticasEstudiantes: {
      totalEstudiantes: [...new Set(payments.map(p => p.studentId))].length,
      estudiantesAlDia: payments.filter(p => p.status === 'pagado' && p.type === 'payment_monthly').length,
      estudiantesPendientes: payments.filter(p => p.status === 'pendiente' && p.type === 'payment_monthly').length,
      estudiantesMorosos: payments.filter(p => p.status === 'vencido' && p.type === 'payment_monthly').length
    }
  });
  
  console.log('📈 FINANZAS - GRÁFICOS:', {
    evolucionMensual: monthlyData,
    gastosPorCategoria: expensesByCategory
  });

  // Approval related calculations
  const pendingApprovalPayments = payments.filter(p => p.pendingApproval === true && !p.rejected);
  const pendingApprovalCount = pendingApprovalPayments.length;

  // Helper function to check date range
  const isInDateRange = (paymentDate: string | undefined, range: string) => {
    if (!paymentDate || range === 'all') return true;
    
    const date = new Date(paymentDate);
    const today = new Date();
    
    switch (range) {
      case 'today':
        const todayStart = new Date(today);
        return date >= todayStart;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      default:
        return true;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesType = filterType === 'all' || payment.type === filterType;
    
    // Filter by approval status
    let matchesApprovalStatus = true;
    if (filterApprovalStatus !== 'all') {
      if (filterApprovalStatus === 'pending' && !payment.pendingApproval) matchesApprovalStatus = false;
      if (filterApprovalStatus === 'approved' && (!payment.approved || payment.pendingApproval)) matchesApprovalStatus = false;
      if (filterApprovalStatus === 'rejected' && !payment.rejected) matchesApprovalStatus = false;
    }
    
    const matchesDateRange = isInDateRange(payment.date || payment.datetime, filterDateRange);
    
    return matchesSearch && matchesStatus && matchesType && matchesApprovalStatus && matchesDateRange;
  });

  const handlePaymentSubmit = (paymentData: Partial<Payment>) => {
    if (editingPayment) {
      // Actualizar pago existente
      const updatedPayment = { ...editingPayment, ...paymentData };
      updatePayment(editingPayment.id, updatedPayment);
    } else {
      // Crear nuevo pago
      const newPaymentData = {
        studentId: paymentData.studentId!,
        amount: paymentData.amount!,
        dueDate: new Date(paymentData.dueDate!),
        paidDate: paymentData.date ? new Date(paymentData.date) : undefined,
        status: paymentData.status as 'pending' | 'paid' | 'overdue',
        method: paymentData.method as 'cash' | 'card' | 'transfer',
        description: paymentData.description,
        period: paymentData.type,
        approved: paymentData.status === 'pagado',
        pendingApproval: false
      };
      addPayment(newPaymentData);
    }
    setShowPaymentModal(false);
    setEditingPayment(null);
  };

  const handleExpenseSubmit = (expenseData: Partial<Expense>) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => 
        e.id === editingExpense.id ? { ...e, ...expenseData } : e
      ));
    } else {
      const newExpense: Expense = {
        id: Date.now().toString(),
        ...expenseData as Expense
      };
      setExpenses([...expenses, newExpense]);
    }
    setShowExpenseModal(false);
    setEditingExpense(null);
  };

  const getStatusBadge = (payment: Payment) => {
    const status = payment.status;
    
    if (payment.rejected) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    }
    
    if (status === 'pagado') {
      if (payment.pendingApproval) {
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      } else if (payment.approved) {
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      } else {
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      }
    } else if (status === 'pendiente') {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    } else if (status === 'vencido') {
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    } else {
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };
  
  // Get the display text for a payment status
  const getStatusText = (payment: Payment) => {
    const status = payment.status;
    
    if (payment.rejected) {
      return 'Rechazado';
    }
    
    if (status === 'pagado') {
      if (payment.pendingApproval) {
        return 'Pendiente de aprobación';
      } else if (payment.approved) {
        return 'Pagado y aprobado';
      } else {
        return 'Pagado';
      }
    } else if (status === 'pendiente') {
      return 'Pendiente';
    } else if (status === 'vencido') {
      return 'Vencido';
    } else {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Approve or reject a payment
  const handleApprovePayment = (paymentId: string, approve: boolean) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentUser = user?.name || 'admin'; // Get from user context
    
    if (approve) {
      // Update payment via context
      updatePayment(paymentId, {
        pendingApproval: false,
        approved: true,
        approvedBy: currentUser,
        approvedDate: new Date()
      });
    } else {
      // Show reject modal
      setRejectingPaymentId(paymentId);
      setShowRejectModal(true);
    }
  };
  
  // Handle payment rejection with reason
  const handleRejectPayment = () => {
    if (!rejectingPaymentId || !rejectionReason.trim()) {
      alert('Por favor ingrese un motivo de rechazo');
      return;
    }
    
    // Update payment via context
    updatePayment(rejectingPaymentId, {
      pendingApproval: false,
      approved: false,
      rejected: true,
      rejectionReason: rejectionReason,
      status: 'pending',
      paidDate: undefined
    });
    
    // Close modal and reset
    setShowRejectModal(false);
    setRejectingPaymentId(null);
    setRejectionReason('');
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, string> = {
      'type_mensualidad': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'type_inscripcion': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'type_torneo': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      'type_extra': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    
    // Add custom payment types to the config
    paymentTypes.forEach(pt => {
      if (!typeConfig[pt.id]) {
        // Assign colors based on ID to maintain consistency
        if (pt.id.includes('mensualidad')) typeConfig[pt.id] = 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
        else if (pt.id.includes('inscripcion')) typeConfig[pt.id] = 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
        else if (pt.id.includes('torneo')) typeConfig[pt.id] = 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
        else typeConfig[pt.id] = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      }
    });
    
    return typeConfig[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };
  
  const getTypeDisplayName = (typeId: string) => {
    const paymentType = paymentTypes.find(pt => pt.id === typeId);
    return paymentType ? paymentType.name : typeId;
  };
  
  const getExpenseCategoryDisplayName = (categoryId: string) => {
    const category = expenseCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const exportExpenses = () => {
    const filteredExpenses = expenses.filter(expense => {
      const matchesCategory = filterExpenseCategory === 'all' || expense.category === filterExpenseCategory;
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getExpenseCategoryDisplayName(expense.category).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    const csvContent = [
      // Headers
      ['Fecha', 'Descripción', 'Categoría', 'Monto', 'Recibo'],
      // Data rows
      ...filteredExpenses.map(expense => [
        expense.date,
        expense.description,
        getExpenseCategoryDisplayName(expense.category),
        formatCurrency(expense.amount),
        expense.receipt || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gastos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPayments = () => {
    const filteredPayments = payments.filter(payment => {
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      const matchesType = filterType === 'all' || payment.type === filterType;
      const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getTypeDisplayName(payment.type).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });

    const csvContent = [
      // Headers
      ['Fecha', 'Estudiante', 'Tipo', 'Monto', 'Método', 'Estado', 'Fecha Vencimiento', 'Aprobado'],
      // Data rows
      ...filteredPayments.map(payment => [
        payment.date,
        payment.studentName,
        getTypeDisplayName(payment.type),
        formatCurrency(payment.amount),
        payment.method,
        getStatusText(payment),
        payment.dueDate,
        payment.approved ? 'Sí' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pagos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Finanzas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestión financiera de la academia</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/admin/finance-settings"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 flex items-center space-x-2"
          >
            <FiSliders size={16} />
            <span>Configuración</span>
          </Link>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <FiPlus size={16} />
            <span>Nuevo Gasto</span>
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <FiPlus size={16} />
            <span>Nuevo Pago</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Resumen' },
            { key: 'payments', label: 'Pagos' },
            { key: 'approvals', label: 'Aprobaciones' },
            { key: 'expenses', label: 'Gastos' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
              {tab.key === 'approvals' && 
                pendingApprovalCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                  {pendingApprovalCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <FiTrendingUp className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos Totales</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <FiTrendingDown className="text-red-600 dark:text-red-400" size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilidad Neta</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <FiDollarSign className={netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} size={24} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagos Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(pendingPayments)}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <FiCalendar className="text-yellow-600 dark:text-yellow-400" size={24} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Income vs Expenses */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ingresos vs Gastos Mensuales</h3>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Ingresos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Gastos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Utilidad</span>
                  </div>
                </div>
              </div>
              
              {/* Resumen del mes actual */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Ingresos Jun</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(monthlyData[5]?.ingresos || 0)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Gastos Jun</p>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(monthlyData[5]?.gastos || 0)}
                  </p>
                </div>
                <div className={`${monthlyData[5]?.utilidad >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} p-2 rounded`}>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Utilidad Jun</p>
                  <p className={`text-sm font-semibold ${monthlyData[5]?.utilidad >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {formatCurrency(monthlyData[5]?.utilidad || 0)}
                  </p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="month" 
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`} 
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                    contentStyle={{
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '0.375rem',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: darkMode ? '#E5E7EB' : '#111827', fontWeight: 'bold' }}
                    itemStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                  />
                  <Legend 
                    wrapperStyle={{ color: darkMode ? '#E5E7EB' : '#111827', fontSize: '12px' }}
                    iconType="rect"
                  />
                  <Bar 
                    dataKey="ingresos" 
                    fill="#10B981" 
                    name="Ingresos" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                  <Bar 
                    dataKey="gastos" 
                    fill="#EF4444" 
                    name="Gastos" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1200}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="utilidad" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Utilidad"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Expenses by Category */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gastos por Categoría</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={false}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        style={{ filter: 'brightness(1.05)' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '0.375rem',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: darkMode ? '#E5E7EB' : '#111827', fontWeight: 'bold' }}
                    itemStyle={{ color: darkMode ? '#E5E7EB' : '#111827' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Leyenda completa */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                {expensesByCategory.map((category) => (
                  <div key={category.name} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-400 truncate">
                      {category.name} ({category.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Enhanced Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por estudiante, descripción o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="vencido">Vencido</option>
              </select>
              
              {/* Approval Status Filter */}
              <select
                value={filterApprovalStatus}
                onChange={(e) => setFilterApprovalStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Estado de aprobación</option>
                <option value="pending">Pendiente aprobación</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </select>
              
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                {paymentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              
              {/* Date Range Filter */}
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
              </select>
              
              {/* Export Button */}
              <button 
                onClick={exportPayments}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <FiDownload size={16} />
                <span>Exportar</span>
              </button>
            </div>
            
            {/* Active Filters Summary */}
            {(filterStatus !== 'all' || filterApprovalStatus !== 'all' || filterType !== 'all' || filterDateRange !== 'all' || searchTerm) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Filtros activos:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    Búsqueda: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="ml-1">
                      <FiX size={12} />
                    </button>
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    Estado: {filterStatus}
                    <button onClick={() => setFilterStatus('all')} className="ml-1">
                      <FiX size={12} />
                    </button>
                  </span>
                )}
                {filterApprovalStatus !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    Aprobación: {filterApprovalStatus}
                    <button onClick={() => setFilterApprovalStatus('all')} className="ml-1">
                      <FiX size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Payments Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Voucher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.map((payment) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${payment.pendingApproval ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{payment.studentName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{payment.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{payment.method}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(payment.type)}`}>
                          {payment.typeName || getTypeDisplayName(payment.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment)}`}>
                          {getStatusText(payment)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div>{payment.date || '-'}</div>
                        <div className="text-gray-500 dark:text-gray-400">Vence: {payment.dueDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(payment.voucherImage || payment.voucherFile) ? (
                          <button
                            onClick={() => {
                              const imageUrl = payment.voucherImage || payment.voucherFile;
                              setSelectedVoucher(imageUrl!);
                              setShowVoucherModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40"
                          >
                            <FiImage className="w-3 h-3" />
                            Ver
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          {payment.pendingApproval && (
                            <>
                              <button
                                onClick={() => handleApprovePayment(payment.id, true)}
                                className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800/40"
                                title="Aprobar pago"
                              >
                                <FiCheck size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  setRejectingPaymentId(payment.id);
                                  setShowRejectModal(true);
                                }}
                                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800/40"
                                title="Rechazar pago"
                              >
                                <FiX size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowReceiptModal(true);
                            }}
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800/40"
                            title="Generar comprobante"
                          >
                            <FiFileText size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPayment(payment);
                              setShowPaymentModal(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Editar pago"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Eliminar pago"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">

          {/* Intro Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FiClock className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Pagos Pendientes de Aprobación</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Revise y apruebe los pagos realizados por los padres. Los pagos aprobados serán confirmados y se generarán los comprobantes correspondientes.
                </p>
              </div>
              {pendingApprovalCount > 0 && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg">
                  <p className="text-2xl font-bold">{pendingApprovalCount}</p>
                  <p className="text-xs">Pendientes</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Approvals Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha de Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Voucher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingApprovalPayments.length > 0 ? (
                    pendingApprovalPayments.map((payment) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 bg-blue-50 dark:bg-blue-900/30"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{payment.studentName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{payment.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(payment.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(payment.type)}`}>
                            {payment.typeName || getTypeDisplayName(payment.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {payment.date || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <span className="capitalize">{payment.method}</span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(payment.voucherImage || payment.voucherUrl) ? (
                            <button
                              onClick={() => {
                                const imageUrl = payment.voucherImage || payment.voucherUrl;
                                setSelectedVoucher(imageUrl);
                                setShowVoucherModal(true);
                              }}
                              className="relative group"
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-colors">
                                {payment.voucherImage ? (
                                  <img 
                                    src={payment.voucherImage} 
                                    alt="Voucher"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://via.placeholder.com/64x64?text=Error';
                                    }}
                                  />
                                ) : payment.voucherUrl?.startsWith('http') ? (
                                  <img 
                                    src={payment.voucherUrl} 
                                    alt="Voucher"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <FiImage className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                  <FiEye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">Sin voucher</span>
                          )}
                        </td>
                  
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleApprovePayment(payment.id, true)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center"
                            >
                              <FiCheck className="mr-1" size={14} />
                              Aprobar
                            </button>
                            <button
                              onClick={() => {
                                setRejectingPaymentId(payment.id);
                                setShowRejectModal(true);
                              }}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center"
                            >
                              <FiX className="mr-1" size={14} />
                              Rechazar
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center">
                          <FiCheck className="w-12 h-12 text-green-400 dark:text-green-500 mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No hay pagos pendientes de aprobación</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Todos los pagos han sido procesados</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterExpenseCategory}
                onChange={(e) => setFilterExpenseCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {expenseCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button 
                onClick={exportExpenses}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FiDownload size={16} />
                <span>Exportar</span>
              </button>
            </div>
          </div>
          
          {/* Expenses Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses
                    .filter(expense => {
                      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesCategory = filterExpenseCategory === 'all' || expense.category === filterExpenseCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map((expense) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{expense.description}</div>
                        {expense.receipt && (
                          <div className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
                            📎 {expense.receipt}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(expense.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                          {expense.categoryName || getExpenseCategoryDisplayName(expense.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {expense.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingExpense(expense);
                              setShowExpenseModal(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingPayment ? 'Editar Pago' : 'Nuevo Pago'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const typeId = formData.get('type') as string;
              const selectedType = paymentTypes.find(pt => pt.id === typeId);
              const currentDate = formData.get('date') as string;
              const currentTime = new Date().toISOString();
              
              handlePaymentSubmit({
                studentId: formData.get('studentId') as string,
                studentName: students.find(s => s.id === formData.get('studentId'))?.name || '',
                amount: Number(formData.get('amount')),
                type: typeId,
                typeName: selectedType ? selectedType.name : '',
                method: formData.get('method') as Payment['method'],
                status: formData.get('status') as Payment['status'],
                date: currentDate, // Fecha seleccionada en el formulario
                datetime: currentTime, // Timestamp exacto cuando se registra el pago
                dueDate: formData.get('dueDate') as string,
                description: formData.get('description') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estudiante</label>
                  <select
                    name="studentId"
                    defaultValue={editingPayment?.studentId}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar estudiante</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                  <input
                    type="number"
                    name="amount"
                    defaultValue={editingPayment?.amount}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                  <select
                    name="type"
                    defaultValue={editingPayment?.type}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {paymentTypes
                      .filter(type => type.active)
                      .map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    {paymentTypes.filter(type => type.active).length === 0 && (
                      <option value="" disabled>
                        No hay tipos de pago configurados
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de Pago</label>
                  <select
                    name="method"
                    defaultValue={editingPayment?.method}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <select
                    name="status"
                    defaultValue={editingPayment?.status}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Pago</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editingPayment?.date}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={editingPayment?.dueDate}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <input
                    type="text"
                    name="description"
                    defaultValue={editingPayment?.description}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setEditingPayment(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPayment ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <PaymentReceipt
          payment={selectedPayment}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedPayment(null);
          }}
          onSend={(email) => {
            // Aquí iría la lógica para enviar el comprobante por correo (en una app real)
          }}
        />
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50" style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh'}}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const categoryId = formData.get('category') as string;
              const selectedCategory = expenseCategories.find(cat => cat.id === categoryId);
              
              handleExpenseSubmit({
                description: formData.get('description') as string,
                amount: Number(formData.get('amount')),
                category: categoryId,
                categoryName: selectedCategory ? selectedCategory.name : '',
                date: formData.get('date') as string,
                receipt: formData.get('receipt') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <input
                    type="text"
                    name="description"
                    defaultValue={editingExpense?.description}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                  <input
                    type="number"
                    name="amount"
                    defaultValue={editingExpense?.amount}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                  <select
                    name="category"
                    defaultValue={editingExpense?.category}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {expenseCategories
                      .filter(category => category.active)
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    {expenseCategories.filter(category => category.active).length === 0 && (
                      <option value="" disabled>
                        No hay categorías configuradas
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editingExpense?.date}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recibo (opcional)</label>
                  <input
                    type="text"
                    name="receipt"
                    defaultValue={editingExpense?.receipt}
                    placeholder="Nombre del archivo de recibo"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingExpense ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Rechazar Pago</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Por favor, indique el motivo del rechazo. Esta información será enviada al padre.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Motivo del rechazo..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-32 resize-none"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingPaymentId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectPayment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Rechazar Pago
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Voucher Modal */}
      {showVoucherModal && selectedVoucher && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" 
          onClick={() => {
            setShowVoucherModal(false);
            setSelectedVoucher(null);
          }}
        >
          <img
            src={selectedVoucher}
            alt="Comprobante de pago"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Finances;