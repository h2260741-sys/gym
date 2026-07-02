
import { useNavigate } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import './Details.css'


function Details() {
  const navigate = useNavigate()
  const[expiredata,setExpiredata]=useState([]);
  
  const[expirefilterdata,setExpirefilterdata]=useState(false);

  const handleNewRegister = () => {
    navigate('/Register')
  }

  const handleexpire = (expireType) => {
    const currentdata = localStorage.getItem("users");
    if (currentdata === null) {
        return;
    }
    const parseddata = JSON.parse(currentdata);
    let userdata = [];
    
    if (expireType === "expiredwhithin") {
        userdata = parseddata.filter((user) => Number(user.expiredwithin) <= 3);
    }
    if (expireType === "expired") {
        userdata = parseddata.filter((user) => Number(user.expiredwithin) <= 0);
    }
    
    setExpiredata(userdata);
    setExpirefilterdata(true);
  }

  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);

    const storedPayments = JSON.parse(localStorage.getItem("payments")) || [];
    setPayments(storedPayments);
  }, []);

  const handleShowAll = () => {
    setExpirefilterdata(false);
  }

//   localStorage.clear();
  return (
    <>
   
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
    

    <div className="Details-table-wrapper">
      <table className="Details-table">
          <thead className="Details-thead">
              <tr className="Details-tr">
                  <td>S.No</td>
                  <td>Profile</td>
                  <td >Name</td>
                  <td>Phone No</td>
                  <td>Joing Date</td>
                  <td>Expired Within</td>
                  <td>Expired</td>
              </tr>
          </thead>
          <tbody className="Details-tbody">

          {(expirefilterdata ? expiredata : users).map((user, index) => (
              <tr className="Details-tr" key={index}>
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
                <td>ID</td>
                <td>Member</td>
                <td>Amount</td>
                <td>Date</td>
                <td>Status</td>
                <td>Method</td>
                <td>Txn ID</td>
              </tr>
            </thead>
            <tbody className="Details-tbody">
              {payments.map((p, idx) => (
                <tr className="Details-tr" key={idx}>
                  <td>{idx + 1}</td>
                  <td>{p.member}</td>
                  <td>{p.amount}</td>
                  <td>{p.date}</td>
                  <td>{p.status}</td>
                  <td>{p.method}</td>
                  <td>{p.transactionId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
    </div>
        
    </>
    )
}

export default Details