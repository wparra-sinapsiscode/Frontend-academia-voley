import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiX,
  FiCheck,
  FiAward,
  FiBook,
  FiTarget,
  FiActivity,
  FiTrendingUp,
  FiZap,
  FiShield
} from 'react-icons/fi';


const CoachSpecializations: React.FC = () => {
  const { 
    darkMode, 
    coachSpecializations, 
    addCoachSpecialization, 
    updateCoachSpecialization, 
    deleteCoachSpecialization 
  } = useAppContext();

  const [showModal, setShowModal] = useState(false);
  const [editingSpec, setEditingSpec] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FiTarget',
    color: 'blue'
  });

  const iconOptions = [
    { value: 'FiTarget', label: 'Objetivo', Icon: FiTarget },
    { value: 'FiActivity', label: 'Actividad', Icon: FiActivity },
    { value: 'FiZap', label: 'Energía', Icon: FiZap },
    { value: 'FiTrendingUp', label: 'Tendencia', Icon: FiTrendingUp },
    { value: 'FiBook', label: 'Libro', Icon: FiBook },
    { value: 'FiAward', label: 'Premio', Icon: FiAward },
    { value: 'FiShield', label: 'Escudo', Icon: FiShield }
  ];

  const colorOptions = [
    { value: 'blue', label: 'Azul', className: 'bg-blue-100 text-blue-800' },
    { value: 'green', label: 'Verde', className: 'bg-green-100 text-green-800' },
    { value: 'purple', label: 'Morado', className: 'bg-purple-100 text-purple-800' },
    { value: 'pink', label: 'Rosa', className: 'bg-pink-100 text-pink-800' },
    { value: 'orange', label: 'Naranja', className: 'bg-orange-100 text-orange-800' },
    { value: 'red', label: 'Rojo', className: 'bg-red-100 text-red-800' },
    { value: 'yellow', label: 'Amarillo', className: 'bg-yellow-100 text-yellow-800' },
    { value: 'indigo', label: 'Índigo', className: 'bg-indigo-100 text-indigo-800' }
  ];

  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find(opt => opt.value === iconName);
    return option ? option.Icon : FiTarget;
  };

  const getColorClass = (color: string) => {
    const option = colorOptions.find(opt => opt.value === color);
    return option ? option.className : 'bg-gray-100 text-gray-800';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'FiTarget',
      color: 'blue'
    });
    setEditingSpec(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSpec) {
      // Editar especialización existente
      updateCoachSpecialization(editingSpec.id, formData);
    } else {
      // Crear nueva especialización
      addCoachSpecialization({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        active: true
      });
    }
    
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (spec: any) => {
    setEditingSpec(spec);
    setFormData({
      name: spec.name,
      description: spec.description,
      icon: spec.icon,
      color: spec.color
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta especialización?')) {
      deleteCoachSpecialization(id);
    }
  };

  const toggleActive = (id: string) => {
    const spec = coachSpecializations.find(s => s.id === id);
    if (spec) {
      updateCoachSpecialization(id, { active: !spec.active });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Especializaciones de Entrenadores
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las especializaciones disponibles para los entrenadores
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nueva Especialización
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Especializaciones
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {coachSpecializations.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FiAward className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Activas
              </p>
              <p className="text-2xl font-bold text-green-600">
                {coachSpecializations.filter(s => s.active).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FiCheck className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inactivas
              </p>
              <p className="text-2xl font-bold text-gray-600">
                {coachSpecializations.filter(s => !s.active).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <FiX className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Specializations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coachSpecializations.map((spec, index) => {
          const IconComponent = getIconComponent(spec.icon);
          return (
            <motion.div
              key={spec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card dark:bg-gray-800 dark:border-gray-700 ${
                !spec.active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getColorClass(spec.color)}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(spec.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      spec.active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={spec.active ? 'Desactivar' : 'Activar'}
                  >
                    {spec.active ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(spec)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Editar"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(spec.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Eliminar"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {spec.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {spec.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getColorClass(spec.color)}`}>
                  {spec.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingSpec ? 'Editar Especialización' : 'Nueva Especialización'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Ej: Técnica Avanzada"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Describe la especialización..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ícono
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {iconOptions.map(option => {
                      const IconComp = option.Icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData({...formData, icon: option.value})}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.icon === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComp className="w-5 h-5 mx-auto" />
                          <span className="text-xs mt-1 block">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({...formData, color: option.value})}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          option.className
                        } ${
                          formData.color === option.value
                            ? 'ring-2 ring-offset-2 ring-blue-500'
                            : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingSpec ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CoachSpecializations;