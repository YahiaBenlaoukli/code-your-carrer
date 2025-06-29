const mongoose = require('mongoose');

const cvAnalysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  strengths: [String],
  improvements: [String],
  suggestions: [String],
  matchScore: {
    type: Number,
    default: 0
  },
  keySkills: [String],
  experienceLevel: {
    type: String,
    default: 'unknown'
  },
  recommendedRoles: [String],
  error: String,
  htmlContent: {
    type: String,
    default: ''
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
cvAnalysisSchema.index({ userId: 1, uploadedAt: -1 });

module.exports = mongoose.model('CVAnalysis', cvAnalysisSchema); 