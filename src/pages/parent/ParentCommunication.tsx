import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { Send, MessageCircle, User, Clock, Search, Filter, Paperclip, Star, Reply } from 'lucide-react';

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  important: boolean;
  attachments?: string[];
  type: 'message' | 'notification' | 'announcement';
}

const ParentCommunication: React.FC = () => {
  const { users, user } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: '',
    important: false
  });
  const [sentMessages, setSentMessages] = useState<Message[]>([]);

  const mockMessages: Message[] = [
    {
      id: '1',
      from: 'coach1',
      to: 'parent1',
      subject: 'Excelente progreso en el entrenamiento',
      content: 'Quería informarle que su hija ha mostrado una mejora significativa en su técnica de remate. Sigue practicando con mucha dedicación y es un ejemplo para sus compañeras.',
      timestamp: '2024-01-15T10:30:00',
      read: false,
      important: true,
      type: 'message'
    },
    {
      id: '2',
      from: 'admin',
      to: 'parent1',
      subject: 'Recordatorio: Pago mensual pendiente',
      content: 'Le recordamos que el pago correspondiente al mes de enero está pendiente. Puede realizarlo a través de nuestra plataforma o en recepción.',
      timestamp: '2024-01-14T15:45:00',
      read: true,
      important: false,
      type: 'notification'
    },
    {
      id: '3',
      from: 'coach2',
      to: 'parent1',
      subject: 'Invitación a torneo inter-academias',
      content: 'Nos complace invitar a su hija a participar en el torneo inter-academias que se realizará el próximo mes. Adjunto encontrará más detalles.',
      timestamp: '2024-01-12T09:15:00',
      read: true,
      important: true,
      attachments: ['torneo_detalles.pdf'],
      type: 'announcement'
    },
    {
      id: '4',
      from: 'admin',
      to: 'parent1',
      subject: 'Cambio de horario - Clase del viernes',
      content: 'Informamos que la clase del viernes 19 de enero se trasladará de 16:00 a 17:00 horas debido a mantenimiento de las instalaciones.',
      timestamp: '2024-01-10T14:20:00',
      read: true,
      important: false,
      type: 'announcement'
    }
  ];

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-azul-claro text-azul-marino dark:bg-blue-900/30 dark:text-blue-300';
      case 'notification': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'announcement': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new message object
    const messageToSend: Message = {
      id: `msg_${Date.now()}`,
      from: user?.id || 'parent1',
      to: newMessage.to,
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toISOString(),
      read: true, // Messages you send are already "read" by you
      important: newMessage.important,
      type: 'message'
    };
    
    // Add to sent messages
    setSentMessages(prev => [messageToSend, ...prev]);
    
    // Reset form and go to sent tab
    setNewMessage({ to: '', subject: '', content: '', important: false });
    setSelectedTab('sent');
    
    // Show success notification (in a real app, this would be a proper toast notification)
    alert('Mensaje enviado exitosamente');
  };

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || message.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-azul-marino dark:text-white">Comunicación</h1>
          <p className="text-gray-600 dark:text-gray-400">Mantente en contacto con entrenadoras y administración</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSelectedTab('inbox')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              selectedTab === 'inbox' 
                ? 'bg-azul-claro text-azul-marino border-b-2 border-azul-marino dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400' 
                : 'text-gray-600 hover:text-azul-marino dark:text-gray-400 dark:hover:text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              Bandeja de Entrada
              {mockMessages.filter(m => !m.read).length > 0 && (
                <span className="bg-coral text-white dark:bg-coral/80 rounded-full text-xs px-2 py-0.5">
                  {mockMessages.filter(m => !m.read).length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('sent')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              selectedTab === 'sent' 
                ? 'bg-azul-claro text-azul-marino border-b-2 border-azul-marino dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400' 
                : 'text-gray-600 hover:text-azul-marino dark:text-gray-400 dark:hover:text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send size={16} />
              Enviados
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('compose')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              selectedTab === 'compose' 
                ? 'bg-azul-claro text-azul-marino border-b-2 border-azul-marino dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400' 
                : 'text-gray-600 hover:text-azul-marino dark:text-gray-400 dark:hover:text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send size={16} />
              Nuevo Mensaje
            </div>
          </button>
        </div>

        <div className="p-6">
          {selectedTab === 'inbox' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar mensajes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-claro dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-claro dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="message">Mensajes</option>
                  <option value="notification">Notificaciones</option>
                  <option value="announcement">Anuncios</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                      No se encontraron mensajes
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500">
                      Ajusta los filtros de búsqueda
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((message) => {
                    const sender = users.find(u => u.id === message.from);
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !message.read ? 'bg-azul-claro/5 border-azul-claro dark:bg-blue-900/10 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-400 dark:text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {sender?.name || 'Sistema'}
                                </span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeColor(message.type)}`}>
                                {message.type === 'message' && 'Mensaje'}
                                {message.type === 'notification' && 'Notificación'}
                                {message.type === 'announcement' && 'Anuncio'}
                              </span>
                              {message.important && (
                                <Star size={16} className="text-yellow-500 dark:text-yellow-400 fill-current" />
                              )}
                            </div>
                            
                            <h3 className={`text-sm mb-1 ${
                              !message.read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'
                            }`}>
                              {message.subject}
                            </h3>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {message.content}
                            </p>
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <Paperclip size={14} className="text-gray-400 dark:text-gray-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {message.attachments.length} archivo(s) adjunto(s)
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock size={14} />
                              {new Date(message.timestamp).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {!message.read && (
                              <div className="w-2 h-2 bg-azul-marino dark:bg-blue-400 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {selectedTab === 'sent' && (
            <div className="space-y-4">
              {sentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Send size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                    No hay mensajes enviados
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Los mensajes que envíes aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentMessages.map((message) => {
                    const receiver = users.find(u => u.id === message.to);
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-400 dark:text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  Para: {receiver?.name || 'Desconocido'}
                                </span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeColor(message.type)}`}>
                                Enviado
                              </span>
                              {message.important && (
                                <Star size={16} className="text-yellow-500 dark:text-yellow-400 fill-current" />
                              )}
                            </div>
                            
                            <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">
                              {message.subject}
                            </h3>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Clock size={14} />
                              {new Date(message.timestamp).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'compose' && (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Para
                </label>
                <select
                  value={newMessage.to}
                  onChange={(e) => setNewMessage({...newMessage, to: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-claro dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Seleccionar destinatario</option>
                  {users.filter(u => u.role === 'coach' || u.role === 'admin').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role === 'coach' ? 'Entrenadora' : 'Administración'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-claro dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Asunto del mensaje"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mensaje
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-claro dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  rows={6}
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="important"
                  checked={newMessage.important}
                  onChange={(e) => setNewMessage({...newMessage, important: e.target.checked})}
                  className="rounded border-gray-300 dark:border-gray-600 text-azul-marino focus:ring-azul-claro dark:focus:ring-blue-400 dark:bg-gray-700"
                />
                <label htmlFor="important" className="text-sm text-gray-700 dark:text-gray-300">
                  Marcar como importante
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-azul-marino text-white px-6 py-2 rounded-lg hover:bg-azul-marino/90 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Send size={16} />
                  Enviar Mensaje
                </button>
                <button
                  type="button"
                  onClick={() => setNewMessage({ to: '', subject: '', content: '', important: false })}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {selectedMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-azul-marino dark:text-white">
                      {selectedMessage.subject}
                    </h3>
                    {selectedMessage.important && (
                      <Star size={16} className="text-yellow-500 dark:text-yellow-400 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>
                        {users.find(u => u.id === selectedMessage.from)?.name || 'Sistema'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>
                        {new Date(selectedMessage.timestamp).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>
              
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Archivos adjuntos:</h4>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Paperclip size={16} className="text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{attachment}</span>
                        <button className="ml-auto text-azul-marino dark:text-blue-400 hover:text-azul-claro dark:hover:text-blue-300 text-sm">
                          Descargar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <button className="bg-azul-marino text-white px-4 py-2 rounded-lg hover:bg-azul-marino/90 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Reply size={16} />
                  Responder
                </button>
                <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Marcar como no leído
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ParentCommunication;