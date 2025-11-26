import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { lazy, Suspense } from 'react';

// Eager load critical pages (Login/Register for better UX)
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load all other pages for code splitting and better performance
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ReportUpload = lazy(() => import('./pages/ReportUpload'));
const ReportList = lazy(() => import('./pages/ReportList'));
const Reminders = lazy(() => import('./pages/Reminders'));
const AccessReports = lazy(() => import('./pages/AccessReports'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Analytics = lazy(() => import('./pages/Analytics'));
const EmergencyContacts = lazy(() => import('./pages/EmergencyContacts'));
const Appointments = lazy(() => import('./pages/Appointments'));
const HealthMetrics = lazy(() => import('./pages/HealthMetrics'));
const Prescriptions = lazy(() => import('./pages/Prescriptions'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Messages = lazy(() => import('./pages/Messages'));
const TwoFactorAuth = lazy(() => import('./pages/TwoFactorAuth'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const Vaccinations = lazy(() => import('./pages/Vaccinations'));
const Allergies = lazy(() => import('./pages/Allergies'));
const FamilyAccounts = lazy(() => import('./pages/FamilyAccounts'));
const MedicalTimeline = lazy(() => import('./pages/MedicalTimeline'));
const HealthGoals = lazy(() => import('./pages/HealthGoals'));
const LabTests = lazy(() => import('./pages/LabTests'));
const Insurance = lazy(() => import('./pages/Insurance'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Optimized loading component with better visual feedback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-blue-600 mx-auto"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-purple-400 opacity-20 mx-auto"></div>
      </div>
      <p className="mt-6 text-gray-700 font-semibold text-lg">Loading...</p>
      <p className="mt-2 text-gray-500 text-sm">Please wait</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

      {/* Protected Routes - Dashboard Redirect */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === 'patient' && <Navigate to="/patient/dashboard" />}
            {user?.role === 'doctor' && <Navigate to="/doctor/dashboard" />}
            {user?.role === 'admin' && <Navigate to="/admin/dashboard" />}
          </ProtectedRoute>
        }
      />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/upload"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <ReportUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/reports"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <ReportList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/reminders"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Reminders />
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/access"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <AccessReports />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Common Routes (All authenticated users) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency-contacts"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <EmergencyContacts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <Appointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/health-metrics"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <HealthMetrics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <Prescriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <Reviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/2fa"
        element={
          <ProtectedRoute>
            <TwoFactorAuth />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <ActivityLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vaccinations"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Vaccinations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/allergies"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Allergies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/family"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <FamilyAccounts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timeline"
        element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <MedicalTimeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/health-goals"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <HealthGoals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab-tests"
        element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <LabTests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/insurance"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Insurance />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
