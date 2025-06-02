import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Array<'admin' | 'coach' | 'parent'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user } = useAppContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;