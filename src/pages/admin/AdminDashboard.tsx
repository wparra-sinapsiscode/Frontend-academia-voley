import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiUsers, 
  FiDollarSign, 
  FiAward, 
  FiTrendingUp, 
  FiUserCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { students, payments, tournaments, announcements, attendances, darkMode } = useAppContext();

  // Calculate statistics
  const totalStudents = students.length;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue').length;
  const activeTournaments = tournaments.filter(t => t.status === 'active').length;
  const attendanceRate = Math.round((attendances.filter(a => a.present).length / attendances.length) * 100) || 0;

  // Tooltip styles for dark mode
  const tooltipStyle = {
    backgroundColor: darkMode ? '#374151' : 'white',
    border: `1px solid ${darkMode ? '#4B5563' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: darkMode ? '#F9FAFB' : '#111827'
  };

  // Sample data for charts
  const monthlyRevenue = [
    { month: 'Jul', revenue: 4500 },
    { month: 'Ago', revenue: 4800 },
    { month: 'Sep', revenue: 5200 },
    { month: 'Oct', revenue: 5100 },
    { month: 'Nov', revenue: 5400 },
    { month: 'Dic', revenue: 5800 }
  ];

  const categoryDistribution = [
    { name: 'Sub-12', value: 12, color: '#87CEEB' },
    { name: 'Sub-14', value: 10, color: '#5DADE2' },
    { name: 'Sub-16', value: 8, color: '#3B82F6' },
    { name: 'Sub-18', value: 0, color: '#1E3A8A' }
  ];

  const attendanceData = [
    { day: 'Lun', asistencia: 92 },
    { day: 'Mar', asistencia: 88 },
    { day: 'Mie', asistencia: 94 },
    { day: 'Jue', asistencia: 86 },
    { day: 'Vie', asistencia: 90 },
    { day: 'Sab', asistencia: 85 }
  ];

  const statsCards = [
    {
      title: 'Total Estudiantes',
      value: totalStudents.toString(),
      icon: FiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+5%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Ingresos Mensuales',
      value: `S/ ${totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Pagos Pendientes',
      value: pendingPayments.toString(),
      icon: FiAlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: '-8%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Torneos Activos',
      value: activeTournaments.toString(),
      icon: FiAward,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+2',
      changeColor: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard Administrativo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Resumen general de la academia</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-xl dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${stat.changeColor}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ingresos Mensuales</h3>
            <FiTrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#87CEEB" 
                strokeWidth={3}
                dot={{ fill: '#87CEEB', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Distribución por Categoría</h3>
            <FiUsers className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Attendance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Asistencia Semanal</h3>
          <div className="flex items-center gap-2">
            <FiUserCheck className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Promedio: {attendanceRate}%</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar 
              dataKey="asistencia" 
              fill="#87CEEB"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Activity & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Estudiantes Recientes</h3>
          <div className="space-y-4">
            {students
              .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
              .slice(0, 5)
              .map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <img
                  src={student.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  student.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {student.paymentStatus === 'paid' ? 'Al día' :
                   student.paymentStatus === 'pending' ? 'Pendiente' : 'Vencido'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Anuncios Recientes</h3>
          <div className="space-y-4">
            {announcements
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 4)
              .map((announcement) => (
              <div key={announcement.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{announcement.title}</h4>
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    announcement.priority === 'high' ? 'bg-red-500' :
                    announcement.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{announcement.content}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {announcement.createdAt.toLocaleDateString('es-ES')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;