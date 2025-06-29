const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const CVAnalysis = require("./models/CVAnalysis");
require('dotenv').config();

const app = express();

mongoose.connect('mongodb://localhost:27017/ai-job-finder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB at mongodb://localhost:27017/ai-job-finder');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('💡 Make sure MongoDB is running on localhost:27017');
  console.log('💡 You can start MongoDB with: mongod');
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to analyze CV text using Gemini
async function analyzeCVWithGemini(extractedText) {
  try {
    // Read the prompt from file
    const prompt = fs.readFileSync('cvanalysisprompt.txt', 'utf8');
    
    // Create the full prompt with the extracted text
    const fullPrompt = `${prompt}\n\nCV Text to analyze:\n${extractedText}`;
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const analysisText = response.text();
    console.log(analysisText);
    
    // Try to parse the JSON response
    let json = null;
    try {
      // First try to parse directly
      json = JSON.parse(analysisText);
    } catch (parseError) {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        json = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    }
    
    return json;
    
  } catch (error) {
    console.error('Gemini analysis error:', error.message);
    
    // Return a fallback analysis if everything fails
    return {
      strengths: ["Text extracted successfully"],
      improvements: ["Could not analyze with AI - " + error.message],
      suggestions: ["Please try again or check your API key"],
      matchScore: 50,
      keySkills: [],
      experienceLevel: "unknown",
      recommendedRoles: [],
      error: error.message
    };
  }
}

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true,
}));

// API Routes
app.post("/extract-text", async (req, res) => {
  try {
    console.log('Received file upload request');
    
    if (!req.files || !req.files.pdfFile) {
      console.log('No file uploaded');
      return res.status(400).json({ 
        error: "No file uploaded" 
      });
    }

    const file = req.files.pdfFile;
    const userId = req.body.userId || 'anonymous'; // Get userId from request body
    console.log('File received:', file.name, 'Type:', file.mimetype, 'User:', userId);
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.log('Invalid file type:', file.mimetype);
      return res.status(400).json({ 
        error: "Invalid file type. Please upload a PDF, DOC, or DOCX file." 
      });
    }

    // For now, we'll only process PDF files
    if (file.mimetype === 'application/pdf') {
      console.log('Processing PDF file');
      const result = await pdfParse(req.files.pdfFile);
      console.log('PDF processed successfully');
      console.log(result.text);
      try {
        console.log('Analyzing CV with Gemini...');
        const analysis = await analyzeCVWithGemini(result.text);
        
        // Save analysis to database
        const cvAnalysis = new CVAnalysis({
          userId: userId,
          fileName: file.name,
          fileSize: file.size,
          htmlContent: req.body.htmlContent || '', // Save HTML content if provided
          ...analysis
        });
        
        await cvAnalysis.save();
        console.log('Analysis saved to database');
        
        res.json({
          ...analysis,
          id: cvAnalysis._id,
          savedAt: cvAnalysis.createdAt
        });
      } catch (analysisError) {
        console.error('Analysis failed, returning fallback:', analysisError);
        const fallbackAnalysis = {
          strengths: ["PDF processed successfully"],
          improvements: ["AI analysis failed"],
          suggestions: ["Please try again"],
          matchScore: 50,
          keySkills: [],
          experienceLevel: "unknown",
          recommendedRoles: [],
          error: analysisError.message
        };
        
        // Save fallback analysis to database
        const cvAnalysis = new CVAnalysis({
          userId: userId,
          fileName: file.name,
          fileSize: file.size,
          htmlContent: req.body.htmlContent || '', // Save HTML content if provided
          ...fallbackAnalysis
        });
        
        await cvAnalysis.save();
        
        res.json({
          ...fallbackAnalysis,
          id: cvAnalysis._id,
          savedAt: cvAnalysis.createdAt
        });
      }
    } else {
      console.log('Processing non-PDF file');
      // For DOC/DOCX files, return a placeholder response
      const placeholderText = "Document content extracted successfully. This is a placeholder for DOC/DOCX processing.";
      const analysis = await analyzeCVWithGemini(placeholderText);
      
      // Save analysis to database
      const cvAnalysis = new CVAnalysis({
        userId: userId,
        fileName: file.name,
        fileSize: file.size,
        htmlContent: req.body.htmlContent || '', // Save HTML content if provided
        ...analysis
      });
      
      await cvAnalysis.save();
      
      res.json({
        ...analysis,
        id: cvAnalysis._id,
        savedAt: cvAnalysis.createdAt
      });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      error: "Failed to process file. Please try again.",
      details: error.message
    });
  }
});

// Get all CV analyses for a user
app.get("/cv-analyses/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const analyses = await CVAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching CV analyses:', error);
    res.status(500).json({ 
      error: "Failed to fetch CV analyses",
      details: error.message
    });
  }
});

// Get a specific CV analysis by ID
app.get("/cv-analysis/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await CVAnalysis.findById(id).select('-__v');
    
    if (!analysis) {
      return res.status(404).json({ error: "CV analysis not found" });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching CV analysis:', error);
    res.status(500).json({ 
      error: "Failed to fetch CV analysis",
      details: error.message
    });
  }
});

// Delete a CV analysis
app.delete("/cv-analysis/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await CVAnalysis.findByIdAndDelete(id);
    
    if (!analysis) {
      return res.status(404).json({ error: "CV analysis not found" });
    }
    
    res.json({ message: "CV analysis deleted successfully" });
  } catch (error) {
    console.error('Error deleting CV analysis:', error);
    res.status(500).json({ 
      error: "Failed to delete CV analysis",
      details: error.message
    });
  }
});

// Debug endpoint to list all analyses in database
app.get("/debug/all-analyses", async (req, res) => {
  try {
    const allAnalyses = await CVAnalysis.find({}).select('userId fileName createdAt');
    res.json({
      total: allAnalyses.length,
      analyses: allAnalyses
    });
  } catch (error) {
    console.error('Error fetching all analyses:', error);
    res.status(500).json({ 
      error: "Failed to fetch all analyses",
      details: error.message
    });
  }
});

// Save HTML content for an analysis
app.post("/save-analysis-html/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { htmlContent } = req.body;
    
    if (!htmlContent) {
      return res.status(400).json({ error: "HTML content is required" });
    }
    
    const analysis = await CVAnalysis.findByIdAndUpdate(
      id,
      { htmlContent },
      { new: true }
    );
    
    if (!analysis) {
      return res.status(404).json({ error: "CV analysis not found" });
    }
    
    res.json({ message: "HTML content saved successfully", analysis });
  } catch (error) {
    console.error('Error saving HTML content:', error);
    res.status(500).json({ 
      error: "Failed to save HTML content",
      details: error.message
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`\nFrontend should be running on: http://localhost:3001`);
  console.log(`Make sure to run: npm run dev`);
});
