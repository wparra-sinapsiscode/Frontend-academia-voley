import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiSearch, 
  FiFilter, 
  FiStar, 
  FiTrendingUp, 
  FiAward, 
  FiEye, 
  FiEdit, 
  FiPlus, 
  FiBarChart,
  FiUser,
  FiCalendar,
  FiTarget,
  FiSettings,
  FiTrash2
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StudentEvaluations: React.FC = () => {
  const { 
    students, 
    evaluations, 
    user, 
    addEvaluation, 
    challengeParameters, 
    addStudentLog, 
    updateStudentLog,
    deleteStudentLog,
    studentLogs, 
    evaluationFields,
    darkMode 
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedLogDetail, setSelectedLogDetail] = useState<any>(null);


  // Obtener campos activos por categoría
  const technicalFields = evaluationFields.filter(f => f.category === 'technical' && f.active);
  const physicalFields = evaluationFields.filter(f => f.category === 'physical' && f.active);
  const mentalFields = evaluationFields.filter(f => f.category === 'mental' && f.active);

  // Filter evaluations for this coach's students
  const myStudents = students.filter(s => s.coachId === user?.id);
  const myEvaluations = evaluations.filter(evaluation => 
    myStudents.some(student => student.id === evaluation.studentId)
  );

  // Filter students and evaluations based on search
  const filteredStudents = myStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvaluations = myEvaluations.filter(evaluation => {
    const student = students.find(s => s.id === evaluation.studentId);
    const matchesSearch = !searchTerm || student?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStudent = !selectedStudent || evaluation.studentId === selectedStudent;
    return matchesSearch && matchesStudent;
  });

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateTechnicalAverage = (technical: any) => {
    if (!technical || Object.keys(technical).length === 0) return 0;
    
    const scores = Object.values(technical) as number[];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const calculatePhysicalAverage = (physical: any) => {
    if (!physical || Object.keys(physical).length === 0) return 0;
    
    const scores = Object.values(physical) as number[];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const calculateMentalAverage = (mental: any) => {
    if (!mental || Object.keys(mental).length === 0) return 0;
    
    const scores = Object.values(mental) as number[];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Student log modal functions - moved to inside LogModal component

  const EvaluationModal = () => {
    // Crear el formulario con campos dinámicos basados en los campos de evaluación activos
    const initialTechnical: Record<string, number> = {};
    const initialPhysical: Record<string, number> = {};
    const initialMental: Record<string, number> = {};
    
    // Inicializar con valores predeterminados (5) para cada campo activo
    technicalFields.forEach(field => {
      initialTechnical[field.id] = 5;
    });
    
    physicalFields.forEach(field => {
      initialPhysical[field.id] = 5;
    });
    
    mentalFields.forEach(field => {
      initialMental[field.id] = 5;
    });
    
    const [formData, setFormData] = useState({
      studentId: '',
      technical: initialTechnical,
      physical: initialPhysical,
      mental: initialMental,
      notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.studentId) return;

      const technicalAvg = calculateTechnicalAverage(formData.technical);
      const physicalAvg = calculatePhysicalAverage(formData.physical);
      const mentalAvg = calculateMentalAverage(formData.mental);
      const overallScore = (technicalAvg + physicalAvg + mentalAvg) / 3;

      const newEvaluation = {
        studentId: formData.studentId,
        coachId: user?.id || '',
        date: new Date(),
        technical: formData.technical,
        physical: formData.physical,
        mental: formData.mental,
        notes: formData.notes,
        overallScore: Math.round(overallScore * 10) / 10
      };

      addEvaluation(newEvaluation);
      setShowEvaluationModal(false);
      setFormData({
        studentId: '',
        technical: { ...initialTechnical },
        physical: { ...initialPhysical },
        mental: { ...initialMental },
        notes: ''
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
        onClick={() => setShowEvaluationModal(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Nueva Evaluación</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estudiante
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  {myStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Technical Skills */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Habilidades Técnicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {technicalFields.length > 0 ? (
                    Object.entries(formData.technical).map(([fieldId, value]) => {
                      const field = technicalFields.find(f => f.id === fieldId);
                      return field ? (
                        <div key={fieldId}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {field.name}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={value || 5}
                            onChange={(e) => setFormData({
                              ...formData,
                              technical: { ...formData.technical, [fieldId]: parseInt(e.target.value) }
                            })}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>1</span>
                            <span className="font-medium">{value}</span>
                            <span>10</span>
                          </div>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">No hay campos técnicos configurados. 
                      <Link to="/coach/evaluation-fields" className="text-primary-600 ml-1 hover:underline">
                        Configurar campos
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              {/* Physical Skills */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Condición Física</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {physicalFields.length > 0 ? (
                    Object.entries(formData.physical).map(([fieldId, value]) => {
                      const field = physicalFields.find(f => f.id === fieldId);
                      return field ? (
                        <div key={fieldId}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {field.name}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={value || 5}
                            onChange={(e) => setFormData({
                              ...formData,
                              physical: { ...formData.physical, [fieldId]: parseInt(e.target.value) }
                            })}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>1</span>
                            <span className="font-medium">{value}</span>
                            <span>10</span>
                          </div>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">No hay campos físicos configurados. 
                      <Link to="/coach/evaluation-fields" className="text-primary-600 ml-1 hover:underline">
                        Configurar campos
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              {/* Mental Skills */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Aspectos Mentales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentalFields.length > 0 ? (
                    Object.entries(formData.mental).map(([fieldId, value]) => {
                      const field = mentalFields.find(f => f.id === fieldId);
                      return field ? (
                        <div key={fieldId}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {field.name}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={value || 5}
                            onChange={(e) => setFormData({
                              ...formData,
                              mental: { ...formData.mental, [fieldId]: parseInt(e.target.value) }
                            })}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>1</span>
                            <span className="font-medium">{value}</span>
                            <span>10</span>
                          </div>
                        </div>
                      ) : null;
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">No hay campos mentales configurados. 
                      <Link to="/coach/evaluation-fields" className="text-primary-600 ml-1 hover:underline">
                        Configurar campos
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Observaciones generales, fortalezas, áreas de mejora..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEvaluationModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Guardar Evaluación
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const LogModal = () => {
    // Move form state inside the modal component to prevent parent re-renders
    const [logFormData, setLogFormData] = useState({
      studentId: editingLog?.studentId || '',
      parameter: editingLog?.parameter || '',
      value: editingLog?.value || 1,
      description: editingLog?.description || ''
    });
    

    // Find the selected parameter to determine value type
    const selectedParameter = challengeParameters.find(p => p.id === logFormData.parameter);
    // Check if valueType exists, otherwise determine by unit (assume '%' means percentage)
    const isPercentage = selectedParameter ? 
      (selectedParameter.valueType === 'percentage' || selectedParameter.unit === '%') : 
      false;

    const handleLogSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!logFormData.studentId || !logFormData.parameter) return;

      // Validate percentage values are between 0-100
      if (isPercentage && (logFormData.value < 0 || logFormData.value > 100)) {
        alert('El porcentaje debe estar entre 0 y 100');
        return;
      }

      if (editingLog) {
        // Update existing log
        updateStudentLog(editingLog.id, {
          studentId: logFormData.studentId,
          parameter: logFormData.parameter,
          value: logFormData.value,
          description: logFormData.description
        });
      } else {
        // Create new log
        addStudentLog({
          studentId: logFormData.studentId,
          coachId: user?.id || '',
          date: new Date(),
          parameter: logFormData.parameter,
          value: logFormData.value,
          description: logFormData.description
        });
      }

      setShowLogModal(false);
      setEditingLog(null);
      setLogFormData({
        studentId: '',
        parameter: '',
        value: 1,
        description: ''
      });
    };

    const handleClose = () => {
      setShowLogModal(false);
      setEditingLog(null);
      setLogFormData({
        studentId: '',
        parameter: '',
        value: 1,
        description: ''
      });
    };

    // Get min and max values based on parameter type
    const getMinValue = () => isPercentage ? 0 : 1;
    const getMaxValue = () => isPercentage ? 100 : undefined;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {editingLog ? 'Editar Logro o Evaluación Específica' : 'Registrar Logro o Evaluación Específica'}
            </h3>
            
            <form onSubmit={handleLogSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estudiante
                </label>
                <select
                  value={logFormData.studentId}
                  onChange={(e) => setLogFormData({...logFormData, studentId: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Seleccionar estudiante</option>
                  {myStudents.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parámetro a Evaluar
                </label>
                <select
                  value={logFormData.parameter}
                  onChange={(e) => {
                    // Reset value when changing parameter type
                    const newParam = challengeParameters.find(p => p.id === e.target.value);
                    const defaultValue = newParam?.valueType === 'percentage' ? 50 : 1;
                    
                    setLogFormData({
                      ...logFormData, 
                      parameter: e.target.value,
                      value: defaultValue
                    });
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Seleccionar parámetro</option>
                  {(!challengeParameters || challengeParameters.length === 0) ? (
                    <option value="" disabled>No hay parámetros disponibles - Crear en sección Parámetros</option>
                  ) : (
                    challengeParameters
                      .map(param => (
                        <option key={param.id} value={param.id}>
                          {param.name} ({param.unit}) - {param.valueType || 'número'} {param.active ? '' : '(Inactivo)'}
                        </option>
                      ))
                  )}
                </select>
                {(!challengeParameters || challengeParameters.length === 0) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    No hay parámetros configurados. 
                    <Link to="/coach/challenge-parameters" className="text-primary-600 dark:text-primary-400 hover:underline ml-1">
                      Crear parámetros
                    </Link>
                  </p>
                )}
              </div>

              {logFormData.parameter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isPercentage ? 'Porcentaje' : 'Cantidad'}
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        min={getMinValue()}
                        max={getMaxValue()}
                        value={logFormData.value}
                        onChange={(e) => setLogFormData({
                          ...logFormData, 
                          value: parseInt(e.target.value) || (isPercentage ? 0 : 1)
                        })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                      {isPercentage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ingresa un valor entre 0 y 100
                        </p>
                      )}
                    </div>
                    
                    {selectedParameter && (
                      <div>
                        <input
                          type="range"
                          min={getMinValue()}
                          max={getMaxValue()}
                          value={logFormData.value}
                          onChange={(e) => setLogFormData({
                            ...logFormData, 
                            value: parseInt(e.target.value)
                          })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{getMinValue()}</span>
                          <span className="font-medium">{logFormData.value}{isPercentage ? '%' : ''}</span>
                          <span>{getMaxValue()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={logFormData.description}
                  onChange={(e) => setLogFormData({...logFormData, description: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Describe el contexto del logro o evaluación..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 bg-white dark:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingLog ? 'Actualizar Evaluación' : 'Registrar Evaluación'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Evaluaciones de Estudiantes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Evalúa el progreso técnico, físico y mental de tus estudiantes</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/coach/evaluation-fields"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <FiSettings className="w-4 h-4 mr-2" />
            Configurar Campos
          </Link>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FiTarget className="w-4 h-4 mr-2" />
            Registrar Logro
          </button>
          <button
            onClick={() => setShowEvaluationModal(true)}
            className="btn-primary"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Nueva Evaluación
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
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{myStudents.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FiUser className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Evaluaciones</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{myEvaluations.length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FiTarget className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio General</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {myEvaluations.length > 0 
                  ? (myEvaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / myEvaluations.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <FiBarChart className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Esta Semana</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {myEvaluations.filter(evaluation => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return evaluation.date >= weekAgo;
                }).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <FiCalendar className="w-6 h-6 text-orange-600" />
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Todas las estudiantes</option>
              {myStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Recent Specific Evaluations/Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Logros y Evaluaciones Específicas</h3>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-1" />
            Registrar Nuevo
          </button>
        </div>
        
        {studentLogs.length > 0 ? (
          <div className="space-y-4">
            {studentLogs
              .filter(log => {
                const student = students.find(s => s.id === log.studentId);
                const matchesSearch = !searchTerm || student?.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStudent = !selectedStudent || log.studentId === selectedStudent;
                return matchesSearch && matchesStudent;
              })
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5) // Show only the 5 most recent logs
              .map((log, index) => {
                const student = students.find(s => s.id === log.studentId);
                const parameter = challengeParameters.find(p => p.id === log.parameter);
                const isPercentage = parameter?.valueType === 'percentage';
                
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={student?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                          alt={student?.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{student?.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {log.date.toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-primary-100 rounded-full px-3 py-1 text-primary-800 text-sm font-medium">
                            {parameter?.name || 'Parámetro desconocido'}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedLogDetail(log)}
                              className="p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                              title="Ver detalles"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            {log.coachId === user?.id && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingLog(log);
                                    setShowLogModal(true);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                                  title="Editar"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(log.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                  title="Eliminar"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <p className={`text-xl font-bold ${isPercentage ? (log.value >= 70 ? 'text-green-600' : log.value >= 40 ? 'text-yellow-600' : 'text-red-600') : ''}`}>
                              {log.value}{isPercentage ? '%' : ` ${parameter?.unit || ''}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            
            {studentLogs.length > 5 && (
              <div className="text-center mt-4">
                <button className="text-primary-600 hover:text-primary-800 font-medium">
                  Ver todos los logros y evaluaciones
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiTarget className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay logros registrados</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {myStudents.length === 0 
                ? 'No tienes estudiantes asignadas.'
                : 'Aún no has registrado logros específicos de tus estudiantes.'
              }
            </p>
            {myStudents.length > 0 && (
              <button
                onClick={() => setShowLogModal(true)}
                className="btn-primary"
              >
                Registrar Primer Logro
              </button>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Evaluations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Evaluaciones Generales Recientes</h3>
        
        {filteredEvaluations.length > 0 ? (
          <div className="space-y-4">
            {filteredEvaluations
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((evaluation, index) => {
                const student = students.find(s => s.id === evaluation.studentId);
                const technicalAvg = calculateTechnicalAverage(evaluation.technical);
                const physicalAvg = calculatePhysicalAverage(evaluation.physical);
                const mentalAvg = calculateMentalAverage(evaluation.mental);

                return (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={student?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                          alt={student?.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{student?.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {evaluation.date.toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Técnico</p>
                          <p className={`font-bold ${getScoreColor(technicalAvg)}`}>
                            {technicalAvg.toFixed(1)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Físico</p>
                          <p className={`font-bold ${getScoreColor(physicalAvg)}`}>
                            {physicalAvg.toFixed(1)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Mental</p>
                          <p className={`font-bold ${getScoreColor(mentalAvg)}`}>
                            {mentalAvg.toFixed(1)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">General</p>
                          <p className={`text-xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                            {evaluation.overallScore.toFixed(1)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => setSelectedEvaluation(evaluation)}
                          className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiTarget className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay evaluaciones</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {myStudents.length === 0 
                ? 'No tienes estudiantes asignadas.'
                : 'Aún no has creado evaluaciones para tus estudiantes.'
              }
            </p>
            {myStudents.length > 0 && (
              <button
                onClick={() => setShowEvaluationModal(true)}
                className="btn-primary"
              >
                Crear Primera Evaluación
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Evaluation Modal */}
      <AnimatePresence>
        {showEvaluationModal && <EvaluationModal />}
      </AnimatePresence>

      {/* Log Modal */}
      <AnimatePresence>
        {showLogModal && <LogModal />}
      </AnimatePresence>

      {/* Evaluation Detail Modal */}
      <AnimatePresence>
        {selectedEvaluation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
          onClick={() => setSelectedEvaluation(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Evaluación de {students.find(s => s.id === selectedEvaluation.studentId)?.name}
                </h3>
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Habilidades Técnicas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEvaluation.technical && Object.entries(selectedEvaluation.technical).map(([fieldId, value]) => {
                      const field = evaluationFields.find(f => f.id === fieldId && f.category === 'technical');
                      return field ? (
                        <div key={fieldId}>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{field.name}:</span>
                          <span className={`ml-2 font-medium ${getScoreColor(value as number)}`}>
                            {value}/10
                          </span>
                        </div>
                      ) : null;
                    })}
                    {(!selectedEvaluation.technical || Object.keys(selectedEvaluation.technical).length === 0) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">No hay evaluaciones técnicas registradas</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Condición Física</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEvaluation.physical && Object.entries(selectedEvaluation.physical).map(([fieldId, value]) => {
                      const field = evaluationFields.find(f => f.id === fieldId && f.category === 'physical');
                      return field ? (
                        <div key={fieldId}>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{field.name}:</span>
                          <span className={`ml-2 font-medium ${getScoreColor(value as number)}`}>
                            {value}/10
                          </span>
                        </div>
                      ) : null;
                    })}
                    {(!selectedEvaluation.physical || Object.keys(selectedEvaluation.physical).length === 0) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">No hay evaluaciones físicas registradas</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Aspectos Mentales</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEvaluation.mental && Object.entries(selectedEvaluation.mental).map(([fieldId, value]) => {
                      const field = evaluationFields.find(f => f.id === fieldId && f.category === 'mental');
                      return field ? (
                        <div key={fieldId}>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{field.name}:</span>
                          <span className={`ml-2 font-medium ${getScoreColor(value as number)}`}>
                            {value}/10
                          </span>
                        </div>
                      ) : null;
                    })}
                    {(!selectedEvaluation.mental || Object.keys(selectedEvaluation.mental).length === 0) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">No hay evaluaciones mentales registradas</p>
                    )}
                  </div>
                </div>

                {selectedEvaluation.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Observaciones</h4>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedEvaluation.notes}
                    </p>
                  </div>
                )}

                <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Puntuación General</p>
                  <p className={`text-3xl font-bold ${getScoreColor(selectedEvaluation.overallScore)}`}>
                    {selectedEvaluation.overallScore.toFixed(1)}/10
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLogDetail && (() => {
          const student = students.find(s => s.id === selectedLogDetail.studentId);
          const parameter = challengeParameters.find(p => p.id === selectedLogDetail.parameter);
          const isPercentage = parameter?.valueType === 'percentage';
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
              onClick={() => setSelectedLogDetail(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Detalle del Logro
                  </h3>
                  <button
                    onClick={() => setSelectedLogDetail(null)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Estudiante */}
                  <div className="flex items-center gap-3">
                    <img
                      src={student?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                      alt={student?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{student?.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estudiante</p>
                    </div>
                  </div>
                  
                  <div className="border-t dark:border-gray-700 pt-4">
                    {/* Parámetro */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Parámetro Evaluado</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          parameter?.category === 'technical' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' :
                          parameter?.category === 'physical' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                          parameter?.category === 'mental' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' :
                          'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
                        }`}>
                          {parameter?.name || 'Parámetro desconocido'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Valor */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Valor Registrado</p>
                      <p className={`text-2xl font-bold ${
                        isPercentage ? (selectedLogDetail.value >= 70 ? 'text-green-600' : selectedLogDetail.value >= 40 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {selectedLogDetail.value}{isPercentage ? '%' : ` ${parameter?.unit || ''}`}
                      </p>
                    </div>
                    
                    {/* Fecha */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha de Registro</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {selectedLogDetail.date.toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    {/* Descripción */}
                    {selectedLogDetail.description && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Observaciones</p>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {selectedLogDetail.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedLogDetail(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Eliminar Logro
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                ¿Estás seguro de que deseas eliminar este logro? Se perderá toda la información asociada.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    deleteStudentLog(showDeleteConfirm);
                    setShowDeleteConfirm(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentEvaluations;