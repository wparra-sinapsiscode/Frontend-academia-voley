import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiStar, 
  FiTrendingUp, 
  FiTarget,
  FiAward,
  FiActivity,
  FiCalendar,
  FiUsers,
  FiZap,
  FiClock,
  FiMapPin,
  FiCheckCircle
} from 'react-icons/fi';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const StudentProgress: React.FC = () => {
  const { user, students, evaluations, studentLogs, challengeParameters } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the student associated with this parent
  const myStudent = students.find(s => s.id === user?.studentId);
  
  if (!myStudent) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Mi Progreso</h1>
        <p className="text-gray-600 dark:text-gray-400">No se encontró información de la estudiante.</p>
      </div>
    );
  }

  // Calculate technical and physical scores from latest evaluation
  const studentEvaluations = evaluations.filter(evaluation => evaluation.studentId === myStudent.id);
  const latestEvaluation = studentEvaluations.length > 0 ? 
    studentEvaluations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  
  const technicalScore = latestEvaluation ? 
    Math.round((latestEvaluation.technical.serve + latestEvaluation.technical.spike + 
                latestEvaluation.technical.block + latestEvaluation.technical.dig + 
                latestEvaluation.technical.set) / 5 * 10) : 75;
  
  const physicalScore = latestEvaluation ? 
    Math.round((latestEvaluation.physical.strength + latestEvaluation.physical.speed + 
                latestEvaluation.physical.agility + latestEvaluation.physical.endurance + 
                latestEvaluation.physical.flexibility) / 5 * 10) : 70;

  // Technical skills data synchronized with evaluations
  const technicalSkills = latestEvaluation ? [
    { skill: 'Saque', A: latestEvaluation.technical.serve * 10, fullMark: 100 },
    { skill: 'Remate', A: latestEvaluation.technical.spike * 10, fullMark: 100 },
    { skill: 'Bloqueo', A: latestEvaluation.technical.block * 10, fullMark: 100 },
    { skill: 'Recepción', A: latestEvaluation.technical.dig * 10, fullMark: 100 },
    { skill: 'Colocación', A: latestEvaluation.technical.set * 10, fullMark: 100 },
    { skill: 'Defensa', A: latestEvaluation.technical.dig * 10, fullMark: 100 }
  ] : [
    { skill: 'Saque', A: 65, fullMark: 100 },
    { skill: 'Remate', A: 70, fullMark: 100 },
    { skill: 'Bloqueo', A: 60, fullMark: 100 },
    { skill: 'Recepción', A: 75, fullMark: 100 },
    { skill: 'Colocación', A: 68, fullMark: 100 },
    { skill: 'Defensa', A: 72, fullMark: 100 }
  ];

  // Monthly progress based on evaluation data trend
  const calculateMonthlyProgress = () => {
    if (studentEvaluations.length === 0) {
      return [
        { month: 'Jul', tecnico: 65, fisico: 60, mental: 70 },
        { month: 'Ago', tecnico: 70, fisico: 65, mental: 75 },
        { month: 'Sep', tecnico: 73, fisico: 70, mental: 78 },
        { month: 'Oct', tecnico: 78, fisico: 75, mental: 82 },
        { month: 'Nov', tecnico: 82, fisico: 80, mental: 85 },
        { month: 'Dic', tecnico: technicalScore, fisico: physicalScore, mental: 88 }
      ];
    }

    // Use real evaluation data for recent months
    const sortedEvaluations = studentEvaluations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentTechnical = technicalScore;
    const currentPhysical = physicalScore;
    
    return [
      { month: 'Jul', tecnico: Math.max(currentTechnical - 25, 50), fisico: Math.max(currentPhysical - 20, 45), mental: 70 },
      { month: 'Ago', tecnico: Math.max(currentTechnical - 20, 55), fisico: Math.max(currentPhysical - 15, 50), mental: 75 },
      { month: 'Sep', tecnico: Math.max(currentTechnical - 15, 60), fisico: Math.max(currentPhysical - 10, 55), mental: 78 },
      { month: 'Oct', tecnico: Math.max(currentTechnical - 10, 65), fisico: Math.max(currentPhysical - 8, 60), mental: 82 },
      { month: 'Nov', tecnico: Math.max(currentTechnical - 5, 70), fisico: Math.max(currentPhysical - 5, 65), mental: 85 },
      { month: 'Dic', tecnico: currentTechnical, fisico: currentPhysical, mental: latestEvaluation ? Math.round((latestEvaluation.mental.focus + latestEvaluation.mental.teamwork + latestEvaluation.mental.leadership + latestEvaluation.mental.attitude) / 4 * 10) : 88 }
    ];
  };

  const monthlyProgress = calculateMonthlyProgress();

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

  // Real progress data for objectives - synchronized with challenges
  const weeklyServes = getProgressForParameter('serves_direct', 7);
  const weeklyDigs = getProgressForParameter('digs_success', 7);
  const weeklyTraining = getProgressForParameter('training_intensity', 7);

  const achievements = [
    {
      id: 1,
      title: "Mejor Saque",
      description: "Logró 10 saques directos en un partido",
      icon: "🏐",
      date: "15 Nov 2024",
      rarity: "gold"
    },
    {
      id: 2,
      title: "Asistencia Perfecta",
      description: "Un mes completo sin faltas",
      icon: "📅",
      date: "30 Oct 2024",
      rarity: "silver"
    },
    {
      id: 3,
      title: "Trabajo en Equipo",
      description: "Mejor compañera del mes",
      icon: "🤝",
      date: "20 Oct 2024",
      rarity: "bronze"
    },
    {
      id: 4,
      title: "Primera Victoria",
      description: "Ganó su primer partido oficial",
      icon: "🏆",
      date: "05 Oct 2024",
      rarity: "gold"
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Entrenamiento Regular",
      date: "2024-05-27",
      time: "16:00 - 17:30",
      type: "training",
      location: "Cancha Principal"
    },
    {
      id: 2,
      title: "Torneo Interclubes",
      date: "2024-05-30",
      time: "09:00 - 15:00",
      type: "tournament",
      location: "Polideportivo Central"
    },
    {
      id: 3,
      title: "Entrenamiento Técnico",
      date: "2024-05-29",
      time: "16:00 - 17:30",
      type: "training",
      location: "Cancha Auxiliar"
    },
    {
      id: 4,
      title: "Evaluación Mensual",
      date: "2024-06-01",
      time: "15:00 - 16:00",
      type: "evaluation",
      location: "Oficina Técnica"
    }
  ];

  const weeklyChallenge = {
    title: "Desafío de Precisión",
    description: "Logra 15 saques directos en esta semana",
    progress: 8,
    goal: 15,
    reward: "Medalla de Precisión + 50 puntos XP",
    timeLeft: "3 días",
    difficulty: "medium"
  };

  const dailyChallenges = [
    {
      id: 1,
      title: "Recepción Perfecta",
      description: "Realiza 10 recepciones sin error",
      progress: 7,
      goal: 10,
      reward: "20 XP",
      completed: false
    },
    {
      id: 2,
      title: "Trabajo en Equipo",
      description: "Ayuda a 3 compañeras durante el entrenamiento",
      progress: 3,
      goal: 3,
      reward: "25 XP",
      completed: true
    },
    {
      id: 3,
      title: "Resistencia",
      description: "Completa todos los ejercicios físicos",
      progress: 0,
      goal: 1,
      reward: "15 XP",
      completed: false
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'tournament': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'evaluation': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'training': return <FiActivity className="w-4 h-4" />;
      case 'tournament': return <FiAward className="w-4 h-4" />;
      case 'evaluation': return <FiTarget className="w-4 h-4" />;
      default: return <FiCalendar className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'gold': return 'bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700';
      case 'silver': return 'bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-400 dark:to-gray-600';
      case 'bronze': return 'bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700';
      default: return 'bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con foto de la estudiante */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card gradient-bg text-white dark:bg-gradient-to-r dark:from-blue-800 dark:to-purple-800"
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={myStudent.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
              alt={myStudent.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <FiStar className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">¡Hola, {myStudent.name}! 🌟</h1>
            <p className="text-blue-100 dark:text-blue-200 text-lg">{myStudent.category.name} • {myStudent.age} años</p>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-green-300" />
                <span className="font-medium">+{myStudent.stats.improvement} puntos este mes</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-blue-300" />
                <span className="font-medium">{myStudent.stats.attendanceRate}% asistencia</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'evaluations'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Mis Evaluaciones
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Logros Específicos
        </button>
      </div>

      {activeTab === 'overview' && (
      <>
      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="w-20 h-20 mx-auto mb-4">
            <CircularProgressbar
              value={technicalScore}
              text={`${technicalScore}%`}
              styles={buildStyles({
                textColor: '#1f2937',
                pathColor: '#87CEEB',
                trailColor: '#e5e7eb'
              })}
            />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Técnico</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Habilidades deportivas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="w-20 h-20 mx-auto mb-4">
            <CircularProgressbar
              value={physicalScore}
              text={`${physicalScore}%`}
              styles={buildStyles({
                textColor: '#1f2937',
                pathColor: '#10b981',
                trailColor: '#e5e7eb'
              })}
            />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Físico</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Condición atlética</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="w-20 h-20 mx-auto mb-4">
            <CircularProgressbar
              value={myStudent.stats.attendanceRate}
              text={`${myStudent.stats.attendanceRate}%`}
              styles={buildStyles({
                textColor: '#1f2937',
                pathColor: '#8b5cf6',
                trailColor: '#e5e7eb'
              })}
            />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Equipo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Trabajo grupal</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card text-center dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-blue-400">{achievements.length}</div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Logros</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Medallas obtenidas</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Skills Radar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Habilidades Técnicas</h3>
            <FiTarget className="w-5 h-5 text-primary-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={technicalSkills}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" className="text-sm" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Habilidad"
                dataKey="A"
                stroke="#87CEEB"
                fill="#87CEEB"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progreso Mensual</h3>
            <FiTrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="tecnico" fill="#87CEEB" name="Técnico" radius={[2, 2, 0, 0]} />
              <Bar dataKey="fisico" fill="#10b981" name="Físico" radius={[2, 2, 0, 0]} />
              <Bar dataKey="mental" fill="#8b5cf6" name="Mental" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Achievements Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🏆 Mis Logros</h3>
          <div className="flex items-center gap-2">
            <FiAward className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{achievements.length} medallas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className={`relative p-6 rounded-xl text-white text-center ${getRarityColor(achievement.rarity)} transform hover:scale-105 transition-transform`}
            >
              <div className="text-4xl mb-3">{achievement.icon}</div>
              <h4 className="font-bold text-lg mb-2">{achievement.title}</h4>
              <p className="text-sm opacity-90 mb-3">{achievement.description}</p>
              <p className="text-xs opacity-75">{achievement.date}</p>
              
              {achievement.rarity === 'gold' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                  <FiStar className="w-3 h-3 text-yellow-800" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Goals and Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Goals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiTarget className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            Mis Objetivos
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="w-8 h-8 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center">
                <FiZap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">Mejorar saque</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lograr 15 saques directos esta semana</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-orange-500 dark:bg-orange-600 h-2 rounded-full" style={{ width: `${Math.min((weeklyServes / 15) * 100, 100)}%` }}></div>
                </div>
              </div>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{weeklyServes}/15</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">Defensas exitosas</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Realizar 15 defensas esta semana</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((weeklyDigs / 15) * 100, 100)}%` }}></div>
                </div>
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{weeklyDigs}/15</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                <FiActivity className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">Entrenamiento intenso</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completar 5 entrenamientos intensos</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-green-500 dark:bg-green-600 h-2 rounded-full" style={{ width: `${Math.min((weeklyTraining / 5) * 100, 100)}%` }}></div>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">{weeklyTraining}/5</span>
            </div>
          </div>
        </motion.div>

        {/* Motivational Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="card bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 text-white"
        >
          <h3 className="text-lg font-semibold mb-4">💪 ¡Sigue así, campeona!</h3>
          
          <div className="space-y-4">
            <div className="bg-white/20 rounded-lg p-4">
              <h4 className="font-medium mb-2">🎯 Próximo Desafío</h4>
              <p className="text-sm opacity-90">
                ¡Estás a solo 2 puntos de alcanzar el nivel "Estrella Brillante"! 
                Sigue practicando tu saque y lo conseguirás esta semana.
              </p>
            </div>

            <div className="bg-white/20 rounded-lg p-4">
              <h4 className="font-medium mb-2">🌟 Mensaje de tu Entrenadora</h4>
              <p className="text-sm opacity-90 italic">
                "¡Excelente progreso este mes! Tu dedicación y esfuerzo se notan 
                en cada entrenamiento. ¡Sigue brillando!"
              </p>
              <p className="text-xs opacity-75 mt-2">- Coach Luis</p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-sm font-medium">Racha actual: 5 días consecutivos</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Calendar and Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Mi Calendario
            </h3>
            <button className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-800 dark:hover:text-blue-300">Ver todo</button>
          </div>
          
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{event.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Challenges Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiTarget className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              Mis Desafíos
            </h3>
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
              {weeklyChallenge.timeLeft} restantes
            </span>
          </div>

          {/* Weekly Challenge */}
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-orange-900 dark:text-orange-300">🎯 {weeklyChallenge.title}</h4>
              <span className="text-xs bg-orange-200 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                Semanal
              </span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">{weeklyChallenge.description}</p>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-orange-800 dark:text-orange-300 mb-1">
                <span>{weeklyChallenge.progress}/{weeklyChallenge.goal}</span>
                <span>{Math.round((weeklyChallenge.progress / weeklyChallenge.goal) * 100)}%</span>
              </div>
              <div className="w-full bg-orange-200 dark:bg-orange-800/30 rounded-full h-2">
                <div 
                  className="bg-orange-500 dark:bg-orange-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(weeklyChallenge.progress / weeklyChallenge.goal) * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">🎁 {weeklyChallenge.reward}</p>
          </div>

          {/* Daily Challenges */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm">Desafíos Diarios</h4>
            <div className="space-y-2">
              {dailyChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className={`p-3 rounded-lg border transition-all ${
                    challenge.completed 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className={`font-medium text-sm ${
                      challenge.completed ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {challenge.completed && <FiCheckCircle className="w-4 h-4 inline mr-1 text-green-600 dark:text-green-400" />}
                      {challenge.title}
                    </h5>
                    <span className={`text-xs px-2 py-1 rounded ${
                      challenge.completed 
                        ? 'bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      {challenge.reward}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{challenge.description}</p>
                  {!challenge.completed && (
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{challenge.progress}/{challenge.goal}</span>
                      <span>{Math.round((challenge.progress / challenge.goal) * 100)}%</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fun Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">📊 Datos Divertidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-600 dark:text-blue-400 mb-2">247</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Saques realizados</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">89</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Remates exitosos</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">156</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Recepciones perfectas</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">42</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Horas de entrenamiento</p>
          </div>
        </div>
      </motion.div>
      </>
      )}

      {/* Evaluations Tab */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <FiTarget className="w-5 h-5 mr-2 text-primary-600 dark:text-blue-400" />
              Mis Evaluaciones
            </h3>
            
            {studentEvaluations.length > 0 ? (
              <div className="space-y-6">
                {studentEvaluations
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((evaluation, index) => (
                    <motion.div
                      key={evaluation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Evaluación {new Date(evaluation.date).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Por: Coach {
                            students.find(s => s.id === evaluation.studentId)?.coachId === 'coach1' 
                              ? 'Luis' 
                              : 'María'
                          }</p>
                        </div>
                        <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          <div className="font-bold text-xl text-blue-800 dark:text-blue-300 mr-1">{evaluation.overallScore.toFixed(1)}</div>
                          <div className="text-xs text-blue-700 dark:text-blue-400">/10</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Habilidades Técnicas</h5>
                          <div className="space-y-2">
                            {Object.entries(evaluation.technical).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{
                                  key === 'serve' ? 'Saque' :
                                  key === 'spike' ? 'Remate' :
                                  key === 'block' ? 'Bloqueo' :
                                  key === 'dig' ? 'Defensa' :
                                  key === 'set' ? 'Colocación' : key
                                }</span>
                                <span className={`font-medium ${
                                  Number(value) >= 8 ? 'text-green-600' :
                                  Number(value) >= 6 ? 'text-yellow-600' : 'text-red-600'
                                }`}>{Number(value).toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-2 border-t border-blue-100 dark:border-blue-800">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-blue-700 dark:text-blue-400">Promedio</span>
                              <span className="font-medium text-blue-800 dark:text-blue-300">
                                {(Object.values(evaluation.technical).reduce((a, b) => Number(a) + Number(b), 0) / 
                                Object.values(evaluation.technical).length).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">Condición Física</h5>
                          <div className="space-y-2">
                            {Object.entries(evaluation.physical).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{
                                  key === 'endurance' ? 'Resistencia' :
                                  key === 'strength' ? 'Fuerza' :
                                  key === 'agility' ? 'Agilidad' :
                                  key === 'jump' ? 'Salto' : key
                                }</span>
                                <span className={`font-medium ${
                                  Number(value) >= 8 ? 'text-green-600' :
                                  Number(value) >= 6 ? 'text-yellow-600' : 'text-red-600'
                                }`}>{Number(value).toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-2 border-t border-green-100 dark:border-green-800">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-green-700 dark:text-green-400">Promedio</span>
                              <span className="font-medium text-green-800 dark:text-green-300">
                                {(Object.values(evaluation.physical).reduce((a, b) => Number(a) + Number(b), 0) / 
                                Object.values(evaluation.physical).length).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">Aspectos Mentales</h5>
                          <div className="space-y-2">
                            {Object.entries(evaluation.mental).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{
                                  key === 'focus' ? 'Concentración' :
                                  key === 'teamwork' ? 'Trabajo en Equipo' :
                                  key === 'leadership' ? 'Liderazgo' :
                                  key === 'attitude' ? 'Actitud' : key
                                }</span>
                                <span className={`font-medium ${
                                  Number(value) >= 8 ? 'text-green-600' :
                                  Number(value) >= 6 ? 'text-yellow-600' : 'text-red-600'
                                }`}>{Number(value).toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-2 border-t border-purple-100 dark:border-purple-800">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-purple-700 dark:text-purple-400">Promedio</span>
                              <span className="font-medium text-purple-800 dark:text-purple-300">
                                {(Object.values(evaluation.mental).reduce((a, b) => Number(a) + Number(b), 0) / 
                                Object.values(evaluation.mental).length).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {evaluation.notes && (
                        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Observaciones</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{evaluation.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No hay evaluaciones aún</h3>
                <p className="text-gray-600 dark:text-gray-400">Tu entrenador registrará tus evaluaciones pronto.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Specific Achievements/Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <FiAward className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400" />
              Mis Logros Específicos
            </h3>

            {studentLogs.filter(log => log.studentId === myStudent.id).length > 0 ? (
              <div className="space-y-4">
                {studentLogs
                  .filter(log => log.studentId === myStudent.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((log, index) => {
                    const parameter = challengeParameters.find(p => p.id === log.parameter);
                    const isPercentage = parameter?.valueType === 'percentage' || parameter?.unit === '%';
                    
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {parameter?.name || 'Logro'}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(log.date).toLocaleDateString('es-ES', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className={`px-4 py-2 rounded-lg ${
                            isPercentage 
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          }`}>
                            <span className="font-bold text-xl">
                              {log.value}
                            </span>
                            <span className="text-sm ml-1">
                              {isPercentage ? '%' : parameter?.unit || ''}
                            </span>
                          </div>
                        </div>

                        {log.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                            {log.description}
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                }
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No hay logros registrados aún</h3>
                <p className="text-gray-600 dark:text-gray-400">Completa los desafíos de tu entrenador para registrar logros.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentProgress;