import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Briefcase, MapPin, Building, CheckCircle } from 'lucide-react'

function JobRecommendations() {
  const { saveApplication } = useAuth()
  const [appliedJobs, setAppliedJobs] = useState(new Set())

  // Mock job data - in a real app, this would come from an API
  const jobs = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      type: 'Remote',
      description: 'Looking for an experienced developer to join our growing team. Work with React, Node.js, and cloud technologies.',
      salary: '$120k - $150k',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS']
    },
    {
      id: 2,
      title: 'Lead Software Engineer',
      company: 'InnovateLab',
      location: 'New York, NY',
      type: 'On-site',
      description: 'Lead a team of developers building next-generation web applications. Strong JavaScript and Python skills required.',
      salary: '$140k - $180k',
      skills: ['JavaScript', 'Python', 'React', 'Leadership']
    },
    {
      id: 3,
      title: 'Frontend Developer',
      company: 'DesignFirst Agency',
      location: 'Austin, TX',
      type: 'Hybrid',
      description: 'Create beautiful, responsive web interfaces. Experience with React and modern CSS frameworks preferred.',
      salary: '$90k - $120k',
      skills: ['React', 'CSS', 'JavaScript', 'UI/UX']
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'CloudScale Inc',
      location: 'Seattle, WA',
      type: 'Remote',
      description: 'Manage cloud infrastructure and deployment pipelines. AWS experience and automation skills required.',
      salary: '$110k - $140k',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD']
    }
  ]

  const handleApply = async (job) => {
    try {
      await saveApplication(job.id, job.title, job.company, job.location)
      setAppliedJobs(prev => new Set([...prev, job.id]))
      
      // Show success message (you could add a toast notification here)
      console.log(`Successfully applied to ${job.title} at ${job.company}`)
    } catch (error) {
      console.error('Failed to apply:', error)
    }
  }

  return (
    <div className="panel">
      <h2 className="text-xl font-semibold text-secondary-800 mb-6 flex items-center">
        <Briefcase size={20} className="mr-2 text-primary-600" />
        Job Recommendations
      </h2>

      <div className="space-y-4">
        {jobs.map((job) => {
          const isApplied = appliedJobs.has(job.id)
          
          return (
            <div
              key={job.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isApplied
                  ? 'border-green-200 bg-green-50'
                  : 'border-secondary-200 hover:border-primary-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-800 text-lg mb-1">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-2">
                    <div className="flex items-center">
                      <Building size={14} className="mr-1" />
                      {job.company}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {job.location} ({job.type})
                    </div>
                  </div>
                  <p className="text-secondary-700 text-sm mb-3">
                    {job.description}
                  </p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-primary-600 font-medium text-sm">
                    {job.salary}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleApply(job)}
                disabled={isApplied}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isApplied
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {isApplied ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Applied</span>
                  </>
                ) : (
                  <span>Apply Now</span>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default JobRecommendations 