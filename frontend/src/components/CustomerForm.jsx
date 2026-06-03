import React, { useState, useEffect } from 'react'
import {
  formatFirstNameLive,
  formatPersonName,
  formatPhoneInputLive,
  formatPhilippineMobileDisplay,
  validateCustomerForm,
} from '../utils/customerValidation.js'

const INITIAL = { first_name: '', last_name: '', email: '', contact_number: '' }

export default function CustomerForm({ customer, onSubmit, onClose, loading }) {
  const isEdit = Boolean(customer)
  const [form, setForm]     = useState(INITIAL)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (customer) {
      setForm({
        first_name:     customer.first_name,
        last_name:      customer.last_name,
        email:          customer.email,
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

    if (name === 'first_name') {
      next = formatFirstNameLive(value)
    } else if (name === 'last_name') {
      next = value.replace(/[^\p{L}\s\-]/gu, '')
    } else if (name === 'contact_number') {
      next = formatPhoneInputLive(value)
    }

    setForm((prev) => ({ ...prev, [name]: next }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handlePhoneKeyDown = (e) => {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return
    if (!/^\d$/.test(e.key)) e.preventDefault()
  }

  const handlePhonePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    setForm((prev) => ({
      ...prev,
      contact_number: formatPhoneInputLive(text),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = validateCustomerForm(form)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    const errs = await onSubmit(result.data)
    if (errs) setErrors(errs)
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
      onClick={(ev) => ev.target === ev.currentTarget && onClose()}
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
                  <label className="form-label" htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    className={`form-control${errors.first_name ? ' is-invalid' : ''}`}
                    value={form.first_name}
                    onChange={handleChange}
                    onBlur={() =>
                      setForm((prev) => ({
                        ...prev,
                        first_name: formatPersonName(prev.first_name),
                      }))
                    }
                    placeholder="Juan"
                    autoFocus
                    maxLength={50}
                  />
                  <div className="form-text text-muted">2–50 characters. Letters, spaces, hyphens.</div>
                  {fieldError('first_name')}
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    className={`form-control${errors.last_name ? ' is-invalid' : ''}`}
                    value={form.last_name}
                    onChange={handleChange}
                    onBlur={() =>
                      setForm((prev) => ({
                        ...prev,
                        last_name: formatPersonName(prev.last_name),
                      }))
                    }
                    placeholder="De la Cruz"
                    maxLength={50}
                  />
                  <div className="form-text text-muted">e.g. De la Cruz, Anne-Marie</div>
                  {fieldError('last_name')}
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="email">Email Address</label>
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
                  <label className="form-label" htmlFor="contact_number">Contact Number</label>
                  <input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    className={`form-control${errors.contact_number ? ' is-invalid' : ''}`}
                    value={form.contact_number}
                    onChange={handleChange}
                    onKeyDown={handlePhoneKeyDown}
                    onPaste={handlePhonePaste}
                    placeholder="0917 555 0123"
                    maxLength={14}
                  />
                  <div className="form-text text-muted">
                    Format: 09XX XXX XXX (11 digits). Example: 0917 555 0123
                  </div>
                  {fieldError('contact_number')}
                </div>
              </div>
            </div>

            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
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
