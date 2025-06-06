import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Download, Calendar, TrendingUp, Award, Clock } from 'lucide-react';
import { generateReportPDF } from '../../utils/pdfGenerator';

const ParentReports: React.FC = () => {
  const { user, users, students, evaluations, categories } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('progress');
  const student = students.find(s => s.parentId === user?.id);
  
  // Get evaluations for this student
  const studentEvaluations = evaluations.filter(evaluation => evaluation.studentId === student?.id);
  
  // Filter data based on selected period
  const getFilteredData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    
    switch (selectedPeriod) {
      case 'week': {
        // Last 7 days
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        return {
          startDate: weekStart,
          endDate: now,
          months: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7']
        };
      }
      
      case 'month': {
        // Current month
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        return {
          startDate: monthStart,
          endDate: monthEnd,
          months: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']
        };
      }
      
      case 'trimester': {
        // Current quarter
        const quarterStart = new Date(currentYear, currentQuarter * 3, 1);
        const quarterEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0);
        const quarterMonths = [];
        for (let i = 0; i < 3; i++) {
          const monthIndex = currentQuarter * 3 + i;
          quarterMonths.push(new Date(currentYear, monthIndex, 1).toLocaleDateString('es', { month: 'short' }));
        }
        return {
          startDate: quarterStart,
          endDate: quarterEnd,
          months: quarterMonths
        };
      }
      
      case 'year': {
        // Current year
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        const yearMonths = [];
        for (let i = 0; i < 12; i++) {
          yearMonths.push(new Date(currentYear, i, 1).toLocaleDateString('es', { month: 'short' }));
        }
        return {
          startDate: yearStart,
          endDate: yearEnd,
          months: yearMonths
        };
      }
      
      default:
        return {
          startDate: new Date(currentYear, currentMonth, 1),
          endDate: now,
          months: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']
        };
    }
  }, [selectedPeriod]);
  
  // Calculate real skills data from evaluations
  const getLatestSkillsData = () => {
    if (studentEvaluations.length === 0) {
      // Return default data when no evaluations exist
      return [
        { skill: 'Servicio', score: 6, maxScore: 10 },
        { skill: 'Remate', score: 6, maxScore: 10 },
        { skill: 'Recepción', score: 6, maxScore: 10 },
        { skill: 'Bloqueo', score: 6, maxScore: 10 },
        { skill: 'Colocación', score: 6, maxScore: 10 }
      ];
    }
    
    const latest = studentEvaluations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return [
      { skill: 'Servicio', score: latest.technical.serve, maxScore: 10 },
      { skill: 'Remate', score: latest.technical.spike, maxScore: 10 },
      { skill: 'Recepción', score: latest.technical.dig, maxScore: 10 },
      { skill: 'Bloqueo', score: latest.technical.block, maxScore: 10 },
      { skill: 'Colocación', score: latest.technical.set, maxScore: 10 }
    ];
  };

  // Generate dynamic data based on selected period
  const attendanceData = useMemo(() => {
    const { months } = getFilteredData;
    const baseAttendance = selectedPeriod === 'week' ? 2 : selectedPeriod === 'month' ? 4 : selectedPeriod === 'trimester' ? 12 : 48;
    const baseFaults = selectedPeriod === 'week' ? 0 : selectedPeriod === 'month' ? 1 : selectedPeriod === 'trimester' ? 3 : 12;
    
    return months.map((month, index) => ({
      month: month,
      asistencias: Math.floor(baseAttendance * (0.8 + Math.random() * 0.2)),
      faltas: Math.floor(baseFaults * (0.5 + Math.random() * 0.5))
    }));
  }, [selectedPeriod, getFilteredData]);

  const skillsData = getLatestSkillsData();

  const progressData = useMemo(() => {
    const { months } = getFilteredData;
    const baseTecnica = 6.5;
    const baseFisica = 7.0;
    const baseTactica = 5.8;
    
    return months.map((month, index) => {
      // Simulate progression over time
      const progression = index * (selectedPeriod === 'week' ? 0.1 : selectedPeriod === 'month' ? 0.3 : selectedPeriod === 'trimester' ? 0.5 : 0.2);
      return {
        month: month,
        tecnica: Math.min(10, baseTecnica + progression + Math.random() * 0.2),
        fisica: Math.min(10, baseFisica + progression + Math.random() * 0.2),
        tactica: Math.min(10, baseTactica + progression + Math.random() * 0.2)
      };
    });
  }, [selectedPeriod, getFilteredData]);

  const achievementsData = [
    { type: 'Completados', value: 12, color: '#10B981' },
    { type: 'En progreso', value: 5, color: '#F59E0B' },
    { type: 'Pendientes', value: 3, color: '#EF4444' }
  ];

  const generateReport = async () => {
    if (!student || !studentEvaluations) {
      alert('No se encontró información del estudiante');
      return;
    }

    // Calculate attendance rate based on the data
    const totalClasses = attendanceData.reduce((sum, month) => sum + month.asistencias + month.faltas, 0);
    const totalAttended = attendanceData.reduce((sum, month) => sum + month.asistencias, 0);
    const attendanceRate = Math.round((totalAttended / totalClasses) * 100);

    // Calculate scores from evaluations
    let technicalScore = 75;
    let physicalScore = 70;
    
    if (studentEvaluations.length > 0) {
      const latestEval = studentEvaluations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      technicalScore = Math.round((latestEval.technical.serve + latestEval.technical.spike + 
                                   latestEval.technical.block + latestEval.technical.dig + 
                                   latestEval.technical.set) / 5 * 10);
      
      physicalScore = Math.round((latestEval.physical.strength + latestEval.physical.agility + 
                                  latestEval.physical.endurance + latestEval.physical.jump) / 4 * 10);
    }

    // Prepare data for PDF
    const reportData = {
      studentName: student.name,
      studentCategory: categories.find(c => c.id === student?.category?.id)?.name || 'Sin categoría',
      studentAge: student.age,
      evaluations: studentEvaluations,
      technicalScore,
      physicalScore,
      attendanceRate,
      observations: {
        strengths: `${student.name} muestra excelente dedicación y ha mejorado significativamente su técnica de recepción. Su actitud positiva y liderazgo en el equipo son ejemplares.`,
        improvements: 'Se recomienda trabajar en la coordinación del bloqueo y la potencia del servicio. Con práctica constante, puede alcanzar un nivel excelente.',
        goals: [
          'Mejorar técnica de bloqueo en red',
          'Aumentar potencia en servicio',
          'Continuar desarrollo de liderazgo',
          'Participar en torneo inter-academias'
        ]
      },
      isDarkMode: document.documentElement.classList.contains('dark')
    };

    try {
      await generateReportPDF(reportData);
    } catch (error) {
      console.error('Error generando el PDF:', error);
      alert('Hubo un error al generar el reporte. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-azul-marino dark:text-white">Reportes de Progreso</h1>
          <p className="text-gray-600 dark:text-gray-400">Análisis detallado del desarrollo de {student?.name}</p>
        </div>
        <button
          onClick={generateReport}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors shadow-md flex items-center gap-2 font-medium"
        >
          <Download size={20} />
          Generar Reporte PDF
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-claro dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
        >
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="trimester">Último trimestre</option>
          <option value="year">Último año</option>
        </select>
        
        <select
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-claro dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
        >
          <option value="progress">Reporte de Progreso</option>
          <option value="attendance">Reporte de Asistencia</option>
          <option value="skills">Evaluación de Habilidades</option>
          <option value="achievements">Logros y Objetivos</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Progreso General</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPeriod === 'week' ? 'Última semana' : 
                 selectedPeriod === 'month' ? 'Último mes' : 
                 selectedPeriod === 'trimester' ? 'Último trimestre' : 'Último año'}
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            {progressData.length > 0 ? 
              `${((progressData[progressData.length - 1].tecnica + 
                   progressData[progressData.length - 1].fisica + 
                   progressData[progressData.length - 1].tactica) / 3).toFixed(1)}/10` : 
              '8.4/10'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {progressData.length > 1 ? 
              `+${((progressData[progressData.length - 1].tecnica + 
                    progressData[progressData.length - 1].fisica + 
                    progressData[progressData.length - 1].tactica) / 3 -
                   (progressData[0].tecnica + 
                    progressData[0].fisica + 
                    progressData[0].tactica) / 3).toFixed(1)} vs inicio del período` : 
              '+0.3 vs período anterior'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-azul-claro/20 dark:bg-blue-900/30 rounded-lg">
              <Calendar size={24} className="text-azul-marino dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Asistencia</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPeriod === 'week' ? 'Última semana' : 
                 selectedPeriod === 'month' ? 'Último mes' : 
                 selectedPeriod === 'trimester' ? 'Último trimestre' : 'Último año'}
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-azul-marino dark:text-blue-400 mb-2">
            {attendanceData.length > 0 ? 
              `${Math.round((attendanceData.reduce((sum, d) => sum + d.asistencias, 0) / 
                            (attendanceData.reduce((sum, d) => sum + d.asistencias + d.faltas, 0))) * 100)}%` : 
              '94%'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {attendanceData.length > 0 ? 
              `${attendanceData.reduce((sum, d) => sum + d.asistencias, 0)}/${attendanceData.reduce((sum, d) => sum + d.asistencias + d.faltas, 0)} clases` : 
              '16/17 clases'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Award size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Logros</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total alcanzados</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">12</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">3 este mes</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Horas Entrenadas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Último mes</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">24h</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">+2h vs mes anterior</div>
        </div>
      </div>

      {selectedReport === 'progress' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-azul-marino dark:text-white mb-4">Evolución del Progreso</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="tecnica" stroke="#87CEEB" strokeWidth={2} name="Técnica" />
                <Line type="monotone" dataKey="fisica" stroke="#10B981" strokeWidth={2} name="Física" />
                <Line type="monotone" dataKey="tactica" stroke="#8B5CF6" strokeWidth={2} name="Táctica" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-azul-marino dark:text-white mb-4">Evaluación de Habilidades</h3>
            <ResponsiveContainer width="100%" height={300}>
              {skillsData.length > 0 ? (
                <RadarChart data={skillsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} />
                  <Radar name="Puntuación" dataKey="score" stroke="#87CEEB" fill="#87CEEB" fillOpacity={0.6} />
                </RadarChart>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">No hay datos de evaluación disponibles</p>
                </div>
              )}
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {selectedReport === 'attendance' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-azul-marino dark:text-white mb-4">Reporte de Asistencia</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="asistencias" fill="#10B981" name="Asistencias" />
              <Bar dataKey="faltas" fill="#EF4444" name="Faltas" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {selectedReport === 'skills' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-azul-marino dark:text-white mb-4">Evaluación Detallada de Habilidades</h3>
          <div className="space-y-4">
            {skillsData.map((skill, index) => {
              const percentage = (skill.score / skill.maxScore) * 100;
              const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-coral';
              
              return (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{skill.skill}</span>
                    <span className="text-lg font-bold text-azul-marino dark:text-blue-400">{skill.score}/{skill.maxScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-3 rounded-full ${color}`}
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {percentage >= 80 ? 'Excelente dominio' : 
                     percentage >= 60 ? 'Buen desarrollo' : 'Necesita práctica'}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {selectedReport === 'achievements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-azul-marino dark:text-white mb-4">Estado de Logros</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={achievementsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {achievementsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-azul-marino dark:text-white mb-4">Logros Recientes</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <Award size={20} className="text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-medium text-green-800 dark:text-green-300">Técnica de Servicio</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Completado el 15 de enero</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Award size={20} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-300">Asistencia Perfecta</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Mes de diciembre</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <Award size={20} className="text-purple-600 dark:text-purple-400" />
                <div>
                  <div className="font-medium text-purple-800 dark:text-purple-300">Mejora en Recepción</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">+2 puntos en evaluación</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-azul-marino dark:text-white">Observaciones del Entrenador</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar size={16} />
            Última actualización: 15/01/2024
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-azul-claro/10 dark:bg-blue-900/20 rounded-lg border-l-4 border-azul-claro dark:border-blue-500">
            <div className="font-medium text-azul-marino dark:text-blue-400 mb-2">Fortalezas Destacadas</div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {student?.name} muestra excelente dedicación y ha mejorado significativamente su técnica de recepción. 
              Su actitud positiva y liderazgo en el equipo son ejemplares.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-500">
            <div className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Áreas de Mejora</div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Se recomienda trabajar en la coordinación del bloqueo y la potencia del servicio. 
              Con práctica constante, puede alcanzar un nivel excelente.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400 dark:border-green-500">
            <div className="font-medium text-green-800 dark:text-green-300 mb-2">Objetivos para el Próximo Mes</div>
            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
              <li>• Mejorar técnica de bloqueo en red</li>
              <li>• Aumentar potencia en servicio</li>
              <li>• Continuar desarrollo de liderazgo</li>
              <li>• Participar en torneo inter-academias</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ParentReports;