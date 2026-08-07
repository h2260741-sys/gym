/* ================================================================
   App.jsx - single-file frontend

   Defines Nav, Details (dashboard), Register, Viewregister, and
   Paymenthistory, plus routing. All data is read/written through the
   FastAPI backend (see api.* calls below) - nothing is stored in
   localStorage.

   The old per-component files (Nav.jsx, Details.jsx, Register.jsx,
   Viewregister.jsx, Paymenthistory.jsx) and basic-style.css have been
   removed: they were dead code left over from an earlier, localStorage-
   based version and were never imported by main.jsx.
================================================================ */

import React, { useState, useEffect } from 'react'
import { Routes, Route, Outlet, Link, useNavigate, useLocation } from 'react-router-dom'

import './App.css'
import './Nav.css'
import './Details.css'
import './Register.css'
import './Viewregister.css'
import './Paymenthistory.css'

// ----------------------------------------------------------------
// API BASE - read from Vite env (.env / .env.production), falling back
// to localhost:8000 for local development. This always has to be a
// URL the *browser* can reach (the frontend runs client-side), so even
// inside Docker it should point at the backend's published host port,
// never at a Docker service name like "backend".
// ----------------------------------------------------------------
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api"

async function handleResponse(res) {
  if (!res.ok) {
    let message = "Request failed"
    try {
      const data = await res.json()
      message = data.detail || message
    } catch (e) { /* ignore */ }
    throw new Error(message)
  }
  return res.json()
}

const api = {
  getUsers: async () => handleResponse(await fetch(`${API_BASE}/users`)),
  createUser: async (user) => handleResponse(await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  })),
  updateUser: async (id, user) => handleResponse(await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  })),
  deleteUser: async (id) =>
    handleResponse(
      await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
      })
    ),
  getPayments: async () => handleResponse(await fetch(`${API_BASE}/payments`)),
  createPayment: async (payment) => handleResponse(await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment),
  })),
  updatePayment: async (id, payment) => handleResponse(await fetch(`${API_BASE}/payments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment),
  })),
  deletePayment: async (id) =>
    handleResponse(
      await fetch(`${API_BASE}/payments/${id}`, {
        method: "DELETE",
      })
    ),
}

// ----------------------------------------------------------------
// VALIDATION HELPERS
// ----------------------------------------------------------------
function validateUserForm(data) {
  const errors = {}
  if (!data.name || !data.name.trim()) {
    errors.name = "Name is required"
  }
  if (!data.phone || !/^\d{10}$/.test(data.phone)) {
    errors.phone = "Phone must be exactly 10 digits"
  }
  if (!data.joiningdate) {
    errors.joiningdate = "Joining date is required"
  }
  return errors
}

function validatePaymentForm(data) {
  const errors = {}
  if (!data.member || !data.member.trim()) {
    errors.member = "Member name is required"
  }
  if (!data.amount || !String(data.amount).trim()) {
    errors.amount = "Amount is required"
  }
  if (!data.date) {
    errors.date = "Date is required"
  }
  if (!data.method || !data.method.trim()) {
    errors.method = "Method is required"
  }
  if (!data.transactionId || !data.transactionId.trim()) {
    errors.transactionId = "Transaction ID is required"
  }
  return errors
}

// ================================================================
// NAV COMPONENT
// ================================================================
function Nav() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen)
  const handleNavClick = (navItem) => {
    setActiveNav(navItem)
    setMobileMenuOpen(false)
  }

  return (
    <div className="Sidebar-Wrapper">
      <div className="Hamburger-Menu" onClick={handleMobileMenuToggle}>
        <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </div>

      <div className={`User-Nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="Logo-Parent">
          <i className="fa-solid fa-user"></i>
        </div>
        <div className="User-Name">H MOHAMED HANSATH</div>
      </div>

      <div className={`Parent ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="Child">
          <div className="Nav-Top">
            <Link to="/Details"
              className={`Dashboared-Parent ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}>
              <i className='fa-solid fa-gauge'></i>
              <div className='Dashboard-Child'>Dashboard</div>
            </Link>
            <Link to="/ViewRegisteredUsers"
              className={`View-Register-Parent ${activeNav === 'register' ? 'active' : ''}`}
              onClick={() => handleNavClick('register')}>
              <i className='fa-solid fa-people-group'></i>
              <div className='view-register-child'>View Registered Users</div>
            </Link>
            <Link to="/PaymentHistory"
              className={`Payment-History-Parent ${activeNav === 'payment' ? 'active' : ''}`}
              onClick={() => handleNavClick('payment')}>
              <i className='fa-solid fa-clock-rotate-left'></i>
              <div className='Payment-History-Child'>Payment History</div>
            </Link>
          </div>

          <div className="Nav-Bottom">
            <div className="Logout">Logout</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ================================================================
// DETAILS (Dashboard) COMPONENT
// ================================================================
function Details() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expiredata, setExpiredata] = useState([])
  const [expirefilterdata, setExpirefilterdata] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleNewRegister = () => navigate('/Register')

  const loadData = async () => {
    setLoading(true)
    setError("")
    try {
      const [usersData, paymentsData] = await Promise.all([api.getUsers(), api.getPayments()])
      setUsers(usersData)
      setPayments(paymentsData)
    } catch (err) {
      setError(err.message || "Failed to load data from server. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleexpire = (expireType) => {
    let filtered = []
    if (expireType === "expiredwhithin") {
      filtered = users.filter((u) => Number(u.expiredwithin) <= 3 && Number(u.expiredwithin) >= 0)
    }
    if (expireType === "expired") {
      filtered = users.filter((u) => Number(u.expiredwithin) <= 0)
    }
    setExpiredata(filtered)
    setExpirefilterdata(true)
  }

  const handleShowAll = () => setExpirefilterdata(false)

  const handleEditUser = (user) => {
    navigate('/Register', { state: { editUser: user } })
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    setDeletingId(id)
    try {
      await api.deleteUser(id)
      alert("User deleted successfully")
      await loadData()
    } catch (err) {
      alert(err.message || "Failed to delete user. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="Details-parent">
      <div className="New-Register-Parent" onClick={handleNewRegister}>
        <i className="fa-solid fa-person-circle-plus"></i>
        <div className="New-register-child">New Register</div>
      </div>
      <div className="Total-Accounts-Parent">
        <div className="EXpire-Within-3Days" onClick={() => handleexpire("expiredwhithin")}>
          Accounts Are Going To Expire Within 3 Days
        </div>
        <div className="Account-Expire" onClick={() => handleexpire("expired")}>
          Accounts Expired
        </div>
      </div>

      {expirefilterdata && (
        <div className="New-Register-Parent" onClick={handleShowAll} style={{ background: 'transparent', cursor: 'pointer' }}>
          <div className="New-register-child">Show All Users</div>
        </div>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>}
      {loading && <p style={{ fontSize: '13px' }}>Loading...</p>}

      <div className="Details-table-wrapper">
        <table className="Details-table">
          <thead className="Details-thead">
            <tr className="Details-tr">
              <td>S.No</td><td>Profile</td><td>Name</td><td>Phone No</td>
              <td>Joing Date</td><td>Expired Within</td><td>Expired</td><td>Actions</td>
            </tr>
          </thead>
          <tbody className="Details-tbody">
            {(expirefilterdata ? expiredata : users).map((user, index) => (
              <tr className="Details-tr" key={user.id ?? index}>
                <td>{index + 1}</td>
                <td><i className="fa-regular fa-user"></i></td>
                <td>{user.name}</td>
                <td>{user.phone}</td>
                <td>{user.joiningdate}</td>
                <td>{user.expiredwithin} Days</td>
                <td>{user.expired}</td>
                <td>
                  <button type="button" onClick={() => handleEditUser(user)} disabled={deletingId === user.id}>Edit</button>{' '}
                  <button type="button" onClick={() => handleDeleteUser(user.id)} disabled={deletingId === user.id}>
                    {deletingId === user.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payments.length > 0 && (
        <div className="Details-payments">
          <h3>Payment Records</h3>
          <div className="Details-table-wrapper">
            <table className="Details-table">
              <thead className="Details-thead">
                <tr className="Details-tr">
                  <td>ID</td><td>Member</td><td>Amount</td><td>Date</td>
                  <td>Status</td><td>Method</td><td>Txn ID</td>
                </tr>
              </thead>
              <tbody className="Details-tbody">
                {payments.map((p, idx) => (
                  <tr className="Details-tr" key={p.id ?? idx}>
                    <td>{idx + 1}</td>
                    <td>{p.member}</td>
                    <td>{p.amount}</td>
                    <td>{p.date}</td>
                    <td>{p.status}</td>
                    <td>{p.method}</td>
                    <td>{p.transaction_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ================================================================
// REGISTER COMPONENT
// ================================================================
function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const editUser = (location.state && location.state.editUser) ? location.state.editUser : null
  const isEditMode = Boolean(editUser)

  const [formdata, setFormdata] = useState({
    name: editUser?.name || "",
    phone: editUser?.phone || "",
    joiningdate: editUser?.joiningdate || "",
    expiredwithin: editUser?.expiredwithin || "",
    expired: editUser?.expired || ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "phone") {
      // Phone: numbers only, max 10 digits
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
      setFormdata(prev => ({ ...prev, phone: digitsOnly }))
      return
    }
    setFormdata(prev => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    setFormdata({ name: "", phone: "", joiningdate: "", expiredwithin: "", expired: "" })
    setFieldErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const errors = validateUserForm(formdata)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted fields.")
      return
    }

    setSubmitting(true)
    try {
      if (isEditMode) {
        await api.updateUser(editUser.id, formdata)
        alert("User updated successfully")
      } else {
        await api.createUser(formdata)
        alert("User registered successfully")
      }
      handleReset()
      navigate('/ViewRegisteredUsers')
    } catch (err) {
      setError(err.message || "Failed to save user. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => navigate('/Details')

  return (
    <div className="form-parent">
      <div className="Form-Child">
        <h1 className='Register-form'>{isEditMode ? "Edit Member" : "Register Form"}</h1>
        {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
        <form className='Form' onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder='enter your name' className='Input' value={formdata.name} onChange={handleChange} />
          {fieldErrors.name && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{fieldErrors.name}</p>}

          <input type="tel" name="phone" placeholder='Phone Number (10 digits)' className='Input' value={formdata.phone} onChange={handleChange} maxLength={10} />
          {fieldErrors.phone && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{fieldErrors.phone}</p>}

          <input type="date" name="joiningdate" placeholder='joining date' className='Input' value={formdata.joiningdate} onChange={handleChange} />
          {fieldErrors.joiningdate && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0 }}>{fieldErrors.joiningdate}</p>}

          <input type="number" name="expiredwithin" placeholder='expired within (days)' className='Input' value={formdata.expiredwithin} onChange={handleChange} />
          <input type="date" name="expired" placeholder='expired' className='Input' value={formdata.expired} onChange={handleChange} />
          <div className="brs-parent">
            <button type="button" onClick={handleBack} disabled={submitting}><i className="fa-solid fa-circle-arrow-left"></i>Back</button>
            <button type="button" onClick={handleReset} disabled={submitting}>Reset</button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : (isEditMode ? "Update" : "Submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ================================================================
// VIEW REGISTER COMPONENT
// ================================================================
function Viewregister() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")

  const loadUsers = async () => {
    setLoading(true)
    setError("")
    try {
      setUsers(await api.getUsers())
    } catch (err) {
      setError(err.message || "Failed to load users from server. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const handleEdit = (user) => {
    navigate('/Register', { state: { editUser: user } })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    setDeletingId(id)
    try {
      await api.deleteUser(id)
      alert("User deleted successfully")
      await loadUsers()
    } catch (err) {
      alert(err.message || "Failed to delete user. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const stats = { expiringCount: users.filter(u => u.expiredwithin && parseInt(u.expiredwithin) <= 3).length }

  // Search (instant, no reload) by name or phone
  const searchedUsers = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    return (u.name || '').toLowerCase().includes(term) || (u.phone || '').toLowerCase().includes(term)
  })

  // Sort by name or joining date
  const displayedUsers = [...searchedUsers].sort((a, b) => {
    let result = 0
    if (sortBy === "name") {
      result = (a.name || '').localeCompare(b.name || '')
    } else if (sortBy === "joiningdate") {
      result = new Date(a.joiningdate || 0) - new Date(b.joiningdate || 0)
    }
    return sortOrder === "asc" ? result : -result
  })

  return (
    <div className="Details-parent">
      <div className="Total-Accounts-Parent">
        <div className="EXpire-Within-3Days">Accounts Are Going To Expire Within 3 Days: {stats.expiringCount}</div>
        <div className="Account-Expire">Total Registered Accounts: {users.length}</div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          className="Input"
          placeholder="Search by name or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '240px' }}
        />
        <select className="Input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ maxWidth: '190px' }}>
          <option value="name">Sort by Name</option>
          <option value="joiningdate">Sort by Joining Date</option>
        </select>
        <button type="button" onClick={() => setSortOrder(o => (o === "asc" ? "desc" : "asc"))}>
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>}
      {loading && <p style={{ fontSize: '13px' }}>Loading...</p>}

      <table className="Details-table">
        <thead className="Details-thead">
          <tr className="Details-tr">
            <td>S.No</td><td>Profile</td><td>Name</td><td>Phone No</td>
            <td>Joining Date</td><td>Expired Within</td><td>Expiry Date</td><td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {displayedUsers.length > 0 ? (
            displayedUsers.map((user, index) => (
              <tr className="Details-tr" key={user.id ?? index}>
                <td>{index + 1}</td>
                <td><i className="fa-regular fa-user"></i></td>
                <td>{user.name || 'N/A'}</td>
                <td>{user.phone || 'N/A'}</td>
                <td>{user.joiningdate || 'N/A'}</td>
                <td>{user.expiredwithin ? `${user.expiredwithin} Days` : 'N/A'}</td>
                <td>{user.expired || 'N/A'}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(user)} disabled={deletingId === user.id}>Edit</button>{' '}
                  <button type="button" onClick={() => handleDelete(user.id)} disabled={deletingId === user.id}>
                    {deletingId === user.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            !loading && (
              <tr className="Details-tr">
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No registered users yet</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}

// ================================================================
// PAYMENT HISTORY COMPONENT
// ================================================================
function Paymenthistory() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formData, setFormData] = useState({
    member: '', amount: '', date: '', status: 'Pending', method: '', transactionId: ''
  })

  const loadPayments = async () => {
    setLoading(true)
    setError("")
    try {
      setPayments(await api.getPayments())
    } catch (err) {
      setError(err.message || "Failed to load payments from server. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPayments() }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({ member: '', amount: '', date: '', status: 'Pending', method: '', transactionId: '' })
    setFieldErrors({})
    setEditingId(null)
  }

  const handleEditClick = (payment) => {
    setEditingId(payment.id)
    setFormData({
      member: payment.member || '',
      amount: payment.amount || '',
      date: payment.date || '',
      status: payment.status || 'Pending',
      method: payment.method || '',
      transactionId: payment.transaction_id || ''
    })
    setError("")
    setFieldErrors({})
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  const handleDeletePayment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return
    setDeletingId(id)
    try {
      await api.deletePayment(id)
      alert("Payment deleted successfully")
      if (editingId === id) resetForm()
      await loadPayments()
    } catch (err) {
      alert(err.message || "Failed to delete payment. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const errors = validatePaymentForm(formData)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted fields.")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        member: formData.member,
        amount: formData.amount,
        date: formData.date,
        status: formData.status,
        method: formData.method,
        transaction_id: formData.transactionId,
      }
      if (editingId) {
        await api.updatePayment(editingId, payload)
        alert("Payment updated successfully")
      } else {
        await api.createPayment(payload)
        alert("Payment added successfully")
      }
      resetForm()
      await loadPayments()
    } catch (err) {
      setError(err.message || "Failed to save payment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const total = payments.length
  const completed = payments.filter(p => (p.status || '').toLowerCase() === 'completed').length
  const revenue = payments.reduce((sum, p) => sum + (parseInt((p.amount || '').replace(/[^0-9]/g, ''), 10) || 0), 0)

  return (
    <div className="payment-parent">
      <form className="payment-form" onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div>
          <input name="member" placeholder="Member name" value={formData.member} onChange={handleChange} />
          {fieldErrors.member && <p style={{ color: '#dc2626', fontSize: '11px', margin: 0 }}>{fieldErrors.member}</p>}
        </div>
        <div>
          <input name="amount" placeholder="₹ amount" value={formData.amount} onChange={handleChange} />
          {fieldErrors.amount && <p style={{ color: '#dc2626', fontSize: '11px', margin: 0 }}>{fieldErrors.amount}</p>}
        </div>
        <div>
          <input name="date" type="date" value={formData.date} onChange={handleChange} />
          {fieldErrors.date && <p style={{ color: '#dc2626', fontSize: '11px', margin: 0 }}>{fieldErrors.date}</p>}
        </div>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option>Pending</option>
          <option>Completed</option>
          <option>Failed</option>
        </select>
        <div>
          <input name="method" placeholder="Method" value={formData.method} onChange={handleChange} />
          {fieldErrors.method && <p style={{ color: '#dc2626', fontSize: '11px', margin: 0 }}>{fieldErrors.method}</p>}
        </div>
        <div>
          <input name="transactionId" placeholder="Transaction ID" value={formData.transactionId} onChange={handleChange} />
          {fieldErrors.transactionId && <p style={{ color: '#dc2626', fontSize: '11px', margin: 0 }}>{fieldErrors.transactionId}</p>}
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? (editingId ? "Updating..." : "Adding...") : (editingId ? "Update payment" : "Add payment")}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit} disabled={submitting}>Cancel</button>
        )}
      </form>

      {error && <p style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>}
      {loading && <p style={{ fontSize: '13px' }}>Loading...</p>}

      <div className="payment-stats">
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-credit-card"></i></div>
          <div className="stat-content">
            <div className="stat-label">Total Payments</div>
            <div className="stat-value">{total}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><i className="fa-solid fa-check-circle"></i></div>
          <div className="stat-content">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completed}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue"><i className="fa-solid fa-indian-rupee-sign"></i></div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{revenue}</div>
          </div>
        </div>
      </div>

      <div className="payment-table-container">
        <h2 className="payment-title">Payment History</h2>
        <table className="payment-table">
          <thead className="payment-thead">
            <tr className="payment-tr">
              <td>ID</td><td>Member Name</td><td>Amount</td><td>Date</td>
              <td>Status</td><td>Method</td><td>Transaction ID</td><td>Actions</td>
            </tr>
          </thead>
          <tbody className="payment-tbody">
            {payments.map((p, idx) => (
              <tr className="payment-tr" key={p.id ?? idx}>
                <td>{idx + 1}</td>
                <td>
                  <div className="member-info">
                    <i className="fa-regular fa-user"></i>
                    <span>{p.member}</span>
                  </div>
                </td>
                <td><span className="amount">{p.amount}</span></td>
                <td>{p.date}</td>
                <td><span className={`status-badge status-${(p.status || '').toLowerCase()}`}>{p.status}</span></td>
                <td>{p.method}</td>
                <td className="transaction-id">{p.transaction_id}</td>
                <td>
                  <button type="button" onClick={() => handleEditClick(p)} disabled={deletingId === p.id}>Edit</button>{' '}
                  <button type="button" onClick={() => handleDeletePayment(p.id)} disabled={deletingId === p.id}>
                    {deletingId === p.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ================================================================
// LAYOUT + APP (routing)
// ================================================================
function Layout() {
  return (
    <div className="app-layout">
      <Nav />
      <div className="content-container">
        <Outlet />
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/Details" element={<Details />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/ViewRegisteredUsers" element={<Viewregister />} />
        <Route path="/PaymentHistory" element={<Paymenthistory />} />
      </Route>
    </Routes>
  )
}

