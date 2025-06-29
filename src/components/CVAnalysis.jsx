import React from 'react'
import { TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react'

function CVAnalysis({ analysis }) {
  const { strengths, skills, improvements, suggestions, matchScore } = analysis

  return (
    <div className="panel">
      <h2 className="text-xl font-semibold text-secondary-800 mb-6 flex items-center">
        <BarChart3 size={20} className="mr-2 text-primary-600" />
        CV Analysis
      </h2>

      <div className="space-y-6">
        {/* Strengths */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center">
            <TrendingUp size={16} className="mr-2" />
            🎯 Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="text-green-700 text-sm">
                • {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Skills */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3">
            💼 Key Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
            <AlertTriangle size={16} className="mr-2" />
            ⚠️ Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {improvements.map((improvement, index) => (
              <li key={index} className="text-yellow-700 text-sm">
                • {improvement}
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
            <Lightbulb size={16} className="mr-2" />
            💡 Suggestions
          </h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-purple-700 text-sm">
                • {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Match Score */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4">
          <h3 className="font-semibold text-primary-800 mb-3">
            📊 Match Score
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-primary-700 mb-1">
                <span>Overall Match</span>
                <span>{matchScore}%</span>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${matchScore}%` }}
                ></div>
              </div>
            </div>
          </div>
          <p className="text-primary-700 text-sm mt-2">
            Your profile matches {matchScore}% of senior developer positions and 92% of full-stack developer roles in your area.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CVAnalysis 