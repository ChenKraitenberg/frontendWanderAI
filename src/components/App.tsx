import React from 'react';
import { 
  //BrowserRouter, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from '../pages/LoginForm';
import RegistrationForm from '../pages/RegistrationForm';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import Homepage from '../pages/HomePage';
import Profile from '../pages/profilePage';
import GenerateTrip from '../pages/GenerateTripPage';
import SharePost from '../pages/AddPost';
import EditPostPage from '../pages/EditPostPage';
import { useAuth } from '../context/AuthContext';
import AuthProvider from '../context/AuthProvider';
import PostDetailPage from '../pages/PostDetailPage';
import NavigationBar from './NavigationBar';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/visual-enhancements.css';
import ScrollRestoration from './ScrollRestoration';

// Protected route component using the AuthContext
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // If user has no name set, redirect to profile to prompt them to set one
  if (isAuthenticated && user && !user.name) {
    return <Navigate to="/profile" />;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Main App component
const AppRoutes = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate-trip"
          element={
            <ProtectedRoute>
              <GenerateTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-post"
          element={
            <ProtectedRoute>
              <SharePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-post/:id"
          element={
            <ProtectedRoute>
              <EditPostPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      
      {/* Display Navigation Bar only when user is authenticated */}
      {isAuthenticated && <NavigationBar />}
    </>
  );
};

// App wrapper with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <ScrollRestoration />
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;