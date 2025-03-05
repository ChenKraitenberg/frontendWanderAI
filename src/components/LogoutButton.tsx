// src/components/LogoutButton.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/user_service';
import { toast } from 'react-toastify';

interface LogoutButtonProps {
  variant?: 'primary' | 'outline' | 'text';
  className?: string;
}

interface LogoutButtonProps {
  variant?: 'primary' | 'outline' | 'text';
  className?: string;
  localOnly?: boolean; // הוספת פרמטר חדש להתנתקות מקומית בלבד
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'outline',
  className = '',
  localOnly = false, // ברירת המחדל היא לנסות גם התנתקות מהשרת
}) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // אם אנחנו לא במצב של התנתקות מקומית בלבד, ננסה להתנתק מהשרת
      if (!localOnly) {
        // נשיג את ה-refreshToken מה-localStorage
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          try {
            // ננסה להתנתק מהשרת
            const { request } = userService.logout(refreshToken);
            await request;
            toast.success('התנתקת בהצלחה');
          } catch (error) {
            console.error('Failed to logout from server:', error);
            // אפילו אם יש שגיאה בשרת, נמשיך בתהליך ההתנתקות המקומי
          }
        }
      }

      // בכל מקרה, ננקה את המידע המקומי
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');

      // אם אנחנו במצב של התנתקות מקומית בלבד, נציג הודעה מתאימה
      if (localOnly) {
        toast.success('התנתקת בהצלחה (מקומית)');
      }

      // ניתוב לדף הכניסה
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error('שגיאה בהתנתקות, נסה שוב');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // סגנונות בהתאם לוריאנט שנבחר
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
          מתנתק...
        </>
      ) : (
        'Logout'
      )}
    </button>
  );
};

export default LogoutButton;
