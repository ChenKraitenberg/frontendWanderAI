// src/components/LogoutButton.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
interface LogoutButtonProps {
  variant?: 'primary' | 'outline' | 'text';
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ variant = 'outline', className = '' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Apply styles based on variant
  let buttonStyle = {};

  if (variant === 'primary') {
    buttonStyle = {
      background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
      color: 'white',
      border: 'none',
    };
  } else if (variant === 'outline') {
    buttonStyle = {
      background: 'transparent',
      color: '#C850C0',
      border: '1px solid #C850C0',
    };
  } else if (variant === 'text') {
    buttonStyle = {
      background: 'transparent',
      color: '#C850C0',
      border: 'none',
    };
  }

  return (
    <button className={`btn rounded-pill ${className}`} style={buttonStyle} onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Logging out...
        </>
      ) : (
        'Logout'
      )}
    </button>
  );
};

export default LogoutButton;
