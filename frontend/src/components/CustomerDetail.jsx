import React from 'react'
import { formatPhilippineMobileDisplay } from '../utils/customerValidation.js'

function initials(c) {
  return `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase()
}

export default function CustomerDetail({ customer, onClose, onEdit }) {
  if (!customer) return null

  return (
    <div
      className="modal fade show d-block fpc-modal-backdrop"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content fpc-modal-content">
          <div className="modal-header border-secondary">
            <h5 className="modal-title" id="detail-modal-title">Customer Profile</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close" />
          </div>

          <div className="modal-body text-center">
            <div className="detail-avatar mx-auto">{initials(customer)}</div>
            <h4 className="mt-3 mb-1">{customer.full_name}</h4>
            <p className="text-secondary mb-4">{customer.email}</p>

            <div className="row g-3 text-start">
              {[
                { label: 'First Name',     value: customer.first_name },
                { label: 'Last Name',      value: customer.last_name },
                { label: 'Email',          value: customer.email },
                { label: 'Contact Number', value: formatPhilippineMobileDisplay(customer.contact_number) },
                {
                  label: 'Member Since',
                  value: new Date(customer.created_at).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  }),
                },
                {
                  label: 'Last Updated',
                  value: new Date(customer.updated_at).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  }),
                },
              ].map(({ label, value }) => (
                <div className="col-md-6" key={label}>
                  <div className="p-3 rounded fpc-detail-field">
                    <div className="small text-secondary text-uppercase">{label}</div>
                    <div className="fw-medium">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { onClose(); onEdit(customer) }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
