import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiAward,
  FiMessageSquare,
  FiCalendar,
  FiClipboard,
  FiUserCheck,
  FiBarChart,
  FiBook,
  FiTarget,
  FiCreditCard,
  FiMail,
  FiFileText,
  FiX,
  FiLogOut,
  FiActivity,
  FiSettings
} from 'react-icons/fi';

interface MenuItem {
  icon?: React.ComponentType;
  label?: string;
  path?: string;
  separator?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, darkMode } = useAppContext();
  const location = useLocation();
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  
  // Effect to sync profileImage from localStorage
  useEffect(() => {
    const checkProfileImage = () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔍 Sidebar - Usuario de localStorage:', {
            nombre: parsedUser.name,
            tieneProfileImage: !!parsedUser.profileImage,
            campos: Object.keys(parsedUser)
          });
          if (parsedUser.profileImage) {
            setUserProfileImage(parsedUser.profileImage);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    };
    
    checkProfileImage();
    // Check for updates when component mounts or user changes
  }, [user?.id]);
  
  // Use profileImage from state or context
  const profileImageSrc = userProfileImage || user?.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b4e4e8?w=150';
  
  // Logs para debug
  console.log('🏝️ Sidebar - profileImage final:', {
    usandoLocal: !!userProfileImage,
    usandoContext: !!user?.profileImage,
    preview: profileImageSrc.substring(0, 50)
  });

  const getMenuItems = (): MenuItem[] => {
    switch (user?.role) {
      case 'admin':
        return [
          { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
          { icon: FiUsers, label: 'Estudiantes', path: '/admin/students' },
          { icon: FiUserCheck, label: 'Entrenadores', path: '/admin/coaches' },
          { icon: FiSettings, label: 'Especializaciones', path: '/admin/coach-specializations' },
          { icon: FiDollarSign, label: 'Finanzas', path: '/admin/finances' },
          { icon: FiAward, label: 'Torneos', path: '/admin/tournaments' },
          { icon: FiMessageSquare, label: 'Anuncios', path: '/admin/announcements' },
        ];
      case 'coach':
        return [
          { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
          { icon: FiCalendar, label: 'Clases', path: '/coach/classes' },
          { icon: FiUserCheck, label: 'Asistencia', path: '/coach/attendance' },
          { icon: FiClipboard, label: 'Evaluaciones', path: '/coach/evaluations' },
          { icon: FiBook, label: 'Planes', path: '/coach/training-plans' },
          { icon: FiTarget, label: 'Parámetros', path: '/coach/parameters' },
        ];
      case 'parent':
        return [
          { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
          { icon: FiCreditCard, label: 'Pagos', path: '/parent/payments' },
          { icon: FiBarChart, label: 'Progreso', path: '/parent/progress' },
          { icon: FiBook, label: 'Clases', path: '/parent/classes' },
          { icon: FiMail, label: 'Comunicación', path: '/parent/communication' },
          { icon: FiFileText, label: 'Reportes', path: '/parent/reports' },
          { icon: FiCalendar, label: 'Calendario', path: '/parent/calendar' },
          { separator: true },
          { icon: FiActivity, label: 'Vista del Alumno', path: '/parent/student-progress' },
          { icon: FiTarget, label: 'Desafíos del Alumno', path: '/parent/student-challenges' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const sidebarVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40
      }
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-primary">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  darkMode ? 'bg-[var(--color-surface)]' : 'bg-white'
                }`}>
                  <FiActivity className="w-6 h-6 text-accent" />
                </div>
                <div className="text-white">
                  <h1 className="text-lg font-bold">Academia Vóley</h1>
                  <p className="text-sm text-white/80">Lima, Perú</p>
                </div>
              </div>
            </div>

            <nav className="mt-8 flex-1 px-2 space-y-2">
              {menuItems.map((item, index) => {
                if (item.separator) {
                  return <div key={`separator-${index}`} className="h-px my-4 bg-white/20" />;
                }
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path || '/'}
                    className={`sidebar-item ${isActive ? 'active' : 
                      'text-white/80 hover:text-white'
                    }`}
                  >
                    {item.icon && React.createElement(item.icon as any, { className: "w-5 h-5" })}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User info and logout */}
            <div className="flex-shrink-0 px-4 pb-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 text-white">
                <img
                  src={profileImageSrc}
                  alt={user?.name || 'Usuario'}
                  className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  onError={(e) => {
                    console.log('❌ Error loading profile image');
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1494790108755-2616b4e4e8?w=150';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs capitalize text-white/80">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg transition-colors hover:bg-white/20"
                  title="Cerrar sesión"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
          >
            <div className="flex flex-col h-full bg-primary">
              <div className="flex items-center justify-between flex-shrink-0 px-4 pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <FiActivity className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-lg font-bold">Academia Vóley</h1>
                    <p className="text-sm text-white/80">Lima, Perú</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white hover:bg-white/10 rounded-lg"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-8 flex-1 px-2 space-y-2">
                {menuItems.map((item, index) => {
                  if (item.separator) {
                    return <div key={`separator-${index}`} className="h-px bg-white/20 my-4" />;
                  }
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path || '/'}
                      onClick={onClose}
                      className={`sidebar-item ${isActive ? 'active' : 'text-white/80 hover:text-white'}`}
                    >
                      {item.icon && React.createElement(item.icon as any, { className: "w-5 h-5" })}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* User info and logout */}
              <div className="flex-shrink-0 px-4 pb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 text-white">
                  <img
                    src={profileImageSrc}
                    alt={user?.name || 'Usuario'}
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                    onError={(e) => {
                      console.log('❌ Error loading mobile profile image');
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1494790108755-2616b4e4e8?w=150';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-white/80 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Cerrar sesión"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;