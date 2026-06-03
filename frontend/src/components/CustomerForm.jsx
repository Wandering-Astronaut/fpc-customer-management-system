import React, { useState, useEffect } from 'react'
import {
  formatFirstNameLive,
  formatPersonName,
  formatPhilippineMobileDisplay,
  formatPhoneInputLive,
  validateCustomerForm,
} from '../utils/customerValidation.js'

const INITIAL = { first_name: '', last_name: '', email: '', contact_number: '' }

export default function CustomerForm({ customer, onSubmit, onClose, loading }) {
  const isEdit = Boolean(customer)
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (customer) {
      setForm({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        contact_number: formatPhilippineMobileDisplay(customer.contact_number),
      })
    } else {
      setForm(INITIAL)
    }
    setErrors({})
  }, [customer])

  const handleChange = (e) => {
    const { name, value } = e.target
    let next = value
    if (name === 'contact_number') {
      next = formatPhoneInputLive(value)
    } else if (name === 'first_name') {
      next = formatFirstNameLive(value)
    }
    setForm((prev) => ({ ...prev, [name]: next }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handlePhoneKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) return

    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (allowed.includes(e.key)) return

    if (/^\d$/.test(e.key)) return
    e.preventDefault()
  }

  const handlePhonePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const el = e.target
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? form.contact_number.length
    const combined = form.contact_number.slice(0, start) + pasted + form.contact_number.slice(end)
    setForm((prev) => ({
      ...prev,
      contact_number: formatPhoneInputLive(combined),
    }))
    if (errors.contact_number) setErrors((prev) => ({ ...prev, contact_number: null }))
  }

  const handleNameBlur = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: formatPersonName(prev[field]),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = validateCustomerForm(form)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    const serverErrors = await onSubmit(result.data)
    if (serverErrors) setErrors(serverErrors)
  }

  const fieldError = (name) =>
    errors[name] ? <div className="invalid-feedback d-block">{errors[name][0]}</div> : null

  return (
    <div
      className="modal fade show d-block fpc-modal-backdrop"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content fpc-modal-content">
          <div className="modal-header border-secondary">
            <h5 className="modal-title" id="form-modal-title">
              {isEdit ? 'Edit Customer' : 'New Customer'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="first_name">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    className={`form-control${errors.first_name ? ' is-invalid' : ''}`}
                    value={form.first_name}
                    onChange={handleChange}
                    onBlur={() => handleNameBlur('first_name')}
                    placeholder="Juan"
                    maxLength={50}
                    autoFocus
                  />
                  <div className="form-text text-muted">2–50 characters. Letters, spaces, hyphens.</div>
                  {fieldError('first_name')}
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="last_name">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    className={`form-control${errors.last_name ? ' is-invalid' : ''}`}
                    value={form.last_name}
                    onChange={handleChange}
                    onBlur={() => handleNameBlur('last_name')}
                    placeholder="De la Cruz"
                    maxLength={50}
                  />
                  <div className="form-text text-muted">e.g. De la Cruz, Anne-Marie</div>
                  {fieldError('last_name')}
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="email">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-control${errors.email ? ' is-invalid' : ''}`}
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@example.com"
                    maxLength={100}
                  />
                  <div className="form-text text-muted">Max 100 characters. Must be unique.</div>
                  {fieldError('email')}
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="contact_number">
                    Contact Number <span className="text-danger">*</span>
                  </label>
                  <input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className={`form-control${errors.contact_number ? ' is-invalid' : ''}`}
                    value={form.contact_number}
                    onChange={handleChange}
                    onKeyDown={handlePhoneKeyDown}
                    onPaste={handlePhonePaste}
                    placeholder="09XX XXX XXXX"
                    maxLength={14}
                  />
                  <div className="form-text text-muted">
                    Must be 11 digits.
                  </div>
                  {fieldError('contact_number')}
                </div>
              </div>
            </div>

            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary fpc-btn-primary" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
                {isEdit ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
