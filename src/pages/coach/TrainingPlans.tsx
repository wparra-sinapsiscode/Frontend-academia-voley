import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Target, Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { FiX } from 'react-icons/fi';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  sets?: number;
  reps?: number;
  restTime?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  objectives: string[];
}

interface TrainingPlan {
  id: string;
  title: string;
  category: string;
  duration: number;
  objectives: string[];
  exercises: Exercise[];
  warmUp: Exercise[];
  coolDown: Exercise[];
  createdBy: string;
  createdAt: string;
  lastModified: string;
  sourceType?: 'manual' | 'class';
  classId?: string;
}

const TrainingPlans: React.FC = () => {
  const { user, darkMode, trainingPlans, addTrainingPlan, updateTrainingPlan, deleteTrainingPlan } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);

  const mockPlans: TrainingPlan[] = [
    {
      id: '1',
      title: 'Desarrollo Técnico - Nivel Inicial',
      category: 'Infantil',
      duration: 90,
      objectives: ['Mejorar fundamentos básicos', 'Desarrollar coordinación', 'Introducir conceptos tácticos básicos'],
      exercises: [
        {
          id: 'ex1',
          name: 'Pase de antebrazos',
          description: 'Ejercicio básico de recepción en parejas',
          duration: 15,
          sets: 3,
          reps: 20,
          restTime: 2,
          difficulty: 'beginner',
          equipment: ['pelota', 'red'],
          objectives: ['Mejorar técnica de pase', 'Coordinación ojo-mano']
        },
        {
          id: 'ex2',
          name: 'Servicio de abajo',
          description: 'Práctica de servicio básico desde línea de 6 metros',
          duration: 20,
          sets: 4,
          reps: 15,
          restTime: 3,
          difficulty: 'beginner',
          equipment: ['pelota', 'red', 'conos'],
          objectives: ['Desarrollar técnica de servicio', 'Precisión']
        }
      ],
      warmUp: [
        {
          id: 'w1',
          name: 'Trote suave',
          description: 'Calentamiento cardiovascular',
          duration: 5,
          difficulty: 'beginner',
          equipment: [],
          objectives: ['Activación cardiovascular']
        }
      ],
      coolDown: [
        {
          id: 'c1',
          name: 'Estiramiento',
          description: 'Estiramientos específicos para voleibol',
          duration: 10,
          difficulty: 'beginner',
          equipment: [],
          objectives: ['Recuperación', 'Flexibilidad']
        }
      ],
      createdBy: 'coach1',
      createdAt: '2024-01-10',
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      title: 'Fuerza y Potencia - Nivel Avanzado',
      category: 'Juvenil A',
      duration: 120,
      objectives: ['Desarrollar potencia de remate', 'Mejorar fuerza explosiva', 'Prevenir lesiones'],
      exercises: [
        {
          id: 'ex3',
          name: 'Saltos pliométricos',
          description: 'Serie de saltos explosivos con caja',
          duration: 25,
          sets: 4,
          reps: 12,
          restTime: 90,
          difficulty: 'advanced',
          equipment: ['caja pliométrica', 'colchonetas'],
          objectives: ['Potencia de piernas', 'Explosividad']
        },
        {
          id: 'ex4',
          name: 'Remates con resistencia',
          description: 'Remates con banda elástica para resistencia',
          duration: 30,
          sets: 3,
          reps: 15,
          restTime: 60,
          difficulty: 'advanced',
          equipment: ['banda elástica', 'pelota', 'red'],
          objectives: ['Fuerza de remate', 'Técnica']
        }
      ],
      warmUp: [
        {
          id: 'w2',
          name: 'Activación dinámica',
          description: 'Movimientos dinámicos específicos',
          duration: 15,
          difficulty: 'intermediate',
          equipment: [],
          objectives: ['Preparación muscular', 'Activación neuromuscular']
        }
      ],
      coolDown: [
        {
          id: 'c2',
          name: 'Foam rolling',
          description: 'Automasaje con rodillo',
          duration: 15,
          difficulty: 'intermediate',
          equipment: ['foam roller'],
          objectives: ['Recuperación muscular', 'Reducir tensión']
        }
      ],
      createdBy: 'coach2',
      createdAt: '2024-01-08',
      lastModified: '2024-01-12'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'advanced': return 'bg-coral/20 dark:bg-red-900/30 text-coral dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200';
    }
  };

  const CreatePlanModal = () => {
    const generateId = () => `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const [formData, setFormData] = useState(editingPlan ? {
      title: editingPlan.title,
      category: editingPlan.category,
      duration: editingPlan.duration,
      objectives: editingPlan.objectives.length > 0 ? editingPlan.objectives : [''],
      exercises: editingPlan.exercises.map(ex => ({
        ...ex,
        equipment: ex.equipment.length > 0 ? ex.equipment : [''],
        objectives: ex.objectives.length > 0 ? ex.objectives : ['']
      })),
      warmUp: editingPlan.warmUp,
      coolDown: editingPlan.coolDown
    } : {
      title: '',
      category: '',
      duration: 90,
      objectives: [''],
      exercises: [
        {
          id: generateId(),
          name: '',
          description: '',
          duration: 15,
          sets: 3,
          reps: 10,
          restTime: 60,
          difficulty: 'beginner' as const,
          equipment: [''],
          objectives: ['']
        }
      ],
      warmUp: [
        {
          id: generateId(),
          name: 'Calentamiento general',
          description: 'Trote y movilidad articular',
          duration: 10,
          difficulty: 'beginner' as const,
          equipment: [''],
          objectives: ['Activación']
        }
      ],
      coolDown: [
        {
          id: generateId(),
          name: 'Vuelta a la calma',
          description: 'Estiramientos y relajación',
          duration: 10,
          difficulty: 'beginner' as const,
          equipment: [''],
          objectives: ['Recuperación']
        }
      ]
    });

    const handleAddExercise = () => {
      setFormData({
        ...formData,
        exercises: [
          ...formData.exercises,
          {
            id: generateId(),
            name: '',
            description: '',
            duration: 15,
            sets: 3,
            reps: 10,
            restTime: 60,
            difficulty: 'beginner' as const,
            equipment: [''],
            objectives: ['']
          }
        ]
      });
    };

    const handleRemoveExercise = (index: number) => {
      if (formData.exercises.length <= 1) return;
      
      const newExercises = [...formData.exercises];
      newExercises.splice(index, 1);
      setFormData({
        ...formData,
        exercises: newExercises
      });
    };

    const handleExerciseChange = (index: number, field: string, value: any) => {
      const newExercises = [...formData.exercises];
      newExercises[index] = {
        ...newExercises[index],
        [field]: value
      };
      setFormData({
        ...formData,
        exercises: newExercises
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Preparar datos completos para el nuevo plan
      const now = new Date().toISOString();
      const newPlan: TrainingPlan = {
        id: generateId(),
        title: formData.title,
        category: formData.category,
        duration: formData.duration,
        objectives: formData.objectives.filter(obj => obj.trim() !== ''),
        exercises: formData.exercises.map(ex => ({
          ...ex,
          equipment: ex.equipment.filter(eq => eq.trim() !== ''),
          objectives: ex.objectives.filter(obj => obj.trim() !== '')
        })),
        warmUp: formData.warmUp,
        coolDown: formData.coolDown,
        createdBy: user?.id || 'coach',
        createdAt: now,
        lastModified: now
      };
      
      if (editingPlan) {
        // Convert to the TrainingPlan format expected by context
        const contextPlan = {
          title: newPlan.title,
          description: `Plan de entrenamiento: ${newPlan.title}`,
          categoryId: newPlan.category,
          coachId: newPlan.createdBy,
          duration: newPlan.duration,
          difficulty: 'intermediate' as const,
          objectives: newPlan.objectives,
          exercises: newPlan.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            description: ex.description,
            duration: ex.duration,
            equipment: ex.equipment,
            instructions: [ex.description],
            difficulty: ex.difficulty,
            category: 'technique' as const
          })),
          warmUp: newPlan.warmUp?.map(ex => ({
            id: ex.id,
            name: ex.name,
            description: ex.description,
            duration: ex.duration,
            equipment: ex.equipment || [],
            instructions: [ex.description],
            difficulty: ex.difficulty,
            category: 'warmup' as const
          })),
          coolDown: newPlan.coolDown?.map(ex => ({
            id: ex.id,
            name: ex.name,
            description: ex.description,
            duration: ex.duration,
            equipment: ex.equipment || [],
            instructions: [ex.description],
            difficulty: ex.difficulty,
            category: 'cooldown' as const
          })),
          sourceType: 'manual' as const
        };
        
        updateTrainingPlan(editingPlan.id, contextPlan);
      } else {
        // Convert to the TrainingPlan format expected by context
        const contextPlan = {
          title: newPlan.title,
          description: `Plan de entrenamiento: ${newPlan.title}`,
          categoryId: newPlan.category,
          coachId: newPlan.createdBy,
          createdAt: new Date(),
          duration: newPlan.duration,
          difficulty: 'intermediate' as const,
          objectives: newPlan.objectives,
          exercises: newPlan.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            description: ex.description,
            duration: ex.duration,
            equipment: ex.equipment,
            instructions: [ex.description],
            difficulty: ex.difficulty,
            category: 'technique' as const
          })),
          warmUp: newPlan.warmUp?.map(ex => ({
            id: ex.id,
            name: ex.name,
            description: ex.description,
            duration: ex.duration,
            equipment: ex.equipment || [],
            instructions: [ex.description],
            difficulty: ex.difficulty,
            category: 'warmup' as const
          })),
          coolDown: newPlan.coolDown?.map(ex => ({
            id: ex.id,
            name: ex.name,
            description: ex.description,
            duration: ex.duration,
            equipment: ex.equipment || [],
            instructions: [ex.description],
            difficulty: ex.difficulty,
            category: 'cooldown' as const
          })),
          sourceType: 'manual' as const
        };
        
        addTrainingPlan(contextPlan);
      }
      setShowPlanModal(false);
      setEditingPlan(null);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => {
          setShowPlanModal(false);
          setEditingPlan(null);
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-azul-marino dark:text-gray-100">
                {editingPlan ? 'Editar Plan de Entrenamiento' : 'Crear Nuevo Plan de Entrenamiento'}
              </h3>
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setEditingPlan(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título del Plan
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-azul-claro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-azul-claro"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Juvenil B">Juvenil B</option>
                    <option value="Juvenil A">Juvenil A</option>
                    <option value="Adultas">Adultas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-azul-claro"
                    min="30"
                    max="180"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Objetivos del Plan
                </label>
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...formData.objectives];
                        newObjectives[index] = e.target.value;
                        setFormData({...formData, objectives: newObjectives});
                      }}
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-500"
                      placeholder="Objetivo del plan"
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newObjectives = formData.objectives.filter((_, i) => i !== index);
                          setFormData({...formData, objectives: newObjectives});
                        }}
                        className="px-3 py-2 text-coral dark:text-red-400 hover:bg-coral/10 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({...formData, objectives: [...formData.objectives, '']})}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors text-sm font-medium"
                >
                  + Agregar objetivo
                </button>
              </div>

              {/* Ejercicios Principales */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Ejercicios Principales</h4>
                
                {formData.exercises.map((exercise, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">Ejercicio {index + 1}</h5>
                      {formData.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="p-1 text-coral dark:text-red-400 hover:bg-coral/10 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nombre
                        </label>
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-500"
                          placeholder="Ej. Pase de antebrazos"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Dificultad
                        </label>
                        <select
                          value={exercise.difficulty}
                          onChange={(e) => handleExerciseChange(index, 'difficulty', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-500"
                        >
                          <option value="beginner">Principiante</option>
                          <option value="intermediate">Intermedio</option>
                          <option value="advanced">Avanzado</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={exercise.description}
                        onChange={(e) => handleExerciseChange(index, 'description', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-500"
                        rows={2}
                        placeholder="Descripción detallada del ejercicio..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duración (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.duration}
                          onChange={(e) => handleExerciseChange(index, 'duration', parseInt(e.target.value) || 1)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Series
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 1)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Repeticiones
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 1)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descanso (seg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={exercise.restTime}
                          onChange={(e) => handleExerciseChange(index, 'restTime', parseInt(e.target.value) || 0)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Equipamiento (opcional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {exercise.equipment.map((item, eqIndex) => (
                          <div key={eqIndex} className="flex items-center">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const newEquipment = [...exercise.equipment];
                                newEquipment[eqIndex] = e.target.value;
                                handleExerciseChange(index, 'equipment', newEquipment);
                              }}
                              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              placeholder="Equipamiento"
                            />
                            {exercise.equipment.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newEquipment = exercise.equipment.filter((_, i) => i !== eqIndex);
                                  handleExerciseChange(index, 'equipment', newEquipment);
                                }}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-coral dark:hover:text-red-400"
                              >
                                <FiX size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            handleExerciseChange(index, 'equipment', [...exercise.equipment, '']);
                          }}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          + Añadir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="w-full border border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  <span className="font-medium">Añadir Ejercicio</span>
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(false);
                    setEditingPlan(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-bold"
                >
                  {editingPlan ? 'Actualizar Plan' : 'Crear Plan'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const PlanDetailModal = ({ plan }: { plan: TrainingPlan }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedPlan(null)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-azul-marino dark:text-gray-100">{plan.title}</h3>
                  {plan.sourceType === 'class' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      📚 Generado desde clase
                    </span>
                  )}
                  {plan.sourceType === 'manual' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      ✋ Plan manual
                    </span>
                  )}
                </div>
                {plan.sourceType === 'class' && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Este plan se sincroniza automáticamente con la clase correspondiente
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingPlan(plan);
                    setSelectedPlan(null);
                    setShowPlanModal(true);
                  }}
                  className="p-2 text-azul-marino dark:text-primary-400 hover:bg-azul-claro/20 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-azul-claro/10 dark:bg-primary-900/20 rounded-lg">
                <Clock size={24} className="mx-auto text-azul-marino dark:text-primary-400 mb-2" />
                <div className="text-lg font-bold text-azul-marino dark:text-primary-400">{plan.duration} min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Duración</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Users size={24} className="mx-auto text-green-600 dark:text-green-400 mb-2" />
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{plan.category}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Categoría</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Target size={24} className="mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{plan.exercises.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ejercicios</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Objetivos</h4>
                <ul className="space-y-1">
                  {plan.objectives.map((objective, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <Target size={14} className="text-azul-claro dark:text-primary-400 mt-0.5 flex-shrink-0" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Calentamiento</h4>
                <div className="space-y-2">
                  {plan.warmUp.map((exercise, index) => (
                    <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-green-800 dark:text-green-300">{exercise.name}</h5>
                        <span className="text-sm text-green-600 dark:text-green-400">{exercise.duration} min</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">{exercise.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Ejercicios Principales</h4>
                <div className="space-y-3">
                  {plan.exercises.map((exercise, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-azul-marino dark:text-gray-100">{exercise.name}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty === 'beginner' && 'Principiante'}
                          {exercise.difficulty === 'intermediate' && 'Intermedio'}
                          {exercise.difficulty === 'advanced' && 'Avanzado'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{exercise.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{exercise.duration} min</span>
                        </div>
                        {exercise.sets && (
                          <div className="flex items-center gap-2">
                            <RotateCcw size={16} className="text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{exercise.sets} series</span>
                          </div>
                        )}
                        {exercise.reps && (
                          <div className="flex items-center gap-2">
                            <Zap size={16} className="text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{exercise.reps} reps</span>
                          </div>
                        )}
                        {exercise.restTime && (
                          <div className="flex items-center gap-2">
                            <Pause size={16} className="text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{exercise.restTime}s descanso</span>
                          </div>
                        )}
                      </div>

                      {exercise.equipment.length > 0 && exercise.equipment[0] && (
                        <div className="mt-3">
                          <h6 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Equipamiento:</h6>
                          <div className="flex flex-wrap gap-1">
                            {exercise.equipment.filter(eq => eq).map((equipment, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                {equipment}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Vuelta a la Calma</h4>
                <div className="space-y-2">
                  {plan.coolDown.map((exercise, index) => (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-blue-800 dark:text-blue-300">{exercise.name}</h5>
                        <span className="text-sm text-blue-600 dark:text-blue-400">{exercise.duration} min</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{exercise.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Combine mock plans with real training plans from context
  const allPlans = [
    ...mockPlans,
    ...trainingPlans.map(plan => ({
      id: plan.id,
      title: plan.title,
      category: plan.categoryId,
      duration: plan.duration,
      objectives: plan.objectives,
      exercises: plan.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
        duration: ex.duration,
        sets: 3,
        reps: 10,
        restTime: 60,
        difficulty: ex.difficulty,
        equipment: ex.equipment,
        objectives: [ex.description]
      })),
      warmUp: plan.warmUp ? plan.warmUp.map(ex => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
        duration: ex.duration,
        difficulty: ex.difficulty,
        equipment: ex.equipment,
        objectives: [ex.description]
      })) : [],
      coolDown: plan.coolDown ? plan.coolDown.map(ex => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
        duration: ex.duration,
        difficulty: ex.difficulty,
        equipment: ex.equipment,
        objectives: [ex.description]
      })) : [],
      createdBy: plan.coachId,
      createdAt: plan.createdAt.toISOString().split('T')[0],
      lastModified: plan.createdAt.toISOString().split('T')[0],
      sourceType: plan.sourceType,
      classId: plan.classId
    }))
  ];

  const filteredPlans = allPlans.filter(plan => 
    !selectedCategory || plan.category === selectedCategory
  );

  console.log("Rendering TrainingPlans component", { user, showPlanModal });
  
  return (
    <div className="space-y-6">
      {/* Fixed action button for mobile - always visible */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowPlanModal(true)}
          className="bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
          aria-label="Nuevo Plan"
        >
          <Plus size={24} />
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-azul-marino dark:text-gray-100">Planes de Entrenamiento</h1>
          <p className="text-gray-600 dark:text-gray-400">Diseña y gestiona rutinas de entrenamiento efectivas</p>
        </div>
        <button
          onClick={() => setShowPlanModal(true)}
          className="bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 w-full md:w-auto"
        >
          <Plus size={20} />
          <span className="font-bold">Nuevo Plan</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-azul-claro"
          >
            <option value="">Todas las categorías</option>
            <option value="Infantil">Infantil</option>
            <option value="Juvenil B">Juvenil B</option>
            <option value="Juvenil A">Juvenil A</option>
            <option value="Adultas">Adultas</option>
          </select>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-600 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-azul-marino shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Cuadrícula
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-azul-marino shadow-sm' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredPlans.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-8 text-center">
            <Target size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              No hay planes disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Crea tu primer plan de entrenamiento
            </p>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-azul-marino dark:text-gray-100">
                        {plan.title}
                      </h3>
                      {plan.sourceType === 'class' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          📚 Clase Programada
                        </span>
                      )}
                      {plan.sourceType === 'manual' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                          ✋ Plan Manual
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{plan.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPlan(plan);
                        setShowPlanModal(true);
                      }}
                      className="p-1 text-azul-marino dark:text-primary-400 hover:bg-azul-claro/20 dark:hover:bg-primary-900/20 rounded transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (plan.sourceType === 'class') {
                          alert('Este plan está vinculado a una clase. Para eliminarlo, elimina la clase correspondiente desde Gestión de Clases.');
                        } else {
                          deleteTrainingPlan(plan.id);
                        }
                      }}
                      className={`p-1 hover:bg-coral/10 dark:hover:bg-red-900/20 rounded transition-colors ${
                        plan.sourceType === 'class' 
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                          : 'text-coral dark:text-red-400'
                      }`}
                      disabled={plan.sourceType === 'class'}
                      title={plan.sourceType === 'class' ? 'Los planes de clase no se pueden eliminar directamente' : 'Eliminar plan'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <Clock size={20} className="mx-auto text-azul-claro dark:text-primary-400 mb-1" />
                    <div className="text-sm font-medium text-azul-marino dark:text-primary-400">{plan.duration} min</div>
                  </div>
                  <div className="text-center">
                    <Target size={20} className="mx-auto text-green-500 dark:text-green-400 mb-1" />
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">{plan.exercises.length} ejercicios</div>
                  </div>
                  <div className="text-center">
                    <Users size={20} className="mx-auto text-purple-500 dark:text-purple-400 mb-1" />
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">{plan.objectives.length} objetivos</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Objetivos principales:</h4>
                  <ul className="space-y-1">
                    {plan.objectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="w-1 h-1 bg-azul-claro dark:bg-primary-400 rounded-full mt-1.5 flex-shrink-0"></span>
                        {objective}
                      </li>
                    ))}
                    {plan.objectives.length > 2 && (
                      <li className="text-xs text-gray-500 dark:text-gray-400">
                        +{plan.objectives.length - 2} objetivos más
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Actualizado: {new Date(plan.lastModified).toLocaleDateString('es-ES')}</span>
                  <button className="flex items-center gap-1 text-azul-marino dark:text-primary-400 hover:text-azul-claro dark:hover:text-primary-300 transition-colors">
                    <Play size={14} />
                    Ver plan
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showPlanModal && <CreatePlanModal />}
      {selectedPlan && <PlanDetailModal plan={selectedPlan} />}
    </div>
  );
};

export default TrainingPlans;