import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { FiUser, FiCalendar, FiTrendingUp, FiHeart, FiStar, FiCreditCard, FiClock, FiMapPin, FiActivity, FiTarget, FiAward, FiCheckCircle, FiBarChart } from 'react-icons/fi';

const ParentDashboard: React.FC = () => {
  const { user, users, students, payments, studentLogs, challengeParameters, categories } = useAppContext();
  
  // Find the student associated with this parent
  const myStudent = students.find(s => s.parentId === user?.id);
  const studentCategory = categories.find(c => c.id === myStudent?.categoryId);
  const studentPayments = payments.filter(p => p.studentId === myStudent?.id);
  const pendingPayments = studentPayments.filter(p => p.status === 'pending' || p.status === 'overdue');
  
  // Get student user data for name
  const studentUser = myStudent ? users.find(u => u.id === myStudent.userId) : null;
  const studentName = studentUser?.name || myStudent?.name || 'Estudiante';
  
  // Calculate age from birthDate if available
  const studentAge = myStudent?.dateOfBirth 
    ? Math.floor((new Date().getTime() - new Date(myStudent.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : myStudent?.age || 0;

  if (!myStudent) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Padre/Madre</h1>
        <p className="text-gray-600 dark:text-gray-400">No se encontró información de la estudiante asociada.</p>
      </div>
    );
  }

  // Calculate real progress from student logs - synchronized with StudentChallenges
  const getProgressForParameter = (parameterId: string, days: number = 7) => {
    if (!myStudent) return 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return studentLogs
      .filter(log => 
        log.studentId === myStudent.id && 
        log.parameter === parameterId &&
        new Date(log.date) >= cutoffDate
      )
      .reduce((total, log) => total + log.value, 0);
  };

  const weeklyServes = getProgressForParameter('serves_direct', 7);
  const dailyDigs = getProgressForParameter('digs_success', 1);
  const dailySpikes = getProgressForParameter('spikes_success', 1);

  // Quick stats for executive dashboard
  const quickStats = {
    monthlyPayment: studentCategory?.monthlyFee || 0,
    nextPaymentDue: "2024-06-01",
    unreadMessages: 2,
    nextEvent: "Entrenamiento - Hoy 16:00",
    weeklyChallenge: {
      title: "Desafío de Precisión",
      progress: weeklyServes,
      goal: 15,
      completionRate: Math.round((weeklyServes / 15) * 100)
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">¡Hola, {user?.name}! 👋</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Bienvenida al portal de {studentName}</p>
        </div>
      </div>

      {/* Student Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card gradient-bg text-white"
      >
        <div className="flex items-center gap-6">
          <img
            src={myStudent?.avatar || studentUser?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
            alt={studentName}
            className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{studentName}</h2>
            <p className="text-blue-100">{studentCategory?.name || 'Sin categoría'} • {studentAge} años</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <FiStar className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">Puntuación: {Math.round((myStudent.stats?.skillLevel || 0) * 10)}/100</span>
              </div>
              <div className="flex items-center gap-1">
                <FiTrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-sm">Asistencia: {myStudent.stats?.attendanceRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso Técnico</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round((myStudent.stats?.skillLevel || 0) * 10)}/100</p>
              <p className="text-sm text-green-600">+{myStudent.stats?.improvement || 0} pts este mes</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <FiTrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Asistencia</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{myStudent.stats?.attendanceRate || 0}%</p>
              <p className="text-sm text-green-600">Excelente</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
              <FiCalendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Próximo Pago</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(quickStats.monthlyPayment)}</p>
              <p className="text-sm text-blue-600">Vence: {new Date(quickStats.nextPaymentDue).toLocaleDateString('es-ES')}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <FiCreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link 
            to="/parent/progress"
            className="card hover:shadow-xl cursor-pointer group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 block transition-all duration-200 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors">
                <FiBarChart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Progreso de {studentName}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Análisis completo basado en evaluaciones</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link 
            to="/parent/payments"
            className="card hover:shadow-xl cursor-pointer group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 block transition-all duration-200 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800/70 transition-colors">
                <FiCreditCard className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gestión de Pagos</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Historial y nuevos pagos</p>
              {pendingPayments.length > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    {pendingPayments.length} pendiente{pendingPayments.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card hover:shadow-xl cursor-pointer group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/70 transition-colors">
              <FiHeart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Comunicación</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Mensajes con entrenadoras</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card hover:shadow-xl cursor-pointer group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/70 transition-colors">
              <FiCalendar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Calendario</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Eventos y recordatorios</p>
          </div>
        </motion.div>
      </div>

      {/* Summary Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiActivity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Resumen de Actividades
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{quickStats.nextEvent}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Próximo entrenamiento</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                  <FiHeart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{quickStats.unreadMessages} mensajes nuevos</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">De las entrenadoras</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center">
                  <FiTarget className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{quickStats.weeklyChallenge.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{quickStats.weeklyChallenge.progress}/{quickStats.weeklyChallenge.goal} - {quickStats.weeklyChallenge.completionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Updates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiStar className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            Actualizaciones Recientes
          </h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 dark:border-blue-400 pl-4">
              <p className="font-medium text-gray-900 dark:text-white">Desafío semanal en progreso</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{dailyDigs} defensas exitosas hoy, {dailySpikes} remates logrados</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Actualizado ahora</p>
            </div>

            <div className="border-l-4 border-green-500 dark:border-green-400 pl-4">
              <p className="font-medium text-gray-900 dark:text-white">Progreso técnico</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">+{myStudent.stats?.improvement || 0} puntos de mejora este mes</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Última evaluación</p>
            </div>

            <div className="border-l-4 border-purple-500 dark:border-purple-400 pl-4">
              <p className="font-medium text-gray-900 dark:text-white">Asistencia excelente</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{myStudent.stats?.attendanceRate || 0}% de asistencia general</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Estadística actual</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FiUser className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium dark:text-white">Entrenadora Asignada</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sofía Martínez - {studentCategory?.name || 'Sin categoría'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiCalendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium dark:text-white">Horarios de Entrenamiento</p>
               
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FiMapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium dark:text-white">Ubicación</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Academia de Voleibol SportCenter</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiHeart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium dark:text-white">Estado General</p>
                <p className="text-sm text-green-600 font-medium">Excelente progreso</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ParentDashboard;