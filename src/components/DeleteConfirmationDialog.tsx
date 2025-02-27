// components/DeleteConfirmationDialog.tsx
interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const DeleteConfirmationDialog: React.FC<DeleteDialogProps> = ({ isOpen, onClose, onConfirm, title = 'Delete Confirmation', message = 'Are you sure you want to delete this item?' }) => {
  return (
    <div
      className={`modal ${isOpen ? 'show' : ''}`}
      style={{
        display: isOpen ? 'block' : 'none',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">{message}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;
