import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiCalendar, FiUsers, FiBell, FiSend, FiImage, FiPaperclip } from 'react-icons/fi';
import { useAppContext } from '../../contexts/AppContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'achievement' | 'maintenance';
  audience: 'all' | 'students' | 'parents' | 'coaches' | 'specific';
  specificAudience?: string[];
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
  status: 'draft' | 'published' | 'expired';
  priority: 'low' | 'medium' | 'high';
  attachments?: Attachment[];
  readBy: string[];
  pinned: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

const AnnouncementManagement: React.FC = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'general' | 'urgent' | 'event' | 'achievement' | 'maintenance'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'priority'>('date');
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Filter and sort announcements
  const filteredAndSortedAnnouncements = useMemo(() => {
    return announcements
      .filter(announcement => {
        const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || announcement.type === filterType;
        const matchesStatus = filterStatus === 'all' || announcement.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        // First sort by pinned status
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        
        // Then by selected criteria
        switch (sortBy) {
          case 'date':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'title':
            return a.title.localeCompare(b.title);
          case 'priority':
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          default:
            return 0;
        }
      });
  }, [announcements, searchTerm, filterType, filterStatus, sortBy]);

  const handleSubmit = (announcementData: Partial<Announcement>) => {
    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, announcementData);
    } else {
      const newAnnouncement = {
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
        readBy: [],
        pinned: false,
        ...announcementData
      };
      addAnnouncement(newAnnouncement);
    }
    setShowModal(false);
    setEditingAnnouncement(null);
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      general: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      event: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      achievement: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return typeConfig[type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      general: 'General',
      urgent: 'Urgente',
      event: 'Evento',
      achievement: 'Logro',
      maintenance: 'Mantenimiento'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return '🔴';
    if (priority === 'medium') return '🟡';
    return '🟢';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Anuncios</h1>
          <p className="text-gray-600 dark:text-gray-400">Administra todos los anuncios y comunicaciones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center space-x-2"
        >
          <FiPlus size={16} />
          <span>Nuevo Anuncio</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Buscar anuncios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            <option value="general">General</option>
            <option value="urgent">Urgente</option>
            <option value="event">Evento</option>
            <option value="achievement">Logro</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="expired">Expirado</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Fecha (más reciente)</option>
            <option value="title">Título (A-Z)</option>
            <option value="priority">Prioridad</option>
          </select>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Anuncio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedAnnouncements.map((announcement, index) => (
              <motion.tr
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {announcement.pinned && (
                      <span className="text-yellow-500 mr-2" title="Anuncio fijado">📌</span>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {announcement.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {announcement.content.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(announcement.type)}`}>
                    {getTypeLabel(announcement.type)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(announcement.status)}`}>
                    {announcement.status === 'draft' ? 'Borrador' : announcement.status === 'published' ? 'Publicado' : 'Expirado'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg">{getPriorityIcon(announcement.priority)}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(announcement.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingAnnouncement(announcement);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Editar"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        updateAnnouncement(announcement.id, { pinned: !announcement.pinned });
                      }}
                      className={`${announcement.pinned ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'}`}
                      title={announcement.pinned ? 'Desfijar' : 'Fijar'}
                    >
                      📌
                    </button>
                    {announcement.status === 'draft' && (
                      <button
                        onClick={() => {
                          updateAnnouncement(announcement.id, { 
                            status: 'published' as const, 
                            publishedAt: new Date().toISOString() 
                          });
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Publicar"
                      >
                        <FiSend size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
                          deleteAnnouncement(announcement.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Eliminar"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No se encontraron anuncios</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingAnnouncement ? 'Editar Anuncio' : 'Nuevo Anuncio'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleSubmit({
                title: formData.get('title') as string,
                content: formData.get('content') as string,
                type: formData.get('type') as Announcement['type'],
                audience: formData.get('audience') as Announcement['audience'],
                priority: formData.get('priority') as Announcement['priority'],
                status: formData.get('status') as Announcement['status'],
                expiresAt: formData.get('expiresAt') as string || undefined
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingAnnouncement?.title}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenido</label>
                  <textarea
                    name="content"
                    defaultValue={editingAnnouncement?.content}
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                    <select
                      name="type"
                      defaultValue={editingAnnouncement?.type || 'general'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="urgent">Urgente</option>
                      <option value="event">Evento</option>
                      <option value="achievement">Logro</option>
                      <option value="maintenance">Mantenimiento</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audiencia</label>
                    <select
                      name="audience"
                      defaultValue={editingAnnouncement?.audience || 'all'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="students">Estudiantes</option>
                      <option value="parents">Padres</option>
                      <option value="coaches">Entrenadores</option>
                      <option value="specific">Específica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                    <select
                      name="priority"
                      defaultValue={editingAnnouncement?.priority || 'medium'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select
                      name="status"
                      defaultValue={editingAnnouncement?.status || 'draft'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Borrador</option>
                      <option value="published">Publicado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Expiración (opcional)</label>
                    <input
                      type="datetime-local"
                      name="expiresAt"
                      defaultValue={editingAnnouncement?.expiresAt?.slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAnnouncement(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {editingAnnouncement ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;