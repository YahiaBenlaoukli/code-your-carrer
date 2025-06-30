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

// Function to generate LaTeX CV using Gemini
function cleanLatexOutput(content) {
  // Remove Markdown code block indicators (```latex and ```)
  let cleaned = content.replace(/^```latex\s*|\s*```$/g, '');
  
  // Ensure it starts with a document class
  if (!cleaned.includes('\\documentclass')) {
    cleaned = '\\documentclass{article}\n' + cleaned;
  }
  
  // Ensure it has proper document structure
  if (!cleaned.includes('\\begin{document}')) {
    cleaned = cleaned.replace('\\documentclass{article}', '\\documentclass{article}\n\\begin{document}');
  }
  
  if (!cleaned.includes('\\end{document}')) {
    cleaned = cleaned + '\n\\end{document}';
  }
  
  return cleaned;
}

async function generateLaTeXCV(analysisData) {
  try {
    const prompt = fs.readFileSync('latexbuildprompt.txt', 'utf8');
    const jsonData = JSON.stringify(analysisData, null, 2);
    const fullPrompt = `${prompt}\n\n📦 **Input JSON**:\n\n\`\`\`json\n${jsonData}\n\`\`\`\n\n🎯 Output: A complete .tex file containing the professional CV.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const latexContent = response.text();
    
    // Clean the output before returning
    const cleanedLatex = cleanLatexOutput(latexContent);
    
    // Validate the cleaned LaTeX content
    if (!cleanedLatex || typeof cleanedLatex !== 'string') {
      throw new Error('Generated LaTeX content is invalid');
    }
    
    if (cleanedLatex.trim().length === 0) {
      throw new Error('Generated LaTeX content is empty');
    }
    
    // Basic LaTeX structure validation
    if (!cleanedLatex.includes('\\documentclass')) {
      throw new Error('Generated LaTeX content is missing document class');
    }
    
    console.log('LaTeX content generated successfully, length:', cleanedLatex.length);
    return cleanedLatex;
    
  } catch (error) {
    console.error('LaTeX generation error:', error.message);
    throw new Error('Failed to generate LaTeX CV: ' + error.message);
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

// Generate LaTeX CV endpoint
app.post("/generate-latex-cv", async (req, res) => {
  try {
    console.log('Received LaTeX CV generation request');
    
    const { analysisData } = req.body;
    
    if (!analysisData) {
      console.log('No analysis data provided');
      return res.status(400).json({ 
        error: "No analysis data provided" 
      });
    }

    console.log('Generating LaTeX CV with analysis data...');
    const latexContent = await generateLaTeXCV(analysisData);
    
    res.json({
      success: true,
      latexContent: latexContent,
      message: "LaTeX CV generated successfully"
    });
    
  } catch (error) {
    console.error('Error generating LaTeX CV:', error);
    res.status(500).json({ 
      error: "Failed to generate LaTeX CV. Please try again.",
      details: error.message
    });
  }
});

// Download LaTeX file endpoint
app.post("/download-latex", async (req, res) => {
  try {
    console.log('Received LaTeX download request');
    
    const { latexContent } = req.body;
    
    if (!latexContent) {
      console.log('No LaTeX content provided');
      return res.status(400).json({ 
        error: "No LaTeX content provided" 
      });
    }

    // Create a unique filename
    const timestamp = Date.now();
    const latexFilename = `cv_${timestamp}.tex`;
    const latexPath = path.join(__dirname, 'temp', latexFilename);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write LaTeX content to file
    fs.writeFileSync(latexPath, latexContent);
    
    // Send the LaTeX file
    res.download(latexPath, latexFilename, (err) => {
      if (err) {
        console.error('Error sending LaTeX file:', err);
        res.status(500).json({ error: 'Failed to send LaTeX file' });
      } else {
        // Clean up the temporary file after sending
        setTimeout(() => {
          fs.unlink(latexPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting temporary LaTeX file:', unlinkErr);
            } else {
              console.log('Temporary LaTeX file deleted:', latexPath);
            }
          });
        }, 1000);
      }
    });
    
  } catch (error) {
    console.error('Error creating LaTeX file:', error);
    res.status(500).json({ 
      error: "Failed to create LaTeX file. Please try again.",
      details: error.message
    });
  }
});

// Generate CV (LaTeX only) endpoint
app.post("/generate-cv", async (req, res) => {
  try {
    console.log('Received CV generation request (LaTeX only)');
    
    const { analysisData } = req.body;
    
    if (!analysisData) {
      console.log('No analysis data provided');
      return res.status(400).json({ 
        error: "No analysis data provided" 
      });
    }

    console.log('Generating LaTeX CV with analysis data...');
    const latexContent = await generateLaTeXCV(analysisData);
    
    // Create LaTeX file for download
    const timestamp = Date.now();
    const latexFilename = `cv_${timestamp}.tex`;
    const latexPath = path.join(__dirname, 'temp', latexFilename);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write LaTeX content to file
    fs.writeFileSync(latexPath, latexContent, 'utf8');
    
    // Set headers to indicate this is a LaTeX file
    res.setHeader('Content-Type', 'application/x-tex');
    res.setHeader('Content-Disposition', `attachment; filename="${latexFilename}"`);
    
    // Send the LaTeX file
    res.download(latexPath, latexFilename, (err) => {
      if (err) {
        console.error('Error sending LaTeX file:', err);
        res.status(500).json({ 
          error: 'Failed to send LaTeX file',
          details: err.message,
          note: 'LaTeX content was generated successfully but could not be downloaded. You can copy the LaTeX content manually.'
        });
      } else {
        console.log('LaTeX file sent successfully');
        // Clean up the temporary file after sending
        setTimeout(() => {
          fs.unlink(latexPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting temporary LaTeX file:', unlinkErr);
            } else {
              console.log('Temporary LaTeX file deleted:', latexPath);
            }
          });
        }, 1000);
      }
    });
    
  } catch (error) {
    console.error('Error generating CV:', error);
    res.status(500).json({ 
      error: "Failed to generate CV. Please try again.",
      details: error.message
    });
  }
});

// Job search endpoint using Puppeteer
app.post("/search-jobs", async (req, res) => {
  try {
    console.log('Received job search request');
    
    const { analysisData } = req.body;
    
    if (!analysisData) {
      console.log('No analysis data provided');
      return res.status(400).json({ 
        error: "No analysis data provided" 
      });
    }

    // Extract keywords from analysis data
    const keywords = [];
    
    // Use only recommended roles as keywords (primary source)
    if (analysisData.recommendedRoles && Array.isArray(analysisData.recommendedRoles)) {
        keywords.push(...analysisData.recommendedRoles);
    }
    
    // If no recommended roles, fall back to skills
    if (keywords.length === 0 && analysisData.skills && Array.isArray(analysisData.skills)) {
        keywords.push(...analysisData.skills);
    }
    
    // If still no keywords, use experience level
    if (keywords.length === 0 && analysisData.experienceLevel) {
        keywords.push(analysisData.experienceLevel);
    }
    
    // If no keywords found at all, use default ones
    if (keywords.length === 0) {
        keywords.push('developer', 'software engineer', 'programmer');
    }

    console.log('Searching for jobs with keywords:', keywords);

    // Import Puppeteer dynamically to avoid issues if not installed
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch (error) {
      console.error('Puppeteer not available:', error.message);
      return res.status(503).json({ 
        error: "Job search service is currently unavailable. Please ensure Puppeteer is installed.",
        details: error.message,
        solution: "Run 'npm install puppeteer' to enable job search functionality"
      });
    }

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const allJobs = [];

    for (const keyword of keywords.slice(0, 3)) { // Limit to first 3 keywords
      const encoded = encodeURIComponent(keyword);
      const url = `https://emploitic.com/offres-d-emploi?location=c1dfd96eea8cc2b62785275bca38ac261256e278&search=${encoded}`;

      console.log(`Searching for "${keyword}"`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        await page.waitForSelector('[data-testid="jobs-item"]', { timeout: 10000 });

        const jobs = await page.evaluate((searchKeyword) => {
          const jobItems = document.querySelectorAll('[data-testid="jobs-item"]');
          const base = 'https://emploitic.com';
          const results = [];

          jobItems.forEach(item => {
            const title = item.querySelector('h2')?.innerText.trim() || '';
            const company = item.querySelector('[data-testid="jobs-item-company"]')?.innerText.trim() || '';
            const locationDivs = item.querySelectorAll('[data-testid="RoomRoundedIcon"]');
            const location = locationDivs.length ? locationDivs[0].parentElement.textContent.trim() : '';
            const link = base + (item.querySelector('a')?.getAttribute('href') || '');

            if (title && company && location && link) {
              results.push({ 
                title, 
                company, 
                location, 
                link,
                keyword: searchKeyword,
                type: 'Remote', // Default type
                salary: 'Competitive', // Default salary
                skills: [searchKeyword] // Use keyword as skill
              });
            }
          });

          return results;
        }, keyword);

        allJobs.push(...jobs);
        console.log(`Found ${jobs.length} jobs for "${keyword}"`);

      } catch (err) {
        console.error(`Error searching for "${keyword}":`, err.message);
      }

      // Add delay between searches
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await browser.close();

    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => j.title === job.title && j.company === job.company)
    );

    // Limit to first 10 jobs
    const limitedJobs = uniqueJobs.slice(0, 10);

    console.log(`Total unique jobs found: ${uniqueJobs.length}, returning ${limitedJobs.length}`);

    res.json({
      success: true,
      jobs: limitedJobs,
      count: limitedJobs.length,
      keywords: keywords
    });

  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ 
      error: "Failed to search for jobs. Please try again.",
      details: error.message
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    features: {
      latexGeneration: true,
      cvAnalysis: true,
      note: "LaTeX files are generated and can be compiled to PDF using your local LaTeX installation"
    }
  });
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
