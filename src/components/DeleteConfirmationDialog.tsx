// Fixed DeleteConfirmationDialog.tsx with Portal for complete isolation
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  isDeleting = false,
}) => {
  // Effect to prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Clean up when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Don't render anything if dialog is not open
  if (!isOpen) return null;

  // Safely handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on backdrop and not during deletion
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  // Create the modal content
  const modalContent = (
    <div
      className="delete-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.7)', // Darker backdrop
        zIndex: 9999, // Extremely high z-index to ensure it's on top
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'auto', // Ensure clickable
        backdropFilter: 'blur(2px)', // Add slight blur effect to backdrop
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="delete-modal-dialog" 
        style={{ 
          margin: '0 auto', 
          width: 'auto', 
          maxWidth: '450px',
          position: 'relative',
          pointerEvents: 'auto' // Ensure dialog is clickable
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content rounded-4 shadow-lg border-0" style={{ 
          background: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3) !important',
          minWidth: '350px'
        }}>
          <div className="modal-header border-0 pt-4 px-4">
            <h5 className="modal-title fw-bold" style={{ fontSize: '1.25rem', color: '#333' }}>{title}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              disabled={isDeleting} 
              aria-label="Close" 
            />
          </div>
          <div className="modal-body py-4 px-4">
            <div className="text-center mb-4">
              <div className="display-5 text-danger mb-3" style={{ fontSize: '2.5rem' }}>🗑️</div>
              <p className="mb-0" style={{ fontSize: '1rem', color: '#333', fontWeight: '500' }}>{message}</p>
            </div>
          </div>
          <div className="modal-footer border-0 pb-4 px-4">
            <button 
              type="button" 
              className="btn btn-outline-secondary rounded-pill px-4 py-2" 
              style={{ minWidth: '100px', fontWeight: '500' }}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-danger rounded-pill px-4 py-2" 
              style={{ minWidth: '100px', fontWeight: '500', background: '#dc3545' }}
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
              }} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render the modal outside the normal DOM hierarchy
  // Find or create a portal root element
  let portalRoot = document.getElementById('delete-dialog-portal');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'delete-dialog-portal';
    document.body.appendChild(portalRoot);
  }

  return ReactDOM.createPortal(
    modalContent,
    portalRoot // Render into dedicated portal element
  );
};

export default DeleteConfirmationDialog;