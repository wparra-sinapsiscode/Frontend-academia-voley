import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { FiMenu, FiBell, FiSettings, FiSun, FiMoon, FiCalendar, FiClock } from 'react-icons/fi';
import SettingsModal from '../common/SettingsModal';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, announcements, tournaments, darkMode, toggleDarkMode, notifications, markNotificationAsRead } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get event announcements
    const eventAnnouncements = announcements
      .filter(ann => {
        // Filter announcements that are pinned or high priority
        if (ann.pinned || ann.priority === 'high') {
          // If announcement has an expiration date, use it as event date
          if (ann.expiryDate) {
            const eventDate = new Date(ann.expiryDate);
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
        date: ann.expiryDate ? new Date(ann.expiryDate) : new Date(ann.createdAt),
        type: 'announcement' as const,
        priority: ann.priority
      }));

    // Get tournaments
    const upcomingTournaments = tournaments
      .filter(tournament => {
        const tournamentDate = new Date(tournament.date);
        return tournament.status === 'upcoming' && tournamentDate >= now && tournamentDate <= nextWeek;
      })
      .map(tournament => ({
        id: tournament.id,
        title: tournament.name,
        content: `Torneo en ${tournament.location}`,
        date: new Date(tournament.date),
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
    
    
    const filtered = notifications
      .filter(notif => 
        (notif.to === user.id || (notif.to === 'admin' && user.role === 'admin')) && 
        !notif.read
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    return filtered;
  }, [notifications, user]);
  
  const unreadCount = userNotifications.length + upcomingEvents.length;

  return (
    <header className="bg-white dark:bg-[var(--color-surface)] shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <FiMenu className="w-6 h-6" />
          </button>

        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-primary relative"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent rounded-full flex items-center justify-center">
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
                className="absolute right-0 mt-2 w-96 bg-white dark:bg-[var(--color-surface)] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-[var(--color-text)]">Notificaciones</h3>
                    <span className="text-xs text-[var(--color-text-secondary)]">{unreadCount} sin leer</span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {/* Payment notifications */}
                    {userNotifications.length > 0 && (
                      <>
                        <div className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Pagos</div>
                        {userNotifications.map((notif) => (
                          <motion.div 
                            key={notif.id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[var(--color-surface)] hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            onClick={() => markNotificationAsRead(notif.id)}
                          >
                            <div className={`p-2 rounded-full ${
                              notif.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary/10 dark:bg-primary/20'
                            }`}>
                              <FiBell className={`w-4 h-4 ${
                                notif.priority === 'high' ? 'text-red-600 dark:text-red-400' : 'text-primary'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--color-text)]">
                                {notif.title}
                              </p>
                              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
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
                        <div className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Eventos próximos</div>
                        {upcomingEvents.map((event) => (
                        <motion.div 
                          key={event.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[var(--color-surface)] hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                          <div className={`p-2 rounded-full ${
                            event.type === 'tournament' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-primary/10 dark:bg-primary/20'
                          }`}>
                            {event.type === 'tournament' ? (
                              <FiCalendar className={`w-4 h-4 ${
                                event.type === 'tournament' ? 'text-purple-600 dark:text-purple-400' : 'text-primary'
                              }`} />
                            ) : (
                              <FiClock className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium text-[var(--color-text)]">
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
                            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                              {event.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <FiCalendar className="w-3 h-3 text-[var(--color-text-secondary)]" />
                              <p className="text-xs text-[var(--color-text-secondary)]">
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
                        <FiBell className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          No hay notificaciones nuevas
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          Las notificaciones aparecerán aquí
                        </p>
                      </div>
                    )}
                  </div>
                  {upcomingEvents.length > 5 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button className="text-sm text-primary hover:text-primary/80 font-medium">
                        Ver todos los eventos ({upcomingEvents.length})
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Settings */}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <FiSettings className="w-5 h-5" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-[var(--color-text)]">{user?.name}</p>
              <p className="text-xs text-[var(--color-text-secondary)] capitalize">{user?.role}</p>
            </div>
            <img
              src={user?.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b4e4e8?w=150'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </header>
  );
};

export default Header;