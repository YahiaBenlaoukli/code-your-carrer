import React, { useState } from 'react'
import './AuthScreen.css'

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSuccess('')
    
    if (!validateForm()) return

    try {
      if (isLogin) {
        // Login logic
        const users = JSON.parse(localStorage.getItem('jobFinderUsers') || '{}')
        const user = users[formData.email]
        
        if (!user || user.password !== hashPassword(formData.password)) {
          setErrors({ general: 'Invalid email or password' })
          return
        }

        onLogin(user)
        setSuccess('Login successful!')
      } else {
        // Register logic
        const users = JSON.parse(localStorage.getItem('jobFinderUsers') || '{}')
        
        if (users[formData.email]) {
          setErrors({ email: 'User already exists with this email' })
          return
        }

        const newUser = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          password: hashPassword(formData.password),
          createdAt: new Date().toISOString()
        }

        users[formData.email] = newUser
        localStorage.setItem('jobFinderUsers', JSON.stringify(users))
        
        onLogin(newUser)
        setSuccess('Account created successfully!')
      }
    } catch (error) {
      setErrors({ general: error.message })
    }
  }

  const hashPassword = (password) => {
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString()
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setErrors({})
    setSuccess('')
  }

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-content">
          <h1 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Sign in to your account' 
              : 'Join AI Job Finder today'
            }
          </p>

          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}
          {success && (
            <div className="success-message">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            )}

            <button type="submit" className="auth-btn">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={switchMode} className="switch-link">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={switchMode} className="switch-link">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthScreen 