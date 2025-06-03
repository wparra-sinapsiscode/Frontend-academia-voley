import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import { useAppContext } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';

// Tipos de datos para los campos de evaluación
type FieldCategory = 'technical' | 'physical' | 'mental';

const EvaluationFields: React.FC = () => {
  const { 
    user, 
    evaluationFields, 
    updateEvaluationField, 
    addEvaluationField, 
    deleteEvaluationField,
    darkMode 
  } = useAppContext();
  
  const [selectedCategory, setSelectedCategory] = useState<FieldCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);
  
  // Filtrar campos por categoría
  const filteredFields = selectedCategory === 'all' 
    ? evaluationFields 
    : evaluationFields.filter(field => field.category === selectedCategory);
  
  // Obtener el color según la categoría
  const getCategoryColor = (category: FieldCategory) => {
    switch(category) {
      case 'technical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'physical': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'mental': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200';
    }
  };
  
  // Obtener el nombre de la categoría en español
  const getCategoryName = (category: FieldCategory) => {
    switch(category) {
      case 'technical': return 'Técnico';
      case 'physical': return 'Físico';
      case 'mental': return 'Mental';
      default: return category;
    }
  };
  
  const handleAddField = (newField: Omit<any, 'id'>) => {
    addEvaluationField(newField);
    setShowAddModal(false);
  };
  
  const handleUpdateField = (updatedField: any) => {
    updateEvaluationField(updatedField.id, updatedField);
    setEditingField(null);
  };
  
  const handleDeleteField = (id: string) => {
    // No permitir eliminar campos predeterminados
    const isDefaultField = ['serve', 'spike', 'block', 'dig', 'set', 
                          'endurance', 'strength', 'agility', 'jump',
                          'focus', 'teamwork', 'leadership', 'attitude'].includes(id);
    
    if (isDefaultField) {
      alert('No se pueden eliminar los campos predeterminados. En su lugar, puede desactivarlos.');
      return;
    }
    
    if (window.confirm('¿Está seguro que desea eliminar este campo de evaluación?')) {
      deleteEvaluationField(id);
    }
  };
  
  const handleToggleActive = (id: string) => {
    const field = evaluationFields.find(f => f.id === id);
    if (field) {
      updateEvaluationField(id, { active: !field.active });
    }
  };
  
  // Componente modal para añadir o editar campos
  const FieldFormModal = ({ field, onSave, onCancel }: { 
    field?: EvaluationField, 
    onSave: (field: any) => void, 
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      name: field?.name || '',
      category: field?.category || 'technical' as FieldCategory,
      description: field?.description || '',
      active: field?.active !== undefined ? field.active : true
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) return;
      
      onSave(formData);
    };
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {field ? 'Editar Campo de Evaluación' : 'Nuevo Campo de Evaluación'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ej. Pase de antebrazos"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as FieldCategory})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="technical">Técnico</option>
                  <option value="physical">Físico</option>
                  <option value="mental">Mental</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Descripción del campo de evaluación..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Activo
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 bg-white dark:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  disabled={!formData.name.trim()}
                >
                  Guardar
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
        <div className="flex items-center space-x-3">
          <Link to="/coach/evaluations" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Campos de Evaluación</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Personaliza los campos que utilizas para evaluar a tus estudiantes</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Campo
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCategory === 'all' ? 'bg-gray-800 text-white dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedCategory('technical')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCategory === 'technical' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
            }`}
          >
            Técnicos
          </button>
          <button
            onClick={() => setSelectedCategory('physical')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCategory === 'physical' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50'
            }`}
          >
            Físicos
          </button>
          <button
            onClick={() => setSelectedCategory('mental')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCategory === 'mental' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50'
            }`}
          >
            Mentales
          </button>
        </div>
      </div>
      
      {/* Fields List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {filteredFields.map((field) => (
              <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{field.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(field.category)}`}>
                    {getCategoryName(field.category)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
                    {field.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(field.id)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      field.active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}
                  >
                    {field.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingField(field)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredFields.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay campos de evaluación para esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-2">Información</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>Los campos predeterminados no pueden eliminarse, pero se pueden desactivar</li>
          <li>Solo los campos activos aparecerán en los formularios de evaluación</li>
          <li>Recomendación: Mantén un número equilibrado de campos por categoría</li>
        </ul>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <FieldFormModal
            onSave={handleAddField}
            onCancel={() => setShowAddModal(false)}
          />
        )}
        
        {editingField && (
          <FieldFormModal
            field={editingField}
            onSave={handleUpdateField}
            onCancel={() => setEditingField(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvaluationFields;