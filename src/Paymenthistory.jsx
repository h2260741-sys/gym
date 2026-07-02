import React from 'react'
import './Paymenthistory.css'

function Paymenthistory() {
  const [payments, setPayments] = React.useState([])
  const [formData, setFormData] = React.useState({
    member: '',
    amount: '',
    date: '',
    status: 'Pending',
    method: '',
    transactionId: ''
  })

  React.useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('payments')) || []
    setPayments(stored)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = [...payments, formData]
    setPayments(next)
    localStorage.setItem('payments', JSON.stringify(next))
    
    setFormData({ member: '', amount: '', date: '', status: 'Pending', method: '', transactionId: '' })
  }

  
  const total = payments.length
  const completed = payments.filter(p => p.status.toLowerCase() === 'completed').length
  const revenue = payments.reduce((sum, p) => {
    const num = parseInt(p.amount.replace(/[^0-9]/g, ''), 10) || 0
    return sum + num
  }, 0)

  return (
    <>
      <div className="payment-parent">
        {/* simple form */}
        <form className="payment-form" onSubmit={handleSubmit} style={{marginBottom: '20px'}}>
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
          <button type="submit">Add payment</button>
        </form>

        <div className="payment-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fa-solid fa-credit-card"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Payments</div>
              <div className="stat-value">{total}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{completed}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>
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
                <td>ID</td>
                <td>Member Name</td>
                <td>Amount</td>
                <td>Date</td>
                <td>Status</td>
                <td>Method</td>
                <td>Transaction ID</td>
              </tr>
            </thead>
            <tbody className="payment-tbody">
              {payments.map((p,idx) => (
                <tr className="payment-tr" key={idx}>
                  <td>{idx+1}</td>
                  <td>
                    <div className="member-info">
                      <i className="fa-regular fa-user"></i>
                      <span>{p.member}</span>
                    </div>
                  </td>
                  <td><span className="amount">{p.amount}</span></td>
                  <td>{p.date}</td>
                  <td>
                    <span className={`status-badge status-${p.status.toLowerCase()}`}>{p.status}</span>
                  </td>
                  <td>{p.method}</td>
                  <td className="transaction-id">{p.transactionId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Paymenthistory