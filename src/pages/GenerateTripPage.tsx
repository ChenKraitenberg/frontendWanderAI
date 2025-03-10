// pages/GenerateTrip.tsx
import React, { useState } from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { toast } from 'react-toastify';
import { PostPreferences, GeneratedPost, SavedPost } from '../types';
import aiService from '../services/ai_service';
import wishlistService from '../services/wishlist_service';

const GenerateTrip = () => {
  const [loading, setLoading] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState<GeneratedPost | null>(null);
  const [preferences, setPreferences] = useState<PostPreferences>({
    destination: '',
    duration: '3',
    category: 'RELAXED', // שינוי מ-style ל-category
    interests: [],
  });
  const [currentInterest, setCurrentInterest] = useState('');

  const handleAddInterest = () => {
    if (currentInterest.trim()) {
      setPreferences((prev) => ({
        ...prev,
        interests: [...(prev.interests || []), currentInterest.trim()],
      }));
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setPreferences((prev) => ({
      ...prev,
      interests: (prev.interests || []).filter((interest) => interest !== interestToRemove),
    }));
  };

  const handleGenerateTrip = async () => {
    if (!preferences.destination) {
      toast.error('Please enter a destination');
      return;
    }

    try {
      setLoading(true);
      setGeneratedTrip(null);
      const trip = await aiService.generateTrip(preferences);
      setGeneratedTrip(trip);
    } catch (error) {
      console.error('Failed to generate trip:', error);
      toast.error('Failed to generate trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleSaveToWishlist = async () => {
    try {
      if (!generatedTrip) {
        toast.error('No trip to save');
        return;
      }
  
      console.log('About to save trip to wishlist:', generatedTrip);
      const savedItem = wishlistService.addToWishlist(generatedTrip);
      console.log('Trip saved to wishlist:', savedItem);
      toast.success('Trip added to your wishlist!');
    } catch (error) {
      console.error('Failed to save to wishlist:', error);
      toast.error('Error saving the trip to your wishlist');
    }
  };

  const handleDownloadPost = (post: SavedPost) => {
    try {
      const fileContent = `${post.title}\n\n${post.description}\n\n${post.itinerary?.join('\n\n') || ''}
        \nPost Details:
        - Duration: ${post.duration} days
        - Category: ${post.category}`;

      const element = document.createElement('a');
      const file = new Blob([fileContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Post downloaded successfully');
    } catch (error) {
      console.error('Failed to download post:', error);
      toast.error('Failed to download post');
    }
  };

  return (
    <MainLayout>
      <div className="min-vh-100 d-flex flex-column bg-light">
        {/* Header Section */}
        <div
          className="position-relative"
          style={{
            background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
            borderRadius: '0 0 25px 25px',
            padding: '3rem 0 6rem',
          }}>
          <div className="container">
            <div className="text-center text-white">
              <h1 className="display-4 fw-bold mb-2">Plan Your Dream Trip</h1>
              <p className="lead opacity-75">Let AI create your perfect travel itinerary</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container" style={{ marginTop: '-3rem' }}>
          <div className="row g-4">
            {/* Form Section */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-4">
                  <div className="mb-4">
                    <label className="form-label">Destination</label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-3"
                      placeholder="Where to?"
                      value={preferences.destination}
                      onChange={(e) => setPreferences({ ...preferences, destination: e.target.value })}
                    />
                  </div>

                  <div className="row mb-4">
                    <div className="col">
                      <label className="form-label">Duration (days)</label>
                      <input type="number" className="form-control rounded-3" min="1" value={preferences.duration} onChange={(e) => setPreferences({ ...preferences, duration: e.target.value })} />
                    </div>
                    {/* <div className="col">
                      <label className="form-label">Budget</label>
                      <select
                        className="form-select rounded-3"
                        value={preferences.category}
                        onChange={(e) => setPreferences({ ...preferences, category: e.target.value as 'low' | 'medium' | 'high' })}>
                        <option value="low">Budget</option>
                        <option value="medium">Comfort</option>
                        <option value="high">Luxury</option>
                      </select>
                    </div> */}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Travel Style</label>
                    <select
                      className="form-select rounded-3"
                      value={preferences.category}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          category: e.target.value as 'RELAXED' | 'MODERATE' | 'INTENSIVE',
                        })
                      }>
                      <option value="RELAXED">Relaxed & Easy</option>
                      <option value="MODERATE">Balanced</option>
                      <option value="INTENSIVE">Adventure</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Interests</label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control rounded-start-3"
                        placeholder="Add interests (e.g., food, culture, nature)"
                        value={currentInterest}
                        onChange={(e) => setCurrentInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                      />
                      <button className="btn btn-outline-secondary rounded-end-3" type="button" onClick={handleAddInterest}>
                        Add
                      </button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {(preferences.interests || []).map((interest) => (
                        <span key={interest} className="badge rounded-pill text-bg-primary d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)' }}>
                          {interest}
                          <button type="button" className="btn-close btn-close-white ms-2" onClick={() => handleRemoveInterest(interest)}></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    className="btn btn-lg w-100 text-white rounded-3"
                    onClick={handleGenerateTrip}
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
                      border: 'none',
                    }}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating...
                      </>
                    ) : (
                      'Generate Trip Plan'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="col-lg-7">
              {generatedTrip ? (
                <div className="card border-0 shadow-lg rounded-4">
                  <div className="card-body p-4">
                    <h2 className="h3 mb-3 fw-bold" style={{ color: '#4158D0' }}>
                      {generatedTrip.title}
                    </h2>
                    <p className="lead text-muted mb-4">{generatedTrip.description}</p>

                    <div className="d-flex flex-column gap-4 mb-4">
                      {generatedTrip.itinerary &&
                        generatedTrip.itinerary.map((day, index) => (
                          <div key={index} className="bg-light rounded-4 p-4">
                            {day.split('\n').map((line, lineIndex) => {
                              if (line.toLowerCase().startsWith('day')) {
                                return (
                                  <h3 key={lineIndex} className="h5 fw-bold mb-3" style={{ color: '#4158D0' }}>
                                    {line}
                                  </h3>
                                );
                              }
                              if (['morning:', 'afternoon:', 'evening:'].some((s) => line.toLowerCase().startsWith(s.toLowerCase()))) {
                                return (
                                  <div key={lineIndex} className="fw-semibold mb-2" style={{ color: '#C850C0' }}>
                                    {line}
                                  </div>
                                );
                              }
                              if (line.startsWith('-')) {
                                return (
                                  <div key={lineIndex} className="d-flex align-items-start ms-4 mb-2">
                                    <span className="me-2" style={{ color: '#C850C0' }}>
                                      •
                                    </span>
                                    <span>{line.replace('-', '').trim()}</span>
                                  </div>
                                );
                              }
                              return (
                                <p key={lineIndex} className="ms-4 mb-2 text-muted">
                                  {line}
                                </p>
                              );
                            })}
                          </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end gap-3">
                      <button
                        className="btn btn-outline-primary rounded-pill px-4"
                        onClick={() => handleDownloadPost(generatedTrip as unknown as SavedPost)}
                        style={{ borderColor: '#4158D0', color: '#4158D0' }}>
                        <span className="me-2">💾</span>
                        Save to Computer
                      </button>
                      <button
                        className="btn text-white rounded-pill px-4"
                        onClick={handleSaveToWishlist}
                        style={{
                          background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
                          border: 'none',
                        }}>
                        <span className="me-2">⭐</span>
                        Add to Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-lg rounded-4 h-100">
                  <div className="card-body d-flex align-items-center justify-content-center p-4">
                    <div className="text-center text-muted">
                      <h3 className="h5 mb-2">Ready to plan your trip?</h3>
                      <p className="mb-0">Fill in your preferences and let AI create the perfect itinerary for you!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GenerateTrip;
