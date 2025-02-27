// Login.tsx
import { useNavigate } from 'react-router-dom';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import userService from '../services/user_service';

interface FormData {
  email: string;
  password: string;
}

const LoginForm: FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { request } = userService.login(data.email, data.password); // חילוץ ה-request
      const response = await request; // מחכה לפתרון ה-Promise
      console.log('Login response:', response.data);
      // שמירת הטוקן
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userId', response.data._id);

      // עדכון מצב
      onLoginSuccess();

      // ניווט לדף הבית
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Wrong email or password');
    } finally {
      setLoading(false);
    }
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
                  {/* Email Field */}
                  <div className="mb-4">
                    <label className="form-label">Email</label>
                    <input
                      {...register('email', {
                        required: true,
                        pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      })}
                      type="email"
                      className={`form-control form-control-lg rounded-pill ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter your email"
                    />
                    {errors.email && <div className="invalid-feedback">Please enter a valid email address</div>}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between">
                      <label className="form-label">Password</label>
                      <a href="/forgot-password" className="text-decoration-none small">
                        Forgot password?
                      </a>
                    </div>
                    <input
                      {...register('password', { required: true })}
                      type="password"
                      className={`form-control form-control-lg rounded-pill ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Enter your password"
                    />
                    {errors.password && <div className="invalid-feedback">Password is required</div>}
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="btn w-100 text-white rounded-pill py-3 mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
                      border: 'none',
                    }}
                    disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  {/* Social Login Options */}
                  <div className="text-center mb-4">
                    <p className="text-muted small mb-4">Or continue with</p>
                    <div className="d-flex justify-content-center gap-3">
                      <button type="button" className="btn btn-light rounded-circle p-3">
                        <span style={{ fontSize: '1.2rem' }}>🌐</span>
                      </button>
                      <button type="button" className="btn btn-light rounded-circle p-3">
                        <span style={{ fontSize: '1.2rem' }}>📱</span>
                      </button>
                    </div>
                  </div>

                  {/* Registration Link */}
                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Don't have an account?{' '}
                      <a href="/register" className="text-decoration-none">
                        Sign up
                      </a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <footer className="py-3 bg-white border-top mt-auto">
        <div className="container">
          <div className="row justify-content-around align-items-center g-3">
            {[
              { icon: '🏠', label: 'Home' },
              { icon: '🔍', label: 'Search' },
              { icon: '❤️', label: 'Favorites' },
              { icon: '👤', label: 'Profile' },
            ].map((item, index) => (
              <div key={index} className="col-3 text-center">
                <button className="btn btn-link text-dark p-0 d-flex flex-column align-items-center gap-1 text-decoration-none">
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <small className="text-muted">{item.label}</small>
                </button>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm;
