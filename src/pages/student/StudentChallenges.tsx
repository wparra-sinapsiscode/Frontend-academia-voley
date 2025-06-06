import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiTarget, 
  FiAward, 
  FiCheckCircle, 
  FiClock, 
  FiZap,
  FiStar,
  FiUsers,
  FiActivity
} from 'react-icons/fi';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

const StudentChallenges: React.FC = () => {
  const { user, students, studentLogs, challengeParameters } = useAppContext();
  const [activeTab, setActiveTab] = useState('daily');
  
  // Find the student associated with this user
  const myStudent = students.find(s => s.id === user?.studentId);
  
  if (!myStudent) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Mis Desafíos</h1>
        <p className="text-gray-600 dark:text-gray-400">No se encontró información de la estudiante.</p>
      </div>
    );
  }

  // Calculate real progress from student logs
  const getProgressForParameter = (parameterId: string, days: number = 7) => {
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
  const weeklyChallenge = {
    title: "Desafío de Precisión",
    description: "Logra 15 saques directos en esta semana",
    progress: weeklyServes,
    goal: 15,
    reward: "Medalla de Precisión + 50 puntos XP",
    timeLeft: "3 días",
    difficulty: "medium",
    xpReward: 50
  };

  const dailyDigs = getProgressForParameter('digs_success', 1);
  const dailySpikes = getProgressForParameter('spikes_success', 1);
  const dailyTraining = getProgressForParameter('training_intensity', 1);

  const dailyChallenges = [
    {
      id: 1,
      title: "Defensas Exitosas",
      description: "Realiza 5 defensas exitosas",
      progress: dailyDigs,
      goal: 5,
      reward: "20 XP",
      completed: dailyDigs >= 5,
      timeLeft: "2 horas",
      type: "technical"
    },
    {
      id: 2,
      title: "Remates Efectivos",
      description: "Logra 3 remates exitosos",
      progress: dailySpikes,
      goal: 3,
      reward: "25 XP",
      completed: dailySpikes >= 3,
      type: "technical"
    },
    {
      id: 3,
      title: "Entrenamiento Intenso",
      description: "Completa un entrenamiento con alta intensidad",
      progress: dailyTraining,
      goal: 1,
      reward: "15 XP",
      completed: dailyTraining >= 1,
      timeLeft: "4 horas",
      type: "physical"
    }
  ];

  const weeklyDigs = getProgressForParameter('digs_success', 7);
  const weeklyBlocks = getProgressForParameter('blocks_success', 7);

  const weeklyXPChallenges = [
    {
      id: 1,
      title: "Maestra del Saque",
      description: "Consigue 20 saques directos esta semana",
      progress: weeklyServes,
      goal: 20,
      xpReward: 100,
      difficulty: "hard",
      timeLeft: "3 días",
      completed: weeklyServes >= 20
    },
    {
      id: 2,
      title: "Defensora Imparable",
      description: "Realiza 15 defensas exitosas",
      progress: weeklyDigs,
      goal: 15,
      xpReward: 75,
      difficulty: "medium",
      timeLeft: "3 días",
      completed: weeklyDigs >= 15
    },
    {
      id: 3,
      title: "Bloqueadora Elite",
      description: "Logra 10 bloqueos exitosos",
      progress: weeklyBlocks,
      goal: 10,
      xpReward: 60,
      difficulty: "medium",
      timeLeft: "3 días",
      completed: weeklyBlocks >= 10
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "Primera Medalla",
      description: "Completaste tu primer desafío",
      icon: "🥇",
      date: "15 Nov 2024",
      rarity: "gold",
      xpEarned: 50
    },
    {
      id: 2,
      title: "Jugadora Constante",
      description: "Una semana sin faltar a entrenamientos",
      icon: "📅",
      date: "10 Nov 2024",
      rarity: "silver",
      xpEarned: 30
    },
    {
      id: 3,
      title: "Compañera Ejemplar",
      description: "Ayudaste a 10 compañeras",
      icon: "🤝",
      date: "05 Nov 2024",
      rarity: "bronze",
      xpEarned: 25
    },
    {
      id: 4,
      title: "Técnica Mejorada",
      description: "Progreso del 20% en habilidades técnicas",
      icon: "⚡",
      date: "01 Nov 2024",
      rarity: "gold",
      xpEarned: 75
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'physical': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'social': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return <FiTarget className="w-4 h-4" />;
      case 'physical': return <FiActivity className="w-4 h-4" />;
      case 'social': return <FiUsers className="w-4 h-4" />;
      default: return <FiZap className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
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

  const totalXP = achievements.reduce((sum, achievement) => sum + achievement.xpEarned, 0) + 120; // Base XP
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpForNextLevel = (currentLevel * 100) - totalXP;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Desafíos 🎯</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Supera retos y gana experiencia mientras mejoras</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-blue-400">{totalXP}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">XP Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Nivel {currentLevel}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{xpForNextLevel} XP para siguiente</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="w-16 h-16 mx-auto mb-4">
            <CircularProgressbar
              value={(totalXP % 100)}
              text={`${currentLevel}`}
              styles={buildStyles({
                textColor: '#8b5cf6',
                pathColor: '#8b5cf6',
                trailColor: '#e5e7eb'
              })}
            />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Nivel Actual</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{xpForNextLevel} XP restante</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
            <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Completados</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{dailyChallenges.filter(c => c.completed).length + weeklyXPChallenges.filter(c => c.completed).length} desafíos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <FiClock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">En Progreso</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{dailyChallenges.filter(c => !c.completed).length + weeklyXPChallenges.filter(c => !c.completed).length} activos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
            <FiAward className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Logros</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{achievements.length} obtenidos</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'daily'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Desafíos Diarios
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'weekly'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Desafíos Semanales
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Mis Logros
        </button>
      </div>

      {/* Daily Challenges */}
      {activeTab === 'daily' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {dailyChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card border ${
                challenge.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                  : 'border-gray-200 dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${getTypeColor(challenge.type)}`}>
                  {getTypeIcon(challenge.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{challenge.title}</h3>
                    {challenge.completed && <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{challenge.description}</p>
                  
                  {!challenge.completed && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>{challenge.progress}/{challenge.goal}</span>
                        <span>{Math.round((challenge.progress / challenge.goal) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                    challenge.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}>
                    {challenge.reward}
                  </div>
                  {!challenge.completed && challenge.timeLeft && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <FiClock className="w-3 h-3" />
                      {challenge.timeLeft}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Weekly Challenges */}
      {activeTab === 'weekly' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Featured Weekly Challenge */}
          <div className="card bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                🎯 {weeklyChallenge.title}
                <span className="text-xs bg-orange-200 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                  Destacado
                </span>
              </h3>
              <span className="text-sm bg-orange-200 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full">
                {weeklyChallenge.timeLeft} restantes
              </span>
            </div>
            
            <p className="text-orange-700 dark:text-orange-300 mb-4">{weeklyChallenge.description}</p>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-orange-800 dark:text-orange-300 mb-2">
                <span>{weeklyChallenge.progress}/{weeklyChallenge.goal}</span>
                <span>{Math.round((weeklyChallenge.progress / weeklyChallenge.goal) * 100)}%</span>
              </div>
              <div className="w-full bg-orange-200 dark:bg-orange-800/30 rounded-full h-3">
                <div 
                  className="bg-orange-500 dark:bg-orange-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(weeklyChallenge.progress / weeklyChallenge.goal) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-orange-600 dark:text-orange-400">🎁 {weeklyChallenge.reward}</p>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">+{weeklyChallenge.xpReward} XP</div>
            </div>
          </div>

          {/* Other Weekly Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weeklyXPChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card ${challenge.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'dark:bg-gray-800 dark:border-gray-700'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{challenge.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{challenge.description}</p>
                
                {!challenge.completed && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>{challenge.progress}/{challenge.goal}</span>
                      <span>{Math.round((challenge.progress / challenge.goal) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <FiClock className="w-3 h-3" />
                    {challenge.timeLeft}
                  </div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">+{challenge.xpReward} XP</div>
                </div>
                
                {challenge.completed && (
                  <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <FiCheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">¡Completado!</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      {activeTab === 'achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-xl text-white text-center ${getRarityColor(achievement.rarity)} transform hover:scale-105 transition-transform`}
            >
              <div className="text-4xl mb-3">{achievement.icon}</div>
              <h4 className="font-bold text-lg mb-2">{achievement.title}</h4>
              <p className="text-sm opacity-90 mb-3">{achievement.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-75">{achievement.date}</span>
                <span className="bg-white/20 px-2 py-1 rounded">+{achievement.xpEarned} XP</span>
              </div>
              
              {achievement.rarity === 'gold' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                  <FiStar className="w-3 h-3 text-yellow-800" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default StudentChallenges;