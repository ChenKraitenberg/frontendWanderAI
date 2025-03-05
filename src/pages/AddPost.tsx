// AddPost.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/shared/Footer';
import PostService from '../services/post_service';

const AddPost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '', // Changed from title to name
    description: '', // Changed from content to description
    startDate: new Date(),
    endDate: new Date(),
    price: 0,
    maxSeats: 1,
    bookedSeats: 0,
    image: null as File | null,
  });

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));

      // Display image preview
      const fileURL = URL.createObjectURL(file);
      setSelectedImages([fileURL]);
    }
  };

  // Submit the form
  // תיקון לפונקצית createPost בדף AddPost.tsx
  // עדיף להחליף את כל הפונקציה handleSubmit

  // מתוך src/pages/AddPost.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.image) {
        throw new Error('אנא בחר תמונה');
      }
      if (!formData.name || !formData.description) {
        throw new Error('אנא מלא את כל השדות הנדרשים');
      }

      // Upload image
      const imageFormData = new FormData();
      imageFormData.append('file', formData.image);

      console.log('מעלה תמונה...');
      const uploadResponse = await PostService.uploadImage(imageFormData);
      console.log('התמונה הועלתה בהצלחה:', uploadResponse);

      // שמירה על מזהה המשתמש הנוכחי
      const userId = localStorage.getItem('userId');
      console.log('User ID for new post:', userId);

      // יצירת הפוסט
      const postData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        price: Number(formData.price),
        maxSeats: Number(formData.maxSeats),
        bookedSeats: Number(formData.bookedSeats),
        image: uploadResponse.url,
        userId: userId || undefined, // הוספת מזהה המשתמש
        owner: userId || undefined, // הוספת מזהה המשתמש גם כבעלים
      };

      console.log('יוצר פוסט עם הנתונים:', postData);
      const createdPost = await PostService.createPost(postData);
      console.log('הפוסט נוצר בהצלחה:', createdPost);

      // ניווט בחזרה
      navigate('/profile');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('נכשל ביצירת הפוסט:', error.message);
        alert(error.message);
      } else {
        console.error('נכשל ביצירת הפוסט:', error);
        alert('אירעה שגיאה לא ידועה');
      }
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
