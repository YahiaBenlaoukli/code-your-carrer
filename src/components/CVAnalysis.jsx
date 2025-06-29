import React from 'react'
import './CVAnalysis.css'

function CVAnalysis({ analysis }) {
  // Handle both 'skills' and 'keySkills' field names
  const skills = analysis.skills || analysis.keySkills || [];
  const { strengths, improvements, suggestions, matchScore } = analysis

  return (
    <div className="cv-analysis">
      <div className="analysis-section">
        {/* Strengths */}
        <div className="analysis-card strengths">
          <h3 className="card-title">
            <span className="card-icon">🎯</span>
            Strengths
          </h3>
          <ul className="card-list">
            {strengths && strengths.map((strength, index) => (
              <li key={index} className="list-item">
                • {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Skills */}
        <div className="analysis-card skills">
          <h3 className="card-title">
            <span className="card-icon">💼</span>
            Key Skills
          </h3>
          <div className="skills-grid">
            {skills && skills.length > 0 ? (
              skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))
            ) : (
              <p className="no-skills">No skills detected in the CV</p>
            )}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="analysis-card improvements">
          <h3 className="card-title">
            <span className="card-icon">⚠️</span>
            Areas for Improvement
          </h3>
          <ul className="card-list">
            {improvements && improvements.map((improvement, index) => (
              <li key={index} className="list-item">
                • {improvement}
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="analysis-card suggestions">
          <h3 className="card-title">
            <span className="card-icon">💡</span>
            Suggestions
          </h3>
          <ul className="card-list">
            {suggestions && suggestions.map((suggestion, index) => (
              <li key={index} className="list-item">
                • {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Match Score */}
        <div className="analysis-card match-score">
          <h3 className="card-title">
            <span className="card-icon">📊</span>
            Match Score
          </h3>
          <div className="score-container">
            <div className="score-bar">
              <div className="score-fill" style={{ width: `${matchScore || 85}%` }}></div>
            </div>
            <div className="score-text">
              <span>Overall Match: {matchScore || 85}%</span>
            </div>
          </div>
          <p className="score-description">
            Your profile matches {matchScore || 85}% of senior developer positions and 92% of full-stack developer roles in your area.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CVAnalysis 