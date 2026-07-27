/* ================================================================
   SINGLE FILE FRONTEND - App.jsx
   Contains: Nav, Details, Register, Viewregister, Paymenthistory,
   routing, and all backend API calls (fetch) - all in one file.

   How to use:
   1. Keep this as App.jsx (replace your existing App.jsx with this)
   2. Keep main.jsx as is (it just imports App.jsx and wraps it in
      <BrowserRouter>)
   3. Keep your existing CSS files in the same folder:
      App.css, basic-style.css, Nav.css, Details.css,
      Register.css, Viewregister.css, Paymenthistory.css
   4. Make sure the backend (app.py) is running on http://localhost:8000
================================================================ */

import React, { useState, useEffect } from 'react'
import { Routes, Route, Outlet, Link, useNavigate } from 'react-router-dom'

import './App.css'
import './basic-style.css'
import './Nav.css'
import './Details.css'
import './Register.css'
import './Viewregister.css'
import './Paymenthistory.css'

// ----------------------------------------------------------------
// API BASE - change this if your backend runs on a different host/port
// ----------------------------------------------------------------
const API_BASE = "http://localhost:8000/api"

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
  getPayments: async () => handleResponse(await fetch(`${API_BASE}/payments`)),
  createPayment: async (payment) => handleResponse(await fetch(`${API_BASE}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment),
  })),
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
              <td>Joing Date</td><td>Expired Within</td><td>Expired</td>
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
  const [formdata, setFormdata] = useState({
    name: "", phone: "", joiningdate: "", expiredwithin: "", expired: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormdata({ ...formdata, [name]: value })
  }

  const handleReset = () => {
    setFormdata({ name: "", phone: "", joiningdate: "", expiredwithin: "", expired: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await api.createUser(formdata)
      handleReset()
      navigate('/ViewRegisteredUsers')
    } catch (err) {
      setError(err.message || "Failed to register user. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => navigate('/Details')

  return (
    <div className="form-parent">
      <div className="Form-Child">
        <h1 className='Register-form'>Register Form</h1>
        {error && <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
        <form className='Form' onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder='enter your name' className='Input' value={formdata.name} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder='Phone Number' className='Input' value={formdata.phone} onChange={handleChange} required />
          <input type="date" name="joiningdate" placeholder='joining date' className='Input' value={formdata.joiningdate} onChange={handleChange} required />
          <input type="number" name="expiredwithin" placeholder='expired within (days)' className='Input' value={formdata.expiredwithin} onChange={handleChange} />
          <input type="date" name="expired" placeholder='expired' className='Input' value={formdata.expired} onChange={handleChange} />
          <div className="brs-parent">
            <button type="button" onClick={handleBack}><i className="fa-solid fa-circle-arrow-left"></i>Back</button>
            <button type="button" onClick={handleReset}>Reset</button>
            <button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Submit"}</button>
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
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
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
    loadUsers()
  }, [])

  const stats = { expiringCount: users.filter(u => u.expiredwithin && parseInt(u.expiredwithin) <= 3).length }

  return (
    <div className="Details-parent">
      <div className="Total-Accounts-Parent">
        <div className="EXpire-Within-3Days">Accounts Are Going To Expire Within 3 Days: {stats.expiringCount}</div>
        <div className="Account-Expire">Total Registered Accounts: {users.length}</div>
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>}
      {loading && <p style={{ fontSize: '13px' }}>Loading...</p>}

      <table className="Details-table">
        <thead className="Details-thead">
          <tr className="Details-tr">
            <td>S.No</td><td>Profile</td><td>Name</td><td>Phone No</td>
            <td>Joining Date</td><td>Expired Within</td><td>Expiry Date</td>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr className="Details-tr" key={user.id ?? index}>
                <td>{index + 1}</td>
                <td><i className="fa-regular fa-user"></i></td>
                <td>{user.name || 'N/A'}</td>
                <td>{user.phone || 'N/A'}</td>
                <td>{user.joiningdate || 'N/A'}</td>
                <td>{user.expiredwithin ? `${user.expiredwithin} Days` : 'N/A'}</td>
                <td>{user.expired || 'N/A'}</td>
              </tr>
            ))
          ) : (
            !loading && (
              <tr className="Details-tr">
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No registered users yet</td>
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const payload = {
        member: formData.member,
        amount: formData.amount,
        date: formData.date,
        status: formData.status,
        method: formData.method,
        transaction_id: formData.transactionId,
      }
      await api.createPayment(payload)
      setFormData({ member: '', amount: '', date: '', status: 'Pending', method: '', transactionId: '' })
      await loadPayments()
    } catch (err) {
      setError(err.message || "Failed to add payment. Please try again.")
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
        <input name="member" placeholder="Member name" value={formData.member} onChange={handleChange} required />
        <input name="amount" placeholder="₹ amount" value={formData.amount} onChange={handleChange} required />
        <input name="date" type="date" value={formData.date} onChange={handleChange} required />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option>Pending</option>
          <option>Completed</option>
          <option>Failed</option>
        </select>
        <input name="method" placeholder="Method" value={formData.method} onChange={handleChange} required />
        <input name="transactionId" placeholder="Transaction ID" value={formData.transactionId} onChange={handleChange} required />
        <button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add payment"}</button>
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
              <td>Status</td><td>Method</td><td>Transaction ID</td>
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

export default App