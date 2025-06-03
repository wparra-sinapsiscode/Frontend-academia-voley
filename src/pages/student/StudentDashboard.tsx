import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiTrendingUp, 
  FiTarget, 
  FiAward,
  FiCalendar,
  FiActivity,
  FiStar,
  FiCheckCircle,
  FiClock,
  FiBarChart
} from 'react-icons/fi';

const StudentDashboard: React.FC = () => {
  const { user, students, studentLogs, evaluations, challengeParameters } = useAppContext();
  
  // Find the current student
  const currentStudent = students.find(s => s.userId === user?.id);
  
  if (!currentStudent) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-text)]">Mi Dashboard</h1>
        <p className="text-[var(--color-text-secondary)]">No se encontró información del estudiante.</p>
      </div>
    );
  }

  // Calculate progress for challenges
  const getProgressForParameter = (parameterId: string, days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return studentLogs
      .filter(log => 
        log.studentId === currentStudent.id && 
        log.parameter === parameterId &&
        new Date(log.date) >= cutoffDate
      )
      .reduce((total, log) => total + log.value, 0);
  };

  // Get latest evaluation
  const studentEvaluations = evaluations.filter(e => e.studentId === currentStudent.id);
  const latestEvaluation = studentEvaluations.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  // Calculate technical average from latest evaluation
  const technicalAverage = latestEvaluation 
    ? Math.round(((latestEvaluation.technical.serve + 
        latestEvaluation.technical.spike + 
        latestEvaluation.technical.block + 
        latestEvaluation.technical.dig + 
        latestEvaluation.technical.set) / 5) * 10)
    : 0;

  // Mock data for weekly challenges
  const weeklyServes = getProgressForParameter('serves_direct', 7);
  const weeklyDigs = getProgressForParameter('digs_success', 7);
  const weeklySpikes = getProgressForParameter('spikes_success', 7);

  const challenges = [
    {
      id: 1,
      title: 'Desafío de Saques',
      description: 'Realiza 15 saques directos esta semana',
      progress: weeklyServes,
      goal: 15,
      icon: FiTarget,
      color: 'primary'
    },
    {
      id: 2,
      title: 'Defensas Exitosas',
      description: 'Logra 20 defensas exitosas',
      progress: weeklyDigs,
      goal: 20,
      icon: FiActivity,
      color: 'success'
    },
    {
      id: 3,
      title: 'Remates Potentes',
      description: 'Completa 10 remates exitosos',
      progress: weeklySpikes,
      goal: 10,
      icon: FiAward,
      color: 'accent'
    }
  ];

  const statsCards = [
    {
      title: 'Puntuación Técnica',
      value: `${technicalAverage}/100`,
      icon: FiTrendingUp,
      change: '+5',
      changeLabel: 'vs mes anterior',
      bgColor: 'bg-primary/20',
      iconColor: 'text-primary'
    },
    {
      title: 'Asistencia',
      value: `${currentStudent.stats?.attendanceRate || 0}%`,
      icon: FiCalendar,
      change: 'Excelente',
      changeLabel: '',
      bgColor: 'bg-[var(--color-success)]/20',
      iconColor: 'text-[var(--color-success)]'
    },
    {
      title: 'Desafíos Completados',
      value: '3/5',
      icon: FiCheckCircle,
      change: '60%',
      changeLabel: 'esta semana',
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">¡Hola, {user?.name}! 🏐</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Aquí está tu progreso en la academia</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {stat.change && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-sm font-medium text-[var(--color-success)]">{stat.change}</span>
                    {stat.changeLabel && (
                      <span className="text-xs text-[var(--color-text-secondary)]">{stat.changeLabel}</span>
                    )}
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
          <FiTarget className="w-5 h-5 text-primary" />
          Desafíos Semanales
        </h3>
        
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const percentage = Math.round((challenge.progress / challenge.goal) * 100);
            const isCompleted = percentage >= 100;
            
            return (
              <div key={challenge.id} className="p-4 rounded-lg bg-surface">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      challenge.color === 'primary' ? 'bg-primary/20' : 
                      challenge.color === 'success' ? 'bg-[var(--color-success)]/20' : 
                      'bg-accent/20'
                    }`}>
                      <challenge.icon className={`w-5 h-5 ${
                        challenge.color === 'primary' ? 'text-primary' : 
                        challenge.color === 'success' ? 'text-[var(--color-success)]' : 
                        'text-accent'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--color-text)]">{challenge.title}</h4>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{challenge.description}</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <FiCheckCircle className="w-5 h-5 text-[var(--color-success)]" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Progreso</span>
                    <span className={`font-medium ${isCompleted ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>
                      {challenge.progress}/{challenge.goal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        isCompleted ? 'bg-[var(--color-success)]' : 
                        challenge.color === 'primary' ? 'bg-primary' : 
                        challenge.color === 'success' ? 'bg-[var(--color-success)]' : 
                        'bg-accent'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link 
            to="/student/progress"
            className="card hover:shadow-xl cursor-pointer group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 block transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <FiBarChart className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Mi Progreso</h3>
                <p className="text-[var(--color-text-secondary)] text-sm">Ver mi evolución técnica y física</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link 
            to="/student/challenges"
            className="card hover:shadow-xl cursor-pointer group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 block transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <FiAward className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Desafíos</h3>
                <p className="text-[var(--color-text-secondary)] text-sm">Completa retos y gana recompensas</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <FiClock className="w-5 h-5 text-primary" />
          Actividad Reciente
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
            <div className="w-2 h-2 bg-[var(--color-success)] rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-[var(--color-text)]">Asistencia registrada - Entrenamiento técnico</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Hoy, 16:00</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-[var(--color-text)]">Nueva evaluación técnica recibida</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Ayer, 18:30</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-[var(--color-text)]">Desafío completado: Saques Directos</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Hace 2 días</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card bg-gradient-to-r from-primary to-accent text-white"
      >
        <div className="text-center py-2">
          <FiStar className="w-8 h-8 mx-auto mb-3 text-white/80" />
          <p className="text-lg font-medium italic">"El éxito es la suma de pequeños esfuerzos repetidos día tras día"</p>
          <p className="text-sm mt-2 text-white/80">- Robert Collier</p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;