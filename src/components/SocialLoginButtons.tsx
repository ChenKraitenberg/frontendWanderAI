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

interface SocialLoginButtonsProps {
  onLoginStart?: (email: string) => Promise<boolean>;
  showUsernamePrompt?: boolean;
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

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onLoginStart, showUsernamePrompt }) => {
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

  const isOnRegistrationPage = () => {
    return window.location.pathname.includes('register');
  };

  // Then replace your handleGoogleSignIn function with this implementation
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

      // If onLoginStart prop is provided, call it
      if (onLoginStart && payload.email) {
        try {
          const userExists = await onLoginStart(payload.email);

          // Different behavior based on whether user exists
          if (userExists) {
            // Handle existing user
          } else if (showUsernamePrompt) {
            // Show username modal for new users
            setPendingSocialData({
              provider: 'google',
              token: credential,
              email: payload.email,
              name: payload.name,
              avatar: payload.picture,
            });
            setShowUsernameModal(true);
          }
        } catch (error) {
          console.error('Error checking user existence:', error);
        }
      }

      console.log(`Google auth with email: ${payload.email}`);

      // Check if we're on registration page
      const onRegistrationPage = isOnRegistrationPage();
      console.log(`Current page is registration page: ${onRegistrationPage}`);

      try {
        // Explicitly check if the user exists
        const checkResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3060'}/auth/check-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: payload.email }),
        });

        const userCheckData = await checkResponse.json();
        const userExists = userCheckData.exists;

        console.log(`User exists check: ${userExists}`);

        if (userExists && onRegistrationPage) {
          // We're on registration but user already exists
          console.log('User already exists and we are on registration page');
          toast.error('An account with this email already exists. Please log in instead.');
          setLoadingGoogle(false);
          return;
        }

        if (!userExists && !onRegistrationPage) {
          // We're on login but no account exists
          console.log('User does not exist and we are on login page');
          toast.error('No account exists with this email. Please register first.');
          setLoadingGoogle(false);
          return;
        }

        // Create the socialData object
        const socialData: SocialLoginCredentials = {
          provider: 'google',
          token: credential,
          email: payload.email,
          name: payload.name,
          avatar: payload.picture,
        };

        if (!userExists) {
          // New user registration - show username dialog
          console.log('New user - showing username dialog');
          // Ensure email is not undefined for SocialData type requirement
          setPendingSocialData({
            ...socialData,
            email: payload.email || '',
            name: payload.name || '',
          });
          setShowUsernameModal(true);

          // Create a better default username from the Google name
          // Remove spaces, special characters, and ensure it's within limits
          const suggestedUsername = payload.name
            ? payload.name
                .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
                .substring(0, 20) // Limit length
            : '';

          setUsername(suggestedUsername);
        } else {
          // Existing user login - proceed directly
          console.log('Existing user - proceeding with login');
          await socialLogin(socialData);
          toast.success('Logged in with Google!');
        }
      } catch (error) {
        console.error('Error in user existence check:', error);

        // Fallback behavior - try to proceed with login/registration
        // and let the server handle it
        try {
          const socialData: SocialLoginCredentials = {
            provider: 'google',
            token: credential,
            email: payload.email,
            name: payload.name,
            avatar: payload.picture,
          };

          // If server returns "username required" we know it's a new user
          await socialLogin(socialData);
          toast.success('Authentication successful!');
        } catch (socialError: unknown) {
          console.error('Social login error:', socialError);

          if (isErrorWithResponse(socialError) && socialError.response.data?.message === 'Username is required') {
            // This is a new user, show username dialog
            // Make sure email is defined to satisfy SocialData type requirements
            const socialData: SocialData = {
              provider: 'google',
              token: credential,
              email: payload.email || '', // Ensure email is never undefined
              name: payload.name || '', // Ensure name is never undefined
              avatar: payload.picture,
            };
            setPendingSocialData(socialData);
            setShowUsernameModal(true);
          } else {
            // Some other error
            toast.error('Authentication failed. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Google sign-in failed. Please try again later.');
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
