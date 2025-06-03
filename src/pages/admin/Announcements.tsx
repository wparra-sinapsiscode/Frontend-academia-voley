import React, { useState } from 'react';
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

const Announcements: React.FC = () => {
  const { students, coaches, announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'general' | 'urgent' | 'event' | 'achievement' | 'maintenance'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'expired'>('all');
  const [filterAudience, setFilterAudience] = useState<'all' | 'students' | 'parents' | 'coaches' | 'specific'>('all');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);


  const filteredAnnouncements = announcements
    .filter(announcement => {
      const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || announcement.type === filterType;
      const matchesStatus = filterStatus === 'all' || announcement.status === filterStatus;
      const matchesAudience = filterAudience === 'all' || announcement.audience === filterAudience;
      return matchesSearch && matchesType && matchesStatus && matchesAudience;
    })
    .sort((a, b) => {
      // First sort by pinned status (pinned first)
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      // Then sort by createdAt (most recent first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleAnnouncementSubmit = (announcementData: Partial<Announcement>) => {
    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, announcementData);
    } else {
      const newAnnouncement = {
        createdBy: 'Admin',
        createdAt: new Date(),
        readBy: [],
        pinned: false,
        ...announcementData
      };
      addAnnouncement(newAnnouncement);
    }
    setShowAnnouncementModal(false);
    setEditingAnnouncement(null);
  };

  const handlePublish = (announcementId: string) => {
    updateAnnouncement(announcementId, { 
      status: 'published' as const, 
      publishedAt: new Date().toISOString() 
    });
  };

  const handlePin = (announcementId: string) => {
    const announcement = announcements.find(a => a.id === announcementId);
    if (announcement) {
      updateAnnouncement(announcementId, { pinned: !announcement.pinned });
    }
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

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Borrador',
      published: 'Publicado',
      expired: 'Expirado'
    };
    return labels[status as keyof typeof labels] || status;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Anuncios</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestión de comunicaciones y anuncios</p>
        </div>
        <button
          onClick={() => setShowAnnouncementModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center space-x-2"
        >
          <FiPlus size={16} />
          <span>Nuevo Anuncio</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Anuncios</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{announcements.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FiBell className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Publicados</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {announcements.filter(a => a.status === 'published').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FiSend className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Borradores</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {announcements.filter(a => a.status === 'draft').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <FiEdit className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fijados</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {announcements.filter(a => a.pinned).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <FiCalendar className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
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
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las audiencias</option>
            <option value="students">Estudiantes</option>
            <option value="parents">Padres</option>
            <option value="coaches">Entrenadores</option>
            <option value="specific">Específica</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${
              announcement.pinned ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {announcement.pinned && (
                      <span className="text-yellow-500" title="Anuncio fijado">📌</span>
                    )}
                    <span className="text-lg">{getPriorityIcon(announcement.priority)}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                  </div>
                  <div className="flex items-center space-x-4 mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(announcement.type)}`}>
                      {getTypeLabel(announcement.type)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(announcement.status)}`}>
                      {getStatusLabel(announcement.status)}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
                      {announcement.audience === 'all' ? 'Todos' : announcement.audience}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                    {announcement.content.substring(0, 150)}
                    {announcement.content.length > 150 && '...'}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Por: {announcement.createdBy}</span>
                    <span>Creado: {formatDate(announcement.createdAt)}</span>
                    {announcement.publishedAt && (
                      <span>Publicado: {formatDate(announcement.publishedAt)}</span>
                    )}
                    {announcement.readBy && announcement.readBy.length > 0 && (
                      <span>Leído por: {announcement.readBy.length} personas</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setViewingAnnouncement(announcement)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2"
                    title="Ver detalles"
                  >
                    <FiEye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingAnnouncement(announcement);
                      setShowAnnouncementModal(true);
                    }}
                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2"
                    title="Editar"
                  >
                    <FiEdit size={16} />
                  </button>
                  <button
                    onClick={() => handlePin(announcement.id)}
                    className={`p-2 ${announcement.pinned ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'}`}
                    title={announcement.pinned ? 'Desfijar' : 'Fijar'}
                  >
                    📌
                  </button>
                  {announcement.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(announcement.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2"
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
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2"
                    title="Eliminar"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
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
              handleAnnouncementSubmit({
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
                      defaultValue={editingAnnouncement?.type}
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
                      defaultValue={editingAnnouncement?.audience}
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
                      defaultValue={editingAnnouncement?.priority}
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
                      defaultValue={editingAnnouncement?.status}
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
                    setShowAnnouncementModal(false);
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

      {/* View Announcement Modal */}
      {viewingAnnouncement && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-[9999]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{viewingAnnouncement.title}</h3>
              <button
                onClick={() => setViewingAnnouncement(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(viewingAnnouncement.type)}`}>
                  {getTypeLabel(viewingAnnouncement.type)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(viewingAnnouncement.status)}`}>
                  {getStatusLabel(viewingAnnouncement.status)}
                </span>
                <span className="text-lg">{getPriorityIcon(viewingAnnouncement.priority)}</span>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{viewingAnnouncement.content}</p>
              </div>
              
              <div className="border-t dark:border-gray-700 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <strong>Creado por:</strong> {viewingAnnouncement.createdBy}
                  </div>
                  <div>
                    <strong>Audiencia:</strong> {viewingAnnouncement.audience === 'all' ? 'Todos' : viewingAnnouncement.audience}
                  </div>
                  <div>
                    <strong>Creado:</strong> {formatDate(viewingAnnouncement.createdAt)}
                  </div>
                  {viewingAnnouncement.publishedAt && (
                    <div>
                      <strong>Publicado:</strong> {formatDate(viewingAnnouncement.publishedAt)}
                    </div>
                  )}
                  {viewingAnnouncement.expiresAt && (
                    <div>
                      <strong>Expira:</strong> {formatDate(viewingAnnouncement.expiresAt)}
                    </div>
                  )}
                  <div>
                    <strong>Leído por:</strong> {viewingAnnouncement.readBy?.length || 0} personas
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingAnnouncement(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
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

export default Announcements;