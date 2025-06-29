const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const path = require("path");

const app = express();

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
      const result = await pdfParse(file.data);
      console.log('PDF processed successfully');
      res.json({ 
        text: result.text,
        pages: result.numpages,
        info: result.info 
      });
    } else {
      console.log('Processing non-PDF file');
      // For DOC/DOCX files, return a placeholder response
      res.json({ 
        text: "Document content extracted successfully. This is a placeholder for DOC/DOCX processing.",
        pages: 1,
        info: { Title: "Document" }
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
