import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { FiMenu, FiBell, FiSettings, FiSun, FiMoon, FiSearch, FiCalendar, FiClock } from 'react-icons/fi';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, announcements, tournaments, darkMode, toggleDarkMode, notifications, markNotificationAsRead } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get event announcements
    const eventAnnouncements = announcements
      .filter(ann => {
        if (ann.type === 'event' && ann.status === 'published') {
          // If announcement has an expiration date, use it as event date
          if (ann.expiresAt) {
            const eventDate = new Date(ann.expiresAt);
            return eventDate >= now && eventDate <= nextWeek;
          }
          // Otherwise check if it was created recently (for upcoming events)
          const createdDate = new Date(ann.createdAt);
          const daysSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreated <= 7;
        }
        return false;
      })
      .map(ann => ({
        id: ann.id,
        title: ann.title,
        content: ann.content,
        date: ann.expiresAt ? new Date(ann.expiresAt) : new Date(ann.createdAt),
        type: 'announcement' as const,
        priority: ann.priority
      }));

    // Get tournaments
    const upcomingTournaments = tournaments
      .filter(tournament => {
        const tournamentDate = new Date(tournament.startDate);
        return tournament.status === 'upcoming' && tournamentDate >= now && tournamentDate <= nextWeek;
      })
      .map(tournament => ({
        id: tournament.id,
        title: tournament.name,
        content: `Torneo de ${tournament.sport} - ${tournament.location}`,
        date: new Date(tournament.startDate),
        type: 'tournament' as const,
        priority: 'high' as const
      }));

    // Combine and sort by date
    return [...eventAnnouncements, ...upcomingTournaments]
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [announcements, tournaments]);

  // Get time remaining text
  const getTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Evento pasado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 1) return `en ${days} días`;
    if (days === 1) return 'mañana';
    if (hours > 1) return `en ${hours} horas`;
    if (hours === 1) return 'en 1 hora';
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 1) return `en ${minutes} minutos`;
    return 'próximamente';
  };

  // Get unread notifications for current user
  const userNotifications = useMemo(() => {
    if (!user) return [];
    
    console.log('🔔 Header - Total notificaciones:', notifications.length);
    console.log('🔔 Header - Usuario actual:', user);
    
    const filtered = notifications
      .filter(notif => 
        (notif.to === user.id || (notif.to === 'admin' && user.role === 'admin')) && 
        !notif.read
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    console.log('🔔 Header - Notificaciones filtradas para usuario:', filtered);
    return filtered;
  }, [notifications, user]);
  
  const unreadCount = userNotifications.length + upcomingEvents.length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Search bar */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-300" />
            </div>
            <input
              type="text"
              placeholder="Buscar estudiantes, entrenadoras..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-300 focus:border-primary-300"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 relative"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{unreadCount}</span>
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Notificaciones</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} sin leer</span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {/* Payment notifications */}
                    {userNotifications.length > 0 && (
                      <>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Pagos</div>
                        {userNotifications.map((notif) => (
                          <motion.div 
                            key={notif.id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            onClick={() => markNotificationAsRead(notif.id)}
                          >
                            <div className={`p-2 rounded-full ${
                              notif.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                            }`}>
                              <FiBell className={`w-4 h-4 ${
                                notif.priority === 'high' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {getTimeRemaining(notif.createdAt)}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </>
                    )}
                    
                    {/* Events separator */}
                    {userNotifications.length > 0 && upcomingEvents.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                    )}
                    
                    {/* Upcoming events */}
                    {upcomingEvents.length > 0 && (
                      <>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Eventos próximos</div>
                        {upcomingEvents.map((event) => (
                        <motion.div 
                          key={event.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                          <div className={`p-2 rounded-full ${
                            event.type === 'tournament' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {event.type === 'tournament' ? (
                              <FiCalendar className={`w-4 h-4 ${
                                event.type === 'tournament' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                              }`} />
                            ) : (
                              <FiClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {event.title}
                              </p>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                event.priority === 'high' 
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                                  : event.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              }`}>
                                {getTimeRemaining(event.date)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                              {event.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <FiCalendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {event.date.toLocaleDateString('es-ES', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      </>
                    )}
                    
                    {/* Empty state */}
                    {userNotifications.length === 0 && upcomingEvents.length === 0 && (
                      <div className="text-center py-8">
                        <FiBell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No hay notificaciones nuevas
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Las notificaciones aparecerán aquí
                        </p>
                      </div>
                    )}
                  </div>
                  {upcomingEvents.length > 5 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        Ver todos los eventos ({upcomingEvents.length})
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Settings */}
          <button className="p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300">
            <FiSettings className="w-5 h-5" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b4e4e8?w=150'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;