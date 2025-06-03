import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

// Auth Components
import LandingPage from '../../pages/auth/LandingPage';

// Admin Components
import AdminDashboard from '../../pages/admin/AdminDashboard';
import Students from '../../pages/admin/Students';
import Coaches from '../../pages/admin/Coaches';
import Finances from '../../pages/admin/Finances';
import Tournaments from '../../pages/admin/Tournaments';
import Announcements from '../../pages/admin/Announcements';
import PaymentSettings from '../../pages/admin/PaymentSettings';
import ExpenseSettings from '../../pages/admin/ExpenseSettings';
import FinanceSettings from '../../pages/admin/FinanceSettings';
import CoachSpecializations from '../../pages/admin/CoachSpecializations';

// Coach Components
import CoachDashboard from '../../pages/coach/CoachDashboard';
import ClassManagement from '../../pages/coach/ClassManagement';
import AttendanceTracking from '../../pages/coach/AttendanceTracking';
import StudentEvaluations from '../../pages/coach/StudentEvaluations';
import TrainingPlans from '../../pages/coach/TrainingPlans';
import ChallengeParameters from '../../pages/coach/ChallengeParameters';
import EvaluationFields from '../../pages/coach/EvaluationFields';

// Student Components
import StudentProgress from '../../pages/student/StudentProgress';
import StudentChallenges from '../../pages/student/StudentChallenges';

// Parent Components
import ParentDashboard from '../../pages/parent/ParentDashboard';
import ParentPayments from '../../pages/parent/ParentPayments';
import ParentProgress from '../../pages/parent/ParentProgress';
import ParentClasses from '../../pages/parent/ParentClasses';
import ParentCommunication from '../../pages/parent/ParentCommunication';
import ParentReports from '../../pages/parent/ParentReports';
import ParentCalendar from '../../pages/parent/ParentCalendar';

// Layout Components
import ProtectedRoute from './ProtectedRoute';
import MainLayout from './MainLayout';

const AppRouter: React.FC = () => {
  const { user } = useAppContext();

  return (
    <Router>
      <Routes>
        {/* Public Route - Landing Page with Login */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                {user?.role === 'admin' && <AdminDashboard />}
                {user?.role === 'coach' && <CoachDashboard />}
                {user?.role === 'parent' && <ParentDashboard />}
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <Students />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/coaches"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <Coaches />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/coach-specializations"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <CoachSpecializations />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/finances"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <Finances />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/finance-settings"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <FinanceSettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/finance-settings/payment-types"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <PaymentSettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/finance-settings/expense-categories"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <ExpenseSettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Mantener rutas anteriores para compatibilidad */}
        <Route
          path="/admin/payment-settings"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <PaymentSettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/expense-settings"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <ExpenseSettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/tournaments"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <Tournaments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <Announcements />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Coach Routes */}
        <Route
          path="/coach/classes"
          element={
            <ProtectedRoute roles={['coach']}>
              <MainLayout>
                <ClassManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/coach/attendance"
          element={
            <ProtectedRoute roles={['coach']}>
              <MainLayout>
                <AttendanceTracking />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/coach/evaluations"
          element={
            <ProtectedRoute roles={['coach']}>
              <MainLayout>
                <StudentEvaluations />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/coach/training-plans"
          element={
            <ProtectedRoute roles={['coach']}>
              <MainLayout>
                <TrainingPlans />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/coach/parameters"
          element={
            <ProtectedRoute roles={['coach']}>
              <MainLayout>
                <ChallengeParameters />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/coach/evaluation-fields"
          element={
            <ProtectedRoute roles={['coach']}>
              <MainLayout>
                <EvaluationFields />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Parent Routes - Include both parent and student views */}
        <Route
          path="/parent/payments"
          element={
            <ProtectedRoute roles={['parent']}>
              <MainLayout>
                <ParentPayments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/parent/progress"
          element={
            <ProtectedRoute roles={['parent']}>
              <MainLayout>
                <ParentProgress />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/parent/classes"
          element={
            <ProtectedRoute roles={['parent']}>
              <MainLayout>
                <ParentClasses />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/parent/communication"
          element={
            <ProtectedRoute roles={['parent']}>
              <MainLayout>
                <ParentCommunication />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/parent/reports"
          element={
            <ProtectedRoute roles={['parent']}>
              <MainLayout>
                <ParentReports />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/parent/calendar"
          element={
            <ProtectedRoute roles={['parent']}>
              <MainLayout>
                <ParentCalendar />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Student Views for Parents - Parents can show these to their daughters */}
        <Route
          path="/parent/student-progress"
          element={
            <ProtectedRoute roles={['parent']}>
              <MainLayout>
                <StudentProgress />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/parent/student-challenges"
          element={
            <ProtectedRoute roles={['parent']}>
              <MainLayout>
                <StudentChallenges />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;