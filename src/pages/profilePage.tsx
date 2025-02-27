import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService, { User } from '../services/user_service';
import tripService from '../services/trip_service';
import MapComponent from '../components/MapComponent';
import Footer from '../components/shared/Footer';
import { getImageUrl } from '../utils/imageUtils';
import { SavedTrip } from '../types';
import TripCard from '../components/TripCard';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { request } = userService.getMe();
        const response = await request;
        setUser(response.data);

        if (response.data._id) {
          try {
            const userTrips = await tripService.getByUserId(response.data._id);
            //setTrips(Array.isArray(userTrips) ? userTrips : []);
            setTrips(userTrips);
          } catch (error) {
            console.error('Failed to load trips:', error);
            setTrips([]);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const calculateTotalDays = () => {
    return trips.reduce((total, trip) => {
      if (trip.startDate && trip.endDate) {
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return total + Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
      return total;
    }, 0);
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await tripService.deletePost(tripId);
      setTrips((prevTrips) => prevTrips.filter((trip) => trip._id !== tripId));
      toast.success('Trip deleted successfully');
      setTripToDelete(null);
    } catch (error) {
      console.error('Failed to delete trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const handleDownloadTrip = (trip: SavedTrip) => {
    try {
      const fileContent = `${trip.title}\n\n${trip.description}\n\n${trip.itinerary.join('\n\n')}
        \nTrip Details:
        - Duration: ${trip.duration} days
        - Category: ${trip.category}`;

      const element = document.createElement('a');
      const file = new Blob([fileContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${trip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Trip downloaded successfully');
    } catch (error) {
      console.error('Failed to download trip:', error);
      toast.error('Failed to download trip');
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
      {/* Header Section */}
      <div
        className="position-relative"
        style={{
          background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
          borderRadius: '0 0 25px 25px',
          padding: '3rem 0 6rem',
        }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-auto">
              <div className="position-relative">
                <div
                  className="rounded-4 shadow-lg border-4 border-white"
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundImage: user?.avatar ? `url(${getImageUrl(user.avatar)})` : 'url(/api/placeholder/120/120)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            </div>
            <div className="col text-white">
              <h1 className="display-6 fw-bold mb-2">{user?.email}</h1>
              <div className="d-flex gap-4">
                <div>
                  <div className="fw-bold h4 mb-0">{trips.length}</div>
                  <small className="opacity-75">Trips Planned</small>
                </div>
                <div>
                  <div className="fw-bold h4 mb-0">{calculateTotalDays()}</div>
                  <small className="opacity-75">Travel Days</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex-grow-1" style={{ marginTop: '-3rem' }}>
        {/* Map Section */}
        <div className="card border-0 shadow-lg rounded-4 mb-4">
          <div className="card-body p-4">
            <h3 className="h5 mb-4">My Travel Map</h3>
            {user?._id && <MapComponent userId={user._id} />}
          </div>
        </div>

        {/* Trips Section */}
        <div className="card border-0 shadow-lg rounded-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h5 mb-0">My Trips</h3>
              <button
                className="btn btn-outline-primary rounded-pill px-3"
                onClick={() => navigate('/generate-trip')}
                style={{
                  borderColor: '#4158D0',
                  color: '#4158D0',
                }}>
                <span className="me-2">✨</span>
                Generate New Trip
              </button>
            </div>

            {trips.length > 0 ? (
              <div className="row g-4">
                {trips.map((trip) => (
                  <div key={trip._id} className="col-md-6 col-lg-4">
                    <TripCard trip={trip} onDelete={() => setTripToDelete(trip._id)} onDownload={() => handleDownloadTrip(trip)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted mb-3">You haven't planned any trips yet</p>
                <p className="small text-muted">Click the button above to start planning!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationDialog isOpen={!!tripToDelete} onClose={() => setTripToDelete(null)} onConfirm={() => tripToDelete && handleDeleteTrip(tripToDelete)} />

      <Footer />
    </div>
  );
};

export default ProfilePage;
