// src/pages/EditPostPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import postService from '../services/post_service';
import { Post } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import Footer from '../components/shared/Footer';
import apiClient from '../services/api-client';

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Post>>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    price: 0,
    //maxSeats: 1,
    destination: '',
    category: 'RELAXED' as 'RELAXED' | 'MODERATE' | 'INTENSIVE',
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log(`Fetching post with ID: ${id}`);
        const post = await postService.getPostById(id);
        console.log('Post fetched for editing:', post);

        // Format dates for form inputs
        const formattedStartDate = post.startDate ? new Date(post.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const formattedEndDate = post.endDate ? new Date(post.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        const postTitle = post.title || post.name || '';

        setFormData({
          ...post,
          title: postTitle,
          name: postTitle,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          price: post.price || 0,
        });

        if (post.image) {
          setImagePreview(getImageUrl(post.image));
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
        toast.error('Failed to load post data');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      
      // If updating title field, also update name field (and vice versa)
      if (name === 'title') {
        updatedData.name = value;
      } else if (name === 'name') {
        updatedData.title = value;
      }
      
      return updatedData;
    });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // In EditPostPage.tsx - updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);

      let updatedImageUrl = formData.image;

      // If a new image was selected, upload it first
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', selectedImage);

        console.log('Uploading image for post update...');

        // Use apiClient directly for more control
        const uploadResponse = await apiClient.post('/file/upload', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log('Upload response:', uploadResponse);
        updatedImageUrl = uploadResponse.data.url;
        console.log('New image URL:', updatedImageUrl);
      }

      // Update the post with new data
      const updatedPostData = {
        ...formData,
        title: formData.title || formData.name,
        name: formData.name || formData.title,
        image: updatedImageUrl,
        startDate: (formData.startDate as string) || '',
        endDate: (formData.endDate as string) || '',
        price: formData.price,
        comments: undefined,
      };

      console.log('Updating post with data:', updatedPostData);
      await postService.updatePost(id, updatedPostData);
      toast.success('Post updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <h1 className="display-4 fw-bold mb-3">Edit Your Trip</h1>
          <p className="lead opacity-90 mb-0">Update your adventure details</p>
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
                      <div
                        className="rounded-4 border-2 border-dashed p-4 mb-2"
                        style={{
                          cursor: 'pointer',
                          background: 'rgba(0,0,0,0.02)',
                          backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          height: imagePreview ? '200px' : 'auto',
                        }}>
                        {!imagePreview && (
                          <div className="text-center">
                            <div className="display-6 mb-2">📸</div>
                            <p className="mb-1">Drop your photo here</p>
                            <p className="text-muted small">or click to select</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="d-none" onChange={handleImageChange} />
                      </div>
                    </label>
                  </div>

                  {/* Trip Details */}
                  <div className="mb-4">
                    <label className="form-label">Trip Name</label>
                    <input 
                        type="text" 
                        className="form-control form-control-lg rounded-pill" 
                        name="title" 
                        value={formData.title || formData.name || ''} 
                        onChange={handleInputChange} 
                        required 
                      />
                  </div>

                  {/* Destination Field */}
                  <div className="mb-4">
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-pill"
                      placeholder="Destination (e.g., Paris, France)"
                      value={formData.destination}
                      onChange={(e) => {
                        const value = e.target.value;
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
                      <input type="date" className="form-control form-control-lg rounded-pill" name="startDate" value={(formData.startDate as string) || ''} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">End Date</label>
                      <input type="date" className="form-control form-control-lg rounded-pill" name="endDate" value={(formData.endDate as string) || ''} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Price</label>
                      <input
                        type="text" 
                        className="form-control form-control-lg rounded-pill"
                        name="price"
                        placeholder="Enter price"
                        value={formData.price === 0 ? '' : String(formData.price || '')} 
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (/^[1-9][0-9]*$/.test(value) || value === '0')) {
                            setFormData((prev) => ({
                              ...prev,
                              price: value === '' ? 0 : Number(value)
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
                      <div className="form-text">Enter price in USD (numbers only)</div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Maximum Seats</label>
                      <input type="number" className="form-control form-control-lg rounded-pill" name="maxSeats" value={formData.maxSeats || 1} onChange={handleNumberInputChange} min="1" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Trip Type</label>
                      <select className="form-select form-select-lg rounded-pill" name="category" value={formData.category || 'RELAXED'} onChange={handleInputChange}>
                        <option value="RELAXED">Relaxed</option>
                        <option value="MODERATE">Moderate</option>
                        <option value="INTENSIVE">Intensive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={4} name="description" value={formData.description || ''} onChange={handleInputChange} required />
                  </div>

                  {/* Submit Button */}
                  <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-secondary rounded-pill py-3 px-4" onClick={() => navigate('/profile')} disabled={saving}>
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn text-white rounded-pill py-3 px-4"
                      style={{ background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)', border: 'none' }}
                      disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Saving Changes...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
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

export default EditPostPage;
