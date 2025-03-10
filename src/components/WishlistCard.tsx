// src/components/WishlistCard.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { WishlistItem } from '../services/wishlist_service';
import wishlistService from '../services/wishlist_service';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface WishlistCardProps {
  item: WishlistItem;
  onDelete: (itemId: string) => void;
}

const WishlistCard: React.FC<WishlistCardProps> = ({ item, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);

  // Format the date
  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      wishlistService.removeFromWishlist(item.id);
      onDelete(item.id);
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Error removing from wishlist');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="card shadow rounded-4 border-0 h-100">
        {/* Item Image */}
        <div
          className="card-img-top"
          style={{
            height: '180px',
            backgroundImage: item.image ? `url(${item.image})` : 'url(/api/placeholder/800/400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
          }}
        />

        {/* Item Header */}
        <div className="card-header bg-white border-0 d-flex align-items-center">
          <div>
            <h6 className="mb-0 fw-bold">{item.title}</h6>
            <small className="text-muted">{item.destination} • {item.duration} days</small>
          </div>

          {/* Delete button */}
          <div className="ms-auto">
            <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteClick} aria-label="Remove from wishlist">
              <i className="bi bi-trash me-1"></i> Remove
            </button>
          </div>
        </div>

        {/* Item Content */}
        <div className="card-body">
          <div className="mb-3">
            <h6 className="fw-bold mb-2">Description</h6>
            <p className={`card-text ${!showFullDescription ? 'text-truncate' : ''}`}>
  {showFullDescription ? item.description : truncateText(item.description, 150)}
</p>
            {item.description.length > 100 && (
              <button 
                className="btn btn-link p-0 text-primary" 
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Category Badge */}
          {item.category && (
            <div className="mb-3">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  background:
                    item.category === 'RELAXED'
                      ? 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)'
                      : item.category === 'MODERATE'
                      ? 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)'
                      : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                }}>
                {item.category}
              </span>
            </div>
          )}

          {/* Itinerary Accordion */}
          {item.itinerary && item.itinerary.length > 0 && (
            <div className="mt-3">
              <button
                className="btn btn-outline-primary btn-sm w-100 d-flex justify-content-between align-items-center"
                onClick={() => setShowItinerary(!showItinerary)}
              >
                <span>View Itinerary</span>
                <i className={`bi bi-chevron-${showItinerary ? 'up' : 'down'}`}></i>
              </button>
              
              {showItinerary && (
                <div className="mt-3 small">
                  {item.itinerary.map((day, index) => (
                    <div key={index} className="mb-3 bg-light p-2 rounded">
                      <strong>{day.split('\n')[0]}</strong>
                      <div className="ms-2 mt-1">
                        {day
                          .split('\n')
                          .slice(1)
                          .map((line, i) => (
                            <div key={i} className="mb-1">
                              {line}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Created date footer */}
        <div className="card-footer bg-white border-top-0">
          <small className="text-muted">Added on {formatDate(item.createdAt)}</small>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Remove from Wishlist"
        message="Are you sure you want to remove this trip from your wishlist?"
        isDeleting={isDeleting}
      />
    </>
  );
};

export default WishlistCard;