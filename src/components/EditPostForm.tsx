import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/shared/Footer';
import postService from '../services/post_service';

interface FormData {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
  maxSeats: number;
  bookedSeats: number;
  image: string | null;
  newImage: File | null;
}

// Define the update data structure
interface UpdatePostData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  maxSeats: number;
  bookedSeats: number;
  image?: string;
}

const EditPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    price: 0,
    maxSeats: 1,
    bookedSeats: 0,
    image: null,
    newImage: null,
  });

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setFetchLoading(true);
        console.log('Fetching post with ID:', id);
        const post = await postService.getPostById(id);
        console.log('Post fetched for editing:', post);

        setFormData({
          name: post.title ? post.title : '',
          description: post.description ? post.description : '',
          startDate: post.startDate ? new Date(post.startDate) : new Date(),
          endDate: post.endDate ? new Date(post.endDate) : new Date(),
          price: post.price ? post.price : 0,
          maxSeats: post.maxSeats ? post.maxSeats : 1,
          bookedSeats: post.bookedSeats ? post.bookedSeats : 0,
          image: post.image ? post.image : null,
          newImage: null,
        });

        // Set image preview if it exists
        if (post.image) {
          const imageUrl = post.image.startsWith('http') ? post.image : `http://localhost:3060/uploads/${post.image.replace('public/uploads/', '')}`;
          setSelectedImages([imageUrl]);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
        alert('Failed to load post data. Please try again.');
        navigate('/profile');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, newImage: file }));

      // Display image preview
      const fileURL = URL.createObjectURL(file);
      setSelectedImages([fileURL]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    try {
      // Prepare update data
      const updateData: UpdatePostData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        price: Number(formData.price),
        maxSeats: Number(formData.maxSeats),
        bookedSeats: Number(formData.bookedSeats),
      };

      // If there's a new image, upload it first
      if (formData.newImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.newImage);

        console.log('Uploading new image...');
        const uploadResponse = await postService.uploadImage(imageFormData);
        console.log('New image uploaded successfully:', uploadResponse);

        updateData.image = uploadResponse.url;
      }

      // Update the post
      console.log('Updating post with data:', updateData);
      await postService.updatePost(id, updateData);
      console.log('Post updated successfully');

      // Navigate back to profile
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
          <h1 className="display-4 fw-bold mb-3">Edit Your Adventure</h1>
          <p className="lead opacity-90 mb-0">Update the details of your trip</p>
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

                  {/* Post Details */}
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
                        type="number"
                        className="form-control form-control-lg rounded-pill"
                        placeholder="Price"
                        value={formData.price}
                        onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                        required
                      />
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
                  <div className="d-flex gap-3">
                    <button type="button" className="btn flex-grow-1 btn-outline-secondary rounded-pill py-3" onClick={() => navigate('/profile')} disabled={loading}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn flex-grow-1 text-white rounded-pill py-3"
                      style={{ background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)', border: 'none' }}
                      disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Trip'
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
