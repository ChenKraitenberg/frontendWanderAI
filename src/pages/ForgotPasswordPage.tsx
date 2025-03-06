// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import authService from '../services/auth_service';

interface FormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await authService.requestPasswordReset(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Failed to send reset email:', error);
      toast.error('Failed to send reset email. Please try again.');
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
          <h1 className="display-4 fw-bold mb-3">Reset Your Password</h1>
          <p className="lead opacity-90 mb-0">We'll send you a link to reset your password</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5" style={{ marginTop: '-2rem' }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4">
                {emailSent ? (
                  <div className="text-center py-5">
                    <div className="display-6 mb-4">📧</div>
                    <h2 className="h4 fw-bold mb-3">Email Sent!</h2>
                    <p className="mb-4">We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.</p>
                    <p className="small text-muted mb-4">If you don't receive an email within a few minutes, please check your spam folder or try again.</p>
                    <div className="d-flex justify-content-center">
                      <Link to="/login" className="btn btn-outline-secondary rounded-pill px-4">
                        Back to Login
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="display-6 mb-2">🔑</div>
                      <h2 className="h4 fw-bold">Forgot Your Password?</h2>
                      <p className="text-muted">Enter your email to receive a password reset link</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="mb-4">
                        <label className="form-label">Email Address</label>
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
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>

                      <div className="text-center">
                        <p className="text-muted mb-0">
                          Remember your password?{' '}
                          <Link to="/login" className="text-decoration-none">
                            Sign in
                          </Link>
                        </p>
                      </div>
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

export default ForgotPasswordPage;
