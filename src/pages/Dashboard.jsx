import React, { useState, useEffect } from 'react'
import CVAnalysis from '../components/CVAnalysis'
import JobRecommendations from '../components/JobRecommendations'
import ApplicationsList from '../components/ApplicationsList'
import SavedCVAnalyses from '../components/SavedCVAnalyses'
import './Dashboard.css'

const Dashboard = ({ user, cvAnalysis, onCVAnalysis, setIsLoading }) => {
  const [applications, setApplications] = useState([])
  const [currentAnalysis, setCurrentAnalysis] = useState(cvAnalysis)
  const [activeTab, setActiveTab] = useState('saved') // Changed to 'saved' to show saved analyses by default

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    if (cvAnalysis) {
      setCurrentAnalysis(cvAnalysis)
      setActiveTab('current') // Switch to current tab when new analysis is loaded
    }
  }, [cvAnalysis])

  const loadUserData = () => {
    const storedApplications = JSON.parse(localStorage.getItem('jobFinderApplications') || '{}')
    const userApplications = storedApplications[user.email] || []
    setApplications(userApplications)
  }

  const handleFileUpload = async (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file.')
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append("pdfFile", file)
    formData.append("userId", user.email) // Add userId to the request
    console.log('Uploading file with userId:', user.email)

    try {
      const response = await fetch("/extract-text", {
        method: "post",
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const analysis = await response.json()
      console.log('Analysis received:', analysis)
      
      // Save the analysis
      saveCVAnalysis({
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        ...analysis
      })
      
      setCurrentAnalysis(analysis)
      onCVAnalysis(analysis)
      
      // Save HTML content after analysis is complete
      setTimeout(() => {
        saveAnalysisHTML(analysis.id)
      }, 1000) // Wait 1 second for the analysis to render
      
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const saveCVAnalysis = (analysis) => {
    const cvAnalyses = JSON.parse(localStorage.getItem('jobFinderCVAnalyses') || '{}')
    cvAnalyses[user.email] = {
      ...analysis,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('jobFinderCVAnalyses', JSON.stringify(cvAnalyses))
  }

  const handleSelectSavedAnalysis = (analysis) => {
    setCurrentAnalysis(analysis)
    onCVAnalysis(analysis)
    setActiveTab('current')
  }

  const saveAnalysisHTML = async (analysisId) => {
    try {
      // Wait for the analysis to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get the analysis panel content
      const analysisPanel = document.querySelector('.panel')
      if (analysisPanel) {
        const htmlContent = analysisPanel.outerHTML
        
        // Save HTML content to server
        const response = await fetch(`/save-analysis-html/${analysisId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ htmlContent })
        })
        
        if (response.ok) {
          console.log('HTML content saved successfully')
        } else {
          console.error('Failed to save HTML content')
        }
      }
    } catch (error) {
      console.error('Error saving HTML content:', error)
    }
  }

  const handleApplyToJob = (jobId, jobTitle, company, location) => {
    const newApplication = {
      id: Date.now().toString(),
      jobId,
      jobTitle,
      company,
      location,
      appliedAt: new Date().toISOString(),
      status: 'Applied'
    }

    const storedApplications = JSON.parse(localStorage.getItem('jobFinderApplications') || '{}')
    if (!storedApplications[user.email]) {
      storedApplications[user.email] = []
    }
    storedApplications[user.email].push(newApplication)
    localStorage.setItem('jobFinderApplications', JSON.stringify(storedApplications))

    setApplications(storedApplications[user.email])
    
    setTimeout(() => {
      alert(`Application submitted for ${jobTitle} at ${company}!`)
    }, 500)
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Your AI Job Analysis</h1>
          <p className="dashboard-subtitle">Based on your uploaded resume</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9Z"/>
            </svg>
            Current Analysis
          </button>
          <button 
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>
            </svg>
            Saved Analyses
          </button>
        </div>
        
        {activeTab === 'current' ? (
          <>
            <div className="dashboard-content">
              {/* Left Panel: CV Analysis */}
              <div className="panel">
                <h2 className="panel-title">
                  <div className="panel-icon">
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                      <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9Z"/>
                    </svg>
                  </div>
                  CV Analysis
                </h2>
                
                {currentAnalysis ? (
                  <>
                    <CVAnalysis analysis={currentAnalysis} />
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => saveAnalysisHTML(currentAnalysis.id)}
                        style={{
                          background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Save Analysis as HTML
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="upload-section">
                    <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
                      <div className="upload-icon">
                        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                      </div>
                      <div className="upload-text">Drop your CV here or click to browse</div>
                      <div className="upload-subtext">Supports PDF, DOC, DOCX files</div>
                    </div>
                    <input 
                      type="file" 
                      id="fileInput" 
                      accept=".pdf,.doc,.docx" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files.length > 0) {
                          handleFileUpload(e.target.files[0])
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Right Panel: Job Recommendations - Only show if analysis exists */}
              {currentAnalysis && (
                <div className="panel">
                  <h2 className="panel-title">
                    <div className="panel-icon">
                      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                        <path d="M10,2H14A2,2 0 0,1 16,4V6H20A2,2 0 0,1 22,8V19A2,2 0 0,1 20,21H4C2.89,21 2,20.1 2,19V8C2,6.89 2.89,6 4,6H8V4C8,2.89 8.89,2 10,2M14,6V4H10V6H14Z"/>
                      </svg>
                    </div>
                    Job Recommendations
                  </h2>
                  
                  <JobRecommendations onApply={handleApplyToJob} />
                </div>
              )}
            </div>

            {/* Saved Applications Panel - Only show if analysis exists */}
            {currentAnalysis && (
              <div className="saved-applications">
                <h2 className="panel-title">
                  <div className="panel-icon">
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                      <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>
                    </svg>
                  </div>
                  Your Applications
                </h2>
                <ApplicationsList applications={applications} />
              </div>
            )}
          </>
        ) : (
          <>
            {console.log('Rendering SavedCVAnalyses with user:', user)}
            <SavedCVAnalyses 
              user={user} 
              onSelectAnalysis={handleSelectSavedAnalysis}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard 