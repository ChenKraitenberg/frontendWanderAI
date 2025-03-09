// // src/pages/LoginForm.tsx
// import { useNavigate, Link } from 'react-router-dom';
// import { FC, useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import SocialLoginButtons from '../components/SocialLoginButtons';
// import { useAuth } from '../context/AuthContext';

// interface FormData {
//   email: string;
//   password: string;
// }

// const LoginForm: FC = () => {
//   const navigate = useNavigate();
//   const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();
//   const [loading, setLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormData>();

//   // Redirect if already authenticated
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/');
//     }
//   }, [isAuthenticated, navigate]);

//   const onSubmit = async (data: FormData) => {
//     try {
//       setLoading(true);
//       await login(data.email, data.password);
//       // Navigation is handled by the useEffect that watches isAuthenticated
//     } catch (error) {
//       console.error('Login form error:', error);
//       // Auth context already shows error toast
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-vh-100 d-flex flex-column bg-light">
//       {/* Header */}
//       <div
//         className="position-relative py-5"
//         style={{
//           background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
//           borderRadius: '0 0 25px 25px',
//         }}>
//         <div className="container text-center text-white">
//           <h1 className="display-4 fw-bold mb-3">Welcome Back</h1>
//           <p className="lead opacity-90 mb-0">Login to access your travel experiences</p>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container py-5" style={{ marginTop: '-2rem' }}>
//         <div className="row justify-content-center">
//           <div className="col-md-8 col-lg-6">
//             <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
//               <div className="card-body p-4">
//                 {/* Welcome Message */}
//                 <div className="text-center mb-4">
//                   <div className="display-6 mb-2">👋</div>
//                   <h2 className="h4 fw-bold">Sign In</h2>
//                   <p className="text-muted">Let's continue your journey</p>
//                 </div>

//                 <form onSubmit={handleSubmit(onSubmit)}>
//                   {/* Show auth error if present */}
//                   {authError && (
//                     <div className="alert alert-danger" role="alert">
//                       {authError}
//                     </div>
//                   )}

//                   {/* Email Field */}
//                   <div className="mb-4">
//                     <label className="form-label">Email</label>
//                     <input
//                       {...register('email', {
//                         required: 'Email is required',
//                         pattern: {
//                           value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                           message: 'Please enter a valid email address',
//                         },
//                       })}
//                       type="email"
//                       className={`form-control form-control-lg rounded-pill ${errors.email ? 'is-invalid' : ''}`}
//                       placeholder="Enter your email"
//                     />
//                     {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
//                   </div>

//                   {/* Password Field */}
//                   <div className="mb-4">
//                     <div className="d-flex justify-content-between">
//                       <label className="form-label">Password</label>
//                       <Link to="/forgot-password" className="text-decoration-none small">
//                         Forgot password?
//                       </Link>
//                     </div>
//                     <input
//                       {...register('password', {
//                         required: 'Password is required',
//                         minLength: {
//                           value: 6,
//                           message: 'Password must be at least 6 characters',
//                         },
//                       })}
//                       type="password"
//                       className={`form-control form-control-lg rounded-pill ${errors.password ? 'is-invalid' : ''}`}
//                       placeholder="Enter your password"
//                     />
//                     {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
//                   </div>

//                   {/* Login Button */}
//                   <button
//                     type="submit"
//                     className="btn w-100 text-white rounded-pill py-3 mb-4"
//                     style={{
//                       background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
//                       border: 'none',
//                     }}
//                     disabled={loading || authLoading}>
//                     {loading || authLoading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                         Signing in...
//                       </>
//                     ) : (
//                       'Sign In'
//                     )}
//                   </button>

//                   {/* Social Login Options */}
//                   <div className="mb-4">
//                     <div className="text-center mb-3">
//                       <p className="text-muted">Or continue with</p>
//                     </div>
//                     <SocialLoginButtons />
//                   </div>

//                   {/* Registration Link */}
//                   <div className="text-center">
//                     <p className="text-muted mb-0">
//                       Don't have an account?{' '}
//                       <Link to="/register" className="text-decoration-none">
//                         Sign up
//                       </Link>
//                     </p>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;
// src/pages/LoginForm.tsx
import { useNavigate, Link } from 'react-router-dom';
import { FC, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SocialLoginButtons from '../components/SocialLoginButtons';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth_service';

interface FormData {
  email: string;
  password: string;
}

const LoginForm: FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      // Navigation is handled by the useEffect that watches isAuthenticated
    } catch (error) {
      console.error('Login form error:', error);
      // Auth context already shows error toast
    } finally {
      setLoading(false);
    }
  };

  // Function to check if a user exists
  const checkUserExists = async (email: string) => {
    try {
      // First try to use a direct API endpoint if you have one
      const response = await authService.checkIfUserExists(email);
      return response.exists;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      // Default to false (assume new user) if there's an error
      return false;
    }
  };

  // Pass this function to SocialLoginButtons
  const handleSocialLoginStart = async (email: string) => {
    const exists = await checkUserExists(email);
    setIsNewUser(!exists);
    // The social login buttons component can use this to determine
    // whether to show the username selection
    return exists;
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Header */}
      <div
        className="position-relative py-5"
        style={{
          background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
          borderRadius: '0 0 25px 25px',
        }}>
        <div className="container text-center text-white">
          <h1 className="display-4 fw-bold mb-3">Welcome Back</h1>
          <p className="lead opacity-90 mb-0">Login to access your travel experiences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5" style={{ marginTop: '-2rem' }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4">
                {/* Welcome Message */}
                <div className="text-center mb-4">
                  <div className="display-6 mb-2">👋</div>
                  <h2 className="h4 fw-bold">Sign In</h2>
                  <p className="text-muted">Let's continue your journey</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Show auth error if present */}
                  {authError && (
                    <div className="alert alert-danger" role="alert">
                      {authError}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="mb-4">
                    <label className="form-label">Email</label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address',
                        },
                      })}
                      type="email"
                      className={`form-control form-control-lg rounded-pill ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter your email"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between">
                      <label className="form-label">Password</label>
                      <Link to="/forgot-password" className="text-decoration-none small">
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      type="password"
                      className={`form-control form-control-lg rounded-pill ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Enter your password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="btn w-100 text-white rounded-pill py-3 mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
                      border: 'none',
                    }}
                    disabled={loading || authLoading}>
                    {loading || authLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  {/* Social Login Options */}
                  <div className="mb-4">
                    <div className="text-center mb-3">
                      <p className="text-muted">Or continue with</p>
                    </div>
                    <SocialLoginButtons onLoginStart={handleSocialLoginStart} showUsernamePrompt={isNewUser} />
                  </div>

                  {/* Registration Link */}
                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-decoration-none">
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
