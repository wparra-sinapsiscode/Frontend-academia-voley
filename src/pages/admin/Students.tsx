import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { addNewStudent } from '../../data/mockData';
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
  FiX,
  FiKey,
  FiCheckCircle,
  FiCheck,
  FiCopy,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

const Students: React.FC = () => {
  const { students, categories, users, addStudent, updateStudent, deleteStudent, coaches: contextCoaches, addUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar solo usuarios con rol de coach
  const coaches = users.filter(user => user.role === 'coach');
  
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showViewCredentialsModal, setShowViewCredentialsModal] = useState(false);
  const [selectedStudentCredentials, setSelectedStudentCredentials] = useState({
    studentName: '',
    studentEmail: '',
    studentPassword: '',
    parentName: '',
    parentEmail: '',
    parentPassword: ''
  });
  const [generatedCredentials, setGeneratedCredentials] = useState({
    studentEmail: '',
    studentPassword: '',
    parentEmail: '',
    parentPassword: ''
  });
  
  // Estados para los modales de credenciales
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newParentCredentials, setNewParentCredentials] = useState<{name: string, email: string, password: string} | null>(null);
  const [selectedParentCredentials, setSelectedParentCredentials] = useState<{name: string, email: string, password: string} | null>(null);

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
    email: '',
    password: '',
    categoryId: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentPassword: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    address: '',
    birthDate: '',
    coachId: '',
    position: '',
    jerseyNumber: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      categoryId: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      parentPassword: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalInfo: '',
      address: '',
      birthDate: '',
      coachId: '',
      position: '',
      jerseyNumber: ''
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
  
  // Generate secure password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = 'Parent';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
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
  
  // Show credentials for existing parent
  const showParentCredentials = (student: any) => {
    console.log('Student data:', student);
    console.log('Looking for parent with ID:', student.parentId);
    
    // Buscar el usuario padre asociado al estudiante por parentId
    const parent = users.find(u => u.id === student.parentId && u.role === 'parent');
    console.log('Found parent:', parent);
    
    if (parent) {
      setSelectedParentCredentials({
        name: parent.name,
        email: parent.email,
        password: parent.password || 'No disponible'
      });
      setShowViewCredentialsModal(true);
    } else {
      // Si no encuentra por parentId, intentar por email
      const parentByEmail = users.find(u => u.email === student.parentEmail && u.role === 'parent');
      if (parentByEmail) {
        setSelectedParentCredentials({
          name: parentByEmail.name,
          email: parentByEmail.email,
          password: parentByEmail.password || 'No disponible'
        });
        setShowViewCredentialsModal(true);
      } else {
        alert('No se encontraron las credenciales del padre/madre');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    if (!selectedCategory) return;

    if (editingStudent) {
      // Solo actualizar, no crear nuevos usuarios
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
      updateStudent(editingStudent.id, studentData);
      setEditingStudent(null);
    } else {
      // Generar IDs únicos basados en el próximo número disponible
      const nextStudentNumber = Math.max(...students.map(s => {
        const match = s.id.match(/student(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }), ...users.filter(u => u.role === 'student').map(u => {
        const match = u.id.match(/student(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })) + 1;
      
      const nextParentNumber = Math.max(...users.filter(u => u.role === 'parent').map(u => {
        const match = u.id.match(/parent(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })) + 1;
      
      const studentId = `student${nextStudentNumber}`;
      const parentId = `parent${nextParentNumber}`;
      
      // Generar credenciales automáticas para el padre
      const parentEmail = formData.parentEmail;
      const parentPassword = generatePassword();
      
      // Generar credenciales automáticas para el estudiante
      const studentEmail = formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@email.com`;
      const studentPassword = `Student${Math.random().toString(36).substring(2, 10)}`;
      
      // Crear el objeto student siguiendo la estructura de mockData
      const studentData = {
        id: studentId,
        userId: studentId, // Los estudiantes en mockData tienen userId
        parentId: parentId, // Apunta al ID del padre
        categoryId: formData.categoryId,
        dateOfBirth: new Date(formData.birthDate), // En mockData se llama dateOfBirth
        medicalInfo: formData.medicalInfo || 'Sin condiciones médicas',
        enrollmentDate: new Date(),
        active: true,
        // Datos adicionales para compatibilidad con el sistema
        name: formData.name,
        age: calculateAge(formData.birthDate),
        category: selectedCategory,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone || '',
        parentEmail: parentEmail,
        emergencyContact: formData.emergencyContact || formData.parentName,
        emergencyPhone: formData.emergencyPhone || formData.parentPhone || '',
        address: formData.address,
        birthDate: new Date(formData.birthDate),
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
      
      // Crear usuario estudiante
      const studentUser = {
        id: studentId,
        email: studentEmail,
        password: studentPassword,
        name: formData.name,
        role: 'student' as const,
        profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
        active: true,
        createdAt: new Date(),
        lastLogin: undefined
      };
      
      // Crear usuario padre con todos los campos necesarios
      const parentUser = {
        id: parentId,
        email: parentEmail,
        password: parentPassword,
        name: formData.parentName,
        role: 'parent' as const,
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        active: true,
        createdAt: new Date(),
        lastLogin: undefined
      };
      
      // Agregar todos al contexto
      addStudent(studentData);
      addUser(studentUser);
      addUser(parentUser);
      
      // Guardar credenciales para mostrar en modal de éxito
      setGeneratedCredentials({
        studentEmail: studentEmail,
        studentPassword: studentPassword,
        parentEmail: parentEmail,
        parentPassword: parentPassword
      });
      setNewParentCredentials({
        name: formData.parentName,
        email: parentEmail,
        password: parentPassword
      });
      setShowSuccessModal(true);
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleViewCredentials = (student: any) => {
    // Buscar el registro del estudiante en mockStudents para obtener las relaciones correctas
    const studentRecord = students.find(s => s.id === student.id);
    
    if (studentRecord) {
      // Buscar credenciales usando los IDs correctos
      const studentUser = users.find(u => u.id === studentRecord.userId || u.id === studentRecord.id);
      const parentUser = users.find(u => u.id === studentRecord.parentId);
      
      setSelectedStudentCredentials({
        studentName: student.name,
        studentEmail: studentUser?.email || 'No disponible',
        studentPassword: studentUser?.password || 'No disponible',
        parentName: parentUser?.name || student.parentName,
        parentEmail: parentUser?.email || 'No disponible',
        parentPassword: parentUser?.password || 'No disponible'
      });
    } else {
      // Fallback para estudiantes que no están en el registro
      setSelectedStudentCredentials({
        studentName: student.name,
        studentEmail: 'No disponible',
        studentPassword: 'No disponible',
        parentName: student.parentName || 'No disponible',
        parentEmail: 'No disponible',
        parentPassword: 'No disponible'
      });
    }
    
    setShowViewCredentialsModal(true);
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: '',
      password: '',
      categoryId: student.category.id,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      parentPassword: '',
      emergencyContact: student.emergencyContact,
      emergencyPhone: student.emergencyPhone,
      medicalInfo: student.medicalInfo,
      address: student.address,
      birthDate: student.birthDate.toISOString().split('T')[0],
      coachId: student.coachId || '',
      position: '',
      jerseyNumber: ''
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
      paid: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
      pending: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
      overdue: 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
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
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Nueva Estudiante
          </button>
          <button 
            onClick={exportStudents}
            className="bg-accent hover:bg-accent/90 text-primary font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
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
            <div className="p-3 rounded-full bg-primary/10">
              <FiUsers className="w-6 h-6 text-primary" />
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
              <p className="text-2xl font-bold text-[var(--color-success)]">8</p>
            </div>
            <div className="p-3 rounded-full bg-[var(--color-success)]/10">
              <FiPlus className="w-6 h-6 text-[var(--color-success)]" />
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
              <p className="text-2xl font-bold text-primary">
                {students.filter(s => s.paymentStatus === 'paid').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <FiUser className="w-6 h-6 text-primary" />
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
              <p className="text-2xl font-bold text-[var(--color-error)]">
                {students.filter(s => s.paymentStatus !== 'paid').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-[var(--color-error)]/10">
              <FiCalendar className="w-6 h-6 text-[var(--color-error)]" />
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
              className="input-field bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] placeholder-gray-400 dark:placeholder-gray-500 focus:ring-accent focus:border-accent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-gray-400 dark:text-gray-300" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field w-auto bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] focus:ring-accent focus:border-accent"
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
                      <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        {student.category?.name || 'Sin categoría'}
                      </span>
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
                          onClick={() => showParentCredentials(student)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Ver credenciales"
                        >
                          <FiKey className="w-4 h-4" />
                        </button>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
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
                      className="input-field"
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
                      className="input-field"
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
                          coachId: selectedCategory?.coachId || formData.coachId
                        });
                      }}
                      className="input-field"
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
                      className="input-field"
                    >
                      <option value="">Sin asignar</option>
                      {coaches.map(coach => (
                        <option key={coach.id} value={coach.id}>
                          {coach.name}
                        </option>
                      ))}
                    </select>
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
                      className="input-field"
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
                      className="input-field"
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
                      className="input-field"
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
                      className="input-field"
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
                      className="input-field"
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
                    className="input-field"
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
                    className="input-field"
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
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingStudent ? 'Actualizar' : 'Crear'} Estudiante
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Credenciales */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                ¡Estudiante agregado exitosamente!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aquí están las credenciales de acceso generadas:
              </p>
            </div>

            <div className="space-y-4">
              {/* Credenciales del Estudiante */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  📚 Credenciales del Estudiante
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 w-16">Email:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {generatedCredentials.studentEmail}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 w-16">Clave:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {generatedCredentials.studentPassword}
                    </span>
                  </div>
                </div>
              </div>

              {/* Credenciales del Padre */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
                  👨‍👩‍👧‍👦 Credenciales del Padre/Madre
                </h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 w-16">Email:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {generatedCredentials.parentEmail}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400 w-16">Clave:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {generatedCredentials.parentPassword}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
                ⚠️ Guarda estas credenciales y compártelas con la familia
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal para Ver Credenciales */}
      {showViewCredentialsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Credenciales de Acceso
              </h3>
              <button
                onClick={() => setShowViewCredentialsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center mb-4">
                <FiKey className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">
                  Credenciales para <span className="font-semibold">{selectedStudentCredentials.studentName}</span>
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email de acceso
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      type="text"
                      value={selectedStudentCredentials.parentEmail}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedStudentCredentials.parentEmail);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                    >
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contraseña
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      type="password"
                      value={selectedStudentCredentials.parentPassword}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedStudentCredentials.parentPassword);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                    >
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mt-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Mantenga estas credenciales seguras y compártalas solo con el padre/madre correspondiente.
              </p>
            </div>

            <button
              onClick={() => setShowViewCredentialsModal(false)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-4"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}

      {/* Success Modal for New Parent */}
      {showSuccessModal && newParentCredentials && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
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
                ✅ Estudiante registrado exitosamente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Se han creado las cuentas de acceso
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Credenciales del Estudiante */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                  📚 Credenciales del Estudiante
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedCredentials.studentEmail}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => copyText(generatedCredentials.studentEmail, 'email')}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
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
                          value={generatedCredentials.studentPassword}
                          readOnly
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm pr-10"
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
                        onClick={() => copyText(generatedCredentials.studentPassword, 'password')}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        {copiedPassword ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credenciales del Padre */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
                  👨‍👩‍👧‍👦 Credenciales del Padre/Madre
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generatedCredentials.parentEmail}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => copyText(generatedCredentials.parentEmail, 'email')}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
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
                          value={generatedCredentials.parentPassword}
                          readOnly
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm pr-10"
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
                        onClick={() => copyText(generatedCredentials.parentPassword, 'password')}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                      >
                        {copiedPassword ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 El padre/madre deberá cambiar esta contraseña en su primer inicio de sesión.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const subject = encodeURIComponent('Credenciales de acceso - Academia de Voleibol');
                  const body = encodeURIComponent(
                    `Estimado/a padre/madre de familia,\n\n` +
                    `Le damos la bienvenida a la Academia de Voleibol.\n\n` +
                    `CREDENCIALES DEL ESTUDIANTE:\n` +
                    `Email: ${generatedCredentials.studentEmail}\n` +
                    `Contraseña: ${generatedCredentials.studentPassword}\n\n` +
                    `CREDENCIALES DEL PADRE/MADRE:\n` +
                    `Email: ${generatedCredentials.parentEmail}\n` +
                    `Contraseña temporal: ${generatedCredentials.parentPassword}\n\n` +
                    `IMPORTANTE:\n` +
                    `- Ambas cuentas pueden acceder al sistema\n` +
                    `- La cuenta del estudiante accede al dashboard estudiantil\n` +
                    `- La cuenta del padre/madre accede al dashboard parental\n` +
                    `- Por favor, cambien las contraseñas en su primer inicio de sesión\n\n` +
                    `Saludos cordiales,\nAcademia de Voleibol`
                  );
                  window.open(`mailto:${generatedCredentials.parentEmail}?subject=${subject}&body=${body}`, '_blank');
                }}
                className="flex-1 bg-accent hover:bg-accent/90 text-primary font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <FiMail className="w-4 h-4 mr-2" />
                Enviar por email
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setNewParentCredentials(null);
                  setCopiedEmail(false);
                  setCopiedPassword(false);
                  setShowPassword(false);
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Credentials Modal for Existing Parent */}
      {showViewCredentialsModal && selectedParentCredentials && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
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
                  setShowViewCredentialsModal(false);
                  setSelectedParentCredentials(null);
                  setCopiedEmail(false);
                  setCopiedPassword(false);
                  setShowPassword(false);
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
                  Credenciales para <span className="font-semibold">{selectedParentCredentials.name}</span>
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
                      value={selectedParentCredentials.email}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyText(selectedParentCredentials.email, 'email')}
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
                        value={selectedParentCredentials.password}
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
                      onClick={() => copyText(selectedParentCredentials.password, 'password')}
                      className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                    >
                      {copiedPassword ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mt-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Mantenga estas credenciales seguras y compártalas solo con el padre/madre correspondiente.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowViewCredentialsModal(false);
                  setSelectedParentCredentials(null);
                  setCopiedEmail(false);
                  setCopiedPassword(false);
                  setShowPassword(false);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Students;