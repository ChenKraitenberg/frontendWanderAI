// src/components/DeleteConfirmationDialog.tsx
import React, { useEffect } from 'react';

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

  // אם החלון לא פתוח, אל תרנדר דבר
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // סגור את הדיאלוג רק אם לחצו על הרקע (לא על תוכן הדיאלוג)
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div
      className="modal d-block"
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1050,
        overflow: 'auto',
        paddingTop: '50px',
      }}
      onClick={handleBackdropClick}>
      <div className="modal-dialog modal-dialog-centered" style={{ margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 shadow-lg border-0">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isDeleting} aria-label="Close" />
          </div>
          <div className="modal-body py-4">
            <div className="text-center mb-4">
              <div className="display-6 text-danger mb-3">🗑️</div>
              <p className="mb-0">{message}</p>
            </div>
          </div>
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose} disabled={isDeleting}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger rounded-pill px-4" onClick={onConfirm} disabled={isDeleting}>
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
};

export default DeleteConfirmationDialog;
