import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { customerApi } from '../services/customers.js'
import { useCustomers } from '../hooks/useCustomers.js'
import CustomerForm from '../components/CustomerForm.jsx'
import { formatPhilippineMobileDisplay } from '../utils/customerValidation.js'
import CustomerDetail from '../components/CustomerDetail.jsx'
import DeleteConfirm from '../components/DeleteConfirm.jsx'

function initials(c) {
  return `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase()
}

const MODAL = { NONE: 'none', CREATE: 'create', EDIT: 'edit', VIEW: 'view', DELETE: 'delete' }

export default function CustomersPage() {
  const { customers, meta, loading, fetching, search, setSearch, page, setPage, refresh } = useCustomers()

  const [modal, setModal] = useState(MODAL.NONE)
  const [selected, setSelected] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const openCreate = () => { setSelected(null); setModal(MODAL.CREATE) }
  const openEdit = (c) => { setSelected(c); setModal(MODAL.EDIT) }
  const openView = (c) => { setSelected(c); setModal(MODAL.VIEW) }
  const openDelete = (c) => { setSelected(c); setModal(MODAL.DELETE) }
  const closeModal = () => { setModal(MODAL.NONE); setSelected(null) }

  const handleFormSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (modal === MODAL.CREATE) {
        await customerApi.create(formData)
        closeModal()
        refresh()
        toast.success(
          `Customer "${formData.first_name} ${formData.last_name}" was added successfully.`,
          { duration: 4500, id: 'customer-created' }
        )
      } else {
        await customerApi.update(selected.id, formData)
        closeModal()
        refresh()
        toast.success(
          `Customer "${formData.first_name} ${formData.last_name}" was updated successfully.`,
          { duration: 4000 }
        )
      }
      return null
    } catch (err) {
      if (err.validationErrors) return err.validationErrors
      toast.error(err.message)
      return null
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setFormLoading(true)
    try {
      await customerApi.delete(selected.id)
      toast.success('Customer deleted.')
      closeModal()
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const totalPages = meta?.last_page ?? 1
  const from = meta?.from ?? 0
  const to = meta?.to ?? 0
  const total = meta?.total ?? 0

  return (
    <div className="app-layout min-vh-100">
      {/* Top navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark fpc-navbar border-bottom">
        <div className="container-fluid px-4">
          <a className="navbar-brand d-flex align-items-center gap-2" href="/">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-text">FPC Platform</span>
          </a>
          <span className="navbar-text d-none d-md-inline text-secondary small text-uppercase tracking-wide">
            Customer Management System
          </span>
        </div>
      </nav>

      <div className="container-fluid px-0">
        <div className="row g-0">
          {/* Sidebar */}
          <aside className="col-lg-2 d-none d-lg-block fpc-sidebar border-end">
            <div className="p-4">
              <p className="sidebar-label mb-3">Menu</p>
              <nav className="nav flex-column gap-1">
                <span className="nav-link active rounded-3 d-flex align-items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Customers
                </span>
              </nav>
              <hr className="border-secondary my-4 opacity-25" />
              
            </div>
          </aside>

          {/* Main content */}
          <main className="col-lg-10 fpc-main">
            <div className="p-4 p-xl-5">
              {/* Page header */}
              <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
                <div>
                  <h1 className="page-heading mb-1">Customers</h1>
                  <p className="text-secondary mb-0">
                    Create, view, update, and delete customer records. Search by name or email.
                  </p>
                </div>
                <button type="button" className="btn btn-primary btn-lg fpc-btn-primary shadow-sm" onClick={openCreate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Customer
                </button>
              </header>

              {/* Stats */}
              <div className="row g-3 mb-4">
                <div className="col-sm-4">
                  <div className="card fpc-stat-card h-100">
                    <div className="card-body">
                      <div className="stat-label">Total customers</div>
                      <div className="stat-number text-primary">
                        {loading ? <span className="placeholder col-4" /> : total}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="card fpc-stat-card h-100">
                    <div className="card-body">
                      <div className="stat-label">Showing</div>
                      <div className="stat-number">
                        {loading ? <span className="placeholder col-5" /> : (from && to ? `${from}–${to}` : '—')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="card fpc-stat-card h-100">
                    <div className="card-body">
                      <div className="stat-label">Page</div>
                      <div className="stat-number">
                        {loading ? <span className="placeholder col-3" /> : `${page} / ${totalPages}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table panel */}
              <div className="card fpc-panel border-0 shadow">
                <div className="card-header fpc-panel-header border-bottom py-3 px-4">
                  <div className="row align-items-center g-3">
                    <div className="col-md-6">
                      <h2 className="h6 mb-0 fw-semibold">Customer directory</h2>
                      <small className="text-secondary">All records from the API</small>
                    </div>
                    <div className="col-md-6">
                      <div className={`input-group fpc-search-group${fetching ? ' is-loading' : ''}`}>
                        <span className="input-group-text">
                          {fetching ? (
                            <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true" />
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                          )}
                        </span>
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Search by name or email…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          aria-label="Search customers"
                          aria-busy={fetching}
                        />
                        {search && (
                          <button type="button" className="btn btn-outline-secondary fpc-btn-clear" onClick={() => setSearch('')}>
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`table-responsive fpc-table-wrap${fetching && !loading ? ' is-fetching' : ''}`}>
                  <table className="table table-hover align-middle mb-0 fpc-table">
                    <thead>
                      <tr>
                        <th scope="col" className="ps-4">Customer</th>
                        <th scope="col">Email</th>
                        <th scope="col">Contact</th>
                        <th scope="col">Status</th>
                        <th scope="col">Joined</th>
                        <th scope="col" className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="fpc-table-body">
                      {loading &&
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={`sk-${i}`} className="fpc-skeleton-row">
                            {Array.from({ length: 6 }).map((__, j) => (
                              <td key={j} className={j === 0 ? 'ps-4' : j === 5 ? 'pe-4' : ''}>
                                <span className="placeholder col-8" />
                              </td>
                            ))}
                          </tr>
                        ))}

                      {!loading && customers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-0 border-0">
                            <div className="empty-panel text-center py-5 px-4">
                              <div className="empty-icon-wrap mx-auto mb-3">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                              </div>
                              <h3 className="h5 mb-2 text-body-emphasis">{search ? 'No customers found' : 'No customers yet'}</h3>
                              <p className="text-muted mb-4 mx-auto empty-copy">
                                {search
                                  ? 'Try another name or email. Search uses Elasticsearch on the backend.'
                                  : 'Add your first customer to test create, read, update, and delete.'}
                              </p>
                              {!search && (
                                <button type="button" className="btn btn-primary fpc-btn-primary" onClick={openCreate}>
                                  Add your first customer
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        customers.map((c) => (
                          <tr key={c.id}>
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-3">
                                <div className="avatar flex-shrink-0">{initials(c)}</div>
                                <span className="fw-medium">{c.full_name}</span>
                              </div>
                            </td>
                            <td className="text-secondary">{c.email}</td>
                            <td className="text-secondary small">{formatPhilippineMobileDisplay(c.contact_number)}</td>
                            <td>
                              <span className="badge rounded-pill fpc-badge-active">Active</span>
                            </td>
                            <td className="text-secondary small">
                              {new Date(c.created_at).toLocaleDateString('en-PH', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="text-end pe-4">
                              <div className="btn-group btn-group-sm" role="group" aria-label={`Actions for ${c.full_name}`}>
                                <button type="button" className="btn btn-outline-secondary" title="View" onClick={() => openView(c)}>
                                  View
                                </button>
                                <button type="button" className="btn btn-outline-secondary" title="Edit" onClick={() => openEdit(c)}>
                                  Edit
                                </button>
                                <button type="button" className="btn btn-outline-danger" title="Delete" onClick={() => openDelete(c)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {meta && total > 0 && (
                  <div className="card-footer fpc-panel-footer d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 py-3 px-4">
                    <span className="text-secondary small">
                      Showing <strong>{from}–{to}</strong> of <strong>{total}</strong>
                    </span>
                    <nav aria-label="Customer pagination">
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                          <button type="button" className="page-link" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                        </li>
                        <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                          <button type="button" className="page-link" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</button>
                        </li>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let p
                          if (totalPages <= 5) p = i + 1
                          else if (page <= 3) p = i + 1
                          else if (page >= totalPages - 2) p = totalPages - 4 + i
                          else p = page - 2 + i
                          return (
                            <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
                              <button type="button" className="page-link" onClick={() => setPage(p)}>{p}</button>
                            </li>
                          )
                        })}
                        <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                          <button type="button" className="page-link" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</button>
                        </li>
                        <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                          <button type="button" className="page-link" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {(modal === MODAL.CREATE || modal === MODAL.EDIT) && (
        <CustomerForm
          customer={modal === MODAL.EDIT ? selected : null}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          loading={formLoading}
        />
      )}

      {modal === MODAL.VIEW && (
        <CustomerDetail customer={selected} onClose={closeModal} onEdit={openEdit} />
      )}

      {modal === MODAL.DELETE && (
        <DeleteConfirm customer={selected} onConfirm={handleDelete} onClose={closeModal} loading={formLoading} />
      )}
    </div>
  )
}
