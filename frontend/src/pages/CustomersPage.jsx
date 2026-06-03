import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { customerApi } from '../services/customers.js'
import { useCustomers } from '../hooks/useCustomers.js'
import CustomerForm from '../components/CustomerForm.jsx'
import CustomerDetail from '../components/CustomerDetail.jsx'
import DeleteConfirm from '../components/DeleteConfirm.jsx'

function initials(c) {
  return `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase()
}

// ── Modal modes ──────────────────────────────────────────────────────────────
const MODAL = { NONE: 'none', CREATE: 'create', EDIT: 'edit', VIEW: 'view', DELETE: 'delete' }

export default function CustomersPage() {
  const { customers, meta, loading, search, setSearch, page, setPage, refresh } = useCustomers()

  const [modal, setModal]             = useState(MODAL.NONE)
  const [selected, setSelected]       = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  // ── Helpers ────────────────────────────────────────────────────────────────
  const openCreate = () => { setSelected(null); setModal(MODAL.CREATE) }
  const openEdit   = (c) => { setSelected(c);    setModal(MODAL.EDIT) }
  const openView   = (c) => { setSelected(c);    setModal(MODAL.VIEW) }
  const openDelete = (c) => { setSelected(c);    setModal(MODAL.DELETE) }
  const closeModal = () => { setModal(MODAL.NONE); setSelected(null) }

  // ── Submit (create / update) ───────────────────────────────────────────────
  const handleFormSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (modal === MODAL.CREATE) {
        await customerApi.create(formData)
        toast.success('Customer created successfully.')
      } else {
        await customerApi.update(selected.id, formData)
        toast.success('Customer updated successfully.')
      }
      closeModal()
      refresh()
      return null
    } catch (err) {
      if (err.validationErrors) return err.validationErrors
      toast.error(err.message)
      return null
    } finally {
      setFormLoading(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
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

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = meta?.last_page ?? 1
  const from       = meta?.from ?? 0
  const to         = meta?.to   ?? 0
  const total      = meta?.total ?? 0

  return (
    <div className="shell">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="topbar-brand-dot" />
          FPC Platform
        </div>
        <span className="topbar-meta">Customer Management</span>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="main">

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">Manage your customer records</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Customer
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Customers</div>
            <div className={`stat-value${loading ? '' : ' accent'}`}>
              {loading ? <span className="skeleton" style={{ display:'inline-block', width:48, height:32, borderRadius:6 }} /> : total}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Showing</div>
            <div className="stat-value">
              {loading ? <span className="skeleton" style={{ display:'inline-block', width:60, height:32, borderRadius:6 }} /> : (from && to ? `${from}–${to}` : '—')}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Page</div>
            <div className="stat-value">
              {loading ? <span className="skeleton" style={{ display:'inline-block', width:40, height:32, borderRadius:6 }} /> : `${page} / ${totalPages}`}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              aria-label="Search customers"
            />
          </div>
          {search && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>
              Clear
            </button>
          )}
        </div>

        {/* Table card */}
        <div className="table-card">
          <div className="table-wrapper">
            <table className="table table-dark table-hover table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j}>
                            <span
                              className="skeleton"
                              style={{ display: 'block', height: 14, width: j === 0 ? 140 : j === 5 ? 80 : 120, borderRadius: 4 }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  : customers.length === 0
                  ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <div className="empty-title">
                              {search ? 'No customers found' : 'No customers yet'}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                              {search ? `Try a different search term.` : 'Get started by adding your first customer.'}
                            </p>
                            {!search && (
                              <button className="btn btn-primary btn-sm" onClick={openCreate}>
                                Add Customer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  : customers.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="customer-cell">
                            <div className="avatar">{initials(c)}</div>
                            <span className="customer-name">{c.full_name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                        <td style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{c.contact_number}</td>
                        <td><span className="badge badge-active">Active</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {new Date(c.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                            {/* View */}
                            <button
                              className="btn btn-ghost btn-icon"
                              title="View details"
                              onClick={() => openView(c)}
                              aria-label="View customer"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>

                            {/* Edit */}
                            <button
                              className="btn btn-ghost btn-icon"
                              title="Edit customer"
                              onClick={() => openEdit(c)}
                              aria-label="Edit customer"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>

                            {/* Delete */}
                            <button
                              className="btn btn-danger-ghost btn-icon"
                              title="Delete customer"
                              onClick={() => openDelete(c)}
                              aria-label="Delete customer"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && total > 0 && (
            <div className="pagination-bar">
              <span>
                Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> customers
              </span>
              <div className="pagination-pages">
                <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1} aria-label="First page">
                  «
                </button>
                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1} aria-label="Previous page">
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p
                  if (totalPages <= 5) p = i + 1
                  else if (page <= 3) p = i + 1
                  else if (page >= totalPages - 2) p = totalPages - 4 + i
                  else p = page - 2 + i
                  return (
                    <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>
                      {p}
                    </button>
                  )
                })}
                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} aria-label="Next page">
                  ›
                </button>
                <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Last page">
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {(modal === MODAL.CREATE || modal === MODAL.EDIT) && (
        <CustomerForm
          customer={modal === MODAL.EDIT ? selected : null}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          loading={formLoading}
        />
      )}

      {modal === MODAL.VIEW && (
        <CustomerDetail
          customer={selected}
          onClose={closeModal}
          onEdit={openEdit}
        />
      )}

      {modal === MODAL.DELETE && (
        <DeleteConfirm
          customer={selected}
          onConfirm={handleDelete}
          onClose={closeModal}
          loading={formLoading}
        />
      )}
    </div>
  )
}
