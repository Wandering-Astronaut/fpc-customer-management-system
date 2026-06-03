import React from 'react'

export default function DeleteConfirm({ customer, onConfirm, onClose, loading }) {
  if (!customer) return null

  return (
    <div
      className="modal fade show d-block fpc-modal-backdrop"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content fpc-modal-content text-center">
          <div className="modal-body py-4">
            <div className="delete-confirm-icon mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h5 className="modal-title mb-2">Delete Customer</h5>
            <p className="text-secondary mb-0">
              Are you sure you want to delete{' '}
              <strong className="text-light">{customer.full_name}</strong>?{' '}
              This action cannot be undone.
            </p>
          </div>
          <div className="modal-footer border-secondary justify-content-center">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
