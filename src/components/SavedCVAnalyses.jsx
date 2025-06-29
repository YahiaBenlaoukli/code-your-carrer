import React, { useState, useEffect } from 'react';
import './SavedCVAnalyses.css';

const SavedCVAnalyses = ({ user, onSelectAnalysis }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.email) {
      fetchSavedAnalyses();
    }
  }, [user]);

  const fetchSavedAnalyses = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching saved analyses for user:', user.email);
      console.log('🔍 Full user object:', user);
      
      const response = await fetch(`/cv-analyses/${user.email}`);
      console.log('🔍 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved analyses');
      }
      
      const data = await response.json();
      console.log('🔍 Received analyses data:', data);
      console.log('🔍 Number of analyses:', data.length);
      
      setAnalyses(data);
    } catch (error) {
      console.error('❌ Error fetching saved analyses:', error);
      setError('Failed to load saved analyses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAnalyses = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching ALL analyses from database...');
      
      const response = await fetch('/debug/all-analyses');
      console.log('🔍 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch all analyses');
      }
      
      const data = await response.json();
      console.log('🔍 All analyses data:', data);
      
      // Convert to the format expected by the component
      const allAnalyses = data.analyses || [];
      setAnalyses(allAnalyses);
    } catch (error) {
      console.error('❌ Error fetching all analyses:', error);
      setError('Failed to load all analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      const response = await fetch(`/cv-analysis/${analysisId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete analysis');
      }

      // Remove from local state
      setAnalyses(analyses.filter(analysis => analysis._id !== analysisId));
    } catch (error) {
      console.error('Error deleting analysis:', error);
      alert('Failed to delete analysis');
    }
  };

  const handleViewHTML = (analysis) => {
    if (analysis.htmlContent) {
      // Open HTML content in a new window
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CV Analysis - ${analysis.fileName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .analysis-header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .analysis-header h1 { margin: 0; color: #333; }
            .analysis-header p { margin: 5px 0; color: #666; }
          </style>
        </head>
        <body>
          <div class="analysis-header">
            <h1>CV Analysis Report</h1>
            <p><strong>File:</strong> ${analysis.fileName}</p>
            <p><strong>Analyzed:</strong> ${formatDate(analysis.createdAt)}</p>
            <p><strong>Match Score:</strong> ${analysis.matchScore}%</p>
          </div>
          ${analysis.htmlContent}
        </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      alert('No HTML content available for this analysis');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="saved-analyses">
        <div className="loading">Loading saved analyses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-analyses">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="saved-analyses">
      <div className="saved-analyses-header">
        <div>
          <h3>Saved CV Analyses</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
            User: {user.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="refresh-btn"
            onClick={fetchSavedAnalyses}
            disabled={loading}
          >
            Refresh
          </button>
          <button 
            className="refresh-btn"
            onClick={fetchAllAnalyses}
            disabled={loading}
            style={{ background: 'linear-gradient(45deg, #10b981, #059669)' }}
          >
            Show All
          </button>
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="no-analyses">
          <div className="no-analyses-icon">
            <svg width="48" height="48" fill="#6b7280" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <p>No saved CV analyses found</p>
          <p className="subtitle">Upload a CV to get started</p>
        </div>
      ) : (
        <div className="analyses-list">
          {analyses.map((analysis) => (
            <div key={analysis._id} className="analysis-card">
              <div className="analysis-header">
                <div className="analysis-info">
                  <h4 className="analysis-title">{analysis.fileName}</h4>
                  <p className="analysis-date">
                    Analyzed on {formatDate(analysis.createdAt)}
                  </p>
                  <p className="analysis-size">
                    File size: {formatFileSize(analysis.fileSize)}
                  </p>
                </div>
                <div className="analysis-actions">
                  <button
                    className="select-btn"
                    onClick={() => onSelectAnalysis(analysis)}
                  >
                    Select
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteAnalysis(analysis._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="view-html-btn"
                    onClick={() => handleViewHTML(analysis)}
                  >
                    View HTML
                  </button>
                </div>
              </div>
              
              <div className="analysis-preview">
                <div className="preview-item">
                  <span className="preview-label">Match Score:</span>
                  <span className="preview-value score">{analysis.matchScore}%</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Experience Level:</span>
                  <span className="preview-value">{analysis.experienceLevel}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Key Skills:</span>
                  <span className="preview-value">
                    {analysis.keySkills && analysis.keySkills.length > 0 
                      ? analysis.keySkills.slice(0, 3).join(', ') + (analysis.keySkills.length > 3 ? '...' : '')
                      : 'None identified'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCVAnalyses; 