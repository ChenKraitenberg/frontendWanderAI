import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/shared/Footer';
import PostService from '../services/post_service';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import heic2any from 'heic2any';

const AddPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    price: '',
    maxSeats: 1,
    bookedSeats: 0,
    image: null as File | null,
    destination: '',
    category: 'RELAXED' as 'RELAXED' | 'MODERATE' | 'INTENSIVE',
  });

  // Redirect if user info is not available
  useEffect(() => {
    if (!user || !user.name) {
      toast.error('Please complete your profile with a username before creating posts');
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewError(null);

      // Check if it's a HEIC/HEIF file
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type.includes('image/heic') || file.type.includes('image/heif');

      if (isHeic) {
        try {
          console.log('Converting HEIC/HEIF image for preview');
          // Convert HEIC to JPEG for preview only
          const jpegBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8,
          });

          // Create preview URL from the converted JPEG
          const fileURL = URL.createObjectURL(jpegBlob as Blob);
          setSelectedImages([fileURL]);
        } catch (error) {
          console.error('Error converting HEIC for preview:', error);
          setPreviewError('Unable to generate preview for this image type, but upload will still work.');

          // If conversion fails, try to show original
          try {
            const fileURL = URL.createObjectURL(file);
            setSelectedImages([fileURL]);
          } catch (e) {
            console.error('Could not create preview for this image:', e);
            setSelectedImages([]);
          }
        }
      } else {
        // Handle regular image formats as before
        const fileURL = URL.createObjectURL(file);
        setSelectedImages([fileURL]);
      }
    }
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.image) {
        throw new Error('Please select an image');
      }
      if (!formData.name || !formData.description) {
        throw new Error('Please fill in all required fields');
      }

      // Upload image
      const imageFormData = new FormData();
      imageFormData.append('image', formData.image);

      console.log('Uploading image...');
      const uploadResponse = await PostService.uploadImage(imageFormData);
      console.log('Image uploaded successfully:', uploadResponse);

      // Get current user ID
      const userId = localStorage.getItem('userId');
      console.log('User ID for new post:', userId);

      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      // Convert price string to number
      const numericPrice = formData.price === '' ? 0 : Number(formData.price);

      // Create post with user info
      const postData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        price: numericPrice,
        maxSeats: Number(formData.maxSeats),
        bookedSeats: 0,
        image: uploadResponse.url,
        userId: userId,
        owner: userId,
        destination: formData.destination,
        category: formData.category,
        // Add user information to be displayed with the post
        user: {
          _id: userId,
          email: user?.email || '',
          name: user?.name || '',
          avatar: user?.avatar || '',
        },
        createdAt: new Date(),
        likes: [],
        comments: [],
      };

      console.log('Creating post with data:', postData);
      const createdPost = await PostService.createPost(postData);
      console.log('Post created successfully:', createdPost);

      // Clean up any object URLs to prevent memory leaks
      selectedImages.forEach((url) => URL.revokeObjectURL(url));

      // Navigate back
      toast.success('Post created successfully!');
      navigate('/profile');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to create post:', error.message);
        toast.error(error.message);
      } else {
        console.error('Failed to create post:', error);
        toast.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      selectedImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

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
          <h1 className="display-4 fw-bold mb-3">Share Your Adventure</h1>
          <p className="lead opacity-90 mb-0">Tell us about your amazing trip!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5" style={{ marginTop: '-2rem' }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Image Upload Section */}
                  <div className="mb-4 text-center">
                    <label className="form-label d-block">
                      <div className="rounded-4 border-2 border-dashed p-4 mb-2" style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.02)' }}>
                        <div className="text-center">
                          <div className="display-6 mb-2">📸</div>
                          <p className="mb-1">Drop your photos here</p>
                          <p className="text-muted small">or click to select</p>
                        </div>
                        <input type="file" accept="image/*" className="d-none" onChange={handleImageChange} />
                      </div>
                    </label>

                    {/* Preview Error Message */}
                    {previewError && (
                      <div className="alert alert-warning mt-2 mb-0" role="alert">
                        {previewError}
                      </div>
                    )}

                    {/* Image Previews */}
                    {selectedImages.length > 0 && (
                      <div className="d-flex gap-2 flex-wrap mt-3">
                        {selectedImages.map((url, index) => (
                          <div key={index} className="rounded-3 overflow-hidden" style={{ width: '100px', height: '100px' }}>
                            <img src={url} alt={`Preview ${index + 1}`} className="w-100 h-100 object-fit-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trip Details */}
                  <div className="mb-4">
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      placeholder="Trip Name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      placeholder="Destination (e.g., Paris, France)"
                      value={formData.destination}
                      onChange={(e) => {
                        const value = e.target.value;
                        // תיקוף: מאפשר רק אותיות, רווחים, פסיקים ומקפים
                        if (value === '' || /^[A-Za-zא-ת\s,.'-]*$/.test(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            destination: value
                          }));
                        }
                      }}
                      required
                    />
                    <div className="form-text">Specify the location for better discovery (letters only)</div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        className="form-control form-control-lg rounded-pill"
                        value={formData.startDate.toISOString().split('T')[0]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: new Date(e.target.value) }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        className="form-control form-control-lg rounded-pill"
                        value={formData.endDate.toISOString().split('T')[0]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endDate: new Date(e.target.value) }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Price</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-pill"
                        placeholder="Price"
                        value={formData.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (/^[1-9][0-9]*$/.test(value) || value === '0')) {
                            setFormData((prev) => ({
                              ...prev,
                              price: value
                            }));
                          }
                        }}
                        style={{ 
                          WebkitAppearance: "none", 
                          MozAppearance: "textfield",
                          appearance: "textfield"
                        }}
                        required
                      />
                      <div className="form-text ps-2">Enter price in USD (numbers only)</div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Maximum Seats</label>
                      <input
                        type="number"
                        className="form-control form-control-lg rounded-pill"
                        placeholder="Max Seats"
                        value={formData.maxSeats}
                        onChange={(e) => setFormData((prev) => ({ ...prev, maxSeats: Number(e.target.value) }))}
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Trip Type</label>
                      <select
                        className="form-select form-select-lg rounded-pill"
                        value={formData.category}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as 'RELAXED' | 'MODERATE' | 'INTENSIVE' }))}>
                        <option value="RELAXED">Relaxed</option>
                        <option value="MODERATE">Moderate</option>
                        <option value="INTENSIVE">Intensive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Describe your trip..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn w-100 text-white rounded-pill py-3"
                    style={{ background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)', border: 'none' }}
                    disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating Trip...
                      </>
                    ) : (
                      'Create Trip'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddPost;
