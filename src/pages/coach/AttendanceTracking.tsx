import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiUserCheck, 
  FiUserX, 
  FiCalendar, 
  FiFilter,
  FiDownload,
  FiEdit3,
  FiClock,
  FiUsers
} from 'react-icons/fi';

const AttendanceTracking: React.FC = () => {
  const { user, students, schedules, attendances, markAttendance, darkMode, categories } = useAppContext();
  // Lima timezone (UTC-5) - 2 de junio de 2025 (lunes)
  const [selectedDate, setSelectedDate] = useState('2025-06-02');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [recentlyMarked, setRecentlyMarked] = useState<{ [key: string]: boolean }>({});
  
  // Filtros para el historial
  const [historyFilters, setHistoryFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all' as 'all' | 'present' | 'absent' | 'late',
    student: 'all',
    sortBy: 'date' as 'date' | 'student' | 'status'
  });

  // Find students assigned to this coach through categories
  const myStudents = students.filter(s => {
    const studentCategory = categories.find(c => c.id === s.categoryId);
    return studentCategory?.coachId === user?.id;
  });
  const mySchedules = schedules.filter(s => s.coachId === user?.id);

  // 🔍 DEBUG: Log attendance information
  React.useEffect(() => {
    if (user?.id) {
      console.log('📊 ASISTENCIAS DEL COACH:', {
        coachName: user.name,
        coachId: user.id,
        totalStudents: myStudents.length,
        studentsDetails: myStudents.map(s => ({
          id: s.id,
          name: s.name,
          categoryId: s.categoryId,
          parentId: s.parentId
        })),
        totalAttendances: attendances.length,
        attendancesForMyStudents: attendances.filter(a => 
          myStudents.some(s => s.id === a.studentId)
        ).length,
        attendancesByDate: attendances
          .filter(a => myStudents.some(s => s.id === a.studentId))
          .map(a => ({
            studentId: a.studentId,
            studentName: myStudents.find(s => s.id === a.studentId)?.name,
            date: a.date,
            present: a.present,
            checkedBy: a.checkedBy
          }))
      });
      
      // Log complete attendances array
      console.log('📋 ARRAY COMPLETO DE ASISTENCIAS:', {
        totalRecords: attendances.length,
        allAttendances: attendances.map(a => ({
          id: a.id,
          studentId: a.studentId,
          studentName: myStudents.find(s => s.id === a.studentId)?.name || 'Estudiante no encontrado',
          date: a.date.toLocaleDateString('es-ES'),
          time: a.date.toLocaleTimeString('es-ES'),
          present: a.present,
          checkedBy: a.checkedBy,
          scheduleId: a.scheduleId,
          notes: a.notes
        })).sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
      });
    }
  }, [user?.id, myStudents, attendances]);

  // Get today's attendances
  const selectedDateAttendances = attendances.filter(a => {
    const attendanceDate = a.date.toISOString().split('T')[0];
    return attendanceDate === selectedDate && myStudents.some(s => s.id === a.studentId);
  });

  const handleMarkAttendance = (studentId: string, present: boolean) => {
    const student = myStudents.find(s => s.id === studentId);
    
    console.log('🎯 MARCANDO ASISTENCIA:', {
      studentId,
      studentName: student?.name,
      present,
      date: selectedDate,
      coachId: user?.id,
      coachName: user?.name
    });
    
    // Check if attendance is already marked for this student on this date
    const existingAttendance = selectedDateAttendances.find(a => a.studentId === studentId);
    
    // If attendance is already marked, don't allow duplicate marking
    if (existingAttendance) {
      console.log('⚠️ ASISTENCIA YA MARCADA:', {
        studentName: student?.name,
        existingAttendance: {
          present: existingAttendance.present,
          date: existingAttendance.date,
          checkedBy: existingAttendance.checkedBy
        }
      });
      return;
    }
    
    // Create a new Date object with the selected date but current time (Lima timezone)
    const attendanceDate = new Date(selectedDate + 'T12:00:00');
    const now = new Date();
    attendanceDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    
    const newAttendance = {
      studentId,
      scheduleId: selectedSchedule || 'schedule1',
      date: attendanceDate,
      present,
      checkedBy: user?.id || '',
      notes: undefined
    };
    
    console.log('✅ GUARDANDO ASISTENCIA:', {
      ...newAttendance,
      studentName: student?.name,
      coachName: user?.name,
      selectedDate: selectedDate, // 2025-06-02
      attendanceDateISO: attendanceDate.toISOString(),
      attendanceDateLocal: attendanceDate.toLocaleDateString('es-ES'),
      timestamp: new Date().toISOString()
    });
    
    markAttendance(newAttendance);
    
    // Mark as recently marked for visual feedback
    if (present) {
      setRecentlyMarked(prev => ({ ...prev, [studentId]: true }));
      setTimeout(() => {
        setRecentlyMarked(prev => ({ ...prev, [studentId]: false }));
      }, 3000);
    }
    
    // Log updated attendances array after marking
    setTimeout(() => {
      console.log('📊 ARRAY DE ASISTENCIAS ACTUALIZADO:', {
        totalAttendances: attendances.length + 1,
        attendancesForDate: attendances.filter(a => 
          a.date.toDateString() === attendanceDate.toDateString()
        ).length + 1,
        attendancesForCoach: attendances.filter(a => 
          myStudents.some(s => s.id === a.studentId)
        ).length + 1,
        lastAttendanceAdded: {
          studentName: student?.name,
          present,
          date: attendanceDate.toLocaleDateString('es-ES'),
          time: attendanceDate.toLocaleTimeString('es-ES'),
          markedBy: user?.name
        }
      });
    }, 100);
  };

  const getAttendanceForStudent = (studentId: string) => {
    return selectedDateAttendances.find(a => a.studentId === studentId);
  };

  // Calculate attendance stats
  const totalStudents = myStudents.length;
  const presentToday = selectedDateAttendances.filter(a => a.present).length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

  // Export functionality
  const exportAttendanceToCSV = () => {
    const csvData = [];
    
    // Header
    csvData.push([
      'Fecha',
      'Estudiante',
      'Categoría', 
      'Edad',
      'Estado',
      'Hora de Registro',
      'Notas'
    ]);

    // Data rows
    const exportDate = selectedDate;
    const dateAttendances = attendances.filter(a => {
      const attendanceDate = a.date.toISOString().split('T')[0];
      return attendanceDate === selectedDate && myStudents.some(s => s.id === a.studentId);
    });

    // Add attendance records
    dateAttendances.forEach(attendance => {
      const student = myStudents.find(s => s.id === attendance.studentId);
      if (student) {
        csvData.push([
          new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES'),
          student.name,
          student.category.name,
          student.age.toString(),
          attendance.present ? 'Presente' : 'Ausente',
          attendance.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          attendance.notes || ''
        ]);
      }
    });

    // Add students without attendance records as "Sin registrar"
    myStudents.forEach(student => {
      const hasRecord = dateAttendances.some(a => a.studentId === student.id);
      if (!hasRecord) {
        csvData.push([
          new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES'),
          student.name,
          student.category.name,
          student.age.toString(),
          'Sin registrar',
          '',
          ''
        ]);
      }
    });

    // Convert to CSV string
    const csvContent = csvData
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `asistencia_${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success alert
    alert(`¡Exportación exitosa!\n\nEl archivo de asistencia del ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES')} se ha descargado correctamente.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Control de Asistencia</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Marca la asistencia de tus estudiantes</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportAttendanceToCSV}
            className="btn-secondary flex items-center"
            title="Exportar asistencia a CSV"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Estudiantes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStudents}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FiUsers className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Presentes Hoy</p>
              <p className="text-2xl font-bold text-green-600">{presentToday}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FiUserCheck className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ausentes</p>
              <p className="text-2xl font-bold text-red-600">{totalStudents - presentToday}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <FiUserX className="w-6 h-6 text-red-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Porcentaje</p>
              <p className="text-2xl font-bold text-primary-600">{attendanceRate}%</p>
            </div>
            <div className="p-3 rounded-full bg-primary-100">
              <FiClock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-auto"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Horario:</label>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-auto"
            >
              <option value="">Todos los horarios</option>
              {mySchedules.map(schedule => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.day} {schedule.startTime} - {schedule.endTime}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Attendance List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Lista de Asistencia - {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>

        <div className="space-y-3">
          {myStudents.map((student) => {
            const attendance = getAttendanceForStudent(student.id);
            const isPresent = attendance?.present;
            const isMarked = attendance !== undefined;

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                  recentlyMarked[student.id] 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md' 
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <img
                  src={student.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{student.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {student.category.name} • {student.age} años
                  </p>
                  <p className="text-xs text-gray-400">
                    Asistencia general: {student.stats.attendance}%
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkAttendance(student.id, true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isPresent === true
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <FiUserCheck className="w-4 h-4" />
                    Presente
                  </button>
                  
                  <button
                    onClick={() => handleMarkAttendance(student.id, false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isPresent === false
                        ? 'bg-red-500 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <FiUserX className="w-4 h-4" />
                    Ausente
                  </button>
                </div>

                {isMarked && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <FiClock className="w-3 h-3" />
                      {attendance.date.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {isPresent === true && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Marcado presente
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {myStudents.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay estudiantes asignadas</h3>
            <p className="text-gray-500 dark:text-gray-400">Contacta al administrador para que te asigne estudiantes.</p>
          </div>
        )}
      </motion.div>

      {/* Attendance History with Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiUsers className="w-5 h-5" />
            Historial de Asistencias
          </h3>
        </div>

        {/* Filtros */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={historyFilters.dateFrom}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={historyFilters.dateTo}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={historyFilters.status}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Todos</option>
                <option value="present">Presentes</option>
                <option value="absent">Ausentes</option>
                <option value="late">Tardanzas</option>
              </select>
            </div>

            {/* Estudiante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estudiante
              </label>
              <select
                value={historyFilters.student}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, student: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Todos</option>
                {myStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <select
                value={historyFilters.sortBy}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="date">Fecha</option>
                <option value="student">Estudiante</option>
                <option value="status">Estado</option>
              </select>
            </div>
          </div>

          {/* Botones de filtro rápido */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setHistoryFilters(prev => ({ ...prev, dateFrom: '2025-06-02', dateTo: '2025-06-02' }))}
              className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              Hoy (2 Jun)
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setHistoryFilters(prev => ({ 
                  ...prev, 
                  dateFrom: weekAgo.toLocaleDateString('en-CA'), 
                  dateTo: today.toLocaleDateString('en-CA') 
                }));
              }}
              className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              Última semana
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                setHistoryFilters(prev => ({ 
                  ...prev, 
                  dateFrom: monthAgo.toLocaleDateString('en-CA'), 
                  dateTo: today.toLocaleDateString('en-CA') 
                }));
              }}
              className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              Último mes
            </button>
            <button
              onClick={() => setHistoryFilters({
                dateFrom: '',
                dateTo: '',
                status: 'all',
                student: 'all',
                sortBy: 'date'
              })}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Lista de asistencias filtradas */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {(() => {
            let filteredAttendances = attendances.filter(a => myStudents.some(s => s.id === a.studentId));

            // Aplicar filtros
            if (historyFilters.dateFrom) {
              filteredAttendances = filteredAttendances.filter(a => 
                a.date >= new Date(historyFilters.dateFrom)
              );
            }
            if (historyFilters.dateTo) {
              filteredAttendances = filteredAttendances.filter(a => 
                a.date <= new Date(historyFilters.dateTo + 'T23:59:59')
              );
            }
            if (historyFilters.status !== 'all') {
              if (historyFilters.status === 'present') {
                filteredAttendances = filteredAttendances.filter(a => a.present === true);
              } else if (historyFilters.status === 'absent') {
                filteredAttendances = filteredAttendances.filter(a => a.present === false);
              } else if (historyFilters.status === 'late') {
                // Para tardanzas, podríamos usar las notas o crear un campo específico
                filteredAttendances = filteredAttendances.filter(a => 
                  a.notes?.toLowerCase().includes('tarde') || 
                  a.notes?.toLowerCase().includes('retraso')
                );
              }
            }
            if (historyFilters.student !== 'all') {
              filteredAttendances = filteredAttendances.filter(a => a.studentId === historyFilters.student);
            }

            // Ordenar
            if (historyFilters.sortBy === 'date') {
              filteredAttendances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            } else if (historyFilters.sortBy === 'student') {
              filteredAttendances.sort((a, b) => {
                const studentA = myStudents.find(s => s.id === a.studentId)?.name || '';
                const studentB = myStudents.find(s => s.id === b.studentId)?.name || '';
                return studentA.localeCompare(studentB);
              });
            } else if (historyFilters.sortBy === 'status') {
              filteredAttendances.sort((a, b) => {
                if (a.present === b.present) return 0;
                return a.present ? -1 : 1;
              });
            }

            return filteredAttendances.slice(0, 50).map((attendance) => {
              const student = myStudents.find(s => s.id === attendance.studentId);
              const checkedByUser = attendance.checkedBy === user?.id;
              const isLate = attendance.notes?.toLowerCase().includes('tarde') || 
                           attendance.notes?.toLowerCase().includes('retraso');
              
              if (!student) return null;

              return (
                <motion.div
                  key={attendance.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    isLate 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                      : attendance.present 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isLate ? (
                      <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    ) : attendance.present ? (
                      <FiUserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <FiUserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <img
                        src={student.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {student.name}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isLate
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : attendance.present 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {isLate ? 'Tardanza' : attendance.present ? 'Presente' : 'Ausente'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{attendance.date.toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        <span>{attendance.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {attendance.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                        Nota: {attendance.notes}
                      </p>
                    )}
                  </div>

                  {/* Who Checked */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      checkedByUser 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                    }`}>
                      {checkedByUser ? 'Entrenador' : 'Padre/Madre'}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {checkedByUser ? 'Marcado por ti' : 'Marcado por padre'}
                    </p>
                  </div>
                </motion.div>
              );
            });
          })()}
        </div>

        {/* Estadísticas del filtro */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Mostrando {(() => {
                let count = attendances.filter(a => myStudents.some(s => s.id === a.studentId));
                if (historyFilters.dateFrom) count = count.filter(a => a.date >= new Date(historyFilters.dateFrom));
                if (historyFilters.dateTo) count = count.filter(a => a.date <= new Date(historyFilters.dateTo + 'T23:59:59'));
                if (historyFilters.status === 'present') count = count.filter(a => a.present === true);
                if (historyFilters.status === 'absent') count = count.filter(a => a.present === false);
                if (historyFilters.status === 'late') count = count.filter(a => a.notes?.toLowerCase().includes('tarde') || a.notes?.toLowerCase().includes('retraso'));
                if (historyFilters.student !== 'all') count = count.filter(a => a.studentId === historyFilters.student);
                return Math.min(count.length, 50);
              })()} de {attendances.filter(a => myStudents.some(s => s.id === a.studentId)).length} registros
            </span>
            <button
              onClick={() => {
                const csvData = attendances
                  .filter(a => myStudents.some(s => s.id === a.studentId))
                  .map(a => {
                    const student = myStudents.find(s => s.id === a.studentId);
                    return [
                      student?.name || 'N/A',
                      a.date.toLocaleDateString('es-ES'),
                      a.date.toLocaleTimeString('es-ES'),
                      a.present ? 'Presente' : 'Ausente',
                      a.notes || '',
                      a.checkedBy === user?.id ? 'Entrenador' : 'Padre'
                    ].join(',');
                  });
                
                const csv = 'Estudiante,Fecha,Hora,Estado,Notas,Marcado por\n' + csvData.join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `historial_asistencias_${new Date().toLocaleDateString('en-CA')}.csv`;
                a.click();
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <FiDownload className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        {attendances.filter(a => myStudents.some(s => s.id === a.studentId)).length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No hay registros de asistencia
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Las asistencias marcadas aparecerán aquí cuando empieces a registrarlas.
            </p>
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Resumen Semanal</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Lunes:</span>
              <span className="font-medium">92%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Miércoles:</span>
              <span className="font-medium">88%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Viernes:</span>
              <span className="font-medium">94%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Estudiantes Destacadas</h4>
          <div className="space-y-2">
            {myStudents
              .sort((a, b) => b.stats.attendance - a.stats.attendance)
              .slice(0, 3)
              .map((student, index) => (
                <div key={student.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    'bg-orange-400 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate">{student.name}</span>
                  <span className="font-medium">{student.stats.attendance}%</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Acciones Rápidas</h4>
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
              Marcar todas presentes
            </button>
            <button 
              onClick={exportAttendanceToCSV}
              className="w-full text-left text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Exportar asistencia
            </button>
            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
              Ver histórico
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AttendanceTracking;