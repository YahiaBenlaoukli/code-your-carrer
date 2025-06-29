import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthScreen from './pages/AuthScreen'
import Dashboard from './pages/Dashboard'
import LoadingScreen from './components/LoadingScreen'
import Header from './components/Header'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cvAnalysis, setCvAnalysis] = useState(null)

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setCvAnalysis(null)
    localStorage.removeItem('currentUser')
  }

  const handleCVAnalysis = (analysis) => {
    setCvAnalysis(analysis)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <div className="App">
        {user && <Header user={user} onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage />
              )
            } 
          />
          <Route 
            path="/auth" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthScreen onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <Dashboard 
                  user={user}
                  cvAnalysis={cvAnalysis}
                  onCVAnalysis={handleCVAnalysis}
                  setIsLoading={setIsLoading}
                />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App 