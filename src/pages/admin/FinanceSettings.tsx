import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiDollarSign, FiShoppingBag, FiSettings } from 'react-icons/fi';

const FinanceSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link to="/admin/finances" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración Financiera</h1>
          <p className="text-gray-600 dark:text-gray-400">Administre las opciones de configuración financiera de la academia</p>
        </div>
      </div>

      {/* Settings Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Types Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <Link to="/admin/finance-settings/payment-types" className="block">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiDollarSign className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tipos de Pago</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure los tipos de pago que puede recibir la academia</p>
                </div>
              </div>
              <FiSettings className="text-gray-400 dark:text-gray-500" size={20} />
            </div>
          </Link>
        </motion.div>

        {/* Expense Categories Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <Link to="/admin/finance-settings/expense-categories" className="block">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <FiShoppingBag className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categorías de Gastos</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure las categorías para clasificar los gastos</p>
                </div>
              </div>
              <FiSettings className="text-gray-400 dark:text-gray-500" size={20} />
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-2">Información</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>Los cambios en tipos de pago o categorías no afectarán a registros existentes</li>
          <li>Puede desactivar opciones en lugar de eliminarlas para mantener el historial</li>
          <li>Las categorías y tipos inactivos no aparecerán en los formularios de ingreso</li>
        </ul>
      </div>
    </div>
  );
};

export default FinanceSettings;