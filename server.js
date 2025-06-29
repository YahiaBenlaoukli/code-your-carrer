const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

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
    console.log('File received:', file.name, 'Type:', file.mimetype);
    
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
        res.json(analysis);
      } catch (analysisError) {
        console.error('Analysis failed, returning fallback:', analysisError);
        res.json({
          strengths: ["PDF processed successfully"],
          improvements: ["AI analysis failed"],
          suggestions: ["Please try again"],
          matchScore: 50,
          keySkills: [],
          experienceLevel: "unknown",
          recommendedRoles: [],
          error: analysisError.message
        });
      }
    } else {
      console.log('Processing non-PDF file');
      // For DOC/DOCX files, return a placeholder response
      const placeholderText = "Document content extracted successfully. This is a placeholder for DOC/DOCX processing.";
      const analysis = await analyzeCVWithGemini(placeholderText);
      res.json(analysis);
    }
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      error: "Failed to process file. Please try again.",
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

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
});
