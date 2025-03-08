// src/components/SocialLoginButtons.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SocialLoginCredentials } from '../services/auth_service';

// Types for Google Sign-In
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

// Types for Facebook SDK
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

// Extending window interface
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

  // State for username modal
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  interface SocialData {
    provider: 'google' | 'facebook';
    token: string;
    email: string;
    name: string;
    avatar?: string;
  }

  const [pendingSocialData, setPendingSocialData] = useState<SocialData | null>(null);

  // Initialize Google Sign-In
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

    // Initialize Facebook SDK
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

    // Cleanup scripts on unmount
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

  // Handle Google sign-in
  const handleGoogleSignIn = async (response: GoogleCredentialResponse) => {
    try {
      setLoadingGoogle(true);
      const { credential } = response;

      if (!credential) {
        throw new Error('Google authentication failed');
      }

      // Parse JWT to get user info
      const tokenParts = credential.split('.');
      const payload: GooglePayload = JSON.parse(atob(tokenParts[1]));

      // Store social login data to use after username is provided
      const socialData: SocialData = {
        provider: 'google',
        token: credential,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      };

      // Show username modal
      setPendingSocialData(socialData);
      setShowUsernameModal(true);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setLoadingGoogle(false);
    }
  };

  // Handle Facebook login
  const handleFacebookLogin = () => {
    if (!window.FB) {
      console.error('Facebook SDK not loaded');
      return;
    }

    setLoadingFacebook(true);

    window.FB.login(
      (response: FBLoginResponse) => {
        if (response.authResponse) {
          // Get user info
          window.FB?.api('/me', 'GET', { fields: 'name,email,picture' }, async (userInfo: FBUserInfo) => {
            try {
              // Store social login data to use after username is provided
              const socialData: SocialData = {
                provider: 'facebook',
                token: response.authResponse!.accessToken,
                email: userInfo.email,
                name: userInfo.name,
                avatar: userInfo.picture?.data?.url,
              };

              // Show username modal
              setPendingSocialData(socialData);
              setShowUsernameModal(true);
            } catch (error) {
              console.error('Facebook login error:', error);
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

  // Handle username submission
  const handleUsernameSubmit = async () => {
    // Validate username
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 30) {
      setUsernameError('Username must be less than 30 characters');
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and ._-');
      return;
    }

    try {
      // Update the social login data with the provided username
      if (!pendingSocialData) {
        throw new Error('Pending social data is missing');
      }

      const socialLoginData: SocialLoginCredentials = {
        ...pendingSocialData,
        name: username,
        provider: pendingSocialData.provider, // Ensure provider is always defined
      };

      // Complete the social login process
      await socialLogin(socialLoginData);

      // Reset states
      setShowUsernameModal(false);
      setPendingSocialData(null);
      setUsername('');
      setUsernameError(null);
    } catch (error) {
      console.error('Social login error:', error);
    } finally {
      setLoadingGoogle(false);
      setLoadingFacebook(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Google Sign-In Button */}
      <div id="google-signin-button" className={`google-btn mx-auto ${loadingGoogle ? 'opacity-50' : ''}`} style={{ position: 'relative', minHeight: '40px' }}>
        {loadingGoogle && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 rounded">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Facebook Login Button */}
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

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Choose a Username</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowUsernameModal(false);
                    setLoadingGoogle(false);
                    setLoadingFacebook(false);
                    setPendingSocialData(null);
                  }}
                />
              </div>
              <div className="modal-body py-4">
                <p>Please choose a username that will be displayed when you post or comment.</p>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className={`form-control form-control-lg rounded-pill ${usernameError ? 'is-invalid' : ''}`}
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameError(null);
                    }}
                  />
                  <div className="form-text">Your username must be 3-30 characters long and can contain letters, numbers, and ._-</div>
                  {usernameError && <div className="invalid-feedback">{usernameError}</div>}
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => {
                    setShowUsernameModal(false);
                    setLoadingGoogle(false);
                    setLoadingFacebook(false);
                    setPendingSocialData(null);
                  }}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn text-white rounded-pill px-4"
                  style={{
                    background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
                    border: 'none',
                  }}
                  onClick={handleUsernameSubmit}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialLoginButtons;
