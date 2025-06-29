import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-logo" onClick={() => navigate('/dashboard')}>
            AI Job Finder
          </h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">Welcome, {user.name}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 