import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { useAppContext } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';

interface PaymentType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

const PaymentSettings: React.FC = () => {
  const { paymentTypes, addPaymentType, updatePaymentType, deletePaymentType } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const handleAdd = () => {
    if (newTypeName.trim()) {
      addPaymentType({
        name: newTypeName.trim(),
        description: newTypeDescription.trim() || undefined,
        active: true
      });
      setNewTypeName('');
      setNewTypeDescription('');
      setShowAddForm(false);
    }
  };

  const startEditing = (paymentType: PaymentType) => {
    setEditingId(paymentType.id);
    setEditedName(paymentType.name);
    setEditedDescription(paymentType.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedName('');
    setEditedDescription('');
  };

  const saveEditing = (id: string) => {
    if (editedName.trim()) {
      updatePaymentType(id, {
        name: editedName.trim(),
        description: editedDescription.trim() || undefined
      });
      cancelEditing();
    }
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updatePaymentType(id, { active: !currentStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tipo de pago? Esta acción no se puede deshacer.')) {
      deletePaymentType(id);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración de Tipos de Pago</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona los tipos de pago disponibles en la academia</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiPlus size={16} />
          <span>Nuevo Tipo</span>
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
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Añadir Nuevo Tipo de Pago</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-3 py-2 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="Ej. Uniforme"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (opcional)</label>
                <textarea
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej. Pago por uniforme de la academia"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTypeName('');
                  setNewTypeDescription('');
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={!newTypeName.trim()}
                className={`px-4 py-2 rounded-lg ${
                  !newTypeName.trim() ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
                } text-white transition-colors`}
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Types List */}
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
            {paymentTypes.map((type) => (
              <motion.tr key={type.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === type.id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-2 py-1 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === type.id ? (
                    <input
                      type="text"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">{type.description || '-'}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleActive(type.id, type.active)}
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      type.active ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                    }`}
                  >
                    {type.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === type.id ? (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => saveEditing(type.id)} className="text-green-600 hover:text-green-900">
                        <FiCheck size={16} />
                      </button>
                      <button onClick={cancelEditing} className="text-red-600 hover:text-red-900">
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => startEditing(type)} className="text-blue-600 hover:text-blue-900">
                        <FiEdit size={16} />
                      </button>
                      <button onClick={() => handleDelete(type.id)} className="text-red-600 hover:text-red-900">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
            {paymentTypes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay tipos de pago configurados. Haga clic en "Nuevo Tipo" para añadir uno.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info Card */}
      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <h3 className="text-md font-semibold text-primary mb-2">Información</h3>
        <ul className="list-disc list-inside text-sm text-primary/80 space-y-1">
          <li>Los tipos de pago activos aparecerán en el formulario de nuevo pago</li>
          <li>Desactivar un tipo no afectará a los pagos existentes con ese tipo</li>
          <li>Eliminar un tipo es permanente y puede afectar a los informes históricos</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentSettings;