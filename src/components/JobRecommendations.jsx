import React, { useState } from 'react';
import './JobRecommendations.css';

function JobRecommendations({ onApply }) {
  const [appliedJobs, setAppliedJobs] = useState(new Set());

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
  ];

  const handleApply = (job) => {
    try {
      onApply(job.id, job.title, job.company, job.location);
      setAppliedJobs(prev => new Set([...prev, job.id]));
      
      // Show success message
      console.log(`Successfully applied to ${job.title} at ${job.company}`);
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };

  return (
    <div className="job-recommendations">
      <div className="jobs-list">
        {jobs.map((job) => {
          const isApplied = appliedJobs.has(job.id);
          
          return (
            <div
              key={job.id}
              className={`job-card ${isApplied ? 'applied' : ''}`}
            >
              <div className="job-header">
                <div className="job-info">
                  <h3 className="job-title">
                    {job.title}
                  </h3>
                  <div className="job-meta">
                    <div className="job-company">
                      <span className="meta-icon">🏢</span>
                      {job.company}
                    </div>
                    <div className="job-location">
                      <span className="meta-icon">📍</span>
                      {job.location} ({job.type})
                    </div>
                  </div>
                  <p className="job-description">
                    {job.description}
                  </p>
                  
                  {/* Skills */}
                  <div className="job-skills">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="skill-badge"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <p className="job-salary">
                    {job.salary}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleApply(job)}
                disabled={isApplied}
                className={`apply-btn ${isApplied ? 'applied' : ''}`}
              >
                {isApplied ? (
                  <>
                    <span className="btn-icon">✅</span>
                    <span>Applied</span>
                  </>
                ) : (
                  <span>Apply Now</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default JobRecommendations; 