import React, { useState, useEffect } from 'react'
import './Viewregister.css'

function Viewregister() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  // Calculate expired and expiring soon counts
  const calculateStats = () => {
    let expiredCount = 0;
    let expiringCount = 0;

    users.forEach((user) => {
      if (user.expiredwithin && parseInt(user.expiredwithin) <= 3) {
        expiringCount++;
      }
    });

    return { expiredCount, expiringCount };
  };

  const stats = calculateStats();

  return (
    <>
      <div className="Details-parent">

        <div className="Total-Accounts-Parent">
          <div className="EXpire-Within-3Days">Accounts Are Going To Expire Within 3 Days: {stats.expiringCount}</div>
          <div className="Account-Expire">Total Registered Accounts: {users.length}</div>
        </div>

        <table className="Details-table">
          <thead className="Details-thead">
            <tr className="Details-tr">
              <td>S.No</td>
              <td>Profile</td>
              <td>Name</td>
              <td>Phone No</td>
              <td>Joining Date</td>
              <td>Expired Within</td>
              <td>Expiry Date</td>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr className="Details-tr" key={index}>
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
              <tr className="Details-tr">
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No registered users yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Viewregister