// RegisteringForm.tsx
import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import userService, { User } from '../services/user_service';
import { useNavigate } from 'react-router-dom';

interface FormData {
  email: string;
  password: string;
  name: string;
  img?: FileList;
}

// הגדרת הפרופס שכולל את onRegisterSuccess
interface RegistrationFormProps {
  onRegisterSuccess: () => void;
}

const RegistrationForm: FC<RegistrationFormProps> = ({ onRegisterSuccess }) => {
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const [img] = watch(['img']);
  const inputFileRef: { current: HTMLInputElement | null } = { current: null };

  // הרגע שבו המשתמש לוחץ על כפתור הרישום
  // בתוך onSubmit בטופס הרשמה (RegistrationForm.tsx)
  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      let avatarUrl = null;

      // העלאת תמונה אם נבחרה
      if (data.img && data.img.length > 0) {
        try {
          // העלאת התמונה לשרת
          const uploadResponse = await userService.uploadProfileImage(data.img[0]);
          avatarUrl = uploadResponse.url;
          console.log('Image uploaded successfully, URL:', avatarUrl);
        } catch (error) {
          console.error('Failed to upload profile image:', error);
          // ממשיכים עם הרשמה גם אם העלאת התמונה נכשלה
        }
      }

      // רישום המשתמש
      const user: User = {
        email: data.email,
        password: data.password,
        name: data.name,

        avatar: avatarUrl, // הוספת URL התמונה לאובייקט המשתמש
      };

      console.log('Registering user with data:', { ...user, password: '***' });

      const { request: registerRequest } = await userService.register(user);
      const registerResponse = await registerRequest;

      localStorage.setItem('accessToken', registerResponse.data.token);
      if (registerResponse.data.user._id) {
        localStorage.setItem('userId', registerResponse.data.user._id);
      }

      onRegisterSuccess();
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (img?.[0]) {
      setSelectedImage(img[0]);
    }
  }, [img]);

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
                  {/* Profile Image Section */}
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block" style={{ cursor: 'pointer' }} onClick={() => inputFileRef.current?.click()}>
                      <div
                        className="rounded-circle mb-3 mx-auto"
                        style={{
                          width: '120px',
                          height: '120px',
                          backgroundImage: selectedImage ? `url(${URL.createObjectURL(selectedImage)})` : 'url(/api/placeholder/120/120)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '4px solid white',
                          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                        }}
                      />
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
                    <label className="form-label">Full Name</label>
                    <input
                      {...register('name', { required: true })}
                      type="text"
                      className={`form-control form-control-lg rounded-pill ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <div className="invalid-feedback">Name is required</div>}
                  </div>

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
                    {errors.email && <div className="invalid-feedback">Please enter a valid email</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Password</label>
                    <input
                      {...register('password', {
                        required: true,
                        minLength: 6,
                      })}
                      type="password"
                      className={`form-control form-control-lg rounded-pill ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Create a password"
                    />
                    {errors.password && <div className="invalid-feedback">Password must be at least 6 characters</div>}
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 text-white rounded-pill py-3"
                    style={{
                      background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
                      border: 'none',
                    }}
                    disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating your account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">
                      Already have an account?{' '}
                      <a href="/login" className="text-decoration-none">
                        Sign in
                      </a>
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

export default RegistrationForm;
