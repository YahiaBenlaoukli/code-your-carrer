import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MessageSquare, Briefcase, MapPin, Star, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react'
import CVAnalysis from '../components/CVAnalysis'
import JobRecommendations from '../components/JobRecommendations'
import ApplicationsList from '../components/ApplicationsList'

function Dashboard() {
  const { getUserCVAnalysis, getUserApplications } = useAuth()
  const [cvAnalysis, setCvAnalysis] = useState(null)
  const [applications, setApplications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Load CV analysis from localStorage (from upload process)
    const storedAnalysis = localStorage.getItem('currentCVAnalysis')
    if (storedAnalysis) {
      setCvAnalysis(JSON.parse(storedAnalysis))
      localStorage.removeItem('currentCVAnalysis') // Clean up
    } else {
      // Load from user's saved analysis
      const savedAnalysis = getUserCVAnalysis()
      if (savedAnalysis) {
        setCvAnalysis(savedAnalysis)
      } else {
        // No analysis found, redirect to upload
        navigate('/upload')
        return
      }
    }

    // Load applications
    const userApplications = getUserApplications()
    setApplications(userApplications)
  }, [getUserCVAnalysis, getUserApplications, navigate])

  if (!cvAnalysis) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <p className="text-secondary-600">Loading your analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-800 mb-2">
            Your AI Job Analysis
          </h1>
          <p className="text-secondary-600">
            Based on your uploaded resume
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* CV Analysis Panel */}
          <CVAnalysis analysis={cvAnalysis} />
          
          {/* Job Recommendations Panel */}
          <JobRecommendations />
        </div>

        {/* Applications Section */}
        <ApplicationsList applications={applications} />
      </div>
    </div>
  )
}

export default Dashboard 