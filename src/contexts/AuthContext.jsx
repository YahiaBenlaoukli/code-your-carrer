import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState({})
  const [applications, setApplications] = useState({})
  const [cvAnalyses, setCvAnalyses] = useState({})

  useEffect(() => {
    // Load data from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('jobFinderUsers') || '{}')
    const storedApplications = JSON.parse(localStorage.getItem('jobFinderApplications') || '{}')
    const storedCvAnalyses = JSON.parse(localStorage.getItem('jobFinderCVAnalyses') || '{}')
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null')

    setUsers(storedUsers)
    setApplications(storedApplications)
    setCvAnalyses(storedCvAnalyses)
    setCurrentUser(storedUser)
    setIsLoading(false)
  }, [])

  const hashPassword = (password) => {
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString()
  }

  const register = (name, email, password) => {
    if (users[email]) {
      throw new Error('User already exists with this email')
    }

    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashPassword(password),
      createdAt: new Date().toISOString()
    }

    const newUsers = { ...users, [email]: user }
    setUsers(newUsers)
    localStorage.setItem('jobFinderUsers', JSON.stringify(newUsers))
    return user
  }

  const login = (email, password) => {
    const user = users[email]
    if (!user || user.password !== hashPassword(password)) {
      throw new Error('Invalid email or password')
    }

    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
    return user
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  const saveApplication = (jobId, jobTitle, company, location) => {
    if (!currentUser) return

    const userApplications = applications[currentUser.email] || []
    const application = {
      id: Date.now().toString(),
      jobId,
      jobTitle,
      company,
      location,
      appliedAt: new Date().toISOString(),
      status: 'Applied'
    }

    const newApplications = {
      ...applications,
      [currentUser.email]: [...userApplications, application]
    }
    setApplications(newApplications)
    localStorage.setItem('jobFinderApplications', JSON.stringify(newApplications))
    return application
  }

  const getUserApplications = () => {
    if (!currentUser) return []
    return applications[currentUser.email] || []
  }

  const saveCVAnalysis = (analysis) => {
    if (!currentUser) return

    const newCvAnalyses = {
      ...cvAnalyses,
      [currentUser.email]: {
        ...analysis,
        savedAt: new Date().toISOString()
      }
    }
    setCvAnalyses(newCvAnalyses)
    localStorage.setItem('jobFinderCVAnalyses', JSON.stringify(newCvAnalyses))
  }

  const getUserCVAnalysis = () => {
    if (!currentUser) return null
    return cvAnalyses[currentUser.email] || null
  }

  const value = {
    currentUser,
    isLoading,
    register,
    login,
    logout,
    saveApplication,
    getUserApplications,
    saveCVAnalysis,
    getUserCVAnalysis
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 