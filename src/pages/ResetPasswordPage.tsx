// src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Link, useParams, useNavigate } from 'react-router-dom';
import authService from '../services/auth_service';

interface FormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const password = watch('password');

  // Validate token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error('Invalid reset link');
        navigate('/forgot-password');
        return;
      }

      try {
        await authService.validateResetToken(token);
        setTokenValid(true);
      } catch (error) {
        console.error('Invalid or expired token:', error);
        toast.error('This password reset link is invalid or has expired.');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;

    try {
      setLoading(true);
      await authService.resetPassword(token, data.password);
      setResetSuccess(true);
      toast.success('Your password has been reset successfully!');
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
          <h1 className="display-4 fw-bold mb-3">Reset Your Password</h1>
          <p className="lead opacity-90 mb-0">Create a new secure password</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5" style={{ marginTop: '-2rem' }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4">
                {!tokenValid ? (
                  <div className="text-center py-5">
                    <div className="display-6 mb-4">⚠️</div>
                    <h2 className="h4 fw-bold mb-3">Invalid or Expired Link</h2>
                    <p className="mb-4">The password reset link you clicked is invalid or has expired.</p>
                    <div className="d-flex justify-content-center">
                      <Link to="/forgot-password" className="btn btn-primary rounded-pill px-4">
                        Request New Link
                      </Link>
                    </div>
                  </div>
                ) : resetSuccess ? (
                  <div className="text-center py-5">
                    <div className="display-6 mb-4">✅</div>
                    <h2 className="h4 fw-bold mb-3">Password Reset Successful!</h2>
                    <p className="mb-4">Your password has been reset successfully. You can now log in with your new password.</p>
                    <div className="d-flex justify-content-center">
                      <Link to="/login" className="btn btn-primary rounded-pill px-4">
                        Go to Login
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="display-6 mb-2">🔒</div>
                      <h2 className="h4 fw-bold">Create New Password</h2>
                      <p className="text-muted">Your new password must be different from previous passwords</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="mb-4">
                        <label className="form-label">New Password</label>
                        <input
                          {...register('password', {
                            required: 'Password is required',
                            minLength: {
                              value: 8,
                              message: 'Password must be at least 8 characters',
                            },
                          })}
                          type="password"
                          className={`form-control form-control-lg rounded-pill ${errors.password ? 'is-invalid' : ''}`}
                          placeholder="Enter new password"
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Confirm Password</label>
                        <input
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === password || 'The passwords do not match',
                          })}
                          type="password"
                          className={`form-control form-control-lg rounded-pill ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          placeholder="Confirm new password"
                        />
                        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                      </div>

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
                            Resetting Password...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
