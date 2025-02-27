// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginForm from '../pages/LoginForm';
import RegistrationForm from '../pages/RegistrationForm';
import Homepage from '../pages/HomePage';
import Profile from '../pages/profilePage';
import GenerateTrip from '../pages/GenerateTripPage';
import SharePost from '../pages/AddPost';
import 'leaflet/dist/leaflet.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('accessToken') !== null);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // מצב ביניים בזמן טעינה
  }

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<RegistrationForm onRegisterSuccess={() => setIsAuthenticated(true)} />} />

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

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
