import React, { useState, useMemo } from 'react';
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
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiDownload,
  FiUser,
  FiBarChart2,
  FiPieChart,
  FiFilter
} from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

const ParentProgress: React.FC = () => {
  const { user, students, evaluations, coaches, darkMode, categories } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '3months' | '6months' | '1year'>('6months');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technical' | 'physical' | 'mental'>('all');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Find the student associated with this parent
  const myStudent = students.find(s => s.parentId === user?.id);
  
  if (!myStudent) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Progreso de mi Hijo/a</h1>
        <p className="text-gray-600 dark:text-gray-400">No se encontró información del estudiante asociado.</p>
      </div>
    );
  }

  // Get evaluations for this student
  const studentEvaluations = evaluations.filter(e => e.studentId === myStudent.id);
  
  // Filter evaluations by selected period
  const filteredEvaluations = useMemo(() => {
    if (selectedPeriod === 'all') return studentEvaluations;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return studentEvaluations.filter(e => new Date(e.date) >= cutoffDate);
  }, [studentEvaluations, selectedPeriod]);

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    if (filteredEvaluations.length === 0) {
      return {
        latestEvaluation: null,
        overallAverage: 0,
        progressPercentage: 0,
        totalEvaluations: 0,
        technicalAverage: 0,
        physicalAverage: 0,
        mentalAverage: 0,
        strengths: [],
        improvements: [],
        trend: 'neutral'
      };
    }

    const sortedEvaluations = [...filteredEvaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestEvaluation = sortedEvaluations[sortedEvaluations.length - 1];
    const firstEvaluation = sortedEvaluations[0];

    // Calculate averages
    const technicalAverage = filteredEvaluations.reduce((sum, e) => {
      const techAvg = (e.technical.serve + e.technical.spike + e.technical.block + e.technical.dig + e.technical.set) / 5;
      return sum + techAvg;
    }, 0) / filteredEvaluations.length;

    const physicalAverage = filteredEvaluations.reduce((sum, e) => {
      const physAvg = (e.physical.endurance + e.physical.strength + e.physical.agility + e.physical.jump) / 4;
      return sum + physAvg;
    }, 0) / filteredEvaluations.length;

    const mentalAverage = filteredEvaluations.reduce((sum, e) => {
      const mentAvg = (e.mental.focus + e.mental.teamwork + e.mental.leadership + e.mental.attitude) / 4;
      return sum + mentAvg;
    }, 0) / filteredEvaluations.length;

    const overallAverage = (technicalAverage + physicalAverage + mentalAverage) / 3;

    // Calculate progress percentage
    const progressPercentage = filteredEvaluations.length > 1 
      ? ((latestEvaluation.overallScore - firstEvaluation.overallScore) / firstEvaluation.overallScore) * 100
      : 0;

    // Determine strengths and improvements
    const allSkills = [
      { name: 'Saque', value: latestEvaluation.technical.serve, category: 'technical' },
      { name: 'Remate', value: latestEvaluation.technical.spike, category: 'technical' },
      { name: 'Bloqueo', value: latestEvaluation.technical.block, category: 'technical' },
      { name: 'Defensa', value: latestEvaluation.technical.dig, category: 'technical' },
      { name: 'Colocación', value: latestEvaluation.technical.set, category: 'technical' },
      { name: 'Resistencia', value: latestEvaluation.physical.endurance, category: 'physical' },
      { name: 'Fuerza', value: latestEvaluation.physical.strength, category: 'physical' },
      { name: 'Agilidad', value: latestEvaluation.physical.agility, category: 'physical' },
      { name: 'Salto', value: latestEvaluation.physical.jump, category: 'physical' },
      { name: 'Concentración', value: latestEvaluation.mental.focus, category: 'mental' },
      { name: 'Trabajo en Equipo', value: latestEvaluation.mental.teamwork, category: 'mental' },
      { name: 'Liderazgo', value: latestEvaluation.mental.leadership, category: 'mental' },
      { name: 'Actitud', value: latestEvaluation.mental.attitude, category: 'mental' }
    ];

    const sortedSkills = allSkills.sort((a, b) => b.value - a.value);
    const strengths = sortedSkills.slice(0, 3);
    const improvements = sortedSkills.slice(-3).reverse();

    // Determine trend
    const trend = progressPercentage > 5 ? 'positive' : progressPercentage < -5 ? 'negative' : 'neutral';

    return {
      latestEvaluation,
      overallAverage,
      progressPercentage,
      totalEvaluations: filteredEvaluations.length,
      technicalAverage,
      physicalAverage,
      mentalAverage,
      strengths,
      improvements,
      trend
    };
  }, [filteredEvaluations]);

  // Prepare chart data for progress over time
  const progressChartData = useMemo(() => {
    if (filteredEvaluations.length === 0) return [];
    
    return [...filteredEvaluations]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((evaluation, index) => {
        const techAvg = (evaluation.technical.serve + evaluation.technical.spike + evaluation.technical.block + evaluation.technical.dig + evaluation.technical.set) / 5;
        const physAvg = (evaluation.physical.endurance + evaluation.physical.strength + evaluation.physical.agility + evaluation.physical.jump) / 4;
        const mentAvg = (evaluation.mental.focus + evaluation.mental.teamwork + evaluation.mental.leadership + evaluation.mental.attitude) / 4;
        
        return {
          date: formatDateSafe(evaluation.date),
          overall: evaluation.overallScore,
          technical: techAvg,
          physical: physAvg,
          mental: mentAvg,
          evaluationNumber: index + 1
        };
      });
  }, [filteredEvaluations]);

  // Prepare radar chart data for latest evaluation
  const radarChartData = useMemo(() => {
    if (!metrics.latestEvaluation) return [];
    
    return [
      { skill: 'Saque', value: metrics.latestEvaluation.technical.serve * 10 },
      { skill: 'Remate', value: metrics.latestEvaluation.technical.spike * 10 },
      { skill: 'Bloqueo', value: metrics.latestEvaluation.technical.block * 10 },
      { skill: 'Defensa', value: metrics.latestEvaluation.technical.dig * 10 },
      { skill: 'Colocación', value: metrics.latestEvaluation.technical.set * 10 },
      { skill: 'Resistencia', value: metrics.latestEvaluation.physical.endurance * 10 },
      { skill: 'Fuerza', value: metrics.latestEvaluation.physical.strength * 10 },
      { skill: 'Agilidad', value: metrics.latestEvaluation.physical.agility * 10 },
      { skill: 'Salto', value: metrics.latestEvaluation.physical.jump * 10 },
      { skill: 'Concentración', value: metrics.latestEvaluation.mental.focus * 10 },
      { skill: 'Trabajo en Equipo', value: metrics.latestEvaluation.mental.teamwork * 10 },
      { skill: 'Liderazgo', value: metrics.latestEvaluation.mental.leadership * 10 },
      { skill: 'Actitud', value: metrics.latestEvaluation.mental.attitude * 10 }
    ];
  }, [metrics.latestEvaluation]);

  // Prepare comparison chart data (first vs latest)
  const comparisonChartData = useMemo(() => {
    if (filteredEvaluations.length < 2) return [];
    
    const firstEval = [...filteredEvaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    const latestEval = metrics.latestEvaluation!;
    
    const firstTech = (firstEval.technical.serve + firstEval.technical.spike + firstEval.technical.block + firstEval.technical.dig + firstEval.technical.set) / 5;
    const latestTech = (latestEval.technical.serve + latestEval.technical.spike + latestEval.technical.block + latestEval.technical.dig + latestEval.technical.set) / 5;
    
    const firstPhys = (firstEval.physical.endurance + firstEval.physical.strength + firstEval.physical.agility + firstEval.physical.jump) / 4;
    const latestPhys = (latestEval.physical.endurance + latestEval.physical.strength + latestEval.physical.agility + latestEval.physical.jump) / 4;
    
    const firstMent = (firstEval.mental.focus + firstEval.mental.teamwork + firstEval.mental.leadership + firstEval.mental.attitude) / 4;
    const latestMent = (latestEval.mental.focus + latestEval.mental.teamwork + latestEval.mental.leadership + latestEval.mental.attitude) / 4;
    
    return [
      { category: 'Técnica', primera: firstTech * 10, actual: latestTech * 10 },
      { category: 'Física', primera: firstPhys * 10, actual: latestPhys * 10 },
      { category: 'Mental', primera: firstMent * 10, actual: latestMent * 10 }
    ];
  }, [filteredEvaluations, metrics.latestEvaluation]);

  // Category distribution for pie chart
  const categoryDistribution = useMemo(() => {
    if (!metrics.latestEvaluation) return [];
    
    return [
      { name: 'Técnica', value: metrics.technicalAverage * 10, color: '#3B82F6' },
      { name: 'Física', value: metrics.physicalAverage * 10, color: '#10B981' },
      { name: 'Mental', value: metrics.mentalAverage * 10, color: '#8B5CF6' }
    ];
  }, [metrics]);

  const getProgressColor = (percentage: number) => {
    if (percentage > 10) return 'text-green-600 dark:text-green-400';
    if (percentage > 0) return 'text-blue-600 dark:text-blue-400';
    if (percentage > -5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressIcon = (percentage: number) => {
    if (percentage > 0) return <FiTrendingUp className="w-4 h-4" />;
    return <FiActivity className="w-4 h-4" />;
  };

  const exportProgressReport = () => {
    // In a real app, this would generate a PDF report
    console.log('Exporting progress report for', myStudent.name);
    alert('Funcionalidad de exportación implementada en desarrollo completo');
  };

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
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <FiStar className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Progreso de {myStudent.name}</h1>
              <p className="text-blue-100 text-lg">{categories.find(c => c.id === myStudent.categoryId)?.name || 'Sin categoría'} • {myStudent.age} años</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <FiTarget className="w-4 h-4" />
                  <span className="text-sm">{metrics.totalEvaluations} evaluaciones</span>
                </div>
                <div className="flex items-center gap-2">
                  {getProgressIcon(metrics.progressPercentage)}
                  <span className={`text-sm font-medium ${getProgressColor(metrics.progressPercentage)}`}>
                    {metrics.progressPercentage > 0 ? '+' : ''}{metrics.progressPercentage.toFixed(1)}% progreso
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnalysisModal(true)}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <FiEye className="w-4 h-4 mr-2 inline" />
              Análisis Detallado
            </button>
            <button
              onClick={exportProgressReport}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <FiDownload className="w-4 h-4 mr-2 inline" />
              Exportar Reporte
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiFilter className="w-5 h-5" />
            Filtros de Análisis
          </h3>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Período:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              >
                <option value="3months">Últimos 3 meses</option>
                <option value="6months">Últimos 6 meses</option>
                <option value="1year">Último año</option>
                <option value="all">Todo el tiempo</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Categoría:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
              >
                <option value="all">Todas</option>
                <option value="technical">Técnica</option>
                <option value="physical">Física</option>
                <option value="mental">Mental</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Última Evaluación</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.latestEvaluation ? metrics.latestEvaluation.overallScore.toFixed(1) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {metrics.latestEvaluation ? formatDateSafe(metrics.latestEvaluation.date) : 'Sin evaluaciones'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FiTarget className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio General</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.overallAverage.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Todas las evaluaciones</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FiBarChart2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso</p>
              <p className={`text-2xl font-bold ${getProgressColor(metrics.progressPercentage)}`}>
                {metrics.progressPercentage > 0 ? '+' : ''}{metrics.progressPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {metrics.trend === 'positive' ? 'Mejorando' : metrics.trend === 'negative' ? 'Necesita atención' : 'Estable'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              metrics.trend === 'positive' ? 'bg-green-100 dark:bg-green-900/30' :
              metrics.trend === 'negative' ? 'bg-red-100 dark:bg-red-900/30' :
              'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              {getProgressIcon(metrics.progressPercentage)}
              <FiTrendingUp className={`w-6 h-6 ${getProgressColor(metrics.progressPercentage)}`} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Evaluaciones</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics.totalEvaluations}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Período seleccionado</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <FiAward className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      {filteredEvaluations.length > 0 ? (
        <>
          {/* Progress Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evolución del Progreso</h3>
              <FiTrendingUp className="w-5 h-5 text-primary-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="date" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis domain={[0, 10]} stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '0.375rem'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="overall" stroke="#3B82F6" strokeWidth={3} name="General" />
                <Line type="monotone" dataKey="technical" stroke="#10B981" strokeWidth={2} name="Técnica" />
                <Line type="monotone" dataKey="physical" stroke="#F59E0B" strokeWidth={2} name="Física" />
                <Line type="monotone" dataKey="mental" stroke="#8B5CF6" strokeWidth={2} name="Mental" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart - Latest Evaluation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Perfil Actual de Habilidades</h3>
                <FiTarget className="w-5 h-5 text-primary-500" />
              </div>
              {metrics.latestEvaluation ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarChartData}>
                    <PolarGrid stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <PolarAngleAxis dataKey="skill" className="text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Habilidades"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay evaluaciones disponibles</p>
                </div>
              )}
            </motion.div>

            {/* Comparison Chart */}
            {comparisonChartData.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progreso por Categoría</h3>
                  <FiBarChart2 className="w-5 h-5 text-primary-500" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="category" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis domain={[0, 100]} stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '0.375rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="primera" fill="#94A3B8" name="Primera Evaluación" />
                    <Bar dataKey="actual" fill="#3B82F6" name="Evaluación Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Distribución por Categoría</h3>
                  <FiPieChart className="w-5 h-5 text-primary-500" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Strengths and Improvements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🌟 Principales Fortalezas</h3>
                <FiStar className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-3">
                {metrics.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-300">{strength.name}</h4>
                      <p className="text-sm text-green-600 dark:text-green-400 capitalize">{strength.category}</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {strength.value.toFixed(1)}/10
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Areas for Improvement */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🎯 Áreas de Mejora</h3>
                <FiTarget className="w-5 h-5 text-orange-500" />
              </div>
              <div className="space-y-3">
                {metrics.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-orange-800 dark:text-orange-300">{improvement.name}</h4>
                      <p className="text-sm text-orange-600 dark:text-orange-400 capitalize">{improvement.category}</p>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {improvement.value.toFixed(1)}/10
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Evaluation Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📅 Línea de Tiempo de Evaluaciones</h3>
              <FiCalendar className="w-5 h-5 text-primary-500" />
            </div>
            <div className="space-y-4">
              {[...filteredEvaluations]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((evaluation, index) => {
                  const coach = coaches.find(c => c.id === evaluation.coachId);
                  return (
                    <motion.div
                      key={evaluation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Evaluación por {coach?.name || 'Coach'}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateSafe(evaluation.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {evaluation.overallScore.toFixed(1)}/10
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>T: {((evaluation.technical.serve + evaluation.technical.spike + evaluation.technical.block + evaluation.technical.dig + evaluation.technical.set) / 5).toFixed(1)}</span>
                            <span>F: {((evaluation.physical.endurance + evaluation.physical.strength + evaluation.physical.agility + evaluation.physical.jump) / 4).toFixed(1)}</span>
                            <span>M: {((evaluation.mental.focus + evaluation.mental.teamwork + evaluation.mental.leadership + evaluation.mental.attitude) / 4).toFixed(1)}</span>
                          </div>
                        </div>
                        {evaluation.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            "{evaluation.notes}"
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              }
            </div>
          </motion.div>
        </>
      ) : (
        /* No Evaluations State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card text-center py-12"
        >
          <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No hay evaluaciones disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Los entrenadores aún no han registrado evaluaciones para {myStudent.name} en el período seleccionado.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Las evaluaciones aparecerán aquí una vez que los entrenadores las registren.</p>
            <p className="mt-1">Puedes cambiar el período de tiempo en los filtros arriba.</p>
          </div>
        </motion.div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Análisis Detallado del Progreso</h3>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Resumen del Progreso</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-medium text-blue-900 dark:text-blue-300">Tendencia General</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {metrics.trend === 'positive' ? 
                          `${myStudent.name} muestra una tendencia positiva con ${metrics.progressPercentage.toFixed(1)}% de mejora.` :
                          metrics.trend === 'negative' ?
                          `${myStudent.name} necesita atención en algunas áreas, con ${Math.abs(metrics.progressPercentage).toFixed(1)}% de declive.` :
                          `${myStudent.name} mantiene un rendimiento estable.`
                        }
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="font-medium text-green-900 dark:text-green-300">Fortalezas Destacadas</h5>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {metrics.strengths.length > 0 ? 
                          `Las principales fortalezas son: ${metrics.strengths.map(s => s.name).join(', ')}.` :
                          'Se identificarán fortalezas una vez que haya más evaluaciones.'
                        }
                      </p>
                    </div>
                    
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <h5 className="font-medium text-orange-900 dark:text-orange-300">Recomendaciones</h5>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        {metrics.improvements.length > 0 ? 
                          `Se recomienda enfocar el entrenamiento en: ${metrics.improvements.map(i => i.name).join(', ')}.` :
                          'Continuar con el entrenamiento actual manteniendo el buen rendimiento.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Métricas Clave</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {metrics.technicalAverage.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Promedio Técnico</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {metrics.physicalAverage.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Promedio Físico</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {metrics.mentalAverage.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Promedio Mental</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {metrics.totalEvaluations}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Evaluaciones</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowAnalysisModal(false)}
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

export default ParentProgress;