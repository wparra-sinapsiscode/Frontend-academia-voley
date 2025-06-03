import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { mockClassPlans } from '../../data/mockData';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiBook,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiEye,
  FiDownload,
  FiFilter,
  FiActivity,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

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
    
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error en fecha';
  }
};

const formatTimeSafe = (date: any): string => {
  if (!date) return 'No especificada';
  
  try {
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Hora inválida';
    }
    
    return dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Error en hora';
  }
};

const getDayName = (dayNumber: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayNumber] || 'Día inválido';
};

const ParentClasses: React.FC = () => {
  const { user, students, attendances, coaches, categories, classPlans, schedules } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'attendance'>('upcoming');
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = next week, etc.
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'technical' | 'physical' | 'tactical'>('all');

  // Find the student associated with this parent
  const myStudent = students.find(s => s.parentId === user?.id);
  
  if (!myStudent) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Clases</h1>
        <p className="text-gray-600 dark:text-gray-400">No se encontró información del estudiante asociado.</p>
      </div>
    );
  }

  
  // Get coach for this student - use the coachId from the category
  const studentCategory = categories.find(c => c.id === myStudent.categoryId);
  
  // Buscar el coach usando el coachId de la categoría
  const studentCoach = coaches.find(c => c.id === studentCategory?.coachId);
  
  
  
  // Get attendances for this student
  const studentAttendances = attendances.filter(a => a.studentId === myStudent.id);

  // Get classes from mockClassPlans AND user-created classes filtered by student category and coach
  const upcomingClasses = useMemo(() => {
    if (!myStudent) return [];
    
    // Get student category name
    const categoryName = studentCategory?.name;
    
    if (!categoryName) return [];
    
    console.log('🔍 ParentClasses - Filtrando clases para:', {
      studentName: myStudent.name,
      categoryName: categoryName,
      studentCoach: studentCoach?.name,
      studentCoachId: studentCoach?.id,
      totalClassPlansInContext: classPlans?.length || 0,
      totalMockClassPlans: mockClassPlans.length
    });
    
    // Filter mockClassPlans by category AND coach
    const filteredMockClasses = mockClassPlans.filter(classItem => {
      const matchesCategory = classItem.category === categoryName;
      // Mostrar solo las clases del coach asignado
      const isFromAssignedCoach = studentCoach ? classItem.coachId === studentCoach.id : false;
      
      console.log('🔍 Mock class filter:', {
        classTitle: classItem.title,
        classCategory: classItem.category,
        classCoachId: classItem.coachId,
        matchesCategory,
        isFromAssignedCoach,
        willShow: matchesCategory && isFromAssignedCoach
      });
      
      return matchesCategory && isFromAssignedCoach;
    });
    
    // Also get user-created classes from context that match the category and coach
    const userCreatedClasses = (classPlans || []).filter(classItem => {
      const matchesCategory = classItem.category === categoryName;
      // Mostrar solo las clases del coach asignado
      const isFromAssignedCoach = studentCoach ? classItem.coachId === studentCoach.id : false;
      
      console.log('🔍 User class filter:', {
        classTitle: classItem.title,
        classCategory: classItem.category,
        classCoachId: classItem.coachId,
        matchesCategory,
        isFromAssignedCoach,
        willShow: matchesCategory && isFromAssignedCoach
      });
      
      return matchesCategory && isFromAssignedCoach;
    });
    
    // Combine both mock classes and user-created classes
    const allRelevantClasses = [...filteredMockClasses, ...userCreatedClasses];
    
    // Convert all classes to the expected format
    const classes = allRelevantClasses.map((classItem, index) => {
      // Find attendance record for this class
      const attendance = studentAttendances.find(a => 
        a.studentId === myStudent.id && 
        new Date(a.date).toDateString() === new Date(classItem.date).toDateString()
      );
      
      // Get coach for this class
      const classCoach = coaches.find(c => c.id === classItem.coachId);
      
      // Assign type based on class title/objectives
      let type = 'technical';
      const title = classItem.title.toLowerCase();
      const objectives = (classItem.objectives || []).join(' ').toLowerCase();
      
      if (title.includes('físic') || objectives.includes('físic') || title.includes('resistencia') || title.includes('fuerza')) {
        type = 'physical';
      } else if (title.includes('tácti') || objectives.includes('tácti') || title.includes('estrategi') || title.includes('juego')) {
        type = 'tactical';
      } else if (title.includes('técni') || objectives.includes('técni') || title.includes('remate') || title.includes('servicio')) {
        type = 'technical';
      }
      
      return {
        id: classItem.id,
        scheduleId: `schedule_${classItem.id}`,
        date: new Date(classItem.date),
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        location: classItem.location,
        coachId: classItem.coachId,
        coach: classCoach,
        type: type,
        attendance: attendance,
        title: classItem.title,
        objectives: classItem.objectives || [],
        materials: classItem.materials || []
      };
    });
    
    
    console.log('🔍 ParentClasses - Resultado final:', {
      totalFilteredMockClasses: filteredMockClasses.length,
      totalUserCreatedClasses: userCreatedClasses.length,
      totalCombinedClasses: allRelevantClasses.length,
      finalClassesCount: classes.length,
      classesWithDetails: classes.map(c => ({
        id: c.id,
        title: c.title,
        category: c.type,
        date: c.date,
        coachName: c.coach?.name
      }))
    });
    
    return classes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [mockClassPlans, classPlans, myStudent, categories, coaches, studentAttendances, selectedWeek, studentCoach, studentCategory]);

  // Filter classes by type
  const filteredClasses = useMemo(() => {
    if (filterType === 'all') return upcomingClasses;
    return upcomingClasses.filter(cls => cls.type === filterType);
  }, [upcomingClasses, filterType]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const totalClasses = studentAttendances.length;
    const presentClasses = studentAttendances.filter(a => a.present).length;
    const attendanceRate = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
    
    return {
      total: totalClasses,
      present: presentClasses,
      absent: totalClasses - presentClasses,
      rate: attendanceRate
    };
  }, [studentAttendances]);

  // Get week dates for navigation
  const getWeekDates = (weekOffset: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (weekOffset * 7));
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() - startDate.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      start: weekStart,
      end: weekEnd,
      label: weekOffset === 0 ? 'Esta semana' : weekOffset === 1 ? 'Próxima semana' : `Semana ${weekOffset + 1}`
    };
  };

  const currentWeek = getWeekDates(selectedWeek);

  const getAttendanceIcon = (attendance: any) => {
    if (!attendance) return <FiClock className="w-4 h-4 text-gray-400" />;
    if (attendance.present) return <FiCheckCircle className="w-4 h-4 text-green-500" />;
    return <FiXCircle className="w-4 h-4 text-red-500" />;
  };

  const getAttendanceStatus = (attendance: any) => {
    if (!attendance) return { text: 'Programada', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' };
    if (attendance.present) return { text: 'Asistió', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' };
    return { text: 'Faltó', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' };
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-500';
      case 'physical': return 'bg-green-500';
      case 'tactical': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'technical': return 'Técnico';
      case 'physical': return 'Físico';
      case 'tactical': return 'Táctico';
      default: return 'General';
    }
  };

  const exportSchedule = () => {
    alert('Funcionalidad de exportación implementada en desarrollo completo');
  };

  const tabs = [
    { id: 'upcoming', label: 'Próximas Clases', icon: FiCalendar },
    { id: 'attendance', label: 'Historial de Asistencia', icon: FiActivity }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card gradient-bg text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={myStudent.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                alt={myStudent.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <FiBook className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Clases de {myStudent.name}</h1>
              <p className="text-blue-100 text-lg">{categories.find(c => c.id === myStudent.categoryId)?.name || 'Sin categoría'} • {myStudent.age} años</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  <span className="text-sm">{studentCoach?.name || 'Sin entrenador asignado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiActivity className="w-4 h-4" />
                  <span className="text-sm">{attendanceStats.rate.toFixed(1)}% asistencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  <span className="text-sm">{filteredClasses.length} clases próximas</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportSchedule}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <FiDownload className="w-4 h-4 mr-2 inline" />
              Exportar Horarios
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Tab Content */}
      {selectedTab === 'upcoming' && (
        <>
          {/* Week Navigation & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentWeek.label} - Clases Programadas
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDateSafe(currentWeek.start)} - {formatDateSafe(currentWeek.end)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Clases de {studentCoach?.name || 'su entrenador'} para {categories.find(c => c.id === myStudent.categoryId)?.name}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                    disabled={selectedWeek === 0}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedWeek(selectedWeek + 1)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiFilter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="technical">Técnico</option>
                    <option value="physical">Físico</option>
                    <option value="tactical">Táctico</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Classes List */}
          <div className="space-y-4">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((classItem, index) => {
                const attendanceStatus = getAttendanceStatus(classItem.attendance);
                return (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedClass(classItem);
                      setShowClassModal(true);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <FiCalendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {classItem.title || `Entrenamiento ${getTypeLabel(classItem.type)}`}
                              </h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${attendanceStatus.color}`}>
                                {getAttendanceIcon(classItem.attendance)}
                                <span className="ml-1">{attendanceStatus.text}</span>
                              </span>
                              <div className={`w-3 h-3 rounded-full ${getTypeColor(classItem.type)}`}></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {formatDateSafe(classItem.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiClock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {classItem.startTime} - {classItem.endTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiUser className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {classItem.coach?.name || 'Sin asignar'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiMapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">
                                  {classItem.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClass(classItem);
                              setShowClassModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card text-center py-12"
              >
                <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No hay clases programadas
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontraron clases para esta semana con los filtros seleccionados.
                </p>
              </motion.div>
            )}
          </div>
        </>
      )}


      {selectedTab === 'attendance' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Attendance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clases</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attendanceStats.total}</p>
                </div>
                <FiActivity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Asistencias</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceStats.present}</p>
                </div>
                <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faltas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absent}</p>
                </div>
                <FiXCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">% Asistencia</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {attendanceStats.rate.toFixed(1)}%
                  </p>
                </div>
                <FiTrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Historial de Asistencia
            </h3>
            <div className="space-y-3">
              {studentAttendances
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((attendance, index) => {
                  const schedule = schedules.find(s => s.id === attendance.scheduleId);
                  const coach = coaches.find(c => c.id === schedule?.coachId);
                  return (
                    <div key={attendance.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        {getAttendanceIcon(attendance)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDateSafe(attendance.date)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {coach?.name || 'Sin entrenador'} • {schedule?.location || 'Sin ubicación'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            attendance.present 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {attendance.present ? 'Presente' : 'Ausente'}
                          </span>
                        </div>
                        {attendance.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                            Nota: {attendance.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </motion.div>
      )}


      {/* Class Details Modal */}
      {showClassModal && selectedClass && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detalles de la Clase
              </h3>
              <button
                onClick={() => setShowClassModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${getTypeColor(selectedClass.type)}`}></div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedClass.title || `Entrenamiento ${getTypeLabel(selectedClass.type)}`}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAttendanceStatus(selectedClass.attendance).color}`}>
                    {getAttendanceStatus(selectedClass.attendance).text}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Información de la Clase</h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDateSafe(selectedClass.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiClock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedClass.startTime} - {selectedClass.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedClass.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Entrenador</h5>
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedClass.coach?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                        alt={selectedClass.coach?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedClass.coach?.name || 'Sin asignar'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {Array.isArray(selectedClass.coach?.specialization) 
                            ? selectedClass.coach.specialization.join(', ') 
                            : selectedClass.coach?.specialization || 'Entrenador'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Objetivos de la clase */}
                {selectedClass.objectives && selectedClass.objectives.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Objetivos de la Clase</h5>
                    <ul className="space-y-2">
                      {selectedClass.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FiTarget className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Materiales necesarios */}
                {selectedClass.materials && selectedClass.materials.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Materiales y Recursos</h5>
                    <div className="space-y-2">
                      {selectedClass.materials.map((material, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FiBook className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {material.name}
                            </span>
                            {material.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                            {material.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{material.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedClass.attendance?.notes && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Notas del Entrenador</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      "{selectedClass.attendance.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowClassModal(false)}
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

export default ParentClasses;