// src/pages/RegistrationForm.tsx
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import SocialLoginButtons from '../components/SocialLoginButtons';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user_service';

interface FormData {
  email: string;
  password: string;
  name: string; // This will be the username/nickname
  img?: FileList;
}

const RegistrationForm: FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, loading: authLoading, error: authError } = useAuth();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [img] = watch(['img']);
  const inputFileRef: { current: HTMLInputElement | null } = { current: null };

  // Handle image upload
  useEffect(() => {
    const uploadImage = async () => {
      if (img?.[0]) {
        try {
          setSelectedImage(img[0]);
          setImageUploading(true);

          // Upload the image
          const uploadResponse = await userService.uploadProfileImage(img[0]);
          setUploadedImageUrl(uploadResponse.url);
        } catch (error) {
          console.error('Failed to upload profile image:', error);
        } finally {
          setImageUploading(false);
        }
      }
    };

    if (img?.[0]) {
      uploadImage();
    }
  }, [img]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Register with auth context
      await registerUser(data.email, data.password, data.name, uploadedImageUrl || undefined);

      // Navigation is handled by the useEffect that watches isAuthenticated
    } catch (error) {
      console.error('Registration form error:', error);
      // Auth context already shows error toast
    } finally {
      setLoading(false);
    }
  };

  const { ref, ...restRegisterParams } = register('img');

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
          <h1 className="display-4 fw-bold mb-3">Join Our Community</h1>
          <p className="lead opacity-90 mb-0">Start sharing your travel experiences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5" style={{ marginTop: '-2rem' }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Show auth error if present */}
                  {authError && (
                    <div className="alert alert-danger" role="alert">
                      {authError}
                    </div>
                  )}

                  {/* Profile Image Section */}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block" style={{ cursor: 'pointer' }} onClick={() => inputFileRef.current?.click()}>
                      <div
                        className="rounded-circle mb-3 mx-auto position-relative"
                        style={{
                          width: '120px',
                          height: '120px',
                          backgroundImage: selectedImage ? `url(${URL.createObjectURL(selectedImage)})` : 'url(/api/placeholder/120/120)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '4px solid white',
                          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                        }}>
                        {imageUploading && (
                          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 rounded-circle">
                            <div className="spinner-border text-light" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="position-absolute bottom-0 end-0 bg-white rounded-circle p-2 shadow-sm" style={{ transform: 'translate(20%, 20%)' }}>
                        📸
                      </div>
                    </div>
                    <input
                      ref={(item) => {
                        inputFileRef.current = item;
                        ref(item);
                      }}
                      {...restRegisterParams}
                      type="file"
                      accept="image/png, image/jpeg"
                      style={{ display: 'none' }}
                    />
                    <p className="text-muted small">Click to upload profile picture</p>
                  </div>

                  {/* Form Fields */}
                  <div className="mb-4">
                    <label className="form-label">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      {...register('name', {
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters',
                        },
                        maxLength: {
                          value: 30,
                          message: 'Username must be less than 30 characters',
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9._-]+$/,
                          message: 'Username can only contain letters, numbers, and ._-',
                        },
                      })}
                      type="text"
                      className={`form-control form-control-lg rounded-pill ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Choose a username"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                    <div className="form-text">This name will be visible to others when you post or comment</div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
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

                  <div className="mb-4">
                    <label className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
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
                      placeholder="Create a password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 text-white rounded-pill py-3 mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
                      border: 'none',
                    }}
                    disabled={loading || authLoading || imageUploading}>
                    {loading || authLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating your account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  {/* Social Login Options */}
                  <div className="mb-4">
                    <div className="text-center mb-3">
                      <p className="text-muted">Or sign up with</p>
                    </div>
                    <SocialLoginButtons />
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">
                      Already have an account?{' '}
                      <Link to="/login" className="text-decoration-none">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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

export default RegistrationForm;
