import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiUsers, 
  FiCalendar, 
  FiUserCheck,
  FiTrendingUp,
  FiClock,
  FiStar,
  FiTarget,
  FiActivity,
  FiMapPin,
  FiX,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiBook,
  FiHeart,
  FiZap,
  FiPackage,
  FiFileText,
  FiVideo,
  FiDownload,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CoachDashboard: React.FC = () => {
  const { user, students, schedules, attendances, evaluations, darkMode } = useAppContext();
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceMarks, setAttendanceMarks] = useState<{[key: string]: { time: string; students: number }[]}>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('coachAttendanceMarks');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Check if attendance is already marked today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (attendanceMarks[today] && attendanceMarks[today].length > 0) {
      setAttendanceMarked(true);
    }
  }, [attendanceMarks]);

  // Find students assigned to this coach
  const myStudents = students.filter(s => s.coachId === user?.id);
  const mySchedules = schedules.filter(s => s.coachId === user?.id);
  
  // Mock today's classes (estas serían las clases creadas en ClassManagement)
  const today = new Date().toISOString().split('T')[0];
  const [classStatuses, setClassStatuses] = useState<{[key: string]: 'not-started' | 'in-progress' | 'paused' | 'completed' | 'cancelled'}>({
    'today-1': 'not-started' // Default status
  });
  
  const todaysClasses = [
    // Ejemplo de clase para hoy
    ...(today === new Date().toISOString().split('T')[0] ? [{
      id: 'today-1',
      title: 'Técnica de Remate',
      time: '16:00',
      endTime: '17:30',
      duration: 90,
      location: 'Cancha Principal',
      category: 'Juvenil A',
      maxStudents: 12,
      enrolledStudents: ['1', '2', '3', '4', '5', '6', '7', '8'],
      objectives: [
        'Mejorar técnica de aproximación al remate',
        'Perfeccionar timing de salto',
        'Aumentar potencia de golpeo',
        'Desarrollar coordinación brazos-piernas'
      ],
      materials: [
        { id: 'm1', name: 'Balones de voleibol', type: 'equipment', description: '12 balones oficiales', required: true },
        { id: 'm2', name: 'Conos marcadores', type: 'equipment', description: '8 conos para delimitar zonas', required: true },
        { id: 'm3', name: 'Video técnica de remate', type: 'video', url: 'https://youtube.com/watch?v=ejemplo', required: false },
        { id: 'm4', name: 'Red portátil', type: 'equipment', description: 'Red regulamentaria', required: true }
      ],
      warmUpPlan: '10 min - Trote suave alrededor de la cancha y movilidad articular específica para hombros y tobillos',
      mainActivityPlan: '60 min - Progresión técnica: (15min) aproximación sin balón, (20min) salto y golpeo estático, (25min) remate completo con diferentes ángulos',
      coolDownPlan: '20 min - Estiramientos específicos para brazos, hombros y piernas. Ejercicios de respiración y relajación',
      notes: 'Enfocarse especialmente en la mecánica del salto. Estudiantes con dificultades: María (timing) y Ana (potencia). Revisar técnica individual.',
      status: classStatuses['today-1'] || 'not-started',
      coachId: user?.id || '',
      date: today
    }] : [])
  ];
  
  // Calculate stats
  const totalStudents = myStudents.length;
  const todayAttendances = attendances.filter(a => 
    new Date(a.date).toDateString() === new Date().toDateString() && 
    myStudents.some(s => s.id === a.studentId)
  );
  const attendanceRate = todayAttendances.length > 0 
    ? Math.round((todayAttendances.filter(a => a.present).length / todayAttendances.length) * 100)
    : 0;

  // Calculate average technical score from latest evaluations
  const calculateAvgTechnicalScore = () => {
    if (myStudents.length === 0) return 0;
    
    let totalScore = 0;
    let studentsWithEvaluations = 0;
    
    myStudents.forEach(student => {
      const studentEvaluations = evaluations.filter(evaluation => evaluation.studentId === student.id);
      if (studentEvaluations.length > 0) {
        // Get latest evaluation
        const latestEval = studentEvaluations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        // Calculate technical average
        const technicalAvg = (latestEval.technical.serve + latestEval.technical.spike + 
                            latestEval.technical.block + latestEval.technical.dig + 
                            latestEval.technical.set) / 5;
        totalScore += technicalAvg * 10; // Convert to percentage
        studentsWithEvaluations++;
      }
    });
    
    return studentsWithEvaluations > 0 ? Math.round(totalScore / studentsWithEvaluations) : 0;
  };

  const avgTechnicalScore = calculateAvgTechnicalScore();

  // Helper functions for class modal
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'in-progress': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'equipment': return <FiPackage size={16} className="text-blue-600 dark:text-blue-400" />;
      case 'document': return <FiFileText size={16} className="text-green-600 dark:text-green-400" />;
      case 'video': return <FiVideo size={16} className="text-purple-600 dark:text-purple-400" />;
      case 'link': return <FiDownload size={16} className="text-orange-600 dark:text-orange-400" />;
      default: return <FiPackage size={16} />;
    }
  };

  // Funciones para manejar estados de clases
  const handleClassAction = (classId: string, action?: 'pause' | 'cancel') => {
    const currentStatus = classStatuses[classId] || 'not-started';
    
    if (action === 'pause' && currentStatus === 'in-progress') {
      setClassStatuses(prev => ({
        ...prev,
        [classId]: 'paused'
      }));
    } else if (action === 'cancel' && (currentStatus === 'in-progress' || currentStatus === 'paused')) {
      setClassStatuses(prev => ({
        ...prev,
        [classId]: 'cancelled'
      }));
    } else if (currentStatus === 'not-started') {
      // Iniciar clase
      setClassStatuses(prev => ({
        ...prev,
        [classId]: 'in-progress'
      }));
    } else if (currentStatus === 'paused') {
      // Reanudar clase
      setClassStatuses(prev => ({
        ...prev,
        [classId]: 'in-progress'
      }));
    } else if (currentStatus === 'in-progress') {
      // Finalizar clase
      setClassStatuses(prev => ({
        ...prev,
        [classId]: 'completed'
      }));
    }
  };

  const getClassActionButton = (classId: string, classItem: any) => {
    const currentStatus = classStatuses[classId] || 'not-started';
    
    switch (currentStatus) {
      case 'not-started':
        return {
          text: 'Iniciar Clase',
          icon: <FiPlay size={16} />,
          className: 'bg-green-600 text-white hover:bg-green-700',
          disabled: false
        };
      case 'in-progress':
        return {
          text: 'Finalizar',
          icon: <FiCheckCircle size={16} />,
          className: 'bg-blue-600 text-white hover:bg-blue-700',
          disabled: false
        };
      case 'paused':
        return {
          text: 'Reanudar',
          icon: <FiPlay size={16} />,
          className: 'bg-yellow-600 text-white hover:bg-yellow-700',
          disabled: false
        };
      case 'completed':
        return {
          text: 'Finalizada',
          icon: <FiCheckCircle size={16} />,
          className: 'bg-gray-400 text-white cursor-not-allowed',
          disabled: true
        };
      case 'cancelled':
        return {
          text: 'Cancelada',
          icon: <FiX size={16} />,
          className: 'bg-red-400 text-white cursor-not-allowed',
          disabled: true
        };
      default:
        return {
          text: 'Ver Clase',
          icon: <FiTarget size={16} />,
          className: 'btn-primary',
          disabled: false
        };
    }
  };

  const getClassCardBackground = (classId: string) => {
    const currentStatus = classStatuses[classId] || 'not-started';
    
    switch (currentStatus) {
      case 'not-started':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'in-progress':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'paused':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
    }
  };

  const getClassStatusBadge = (classId: string) => {
    const currentStatus = classStatuses[classId] || 'not-started';
    
    switch (currentStatus) {
      case 'not-started':
        return {
          text: 'No Iniciada',
          className: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
        };
      case 'in-progress':
        return {
          text: 'En Progreso',
          className: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
        };
      case 'paused':
        return {
          text: 'Pausada',
          className: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
        };
      case 'completed':
        return {
          text: 'Finalizada',
          className: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
        };
      case 'cancelled':
        return {
          text: 'Cancelada',
          className: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
        };
      default:
        return {
          text: 'No Iniciada',
          className: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
        };
    }
  };

  // Sample data for charts
  const weeklyAttendance = [
    { day: 'Lun', asistencia: 92 },
    { day: 'Mar', asistencia: 88 },
    { day: 'Mie', asistencia: 94 },
    { day: 'Jue', asistencia: 86 },
    { day: 'Vie', asistencia: 90 },
    { day: 'Sab', asistencia: 85 }
  ];

  const progressData = [
    { month: 'Jul', promedio: 65 },
    { month: 'Ago', promedio: 70 },
    { month: 'Sep', promedio: 73 },
    { month: 'Oct', promedio: 78 },
    { month: 'Nov', promedio: 82 },
    { month: 'Dic', promedio: avgTechnicalScore }
  ];

  const statsCards = [
    {
      title: 'Mis Estudiantes',
      value: totalStudents.toString(),
      icon: FiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Estudiantes asignadas'
    },
    {
      title: 'Asistencia Hoy',
      value: `${attendanceRate}%`,
      icon: FiUserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Tasa de asistencia'
    },
    {
      title: 'Promedio Técnico',
      value: `${avgTechnicalScore}/100`,
      icon: FiTrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Puntuación promedio'
    },
    {
      title: 'Clases Semanales',
      value: mySchedules.length.toString(),
      icon: FiCalendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Sesiones programadas'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">¡Hola, {user?.name}! 🏐</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Bienvenida a tu portal de entrenamiento</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (!attendanceMarked) {
                // Mark attendance for today
                const today = new Date();
                const dateKey = today.toISOString().split('T')[0];
                const currentTime = today.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const studentCount = myStudents.length;
                
                setAttendanceMarks(prev => {
                  const updated = {
                    ...prev,
                    [dateKey]: [...(prev[dateKey] || []), { time: currentTime, students: studentCount }]
                  };
                  // Save to localStorage
                  localStorage.setItem('coachAttendanceMarks', JSON.stringify(updated));
                  return updated;
                });
                
                // Mark as done
                setAttendanceMarked(true);
                
                // Reset at midnight
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                const timeUntilMidnight = tomorrow.getTime() - new Date().getTime();
                setTimeout(() => setAttendanceMarked(false), timeUntilMidnight);
              }
            }}
            className={`font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center ${
              attendanceMarked 
                ? 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}>
            {attendanceMarked ? (
              <>
                <FiCheckCircle className="w-4 h-4 mr-2" />
                Asistencia Marcada
              </>
            ) : (
              <>
                <FiUserCheck className="w-4 h-4 mr-2" />
                Marcar Asistencia
              </>
            )}
          </button>
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
            className="card hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor} dark:bg-opacity-20`}>
                <stat.icon className={`w-6 h-6 ${stat.color} dark:brightness-110`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Asistencia Semanal</h3>
            <FiActivity className="w-5 h-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#f0f0f0"} />
              <XAxis dataKey="day" stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
              <YAxis stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#374151' : 'white', 
                  border: `1px solid ${darkMode ? '#4B5563' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#F9FAFB' : '#111827'
                }}
              />
              <Bar 
                dataKey="asistencia" 
                fill="#87CEEB"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Progreso Técnico</h3>
            <FiTrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#f0f0f0"} />
              <XAxis dataKey="month" stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
              <YAxis stroke={darkMode ? "#9CA3AF" : "#6b7280"} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#374151' : 'white', 
                  border: `1px solid ${darkMode ? '#4B5563' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: darkMode ? '#F9FAFB' : '#111827'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="promedio" 
                stroke="#87CEEB" 
                strokeWidth={3}
                dot={{ fill: '#87CEEB', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Students and Schedule Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Students */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FiUsers className="w-5 h-5" />
            Mis Estudiantes
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {myStudents.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <img
                  src={student.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{student.category.name} • {student.age} años</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{student.stats.technicalScore}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    student.stats.attendance >= 90 ? 'bg-green-500' :
                    student.stats.attendance >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
              </div>
            ))}
            {myStudents.length > 5 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                y {myStudents.length - 5} estudiantes más...
              </p>
            )}
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FiCalendar className="w-5 h-5" />
            Horarios de Hoy
          </h3>
          <div className="space-y-4">
            {/* Mostrar clases de hoy creadas en ClassManagement */}
            {todaysClasses.map((classItem) => {
              const actionButton = getClassActionButton(classItem.id, classItem);
              const statusBadge = getClassStatusBadge(classItem.id);
              
              return (
                <div key={classItem.id} className={`flex items-center gap-4 p-4 rounded-lg border ${getClassCardBackground(classItem.id)}`}>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <FiTarget className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {classItem.time} - {classItem.endTime}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.className}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.title} • {classItem.location}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {classItem.category} • {classItem.enrolledStudents.length} estudiantes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedClass(classItem)}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                    >
                      <FiTarget className="w-4 h-4" />
                      Ver
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleClassAction(classItem.id)}
                        disabled={actionButton.disabled}
                        className={`text-sm py-2 px-3 rounded-lg transition-colors flex items-center gap-1 ${actionButton.className}`}
                      >
                        {actionButton.icon}
                        {actionButton.text}
                      </button>
                      
                      {/* Additional action buttons */}
                      {(classStatuses[classItem.id] === 'in-progress') && (
                        <>
                          <button
                            onClick={() => handleClassAction(classItem.id, 'pause')}
                            className="text-sm py-2 px-3 rounded-lg transition-colors flex items-center gap-1 bg-yellow-600 text-white hover:bg-yellow-700"
                            title="Pausar clase"
                          >
                            <FiPause size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de que deseas cancelar esta clase?')) {
                                handleClassAction(classItem.id, 'cancel');
                              }
                            }}
                            className="text-sm py-2 px-3 rounded-lg transition-colors flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
                            title="Cancelar clase"
                          >
                            <FiX size={16} />
                          </button>
                        </>
                      )}
                      
                      {(classStatuses[classItem.id] === 'paused') && (
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de que deseas cancelar esta clase?')) {
                              handleClassAction(classItem.id, 'cancel');
                            }
                          }}
                          className="text-sm py-2 px-3 rounded-lg transition-colors flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
                          title="Cancelar clase"
                        >
                          <FiX size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Mostrar schedules regulares */}
            {mySchedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <FiClock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {schedule.startTime} - {schedule.endTime}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][schedule.dayOfWeek]} • {schedule.location}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {students.filter(s => s.categoryId === schedule.categoryId).length || 0} estudiantes
                  </p>
                </div>
                <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  Ver Horario
                </button>
              </div>
            ))}
            
            {mySchedules.length === 0 && todaysClasses.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No hay clases programadas para hoy
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions - Solo Calendario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Calendario de Clases</h3>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <div className="flex items-center justify-center">
            <button 
              onClick={() => setShowCalendarModal(true)}
              className="flex flex-col items-center gap-4 p-6 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
            >
              <FiCalendar className="w-16 h-16 text-purple-600 dark:text-purple-400" />
              <div className="text-center">
                <span className="font-medium text-lg text-purple-900 dark:text-purple-300 block">Ver Calendario Completo</span>
                <span className="text-sm text-purple-600 dark:text-purple-400 mt-1">Visualiza y marca tus clases en el calendario</span>
              </div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Class Detail Modal */}
      <AnimatePresence>
        {selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedClass(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedClass.title}</h3>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedClass.status)}`}>
                        {getStatusLabel(selectedClass.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{selectedClass.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <FiClock className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Duración</div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-200">{selectedClass.duration} min</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <FiUsers className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-green-800 dark:text-green-300">Estudiantes</div>
                    <div className="text-lg font-bold text-green-900 dark:text-green-200">{selectedClass.enrolledStudents.length}/{selectedClass.maxStudents}</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <FiMapPin className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Ubicación</div>
                    <div className="text-lg font-bold text-purple-900 dark:text-purple-200">{selectedClass.location}</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                    <FiCalendar className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-orange-800 dark:text-orange-300">Horario</div>
                    <div className="text-lg font-bold text-orange-900 dark:text-orange-200">{selectedClass.time} - {selectedClass.endTime}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Objectives */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <FiTarget className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Objetivos de la Clase
                      </h4>
                      <ul className="space-y-2">
                        {selectedClass.objectives.map((objective: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <FiCheckCircle size={16} className="mt-0.5 text-green-500 dark:text-green-400 flex-shrink-0" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Materials */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <FiPackage className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        Materiales y Recursos
                      </h4>
                      <div className="space-y-3">
                        {selectedClass.materials.map((material: any) => (
                          <div key={material.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            {getMaterialIcon(material.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{material.name}</span>
                                {material.required && <span className="text-red-500 text-sm">*</span>}
                              </div>
                              {material.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{material.description}</p>
                              )}
                            </div>
                            {material.url && (
                              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                <FiDownload size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Class Plan */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <FiBook className="w-5 h-5 text-green-600 dark:text-green-400" />
                        Plan de Clase
                      </h4>
                      <div className="space-y-4">
                        {/* Warm Up */}
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                          <div className="flex items-center gap-2 mb-2">
                            <FiHeart className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <h5 className="font-medium text-orange-800 dark:text-orange-300">Calentamiento</h5>
                          </div>
                          <p className="text-sm text-orange-700 dark:text-orange-200">{selectedClass.warmUpPlan}</p>
                        </div>

                        {/* Main Activity */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-center gap-2 mb-2">
                            <FiZap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h5 className="font-medium text-blue-800 dark:text-blue-300">Actividad Principal</h5>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-200">{selectedClass.mainActivityPlan}</p>
                        </div>

                        {/* Cool Down */}
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                          <div className="flex items-center gap-2 mb-2">
                            <FiPause className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <h5 className="font-medium text-green-800 dark:text-green-300">Enfriamiento</h5>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-200">{selectedClass.coolDownPlan}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedClass.notes && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <FiFileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          Notas Importantes
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedClass.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex gap-3">
                    {selectedClass && (() => {
                      const actionButton = getClassActionButton(selectedClass.id, selectedClass);
                      const currentStatus = classStatuses[selectedClass.id] || 'not-started';
                      return (
                        <>
                          <button 
                            onClick={() => handleClassAction(selectedClass.id)}
                            disabled={actionButton.disabled}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${actionButton.className}`}
                          >
                            {actionButton.icon}
                            {actionButton.text}
                          </button>
                          
                          {currentStatus === 'in-progress' && (
                            <>
                              <button
                                onClick={() => handleClassAction(selectedClass.id, 'pause')}
                                className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 bg-yellow-600 text-white hover:bg-yellow-700"
                              >
                                <FiPause size={16} />
                                Pausar
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('¿Estás seguro de que deseas cancelar esta clase?')) {
                                    handleClassAction(selectedClass.id, 'cancel');
                                  }
                                }}
                                className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                              >
                                <FiX size={16} />
                                Cancelar
                              </button>
                            </>
                          )}
                          
                          {currentStatus === 'paused' && (
                            <button
                              onClick={() => {
                                if (confirm('¿Estás seguro de que deseas cancelar esta clase?')) {
                                  handleClassAction(selectedClass.id, 'cancel');
                                }
                              }}
                              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                            >
                              <FiX size={16} />
                              Cancelar
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCalendarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Calendario de Clases</h3>
                  <button
                    onClick={() => setShowCalendarModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Calendar Component */}
                <CalendarView attendanceMarks={attendanceMarks} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Calendar component
const CalendarView: React.FC<{ attendanceMarks: {[key: string]: { time: string; students: number }[]} }> = ({ attendanceMarks }) => {
  const { schedules, user } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Get the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Days of week
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  
  // Check if date has attendance marks
  const hasAttendanceOnDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return attendanceMarks[dateKey] && attendanceMarks[dateKey].length > 0;
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const hasAttendance = hasAttendanceOnDate(date);
      
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`
            p-2 rounded-lg transition-all relative
            ${isToday ? 'bg-primary-100 dark:bg-primary-900/30 font-bold' : ''}
            ${isSelected ? 'ring-2 ring-primary-500' : ''}
            ${hasAttendance ? 'bg-green-50 dark:bg-green-900/20' : ''}
            hover:bg-gray-100 dark:hover:bg-gray-700
          `}
        >
          <span className="text-sm text-gray-900 dark:text-gray-100">{day}</span>
          {hasAttendance && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-0.5">
                {attendanceMarks[date.toISOString().split('T')[0]].slice(0, 3).map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-green-500 rounded-full" />
                ))}
              </div>
            </div>
          )}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FiChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FiChevronRight size={20} />
        </button>
      </div>
      
      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {generateCalendarDays()}
      </div>
      
      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          
          {/* Attendance marks for selected date (read-only) */}
          {attendanceMarks[selectedDate.toISOString().split('T')[0]]?.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asistencias Registradas</h4>
              {attendanceMarks[selectedDate.toISOString().split('T')[0]].map((mark, index) => (
                <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <FiClock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{mark.time}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">•</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{mark.students} estudiantes</span>
                  <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                    <FiCheckCircle className="w-3 h-3 mr-1" />
                    Registrado
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <FiCalendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay asistencias registradas para este día</p>
            </div>
          )}
        </div>
      )}
      
      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Resumen del Mes</h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Total de días con asistencia: {Object.keys(attendanceMarks).length}
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Total de registros: {Object.values(attendanceMarks).reduce((sum, marks) => sum + marks.length, 0)}
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Total de estudiantes: {Object.values(attendanceMarks).reduce((sum, marks) => 
            sum + marks.reduce((s, m) => s + m.students, 0), 0
          )}
        </p>
      </div>
    </div>
  );
};

export default CoachDashboard;