import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import UserDashboard from '@/pages/UserDashboard';
import XRayResult from '@/pages/XRayResult';
import Chatbot from '@/pages/Chatbot';
import DiseaseKnowledge from '@/pages/DiseaseKnowledge';
import DiseaseDetail from '@/pages/DiseaseDetail';
import DoctorPortal from '@/pages/DoctorPortal';
import AdminPanel from '@/pages/AdminPanel';
import FindDoctors from '@/pages/FindDoctors';
import Tutorial from '@/pages/Tutorial';
import Community from '@/pages/Community';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/diseases" element={<DiseaseKnowledge />} />
        <Route path="/diseases/:id" element={<DiseaseDetail />} />
        <Route path="/find-doctors" element={<FindDoctors />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/community" element={<Community />} />
      </Route>

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      </Route>

      {/* Protected — all authenticated roles */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/result" element={<XRayResult />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorPortal /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
