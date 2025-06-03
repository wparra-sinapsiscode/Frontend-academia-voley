import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { useAppContext } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

const ExpenseSettings: React.FC = () => {
  const { expenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      addExpenseCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
        active: true
      });
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowAddForm(false);
    }
  };

  const startEditing = (category: ExpenseCategory) => {
    setEditingId(category.id);
    setEditedName(category.name);
    setEditedDescription(category.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedName('');
    setEditedDescription('');
  };

  const saveEditing = (id: string) => {
    if (editedName.trim()) {
      updateExpenseCategory(id, {
        name: editedName.trim(),
        description: editedDescription.trim() || undefined
      });
      cancelEditing();
    }
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateExpenseCategory(id, { active: !currentStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría de gasto? Esta acción no se puede deshacer.')) {
      deleteExpenseCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link to="/admin/finance-settings" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración de Categorías de Gasto</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona las categorías de gasto disponibles en la academia</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <FiPlus size={16} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Añadir Nueva Categoría de Gasto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej. Transporte"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (opcional)</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej. Gastos de transporte para torneos y eventos"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={!newCategoryName.trim()}
                className={`px-4 py-2 rounded-lg ${
                  !newCategoryName.trim() ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre
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
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {expenseCategories.map((category) => (
              <motion.tr key={category.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">{category.description || '-'}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleActive(category.id, category.active)}
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {category.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === category.id ? (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => saveEditing(category.id)} className="text-green-600 hover:text-green-900">
                        <FiCheck size={16} />
                      </button>
                      <button onClick={cancelEditing} className="text-red-600 hover:text-red-900">
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => startEditing(category)} className="text-blue-600 hover:text-blue-900">
                        <FiEdit size={16} />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
            {expenseCategories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay categorías de gasto configuradas. Haga clic en "Nueva Categoría" para añadir una.
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
          <li>Las categorías activas aparecerán en el formulario de nuevo gasto</li>
          <li>Desactivar una categoría no afectará a los gastos existentes con esa categoría</li>
          <li>Eliminar una categoría es permanente y puede afectar a los informes históricos</li>
        </ul>
      </div>
    </div>
  );
};

export default ExpenseSettings;