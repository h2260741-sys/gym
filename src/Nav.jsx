import React, { useState } from 'react'
import { Link} from 'react-router-dom'

import './Nav.css'

function Nav() {
   
  const [activeNav, setActiveNav] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

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
              onClick={() => { handleNavClick('dashboard') }}>
              <i className='fa-solid fa-gauge'></i>
              <div className='Dashboard-Child'>Dashboard</div>
            </Link>
            <Link to="/ViewRegisteredUsers"
              className={`View-Register-Parent ${activeNav === 'register' ? 'active' : ''}`}
              onClick={() => { handleNavClick('register') }}
            >
              <i className='fa-solid fa-people-group'></i>
              <div className='view-register-child'>View Registered Users</div>
            </Link> 
            <Link to="/PaymentHistory" className={`Payment-History-Parent ${activeNav === 'payment' ? 'active' : ''}`}
              onClick={() => { handleNavClick('payment') }}
            >
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

export default Nav