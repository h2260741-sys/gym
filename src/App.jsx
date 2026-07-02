
import React from 'react'   
import Nav from './Nav.jsx'
import { Route, Routes, Outlet } from 'react-router-dom'
import Paymenthistory from './paymenthistory.jsx'
import Details from './Details.jsx'
import Viewregister from './viewregister.jsx'
import Register from './Register.jsx'
import './App.css'
import './basic-style.css'

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

function App () {
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
