import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { Calendar, Clock, Users, Plus, Edit, Trash2, MapPin, Target, Package, FileText, Video, Download, Eye, Grid, List, Filter, UserCheck } from 'lucide-react';
import { mockClassPlans, mockCoaches } from '../../data/mockData';

interface Material {
  id: string;
  name: string;
  type: 'equipment' | 'document' | 'video' | 'link';
  description?: string;
  url?: string;
  required: boolean;
}

interface Class {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  maxStudents: number;
  enrolledStudents: string[];
  objectives: string[];
  materials: Material[];
  notes?: string;
  warmUpPlan?: string;
  mainActivityPlan?: string;
  coolDownPlan?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

const ClassManagement: React.FC = () => {
  try {
    const { categories, students, darkMode, classPlans, addClassPlan, updateClassPlan, deleteClassPlan, user } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [classToDelete, setClassToDelete] = useState<Class | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    
  // Convert classPlans to the Class interface format for display
  // Helper function to safely convert date
  const safeDate = (date: any): string => {
    try {
      if (!date) return new Date().toISOString().split('T')[0];
      
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = new Date();
      }
      
      if (isNaN(dateObj.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Función para obtener estudiantes por categoría
  const getStudentsByCategory = (categoryName: string): string[] => {
    // Buscar la categoría por nombre
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return [];
    
    // Filtrar estudiantes que pertenecen a esta categoría
    return students
      .filter(student => student.category?.id === category.id || (student as any).categoryId === category.id)
      .map(student => student.id);
  };

  // Función para obtener el límite máximo de estudiantes por categoría
  const getMaxStudentsByCategory = (categoryName: string): number => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.maxStudents || 20; // Default 20 si no se encuentra
  };

  // Filtrar mockClassPlans solo por las clases creadas por el coach actual
  const mockClasses = mockClassPlans.filter(classItem => classItem.coachId === user?.id).map((classItem, index) => {
    try {
      const categoryName = classItem.category || 'Sin categoría';
      const enrolledStudents = getStudentsByCategory(categoryName);
      const maxStudents = getMaxStudentsByCategory(categoryName);
      
      return {
        id: classItem.id || `class_${index}`,
        title: classItem.title || 'Sin título',
        category: categoryName,
        date: safeDate(classItem.date),
        time: classItem.startTime || '00:00',
        duration: classItem.duration || 60,
        location: classItem.location || 'Sin ubicación',
        maxStudents: maxStudents,
        enrolledStudents: enrolledStudents,
        objectives: classItem.objectives || [],
        materials: classItem.materials || [],
        notes: '',
        warmUpPlan: classItem.warmUpPlan?.exercises?.map(ex => `${ex.name} (${ex.duration} min): ${ex.description}`).join(' • ') || 'Sin plan de calentamiento',
        mainActivityPlan: classItem.mainActivityPlan?.exercises?.map(ex => `${ex.name} (${ex.duration} min): ${ex.description}`).join(' • ') || 'Sin actividad principal',
        coolDownPlan: classItem.coolDownPlan?.exercises?.map(ex => `${ex.name} (${ex.duration} min): ${ex.description}`).join(' • ') || 'Sin enfriamiento',
        status: 'scheduled' as const
      };
    } catch (error) {
      return null;
    }
  }).filter(Boolean);
  
  // Clases del contexto (para las creadas por el usuario) - solo las del coach actual
  const userClasses = (classPlans || []).filter(classItem => classItem.coachId === user?.id).map((classItem, index) => {
    try {
      const categoryName = classItem.category || 'Sin categoría';
      const enrolledStudents = getStudentsByCategory(categoryName);
      const maxStudents = getMaxStudentsByCategory(categoryName);
      
      return {
        id: classItem.id || `userclass_${index}`,
        title: classItem.title || 'Sin título',
        category: categoryName,
        date: safeDate(classItem.date),
        time: classItem.startTime || '00:00',
        duration: classItem.duration || 60,
        location: classItem.location || 'Sin ubicación',
        maxStudents: maxStudents,
        enrolledStudents: enrolledStudents,
        objectives: classItem.objectives || [],
        materials: classItem.materials || [],
        notes: '',
        warmUpPlan: classItem.warmUpPlan?.exercises?.map(ex => `${ex.name} (${ex.duration} min): ${ex.description}`).join(' • ') || '',
        mainActivityPlan: classItem.mainActivityPlan?.exercises?.map(ex => `${ex.name} (${ex.duration} min): ${ex.description}`).join(' • ') || '',
        coolDownPlan: classItem.coolDownPlan?.exercises?.map(ex => `${ex.name} (${ex.duration} min): ${ex.description}`).join(' • ') || '',
        status: 'scheduled' as const
      };
    } catch (error) {
      return null;
    }
  }).filter(Boolean);
  
  // Combinar mockClasses con userClasses (evitando duplicados)
  const userClassIds = new Set(userClasses.map(c => c.id));
  const uniqueMockClasses = mockClasses.filter(c => !userClassIds.has(c.id));
  const classes = [...uniqueMockClasses, ...userClasses];

  // 🔍 DEBUG: Log all classes in ClassManagement
  React.useEffect(() => {
    if (user?.id) {
      console.log('📚 GESTIÓN DE CLASES - COACH:', {
        coachName: user.name,
        coachId: user.id,
        totalClases: classes.length,
        clasesMock: uniqueMockClasses.length,
        clasesUsuario: userClasses.length,
        clasesCompletas: classes.map(clase => ({
          id: clase.id,
          titulo: clase.title,
          categoria: clase.category,
          fecha: clase.date,
          hora: clase.time,
          ubicacion: clase.location,
          objetivos: clase.objectives,
          materiales: clase.materials?.length || 0,
          tipo: uniqueMockClasses.includes(clase) ? 'MOCK' : 'USUARIO'
        }))
      });
      
      console.log('📚 CONTEXT classPlans en ClassManagement:', {
        totalEnContexto: classPlans?.length || 0,
        clasesDelCoach: (classPlans || []).filter(cp => cp.coachId === user.id).length,
        todasLasClasesDelContexto: (classPlans || []).map(cp => ({
          id: cp.id,
          titulo: cp.title,
          categoria: cp.category,
          coachId: cp.coachId,
          fecha: cp.date,
          esDelCoachActual: cp.coachId === user.id
        }))
      });
    }
  }, [classes, user?.id, classPlans]);
  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary/10 text-primary';
      case 'in-progress': return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled': return 'bg-[var(--color-error)]/10 text-[var(--color-error)]';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'equipment': return <Package size={16} className="text-primary" />;
      case 'document': return <FileText size={16} className="text-[var(--color-success)]" />;
      case 'video': return <Video size={16} className="text-accent" />;
      case 'link': return <Download size={16} className="text-[var(--color-warning)]" />;
      default: return <Package size={16} />;
    }
  };


  const handleCreateClass = (classData: Partial<Class>) => {
    if (!user?.id) return;
    
    // Convert Class format to ClassPlan format
    const classPlanData = {
      title: classData.title || '',
      category: classData.category || '',
      date: new Date(classData.date || ''),
      startTime: classData.time || '',
      endTime: calculateEndTime(classData.time || '', classData.duration || 60),
      duration: classData.duration || 60,
      location: classData.location || '',
      coachId: user.id,
      objectives: classData.objectives || [],
      materials: classData.materials || [],
      warmUpPlan: {
        exercises: parseExercises(classData.warmUpPlan || ''),
        totalDuration: calculateDuration(classData.warmUpPlan || '')
      },
      mainActivityPlan: {
        exercises: parseExercises(classData.mainActivityPlan || ''),
        totalDuration: calculateDuration(classData.mainActivityPlan || '')
      },
      coolDownPlan: {
        exercises: parseExercises(classData.coolDownPlan || ''),
        totalDuration: calculateDuration(classData.coolDownPlan || '')
      },
      createdAt: new Date()
    };
    
    console.log('✅ CREANDO NUEVA CLASE:', {
      coachId: user.id,
      coachName: user?.name,
      clasePlanData: classPlanData
    });
    
    addClassPlan(classPlanData);
    setShowCreateModal(false);
    
    // Mostrar mensaje de éxito
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleEditClass = (classData: Partial<Class>) => {
    if (!editingClass || !user?.id) return;
    
    // Verificar si es una clase mock (no editable)
    const isMockClass = mockClassPlans.some(mockClass => mockClass.id === editingClass.id);
    
    if (isMockClass) {
      alert('No se pueden editar las clases de ejemplo. Solo puedes editar clases que hayas creado.');
      setShowEditModal(false);
      setEditingClass(null);
      return;
    }
    
    // Convert Class format to ClassPlan format
    const classPlanData = {
      title: classData.title,
      category: classData.category,
      date: classData.date ? new Date(classData.date) : undefined,
      startTime: classData.time,
      endTime: classData.time && classData.duration ? calculateEndTime(classData.time, classData.duration) : undefined,
      duration: classData.duration,
      location: classData.location,
      objectives: classData.objectives,
      materials: classData.materials,
      warmUpPlan: classData.warmUpPlan ? {
        exercises: parseExercises(classData.warmUpPlan),
        totalDuration: calculateDuration(classData.warmUpPlan)
      } : undefined,
      mainActivityPlan: classData.mainActivityPlan ? {
        exercises: parseExercises(classData.mainActivityPlan),
        totalDuration: calculateDuration(classData.mainActivityPlan)
      } : undefined,
      coolDownPlan: classData.coolDownPlan ? {
        exercises: parseExercises(classData.coolDownPlan),
        totalDuration: calculateDuration(classData.coolDownPlan)
      } : undefined
    };
    
    updateClassPlan(editingClass.id, classPlanData);
    setShowEditModal(false);
    setEditingClass(null);
  };

  const handleDeleteClass = (classToDelete: Class) => {
    setClassToDelete(classToDelete);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteClass = () => {
    if (!classToDelete) return;
    
    // Solo permitir eliminar clases creadas por el usuario, no las clases mock
    const isMockClass = mockClassPlans.some(mockClass => mockClass.id === classToDelete.id);
    
    if (isMockClass) {
      alert('No se pueden eliminar las clases de ejemplo. Solo puedes eliminar clases que hayas creado.');
      setShowDeleteConfirm(false);
      setClassToDelete(null);
      return;
    }
    
    deleteClassPlan(classToDelete.id);
    setShowDeleteConfirm(false);
    setClassToDelete(null);
  };

  const handleStartEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setShowEditModal(true);
  };

  // Helper functions for conversion
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const parseExercises = (planText: string) => {
    if (!planText.trim()) return [];
    
    // Simple parsing - split by bullets or new lines
    const exercises = planText.split('•').filter(ex => ex.trim());
    
    return exercises.map((exercise, index) => {
      const trimmed = exercise.trim();
      // Try to extract duration from text like "10 min - Exercise description"
      const durationMatch = trimmed.match(/(\d+)\s*min/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 10;
      
      // Remove duration info from name
      const name = trimmed.replace(/(\d+)\s*min\s*-?\s*/, '').trim() || `Ejercicio ${index + 1}`;
      
      return {
        name,
        duration,
        description: trimmed
      };
    });
  };

  const calculateDuration = (planText: string): number => {
    const exercises = parseExercises(planText);
    return exercises.reduce((total, ex) => total + ex.duration, 0);
  };

  const ClassCard = ({ classItem }: { classItem: Class }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{classItem.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{classItem.category}</p>
          {/* Mostrar quién creó la clase */}
          {(() => {
            const mockClass = mockClassPlans.find(mc => mc.id === classItem.id);
            if (mockClass) {
              const creator = mockCoaches.find(coach => coach.id === mockClass.coachId);
              if (creator) {
                return (
                  <div className="flex items-center space-x-1 mt-1">
                    <UserCheck size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Creado por {creator.name}
                    </span>
                  </div>
                );
              }
            }
            return null;
          })()}
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(classItem.status)}`}>
          {getStatusLabel(classItem.status)}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={16} />
          <span>{classItem.date}</span>
          <Clock size={16} className="ml-4" />
          <span>{classItem.time} ({classItem.duration} min)</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin size={16} />
          <span>{classItem.location}</span>
          <Users size={16} className="ml-4" />
          <span>{classItem.enrolledStudents.length}/{classItem.maxStudents} estudiantes</span>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Objetivos:</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {classItem.objectives.map((objective, index) => (
            <li key={index} className="flex items-start space-x-2">
              <Target size={12} className="mt-1 text-blue-600 dark:text-blue-400" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {classItem.materials.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Materiales y Recursos:</h4>
          <div className="space-y-2">
            {classItem.materials.map((material) => (
              <div key={material.id} className="flex items-center space-x-2 text-sm">
                {getMaterialIcon(material.type)}
                <span className={material.required ? 'font-medium' : ''}>{material.name}</span>
                {material.required && <span className="text-red-500">*</span>}
                {material.url && (
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setSelectedClass(classItem)}
          className="text-blue-600 hover:text-blue-900 p-2"
          title="Ver detalles"
        >
          <Eye size={16} />
        </button>
        {/* Solo mostrar botones de editar y eliminar para clases creadas por el usuario */}
        {(() => {
          const isMockClass = mockClassPlans.some(mockClass => mockClass.id === classItem.id);
          if (isMockClass) {
            return (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Clase de ejemplo
              </span>
            );
          }
          return (
            <>
              <button 
                onClick={() => handleStartEdit(classItem)}
                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                title="Editar clase"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => handleDeleteClass(classItem)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Eliminar clase"
              >
                <Trash2 size={16} />
              </button>
            </>
          );
        })()}
      </div>
    </motion.div>
  );

  const CreateClassModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      category: '',
      date: '',
      time: '',
      duration: 60,
      location: '',
      maxStudents: 12,
      objectives: [''],
      materials: [] as Material[],
      notes: '',
      warmUpPlan: '',
      mainActivityPlan: '',
      coolDownPlan: ''
    });

    const [newMaterial, setNewMaterial] = useState({
      name: '',
      type: 'equipment' as Material['type'],
      description: '',
      url: '',
      required: false
    });

    const addObjective = () => {
      setFormData({
        ...formData,
        objectives: [...formData.objectives, '']
      });
    };

    const updateObjective = (index: number, value: string) => {
      const newObjectives = [...formData.objectives];
      newObjectives[index] = value;
      setFormData({ ...formData, objectives: newObjectives });
    };

    const removeObjective = (index: number) => {
      setFormData({
        ...formData,
        objectives: formData.objectives.filter((_, i) => i !== index)
      });
    };

    const addMaterial = () => {
      if (newMaterial.name.trim()) {
        const material: Material = {
          id: Date.now().toString(),
          ...newMaterial
        };
        setFormData({
          ...formData,
          materials: [...formData.materials, material]
        });
        setNewMaterial({
          name: '',
          type: 'equipment',
          description: '',
          url: '',
          required: false
        });
      }
    };

    const removeMaterial = (materialId: string) => {
      setFormData({
        ...formData,
        materials: formData.materials.filter(m => m.id !== materialId)
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validaciones
      if (!formData.title.trim()) {
        alert('Por favor ingresa un título para la clase');
        return;
      }
      
      if (!formData.category) {
        alert('Por favor selecciona una categoría');
        return;
      }
      
      if (!formData.date) {
        alert('Por favor selecciona una fecha');
        return;
      }
      
      // Validar que la fecha no sea anterior a hoy
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        alert('La fecha no puede ser anterior a hoy');
        return;
      }
      
      if (!formData.time) {
        alert('Por favor selecciona una hora');
        return;
      }
      
      if (!formData.location) {
        alert('Por favor selecciona una ubicación');
        return;
      }
      
      // Validar que haya al menos un objetivo
      const validObjectives = formData.objectives.filter(obj => obj.trim());
      if (validObjectives.length === 0) {
        alert('Por favor agrega al menos un objetivo para la clase');
        return;
      }
      
      // Filtrar objetivos vacíos
      const cleanedFormData = {
        ...formData,
        objectives: validObjectives
      };
      
      handleCreateClass(cleanedFormData);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Programar Nueva Clase</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título de la Clase</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-[var(--color-surface)] text-[var(--color-text)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  min="30"
                  max="180"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Seleccionar cancha</option>
                  <option value="Cancha Principal">Cancha Principal</option>
                  <option value="Cancha Auxiliar">Cancha Auxiliar</option>
                  <option value="Gimnasio">Gimnasio</option>
                </select>
              </div>
            </div>

            {/* Objetivos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Objetivos de la Clase</label>
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="flex-1 border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-[var(--color-surface)] text-[var(--color-text)]"
                    placeholder="Objetivo de aprendizaje"
                  />
                  {formData.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Agregar objetivo</span>
              </button>
            </div>

            {/* Materiales y Recursos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Materiales y Recursos</label>
              
              {/* Lista de materiales */}
              {formData.materials.length > 0 && (
                <div className="mb-4 space-y-2">
                  {formData.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getMaterialIcon(material.type)}
                        <span className="font-medium">{material.name}</span>
                        {material.required && <span className="text-red-500">*</span>}
                        {material.description && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">- {material.description}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterial(material.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar nuevo material */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Agregar Material/Recurso</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre del material"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    className="border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-[var(--color-surface)] text-[var(--color-text)]"
                  />
                  <select
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as Material['type'] })}
                    className="border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-[var(--color-surface)] text-[var(--color-text)]"
                  >
                    <option value="equipment">Equipamiento</option>
                    <option value="document">Documento</option>
                    <option value="video">Video</option>
                    <option value="link">Enlace</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMaterial.required}
                        onChange={(e) => setNewMaterial({ ...newMaterial, required: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">Requerido</span>
                    </label>
                  </div>
                </div>
                {(newMaterial.type === 'document' || newMaterial.type === 'video' || newMaterial.type === 'link') && (
                  <input
                    type="url"
                    placeholder="URL del recurso"
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                    className="w-full mt-2 border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-[var(--color-surface)] text-[var(--color-text)]"
                  />
                )}
                <button
                  type="button"
                  onClick={addMaterial}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Agregar material</span>
                </button>
              </div>
            </div>

            {/* Plan de Clase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calentamiento</label>
                <textarea
                  value={formData.warmUpPlan}
                  onChange={(e) => setFormData({ ...formData, warmUpPlan: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Actividades de calentamiento..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actividad Principal</label>
                <textarea
                  value={formData.mainActivityPlan}
                  onChange={(e) => setFormData({ ...formData, mainActivityPlan: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Actividades principales..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enfriamiento</label>
                <textarea
                  value={formData.coolDownPlan}
                  onChange={(e) => setFormData({ ...formData, coolDownPlan: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Actividades de enfriamiento..."
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas Adicionales</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Notas importantes para la clase..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
              >
                Programar Clase
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const EditClassModal = () => {
    const [formData, setFormData] = useState({
      title: editingClass?.title || '',
      category: editingClass?.category || '',
      date: editingClass?.date || '',
      time: editingClass?.time || '',
      duration: editingClass?.duration || 60,
      location: editingClass?.location || '',
      maxStudents: editingClass?.maxStudents || 12,
      objectives: editingClass?.objectives || [''],
      materials: editingClass?.materials || [] as Material[],
      notes: editingClass?.notes || '',
      warmUpPlan: editingClass?.warmUpPlan || '',
      mainActivityPlan: editingClass?.mainActivityPlan || '',
      coolDownPlan: editingClass?.coolDownPlan || ''
    });

    const [newMaterial, setNewMaterial] = useState({
      name: '',
      type: 'equipment' as Material['type'],
      description: '',
      url: '',
      required: false
    });

    const addObjective = () => {
      setFormData({
        ...formData,
        objectives: [...formData.objectives, '']
      });
    };

    const updateObjective = (index: number, value: string) => {
      const newObjectives = [...formData.objectives];
      newObjectives[index] = value;
      setFormData({ ...formData, objectives: newObjectives });
    };

    const removeObjective = (index: number) => {
      setFormData({
        ...formData,
        objectives: formData.objectives.filter((_, i) => i !== index)
      });
    };

    const addMaterial = () => {
      if (newMaterial.name.trim()) {
        const material: Material = {
          id: Date.now().toString(),
          ...newMaterial
        };
        setFormData({
          ...formData,
          materials: [...formData.materials, material]
        });
        setNewMaterial({
          name: '',
          type: 'equipment',
          description: '',
          url: '',
          required: false
        });
      }
    };

    const removeMaterial = (materialId: string) => {
      setFormData({
        ...formData,
        materials: formData.materials.filter(m => m.id !== materialId)
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleEditClass(formData);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Editar Clase: {editingClass?.title}</h3>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingClass(null);
              }}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título de la Clase</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  min="30"
                  max="180"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Seleccionar cancha</option>
                  <option value="Cancha Principal">Cancha Principal</option>
                  <option value="Cancha Auxiliar">Cancha Auxiliar</option>
                  <option value="Gimnasio">Gimnasio</option>
                </select>
              </div>
            </div>

            {/* Objetivos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Objetivos de la Clase</label>
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Objetivo de aprendizaje"
                  />
                  {formData.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Agregar objetivo</span>
              </button>
            </div>

            {/* Plan de Clase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calentamiento</label>
                <textarea
                  value={formData.warmUpPlan}
                  onChange={(e) => setFormData({ ...formData, warmUpPlan: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Actividades de calentamiento..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actividad Principal</label>
                <textarea
                  value={formData.mainActivityPlan}
                  onChange={(e) => setFormData({ ...formData, mainActivityPlan: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Actividades principales..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enfriamiento</label>
                <textarea
                  value={formData.coolDownPlan}
                  onChange={(e) => setFormData({ ...formData, coolDownPlan: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Actividades de enfriamiento..."
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas Adicionales</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Notas importantes para la clase..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingClass(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white rounded-lg transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const DeleteConfirmModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Eliminar Clase</h3>
            <p className="text-gray-600 dark:text-gray-400">Esta acción no se puede deshacer</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ¿Estás segura de que deseas eliminar la clase{' '}
            <strong className="text-gray-900 dark:text-gray-100">"{classToDelete?.title}"</strong>?
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Fecha: {classToDelete?.date} • Hora: {classToDelete?.time}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowDeleteConfirm(false);
              setClassToDelete(null);
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={confirmDeleteClass}
            className="px-4 py-2 bg-[var(--color-error)] hover:bg-[var(--color-error)]/90 text-white rounded-lg transition-colors"
          >
            Eliminar Clase
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Clase programada exitosamente</span>
        </motion.div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Clases</h1>
          <p className="text-gray-600 dark:text-gray-400">Programa y gestiona las clases que has creado</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Mostrando solo las clases creadas por {user?.name || 'ti'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Nueva Clase</span>
        </button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-[var(--color-surface)] text-[var(--color-text)]"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-[var(--color-surface)] text-[var(--color-text)]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">No has creado ninguna clase aún</p>
            <p className="text-sm">Haz clic en "Nueva Clase" para programar tu primera clase</p>
            <p className="text-xs mt-2">Solo puedes ver y gestionar las clases que tú hayas creado</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateModal && <CreateClassModal />}
      </AnimatePresence>

      {/* Edit Class Modal */}
      <AnimatePresence>
        {showEditModal && <EditClassModal />}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && <DeleteConfirmModal />}
      </AnimatePresence>

      {/* Class Detail Modal */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedClass.title}</h3>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Categoría:</strong> {selectedClass.category}</div>
                <div><strong>Estado:</strong> {getStatusLabel(selectedClass.status)}</div>
                <div><strong>Fecha:</strong> {selectedClass.date}</div>
                <div><strong>Hora:</strong> {selectedClass.time}</div>
                <div><strong>Duración:</strong> {selectedClass.duration} minutos</div>
                <div><strong>Ubicación:</strong> {selectedClass.location}</div>
              </div>

              {selectedClass.objectives.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Objetivos:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {selectedClass.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedClass.materials.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Materiales y Recursos:</h4>
                  <div className="space-y-2">
                    {selectedClass.materials.map((material) => (
                      <div key={material.id} className="flex items-center space-x-2 text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {getMaterialIcon(material.type)}
                        <span>{material.name}</span>
                        {material.required && <span className="text-red-500">*</span>}
                        {material.description && <span className="text-gray-600 dark:text-gray-400">- {material.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedClass.warmUpPlan || selectedClass.mainActivityPlan || selectedClass.coolDownPlan) && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Plan de Clase:</h4>
                  <div className="space-y-2 text-sm">
                    {selectedClass.warmUpPlan && (
                      <div>
                        <strong>Calentamiento:</strong> {selectedClass.warmUpPlan}
                      </div>
                    )}
                    {selectedClass.mainActivityPlan && (
                      <div>
                        <strong>Actividad Principal:</strong> {selectedClass.mainActivityPlan}
                      </div>
                    )}
                    {selectedClass.coolDownPlan && (
                      <div>
                        <strong>Enfriamiento:</strong> {selectedClass.coolDownPlan}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedClass.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Notas:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedClass.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedClass(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
  } catch (error) {
    console.error('Error en ClassManagement:', error);
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">
          Error al cargar la sección de Gestión de Clases
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Por favor, recarga la página o contacta al administrador.
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    );
  }
};

export default ClassManagement;