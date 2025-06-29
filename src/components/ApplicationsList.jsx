import React from 'react'
import { Calendar, MapPin, Building } from 'lucide-react'

function ApplicationsList({ applications }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview':
        return 'bg-purple-100 text-purple-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-secondary-100 text-secondary-800'
    }
  }

  return (
    <div className="panel">
      <h2 className="text-xl font-semibold text-secondary-800 mb-6 flex items-center">
        <Calendar size={20} className="mr-2 text-primary-600" />
        Your Applications
      </h2>

      {applications.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-secondary-400 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <p className="text-secondary-600 mb-2">
            No applications yet
          </p>
          <p className="text-secondary-500 text-sm">
            Apply to jobs to see them here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-800 text-lg mb-2">
                    {application.jobTitle}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-3">
                    <div className="flex items-center">
                      <Building size={14} className="mr-1" />
                      {application.company}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {application.location}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-secondary-500">
                    <Calendar size={12} className="mr-1" />
                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="ml-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
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