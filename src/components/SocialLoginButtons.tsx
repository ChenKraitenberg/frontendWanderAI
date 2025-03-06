// src/components/SocialLoginButtons.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SocialLoginCredentials } from '../services/auth_service';

// ======== טיפוסים עבור Google Sign-In ========
interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleButtonOptions {
  theme: string;
  size: string;
  width?: number;
  text?: string;
}

interface GoogleSignInConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GooglePayload {
  email: string;
  name: string;
  picture: string;
}

// ======== טיפוסים עבור Facebook SDK ========
interface FBInitOptions {
  appId: string;
  cookie: boolean;
  xfbml: boolean;
  version: string;
}

interface FBLoginOptions {
  scope: string;
}

interface FBAuthResponse {
  accessToken: string;
}

interface FBLoginResponse {
  authResponse: FBAuthResponse | null;
  status: string;
}

interface FBUserInfo {
  name: string;
  email: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
}

// ======== הרחבת ממשק החלון הגלובלי ========
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleSignInConfig) => void;
          renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
          prompt: () => void;
        };
      };
    };
    FB?: {
      init: (options: FBInitOptions) => void;
      login: (callback: (response: FBLoginResponse) => void, options: FBLoginOptions) => void;
      api: (path: string, method: string, params: Record<string, unknown>, callback: (response: FBUserInfo) => void) => void;
    };
  }
}

const SocialLoginButtons: React.FC = () => {
  const { socialLogin } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);

  // אתחול Google Sign-In
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });

        const googleButtonDiv = document.getElementById('google-signin-button');
        if (googleButtonDiv) {
          window.google.accounts.id.renderButton(googleButtonDiv, {
            theme: 'outline',
            size: 'large',
            width: 250,
            text: 'continue_with',
          });
        }
      }
    };

    loadGoogleScript();

    // אתחול Facebook SDK
    const loadFacebookScript = () => {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onload = initializeFacebookSDK;
      document.body.appendChild(script);
    };

    const initializeFacebookSDK = () => {
      if (window.FB) {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v16.0',
        });
      }
    };

    loadFacebookScript();

    // ניקוי סקריפטים בעת unmount
    return () => {
      const googleScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (googleScript) {
        document.body.removeChild(googleScript);
      }

      const facebookScript = document.querySelector('script[src="https://connect.facebook.net/en_US/sdk.js"]');
      if (facebookScript) {
        document.body.removeChild(facebookScript);
      }
    };
  }, []);

  // טיפול בכניסה עם Google
  const handleGoogleSignIn = async (response: GoogleCredentialResponse) => {
    try {
      setLoadingGoogle(true);
      const { credential } = response;

      if (!credential) {
        throw new Error('Google authentication failed');
      }

      // ניתוח ה-JWT לקבלת פרטי המשתמש
      const tokenParts = credential.split('.');
      const payload: GooglePayload = JSON.parse(atob(tokenParts[1]));

      const socialLoginData: SocialLoginCredentials = {
        provider: 'google',
        token: credential,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      };

      await socialLogin(socialLoginData);
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setLoadingGoogle(false);
    }
  };

  // טיפול בכניסה עם Facebook
  const handleFacebookLogin = () => {
    if (!window.FB) {
      console.error('Facebook SDK not loaded');
      return;
    }

    setLoadingFacebook(true);

    window.FB.login(
      (response: FBLoginResponse) => {
        if (response.authResponse) {
          // שליפת פרטי המשתמש
          window.FB?.api('/me', 'GET', { fields: 'name,email,picture' }, async (userInfo: FBUserInfo) => {
            try {
              const socialLoginData: SocialLoginCredentials = {
                provider: 'facebook',
                token: response.authResponse!.accessToken,
                email: userInfo.email,
                name: userInfo.name,
                avatar: userInfo.picture?.data?.url,
              };

              await socialLogin(socialLoginData);
            } catch (error) {
              console.error('Facebook login error:', error);
            } finally {
              setLoadingFacebook(false);
            }
          });
        } else {
          console.error('User cancelled login or did not fully authorize.');
          setLoadingFacebook(false);
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* כפתור כניסה עם Google */}
      <div id="google-signin-button" className={`google-btn mx-auto ${loadingGoogle ? 'opacity-50' : ''}`} style={{ position: 'relative', minHeight: '40px' }}>
        {loadingGoogle && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 rounded">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* כפתור כניסה עם Facebook */}
      <button
        type="button"
        onClick={handleFacebookLogin}
        disabled={loadingFacebook}
        className="btn rounded-pill mx-auto px-4 py-2"
        style={{
          backgroundColor: '#1877F2',
          color: 'white',
          border: 'none',
          position: 'relative',
          minWidth: '250px',
        }}>
        {loadingFacebook ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ) : (
          <>
            <i className="bi bi-facebook me-2"></i>
            Continue with Facebook
          </>
        )}
      </button>
    </div>
  );
};

export default SocialLoginButtons;
