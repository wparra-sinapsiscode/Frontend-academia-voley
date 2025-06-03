import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiActivity, 
  FiTarget, 
  FiAward,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiBell,
  FiPlus
} from 'react-icons/fi';

const ParentCalendar: React.FC = () => {
  const { user, students, categories } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'personal' as 'personal' | 'study' | 'health' | 'family' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  
  // Find the student associated with this parent
  const myStudent = students.find(s => s.parentId === user?.id);
  
  if (!myStudent) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Calendario de Actividades</h1>
        <p className="text-gray-600 dark:text-gray-400">No se encontró información de la estudiante asociada.</p>
      </div>
    );
  }

  const events = [
    {
      id: 1,
      title: "Entrenamiento Regular",
      date: "2024-05-27",
      time: "16:00 - 17:30",
      type: "training",
      location: "Cancha Principal",
      description: "Entrenamiento de técnica y fundamentos",
      importance: "medium"
    },
    {
      id: 2,
      title: "Torneo Interclubes",
      date: "2024-05-30",
      time: "09:00 - 15:00",
      type: "tournament",
      location: "Polideportivo Central",
      description: "Torneo regional categoría juvenil - Presencia de padres recomendada",
      importance: "high"
    },
    {
      id: 3,
      title: "Entrenamiento Técnico",
      date: "2024-05-29",
      time: "16:00 - 17:30",
      type: "training",
      location: "Cancha Auxiliar",
      description: "Enfoque en saque y recepción",
      importance: "medium"
    },
    {
      id: 4,
      title: "Evaluación Mensual",
      date: "2024-06-01",
      time: "15:00 - 16:00",
      type: "evaluation",
      location: "Oficina Técnica",
      description: "Evaluación de progreso técnico y físico - Reunión con padres 16:00",
      importance: "high"
    },
    {
      id: 5,
      title: "Reunión de Padres",
      date: "2024-06-02",
      time: "18:00 - 19:00",
      type: "meeting",
      location: "Salón de Reuniones",
      description: "Planificación del próximo trimestre y actividades especiales",
      importance: "high"
    },
    {
      id: 6,
      title: "Partido Amistoso",
      date: "2024-06-05",
      time: "18:00 - 20:00",
      type: "match",
      location: "Cancha Principal",
      description: "Partido contra Academia Rival - Invitación a familiares",
      importance: "medium"
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'tournament': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
      case 'evaluation': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
      case 'match': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'meeting': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      case 'reminder': return 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'training': return <FiActivity className="w-5 h-5" />;
      case 'tournament': return <FiAward className="w-5 h-5" />;
      case 'evaluation': return <FiTarget className="w-5 h-5" />;
      case 'match': return <FiUser className="w-5 h-5" />;
      case 'meeting': return <FiUser className="w-5 h-5" />;
      case 'reminder': return <FiBell className="w-5 h-5" />;
      default: return <FiCalendar className="w-5 h-5" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const hasEvent = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasRegularEvent = events.some(event => event.date === dateStr);
    const hasReminder = reminders.some(reminder => reminder.date === dateStr);
    return hasRegularEvent || hasReminder;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dateEvents = events.filter(event => event.date === dateStr);
    const dateReminders = reminders.filter(reminder => reminder.date === dateStr);
    
    // Convert reminders to event format for consistent display
    const formattedReminders = dateReminders.map(reminder => ({
      ...reminder,
      type: 'reminder',
      importance: reminder.priority,
      location: 'Personal'
    }));
    
    return [...dateEvents, ...formattedReminders];
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleReminderClick = () => {
    setShowReminderModal(true);
    // Preseleccionar la fecha actual o la fecha seleccionada
    const dateStr = selectedDate.toISOString().split('T')[0];
    setReminderForm(prev => ({ ...prev, date: dateStr }));
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reminderForm.title || !reminderForm.date || !reminderForm.time) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const newReminder = {
      id: Date.now().toString(),
      ...reminderForm,
      createdAt: new Date().toISOString(),
      completed: false
    };

    setReminders(prev => [...prev, newReminder]);
    
    // Reset form
    setReminderForm({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'personal',
      priority: 'medium'
    });
    
    setShowReminderModal(false);
    alert('¡Recordatorio creado exitosamente!');
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const selectedEvents = getEventsForDate(selectedDate);

  // Get upcoming important events
  const upcomingImportantEvents = events
    .filter(event => event.importance === 'high')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendario de {myStudent.name} 📅</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Mantente al día con todas las actividades de tu hija</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReminderClick} className="btn-primary dark:bg-blue-600 dark:hover:bg-blue-700">
            <FiPlus className="w-4 h-4 mr-2" />
            Nuevo Recordatorio
          </button>
          <button className="btn-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
            <FiBell className="w-4 h-4 mr-2" />
            Notificaciones
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 card dark:bg-gray-800 dark:border-gray-700"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-400"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-400"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-12"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayEvents = getEventsForDate(dayDate);
              const hasImportantEvent = dayEvents.some(event => 
                event.importance === 'high' || (event.type === 'reminder' && event.priority === 'high')
              );
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dayDate)}
                  className={`h-12 flex items-center justify-center text-sm rounded-lg transition-all relative ${
                    isToday(day)
                      ? 'bg-primary-500 text-white font-bold dark:bg-blue-600'
                      : selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth()
                      ? 'bg-primary-100 text-primary-700 font-medium dark:bg-blue-900/50 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                  {hasEvent(day) && (
                    <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                      hasImportantEvent ? 'bg-red-500' : 'bg-orange-500'
                    }`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Day Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {formatDate(selectedDate)}
          </h3>

          {selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getEventTypeColor(event.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${getImportanceColor(event.importance)}`}>
                          {event.type === 'reminder' ? 
                            (event.priority === 'high' ? 'Importante' : event.priority === 'medium' ? 'Normal' : 'Opcional') :
                            (event.importance === 'high' ? 'Importante' : event.importance === 'medium' ? 'Normal' : 'Opcional')
                          }
                        </span>
                      </div>
                      <div className="space-y-1 text-sm opacity-75 mb-2">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiMapPin className="w-3 h-3" />
                          {event.location}
                        </div>
                      </div>
                      <p className="text-sm opacity-90">{event.description}</p>
                      
                      {/* Reminder Actions */}
                      {event.type === 'reminder' && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => handleToggleComplete(event.id)}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                              event.completed 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {event.completed ? 'Completado ✓' : 'Marcar como completado'}
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(event.id)}
                            className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCalendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No hay eventos programados para este día</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Upcoming Events Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card dark:bg-gray-800 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Próximas Actividades</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.slice(0, 6).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`p-4 rounded-lg border ${getEventTypeColor(event.type)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    {event.importance === 'high' && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <div className="space-y-1 text-xs opacity-75">
                    <div>{new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {event.time}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Horarios Regulares</h4>
          <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
            {categories.find(c => c.id === myStudent.categoryId)?.schedule?.map((schedule, index) => (
              <div key={index}>{schedule}</div>
            )) || <div>No especificado</div>}
          </div>
        </div>

        <div className="card bg-green-50 dark:bg-green-900/20 dark:border-green-700">
          <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">Entrenadora</h4>
          <div className="text-sm text-green-700 dark:text-green-400">
            <p className="font-medium">Sofía Martínez</p>
            <p>{categories.find(c => c.id === myStudent.categoryId)?.name || 'Sin categoría'}</p>
          </div>
        </div>

        <div className="card bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700">
          <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Contacto de Emergencia</h4>
          <div className="text-sm text-purple-700 dark:text-purple-400">
            <p>Academia: (01) 234-5678</p>
            <p>WhatsApp: +57 300 123 4567</p>
          </div>
        </div>
      </motion.div>

      {/* My Reminders */}
      {reminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card dark:bg-gray-800 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Mis Recordatorios</h3>
          
          <div className="space-y-3">
            {reminders
              .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
              .map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    reminder.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400' :
                    reminder.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-400' :
                    'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                  } ${reminder.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium dark:text-gray-100 ${reminder.completed ? 'line-through' : ''}`}>
                          {reminder.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          reminder.type === 'personal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          reminder.type === 'study' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          reminder.type === 'health' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' :
                          reminder.type === 'family' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {reminder.type === 'personal' ? 'Personal' :
                           reminder.type === 'study' ? 'Estudios' :
                           reminder.type === 'health' ? 'Salud' :
                           reminder.type === 'family' ? 'Familia' : 'Otro'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-4">
                          <span>📅 {new Date(reminder.date).toLocaleDateString('es-ES')}</span>
                          <span>🕐 {reminder.time}</span>
                        </div>
                      </div>
                      
                      {reminder.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{reminder.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleComplete(reminder.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          reminder.completed 
                            ? 'bg-green-500 text-white dark:bg-green-600' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                        }`}
                        title={reminder.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="p-2 bg-red-200 text-red-600 rounded-lg hover:bg-red-300 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                        title="Eliminar recordatorio"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Create Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center p-4 z-[9999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Crear Nuevo Recordatorio</h3>
            
            <form onSubmit={handleCreateReminder} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Ej: Llevar a Isabella al médico"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={reminderForm.description}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Detalles adicionales del recordatorio..."
                  rows={3}
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={reminderForm.date}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={reminderForm.time}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Tipo y Prioridad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={reminderForm.type}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="personal">Personal</option>
                    <option value="family">Familia</option>
                    <option value="health">Salud</option>
                    <option value="study">Estudios</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={reminderForm.priority}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                  Crear Recordatorio
                </button>
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ParentCalendar;