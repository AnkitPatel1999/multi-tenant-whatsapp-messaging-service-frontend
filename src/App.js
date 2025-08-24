import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Components
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import WhatsAppDevices from './components/whatsapp/WhatsAppDevices';
import Messages from './components/messages/Messages';
import Contacts from './components/contacts/Contacts';
import Users from './components/users/Users';
import Layout from './components/layout/Layout';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children, redirectTo }) => {
  const { isAuthenticated } = useAuth();

  if (redirectTo) {
    // If redirectTo is provided, redirect authenticated users away from this route
    return isAuthenticated ? <Navigate to={redirectTo} replace /> : children;
  } else {
    // Default behavior: protect routes from unauthenticated users
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Separate component to access auth context
const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        <ProtectedRoute redirectTo="/">
          <Login />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="devices" element={<WhatsAppDevices />} />
        <Route path="messages" element={<Messages />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="users" element={<Users />} />
      </Route>
      {/* Redirect authenticated users from /login to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
