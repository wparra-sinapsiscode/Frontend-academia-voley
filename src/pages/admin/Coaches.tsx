import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit3, 
  FiTrash2, 
  FiMail, 
  FiPhone,
  FiUsers,
  FiAward,
  FiCalendar,
  FiX,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
  FiKey,
  FiCheckCircle
} from 'react-icons/fi';

const Coaches: React.FC = () => {
  const { coaches, categories, students, addCoach, updateCoach, deleteCoach, addUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedCoachCredentials, setSelectedCoachCredentials] = useState<{email: string, password: string, name: string} | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newCoachCredentials, setNewCoachCredentials] = useState<{name: string, email: string, password: string} | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  // Mapeo de credenciales para coaches existentes
  const coachCredentials: Record<string, string> = {
    'sofia.martinez@academiavoley.pe': 'coach123',
    'juan@academia.com': 'coach456',
    'carlos@academia.com': 'coach789'
  };

  // Filter coaches
  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = (coach.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (coach.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(coach.specialization) && coach.specialization.some(s => (s?.toLowerCase() || '').includes(searchTerm.toLowerCase())));
    return matchesSearch;
  });

  // New coach form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    specialization: [] as string[],
    experience: 0,
    certifications: '',
    assignedCategories: [] as string[],
    hireDate: new Date().toISOString().split('T')[0],
    avatar: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      specialization: [],
      experience: 0,
      certifications: '',
      assignedCategories: [],
      hireDate: new Date().toISOString().split('T')[0],
      avatar: ''
    });
    setGeneratedPassword('');
    setShowPassword(false);
    setCopiedPassword(false);
  };

  // Generate secure password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = 'Coach';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    return password;
  };

  // Copy password to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };
  
  // Show credentials for existing coach
  const showCoachCredentials = (coach: any) => {
    const password = coachCredentials[coach.email] || 'No disponible';
    setSelectedCoachCredentials({
      email: coach.email,
      password: password,
      name: coach.name
    });
    setShowCredentialsModal(true);
  };
  
  // Copy text to clipboard
  const copyText = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const password = generatedPassword || generatePassword();
    
    // Create coach data
    const coachData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialization: formData.specialization,
      experience: formData.experience,
      certifications: formData.certifications.split(',').map(cert => cert.trim()).filter(cert => cert),
      hireDate: new Date(formData.hireDate),
      avatar: formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=87CEEB&color=fff`,
      assignedCategories: formData.assignedCategories
    };

    if (editingCoach) {
      updateCoach(editingCoach.id, coachData);
      setEditingCoach(null);
    } else {
      // Create coach
      const newCoachId = `coach_${Date.now()}`;
      addCoach({ ...coachData, id: newCoachId });
      
      // Create user account for the coach
      const userData = {
        id: `user_${Date.now()}`,
        email: formData.email,
        password: password,
        name: formData.name,
        role: 'coach' as const,
        avatar: coachData.avatar,
        phone: formData.phone,
        createdAt: new Date(),
        lastLogin: undefined
      };
      addUser(userData);
      
      // Show success modal with credentials
      setNewCoachCredentials({
        name: formData.name,
        email: formData.email,
        password: password
      });
      setShowSuccessModal(true);
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (coach: any) => {
    setEditingCoach(coach);
    setFormData({
      name: coach.name,
      email: coach.email,
      phone: coach.phone,
      birthDate: '',
      address: '',
      specialization: Array.isArray(coach.specialization) ? coach.specialization : [],
      experience: coach.experience || 0,
      certifications: (Array.isArray(coach.certifications) ? coach.certifications : []).join(', '),
      assignedCategories: Array.isArray(coach.assignedCategories) ? coach.assignedCategories : [],
      hireDate: coach.hireDate ? new Date(coach.hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      avatar: coach.avatar || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (coachId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este entrenador? Esta acción también eliminará su cuenta de usuario.')) {
      deleteCoach(coachId);
    }
  };

  const handleSpecializationChange = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedCategories: prev.assignedCategories.includes(categoryId)
        ? prev.assignedCategories.filter(c => c !== categoryId)
        : [...prev.assignedCategories, categoryId]
    }));
  };

  // Get students count for each coach
  const getStudentsCount = (coachId: string) => {
    return students.filter(student => student.coachId === coachId).length;
  };

  const specializationOptions = [
    'Técnica',
    'Preparación Física',
    'Táctica',
    'Psicología Deportiva',
    'Nutrición',
    'Análisis de Video'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Entrenadores</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra el equipo de entrenadores</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Nuevo Entrenador
        </button>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entrenadores</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{coaches.length}</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio Experiencia</p>
              <p className="text-2xl font-bold text-green-600">
                {coaches.length > 0 
                  ? Math.round(coaches.reduce((sum, c) => sum + (c.experience || 0), 0) / coaches.length)
                  : 0} años
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FiAward className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorías Cubiertas</p>
              <p className="text-2xl font-bold text-purple-600">
                {categories.filter(cat => coaches.some(coach => Array.isArray(coach.assignedCategories) && coach.assignedCategories.includes(cat.id))).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <FiCalendar className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estudiantes/Coach</p>
              <p className="text-2xl font-bold text-orange-600">
                {coaches.length > 0 
                  ? Math.round(students.length / coaches.length)
                  : 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <FiUsers className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o especialización..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Coaches Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entrenador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Especialización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Experiencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estudiantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categorías
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCoaches.map((coach) => (
                <tr key={coach.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={coach.avatar || `https://ui-avatars.com/api/?name=${coach.name}&background=87CEEB&color=fff`}
                        alt={coach.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{coach.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{coach.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(coach.specialization) ? coach.specialization : []).map((spec, index) => (
                        <span key={index} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {coach.experience} años
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {getStudentsCount(coach.id)} estudiantes
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(coach.assignedCategories) ? coach.assignedCategories : []).map(catId => {
                        const category = categories.find(c => c.id === catId);
                        return category ? (
                          <span key={catId} className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {category.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showCoachCredentials(coach)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Ver credenciales"
                      >
                        <FiKey className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(coach)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const subject = encodeURIComponent(`Mensaje de Academia de Voleibol`);
                          const body = encodeURIComponent(`Estimado/a ${coach.name},\n\nEsperamos que se encuentre bien. Nos comunicamos con usted para...\n\nSaludos cordiales,\nAcademia de Voleibol`);
                          window.open(`mailto:${coach.email}?subject=${subject}&body=${body}`, '_blank');
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Enviar email"
                      >
                        <FiMail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`tel:${coach.phone}`)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <FiPhone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coach.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Coach Modal */}
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
                  {editingCoach ? 'Editar Entrenador' : 'Nuevo Entrenador'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCoach(null);
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
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={editingCoach}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    />
                    {!editingCoach && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Este email será usado para el login
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Años de experiencia *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de contratación *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.hireDate}
                      onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL de foto de perfil
                    </label>
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Certificaciones
                  </label>
                  <textarea
                    rows={2}
                    value={formData.certifications}
                    onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Certificación 1, Certificación 2, ..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Separe las certificaciones con comas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especialización *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {specializationOptions.map(spec => (
                      <label key={spec} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.specialization.includes(spec)}
                          onChange={() => handleSpecializationChange(spec)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categorías asignadas *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(category => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.assignedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {!editingCoach && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Credenciales de acceso
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Se generará automáticamente una contraseña temporal para el entrenador.
                      </p>
                      {generatedPassword && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={generatedPassword}
                              readOnly
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-600 rounded-lg text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600"
                            >
                              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={copyToClipboard}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                          >
                            {copiedPassword ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {generatedPassword ? 'Generar nueva contraseña' : 'Generar contraseña'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCoach(null);
                      resetForm();
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingCoach ? 'Actualizar' : 'Crear'} Entrenador
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && selectedCoachCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Credenciales de Acceso
              </h3>
              <button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setSelectedCoachCredentials(null);
                  setCopiedEmail(false);
                  setCopiedPassword(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-4">
                <FiKey className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  Credenciales para <span className="font-semibold">{selectedCoachCredentials.name}</span>
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email de acceso
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={selectedCoachCredentials.email}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyText(selectedCoachCredentials.email, 'email')}
                      className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                    >
                      {copiedEmail ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={selectedCoachCredentials.password}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => copyText(selectedCoachCredentials.password, 'password')}
                      className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                    >
                      {copiedPassword ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mt-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Mantenga estas credenciales seguras y compártalas solo con el entrenador correspondiente.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setSelectedCoachCredentials(null);
                  setCopiedEmail(false);
                  setCopiedPassword(false);
                }}
                className="w-full btn-primary"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Modal for New Coach */}
      {showSuccessModal && newCoachCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                ✅ Entrenador creado exitosamente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Se ha creado la cuenta para <span className="font-semibold">{newCoachCredentials.name}</span>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email de acceso
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCoachCredentials.email}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => copyText(newCoachCredentials.email, 'email')}
                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                  >
                    {copiedEmail ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña temporal
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newCoachCredentials.password}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => copyText(newCoachCredentials.password, 'password')}
                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                  >
                    {copiedPassword ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 El entrenador deberá cambiar esta contraseña en su primer inicio de sesión.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const subject = encodeURIComponent('Credenciales de acceso - Academia de Voleibol');
                  const body = encodeURIComponent(
                    `Estimado/a ${newCoachCredentials.name},\n\n` +
                    `Le damos la bienvenida a la Academia de Voleibol. Sus credenciales de acceso son:\n\n` +
                    `Email: ${newCoachCredentials.email}\n` +
                    `Contraseña temporal: ${newCoachCredentials.password}\n\n` +
                    `Por favor, cambie su contraseña en su primer inicio de sesión.\n\n` +
                    `Saludos cordiales,\nAcademia de Voleibol`
                  );
                  window.open(`mailto:${newCoachCredentials.email}?subject=${subject}&body=${body}`, '_blank');
                }}
                className="flex-1 btn-secondary flex items-center justify-center"
              >
                <FiMail className="w-4 h-4 mr-2" />
                Enviar por email
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setNewCoachCredentials(null);
                  setCopiedEmail(false);
                  setCopiedPassword(false);
                  setShowPassword(false);
                }}
                className="flex-1 btn-primary"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Coaches;