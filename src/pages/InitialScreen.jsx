import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import apiService from '../services/api'

function InitialScreen() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { saveCVAnalysis } = useAuth()

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    setError('')
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid PDF, DOC, or DOCX file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError('')

    try {
      console.log('🚀 Starting CV extraction for:', selectedFile.name)
      
      // Extract text from file
      const result = await apiService.extractText(selectedFile)
      
      console.log('✅ CV Extraction Successful!')
      console.log('📄 File Details:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      })
      
      console.log('📊 Extraction Results:', {
        pages: result.pages,
        info: result.info
      })
      
      console.log('📝 Extracted Text Content:')
      console.log('='.repeat(80))
      console.log(result.text)
      console.log('='.repeat(80))
      
      // Log first 500 characters for quick preview
      console.log('👀 Quick Preview (first 500 chars):')
      console.log(result.text.substring(0, 500) + '...')
      
      // Simulate AI analysis based on extracted text
      const analysis = generateAnalysis(result.text)
      
      console.log('🤖 AI Analysis Generated:', analysis)
      
      // Save analysis
      saveCVAnalysis(analysis)
      
      console.log('💾 Analysis saved to user profile')
      console.log('🎯 Navigating to dashboard...')
      
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('❌ CV Extraction Failed:', err)
      setError(err.message || 'Failed to analyze CV. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const generateAnalysis = (text) => {
    // This is a simplified analysis - in a real app, this would use AI/ML
    const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'AWS']
    const strengths = [
      'Strong technical background with 5+ years of experience in software development',
      'Excellent problem-solving skills and proven track record in project management',
      'Proficient in modern web technologies and frameworks'
    ]
    const improvements = [
      'Consider adding more quantifiable achievements and metrics',
      'Include certifications or recent training to show continuous learning'
    ]
    const suggestions = [
      'Add a professional summary at the top',
      'Include links to your portfolio or GitHub',
      'Consider getting AWS or Google Cloud certifications'
    ]

    return {
      strengths,
      skills: skills.slice(0, Math.floor(Math.random() * 4) + 2), // Random subset
      improvements,
      suggestions,
      matchScore: Math.floor(Math.random() * 20) + 75, // 75-95%
      extractedText: text.substring(0, 500) + '...' // First 500 chars
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 pb-20">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Find Your Dream Job with AI
          </h1>
          <p className="text-xl text-secondary-600">
            Upload your resume and let AI do the work
          </p>
        </div>

        <div className="card">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
              isDragOver
                ? 'border-primary-400 bg-primary-50'
                : 'border-secondary-300 hover:border-primary-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-4">
              <Upload size={48} className="mx-auto text-primary-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-secondary-800 mb-2">
              Drop your CV here or click to browse
            </h3>
            
            <p className="text-secondary-600 mb-4">
              Supports PDF, DOC, DOCX files (max 10MB)
            </p>

            {selectedFile && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className="text-green-600" />
                  <span className="text-green-800 font-medium">
                    {selectedFile.name}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <div className="mt-6 text-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-primary flex items-center justify-center space-x-2 mx-auto"
              >
                {isUploading && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                )}
                <span>
                  {isUploading ? 'Analyzing CV...' : 'Analyze CV with AI'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InitialScreen 