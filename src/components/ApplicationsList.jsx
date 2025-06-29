import React from 'react'
import './ApplicationsList.css'
import { Calendar, MapPin, Building } from 'lucide-react'

function ApplicationsList({ applications }) {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'status-applied'
      case 'reviewing':
        return 'status-reviewing'
      case 'interview':
        return 'status-interview'
      case 'accepted':
        return 'status-accepted'
      case 'rejected':
        return 'status-rejected'
      default:
        return 'status-default'
    }
  }

  return (
    <div className="applications-list">
      <h2 className="text-xl font-semibold text-secondary-800 mb-6 flex items-center">
        <Calendar size={20} className="mr-2 text-primary-600" />
        Your Applications
      </h2>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p className="empty-title">No applications yet</p>
          <p className="empty-subtitle">Apply to jobs to see them here!</p>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map((application) => (
            <div
              key={application.id}
              className="application-card"
            >
              <div className="application-content">
                <div className="application-info">
                  <h3 className="application-title">
                    {application.jobTitle}
                  </h3>
                  
                  <div className="application-meta">
                    <div className="application-company">
                      <span className="meta-icon">🏢</span>
                      {application.company}
                    </div>
                    <div className="application-location">
                      <span className="meta-icon">📍</span>
                      {application.location}
                    </div>
                  </div>
                  
                  <div className="application-date">
                    <span className="date-icon">📅</span>
                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="application-status">
                  <span className={`status-badge ${getStatusClass(application.status)}`}>
                    {application.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApplicationsList 