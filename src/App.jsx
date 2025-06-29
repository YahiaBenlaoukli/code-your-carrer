import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Navigation from './components/Navigation'
import LandingPage from './pages/LandingPage'
import AuthScreen from './pages/AuthScreen'
import InitialScreen from './pages/InitialScreen'
import Dashboard from './pages/Dashboard'
import LoadingScreen from './components/LoadingScreen'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const { currentUser, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <div className="min-h-screen">
        {currentUser && <Header />}
        <Routes>
          <Route 
            path="/" 
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage />
              )
            } 
          />
          <Route 
            path="/auth" 
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthScreen />
              )
            } 
          />
          <Route 
            path="/upload" 
            element={
              currentUser ? (
                <InitialScreen />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              currentUser ? (
                <Dashboard />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
        </Routes>
        {currentUser && <Navigation />}
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App 