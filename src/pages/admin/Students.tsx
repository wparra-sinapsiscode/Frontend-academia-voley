import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiUsers, 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiDownload,
  FiEdit3,
  FiTrash2,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiX
} from 'react-icons/fi';

const Students: React.FC = () => {
  const { students, categories, coaches, addStudent, updateStudent, deleteStudent } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (student.parentName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || student.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // New student form data
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    address: '',
    birthDate: '',
    coachId: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalInfo: '',
      address: '',
      birthDate: '',
      coachId: ''
    });
  };
  
  // Calculate age from birthdate
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    if (!selectedCategory) return;

    const studentData = {
      name: formData.name,
      age: calculateAge(formData.birthDate),
      category: selectedCategory,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
      medicalInfo: formData.medicalInfo,
      address: formData.address,
      birthDate: new Date(formData.birthDate),
      enrollmentDate: new Date(),
      coachId: formData.coachId || undefined,
      achievements: [],
      stats: {
        attendanceRate: 100,
        skillLevel: 5.0,
        improvement: 0,
        totalSessions: 0,
        averagePerformance: 5.0
      },
      paymentStatus: 'pending' as const
    };

    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
      setEditingStudent(null);
    } else {
      addStudent(studentData);
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      categoryId: student.category.id,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      emergencyContact: student.emergencyContact,
      emergencyPhone: student.emergencyPhone,
      medicalInfo: student.medicalInfo,
      address: student.address,
      birthDate: student.birthDate.toISOString().split('T')[0],
      coachId: student.coachId || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (studentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta estudiante?')) {
      deleteStudent(studentId);
    }
  };

  const exportStudents = () => {
    const csvContent = [
      // Headers
      ['Nombre', 'Edad', 'Categoría', 'Padre/Madre', 'Teléfono Padre', 'Email Padre', 'Contacto Emergencia', 'Teléfono Emergencia', 'Información Médica', 'Dirección', 'Fecha Nacimiento', 'Fecha Inscripción', 'Estado Pago'],
      // Data rows
      ...filteredStudents.map(student => [
        student.name,
        student.age.toString(),
        student.category.name,
        student.parentName,
        student.parentPhone,
        student.parentEmail,
        student.emergencyContact,
        student.emergencyPhone,
        student.medicalInfo || 'N/A',
        student.address,
        student.birthDate.toISOString().split('T')[0],
        student.enrollmentDate.toISOString().split('T')[0],
        student.paymentStatus === 'paid' ? 'Al día' : student.paymentStatus === 'pending' ? 'Pendiente' : 'Vencido'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      paid: 'Al día',
      pending: 'Pendiente',
      overdue: 'Vencido'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Estudiantes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra la información de las estudiantes</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Nueva Estudiante
          </button>
          <button 
            onClick={exportStudents}
            className="btn-secondary flex items-center"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Estudiantes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{students.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FiUsers className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nuevas este mes</p>
              <p className="text-2xl font-bold text-green-600">8</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FiPlus className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagos al día</p>
              <p className="text-2xl font-bold text-blue-600">
                {students.filter(s => s.paymentStatus === 'paid').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagos pendientes</p>
              <p className="text-2xl font-bold text-red-600">
                {students.filter(s => s.paymentStatus !== 'paid').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <FiCalendar className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <FiSearch className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              placeholder="Buscar por nombre de estudiante o padre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Padre/Madre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entrenador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => {
                const coach = coaches.find(c => c.id === student.coachId);
                return (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={student.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{student.age} años</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {student.category?.name || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{student.parentName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{student.parentPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(student.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {coach ? coach.name : 'No asignado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const subject = encodeURIComponent(`Mensaje sobre ${student.name} - Academia de Voleibol`);
                            const body = encodeURIComponent(`Estimado/a ${student.parentName},\n\nEsperamos que se encuentre bien. Nos comunicamos con usted para...\n\nSaludos cordiales,\nAcademia de Voleibol`);
                            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${student.parentEmail}&su=${subject}&body=${body}`;
                            window.open(gmailUrl, '_blank');
                          }}
                          className="text-green-600 hover:text-green-900"
                          title={`Enviar mensaje a ${student.parentName}`}
                        >
                          <FiMail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`tel:${student.parentPhone}`)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <FiPhone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingStudent ? 'Editar Estudiante' : 'Nueva Estudiante'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de nacimiento *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    {formData.birthDate && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Edad: {calculateAge(formData.birthDate)} años
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría *
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => {
                        const selectedCategoryId = e.target.value;
                        const selectedCategory = categories.find(c => c.id === selectedCategoryId);
                        setFormData({
                          ...formData, 
                          categoryId: selectedCategoryId,
                          // Auto-sugerir el coach si la categoría tiene uno asignado
                          coachId: selectedCategory?.coachId || formData.coachId
                        });
                      }}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.ageRange.min}-{category.ageRange.max} años)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Entrenador
                    </label>
                    <select
                      value={formData.coachId}
                      onChange={(e) => setFormData({...formData, coachId: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                      <option value="">Sin asignar</option>
                      {coaches.map(coach => {
                        const selectedCategory = categories.find(c => c.id === formData.categoryId);
                        const isRecommended = selectedCategory?.coachId === coach.id;
                        return (
                          <option key={coach.id} value={coach.id}>
                            {coach.name} {isRecommended && '(Recomendado)'}
                          </option>
                        );
                      })}
                    </select>
                    {formData.categoryId && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {categories.find(c => c.id === formData.categoryId)?.coachId 
                          ? 'El coach fue sugerido según la categoría seleccionada'
                          : 'Esta categoría no tiene un coach predeterminado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre del padre/madre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono del padre/madre *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email del padre/madre *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contacto de emergencia
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono de emergencia
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Información médica
                  </label>
                  <textarea
                    rows={3}
                    value={formData.medicalInfo}
                    onChange={(e) => setFormData({...formData, medicalInfo: e.target.value})}
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                    placeholder="Alergias, condiciones médicas, medicamentos..."
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingStudent(null);
                      resetForm();
                    }}
                    className="bg-gray-600 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex-1"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex-1">
                    {editingStudent ? 'Actualizar' : 'Crear'} Estudiante
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

export default Students;