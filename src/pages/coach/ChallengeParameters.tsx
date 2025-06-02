import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiTarget, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiToggleLeft, 
  FiToggleRight,
  FiActivity,
  FiZap,
  FiHeart,
  FiSave,
  FiX
} from 'react-icons/fi';

interface ChallengeParameter {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'physical' | 'mental' | 'tactical';
  unit: string;
  valueType: 'number' | 'percentage';
  active: boolean;
}

// Helper functions moved outside component for global access
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'technical':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
    case 'physical':
      return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
    case 'mental':
      return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300';
    case 'tactical':
      return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300';
    default:
      return 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200';
  }
};

const getCategoryName = (category: string) => {
  switch (category) {
    case 'technical':
      return 'Técnico';
    case 'physical':
      return 'Físico';
    case 'mental':
      return 'Mental';
    case 'tactical':
      return 'Táctico';
    default:
      return category;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'technical':
      return <FiTarget className="w-5 h-5" />;
    case 'physical':
      return <FiZap className="w-5 h-5" />;
    case 'mental':
      return <FiHeart className="w-5 h-5" />;
    case 'tactical':
      return <FiActivity className="w-5 h-5" />;
    default:
      return <FiTarget className="w-5 h-5" />;
  }
};

const ChallengeParameters: React.FC = () => {
  const { challengeParameters, updateChallengeParameter, addChallengeParameter, darkMode } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingParam, setEditingParam] = useState<ChallengeParameter | null>(null);
  const [showMigrationMessage, setShowMigrationMessage] = useState(false);

  // Debug: Log parameters on mount and updates
  useEffect(() => {
    console.log('ChallengeParameters - parámetros actuales:', challengeParameters);
  }, [challengeParameters]);
  
  // Check if any parameters need migration (don't have valueType)
  useEffect(() => {
    const needsMigration = challengeParameters.some(param => param.valueType === undefined);
    if (needsMigration) {
      setShowMigrationMessage(true);
    }
  }, [challengeParameters]);
  
  // Function to migrate all parameters
  const migrateParameters = () => {
    challengeParameters.forEach(param => {
      if (param.valueType === undefined) {
        // Determine valueType based on unit (% indicates percentage)
        const valueType = param.unit === '%' ? 'percentage' : 'number';
        updateChallengeParameter(param.id, { valueType });
      }
    });
    setShowMigrationMessage(false);
  };
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'technical' as const,
    unit: '',
    valueType: 'number' as 'number' | 'percentage',
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingParam) {
      // Update existing parameter
      updateChallengeParameter(editingParam.id, formData);
    } else {
      // Add new parameter
      addChallengeParameter(formData);
    }

    setShowModal(false);
    setEditingParam(null);
    setFormData({
      name: '',
      description: '',
      category: 'technical',
      unit: '',
      valueType: 'number',
      active: true
    });
  };

  const handleEdit = (param: ChallengeParameter) => {
    setEditingParam(param);
    setFormData({
      name: param.name,
      description: param.description,
      category: param.category,
      unit: param.unit,
      valueType: param.valueType || (param.unit === '%' ? 'percentage' : 'number'),
      active: param.active
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingParam(null);
    // Reset form data when closing modal
    setFormData({
      name: '',
      description: '',
      category: 'technical',
      unit: '',
      valueType: 'number',
      active: true
    });
  };

  const handleToggleActive = (param: ChallengeParameter) => {
    updateChallengeParameter(param.id, { active: !param.active });
  };



  return (
    <div className="space-y-6">
      {/* Migration Alert */}
      {showMigrationMessage && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Se han detectado parámetros que necesitan actualizarse para incluir el tipo de valor.
              </p>
              <div className="mt-2">
                <button
                  onClick={migrateParameters}
                  className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/50 hover:bg-yellow-200 dark:hover:bg-yellow-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Actualizar todos los parámetros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Parámetros de Desafíos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona los parámetros que se pueden registrar en los logros de estudiantes</p>
        </div>
        <button
          onClick={() => {
            setEditingParam(null);
            setFormData({
              name: '',
              description: '',
              category: 'technical',
              unit: '',
              valueType: 'number',
              active: true
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Parámetro
        </button>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Parámetros</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{challengeParameters.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <FiTarget className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {challengeParameters.filter(p => p.active).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <FiToggleRight className="w-6 h-6 text-green-600 dark:text-green-400" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Técnicos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {challengeParameters.filter(p => p.category === 'technical').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Físicos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {challengeParameters.filter(p => p.category === 'physical').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <FiZap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Parameters Table */}
      {/* Help Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
      >
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Tipos de Parámetros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-700">
            <div className="flex items-center mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 mr-2">
                Numérico
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Ejemplo: 15 saques</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ideal para contar cantidades exactas como repeticiones, puntos o tiempo. Los estudiantes registrarán un número específico como valor.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-700">
            <div className="flex items-center mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 mr-2">
                Porcentaje
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Ejemplo: 80% de precisión</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Perfecto para medir eficiencia, precisión o tasas de éxito. Los estudiantes registrarán un valor de 0-100 que se mostrará como porcentaje.
            </p>
          </div>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-400 mt-3">
          <strong>Consejo:</strong> Define claramente la unidad de medida para facilitar el registro de logros por parte de los estudiantes.
        </p>
      </motion.div>
      
      {/* Parameters Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lista de Parámetros</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Parámetro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo de Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Unidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {challengeParameters.map((param) => (
                <tr key={param.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{param.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{param.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(param.category)}`}>
                      {getCategoryIcon(param.category)}
                      <span className="ml-1 capitalize">{param.category}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      param.valueType === 'percentage' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
                    }`}>
                      {param.valueType === 'percentage' ? 'Porcentaje' : 'Numérico'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {param.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(param)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        param.active 
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50' 
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                      }`}
                    >
                      {param.active ? (
                        <>
                          <FiToggleRight className="w-3 h-3 mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <FiToggleLeft className="w-3 h-3 mr-1" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(param)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {challengeParameters.length === 0 && (
          <div className="text-center py-12">
            <FiTarget className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay parámetros</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comienza creando tu primer parámetro de desafío.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingParam(null);
                  setFormData({
                    name: '',
                    description: '',
                    category: 'technical',
                    unit: '',
                    valueType: 'number',
                    active: true
                  });
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Nuevo Parámetro
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ParameterModal 
            editingParam={editingParam}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente Modal separado y memoizado
const ParameterModal = React.memo(({ 
  editingParam, 
  formData, 
  setFormData, 
  onSubmit, 
  onClose 
}: {
  editingParam: ChallengeParameter | null;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={onClose}
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
          {editingParam ? 'Editar Parámetro' : 'Nuevo Parámetro de Desafío'}
        </h3>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Parámetro
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Ej: Saques Directos"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder="Descripción detallada del parámetro..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as any})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="technical">Técnico</option>
              <option value="physical">Físico</option>
              <option value="mental">Mental</option>
              <option value="tactical">Táctico</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Valor
            </label>
            <select
              value={formData.valueType}
              onChange={(e) => setFormData({...formData, valueType: e.target.value as 'number' | 'percentage'})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="number">Numérico</option>
              <option value="percentage">Porcentaje</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.valueType === 'number' 
                ? 'Se evaluará con cantidades numéricas (ejemplo: 10 repeticiones)' 
                : 'Se evaluará con porcentajes (ejemplo: 80% de precisión)'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unidad de Medida
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={formData.valueType === 'number' ? "Ej: saques, defensas, puntos" : "Ej: precisión, efectividad"}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.valueType === 'percentage' && "Para porcentajes, la unidad suele ser '%' o se mostrará automáticamente"}
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({...formData, active: e.target.checked})}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Parámetro activo
            </label>
          </div>

          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 bg-white dark:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {editingParam ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  </motion.div>
));

export default ChallengeParameters;