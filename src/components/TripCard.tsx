// components/TripCard.tsx
import React from 'react';

// components/TripCard.tsx
interface TripCardProps {
  trip: {
    _id: string;
    title: string;
    description?: string;
    image?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    likes?: number;
  };
  onDelete?: () => void;
  onDownload?: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete, onDownload }) => {
  return (
    <div className="card h-100 border-0 shadow-lg rounded-4">
      <div className="card-body p-4">
        <h5 className="card-title mb-3">{trip.title}</h5>
        {trip.description && <p className="card-text text-muted">{trip.description}</p>}

        <div className="d-flex justify-content-end gap-2 mt-3">
          {onDownload && (
            <button className="btn btn-outline-primary btn-sm rounded-pill" onClick={onDownload}>
              <span className="me-1">💾</span> Download
            </button>
          )}
          {onDelete && (
            <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={onDelete}>
              <span className="me-1">🗑️</span> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
