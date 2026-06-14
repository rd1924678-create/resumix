import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumePreview from './pages/ResumePreview';
import AdminDashboard from './pages/AdminDashboard';
import TemplateSelect from './pages/TemplateSelect';

// Protect standard user routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-500">Authenticating...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Protect admin routes
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-500">Authenticating...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// Shell wrapper to provide Nav & Footer automatically
const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: '500',
              padding: '12px 16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
              maxWidth: '380px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
              style: { background: '#0f172a', borderLeft: '4px solid #10b981' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#fff' },
              style: { background: '#0f172a', borderLeft: '4px solid #f43f5e' },
            },
          }}
        />
        <Routes>
          {/* Public routes without shell */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public routes with shell */}
          <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />

          {/* Protected user routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/select-template" element={
            <ProtectedRoute>
              <TemplateSelect />
            </ProtectedRoute>
          } />

          <Route path="/builder/:id" element={
            <ProtectedRoute>
              <MainLayout>
                <ResumeBuilder />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/preview/:id" element={
            <ProtectedRoute>
              {/* Preview controls has custom layout page print directives */}
              <MainLayout>
                <ResumePreview />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Admin protected routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </AdminRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
