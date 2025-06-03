import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiUsers, 
  FiDollarSign, 
  FiAward, 
  FiTrendingUp, 
  FiUserCheck,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { students, payments, tournaments, announcements, attendances, darkMode, categories } = useAppContext();
  
  // Estados para filtros de asistencia
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'lastWeek' | 'month' | 'lastMonth' | 'custom'>('week');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // 📊 ADMIN DASHBOARD - ARRAY COMPLETO DE ASISTENCIAS
  React.useEffect(() => {
    console.log('📊 ADMIN DASHBOARD - ASISTENCIAS DE TODOS LOS ALUMNOS:', {
      totalAsistencias: attendances.length,
      totalEstudiantes: students.length,
      asistenciasPorEstudiante: students.map(student => {
        const studentAttendances = attendances.filter(a => a.studentId === student.id);
        const presentCount = studentAttendances.filter(a => a.present).length;
        const absentCount = studentAttendances.filter(a => !a.present).length;
        const attendanceRate = studentAttendances.length > 0 
          ? ((presentCount / studentAttendances.length) * 100).toFixed(1) 
          : '0';
        
        return {
          studentId: student.id,
          studentName: student.name,
          category: student.category?.name || 'Sin categoría',
          totalRegistros: studentAttendances.length,
          presentes: presentCount,
          ausentes: absentCount,
          porcentajeAsistencia: attendanceRate + '%',
          detalleAsistencias: studentAttendances.map(a => ({
            fecha: a.date instanceof Date ? a.date.toLocaleDateString('es-ES') : 'Fecha inválida',
            hora: a.date instanceof Date ? a.date.toLocaleTimeString('es-ES') : 'Hora inválida',
            presente: a.present,
            notas: a.notes || 'Sin notas',
            marcadoPor: a.checkedBy
          }))
        };
      }),
      arrayCompletoAsistencias: attendances.map(a => ({
        id: a.id,
        studentId: a.studentId,
        studentName: students.find(s => s.id === a.studentId)?.name || 'Estudiante no encontrado',
        scheduleId: a.scheduleId,
        fecha: a.date instanceof Date ? a.date.toLocaleDateString('es-ES') : 'Fecha inválida',
        hora: a.date instanceof Date ? a.date.toLocaleTimeString('es-ES') : 'Hora inválida',
        presente: a.present,
        notas: a.notes || 'Sin notas',
        marcadoPor: a.checkedBy
      })),
      resumenGeneral: {
        totalPresentes: attendances.filter(a => a.present).length,
        totalAusentes: attendances.filter(a => !a.present).length,
        porcentajeAsistenciaGlobal: attendances.length > 0 
          ? ((attendances.filter(a => a.present).length / attendances.length) * 100).toFixed(1) + '%'
          : '0%',
        estudiantesConAsistencia: [...new Set(attendances.map(a => a.studentId))].length,
        estudiantesSinAsistencia: students.filter(s => !attendances.some(a => a.studentId === s.id)).length
      }
    });
  }, [students, attendances]);

  // Calculate statistics
  const totalStudents = students.length;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue').length;
  const activeTournaments = tournaments.filter(t => t.status === 'active').length;
  const attendanceRate = Math.round((attendances.filter(a => a.present).length / attendances.length) * 100) || 0;

  // Tooltip styles for dark mode
  const tooltipStyle = {
    backgroundColor: darkMode ? '#374151' : 'white',
    border: `1px solid ${darkMode ? '#4B5563' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: darkMode ? '#F9FAFB' : '#111827'
  };

  // Monthly revenue data - usando datos reales de pagos
  const monthlyRevenue = useMemo(() => {
    const revenueByMonth: { [key: string]: number } = {};
    
    // Agrupar pagos por mes
    payments.filter(p => p.status === 'paid').forEach(payment => {
      const date = new Date(payment.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + payment.amount;
    });
    
    // Obtener los últimos 6 meses
    const months = [];
    const today = new Date(2025, 5, 2); // June 2, 2025 - Lima time
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-PE', { month: 'short' });
      
      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        revenue: revenueByMonth[monthYear] || 0
      });
    }
    
    console.log('Monthly Revenue Data:', { revenueByMonth, months });
    return months;
  }, [payments]);

  // Payment status distribution - más útil para academias pequeñas
  const paymentStatusData = [
    { 
      name: 'Al día', 
      value: payments.filter(p => p.status === 'paid').length, 
      color: '#10B981' 
    },
    { 
      name: 'Pendiente', 
      value: payments.filter(p => p.status === 'pending').length, 
      color: '#F59E0B' 
    },
    { 
      name: 'Vencido', 
      value: payments.filter(p => p.status === 'overdue').length, 
      color: '#EF4444' 
    }
  ];

  // Función para filtrar asistencias por período
  const getDateRange = (filter: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      case 'lastWeek':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay());
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 7);
        return { start: lastWeekStart, end: lastWeekEnd };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start: monthStart, end: monthEnd };
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start: lastMonthStart, end: lastMonthEnd };
      case 'custom':
        return {
          start: customDateRange.start ? new Date(customDateRange.start) : today,
          end: customDateRange.end ? new Date(customDateRange.end) : today
        };
      default:
        return { start: today, end: today };
    }
  };

  // Filtrar asistencias
  const filteredAttendances = useMemo(() => {
    const { start, end } = getDateRange(periodFilter);
    
    return attendances.filter(attendance => {
      // Filtro por fecha
      const attendanceDate = new Date(attendance.date);
      if (attendanceDate < start || attendanceDate > end) return false;
      
      // Filtro por búsqueda
      const student = students.find(s => s.id === attendance.studentId);
      if (searchTerm && !student?.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // Filtro por estado
      if (statusFilter !== 'all') {
        if (statusFilter === 'present' && !attendance.present) return false;
        if (statusFilter === 'absent' && attendance.present) return false;
        // TODO: Implementar lógica para tardanzas
      }
      
      // Filtro por categoría
      if (categoryFilter !== 'all' && student?.category?.id !== categoryFilter) return false;
      
      return true;
    });
  }, [attendances, students, periodFilter, searchTerm, statusFilter, categoryFilter, customDateRange]);

  // Paginación
  const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);
  const paginatedAttendances = filteredAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Estadísticas de asistencia
  const attendanceStats = useMemo(() => {
    const total = filteredAttendances.length;
    const present = filteredAttendances.filter(a => a.present).length;
    const absent = total - present;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { total, present, absent, rate };
  }, [filteredAttendances]);

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['Estudiante', 'Categoría', 'Fecha', 'Hora', 'Estado', 'Notas', 'Marcado por'];
    const rows = filteredAttendances.map(attendance => {
      const student = students.find(s => s.id === attendance.studentId);
      const date = new Date(attendance.date);
      return [
        student?.name || 'N/A',
        student?.category?.name || 'N/A',
        date.toLocaleDateString('es-ES'),
        date.toLocaleTimeString('es-ES'),
        attendance.present ? 'Presente' : 'Ausente',
        attendance.notes || '',
        attendance.checkedBy || 'N/A'
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Sample attendance data (for the old chart, will be removed)
  const attendanceData = [
    { day: 'Lun', asistencia: 85 },
    { day: 'Mar', asistencia: 90 },
    { day: 'Mié', asistencia: 88 },
    { day: 'Jue', asistencia: 92 },
    { day: 'Vie', asistencia: 87 }
  ];

  const statsCards = [
    {
      title: 'Total Estudiantes',
      value: totalStudents.toString(),
      icon: FiUsers,
      color: 'text-primary',
      bgColor: 'bg-primary',
      change: '+5%',
      changeColor: 'text-[var(--color-success)]'
    },
    {
      title: 'Ingresos Mensuales',
      value: `S/ ${totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-[var(--color-success)]',
      bgColor: 'bg-[var(--color-success)]',
      change: '+12%',
      changeColor: 'text-[var(--color-success)]'
    },
    {
      title: 'Pagos Pendientes',
      value: pendingPayments.toString(),
      icon: FiAlertCircle,
      color: 'text-accent',
      bgColor: 'bg-accent',
      change: '-8%',
      changeColor: 'text-[var(--color-success)]'
    },
    {
      title: 'Torneos Activos',
      value: activeTournaments.toString(),
      icon: FiAward,
      color: 'text-primary',
      bgColor: 'bg-primary',
      change: '+2',
      changeColor: 'text-[var(--color-success)]'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Dashboard Administrativo</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Resumen general de la academia</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-xl dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">{stat.title}</p>
                <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)] ml-1">vs mes anterior</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Ingresos Mensuales</h3>
            <FiTrendingUp className="w-5 h-5 text-[var(--color-success)]" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
              <XAxis 
                dataKey="month" 
                stroke={darkMode ? '#9CA3AF' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={darkMode ? '#9CA3AF' : '#6b7280'}
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `S/ ${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`S/ ${value.toLocaleString()}`, 'Ingresos']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#87CEEB" 
                strokeWidth={3}
                dot={{ fill: '#87CEEB', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Estado de Pagos</h3>
            <FiDollarSign className="w-5 h-5 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {paymentStatusData.map((status) => (
              <div key={status.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-[var(--color-text-secondary)]">{status.name}</span>
                </div>
                <span className="font-medium text-[var(--color-text)]">{status.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Registro de Asistencias</h3>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-[var(--color-text-secondary)]">Total</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{attendanceStats.total}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-[var(--color-text-secondary)]">Presentes</p>
              <p className="text-2xl font-bold text-[var(--color-success)]">{attendanceStats.present}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-[var(--color-text-secondary)]">Ausentes</p>
              <p className="text-2xl font-bold text-[var(--color-error)]">{attendanceStats.absent}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-[var(--color-text-secondary)]">Asistencia</p>
              <p className="text-2xl font-bold text-primary">{attendanceStats.rate}%</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text)]"
                  />
                </div>
              </div>

              {/* Período */}
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text)]"
              >
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="lastWeek">Semana pasada</option>
                <option value="month">Este mes</option>
                <option value="lastMonth">Mes pasado</option>
                <option value="custom">Personalizado</option>
              </select>

              {/* Estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text)]"
              >
                <option value="all">Todos</option>
                <option value="present">Presentes</option>
                <option value="absent">Ausentes</option>
                <option value="late">Tardanzas</option>
              </select>

              {/* Categoría */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text)]"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Exportar */}
              <button
                onClick={exportToCSV}
                className="btn-secondary flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Exportar
              </button>
            </div>

            {/* Fechas personalizadas */}
            {periodFilter === 'custom' && (
              <div className="flex gap-4">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text)]"
                />
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--color-text)]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">Estudiante</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">Categoría</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">Hora</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">Notas</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">Marcado por</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttendances.length > 0 ? (
                paginatedAttendances.map((attendance) => {
                  const student = students.find(s => s.id === attendance.studentId);
                  const date = new Date(attendance.date);
                  
                  return (
                    <tr key={attendance.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                            alt={student?.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-medium text-[var(--color-text)]">{student?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">{student?.category?.name || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-[var(--color-text)]">{date.toLocaleDateString('es-ES')}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">{date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          attendance.present
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {attendance.present ? 'Presente' : 'Ausente'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">{attendance.notes || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">{attendance.checkedBy || 'Sistema'}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--color-text-secondary)]">
                    No se encontraron registros de asistencia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-text-secondary)]">Mostrando</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-[var(--color-text)]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-[var(--color-text-secondary)]">por página</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-5 h-5 text-[var(--color-text)]" />
              </button>
              
              <span className="text-sm text-[var(--color-text-secondary)]">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-5 h-5 text-[var(--color-text)]" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Recent Activity & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Estudiantes Recientes</h3>
          <div className="space-y-4">
            {students
              .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
              .slice(0, 5)
              .map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <img
                  src={student.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-[var(--color-text)]">{student.name}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.paymentStatus === 'paid' ? 'bg-[var(--color-success)] text-white' :
                  student.paymentStatus === 'pending' ? 'bg-accent text-white' :
                  'bg-[var(--color-error)] text-white'
                }`}>
                  {student.paymentStatus === 'paid' ? 'Al día' :
                   student.paymentStatus === 'pending' ? 'Pendiente' : 'Vencido'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Anuncios Recientes</h3>
          <div className="space-y-4">
            {announcements
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 4)
              .map((announcement) => (
              <div key={announcement.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-[var(--color-text)] text-sm">{announcement.title}</h4>
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    announcement.priority === 'high' ? 'bg-[var(--color-error)]' :
                    announcement.priority === 'medium' ? 'bg-accent' : 'bg-[var(--color-success)]'
                  }`} />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">{announcement.content}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                  {announcement.createdAt.toLocaleDateString('es-ES')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;