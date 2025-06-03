import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
// import { mockClassPlans } from '../../data/mockData'; // No necesario - solo mostramos clases del usuario
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
  const { user, students, schedules, attendances, evaluations, darkMode, categories, classPlans } = useAppContext();
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

  // Find students assigned to this coach through categories
  const myStudents = students.filter(s => {
    const studentCategory = categories.find(c => c.id === s.categoryId);
    return studentCategory?.coachId === user?.id;
  });
  const mySchedules = schedules.filter(s => s.coachId === user?.id);

  // 🔍 DEBUG: Log all classes for this coach
  React.useEffect(() => {
    if (user?.id) {
      // Get user-created classes for this coach
      const userClassesForCoach = (classPlans || []).filter(classItem => classItem.coachId === user.id);
      
      console.log('🎯 CLASES DEL COACH (SOLO CREADAS POR USUARIO):', {
        coachName: user.name,
        coachId: user.id,
        totalClases: userClassesForCoach.length,
        todasLasClases: userClassesForCoach.map(clase => ({
          id: clase.id,
          titulo: clase.title,
          categoria: clase.category,
          fecha: clase.date,
          hora: clase.startTime,
          ubicacion: clase.location,
          objetivos: clase.objectives
        }))
      });
      
      // 📋 ARRAY COMPLETO DE ASISTENCIAS DEL COACH
      const myStudentAttendances = attendances.filter(a => 
        myStudents.some(s => s.id === a.studentId)
      );
      
      console.log('📋 ARRAY COMPLETO DE ASISTENCIAS - COACH DASHBOARD:', {
        coachName: user.name,
        coachId: user.id,
        totalStudents: myStudents.length,
        totalAttendanceRecords: myStudentAttendances.length,
        studentsWithAttendance: [...new Set(myStudentAttendances.map(a => a.studentId))].length,
        attendancesByStudent: myStudents.map(student => {
          const studentAttendances = myStudentAttendances.filter(a => a.studentId === student.id);
          const presentCount = studentAttendances.filter(a => a.present).length;
          const absentCount = studentAttendances.filter(a => !a.present).length;
          const attendanceRate = studentAttendances.length > 0 ? (presentCount / studentAttendances.length * 100).toFixed(1) : 0;
          
          return {
            studentId: student.id,
            studentName: student.name,
            totalRecords: studentAttendances.length,
            presentes: presentCount,
            ausentes: absentCount,
            porcentajeAsistencia: attendanceRate + '%',
            ultimaAsistencia: studentAttendances.length > 0 ? 
              studentAttendances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date.toLocaleDateString('es-ES') : 'Sin registros'
          };
        }),
        allAttendanceRecords: myStudentAttendances
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(a => ({
            id: a.id,
            studentId: a.studentId,
            studentName: myStudents.find(s => s.id === a.studentId)?.name || 'N/A',
            fecha: a.date.toLocaleDateString('es-ES'),
            hora: a.date.toLocaleTimeString('es-ES'),
            presente: a.present,
            marcadoPor: a.checkedBy === user.id ? 'Coach' : 'Padre',
            notas: a.notes || 'Sin notas'
          }))
      });

      // 📊 PROGRESO TÉCNICO DE ESTUDIANTES
      const technicalProgressData = myStudents.map(student => {
        const studentEvaluations = evaluations.filter(e => e.studentId === student.id);
        const latestEval = studentEvaluations.length > 0 
          ? studentEvaluations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          : null;
        
        const technicalAverage = latestEval 
          ? ((latestEval.technical.serve + latestEval.technical.spike + 
              latestEval.technical.block + latestEval.technical.dig + 
              latestEval.technical.set) / 5) * 10
          : 0;

        const physicalAverage = latestEval
          ? ((latestEval.physical.endurance + latestEval.physical.strength + 
              latestEval.physical.agility + latestEval.physical.jump) / 4) * 10
          : 0;

        const mentalAverage = latestEval
          ? ((latestEval.mental.focus + latestEval.mental.teamwork + 
              latestEval.mental.leadership + latestEval.mental.attitude) / 4) * 10
          : 0;

        return {
          studentId: student.id,
          studentName: student.name,
          evaluacionesTotales: studentEvaluations.length,
          ultimaEvaluacion: latestEval?.date.toLocaleDateString('es-ES') || 'Sin evaluaciones',
          promedioTecnico: Math.round(technicalAverage),
          promedioFisico: Math.round(physicalAverage),
          promedioMental: Math.round(mentalAverage),
          promedioGeneral: Math.round((technicalAverage + physicalAverage + mentalAverage) / 3),
          detallesTecnicos: latestEval ? {
            saque: latestEval.technical.serve * 10,
            remate: latestEval.technical.spike * 10,
            bloqueo: latestEval.technical.block * 10,
            defensa: latestEval.technical.dig * 10,
            colocacion: latestEval.technical.set * 10
          } : null
        };
      });

      console.log('📊 PROGRESO TÉCNICO - COACH DASHBOARD:', {
        coachName: user.name,
        totalStudents: myStudents.length,
        studentsWithEvaluations: technicalProgressData.filter(s => s.evaluacionesTotales > 0).length,
        averageTechnicalScore: technicalProgressData.length > 0 
          ? Math.round(technicalProgressData.reduce((sum, s) => sum + s.promedioTecnico, 0) / technicalProgressData.length)
          : 0,
        studentProgress: technicalProgressData,
        topPerformers: technicalProgressData
          .filter(s => s.promedioGeneral > 0)
          .sort((a, b) => b.promedioGeneral - a.promedioGeneral)
          .slice(0, 3)
          .map(s => ({
            nombre: s.studentName,
            promedio: s.promedioGeneral,
            tecnico: s.promedioTecnico,
            fisico: s.promedioFisico,
            mental: s.promedioMental
          }))
      });
      
      // Also log available classPlans in context
      console.log('🔧 CONTEXT classPlans:', {
        total: classPlans?.length || 0,
        clasesEnContext: (classPlans || []).map(cp => ({
          id: cp.id,
          titulo: cp.title,
          categoria: cp.category,
          coachId: cp.coachId,
          fecha: cp.date
        }))
      });
    }
  }, [user?.id, classPlans, myStudents, attendances, evaluations]);
  
  // Mock today's classes (estas serían las clases creadas en ClassManagement)
  // Use Lima timezone (UTC-5) - 2 de junio de 2025 (lunes)
  const today = '2025-06-02'; // ISO format YYYY-MM-DD
  const [classStatuses, setClassStatuses] = useState<{[key: string]: 'not-started' | 'in-progress' | 'paused' | 'completed' | 'cancelled'}>({
    'today-1': 'not-started' // Default status
  });
  
  // Get only user-created classes for today (2025-06-02)
  const todaysRealClasses = React.useMemo(() => {
    if (!user?.id || !classPlans) return [];
    
    return classPlans.filter(classItem => {
      // Handle both Date objects and string dates
      let classDate: string;
      if (classItem.date instanceof Date) {
        classDate = classItem.date.toISOString().split('T')[0]; // Convert Date to YYYY-MM-DD
      } else if (typeof classItem.date === 'string') {
        // If it's already a string, make sure it's in YYYY-MM-DD format
        classDate = classItem.date.split('T')[0]; // Handle ISO strings
      } else {
        classDate = ''; // Invalid date
      }
      
      const isToday = classDate === today; // 2025-06-02
      const isMyClass = classItem.coachId === user.id;
      
      console.log('🔍 VERIFICANDO CLASE PARA HOY (2/6/2025):', {
        classId: classItem.id,
        classTitle: classItem.title,
        classDate: classDate,
        today: today,
        isToday: isToday,
        coachId: classItem.coachId,
        myId: user.id,
        isMyClass: isMyClass
      });
      
      return isToday && isMyClass;
    });
  }, [classPlans, user?.id, today]);

  // Debug log for today's classes
  React.useEffect(() => {
    console.log('📅 CLASES CREADAS POR EL USUARIO - HOY:', {
      today: today,
      totalUserClasses: classPlans?.length || 0,
      todaysUserClasses: todaysRealClasses.length,
      userClassesList: todaysRealClasses.map(c => ({
        id: c.id,
        title: c.title,
        startTime: c.startTime,
        endTime: c.endTime,
        date: c.date,
        category: c.category,
        location: c.location
      }))
    });
  }, [todaysRealClasses, today, classPlans]);

  const todaysClasses = [
    // Real classes (both mock and context)
    ...todaysRealClasses.map(classItem => {
      // Find students for this class category
      const enrolledStudents = myStudents.filter(s => {
        const studentCategory = categories.find(c => c.id === s.categoryId);
        return studentCategory?.name === classItem.category;
      });

      return {
        ...classItem,
        id: classItem.id,
        title: classItem.title,
        time: classItem.startTime,
        endTime: classItem.endTime,
        duration: classItem.duration,
        location: classItem.location,
        category: classItem.category,
        objectives: classItem.objectives,
        materials: Array.isArray(classItem.materials) 
          ? classItem.materials.map((material, index) => ({
              id: `m${index + 1}`,
              name: material,
              type: 'equipment',
              description: material,
              required: true
            }))
          : classItem.materials,
        warmUpPlan: typeof classItem.warmUpPlan === 'object' && classItem.warmUpPlan.exercises
          ? classItem.warmUpPlan.exercises.map(ex => ex.description).join(', ')
          : classItem.warmUpPlan || 'Calentamiento estándar',
        mainActivityPlan: typeof classItem.mainActivityPlan === 'object' && classItem.mainActivityPlan.exercises
          ? classItem.mainActivityPlan.exercises.map(ex => ex.description).join(', ')
          : classItem.mainActivityPlan || 'Actividad principal',
        coolDownPlan: typeof classItem.coolDownPlan === 'object' && classItem.coolDownPlan.exercises
          ? classItem.coolDownPlan.exercises.map(ex => ex.description).join(', ')
          : classItem.coolDownPlan || 'Enfriamiento',
        notes: classItem.notes || '',
        enrolledStudents: enrolledStudents.map(s => s.id),
        maxStudents: enrolledStudents.length + 5, // Set reasonable max
        status: classStatuses[classItem.id] || 'not-started',
        coachId: classItem.coachId,
        date: classItem.date
      };
    }),
  ];
  
  // Calculate stats
  const totalStudents = myStudents.length;
  const todayAttendances = attendances.filter(a => {
    const attendanceDate = a.date.toISOString().split('T')[0];
    return attendanceDate === today && myStudents.some(s => s.id === a.studentId);
  });
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

  // Real data for charts based on actual attendances and evaluations
  const weeklyAttendance = React.useMemo(() => {
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const today = new Date();
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    
    return daysOfWeek.map((day, index) => {
      const dayDate = new Date(currentWeekStart);
      dayDate.setDate(currentWeekStart.getDate() + index);
      
      // Get attendances for this day for coach's students
      const dayAttendances = attendances.filter(a => {
        const attendanceDate = new Date(a.date);
        return attendanceDate.toDateString() === dayDate.toDateString() &&
               myStudents.some(s => s.id === a.studentId);
      });
      
      const presentCount = dayAttendances.filter(a => a.present).length;
      const totalCount = dayAttendances.length;
      const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
      
      return {
        day,
        asistencia: attendanceRate,
        total: totalCount,
        presentes: presentCount
      };
    });
  }, [attendances, myStudents]);

  const progressData = React.useMemo(() => {
    const months = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentDate = new Date();
    
    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), 6 + index, 1); // July = 6
      
      // Get evaluations for this month for coach's students
      const monthEvaluations = evaluations.filter(e => {
        const evalDate = new Date(e.date);
        return evalDate.getMonth() === monthDate.getMonth() &&
               evalDate.getFullYear() === monthDate.getFullYear() &&
               myStudents.some(s => s.id === e.studentId);
      });
      
      // Calculate average technical score for the month
      let averageScore = 0;
      if (monthEvaluations.length > 0) {
        const totalScore = monthEvaluations.reduce((sum, evaluation) => {
          const techAvg = (evaluation.technical.serve + evaluation.technical.spike + 
                          evaluation.technical.block + evaluation.technical.dig + evaluation.technical.set) / 5;
          return sum + (techAvg * 10);
        }, 0);
        averageScore = Math.round(totalScore / monthEvaluations.length);
      } else if (index === months.length - 1) {
        // For current month, use current average
        averageScore = avgTechnicalScore;
      } else {
        // For previous months without data, use a baseline progression
        averageScore = Math.max(0, avgTechnicalScore - (months.length - 1 - index) * 5);
      }
      
      return {
        month,
        promedio: averageScore,
        evaluaciones: monthEvaluations.length
      };
    });
  }, [evaluations, myStudents, avgTechnicalScore]);

  // 📈 DATOS DE GRÁFICOS EN TIEMPO REAL
  React.useEffect(() => {
    if (user?.id && myStudents.length > 0) {
      console.log('📈 DATOS DE GRÁFICOS - COACH DASHBOARD:', {
        coachName: user.name,
        graficoAsistenciaSemanal: {
          titulo: 'Asistencia Semanal',
          datos: weeklyAttendance,
          resumen: {
            promedioPorcentaje: weeklyAttendance.length > 0 
              ? Math.round(weeklyAttendance.reduce((sum, day) => sum + day.asistencia, 0) / weeklyAttendance.length)
              : 0,
            totalRegistros: weeklyAttendance.reduce((sum, day) => sum + day.total, 0),
            totalPresentes: weeklyAttendance.reduce((sum, day) => sum + day.presentes, 0),
            diasConClases: weeklyAttendance.filter(day => day.total > 0).length
          }
        },
        graficoProgresoTecnico: {
          titulo: 'Progreso Técnico Mensual',
          datos: progressData,
          resumen: {
            promedioActual: avgTechnicalScore,
            mejorMes: progressData.reduce((best, month) => month.promedio > best.promedio ? month : best, progressData[0]),
            tendencia: progressData.length > 1 
              ? (progressData[progressData.length - 1].promedio - progressData[progressData.length - 2].promedio) 
              : 0,
            mesesConEvaluaciones: progressData.filter(month => month.evaluaciones > 0).length
          }
        }
      });
    }
  }, [user?.id, myStudents, weeklyAttendance, progressData, avgTechnicalScore]);

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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {myStudents.slice(0, 8).map((student) => {
              // Calculate student's technical score from latest evaluation
              const studentEvals = evaluations.filter(e => e.studentId === student.id);
              const latestEval = studentEvals.length > 0 
                ? studentEvals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                : null;
              
              const technicalScore = latestEval 
                ? Math.round(((latestEval.technical.serve + latestEval.technical.spike + 
                              latestEval.technical.block + latestEval.technical.dig + 
                              latestEval.technical.set) / 5) * 10) / 10
                : 0;

              // Calculate attendance rate
              const studentAttendances = attendances.filter(a => a.studentId === student.id);
              const attendanceRate = studentAttendances.length > 0
                ? Math.round((studentAttendances.filter(a => a.present).length / studentAttendances.length) * 100)
                : 0;

              // Get student category
              const studentCategory = categories.find(c => c.id === student.categoryId);

              return (
                <div key={student.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600">
                  <img
                    src={student.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {studentCategory?.name || 'Sin categoría'} • {student.age} años
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <FiStar className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {technicalScore > 0 ? technicalScore : '--'}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      attendanceRate >= 90 ? 'bg-green-500' :
                      attendanceRate >= 80 ? 'bg-yellow-500' : 
                      attendanceRate > 0 ? 'bg-red-500' : 'bg-gray-400'
                    }`} title={`${attendanceRate}% asistencia`} />
                  </div>
                </div>
              );
            })}
            {myStudents.length > 8 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                y {myStudents.length - 8} estudiantes más...
              </p>
            )}
            {myStudents.length === 0 && (
              <div className="text-center py-8">
                <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No tienes estudiantes asignados aún
                </p>
              </div>
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
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <FiTarget className="w-6 h-6 text-primary" />
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
            
            
            {todaysClasses.length === 0 && (
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
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
            onClick={() => setSelectedClass(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
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
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowCalendarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
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
            ${isToday ? 'bg-blue-100 dark:bg-blue-900/30 font-bold' : ''}
            ${isSelected ? 'ring-2 ring-blue-500' : ''}
            ${hasAttendance ? 'bg-green-100 dark:bg-green-900/20' : ''}
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
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FiChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FiChevronRight size={20} />
        </button>
      </div>
      
      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
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
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          
          {/* Attendance marks for selected date (read-only) */}
          {attendanceMarks[selectedDate.toISOString().split('T')[0]]?.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Asistencias Registradas</h4>
              {attendanceMarks[selectedDate.toISOString().split('T')[0]].map((mark, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <FiClock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{mark.time}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{mark.students} estudiantes</span>
                  <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
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
      <div className="mt-6 p-4 bg-primary/20 rounded-lg">
        <h4 className="font-medium text-primary mb-2">Resumen del Mes</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total de días con asistencia: {Object.keys(attendanceMarks).length}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total de registros: {Object.values(attendanceMarks).reduce((sum, marks) => sum + marks.length, 0)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total de estudiantes: {Object.values(attendanceMarks).reduce((sum, marks) => 
            sum + marks.reduce((s, m) => s + m.students, 0), 0
          )}
        </p>
      </div>
    </div>
  );
};

export default CoachDashboard;