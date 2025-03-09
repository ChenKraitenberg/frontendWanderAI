// src/components/SocialLoginButtons.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SocialLoginCredentials } from '../services/auth_service';
import { toast } from 'react-toastify';

// Helper function for error type guard
const isErrorWithResponse = (error: unknown): error is { response: { data: { message?: string } } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

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
  }
}

const SocialLoginButtons: React.FC = () => {
  const { socialLogin } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // State for username modal
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  interface SocialData {
    provider: 'google';
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
      script.src = 'https://accounts.google.com/gsi/client?hl=en'; // Force English
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    const isRegistrationPage = window.location.pathname.includes('register');

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
            text: isRegistrationPage ? 'signup_with' : 'signin_with', // Use sign up on registration page
          });
        }
      }
    };
    loadGoogleScript();

    // Cleanup scripts on unmount
    return () => {
      const googleScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (googleScript) {
        document.body.removeChild(googleScript);
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

      // Log email for debugging purposes
      console.log(`Google login with email: ${payload.email}`);

      // Store social login data to use after username is provided
      const socialData: SocialData = {
        provider: 'google',
        token: credential,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      };

      // Skip username prompt if email already exists in the system
      try {
        // Complete the social login process immediately
        await socialLogin(socialData);
        toast.success('Logged in with Google!');
        // Reset states
        setPendingSocialData(null);
        setUsername('');
        setUsernameError(null);
      } catch (error: unknown) {
        if (isErrorWithResponse(error) && error.response.data?.message === 'Username is required') {
          setPendingSocialData(socialData);
          setShowUsernameModal(true);
        } else if (isErrorWithResponse(error)) {
          console.error('Google sign-in error:', error);
          toast.error('Login failed: ' + (error.response.data?.message || 'An error occurred'));
        } else {
          console.error('Google sign-in error:', error);
          toast.error('Login failed: An error occurred');
        }
      }
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      toast.error('Google sign-in failed');
    } finally {
      setLoadingGoogle(false);
    }
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
      toast.success(`Logged in with ${pendingSocialData.provider.charAt(0).toUpperCase() + pendingSocialData.provider.slice(1)}!`);

      // Reset states
      setShowUsernameModal(false);
      setPendingSocialData(null);
      setUsername('');
      setUsernameError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Social login error:', error.message);
      } else {
        console.error('Social login error:', error);
      }
      toast.error('Login failed, please try again');
    } finally {
      setLoadingGoogle(false);
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
